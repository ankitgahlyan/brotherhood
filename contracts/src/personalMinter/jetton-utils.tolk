import "@contracts/common/sharding"

import "storage"

fun calcDeployPriWallet(
    owner: address,
    deployer: address,
    minterAddress: address,
    jettonWalletCode: cell,
): AutoDeployAddress {
    val emptyPriWalletStore: PriWalletStore = {
        owner,
        deployer,
        minterAddress,
    };

    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code: jettonWalletCode, data: emptyPriWalletStore.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: owner },
    };
}

// used in wallet only
fun autoAddrPriWallet(owner: address): AutoDeployAddress {
    // wallet calls this when deploy and checking on incoming
    val st = lazy PriWalletStore.load();
    return calcDeployPriWallet(
        owner,
        st.deployer,
        st.minterAddress,
        contract.getCode(),
    );
}
