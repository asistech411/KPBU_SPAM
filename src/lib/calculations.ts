import { RISKS, PHASES, FAHP_MAP, RI_TABLE, PAT1_ITEMS, PAT2_ITEMS, PHASE_MAP } from './constants'

// --- Shared helpers ---

const mean = (arr: number[]): number | null =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

const nonNullMean = (values: (number | null)[]): number | null =>
    mean(values.filter((v): v is number => v !== null))

// --- Types ---

export type LCMStats = {
    avgExposure: number | null
    maxExposure: number | null
    minExposure: number | null
    highRiskCount: number   // exposure >= 4
    lowRiskCount: number    // exposure <= 2
    phaseDistribution: Array<{ phase: string; count: number; percentage: number }>
    dominantPhase: string | null
}

export type LCMResult = {
    mapping: Record<string, { exposure: number | null; phase: string | null }>
    stats: LCMStats
}

type Tier1Metrics = {
    Control: number | null
    Info: number | null
    Verifiability: number | null
    Externality: number | null   // adjusted (6 − raw) — sesuai CALC_PAT Excel (baris 9 = 2.50)
    ExternalityRaw: number | null // raw sebelum reverse, untuk referensi saja
    Capacity: number | null
    Incentives: number | null
    ttCount: number
    totalItems: number
    overallScore: number | null  // grand mean 6 konstruk pakai Externality adjusted
}

type Tier2Metrics = {
    Control: number | null
    Verifiability: number | null
    Incentives: number | null
    Capacity: number | null
    ttCount: number
    totalItems: number
    overallScore: number | null         // grand mean of 4 constructs
}

// --- FAHP Calculation ---

export function calculateFAHP(pairwise: Record<string, string>) {
    const n = 6
    const getItem = (v?: string) => (v ? FAHP_MAP[v.toString()] : undefined)
    const getReciprocalItem = (item: NonNullable<ReturnType<typeof getItem>>) => {
        const reciprocalCode = item.code.startsWith('1/')
            ? item.code.slice(2)
            : `1/${item.code}`
        return FAHP_MAP[reciprocalCode]
    }

    // Build crisp matrix using the selected scale and its reciprocal pair code.
    const crispM: number[][] = []
    for (let i = 0; i < n; i++) {
        crispM[i] = []
        for (let j = 0; j < n; j++) {
            if (i === j) crispM[i][j] = 1
            else if (i < j) {
                const k = `${RISKS[i].code}_${RISKS[j].code}`
                crispM[i][j] = getItem(pairwise[k])?.crisp || 1
            } else {
                const k = `${RISKS[j].code}_${RISKS[i].code}`
                const upperItem = getItem(pairwise[k])
                if (upperItem) {
                    crispM[i][j] = getReciprocalItem(upperItem)?.crisp || (1 / crispM[j][i])
                } else {
                    crispM[i][j] = 1
                }
            }
        }
    }

    // Crisp geometric mean (match spreadsheet validation)
    const geometricMeans = crispM.map(row => {
        const product = row.reduce((a, b) => a * b, 1)
        return Math.pow(product, 1 / n)
    })
    const gmSum = geometricMeans.reduce((a, b) => a + b, 0)
    const weights = geometricMeans.map(g => g / gmSum)

    // A * w
    const Aw: number[] = []
    for (let i = 0; i < n; i++) {
        let s = 0
        for (let j = 0; j < n; j++) {
            s += crispM[i][j] * weights[j]
        }
        Aw.push(s)
    }

    const lambdas = Aw.map((v, i) => weights[i] > 0 ? v / weights[i] : 0)
    const lambdaMax = lambdas.reduce((a, b) => a + b, 0) / n
    const CI = (lambdaMax - n) / (n - 1)
    const CR = CI / RI_TABLE[n]

    return {
        weights,
        geometricMeans,
        CR,
        CRPass: CR < 0.10,
        lambdaMax
    }
}

// --- LCM Calculation (BL-01 & BL-02) ---

