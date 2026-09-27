import "@acton/emulation/network"
import "@acton/emulation/testing"
import "@acton/testing/expect"
import "@acton/types/transaction"

import "@wrappers/DnsCollection.gen"
import "@wrappers/DnsItem.gen"

import "@contracts/common/constants"
import "@contracts/dns/errors"
import "@contracts/dns/messages"
import "@contracts/dns/storage"

import "test-utils"

get fun `test bro: instant mint grants immediate ownership without auction delay`() {
    val (collection, _, user) = deployBroCollectionContract();

    val deployRes = collection.sendAny(
        user.address,
        makeDeployBody("alice"),
        { value: grams("10"), bounce: true },
    );
    expect(deployRes).toHaveSuccessfulTx({ to: collection.address });

    val itemDeployTx = deployRes.findTransaction({ from: collection.address, deploy: true });
    expect(itemDeployTx).toBeNotNull();

    val item = DnsItem.fromAddress(itemDeployTx!.getAccountAddress());
    expect(item.getEditor()).toEqual(user.address);

    val nftData = item.getNftData();
    expect(nftData.isInitialized).toEqual(true);
    expect(nftData.ownerAddress).toEqual(user.address);
}

get fun `test bro: tier fee boundaries and rejects underpayment`() {
    val (collection, _, user) = deployBroCollectionContract();

    // 1 char: 200 TON
    val underpay1 = collection.sendAny(
        user.address,
        makeDeployBody("a"),
        { value: grams("199"), bounce: true },
    );
    expect(underpay1).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok1 = collection.sendAny(
        user.address,
        makeDeployBody("a"),
        { value: grams("200"), bounce: true },
    );
    expect(ok1).toHaveSuccessfulTx({ to: collection.address });

    // 2 chars: 100 TON
    val underpay2 = collection.sendAny(
        user.address,
        makeDeployBody("ab"),
        { value: grams("99"), bounce: true },
    );
    expect(underpay2).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok2 = collection.sendAny(
        user.address,
        makeDeployBody("ab"),
        { value: grams("100"), bounce: true },
    );
    expect(ok2).toHaveSuccessfulTx({ to: collection.address });

    // 3 chars: 50 TON
    val underpay3 = collection.sendAny(
        user.address,
        makeDeployBody("abc"),
        { value: grams("49"), bounce: true },
    );
    expect(underpay3).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok3 = collection.sendAny(
        user.address,
        makeDeployBody("abc"),
        { value: grams("50"), bounce: true },
    );
    expect(ok3).toHaveSuccessfulTx({ to: collection.address });

    // 4 chars: 20 TON
    val underpay4 = collection.sendAny(
        user.address,
        makeDeployBody("abcd"),
        { value: grams("19"), bounce: true },
    );
    expect(underpay4).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok4 = collection.sendAny(
        user.address,
        makeDeployBody("abcd"),
        { value: grams("20"), bounce: true },
    );
    expect(ok4).toHaveSuccessfulTx({ to: collection.address });

    // 5 chars: 10 TON
    val underpay5 = collection.sendAny(
        user.address,
        makeDeployBody("abcde"),
        { value: grams("9"), bounce: true },
    );
    expect(underpay5).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok5 = collection.sendAny(
        user.address,
        makeDeployBody("abcde"),
        { value: grams("10"), bounce: true },
    );
    expect(ok5).toHaveSuccessfulTx({ to: collection.address });

    // 9 chars: 5 TON
    val underpay9 = collection.sendAny(
        user.address,
        makeDeployBody("abcdefghi"),
        { value: grams("4"), bounce: true },
    );
    expect(underpay9).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_BID_BELOW_MIN_PRICE,
    });

    val ok9 = collection.sendAny(
        user.address,
        makeDeployBody("abcdefghi"),
        { value: grams("5"), bounce: true },
    );
    expect(ok9).toHaveSuccessfulTx({ to: collection.address });
}

get fun `test bro: record setting and TEP-81 dnsresolve resolution`() {
    val (collection, _, user) = deployBroCollectionContract();

    val deployRes = collection.sendAny(
        user.address,
        makeDeployBody("vault"),
        { value: grams("10"), bounce: true },
    );
    val itemDeployTx = deployRes.findTransaction({ from: collection.address, deploy: true });
    val item = DnsItem.fromAddress(itemDeployTx!.getAccountAddress());

    // Set wallet record
    val targetWallet = newActor("bro_target_wallet").address;
    val recordPayload = beginCell().storeRef(makeWalletRecord(targetWallet)).endCell();
    val setRecordRes = item.sendChangeDnsRecord(
        user.address,
        1,
        DNS_WALLET_CATEGORY,
        recordPayload.beginParse(),
        { value: grams("0.1"), bounce: true },
    );
    expect(setRecordRes).toHaveSuccessfulTx({ to: item.address });

    // Resolve via collection
    val resolved = collection.dnsresolve(makeLabelDomainSlice("vault"), DNS_WALLET_CATEGORY);
    expect(resolved.resolvedRecord).toBeNotNull();
    val nextResolver = parseNextResolverCell(resolved.resolvedRecord!);
    expect(nextResolver).toEqual(item.address);

    // Resolve directly on item
    val itemResolved = item.dnsresolve(makeDotSlice(), DNS_WALLET_CATEGORY);
    expect(itemResolved.resolvedRecord).toBeNotNull();
    expect(itemResolved.resolvedRecord!.hash()).toEqual(makeWalletRecord(targetWallet).hash());
}

