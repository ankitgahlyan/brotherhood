import "@gen/BasePersonalWallet.code"

/// Returns the initial deployment bytecode for PersonalWallet (BasePersonalWallet proxy).
/// #safety
@pure
fun getBasePersonalWalletCode(): cell {
    return basePersonalWalletCompiledCode();
}