export function calculateLCM(
    exposure: Record<string, number>,
    phaseCritical: Record<string, string | number>
): LCMResult {
    // Build mapping: risk → { exposure, phase label }
    const mapping: Record<string, { exposure: number | null; phase: string | null }> = {}
    RISKS.forEach(r => {
        const p = phaseCritical[r.code]
        mapping[r.code] = {
            exposure: exposure[r.code] ?? null,
            phase: p ? (PHASE_MAP[p.toString()]?.label || p.toString()) : null
        }
    })

    // Exposure statistics
    const exposures = RISKS
        .map(r => mapping[r.code].exposure)
        .filter((v): v is number => v !== null)

    const avgExposure = mean(exposures)
    const maxExposure = exposures.length > 0 ? Math.max(...exposures) : null
    const minExposure = exposures.length > 0 ? Math.min(...exposures) : null
    const highRiskCount = exposures.filter(v => v >= 4).length
    const lowRiskCount = exposures.filter(v => v <= 2).length

    // Phase distribution (BL-02)
    const phaseCounts: Record<string, number> = {}
    PHASES.forEach(p => { phaseCounts[p.label] = 0 })
    RISKS.forEach(r => {
        const phase = mapping[r.code].phase
        if (phase && phase in phaseCounts) phaseCounts[phase]++
    })

    const phaseDistribution = PHASES.map(p => ({
        phase: p.label,
        count: phaseCounts[p.label],
        percentage: (phaseCounts[p.label] / RISKS.length) * 100
    }))

    const maxCount = Math.max(...phaseDistribution.map(d => d.count))
    const dominantPhase = maxCount > 0
        ? (phaseDistribution.find(d => d.count === maxCount)?.phase ?? null)
        : null

    return {
        mapping,
        stats: {
            avgExposure,
            maxExposure,
            minExposure,
            highRiskCount,
            lowRiskCount,
            phaseDistribution,
            dominantPhase
        }
    }
}

type PATData = Record<string, Record<string, number | 'TT'>>

// --- PAT Calculation (BL-03) ---

export function calculatePAT(pat1Data: PATData, pat2Data: PATData) {
    const result: Record<string, { tier1: Tier1Metrics; tier2: Tier2Metrics }> = {}

    RISKS.forEach(r => {
        // Tier-1: collect items per construct
        const t1D = pat1Data[r.code] || {}
        const t1C: Record<string, number[]> = {
            Control: [], Info: [], Verifiability: [], Externality: [], ExternalityRaw: [], Capacity: [], Incentives: []
        }

        PAT1_ITEMS.forEach(item => {
            const v = t1D[item.code]
            if (v !== undefined && v !== 'TT') {
                const numV = typeof v === 'number' ? v : parseInt(v)
                if ('reverse' in item && item.reverse) {
                    t1C.ExternalityRaw.push(numV)
                    t1C.Externality.push(6 - numV)
                } else {
                    t1C[item.construct].push(numV)
                }
            }
        })

        // Tier-2: collect items per construct
        const t2D = pat2Data[r.code] || {}
        const t2C: Record<string, number[]> = {
            Control: [], Verifiability: [], Incentives: [], Capacity: []
        }

        PAT2_ITEMS.forEach(item => {
            const v = t2D[item.code]
            if (v !== undefined && v !== 'TT') {
                const numV = typeof v === 'number' ? v : parseInt(v)
                t2C[item.construct].push(numV)
            }
        })

        // Tier-1 overall score: grand mean 6 konstruk
        // Externality pakai ADJUSTED (t1C.Externality = 6−raw) sesuai CALC_PAT!F14:F15
        // Contoh: raw=[4,3] → adjusted=[2,3] → mean=2.50 → overall=(4+3.5+3.5+2.5+4+3.5)/6=3.50 ✓
        const t1OverallScore = nonNullMean([
            mean(t1C.Control),
            mean(t1C.Info),
            mean(t1C.Verifiability),
            mean(t1C.Externality),   // adjusted (6−raw), sesuai Excel
            mean(t1C.Capacity),
            mean(t1C.Incentives),
        ])

        // Tier-2 overall score: grand mean of 4 constructs
        const t2OverallScore = nonNullMean([
            mean(t2C.Control),
            mean(t2C.Verifiability),
            mean(t2C.Incentives),
            mean(t2C.Capacity),
        ])

        result[r.code] = {
            tier1: {
                Control: mean(t1C.Control),
                Info: mean(t1C.Info),
                Verifiability: mean(t1C.Verifiability),
                Externality: mean(t1C.Externality),      // adjusted (2.50) — sesuai CALC_PAT
                ExternalityRaw: mean(t1C.ExternalityRaw), // raw (3.50) — untuk referensi
                Capacity: mean(t1C.Capacity),
                Incentives: mean(t1C.Incentives),
                ttCount: PAT1_ITEMS.filter(i => t1D[i.code] === 'TT').length,
                totalItems: PAT1_ITEMS.length,
                overallScore: t1OverallScore,
            },
            tier2: {
                Control: mean(t2C.Control),
                Verifiability: mean(t2C.Verifiability),
                Incentives: mean(t2C.Incentives),
                Capacity: mean(t2C.Capacity),
                ttCount: PAT2_ITEMS.filter(i => t2D[i.code] === 'TT').length,
                totalItems: PAT2_ITEMS.length,
                overallScore: t2OverallScore,
            }
        }
    })

    return result
}

