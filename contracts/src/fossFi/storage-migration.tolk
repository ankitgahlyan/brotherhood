import "@contracts/common/errors"
import "@contracts/common/messages"

import "consts"
import "storage"

type AllowedBaseUpgradeMessage =
    | TopUpTons
    | InternalInvite

fun migrateFromInit(
    initStore: BaseFiWalletStore,
    isAuthority: bool = false,
    isPrivileged: bool = false,
    invitor: address? = null,
    invitor0: address? = null,
    username: string = "",
    h3Cell: string = "",
    country: uint16 = 0,
    nominee: address? = null,
): FiWalletStore {
    assert (initStore.version == 0) throw Errors.VersionMismatch;

    return {
        jettonBalance: grams("1"),
        goldCoins: 1,
        txnCount: 0,
        status: 0,
        isAuthorityAccount: isAuthority,
        isPrevilegedAccount: isPrivileged,
        creditNeed: 0,
        creditMaturity: 0,
        multiplier: 1,
        accumulatedFees: 0,
        debt: 0,
        allowDeferred: false,
        votes: 10,
        receivedVotes: 0,
        connections: 0,
        active: true,
        mintable: true,
        version: 1,
        storeVersion: 1,

        profile: ProfileInfo { username, h3Cell, country }.toCell(),
        timestamps: TimeStamps {
            accountInit: blockchain.now(),
            lastInvite: 0,
            lastClaim: 0,
            lastDecay: 0,
        }.toCell(),
        addresses: Addresses {
            owner: initStore.owner,
            nomInAddrs: NomInAddrs { nominee, invitor, invitor0 }.toCell(),
            trustedJettonAddrs: TrustedAddrs {
                minterAddr: initStore.minterAddr,
                personalJettonMinter: ZERO_ADDRESS,
                personalJettonWallet: ZERO_ADDRESS,
                authorisedAccs: [],
            }.toCell(),
        }.toCell(),
        maps: Maps {
            invited: [],
            allowances: [],
            social: SocialMaps {
                votedFor: [],
                followingCount: 0,
                followersCount: 0,
            }.toCell(),
            reportInfo: ReportInfo {
                reports: [],
                tosBreach: false,
                reporterCount: 0,
                disputerCount: 0,
                reportResolutionTime: 0,
            }.toCell(),
        }.toCell(),
    };
}

@method_id(2222)
fun migrateFiWalletFromPrevious(oldStore: FiWalletStore, version: uint10): void {
    // todo: need to repack? or use fresh instance of store? change version here
    // Current latest store version is 1; when version bumps occur in future,
    // stepwise migration logic goes here:
    // var oldStore = lazy FiWalletStore.fromCell(contract.getData());
    assert (oldStore.version == 1) throw Errors.VersionMismatch;
    oldStore.version = version;
    // var storage = FiStore {
    //     supply: oldStorage.totalSupply,
    //     walletVersion: oldStorage.walletVersion,
    //     admin: oldStorage.adminAddress,
    //     baseFiWalletCode: oldStorage.baseFiWalletCode,
    //     metadata: oldStorage.metadata,
    //     others: oldStorage.others,
    // };
    contract.setData(oldStore.toCell());
}

@method_id(2223)
fun migrateFiWalletFromBase(
    body: slice,
    senderAddress: address,
    baseStore: BaseFiWalletStore,
): void {
    val msg = lazy AllowedBaseUpgradeMessage.fromSlice(body);
    match (msg) {
        TopUpTons => {
            val newStore = migrateFromInit(
                baseStore,
                true,
                true,
                contract.getAddress(),
                contract.getAddress(),
            );
            contract.setData(newStore.toCell());
        }

        InternalInvite => {
            val newStore = migrateFromInit(
                baseStore,
                false,
                false,
                senderAddress,
                msg.invitor,
                msg.username,
                msg.h3Cell,
                msg.country,
                msg.sender,
            );
            contract.setData(newStore.toCell());

            val notifyMinterMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: baseStore.minterAddr,
                value: 0,
                body: InformMinterInviteInternal {
                    queryId: msg.queryId,
                    sender: baseStore.owner,
                    invitor: msg.sender,
                    username: msg.username,
                    h3Cell: msg.h3Cell,
                    country: msg.country,
                },
            });
            notifyMinterMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL,
            );
        }
    }
}
