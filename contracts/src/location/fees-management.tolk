import "@stdlib/gas-payments"

import "@contracts/common/fees-management"
import "@contracts/common/sharding"

const STORAGE_SIZE_MAX_LOCATION_BITS = 50000
const STORAGE_SIZE_MAX_LOCATION_CELLS = 100

fun calculateLocationMinStorageFee(): coins {
    return calculateStorageFee(
        MY_WORKCHAIN,
        MIN_STORAGE_DURATION,
        STORAGE_SIZE_MAX_LOCATION_BITS,
        STORAGE_SIZE_MAX_LOCATION_CELLS,
    );
}

fun reserveForLocationBalance(inValue: coins): void {
    val toLeaveOnBalance = contract.getOriginalBalance() - inValue +
    contract.getStorageDuePayment();
    reserveGramsOnBalance(
        max(toLeaveOnBalance, calculateLocationMinStorageFee()),
        RESERVE_MODE_AT_MOST,
    );
}