// --- Allocation determination ---

export function determineAllocation(pat: ReturnType<typeof calculatePAT>, code: string) {
    const t1 = pat[code].tier1
    const t2 = pat[code].tier2

    let tier1Alloc = 'Shared'
    let tier1Reason = 'Kontrol terbagi/verifiability sedang.'

    if ((t1.Externality ?? 0) >= 4 || (t1.Control ?? 0) < 3) {
        if ((t1.Control ?? 0) < 3) {
            tier1Alloc = 'Publik/PDAM'
            tier1Reason = 'Control BU/SPV rendah, risiko ditahan pemerintah.'
        } else {
            tier1Alloc = 'Publik/PDAM'
            tier1Reason = 'Externality tinggi (≥4), risiko dominan faktor eksternal.'
        }
    } else if ((t1.Control ?? 0) >= 4 && (t1.Verifiability ?? 0) >= 3 && (t1.Incentives ?? 0) >= 3 && (t1.Externality ?? 0) <= 3) {
        tier1Alloc = 'BU/SPV'
        tier1Reason = 'Control tinggi, verifiability & incentives memadai.'
    }

    let tier2Alloc: string
    let tier2Reason: string
    let mitigationControls: string[] = []

    if (tier1Alloc === 'Publik/PDAM') {
        tier2Alloc = 'N/A'
        tier2Reason = 'Tier-2 tidak diterapkan untuk domain publik-lead.'
        mitigationControls = deriveMitigationControls(t2, code)
    } else {
        if ((t2.Control ?? 0) >= 4 && (t2.Verifiability ?? 0) >= 4) {
            tier2Alloc = 'EPC/O&M'
            tier2Reason = 'Control & verifiability tinggi, transfer risiko layak.'
        } else if ((t2.Control ?? 0) >= 3 && (t2.Verifiability ?? 0) >= 3) {
            tier2Alloc = 'Shared'
            tier2Reason = 'Control/verifiability sedang, berbagi dengan BU/SPV.'
        } else {
            tier2Alloc = 'BU/SPV-retain'
            tier2Reason = 'Control/verifiability rendah, BU/SPV menahan risiko.'
        }
    }

    return {
        tier1: { allocation: tier1Alloc, reason: tier1Reason },
        tier2: { allocation: tier2Alloc, reason: tier2Reason, mitigationControls }
    }
}

