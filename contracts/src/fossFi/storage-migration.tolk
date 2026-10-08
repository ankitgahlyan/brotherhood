import "@contracts/common/constants"
import "@contracts/common/errors"
import "@contracts/common/messages"

import "storage"

type AllowedBaseUpgradeMessage =
    | TopUpTons
    | InternalInvite

struct LegacyMapsV1 {
    invited: map<address, coins> = []
    allowances: map<address, RemainingBitsAndRefs> = []
    social: Cell<SocialMaps>
    reportInfo: Cell<ReportInfo>
}

fun migrateLegacyMapsToV2(rawMapsCell: cell): Cell<Maps> {
    val legacy = LegacyMapsV1.fromCell(rawMapsCell);
    var migratedPocketMoney: map<address, Cell<PocketMoney>> = [];
    val now = blockchain.now();

    var entry = legacy.allowances.findFirst();
    while (entry.isFound) {
        val grantee = entry.getKey();
        var valSlice = entry.loadValue();
        if (valSlice.remainingRefsCount() == 0) {
            val amount = valSlice.loadCoins();
            if (amount > 0) {
                migratedPocketMoney.set(
                    grantee,
                    PocketMoney {
                        unrestricted: false,
                        oneTime: null,
                        fixedRecurring: null,
                        openRecurring: OpenRecurringPocketMoney {
                            limit: amount,
                            spent: 0,
                            period: 0,
                            startTime: now,
                        },
                    }.toCell(),
                );
            }
        } else {
            val existingRef = valSlice.loadRef() as Cell<PocketMoney>;
            migratedPocketMoney.set(grantee, existingRef);
        }
        entry = legacy.allowances.iterateNext(entry);
    }

    return Maps {
        invited: legacy.invited,
        pocketMoney: migratedPocketMoney,
        social: legacy.social,
        reportInfo: legacy.reportInfo,
    }.toCell();
}

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
    walletVersion: uint10 = 1,
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
        multiplier: 1000,
        accumulatedFees: 0,
        debt: 0,
        allowDeferred: false,
        votes: 10,
        receivedVotes: 0,
        connections: 0,
        active: true,
        mintable: true,
        version: walletVersion,
        storeVersion: 3,

        profile: ProfileInfo { username, h3Cell, country }.toCell(),
        timestamps: TimeStamps {
            accountInit: blockchain.now(),
            lastInvite: 0,
            lastClaim: 0,
            lastDecay: 0,
            creditCutoff: 0,
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
            pocketMoney: [],
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
    assert (oldStore.version < version) throw Errors.VersionMismatch;
    if (oldStore.storeVersion < 2) {
        oldStore.maps = migrateLegacyMapsToV2(oldStore.maps as unknown as cell);
    }
    if (oldStore.storeVersion < 3) {
        oldStore.timestamps = loadTimeStamps(oldStore.timestamps).toCell();
    }
    oldStore.storeVersion = 3;
    oldStore.version = version;
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
                "",
                "",
                0,
                null,
                1,
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
                msg.version > 0 ? msg.version : 1,
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
