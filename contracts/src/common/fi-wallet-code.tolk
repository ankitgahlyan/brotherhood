import "@gen/BaseFiWallet.code"

/// Returns the initial deployment bytecode for FiWallet (BaseFiWallet proxy).
/// #safety
@pure
fun getFiWalletCode(): cell {
    return baseFiWalletCompiledCode();
}
