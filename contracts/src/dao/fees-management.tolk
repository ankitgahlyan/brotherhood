import "@stdlib/gas-payments"

import "@contracts/common/fees-management"
import "@contracts/common/sharding"

const STORAGE_SIZE_MAX_DAO_BITS = 5000
const STORAGE_SIZE_MAX_DAO_CELLS = 10

fun calculateDaoMinStorageFee(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        STORAGE_SIZE_MAX_DAO_BITS,
        STORAGE_SIZE_MAX_DAO_CELLS,
    );
}

fun reserveForDaoBalance(inValue: coins): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
    contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculateDaoMinStorageFee()),
        RESERVE_MODE_AT_MOST,
    );
}

fun reserveDaoStorageFee(): void {
    reserveGramsOnBalance(calculateDaoMinStorageFee(), RESERVE_MODE_EXACT_AMOUNT);
}
