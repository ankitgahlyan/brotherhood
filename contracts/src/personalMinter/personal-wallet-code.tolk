/// Returns the initial deployment bytecode for PersonalWallet (BasePersonalWallet proxy).
/// #safety
@pure
fun getBasePersonalWalletCode(): cell asm """
    "te6ccgEBAwEAsQABFP8A9KQT9LzyyAsBAU7TIdDTAwFxsPJx+kgw7UTQ+kgx+kj6SNMJMdEj1ywgvGoozOMC8j8CAPDTPzH6APpI+lAx+gAx0wkx0gD0BVNkxwWVEDY1M1uOPPgqI8j6Uhf6UhX6Us+IAIDJeFFmyM+DywTPhaDMzPkWhPewEoALUAbXJMjPigBAzhTL989QFMcF8uBKAeICghA7msoAulixIW6zsPLi/iD7BNDtHu1T8AA=" base64>B B>boc PUSHREF
"""
