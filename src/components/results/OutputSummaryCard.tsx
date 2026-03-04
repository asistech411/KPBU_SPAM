/**
 * OutputSummaryCard.tsx — OUTPUT Summary Card
 *
 * Menampilkan ringkasan tiga bagian:
 * 1. LCM Exposure Statistics (avg, max, min, highCount, lowCount)
 * 2. Phase Distribution (bar per fase, highlight fase dominan)
 * 3. PAT Score per Risiko table (PAT1, PAT2, Alokasi T1, T2)
 *
 * Sesuai OUTPUT_Summary sheet Excel (BL-05). lcmStats bisa null
 * jika data lama (format sebelum BL-01 diimplementasi).
 */
import { RISKS } from '@/lib/constants'
import { fmt1, fmt2 } from '@/lib/utils'
import type { LCMStats, Results } from '@/lib/types'

type Props = {
    lcmStats: LCMStats | null
    pat: Results['pat']
    allocations: Results['allocations']
    surveyPAT1: number | null
    surveyPAT2: number | null
    topRiskCode: string
}

export default function OutputSummaryCard({
    lcmStats, pat, allocations, surveyPAT1, surveyPAT2, topRiskCode
}: Props) {
    return (
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

            {/* PAT Overall Summary table */}
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
                            const t1Score = pat[ri.code]?.tier1?.overallScore
                            const t2Score = pat[ri.code]?.tier2?.overallScore
                            const a = allocations[ri.code]
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
                                berdasarkan risiko tertinggi ({topRiskCode})
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
