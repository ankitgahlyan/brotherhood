import "@stdlib/gas-payments"

import "@contracts/common/errors"
import "@contracts/common/fees-management"
import "@contracts/common/sharding"

// Storage costs
// Measured in bench-personal-fees.test.tolk

const STORAGE_SIZE_MAX_PERSONAL_WALLET_BITS = 1000 // measured max PersonalWalletStore (861), rounded up
const STORAGE_SIZE_MAX_PERSONAL_WALLET_CELLS = 2 // measured max PersonalWalletStore (1), rounded up
const STORAGE_SIZE_INIT_STATE_PERSONAL_WALLET_BITS = 8000 // measured init state (7593), rounded up
const STORAGE_SIZE_INIT_STATE_PERSONAL_WALLET_CELLS = 18 // measured init state (15), rounded up

const STORAGE_SIZE_MAX_PERSONAL_MINTER_BITS = 1000 // measured PersonalStore (594), rounded up
const STORAGE_SIZE_MAX_PERSONAL_MINTER_CELLS = 4 // measured PersonalStore (2), rounded up

const MESSAGE_SIZE_PERSONAL_BURN_NOTIFICATION_BITS = 674 // NotifyMinter body
const MESSAGE_SIZE_PERSONAL_BURN_NOTIFICATION_CELLS = 1

// Gas costs
// Measured in bench-personal-fees.test.tolk
const GAS_CONSUMPTION_PERSONAL_JETTON_TRANSFER = 7026
const GAS_CONSUMPTION_PERSONAL_JETTON_RECEIVE = 7833
const GAS_CONSUMPTION_PERSONAL_BURN_REQUEST = 4666
const GAS_CONSUMPTION_PERSONAL_BURN_NOTIFICATION = 4853

fun calculatePersonalWalletMinStorageFee(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        STORAGE_SIZE_MAX_PERSONAL_WALLET_BITS,
        STORAGE_SIZE_MAX_PERSONAL_WALLET_CELLS,
    );
}

fun calculatePersonalMinterMinStorageFee(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        STORAGE_SIZE_MAX_PERSONAL_MINTER_BITS,
        STORAGE_SIZE_MAX_PERSONAL_MINTER_CELLS,
    );
}

// Reserves TON on the balance so that after an outgoing message forwards `inValue`,
// the contract still keeps enough to cover its storage
fun reserveForPersonalWalletBalance(inValue: coins): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
    contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculatePersonalWalletMinStorageFee()),
        RESERVE_MODE_AT_MOST,
    );
}

fun reserveForPersonalMinterBalance(inValue: coins): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
    contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculatePersonalMinterMinStorageFee()),
        RESERVE_MODE_AT_MOST,
    );
}

fun reservePersonalWalletStorageFee(): void {
    reserveGramsOnBalance(calculatePersonalWalletMinStorageFee(), RESERVE_MODE_EXACT_AMOUNT);
}

fun reservePersonalMinterStorageFee(): void {
    reserveGramsOnBalance(calculatePersonalMinterMinStorageFee(), RESERVE_MODE_EXACT_AMOUNT);
}

fun forwardInitStatePersonalWalletOverhead(): coins {
    return calculateForwardFeeWithoutLumpPrice(
        MY_WORKCHAIN,
        STORAGE_SIZE_INIT_STATE_PERSONAL_WALLET_BITS,
        STORAGE_SIZE_INIT_STATE_PERSONAL_WALLET_CELLS,
    );
}

fun calcMinimalPersonalTransferAmount(forwardTonAmount: int, fwdFee: int): int {
    val fwdCount = forwardTonAmount != 0
        ? 2
        : 1;                                      // second sending (forward) will be cheaper than first

    val jettonWalletGasConsumption = getPrecompiledGasConsumption();
    val sendTransferGasConsumption = (jettonWalletGasConsumption == null)
        ? GAS_CONSUMPTION_PERSONAL_JETTON_TRANSFER
        : jettonWalletGasConsumption;
    val receiveTransferGasConsumption = (jettonWalletGasConsumption == null)
        ? GAS_CONSUMPTION_PERSONAL_JETTON_RECEIVE
        : jettonWalletGasConsumption;

    return forwardTonAmount +
    // 3 messages: wal1->wal2, wal2->owner, wal2->response
    // but last one is optional (it is ok if it fails)
    fwdCount * fwdFee +
    forwardInitStatePersonalWalletOverhead() +
    // additional fwd fees related to initstate in internal_transfer
    calculateGasFee(MY_WORKCHAIN, sendTransferGasConsumption) +
    calculateGasFee(MY_WORKCHAIN, receiveTransferGasConsumption) +
    calculatePersonalWalletMinStorageFee();
}

fun checkAmountIsEnoughToPersonalTransfer(msgValue: int, forwardTonAmount: int, fwdFee: int) {
    val minTransferAmount = calcMinimalPersonalTransferAmount(forwardTonAmount, fwdFee);
    assert (msgValue > minTransferAmount) throw Errors.NotEnoughGas;
}

fun calcMinimalPersonalBurnAmount(): coins {
    val jettonWalletGasConsumption = getPrecompiledGasConsumption();
    val sendBurnGasConsumption = (jettonWalletGasConsumption == null)
        ? GAS_CONSUMPTION_PERSONAL_BURN_REQUEST
        : jettonWalletGasConsumption;

    return calculateForwardFee(
        MY_WORKCHAIN,
        MESSAGE_SIZE_PERSONAL_BURN_NOTIFICATION_BITS,
        MESSAGE_SIZE_PERSONAL_BURN_NOTIFICATION_CELLS,
    ) +
    calculateGasFee(MY_WORKCHAIN, sendBurnGasConsumption) +
    calculateGasFee(MY_WORKCHAIN, GAS_CONSUMPTION_PERSONAL_BURN_NOTIFICATION);
}

fun checkAmountIsEnoughToPersonalBurn(msgValue: int) {
    val minBurnAmount = calcMinimalPersonalBurnAmount();
    assert (msgValue > minBurnAmount) throw Errors.NotEnoughGas;
}
