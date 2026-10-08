/// Returns the initial deployment bytecode for PersonalWallet (BasePersonalWallet proxy).
/// #safety
@pure
fun getBasePersonalWalletCode(): cell asm """
    "te6ccgEBAwEAtAABFP8A9KQT9LzyyAsBAU7TIdDTAwFxsPJx+kgw7UTQ+kgx+kj6SNMJMdEj1ywgvGoozOMC8j8CAPbTPzH6APpI+lAx+gAx0wkx0gD0BVNkxwWSMjSOPPgqU1PI+lIY+lIX+lLPiACAyXhRd8jPg8sEz4WgzMz5FoT3sBOAC1AH1yTIz4oAQM4Vy/fPUCXHBfLgSuIBghA7msoAulADsQPHBRKxIW6zsPLi/iD7BNDtHu1T8AA=" base64>B B>boc PUSHREF
"""
