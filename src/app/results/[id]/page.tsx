'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { RISKS, PHASES } from '@/lib/constants'
import type { LCMStats } from '@/lib/calculations'

// --- Types ---

interface LCMMapping {
    [riskCode: string]: { exposure: number | null; phase: string | null }
}

interface Tier1 {
    Control: number | null
    Info: number | null
    Verifiability: number | null
    Externality: number | null    // adjusted (6−raw), sesuai CALC_PAT Excel
    ExternalityRaw: number | null // raw sebelum reverse
    Capacity: number | null
    Incentives: number | null
    ttCount: number
    totalItems: number
    overallScore: number | null
}

interface Tier2 {
    Control: number | null
    Verifiability: number | null
    Incentives: number | null
    Capacity: number | null
    ttCount: number
    totalItems: number
    overallScore: number | null
}

interface Results {
    fahp: {
        weights: number[]
        geometricMeans?: number[]
        CR: number
        CRPass: boolean
        lambdaMax?: number
    }
    // Supports both new { mapping, stats } and old flat { R1: {...}, ... } format
    lcm: { mapping: LCMMapping; stats: LCMStats } | LCMMapping
    pat: Record<string, { tier1: Tier1; tier2: Tier2 }>
    allocations: Record<string, {
        tier1: { allocation: string; reason: string }
        tier2: { allocation: string; reason: string; mitigationControls?: string[] }
    }>
    governanceLocks: Record<string, string[]>
    confidence: Record<string, { level: string; reason: string }>
}

interface Survey {
    id: string
    respondentName: string
    respondentEmail?: string
    results: Results
    createdAt: string
}

// --- Backward-compat helpers (support old flat lcm format and new { mapping, stats }) ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLCMMapping(lcm: Results['lcm']): LCMMapping {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = lcm as any
    return raw.mapping ?? lcm
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLCMStats(lcm: Results['lcm']): LCMStats | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = lcm as any
    return raw.stats ?? null
}

// --- Formatting helpers ---

const fmt1 = (v: number | null | undefined) => v != null ? v.toFixed(1) : '-'
const fmt2 = (v: number | null | undefined) => v != null ? v.toFixed(2) : '-'
const fmtPct = (v: number | null | undefined) => v != null ? `${(v * 100).toFixed(1)}%` : '-'

// --- Component ---

