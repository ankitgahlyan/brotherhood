import "@stdlib/gas-payments"

import "@contracts/common/fees-management"
import "@contracts/common/sharding"

const STORAGE_SIZE_MAX_LOCATION_CREDIT_BITS = 50000
const STORAGE_SIZE_MAX_LOCATION_CREDIT_CELLS = 100

fun calculateLocationCreditMinStorageFee(entryCount: int): coins {
    val targetCells = max(100, entryCount * 3);
    val targetBits = max(50000, entryCount * 600);
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        targetBits,
        targetCells,
    );
}

fun reserveForLocationCreditBalance(inValue: coins, entryCount: int): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
        contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculateLocationCreditMinStorageFee(entryCount)),
        RESERVE_MODE_AT_MOST,
    );
}
