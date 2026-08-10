import "@contracts/common/messages"

struct NomInAddrs {
    nominee: address? = null
    invitor: address? = null
    invitor0: address? = null
}

struct TrustedAddrs {
    // todo: map field to store variable trusted addrs by root
    minterAddr: address                   // todo: use trusted jettonWallets pattern like bidAsk for cross contract centralised calls instead of stateInit storing & for use of provide_wallet_addr onchain api to query jettonWallet addr from owner 
    personalJettonMinter: address? = null
    personalJettonWallet: address? = null // separately deployed & manually added by owner
    authorisedAccs: map<address, address> // each acc can delegate its power of attorney
}

struct Addresses {
    owner: address // todo: store pubKey+acceptExternalMsg for direct msg to receiver(socialRecovery?)
    treasury: address
    // baseFiWalletCode: cell
    nomInAddrs: Cell<NomInAddrs>
    trustedJettonAddrs: Cell<TrustedAddrs>
    // others: Cell<FiWalletCodes>
}

struct FiCodes {
    totalAccounts: uint33 = 0
    lotteryCode: cell
    latestFiWalletCode: cell
    currentRequest: Cell<CurrentRequest>? = null
    locationAddrs: map<uint8, address>? = null
}

struct SocialMaps {
    votedFor: map<address, uint4>   // todo: what struct to use
    followings: map<
        address,
        coins,
    >                               // directional social link; value = FI minted for the link, burnt on unfollow
    // followers: map<address, coins> // added on closure (#24) so a closing Account can notify its followers
}

struct Maps {
    // friends: map<address, coins> // todo: store jettonAddrs instead of userAddrs for bounce handling or pass extra receiver field in outgoing msg & can it help in socialRecovery too?
    // followers: map<address, coins> // todo delete redundant state just keep following and one side friend then bounce on other side if not exists? NO coz how to accClose then!
    // followings: map<address, coins>
    invited: map<address, coins>

    allowances: map<address, coins> // todo need in personal tokens too?
    // debts: map<address, coins>
    // closeFriends: map<address, bool> // for social recovery of account
    social: Cell<SocialMaps>

    reportInfo: Cell<ReportInfo>
}

struct ReportInfo {
    reports: map<address, bool>
    tosBreach: bool = false
    reporterCount: uint10 = 0 // todo: should be less than 250? msg sending
    disputerCount: uint10 = 0
    reportResolutionTime: uint32 = 0
}

struct TimeStamps {
    accountInit: uint32 = 0
    lastInvite: uint32 = 0
    lastClaim: uint32 = 0
    lastDecay: uint32 = 0
}

struct ProfileInfo {
    username: string = ""
    city: string = ""
}

struct FiWalletStore {
    // todo: nft like store migration after activate/upgrade/ID acc also code upgrade & reverese/killSwitch for normal jettons coz of  
    jettonBalance: coins = 0
    goldCoins: uint32 = 1      // todo: implement: store of value, transferrable
    txnCount: uint8 = 0        // for fixed fees burns to counter minting
    status: uint2 = 0          // for granular control
    isAuthorityAccount: bool = false
    creditNeed: coins = 0
    accumulatedFees: coins = 0 // todo: use fixed no of txnCount instead
    debt: coins = 0            // or directly set balance -ve (ton supports this?)
    debts: bool = false        // todo use this pattern of external informer about state before expensive loading cells
    votes: uint4 = 10          // granular voting power
    receivedVotes: uint20 = 0  // 1,048,576 for upgrading account to authority after threshold(1 million) is passed
    connections: uint8 = 0     // 250 max msgSending constraints
    active: bool = false
    mintable: bool = true
    version: uint10 = 0
    storeVersion: uint10 = 0

    profile: Cell<ProfileInfo>
    timestamps: Cell<TimeStamps>
    addresses: Cell<Addresses>
    maps: Cell<Maps>
}

struct FiStore {
    totalSupply: coins = 0
    walletVersion: uint10 = 0
    adminAddress: address
    daoAddress: address? = null
    adminHandoff: Cell<AdminHandoff>? = null
    metadata: cell
    others: Cell<FiCodes>
}

fun FiStore.load(): FiStore {
    return FiStore.fromCell(contract.getData());
}

fun FiStore.save(self): void {
    contract.setData(self.toCell());
}

fun FiWalletStore.load(): FiWalletStore {
    return FiWalletStore.fromCell(contract.getData());
}

fun FiWalletStore.save(self): void {
    contract.setData(self.toCell());
}
