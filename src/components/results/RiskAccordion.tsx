/**
 * RiskAccordion.tsx — Detail Accordion per Risiko
 *
 * Menampilkan detail expandable per risiko:
 * - Ringkasan: Bobot, GM, Keterjadian/5, Fase, PAT1, PAT2
 * - Tier-1 & Tier-2 allocation cards (dengan badge RISIKO DITAHAN untuk gov-lead)
 * - Mitigation Controls (EPC/O&M)
 * - Governance Locks (5-type dari Excel CALC_Allocation)
 * - Confidence level & alasan
 */
import { RISKS } from '@/lib/constants'
import { fmtPct, fmt2 } from '@/lib/utils'
import { useLang } from '@/lib/lang-context'
import { Lock, AlertTriangle, Wrench } from '@/lib/icons'
import type { Results, LCMMapping } from '@/lib/types'

type Props = {
    fahpWeights: number[]
    fahpGeoMeans?: number[]
    pat: Results['pat']
    allocations: Results['allocations']
    governanceLocks: Results['governanceLocks']
    confidence: Results['confidence']
    lcmMap: LCMMapping
    openAccordions: Set<string>
    toggleAccordion: (code: string) => void
}

export default function RiskAccordion({
    fahpWeights,
    fahpGeoMeans,
    pat,
    allocations,
    governanceLocks,
    confidence,
    lcmMap,
    openAccordions,
    toggleAccordion,
}: Props) {
    const { t } = useLang()
    return (
        <>
            <h3 style={{ margin: '2rem 0 1rem' }}>{t.riskDetailTitle}</h3>
            <div className="accordion">
                {RISKS.map((ri, i) => {
                    const a = allocations[ri.code]
                    const locks = governanceLocks[ri.code]
                    const c = confidence[ri.code]
                    const isOpen = openAccordions.has(ri.code)
                    const isGovLead = a.tier1.allocation === 'Publik/PDAM'
                    const cc = c.level === 'Tinggi' ? 'confidence-high' : c.level === 'Sedang' ? 'confidence-medium' : 'confidence-low'

                    // PAT overall scores per risiko (grand mean 6 konstruk T1 / 4 konstruk T2)
                    const t1Score = pat[ri.code]?.tier1?.overallScore
                    const t2Score = pat[ri.code]?.tier2?.overallScore

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
                                {/* Ringkasan metrik per risiko */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>{t.riskWeightLabel}:</strong> {fmtPct(fahpWeights[i])} |
                                    {fahpGeoMeans && <><strong> GM:</strong> {fahpGeoMeans[i].toFixed(4)} |</>}
                                    <strong> {t.riskExposureLabel}:</strong> {lcmMap[ri.code]?.exposure || '-'}/5 |
                                    <strong> {t.riskPhaseLabel}:</strong> {lcmMap[ri.code]?.phase || '-'} |
                                    <strong> PAT1:</strong> {fmt2(t1Score)} |
                                    <strong> PAT2:</strong> {fmt2(t2Score)}
                                </div>

                                {/* Tier-1 & Tier-2 allocation cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '1rem', background: isGovLead ? '#fff3e0' : '#e3f2fd', borderRadius: '8px', border: isGovLead ? '2px solid #ff9800' : 'none' }}>
                                        <strong style={{ color: isGovLead ? '#e65100' : '#1565c0' }}>Tier-1: {a.tier1.allocation}</strong>
                                        {isGovLead && <span style={{ marginLeft: '0.5rem', padding: '2px 8px', background: '#ff9800', color: '#fff', borderRadius: '4px', fontSize: '0.7rem' }}>{t.riskRetained}</span>}
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{a.tier1.reason}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: isGovLead ? '#f5f5f5' : '#f3e5f5', borderRadius: '8px' }}>
                                        <strong style={{ color: isGovLead ? '#757575' : '#7b1fa2' }}>Tier-2: {a.tier2.allocation}</strong>
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{a.tier2.reason}</p>
                                    </div>
                                </div>

                                {/* Mitigation Controls (hanya untuk gov-lead) */}
                                {isGovLead && a.tier2.mitigationControls && a.tier2.mitigationControls.length > 0 && (
                                    <div style={{ marginBottom: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                                        <strong style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Wrench size={15} /> {t.mitigationTitle}
                                        </strong>
                                        <ul style={{ margin: '0.5rem 0 0 1rem', fontSize: '0.85rem' }}>
                                            {a.tier2.mitigationControls.map((m, idx) => <li key={idx} style={{ margin: '0.25rem 0' }}>{m}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Governance Locks — 5 tipe dari Excel CALC_Allocation */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isGovLead
                                            ? <><AlertTriangle size={15} color="#e65100" /> {t.govLocksPublic}</>
                                            : <><Lock size={15} /> {t.govLocksLabel}</>}
                                    </strong>
                                    <ul className="locks-list" style={{ marginTop: '0.5rem' }}>
                                        {locks.map((l, idx) => <li key={idx}>{l}</li>)}
                                    </ul>
                                </div>

                                {/* Confidence */}
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                    <strong>{t.confidenceLabel}:</strong> {c.level} — {c.reason}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
