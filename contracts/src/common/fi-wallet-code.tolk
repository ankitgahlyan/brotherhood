/// Returns the initial deployment bytecode for FiWallet (BaseFiWallet proxy).
/// #safety
@pure
fun getFiWalletCode(): cell asm """
    "te6ccgEBBQEAqQABFP8A9KQT9LzyyAsBAgLHAwIACaxXr4LAAffX8SPkgdqJofSR9JGmE6LaSa5YQAABBSkch6aSY/SRrpnxJfBUpseR9KX0pZ8QAQGS8KJFkZ8HlgmfC0GZmfItCe9gKQAWoAuuSZGfFACBnCeX756gJY4LImMiYcUcLGOuWEAAAQB5JeR/w/EkR44L5cV56AvEQN0kvgvBBAAeIPsE0O0e7VP4klUg8Qiv" base64>B B>boc PUSHREF
"""
