import "@stdlib/tvm-lowlevel"

import "@gen/Poll.code"
import "@contracts/common/errors"
import "@contracts/common/internal-transfer"
import "@contracts/common/messages"
import "@contracts/dao/dao-utils"
import "@contracts/fossFi/consts"

import "storage"

type AllowedMessageToDaoProxy =
    | InitDaoProxy
    | ExecuteDaoProposal
    | HotUpgrade
    | TopUpTons

contract DaoProxy {
    author: "zeta"
    version: "0.1.0"
    description: "DAO Proxy contract governing administrative forwarding from Polls to FossFi"
    storage: DaoProxyStore
    incomingMessages: AllowedMessageToDaoProxy
}

fun onInternalMessage(in: InMessage): void {
    if (in.body.isEmpty()) {
        return;
    }

    val msg = lazy AllowedMessageToDaoProxy.fromSlice(in.body);
    var store = lazy DaoProxyStore.load();

    match (msg) {
        InitDaoProxy => {
            assert (in.senderAddress == store.adminAddress) throw Errors.NotOwner;
            store.targetAddress = msg.targetAddress;
            store.save();
        }

        HotUpgrade => {
            assert (in.senderAddress == store.adminAddress) throw Errors.NotOwner;

            contract.setCodePostponed(msg.code);

            // SAFETY
            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeDaoProxyData(msg.additionalData);

            return;
        }

        ExecuteDaoProposal => {
            assert (store.targetAddress != RAW_ZERO_ADDRESS) throw Errors.NotOwner;

            val expectedPoll = calcDeployPoll(
                msg.proposalId,
                msg.proposerOwner,
                contract.getAddress(),
                store.targetAddress,
                msg.targetMsg,
                msg.expiresAt,
                pollCompiledCodeLibraryRef(),
            ).calculateAddress();
            assert (in.senderAddress == expectedPoll) throw Errors.IncorrectSender;

            reserveGramsOnBalance(
                ton("0.01"),
                RESERVE_MODE_EXACT_AMOUNT,
            );

            val rewardAmount = ton("10000"); // 10x proposal fee reward (10 * 1000 FI)
            val rewardMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: ton("0.1"),
                dest: store.targetAddress,
                body: MintNewJettons {
                    queryId: msg.proposalId,
                    mintRecipient: msg.proposerOwner,
                    tonAmount: ton("0.05"),
                    internalTransferMsg: makeInternalTransferStep(
                        msg.proposalId,
                        rewardAmount,
                        contract.getAddress(),
                        msg.proposerOwner,
                        0,
                    ),
                },
            });
            rewardMsg.send(
                SEND_MODE_PAY_FEES_SEPARATELY | SEND_MODE_IGNORE_ERRORS,
            );

            val forwardMsg = createMessage({
                bounce: BounceMode.NoBounce,
                value: 0,
                dest: store.targetAddress,
                body: msg.targetMsg.beginParse(),
            });
            forwardMsg.send(
                SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_IGNORE_ERRORS,
            );
        }

        TopUpTons => {
            // accept ton balance top-up
        }

        else => {
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
}

fun onBouncedMessage(_in: InMessageBounced): void {
    // Gracefully handle bounced messages
}

@method_id(2727)
fun hotUpgradeDaoProxyData(_additionalData: cell?) {
    val oldStore = DaoProxyStore.load();
    oldStore.save();
}

get fun get_dao_proxy_data(): DaoProxyStore {
    return DaoProxyStore.load();
}

get fun get_target_address(): address? {
    val store = lazy DaoProxyStore.load();
    return store.targetAddress == RAW_ZERO_ADDRESS ? null : store.targetAddress;
}

get fun get_admin_address(): address {
    val store = lazy DaoProxyStore.load();
    return store.adminAddress;
}
