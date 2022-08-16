import { Command, Flags } from '@oclif/core';
import { privateToAddress, toChecksumAddress } from '@ethereumjs/util';
import { randomBytes } from 'crypto';
import nacl = require('tweetnacl');

const os = require('os');
const cluster = require('cluster');
const notifier = require('node-notifier');

const HEX_CHARS = '0123456789ABCDEFabcdef';
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = require('base-x')(BASE58_ALPHABET);

export default class Address extends Command {
    static description = 'Generate vanity address';

    static examples = ['$ vanity address 012,111 abc,def -s -w 2', '$ vanity address so,far so,good -c solana -n 2'];

    static args = [
        {
            name: 'prefix',
            description: 'The prefix to use for the vanity address, supports multiple prefixes separated by commas',
            required: false,
            default: '',
        },
        {
            name: 'suffix',
            description: 'The suffix to use for the vanity address, supports multiple suffixes separated by commas',
            required: false,
            default: '',
        },
    ];

    static flags = {
        chain: Flags.string({
            char: 'c',
            description: 'The chain type to use for address generation',
            required: false,
            options: ['evm', 'solana'],
            default: 'evm',
        }),
        caseSensitive: Flags.boolean({
            char: 's',
            description: 'Whether the vanity address is case sensitive',
            required: false,
            default: false,
        }),
        workers: Flags.integer({
            char: 'w',
            description: 'The number of workers to use for address generation, defaults to the half of the number of CPUs',
            required: false,
        }),
        num: Flags.integer({
            char: 'n',
            description: 'The number of addresses to generate',
            required: false,
            default: 1,
        }),
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Address);
        const prefixes: string[] = (flags.caseSensitive ? args.prefix : args.prefix.toLowerCase()).split(',').filter((i: any) => i);
        const suffixes: string[] = (flags.caseSensitive ? args.suffix : args.suffix.toLowerCase()).split(',').filter((i: any) => i);
        const workers = Math.max(1, flags.workers || Math.floor(os.cpus().length / 2));
        const num = Math.max(1, flags.num);

        if (prefixes.some((p) => p.length > 10) || suffixes.some((s) => s.length > 10)) {
            this.error('Prefix and suffix must be less than 10 characters');
            return;
        }

        let generator;
        switch (flags.chain) {
            case 'evm':
                if (
                    !prefixes.every((p) => stringIncludes(HEX_CHARS, p, flags.caseSensitive)) ||
                    !suffixes.every((s) => stringIncludes(HEX_CHARS, s, flags.caseSensitive))
                ) {
                    this.error(`Prefix and suffix must be hex strings(${HEX_CHARS}) for evm`);
                    return;
                }

                generator = generateEvmAddress;

                break;
            case 'solana':
            default:
                if (
                    !prefixes.every((p) => stringIncludes(BASE58_ALPHABET, p, flags.caseSensitive)) ||
                    !suffixes.every((s) => stringIncludes(BASE58_ALPHABET, s, flags.caseSensitive))
                ) {
                    this.error(`Prefix and suffix must be base58 strings(${BASE58_ALPHABET}) for solana`);
                    return;
                }

                generator = generateSolanaAddress;

                break;
        }

        if (cluster.isMaster || cluster.isPrimary) {
            this.log(`Generating ${flags.chain} vanity address...`);
            let count = 0;
            for (let i = 0; i < workers; i++) {
                const child = cluster.fork();
                child.on('message', (message: any) => {
                    if (message.generated) {
                        count++;
                        if (count >= num) {
                            for (const id in cluster.workers) {
                                cluster.workers[id]?.process.kill();
                            }
                        }
                    }
                });
            }
        } else {
            const { address, privateKey } = generator(prefixes, suffixes, flags.caseSensitive);

            notifier.notify({
                title: 'Vanity Address Generated',
                message: address,
            });

            this.log();
            this.log('Address: ', address);
            this.log('Private: ', privateKey);

            process.send && process.send({ generated: true });
        }
    }
}

function stringIncludes(string: string, substring: string, caseSensitive = false) {
    if (substring.length < 1) {
        return true;
    }

    if (!caseSensitive) {
        string = string.toLowerCase();
    }

    return substring.split('').every((char) => string.includes(char));
}

function generateEvmAddress(prefixes: string[], suffixes: string[], caseSensitive = false) {
    let address = '';
    let privateKey;
    do {
        privateKey = randomBytes(32);
        address = privateToAddress(privateKey).toString('hex');
        if (caseSensitive) {
            address = toChecksumAddress('0x' + address).substring(2);
        }
    } while (
        (prefixes.length > 0 && !prefixes.some((p) => address.startsWith(p))) ||
        (suffixes.length > 0 && !suffixes.some((s) => address.endsWith(s)))
    );

    address = toChecksumAddress('0x' + address);
    privateKey = privateKey.toString('hex');

    return { address, privateKey };
}

function generateSolanaAddress(prefixes: string[], suffixes: string[], caseSensitive = false) {
    let address = '';
    let keypair, privateKey;
    do {
        keypair = nacl.sign.keyPair();
        address = bs58.encode(keypair.publicKey);
        if (!caseSensitive) {
            address = address.toLowerCase();
        }
    } while (
        (prefixes.length > 0 && !prefixes.some((p) => address.startsWith(p))) ||
        (suffixes.length > 0 && !suffixes.some((s) => address.endsWith(s)))
    );

    address = bs58.encode(keypair.publicKey);
    privateKey = Buffer.from(keypair.secretKey).toString('hex');

    return { address, privateKey };
}