export default function ResultsPage() {
    const params = useParams()
    const { data: session } = useSession()
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [loading, setLoading] = useState(true)
    const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set())

    const isAdmin = !!session?.user

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/survey?id=${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setSurvey(data)
                }
            } catch (e) {
                console.error('Failed to fetch results:', e)
            }
            setLoading(false)
        }
        fetchResults()
    }, [params.id])

    const toggleAccordion = (code: string) => {
        setOpenAccordions(prev => {
            const next = new Set(prev)
            if (next.has(code)) next.delete(code)
            else next.add(code)
            return next
        })
    }

    const downloadJSON = () => {
        if (!survey) return
        const blob = new Blob([JSON.stringify(survey, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kpbu-survey-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const downloadCSV = () => {
        if (!survey?.results) return
        const r = survey.results
        const lcmMap = getLCMMapping(r.lcm)
        const header = ['Risk', 'Weight', 'Exposure', 'Phase', 'Tier1', 'Tier2', 'Confidence']
        const rows = RISKS.map((ri, i) => {
            const a = r.allocations[ri.code]
            return [
                ri.code,
                (r.fahp.weights[i] * 100).toFixed(2),
                lcmMap[ri.code]?.exposure || '',
                lcmMap[ri.code]?.phase || '',
                a.tier1.allocation,
                a.tier2.allocation,
                r.confidence[ri.code].level
            ].join(',')
        })
        const csv = [header.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kpbu-results-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="main">
                <div className="card">
                    <h2>Memuat hasil...</h2>
                </div>
            </div>
        )
    }

    if (!survey?.results) {
        return (
            <div className="main">
                <div className="card">
                    <h2>Hasil tidak ditemukan</h2>
                    <p>Survey dengan ID ini tidak ditemukan atau belum di-submit.</p>
                    <div className="btn-group">
                        <Link href={isAdmin ? '/admin' : '/'} className="btn btn-primary">
                            {isAdmin ? '← Kembali ke Admin Dashboard' : 'Kembali ke Beranda'}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const r = survey.results
    const lcmMap = getLCMMapping(r.lcm)
    const lcmStats = getLCMStats(r.lcm)

    // Derived KPI values
    const topRIdx = r.fahp.weights.reduce((m, w, i) => w > r.fahp.weights[m] ? i : m, 0)
    const topRisk = RISKS[topRIdx]
    const sharedCount = RISKS.filter(ri =>
        r.allocations[ri.code].tier1.allocation === 'Shared' ||
        r.allocations[ri.code].tier2.allocation === 'Shared'
    ).length
    // BL-06: Strict 5-type lock count sesuai Excel CALC_Allocation
    function strictLockCount(riskCode: string): number {
        const t1 = r.pat[riskCode]?.tier1
        const alloc = r.allocations[riskCode]
        if (!t1 || !alloc) return 0
        let count = 0
        if (alloc.tier1.allocation === 'Shared') count++                    // 1. Joint monitoring
        if ((t1.Verifiability ?? 99) < 3.5) count++                        // 2. Third-party verification
        if ((t1.Incentives ?? 99) < 3.5) count++                           // 3. Performance-linked payment
        if (alloc.tier1.allocation === 'Publik/PDAM') count++              // 4. Tariff adjustment clause
        if (alloc.tier1.allocation === 'Publik/PDAM') count++              // 5. Risk reserve fund
        return count
    }
    const totalLockCount = RISKS.reduce((sum, ri) => sum + strictLockCount(ri.code), 0)

    // Survey-level PAT overall scores (average across all 6 risks)
    const pat1Scores = RISKS.map(ri => r.pat[ri.code]?.tier1?.overallScore).filter((v): v is number => v != null)
    const pat2Scores = RISKS.map(ri => r.pat[ri.code]?.tier2?.overallScore).filter((v): v is number => v != null)
    const surveyPAT1 = pat1Scores.length > 0 ? pat1Scores.reduce((a, b) => a + b, 0) / pat1Scores.length : null
    const surveyPAT2 = pat2Scores.length > 0 ? pat2Scores.reduce((a, b) => a + b, 0) / pat2Scores.length : null

    // Allocation for top-weighted risk (for KPI cards)
    const topAlloc = r.allocations[topRisk.code]

    // Avg exposure fallback for old data
    const avgExpFallback = Object.values(lcmMap).filter(l => l.exposure !== null).reduce((s, l) => s + (l.exposure || 0), 0) / 6
    const avgExp = lcmStats?.avgExposure ?? avgExpFallback

    // BL-07: Compute 13 AUDIT_Checks (integrity tests)
    const weightSum = r.fahp.weights.reduce((a, b) => a + b, 0)
    const phaseDistSum = lcmStats ? Object.values(lcmStats.phaseDistribution).reduce((a, b) => a + b.count, 0) : null
    const auditChecks: { name: string; value: string; pass: boolean }[] = [
        {
            name: 'FAHP Weights Sum = 1.00',
            value: fmt2(weightSum),
            pass: Math.abs(weightSum - 1) < 0.001,
        },
        {
            name: 'CR < 0.10 (Konsisten)',
            value: fmt2(r.fahp.CR),
            pass: r.fahp.CRPass,
        },
        {
            name: 'Semua Bobot > 0',
            value: r.fahp.weights.every(w => w > 0) ? 'Ya' : 'Ada bobot ≤ 0',
            pass: r.fahp.weights.every(w => w > 0),
        },
        {
            name: 'Skor Eksposur LCM dalam 1–5',
            value: Object.values(lcmMap).every(l => l.exposure === null || (l.exposure >= 1 && l.exposure <= 5)) ? 'Semua valid' : 'Ada di luar range',
            pass: Object.values(lcmMap).every(l => l.exposure === null || (l.exposure >= 1 && l.exposure <= 5)),
        },
        {
            name: 'Fase Kritis LCM dalam 1–4',
            value: Object.values(lcmMap).every(l => l.phase === null || (['1','2','3','4'].includes(l.phase))) ? 'Semua valid' : 'Ada di luar range',
            pass: Object.values(lcmMap).every(l => l.phase === null || (['1','2','3','4'].includes(l.phase))),
        },
        {
            name: 'Distribusi Fase Sum = 6',
            value: phaseDistSum !== null ? String(phaseDistSum) : 'N/A',
            pass: phaseDistSum === 6,
        },
        {
            name: 'Skor PAT1 Overall dalam 1–5',
            value: surveyPAT1 !== null ? fmt2(surveyPAT1) : 'N/A',
            pass: surveyPAT1 !== null && surveyPAT1 >= 1 && surveyPAT1 <= 5,
        },
        {
            name: 'Skor PAT2 Overall dalam 1–5',
            value: surveyPAT2 !== null ? fmt2(surveyPAT2) : 'N/A',
            pass: surveyPAT2 !== null && surveyPAT2 >= 1 && surveyPAT2 <= 5,
        },
        {
            name: 'Alokasi Tier-1 semua terisi',
            value: RISKS.every(ri => r.allocations[ri.code]?.tier1?.allocation) ? 'Terisi' : 'Ada yang kosong',
            pass: RISKS.every(ri => r.allocations[ri.code]?.tier1?.allocation),
        },
        {
            name: 'Alokasi Tier-2 semua terisi',
            value: RISKS.every(ri => r.allocations[ri.code]?.tier2?.allocation) ? 'Terisi' : 'Ada yang kosong',
            pass: RISKS.every(ri => r.allocations[ri.code]?.tier2?.allocation),
        },
        {
            name: 'Governance Locks Count ≥ 0',
            value: String(totalLockCount),
            pass: totalLockCount >= 0,
        },
        {
            name: 'Persentase Bobot Sum ≈ 100%',
            value: fmtPct(weightSum * 100),
            pass: Math.abs(weightSum * 100 - 100) < 0.1,
        },
        {
            name: 'Kelengkapan Input (Bobot + LCM + PAT)',
            value: r.fahp.CRPass && Object.values(lcmMap).every(l => l.exposure !== null) ? 'Lengkap' : 'Tidak lengkap',
            pass: r.fahp.CRPass && Object.values(lcmMap).every(l => l.exposure !== null),
        },
    ]
    const auditPassCount = auditChecks.filter(a => a.pass).length

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span>Hasil Survey - {survey.respondentName}</span>
                    </div>
                    {isAdmin && (
                        <Link href="/admin" className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                            ← Admin Dashboard
                        </Link>
                    )}
                </div>
            </header>

            <main className="main">
                <div className="card">
                    <h2 className="card-title">📊 Hasil Analisis & Rekomendasi</h2>
                    <p className="card-subtitle">Berdasarkan jawaban Anda, berikut hasil analisis alokasi risiko KPBU SPAM.</p>

                    {/* KPI Grid — 10 cards (BL-04) */}
                    <div className="kpi-grid">
                        <div className={`kpi-card ${r.fahp.CRPass ? 'success' : 'warning'}`}>
                            <div className="kpi-value">{(r.fahp.CR * 100).toFixed(1)}%</div>
                            <div className="kpi-label">CR {r.fahp.CRPass ? '✓ Lolos' : '⚠ Review'}</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{topRisk.code}</div>
                            <div className="kpi-label">Top Risk ({fmtPct(r.fahp.weights[topRIdx])})</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{fmt1(avgExp)}</div>
                            <div className="kpi-label">Rata-rata Keterjadian</div>
                        </div>
                        <div className={`kpi-card ${sharedCount > 3 ? 'warning' : ''}`}>
                            <div className="kpi-value">{sharedCount}</div>
                            <div className="kpi-label">Risiko Shared</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{lcmStats?.dominantPhase ?? '-'}</div>
                            <div className="kpi-label">Fase Dominan</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{fmt2(surveyPAT1)}</div>
                            <div className="kpi-label">Skor PAT Tier-1</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{fmt2(surveyPAT2)}</div>
                            <div className="kpi-label">Skor PAT Tier-2</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value" style={{ fontSize: '0.95rem' }}>{topAlloc.tier1.allocation}</div>
                            <div className="kpi-label">Alokasi T1 ({topRisk.code})</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value" style={{ fontSize: '0.95rem' }}>{topAlloc.tier2.allocation}</div>
                            <div className="kpi-label">Alokasi T2 ({topRisk.code})</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{totalLockCount}</div>
                            <div className="kpi-label">Governance Locks</div>
                        </div>
                    </div>

                    {/* Output Summary Section (BL-05) */}
                    <div className="chart-container">
                        <div className="chart-title">Ringkasan Analisis</div>

                        {/* LCM Exposure Summary */}
                        {lcmStats && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>LCM — Statistik Keterjadian Risiko</p>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {[
                                        { label: 'Rata-rata', value: fmt1(lcmStats.avgExposure) },
                                        { label: 'Maksimum', value: lcmStats.maxExposure ?? '-' },
                                        { label: 'Minimum', value: lcmStats.minExposure ?? '-' },
                                        { label: 'Risiko Tinggi (≥4)', value: lcmStats.highRiskCount },
                                        { label: 'Risiko Rendah (≤2)', value: lcmStats.lowRiskCount },
                                    ].map(item => (
                                        <div key={item.label} style={{ textAlign: 'center', padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: '8px', minWidth: '100px', flex: 1 }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>{item.value}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Phase Distribution */}
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
                                    Distribusi Fase Kritis &mdash; Dominan: <span style={{ color: 'var(--primary)' }}>{lcmStats.dominantPhase ?? '-'}</span>
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {lcmStats.phaseDistribution.map(d => (
                                        <div key={d.phase} style={{
                                            flex: 1, minWidth: '120px', padding: '0.75rem',
                                            background: d.phase === lcmStats.dominantPhase ? 'var(--primary)' : 'var(--bg)',
                                            color: d.phase === lcmStats.dominantPhase ? '#fff' : 'inherit',
                                            borderRadius: '8px', textAlign: 'center'
                                        }}>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{d.count}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{d.phase}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{d.percentage.toFixed(1)}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PAT Overall Summary */}
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>PAT — Skor Per Risiko</p>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="allocation-matrix">
                                <thead>
                                    <tr>
                                        <th>Risiko</th>
                                        <th>PAT1 Score</th>
                                        <th>PAT2 Score</th>
                                        <th>Alokasi T1</th>
                                        <th>Alokasi T2</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {RISKS.map(ri => {
                                        const t1Score = r.pat[ri.code]?.tier1?.overallScore
                                        const t2Score = r.pat[ri.code]?.tier2?.overallScore
                                        const a = r.allocations[ri.code]
                                        const t1c = a.tier1.allocation === 'Publik/PDAM' ? 'alloc-public' : a.tier1.allocation === 'BU/SPV' ? 'alloc-spv' : 'alloc-shared'
                                        const isGovLead = a.tier1.allocation === 'Publik/PDAM'
                                        const t2c = isGovLead ? 'alloc-na' : a.tier2.allocation === 'EPC/O&M' ? 'alloc-epc' : a.tier2.allocation === 'BU/SPV-retain' ? 'alloc-spv' : 'alloc-shared'
                                        return (
                                            <tr key={ri.code}>
                                                <td><strong>{ri.code}</strong> {ri.name}</td>
                                                <td>{fmt2(t1Score)}</td>
                                                <td>{fmt2(t2Score)}</td>
                                                <td className={t1c}>{a.tier1.allocation}</td>
                                                <td className={t2c}>{a.tier2.allocation}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                                        <td>Rata-rata Survey</td>
                                        <td>{fmt2(surveyPAT1)}</td>
                                        <td>{fmt2(surveyPAT2)}</td>
                                        <td colSpan={2} style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.8rem' }}>
                                            berdasarkan risiko tertinggi ({topRisk.code})
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* CALC_FAHP Detail Section — menjawab pertanyaan team "step ini dimana?" */}
                    <div className="chart-container">
                        <div className="chart-title">Detail Perhitungan FAHP</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                            Sesuai CALC_FAHP sheet Excel — Step 2: Geometric Mean → Step 3: Bobot → Step 4: CR Check
                        </p>

                        {/* Step 2 + 3 combined table */}
                        <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                            <table className="allocation-matrix">
                                <thead>
                                    <tr>
                                        <th>Risiko</th>
                                        <th>Step 2: Geometric Mean</th>
                                        <th>Step 3: Bobot (Weight)</th>
                                        <th>Persentase</th>
                                        <th>Rank</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const gmSum = r.fahp.geometricMeans
                                            ? r.fahp.geometricMeans.reduce((a, b) => a + b, 0)
                                            : null
                                        // Rank: urutkan index berdasar weight descending
                                        const ranked = [...r.fahp.weights]
                                            .map((w, i) => ({ i, w }))
                                            .sort((a, b) => b.w - a.w)
                                        const rankMap: number[] = new Array(RISKS.length)
                                        ranked.forEach(({ i }, pos) => { rankMap[i] = pos + 1 })
                                        return RISKS.map((ri, i) => (
                                            <tr key={ri.code} style={rankMap[i] === 1 ? { background: '#f0f9ff' } : {}}>
                                                <td><strong style={{ color: ri.color }}>{ri.code}</strong> {ri.name}</td>
                                                <td style={{ fontFamily: 'monospace' }}>
                                                    {r.fahp.geometricMeans ? r.fahp.geometricMeans[i].toFixed(4) : '-'}
                                                </td>
                                                <td style={{ fontFamily: 'monospace' }}>
                                                    {r.fahp.weights[i].toFixed(4)}
                                                </td>
                                                <td><strong>{fmtPct(r.fahp.weights[i])}</strong></td>
                                                <td style={{ textAlign: 'center', fontWeight: 700 }}>{rankMap[i]}</td>
                                            </tr>
                                        ))
                                    })()}
                                </tbody>
                                <tfoot>
                                    <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 600 }}>
                                        <td>CHECK SUM</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                            {r.fahp.geometricMeans
                                                ? `Σ = ${r.fahp.geometricMeans.reduce((a, b) => a + b, 0).toFixed(4)}`
                                                : '-'}
                                        </td>
                                        <td style={{ fontFamily: 'monospace' }}>
                                            {r.fahp.weights.reduce((a, b) => a + b, 0).toFixed(4)}
                                        </td>
                                        <td style={{ color: r.fahp.weights.reduce((a, b) => a + b, 0) > 0.999 ? 'var(--success)' : 'var(--danger)' }}>
                                            {r.fahp.weights.reduce((a, b) => a + b, 0) > 0.999 ? '✓ Must = 1.0000' : '⚠ Error'}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Step 4: CR Check */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {[
                                { label: 'λmax', value: r.fahp.lambdaMax?.toFixed(4) ?? '-', note: 'rata-rata A×w/w' },
                                { label: 'n', value: '6', note: 'jumlah risiko' },
                                { label: 'CI', value: r.fahp.lambdaMax != null ? (((r.fahp.lambdaMax - 6) / 5)).toFixed(4) : '-', note: '(λmax−n)/(n−1)' },
                                { label: 'RI (n=6)', value: '1.24', note: 'Saaty table' },
                                { label: 'CR', value: (r.fahp.CR).toFixed(4), note: 'CI / RI', highlight: true },
                                { label: 'Status', value: r.fahp.CRPass ? '✓ KONSISTEN' : '⚠ TIDAK KONSISTEN', note: 'threshold < 0.10', pass: r.fahp.CRPass },
                            ].map(item => (
                                <div key={item.label} style={{
                                    flex: 1, minWidth: '100px', padding: '0.75rem',
                                    background: 'pass' in item ? (item.pass ? '#e8f5e9' : '#ffebee') : 'var(--bg)',
                                    borderRadius: '8px', textAlign: 'center',
                                    border: item.highlight ? '2px solid var(--primary)' : 'none'
                                }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>{item.value}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{item.note}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAHP Bar Chart */}
                    <div className="chart-container">
                        <div className="chart-title">Bobot FAHP 6 Risiko</div>
                        <div className="bar-chart">
                            {RISKS.map((ri, i) => (
                                <div key={ri.code} className="bar-item">
                                    <div className="bar-label"><strong>{ri.code}</strong> {ri.name}</div>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: `${r.fahp.weights[i] * 100 * 3}%`, background: ri.color }} />
                                    </div>
                                    <div className="bar-value" style={{ minWidth: '90px', textAlign: 'right' }}>
                                        <strong>{fmtPct(r.fahp.weights[i])}</strong>
                                        {r.fahp.geometricMeans && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                                                GM: {r.fahp.geometricMeans[i].toFixed(4)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LCM Heatmap */}
                    <div className="chart-container">
                        <div className="chart-title">Lifecycle Mapping: Keterjadian & Fase Kritis</div>
                        <div className="heatmap">
                            <div className="heatmap-header"></div>
                            {PHASES.map(p => <div key={p.value} className="heatmap-header">{p.label}</div>)}
                            {RISKS.map(ri => {
                                const l = lcmMap[ri.code]
                                const heatClass = !l?.exposure ? '' : l.exposure <= 2 ? 'heat-low' : l.exposure <= 3 ? 'heat-medium' : l.exposure <= 4 ? 'heat-high' : 'heat-critical'
                                return (
                                    <>
                                        <div key={`${ri.code}-label`} className="heatmap-cell heatmap-risk">
                                            <strong>{ri.code}</strong> {ri.name} ({l?.exposure || '-'})
                                        </div>
                                        {PHASES.map(p => (
                                            <div key={`${ri.code}-${p.value}`} className={`heatmap-cell ${l?.phase === p.label ? heatClass : ''}`}>
                                                {l?.phase === p.label ? '●' : ''}
                                            </div>
                                        ))}
                                    </>
                                )
                            })}
                        </div>
                    </div>

                    {/* Allocation Matrix */}
                    <div className="chart-container">
                        <div className="chart-title">Matriks Alokasi Risiko 2-Tier</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="allocation-matrix">
                                <thead>
                                    <tr>
                                        <th>Risiko</th>
                                        <th>Bobot</th>
                                        <th>Fase</th>
                                        <th>Tier-1</th>
                                        <th>Tier-2</th>
                                        <th>Conf</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {RISKS.map((ri, i) => {
                                        const a = r.allocations[ri.code]
                                        const c = r.confidence[ri.code]
                                        const t1c = a.tier1.allocation === 'Publik/PDAM' ? 'alloc-public' : a.tier1.allocation === 'BU/SPV' ? 'alloc-spv' : 'alloc-shared'
                                        const isGovLead = a.tier1.allocation === 'Publik/PDAM'
                                        const t2c = isGovLead ? 'alloc-na' : a.tier2.allocation === 'EPC/O&M' ? 'alloc-epc' : a.tier2.allocation === 'BU/SPV-retain' ? 'alloc-spv' : 'alloc-shared'
                                        const cc = c.level === 'Tinggi' ? 'confidence-high' : c.level === 'Sedang' ? 'confidence-medium' : 'confidence-low'
                                        return (
                                            <tr key={ri.code}>
                                                <td><strong>{ri.code}</strong> {ri.name}</td>
                                                <td>{fmtPct(r.fahp.weights[i])}</td>
                                                <td>{lcmMap[ri.code]?.phase || '-'}</td>
                                                <td className={t1c}>{a.tier1.allocation}</td>
                                                <td className={t2c}>{a.tier2.allocation}{isGovLead ? '*' : ''}</td>
                                                <td className={cc}>{c.level}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={6} style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'left', paddingTop: '1rem' }}>
                                            * N/A = Tier-2 tidak diterapkan. Untuk risiko dengan Government/PDAM-lead, tidak ada transfer risiko ke EPC/O&M.
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Detail Accordion */}
                    <h3 style={{ margin: '2rem 0 1rem' }}>Detail per Risiko</h3>
                    <div className="accordion">
                        {RISKS.map((ri, i) => {
                            const a = r.allocations[ri.code]
                            const locks = r.governanceLocks[ri.code]
                            const c = r.confidence[ri.code]
                            const isOpen = openAccordions.has(ri.code)
                            const isGovLead = a.tier1.allocation === 'Publik/PDAM'
                            const cc = c.level === 'Tinggi' ? 'confidence-high' : c.level === 'Sedang' ? 'confidence-medium' : 'confidence-low'
                            const t1Score = r.pat[ri.code]?.tier1?.overallScore
                            const t2Score = r.pat[ri.code]?.tier2?.overallScore

                            return (
                                <div key={ri.code} className="accordion-item">
                                    <div className={`accordion-header ${isOpen ? 'active' : ''}`} onClick={() => toggleAccordion(ri.code)}>
                                        <span>
                                            <strong>{ri.code}</strong>: {ri.fullName} — <span className={cc}>Conf: {c.level}</span>
                                        </span>
                                        <svg className="accordion-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                    <div className={`accordion-content ${isOpen ? 'active' : ''}`}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong>Bobot:</strong> {fmtPct(r.fahp.weights[i])} |
                                            {r.fahp.geometricMeans && <><strong> GM:</strong> {r.fahp.geometricMeans[i].toFixed(4)} |</>}
                                            <strong> Keterjadian:</strong> {lcmMap[ri.code]?.exposure || '-'}/5 |
                                            <strong> Fase:</strong> {lcmMap[ri.code]?.phase || '-'} |
                                            <strong> PAT1:</strong> {fmt2(t1Score)} |
                                            <strong> PAT2:</strong> {fmt2(t2Score)}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ padding: '1rem', background: isGovLead ? '#fff3e0' : '#e3f2fd', borderRadius: '8px', border: isGovLead ? '2px solid #ff9800' : 'none' }}>
                                                <strong style={{ color: isGovLead ? '#e65100' : '#1565c0' }}>Tier-1: {a.tier1.allocation}</strong>
                                                {isGovLead && <span style={{ marginLeft: '0.5rem', padding: '2px 8px', background: '#ff9800', color: '#fff', borderRadius: '4px', fontSize: '0.7rem' }}>RISIKO DITAHAN</span>}
                                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{a.tier1.reason}</p>
                                            </div>
                                            <div style={{ padding: '1rem', background: isGovLead ? '#f5f5f5' : '#f3e5f5', borderRadius: '8px' }}>
                                                <strong style={{ color: isGovLead ? '#757575' : '#7b1fa2' }}>Tier-2: {a.tier2.allocation}</strong>
                                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{a.tier2.reason}</p>
                                            </div>
                                        </div>

                                        {isGovLead && a.tier2.mitigationControls && a.tier2.mitigationControls.length > 0 && (
                                            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                                                <strong style={{ color: '#2e7d32' }}>🛠️ Mitigation Controls untuk EPC/O&M:</strong>
                                                <ul style={{ margin: '0.5rem 0 0 1rem', fontSize: '0.85rem' }}>
                                                    {a.tier2.mitigationControls.map((m, idx) => <li key={idx} style={{ margin: '0.25rem 0' }}>{m}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong>{isGovLead ? '⚠️ Governance Locks (Risiko Ditahan Publik):' : '🔒 Governance Locks:'}</strong>
                                            <ul className="locks-list" style={{ marginTop: '0.5rem' }}>
                                                {locks.map((l, idx) => <li key={idx}>{l}</li>)}
                                            </ul>
                                        </div>

                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                            <strong>Confidence:</strong> {c.level} — {c.reason}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* BL-07: AUDIT_Checks — 13 Integrity Tests */}
                    <div className="section-divider" />
                    <div>
                        <h3 className="section-title">
                            🔍 Audit Kelengkapan & Konsistensi
                            <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', fontWeight: 'normal', color: auditPassCount === 13 ? '#059669' : '#d97706' }}>
                                {auditPassCount}/13 lulus
                            </span>
                        </h3>
                        <table className="data-table" style={{ fontSize: '0.82rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '60%' }}>Pemeriksaan</th>
                                    <th style={{ textAlign: 'center' }}>Nilai</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditChecks.map((c, i) => (
                                    <tr key={i}>
                                        <td>{c.name}</td>
                                        <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{c.value}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: c.pass ? '#059669' : '#dc2626' }}>
                                            {c.pass ? '✓ LULUS' : '✗ GAGAL'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Export Buttons */}
                    <div className="export-buttons">
                        <button className="btn btn-primary" onClick={downloadJSON}>
                            📥 Unduh JSON
                        </button>
                        <button className="btn btn-secondary" onClick={downloadCSV}>
                            📄 Unduh CSV
                        </button>
                        <button className="btn btn-outline" onClick={() => window.print()}>
                            🖨️ Cetak
                        </button>
                    </div>

                    <div className="btn-group">
                        {isAdmin ? (
                            <Link href="/admin" className="btn btn-secondary">← Kembali ke Admin Dashboard</Link>
                        ) : (
                            <Link href="/" className="btn btn-secondary">🏠 Kembali ke Beranda</Link>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}
