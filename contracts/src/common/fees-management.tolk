// Storage duration standard (5 years)
const MIN_STORAGE_DURATION = 5 * 365 * 24 * 3600 // 5 years

// SAFETY: Uses TVM's read-only GETPRECOMPILEDGAS primitive; callers handle `null` fallback safely.
fun getPrecompiledGasConsumption(): int?
    asm "GETPRECOMPILEDGAS"