function deriveMitigationControls(t2: Tier2Metrics, code: string): string[] {
    const controls: string[] = []
    controls.push('KPI teknis terukur (availability, kualitas output, response time)')
    controls.push('Milestone readiness & commissioning checklist')
    controls.push('Audit access & data transparency clause')

    if ((t2.Verifiability ?? 0) < 3.5) controls.push('Third-party verification pada milestone kritis')
    if ((t2.Control ?? 0) >= 3) controls.push('Performance bond/retention terkait pencapaian teknis')
    if ((t2.Incentives ?? 0) < 3.5) controls.push('Payment trigger berbasis milestone (bukan lump-sum)')
    controls.push('Defect liability period dengan jaminan pemeliharaan')

    return controls.slice(0, 5)
}

// --- Governance locks ---

export function determineGovernanceLocks(
    alloc: ReturnType<typeof determineAllocation>,
    pat: ReturnType<typeof calculatePAT>,
    code: string,
    dualRole: boolean
) {
    const locks: string[] = []
    const t1 = pat[code].tier1
    const t2 = pat[code].tier2
    const isGovLead = alloc.tier1.allocation === 'Publik/PDAM'

    if (isGovLead) {
        locks.push('⚠️ MEKANISME KOMPENSASI: Klausul penyesuaian tarif/AP untuk perubahan regulasi/kebijakan')
        locks.push('⚠️ RISK RESERVE: Alokasi anggaran kontingensi untuk risiko yang ditahan')
        locks.push('Eskalasi & force majeure clause dengan definisi jelas')
        locks.push('Periodic review clause untuk kondisi eksternal berubah')
        if ((t1.Verifiability ?? 0) < 3.5) locks.push('Dashboard monitoring real-time untuk deteksi dini')
        if ((t1.Incentives ?? 0) < 3.5) locks.push('Performance framework internal PDAM dengan reward/consequence')
    }

    if (alloc.tier1.allocation === 'Shared' || alloc.tier2.allocation === 'Shared') {
        locks.push('RACI/Interface Charter dengan definisi batas tanggung jawab')
        locks.push('KPI terukur dengan metode pengukuran disepakati')
        locks.push('Akses data & audit trail')
    }

    if (!isGovLead) {
        if ((t1.Verifiability ?? 0) < 3.5 || (t2.Verifiability ?? 0) < 3.5) {
            locks.push('Verifikasi independen pada milestone kritis')
            locks.push('Definisi KPI/metode ukur spesifik')
        }
        if ((t1.Incentives ?? 0) < 3.5 || (t2.Incentives ?? 0) < 3.5) {
            locks.push('Payment trigger/holdback terkait kinerja')
            locks.push('Mekanisme insentif-disinsentif jelas')
        }
    }

    if (dualRole) {
        locks.push('Pengaman dual-role: separasi fungsi & firewall')
        locks.push('Approval independen keputusan kritis')
    }

    if (locks.length < 3) {
        locks.push('KPI terukur dengan definisi data jelas')
        locks.push('Akses data & audit trail')
        locks.push('Mekanisme eskalasi & sengketa')
    }

    return [...new Set(locks)].slice(0, 6)
}

// --- Confidence level ---

export function determineConfidence(
    fahp: ReturnType<typeof calculateFAHP>,
    pat: ReturnType<typeof calculatePAT>,
    code: string
) {
    const t1 = pat[code].tier1
    const t2 = pat[code].tier2
    const tt1 = t1.ttCount / t1.totalItems
    const tt2 = t2.ttCount / t2.totalItems
    const weak = t1.Control === null || t1.Verifiability === null || t2.Control === null || t2.Verifiability === null

    if (!fahp.CRPass || tt1 > 0.4 || tt2 > 0.4 || weak) {
        return { level: 'Rendah', reason: 'CR tidak lolos/TT tinggi/data lemah' }
    }
    if (tt1 > 0.2 || tt2 > 0.2) {
        return { level: 'Sedang', reason: 'TT moderat (20-40%)' }
    }
    return { level: 'Tinggi', reason: 'CR lolos, TT rendah, data lengkap' }
}
