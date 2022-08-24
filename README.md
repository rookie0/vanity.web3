# vanity.web3

Vanity address generator for web3 in command line.

Supports EVM-Chains(Ethereum, Binance Smart Chain, Polygon, Avalanche etc, and it's contract address), Solana and Aptos.

Examples:

- EVM: `0xbbBBF4d7FDF3E6993218FC8Cbd5975E34BB47777`
- Solana: `SoLQCis48RxKMYKL26gBJDyofzVUweQd66S3xD8t4MS`
- Contract Address: [`0x000007b812f197453E29819fb0B4EC543119e33E`](https://ropsten.etherscan.io/tx/0xd36e988000f962a0320feef17cd2ce7d6ff49d42f44e495edd616cac88ab10ef) created by private key `84c8745d552640833096ff7b7982f2cf9862b48610e2a1bb25fe53250f1f8b71`

## Installation

- NPM: `npm install -g vanity.web3`
- Yarn: `yarn global add vanity.web3`

## Usage

```shell
Vanity address generator for web3

VERSION
  vanity.web3/0.2.3 darwin-x64 node-v16.14.2

USAGE
  $ vanity [COMMAND]

COMMANDS
  address       Generate vanity address
  autocomplete  display autocomplete installation instructions
  help          Display help for vanity.
```

Just run `vanity address` to generate a vanity address, and you can get notified when the address is available.

```shell
Generate vanity address

USAGE
  $ vanity address [PREFIX] [SUFFIX] [-c evm|solana|aptos] [-s] [-w <value>] [-n <value>] [-o <value>] [-C]

ARGUMENTS
  PREFIX  The prefix to use for the vanity address, supports multiple prefixes separated by commas
  SUFFIX  The suffix to use for the vanity address, supports multiple suffixes separated by commas

FLAGS
  -C, --contract         Whether the vanity address is for a contract address, now only supports evm
  -c, --chain=<option>   [default: evm] The chain type to use for address generation
                         <options: evm|solana|aptos>
  -n, --num=<value>      [default: 1] The number of addresses to generate
  -o, --output=<value>   The file to output the addresses to
  -s, --caseSensitive    Whether the vanity address is case sensitive
  -w, --workers=<value>  The number of workers to use for address generation, defaults to the half of the number of CPUs

DESCRIPTION
  Generate vanity address

EXAMPLES
  $ vanity address 012,111 abc,def -s -w 2

  $ vanity address 000 -C

  $ vanity address so,far so,good -c solana -n 2

  $ vanity address 0000 1111 -c aptos -w 1 -n 2 -o output.txt
```

## Donate

| ETH: `0xbbBBF4d7FDF3E6993218FC8Cbd5975E34BB47777` | SOL: `SoLQCis48RxKMYKL26gBJDyofzVUweQd66S3xD8t4MS` |
| :-------------------: | :-------------------: |
| <img src="https://user-images.githubusercontent.com/5813232/184662542-23314cbb-e949-4ae9-b6b2-26af134c68ee.png" alt="0xbbBBF4d7FDF3E6993218FC8Cbd5975E34BB47777" width="270"/> | <img src="https://user-images.githubusercontent.com/5813232/184808707-00f59179-fd85-4a60-a65e-a923769d6f7f.png" alt="SoLQCis48RxKMYKL26gBJDyofzVUweQd66S3xD8t4MS" width="270"/> |

## License

[MIT](./LICENSE)
