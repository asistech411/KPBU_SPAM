import { RISKS, FAHP_SCALE, CRISP_SCALE, RI_TABLE, PAT1_ITEMS, PAT2_ITEMS } from './constants'

// FAHP Calculation
export function calculateFAHP(pairwise: Record<string, string>) {
    const n = 6

    // Build TFN matrix
    const tfnM: [number, number, number][][] = []
    for (let i = 0; i < n; i++) {
        tfnM[i] = []
        for (let j = 0; j < n; j++) {
            tfnM[i][j] = i === j ? [1, 1, 1] : [1, 1, 1]
        }
    }

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const k = `${RISKS[i].code}_${RISKS[j].code}`
            const v = pairwise[k]
            if (v && FAHP_SCALE[v]) {
                tfnM[i][j] = [...FAHP_SCALE[v].tfn]
                tfnM[j][i] = [1 / tfnM[i][j][2], 1 / tfnM[i][j][1], 1 / tfnM[i][j][0]]
            }
        }
    }

    // Geometric mean
    const Gi: [number, number, number][] = []
    for (let i = 0; i < n; i++) {
        let pL = 1, pM = 1, pU = 1
        for (let j = 0; j < n; j++) {
            pL *= tfnM[i][j][0]
            pM *= tfnM[i][j][1]
            pU *= tfnM[i][j][2]
        }
        Gi.push([Math.pow(pL, 1 / n), Math.pow(pM, 1 / n), Math.pow(pU, 1 / n)])
    }

    // Sum
    const Gs: [number, number, number] = [0, 0, 0]
    Gi.forEach(g => {
        Gs[0] += g[0]
        Gs[1] += g[1]
        Gs[2] += g[2]
    })

    // Inverse
    const GsI: [number, number, number] = [1 / Gs[2], 1 / Gs[1], 1 / Gs[0]]

    // Fuzzy weights
    const Wi = Gi.map(g => [g[0] * GsI[0], g[1] * GsI[1], g[2] * GsI[2]])

    // Defuzzify
    const wS = Wi.map(w => (w[0] + w[1] + w[2]) / 3)
    const sum = wS.reduce((a, b) => a + b, 0)
    const weights = wS.map(w => w / sum)

    // Consistency check with crisp values
    const crispM: number[][] = []
    for (let i = 0; i < n; i++) {
        crispM[i] = []
        for (let j = 0; j < n; j++) {
            if (i === j) crispM[i][j] = 1
            else if (i < j) {
                const k = `${RISKS[i].code}_${RISKS[j].code}`
                crispM[i][j] = CRISP_SCALE[pairwise[k]] || 1
            } else {
                crispM[i][j] = 1 / crispM[j][i]
            }
        }
    }

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
        CR,
        CRPass: CR < 0.10,
        lambdaMax
    }
}

// LCM Calculation
export function calculateLCM(exposure: Record<string, number>, phaseCritical: Record<string, string>) {
    const result: Record<string, { exposure: number | null; phase: string | null }> = {}
    RISKS.forEach(r => {
        result[r.code] = {
            exposure: exposure[r.code] ?? null,
            phase: phaseCritical[r.code] ?? null
        }
    })
    return result
}

type PATData = Record<string, Record<string, number | 'TT'>>

// PAT Calculation
export function calculatePAT(pat1Data: PATData, pat2Data: PATData) {
    const result: {
        tier1: Record<string, any>
        tier2: Record<string, any>
    } = { tier1: {}, tier2: {} }

    const mean = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

    RISKS.forEach(r => {
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

        result.tier1[r.code] = {
            Control: mean(t1C.Control),
            Info: mean(t1C.Info),
            Verifiability: mean(t1C.Verifiability),
            Externality: mean(t1C.ExternalityRaw),
            ExternalityReversed: mean(t1C.Externality),
            Capacity: mean(t1C.Capacity),
            Incentives: mean(t1C.Incentives),
            ttCount: PAT1_ITEMS.filter(i => t1D[i.code] === 'TT').length,
            totalItems: PAT1_ITEMS.length
        }

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

        result.tier2[r.code] = {
            Control: mean(t2C.Control),
            Verifiability: mean(t2C.Verifiability),
            Incentives: mean(t2C.Incentives),
            Capacity: mean(t2C.Capacity),
            ttCount: PAT2_ITEMS.filter(i => t2D[i.code] === 'TT').length,
            totalItems: PAT2_ITEMS.length
        }
    })

    return result
}

