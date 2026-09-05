import "@stdlib/gas-payments"

import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/sharding"

// Storage costs
// these constants are used to estimate storage fee (how much we should pay for storing a wallet contract);
// actual storage state (desired value of these constants) is printed to console by the bench test in
// contracts/tests/bench-fi-fees.test.tolk

const STORAGE_SIZE_MAX_WALLET_BITS = 56000 // measured max ≈ 55847, rounded up
const STORAGE_SIZE_MAX_WALLET_CELLS = 112 // measured max = 109, rounded up
const STORAGE_SIZE_INIT_STATE_WALLET_BITS = 56200 // measured init ≈ 56129, rounded up
const STORAGE_SIZE_INIT_STATE_WALLET_CELLS = 112 // measured init = 110, rounded up

const STORAGE_SIZE_MAX_MINTER_BITS = 10000
const STORAGE_SIZE_MAX_MINTER_CELLS = 20

const MESSAGE_SIZE_BURN_NOTIFICATION_BITS = 674 // NotifyMinter body, measured in bench-fi-fees.test.tolk
const MESSAGE_SIZE_BURN_NOTIFICATION_CELLS = 1 // body always in ref

// Gas costs
// these constants are used to estimate gas fee (how much we should remain on balance for a swap to succeed);
// they must be absolutely equal to consumed gas; if not, tests fail;
// actual consumed gas (desired value of these constants) is printed to console after tests run

const GAS_CONSUMPTION_JETTON_TRANSFER = 19726 // measured in bench-fi-fees.test.tolk
const GAS_CONSUMPTION_JETTON_RECEIVE = 10340
const GAS_CONSUMPTION_BURN_REQUEST = 13701
const GAS_CONSUMPTION_BURN_NOTIFICATION = 10927

fun calculateWalletMinStorageFee(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        STORAGE_SIZE_MAX_WALLET_BITS,
        STORAGE_SIZE_MAX_WALLET_CELLS,
    );
}

// Backward compatibility alias for tests
fun calculateJettonWalletMinStorageFee(): coins {
    return calculateWalletMinStorageFee();
}

fun calculateMinterMinStorageFee(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        STORAGE_SIZE_MAX_MINTER_BITS,
        STORAGE_SIZE_MAX_MINTER_CELLS,
    );
}

// Reserves TON on the balance so that after an outgoing message forwards `inValue`,
// the contract still keeps enough to cover its storage
fun reserveForWalletBalance(inValue: coins): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
    contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculateWalletMinStorageFee()),
        RESERVE_MODE_AT_MOST,
    );
}

// Legacy alias for reserveForWalletBalance
fun reserveForBalance(inValue: coins): void {
    reserveForWalletBalance(inValue);
}

fun reserveForMinterBalance(inValue: coins): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
    contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculateMinterMinStorageFee()),
        RESERVE_MODE_AT_MOST,
    );
}

fun reserveWalletStorageFee(): void {
    reserveGramsOnBalance(calculateWalletMinStorageFee(), RESERVE_MODE_EXACT_AMOUNT);
}

fun reserveMinterStorageFee(): void {
    reserveGramsOnBalance(calculateMinterMinStorageFee(), RESERVE_MODE_EXACT_AMOUNT);
}

fun forwardInitStateOverhead(): coins {
    return calculateForwardFeeWithoutLumpPrice(
        MY_WORKCHAIN,
        STORAGE_SIZE_INIT_STATE_WALLET_BITS,
        STORAGE_SIZE_INIT_STATE_WALLET_CELLS,
    );
}

fun calcMinimalTransferAmount(forwardTonAmount: int, fwdFee: int): int {
    val fwdCount = forwardTonAmount != 0
        ? 2
        : 1;                                      // second sending (forward) will be cheaper than first

    val jettonWalletGasConsumption = getPrecompiledGasConsumption();
    val sendTransferGasConsumption = (jettonWalletGasConsumption == null)
        ? GAS_CONSUMPTION_JETTON_TRANSFER
        : jettonWalletGasConsumption;
    val receiveTransferGasConsumption = (jettonWalletGasConsumption == null)
        ? GAS_CONSUMPTION_JETTON_RECEIVE
        : jettonWalletGasConsumption;

    return forwardTonAmount +
    // 3 messages: wal1->wal2, wal2->owner, wal2->response
    // but last one is optional (it is ok if it fails)
    fwdCount * fwdFee +
    forwardInitStateOverhead() +
    // additional fwd fees related to initstate in internal_transfer
    calculateGasFee(MY_WORKCHAIN, sendTransferGasConsumption) +
    calculateGasFee(MY_WORKCHAIN, receiveTransferGasConsumption) +
    calculateWalletMinStorageFee();
}

fun checkAmountIsEnoughToTransfer(msgValue: int, forwardTonAmount: int, fwdFee: int) {
    val minTransferAmount = calcMinimalTransferAmount(forwardTonAmount, fwdFee);
    assert (msgValue > minTransferAmount) throw Errors.NotEnoughGas;
}

fun calcMinimalBurnAmount(): coins {
    val jettonWalletGasConsumption = getPrecompiledGasConsumption();
    val sendBurnGasConsumption = (jettonWalletGasConsumption == null)
        ? GAS_CONSUMPTION_BURN_REQUEST
        : jettonWalletGasConsumption;

    return calculateForwardFee(
        MY_WORKCHAIN,
        MESSAGE_SIZE_BURN_NOTIFICATION_BITS,
        MESSAGE_SIZE_BURN_NOTIFICATION_CELLS,
    ) +
    calculateGasFee(MY_WORKCHAIN, sendBurnGasConsumption) +
    calculateGasFee(MY_WORKCHAIN, GAS_CONSUMPTION_BURN_NOTIFICATION);
}

fun checkAmountIsEnoughToBurn(msgValue: int) {
    val minBurnAmount = calcMinimalBurnAmount();
    assert (msgValue > minBurnAmount) throw Errors.NotEnoughGas;
}