get fun `test bro: annual renewal via FillUp and multi-year cap`() {
    val (collection, _, user) = deployBroCollectionContract();

    val deployRes = collection.sendAny(
        user.address,
        makeDeployBody("alpha"),
        { value: grams("10"), bounce: true },
    );
    val itemDeployTx = deployRes.findTransaction({ from: collection.address, deploy: true });
    val item = DnsItem.fromAddress(itemDeployTx!.getAccountAddress());

    val initialExpiry = item.getLastFillUpTime();

    // 5-letter domain renewal fee is 1 TON (10% of 10 TON).
    // Send 2 TON with FillUp message -> should add 2 years
    val fillUp2Yr = item.sendFillUp(
        user.address,
        1,
        { value: grams("2"), bounce: true },
    );
    expect(fillUp2Yr).toHaveSuccessfulTx({ to: item.address });

    val after2Yr = item.getLastFillUpTime();
    expect(after2Yr).toEqual(initialExpiry + 2 * ONE_YEAR);

    // Send 10 TON with FillUp -> should cap at 5 years from now
    val fillUpCapped = item.sendFillUp(
        user.address,
        2,
        { value: grams("10"), bounce: true },
    );
    expect(fillUpCapped).toHaveSuccessfulTx({ to: item.address });

    val afterCap = item.getLastFillUpTime();
    expect(afterCap).toEqual(testing.getNow() + 5 * ONE_YEAR);

    // Non-owner cannot call FillUp
    val outsider = newActor("bro_outsider");
    val outsiderFillUp = item.sendFillUp(
        outsider.address,
        3,
        { value: grams("1"), bounce: true },
    );
    expect(outsiderFillUp).toHaveFailedTx({
        to: item.address,
        exitCode: ERROR_ONLY_OWNER_CAN_FILL_UP_AFTER_AUCTION,
    });
}

get fun `test bro: 30-day reservation window restricts public registration`() {
    val deployTime = testing.getNow();
    val (collection, treasury, publicUser) = deployBroCollectionContract(deployTime);

    // 1. During reservation window: public user is rejected
    val publicAttempt = collection.sendAny(
        publicUser.address,
        makeDeployBody("brother"),
        { value: grams("10"), bounce: true },
    );
    expect(publicAttempt).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_RESERVATION_PERIOD_ACTIVE,
    });

    // 2. Treasury can mint directly during reservation window
    val treasuryMint = collection.sendAny(
        treasury.address,
        makeDeployBody("brother"),
        { value: grams("10"), bounce: true },
    );
    expect(treasuryMint).toHaveSuccessfulTx({ to: collection.address });

    // 3. Treasury can mint on behalf of a verified user via MintDomainFor
    val verifiedUser = newActor("verified_brother");
    val mintForMsg = createMessage({
        dest: collection.address,
        value: grams("10"),
        bounce: true,
        body: MintDomainFor {
            queryId: 101,
            targetOwner: verifiedUser.address,
            payload: makeDeployBody("genesis").beginParse().skipBits(32),
        },
    });
    val mintForRes = net.send(treasury.address, mintForMsg);
    expect(mintForRes).toHaveSuccessfulTx({ to: collection.address });

    val genesisItemTx = mintForRes.findTransaction({ from: collection.address, deploy: true });
    expect(genesisItemTx).toBeNotNull();
    val genesisItem = DnsItem.fromAddress(genesisItemTx!.getAccountAddress());
    expect(genesisItem.getEditor()).toEqual(verifiedUser.address);

    // 4. Fast forward past 30 days (RESERVATION_PERIOD + 1)
    testing.setNow(deployTime + RESERVATION_PERIOD + 1);

    // Public registration opens for all users
    val publicAfter30Days = collection.sendAny(
        publicUser.address,
        makeDeployBody("publicname"),
        { value: grams("5"), bounce: true },
    );
    expect(publicAfter30Days).toHaveSuccessfulTx({ to: collection.address });
}

get fun `test bro: treasury fee withdrawal and TEP-66 royalty params`() {
    val (collection, treasury, user) = deployBroCollectionContract();

    // User registers 2-char domain for 100 TON
    collection.sendAny(
        user.address,
        makeDeployBody("fi"),
        { value: grams("100"), bounce: true },
    );

    val collectionBalance = testing.getAccountBalance(collection.address);
    expect(collectionBalance).toBeGreater(grams("90"));

    // Unauthorized non-treasury attempts withdrawal -> rejected
    val attacker = newActor("attacker");
    val unauthWithdraw = createMessage({
        dest: collection.address,
        value: grams("0.1"),
        bounce: true,
        body: WithdrawFees {
            queryId: 999,
            amount: grams("50"),
            recipient: attacker.address,
        },
    });
    val failRes = net.send(attacker.address, unauthWithdraw);
    expect(failRes).toHaveFailedTx({
        to: collection.address,
        exitCode: ERROR_NOT_AUTHORIZED_TREASURY,
    });

    // Treasury withdraws 50 TON -> succeeds
    val treasuryBalanceBefore = testing.getAccountBalance(treasury.address);
    val authorizedWithdraw = createMessage({
        dest: collection.address,
        value: grams("0.1"),
        bounce: true,
        body: WithdrawFees {
            queryId: 1000,
            amount: grams("50"),
            recipient: treasury.address,
        },
    });
    val okRes = net.send(treasury.address, authorizedWithdraw);
    expect(okRes).toHaveSuccessfulTx({ to: collection.address });

    val treasuryBalanceAfter = testing.getAccountBalance(treasury.address);
    expect(treasuryBalanceAfter).toBeGreater(treasuryBalanceBefore + grams("49"));

    // TEP-66 royalty getter check
    val (factor, base, royaltyAddr) = collection.getRoyaltyParams();
    expect(factor).toEqual(5);
    expect(base).toEqual(100);
    expect(royaltyAddr).toEqual(treasury.address);
}