// Allocation determination
export function determineAllocation(pat: ReturnType<typeof calculatePAT>, code: string) {
    const t1 = pat.tier1[code]
    const t2 = pat.tier2[code]

    let tier1Alloc = 'Shared'
    let tier1Reason = 'Kontrol terbagi/verifiability sedang.'

    if (t1.Control >= 4 && t1.Verifiability >= 3 && t1.Incentives >= 3 && t1.Externality <= 3) {
        tier1Alloc = 'BU/SPV'
        tier1Reason = 'Control tinggi, verifiability & incentives memadai.'
    } else if (t1.Externality >= 4 || t1.Control < 3) {
        if (t1.Control < 3) {
            tier1Alloc = 'Publik/PDAM'
            tier1Reason = 'Control BU/SPV rendah, risiko ditahan pemerintah.'
        } else {
            tier1Alloc = 'Publik/PDAM'
            tier1Reason = 'Externality tinggi (≥4), risiko dominan faktor eksternal.'
        }
    }

    let tier2Alloc: string
    let tier2Reason: string
    let mitigationControls: string[] = []

    if (tier1Alloc === 'Publik/PDAM') {
        tier2Alloc = 'N/A'
        tier2Reason = 'Tier-2 tidak diterapkan untuk domain publik-lead.'
        mitigationControls = deriveMitigationControls(t2, code)
    } else {
        if (t2.Control >= 4 && t2.Verifiability >= 4) {
            tier2Alloc = 'EPC/O&M'
            tier2Reason = 'Control & verifiability tinggi, transfer risiko layak.'
        } else if (t2.Control >= 3 && t2.Verifiability >= 3) {
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

function deriveMitigationControls(t2: any, code: string): string[] {
    const controls: string[] = []
    controls.push('KPI teknis terukur (availability, kualitas output, response time)')
    controls.push('Milestone readiness & commissioning checklist')
    controls.push('Audit access & data transparency clause')

    if (t2.Verifiability < 3.5) controls.push('Third-party verification pada milestone kritis')
    if (t2.Control >= 3) controls.push('Performance bond/retention terkait pencapaian teknis')
    if (t2.Incentives < 3.5) controls.push('Payment trigger berbasis milestone (bukan lump-sum)')
    controls.push('Defect liability period dengan jaminan pemeliharaan')

    return controls.slice(0, 5)
}

// Governance locks
export function determineGovernanceLocks(
    alloc: ReturnType<typeof determineAllocation>,
    pat: ReturnType<typeof calculatePAT>,
    code: string,
    dualRole: boolean
) {
    const locks: string[] = []
    const t1 = pat.tier1[code]
    const t2 = pat.tier2[code]
    const isGovLead = alloc.tier1.allocation === 'Publik/PDAM'

    if (isGovLead) {
        locks.push('⚠️ MEKANISME KOMPENSASI: Klausul penyesuaian tarif/AP untuk perubahan regulasi/kebijakan')
        locks.push('⚠️ RISK RESERVE: Alokasi anggaran kontingensi untuk risiko yang ditahan')
        locks.push('Eskalasi & force majeure clause dengan definisi jelas')
        locks.push('Periodic review clause untuk kondisi eksternal berubah')
        if (t1.Verifiability < 3.5) locks.push('Dashboard monitoring real-time untuk deteksi dini')
        if (t1.Incentives < 3.5) locks.push('Performance framework internal PDAM dengan reward/consequence')
    }

    if (alloc.tier1.allocation === 'Shared' || alloc.tier2.allocation === 'Shared') {
        locks.push('RACI/Interface Charter dengan definisi batas tanggung jawab')
        locks.push('KPI terukur dengan metode pengukuran disepakati')
        locks.push('Akses data & audit trail')
    }

    if (!isGovLead) {
        if (t1.Verifiability < 3.5 || t2.Verifiability < 3.5) {
            locks.push('Verifikasi independen pada milestone kritis')
            locks.push('Definisi KPI/metode ukur spesifik')
        }
        if (t1.Incentives < 3.5 || t2.Incentives < 3.5) {
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

// Confidence level
export function determineConfidence(
    fahp: ReturnType<typeof calculateFAHP>,
    pat: ReturnType<typeof calculatePAT>,
    code: string
) {
    const t1 = pat.tier1[code]
    const t2 = pat.tier2[code]
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
