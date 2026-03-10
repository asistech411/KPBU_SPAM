/**
 * utils.ts — Shared utility functions for KPBU SPAM
 *
 * Diextract dari results/[id]/page.tsx untuk reusability.
 * Berisi: formatting helpers, LCM backward-compat helpers, strict lock counter.
 */
import type { LCMMapping, LCMStats, Results } from './types'

// --- Formatting helpers ---

/** Format angka ke 1 desimal, atau '-' jika null/undefined */
export const fmt1 = (v: number | null | undefined): string =>
    v != null ? v.toFixed(1) : '-'

/** Format angka ke 2 desimal, atau '-' jika null/undefined */
export const fmt2 = (v: number | null | undefined): string =>
    v != null ? v.toFixed(2) : '-'

/** Format angka sebagai persentase (×100, 1 desimal), atau '-' jika null/undefined */
export const fmtPct = (v: number | null | undefined): string =>
    v != null ? `${(v * 100).toFixed(1)}%` : '-'

// --- LCM backward-compatibility helpers ---
// Mendukung dua format: lama (flat { R1: {...} }) dan baru ({ mapping, stats })

/** Ambil LCM mapping dari format lama atau baru */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLCMMapping(lcm: Results['lcm']): LCMMapping {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = lcm as any
    return raw.mapping ?? lcm
}

/** Ambil LCM stats dari format baru, atau null jika masih format lama */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLCMStats(lcm: Results['lcm']): LCMStats | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = lcm as any
    return raw.stats ?? null
}

// --- BL-06: Strict 5-type governance lock counter (sesuai Excel CALC_Allocation) ---
// Excel menghitung 5 tipe lock spesifik, bukan free-form seperti kode governance locks
// Tipe: joint monitoring, third-party verif, performance payment, tariff clause, risk reserve

export function strictLockCount(
    riskCode: string,
    pat: Results['pat'],
    allocations: Results['allocations']
): number {
    const t1 = pat[riskCode]?.tier1
    const alloc = allocations[riskCode]
    if (!t1 || !alloc) return 0

    let count = 0
    // 1. Joint monitoring committee (trigger: Shared allocation)
    if (alloc.tier1.allocation === 'Shared') count++
    // 2. Third-party verification (trigger: Verifiability < 3.5)
    if ((t1.Verifiability ?? 99) < 3.5) count++
    // 3. Performance-linked payment (trigger: Incentives < 3.5)
    if ((t1.Incentives ?? 99) < 3.5) count++
    // 4. Tariff adjustment clause (trigger: Gov-lead)
    if (alloc.tier1.allocation === 'Publik/PDAM') count++
    // 5. Risk reserve fund (trigger: Gov-lead)
    if (alloc.tier1.allocation === 'Publik/PDAM') count++

    return count
}
