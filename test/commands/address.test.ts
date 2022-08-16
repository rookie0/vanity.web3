import { expect, test } from '@oclif/test';

describe('address', () => {
    test.stdout()
        .command(['address', '11', '-w', '1'])
        .it('evm', async (ctx) => {
            expect(ctx.stdout).to.contains('Generating evm vanity address...');

            // todo
        });
});
