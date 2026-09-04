import "@contracts/common/sharding"

import "storage"

fun calcDeployPriWallet(
    owner: address,
    deployer: address,
    minterAddress: address,
    jettonWalletCode: cell,
): AutoDeployAddress {
    val emptyPersonalWalletStore: PersonalWalletStore = {
        owner,
        deployer,
        minterAddress,
    };

    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code: jettonWalletCode, data: emptyPersonalWalletStore.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: owner },
    };
}

// used in wallet only
fun autoAddrPriWallet(owner: address): AutoDeployAddress {
    // wallet calls this when deploy and checking on incoming
    val st = lazy PersonalWalletStore.load();
    return calcDeployPriWallet(
        owner,
        st.deployer,
        st.minterAddress,
        contract.getCode(),
    );
}
