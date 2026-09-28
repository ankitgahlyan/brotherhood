/// Returns the initial deployment bytecode for PersonalWallet (BasePersonalWallet proxy).
/// #safety
@pure
fun getBasePersonalWalletCode(): cell asm """
    "te6ccgEBAwEAqQABFP8A9KQT9LzyyAsBAU7TIdDTAwFxsPJx+kgw7UTQ+kgx+kj6SNMJMdEj1ywgvGoozOMC8j8CAODTPzH6ANMKMfpI+lAx+gAx9AVTU8cFlDUTXwOOOvgqIsj6Uhb6UhT6Us+IAIDJeFFVyM+DywTPhaDMzPkWhPewgAtQBdckyM+KAEDOE8v3z1ATxwXy4ErighA7msoAuiFus7Dy4v4g+wTQ7R7tU/AA" base64>B B>boc PUSHREF
"""
