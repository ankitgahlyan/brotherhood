import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"

import "@wrappers/FossFiWallet.gen"

import "@contracts/common/messages"
import "@contracts/fossFi/consts"

import "test-utils"

get fun `test lifetime decay: monthly decay reduces balance over elapsed time`() {
    val (wallet, _owner, _minter, outsider) = setupDirectWallet(ton("1000"));

    // Advance time by 30 days (1 month)
    testing.setNow(1_800_000_000 + DECAY_MONTH_SECONDS + 10);

    val triggerTx = wallet.sendTriggerDecay(
        outsider.address,
        outsider.address,
        { value: ton("0.1") },
    );

    expect(triggerTx).toHaveSuccessfulTx<TriggerDecay>({
        from: outsider.address,
        to: wallet.address,
    });
}
