/// Returns the initial deployment bytecode for PersonalWallet (BasePersonalWallet proxy).
/// #safety
@pure
fun getBasePersonalWalletCode(): cell asm """
    "te6ccgEBAwEArwABFP8A9KQT9LzyyAsBAU7TIdDTAwFxsPJx+kgw7UTQ+kgx+kj6SNMJMdEj1ywgvGoozOMC8j8CAOzTPzH6ANMJMdIA+kj6UDH6ADH0BVNkxwWWEDYQJWxBjjr4KiLI+lIX+lIV+lLPiACAyXhRZsjPg8sEz4WgzMz5FoT3sIALUAbXJMjPigBAzhTL989QFMcF8uBK4gKCEDuaygC6sSFus7Dy4v4g+wTQ7R7tU/AA" base64>B B>boc PUSHREF
"""
