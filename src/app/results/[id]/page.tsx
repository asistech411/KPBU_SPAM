'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { RISKS, PHASES } from '@/lib/constants'

interface Results {
    fahp: {
        weights: number[]
        CR: number
        CRPass: boolean
    }
    lcm: Record<string, { exposure: number | null; phase: string | null }>
    pat: {
        tier1: Record<string, any>
        tier2: Record<string, any>
    }
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
        const header = ['Risk', 'Weight', 'Exposure', 'Phase', 'Tier1', 'Tier2', 'Confidence']
        const rows = RISKS.map((ri, i) => {
            const a = r.allocations[ri.code]
            return [
                ri.code,
                (r.fahp.weights[i] * 100).toFixed(2),
                r.lcm[ri.code].exposure || '',
                r.lcm[ri.code].phase || '',
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
    const shared = RISKS.filter(ri =>
        r.allocations[ri.code].tier1.allocation === 'Shared' ||
        r.allocations[ri.code].tier2.allocation === 'Shared'
    ).length
    const avgExp = Object.values(r.lcm).filter(l => l.exposure !== null).reduce((s, l) => s + (l.exposure || 0), 0) / 6
    const topRIdx = r.fahp.weights.reduce((m, w, i) => w > r.fahp.weights[m] ? i : m, 0)

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

                    {/* KPI Grid */}
                    <div className="kpi-grid">
                        <div className={`kpi-card ${r.fahp.CRPass ? 'success' : 'warning'}`}>
                            <div className="kpi-value">{(r.fahp.CR * 100).toFixed(1)}%</div>
                            <div className="kpi-label">CR {r.fahp.CRPass ? '✓ Lolos' : '⚠ Review'}</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{RISKS[topRIdx].code}</div>
                            <div className="kpi-label">Top Risk ({(r.fahp.weights[topRIdx] * 100).toFixed(1)}%)</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-value">{avgExp.toFixed(1)}</div>
                            <div className="kpi-label">Rata-rata Keterjadian</div>
                        </div>
                        <div className={`kpi-card ${shared > 3 ? 'warning' : ''}`}>
                            <div className="kpi-value">{shared}</div>
                            <div className="kpi-label">Risiko Shared</div>
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
                                    <div className="bar-value">{(r.fahp.weights[i] * 100).toFixed(1)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LCM Heatmap */}
                    <div className="chart-container">
                        <div className="chart-title">Lifecycle Mapping: Keterjadian & Fase Kritis</div>
                        <div className="heatmap">
                            <div className="heatmap-header"></div>
                            {PHASES.map(p => <div key={p} className="heatmap-header">{p}</div>)}
                            {RISKS.map(ri => {
                                const l = r.lcm[ri.code]
                                const heatClass = !l.exposure ? '' : l.exposure <= 2 ? 'heat-low' : l.exposure <= 3 ? 'heat-medium' : l.exposure <= 4 ? 'heat-high' : 'heat-critical'
                                return (
                                    <>
                                        <div key={`${ri.code}-label`} className="heatmap-cell heatmap-risk">
                                            <strong>{ri.code}</strong> {ri.name} ({l.exposure || '-'})
                                        </div>
                                        {PHASES.map(p => (
                                            <div key={`${ri.code}-${p}`} className={`heatmap-cell ${l.phase === p ? heatClass : ''}`}>
                                                {l.phase === p ? '●' : ''}
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
                                                <td>{(r.fahp.weights[i] * 100).toFixed(1)}%</td>
                                                <td>{r.lcm[ri.code].phase || '-'}</td>
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
                                            <strong>Bobot:</strong> {(r.fahp.weights[i] * 100).toFixed(1)}% |
                                            <strong> Keterjadian:</strong> {r.lcm[ri.code].exposure || '-'}/5 |
                                            <strong> Fase:</strong> {r.lcm[ri.code].phase || '-'}
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
