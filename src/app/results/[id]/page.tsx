'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { RISKS } from '@/lib/constants'
import type { Survey, AuditCheck } from '@/lib/types'
import { getLCMMapping, getLCMStats, fmt1, fmt2, fmtPct, strictLockCount } from '@/lib/utils'
import KPIGrid from '@/components/results/KPIGrid'
import AuditChecksTable from '@/components/results/AuditChecksTable'
import ExportButtons from '@/components/results/ExportButtons'
import FAHPDetailTable from '@/components/results/FAHPDetailTable'
import FAHPBarChart from '@/components/results/FAHPBarChart'
import LCMHeatmap from '@/components/results/LCMHeatmap'
import AllocationMatrix from '@/components/results/AllocationMatrix'
import RiskAccordion from '@/components/results/RiskAccordion'
import OutputSummaryCard from '@/components/results/OutputSummaryCard'
import { BarChart2, Home, ChevronLeft, Layers } from '@/lib/icons'

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
                            <ChevronLeft size={16} />
                            {isAdmin ? 'Kembali ke Admin Dashboard' : 'Kembali ke Beranda'}
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
    // BL-06: Strict 5-type lock count sesuai Excel CALC_Allocation (dari utils.ts)
    const totalLockCount = RISKS.reduce((sum, ri) => sum + strictLockCount(ri.code, r.pat, r.allocations), 0)


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
    const auditChecks: AuditCheck[] = [
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
            value: Object.values(lcmMap).every(l => l.phase === null || (['1', '2', '3', '4'].includes(l.phase))) ? 'Semua valid' : 'Ada di luar range',
            pass: Object.values(lcmMap).every(l => l.phase === null || (['1', '2', '3', '4'].includes(l.phase))),
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
                        <Layers width={32} height={32} />
                        <span>Hasil Survey - {survey.respondentName}</span>
                    </div>
                    {isAdmin && (
                        <Link href="/admin" className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                            <ChevronLeft size={16} /> Admin Dashboard
                        </Link>
                    )}
                </div>
            </header>

            <main className="main">
                <div className="card">
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={22} /> Hasil Analisis &amp; Rekomendasi
                    </h2>
                    <p className="card-subtitle">Berdasarkan jawaban Anda, berikut hasil analisis alokasi risiko KPBU SPAM.</p>

                    {/* KPI Grid — 10 cards (BL-04) */}
                    <KPIGrid
                        crPercent={`${(r.fahp.CR * 100).toFixed(1)}%`}
                        crPass={r.fahp.CRPass}
                        topRiskCode={topRisk.code}
                        topRiskWeightLabel={fmtPct(r.fahp.weights[topRIdx])}
                        avgExposureLabel={fmt1(avgExp)}
                        sharedCount={sharedCount}
                        dominantPhase={lcmStats?.dominantPhase ?? '-'}
                        surveyPAT1Label={fmt2(surveyPAT1)}
                        surveyPAT2Label={fmt2(surveyPAT2)}
                        topTier1Allocation={topAlloc.tier1.allocation}
                        topTier2Allocation={topAlloc.tier2.allocation}
                        totalLockCount={totalLockCount}
                    />

                    {/* Output Summary Section (BL-05) */}
                    <OutputSummaryCard
                        lcmStats={lcmStats}
                        pat={r.pat}
                        allocations={r.allocations}
                        surveyPAT1={surveyPAT1}
                        surveyPAT2={surveyPAT2}
                        topRiskCode={topRisk.code}
                    />

                    <FAHPDetailTable fahp={r.fahp} />

                    <FAHPBarChart fahp={r.fahp} />

                    <LCMHeatmap lcmMap={lcmMap} />

                    <AllocationMatrix
                        fahpWeights={r.fahp.weights}
                        allocations={r.allocations}
                        confidence={r.confidence}
                        lcmMap={lcmMap}
                    />

                    <RiskAccordion
                        fahpWeights={r.fahp.weights}
                        fahpGeoMeans={r.fahp.geometricMeans}
                        pat={r.pat}
                        allocations={r.allocations}
                        governanceLocks={r.governanceLocks}
                        confidence={r.confidence}
                        lcmMap={lcmMap}
                        openAccordions={openAccordions}
                        toggleAccordion={toggleAccordion}
                    />

                    {/* BL-07: AUDIT_Checks — 13 Integrity Tests */}
                    <div className="section-divider" />
                    <AuditChecksTable checks={auditChecks} passCount={auditPassCount} />

                    {/* Export Buttons */}
                    <ExportButtons
                        onDownloadJSON={downloadJSON}
                        onDownloadCSV={downloadCSV}
                        onPrint={() => window.print()}
                    />

                    <div className="btn-group">
                        {isAdmin ? (
                            <Link href="/admin" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ChevronLeft size={16} /> Kembali ke Admin Dashboard
                            </Link>
                        ) : (
                            <Link href="/" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Home size={16} /> Kembali ke Beranda
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}
