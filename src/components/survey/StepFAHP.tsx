/**
 * StepFAHP.tsx — Step 4: FAHP Perbandingan Berpasangan
 *
 * Responden membandingkan tingkat kepentingan antar 6 risiko.
 * 15 pair combinations (C(6,2)), diisi via dropdown skala FAHP.
 *
 * Sidebar definisi risiko ditampilkan di kiri (hanya pada step ini).
 * Completeness bar menunjukkan {fahpCount}/15 sudah diisi.
 * Warning jika belum lengkap — CR tidak bisa dihitung.
 */
import { RISKS, FAHP_SCALE } from '@/lib/constants'
import { BarChart2, AlertTriangle, Info, ChevronLeft } from '@/lib/icons'
import type { SurveyState } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

type FAHPPair = { r1: typeof RISKS[number]; r2: typeof RISKS[number] }

type Props = {
    fahpPairwise: SurveyState['fahpPairwise']
    fahpPairs: FAHPPair[]
    fahpCount: number
    isFahpValid: boolean
    onUpdateFahp: (pair: string, value: string) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepFAHP({ fahpPairwise, fahpPairs, fahpCount, isFahpValid, onUpdateFahp, onNext, onPrev }: Props) {
    const { t, lang } = useLang()
    return (
        <>
            <div className="risk-sidebar">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={16} /> {t.riskDefTitle}
                </h3>
                {RISKS.map(r => (
                    <div key={r.code} className="risk-item">
                        <strong>{r.code} {r.name}</strong>
                        {t.riskDesc[r.code as keyof typeof t.riskDesc]}
                    </div>
                ))}
            </div>
            <div className="card">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 size={20} /> {t.fahpTitle}
                </h2>
                <p className="card-subtitle">{t.fahpSubtitle}</p>
                <div className="alert alert-info"><strong>Skala:</strong> {t.fahpScaleHint}</div>
                <div className={`completeness ${fahpCount === 15 ? 'complete' : 'incomplete'}`}>
                    <span>{t.fahpFilled(fahpCount)}</span>
                </div>
                <div className="fahp-grid">
                    {fahpPairs.map(p => {
                        const k = `${p.r1.code}_${p.r2.code}`
                        return (
                            <div key={k} className="fahp-pair">
                                <div className="fahp-risk left">{p.r1.code}<br /><small>{p.r1.name}</small></div>
                                <select className="form-select fahp-select" value={fahpPairwise[k] || ''} onChange={e => onUpdateFahp(k, e.target.value)}>
                                    <option value="">{t.selectPlaceholder}</option>
                                    {FAHP_SCALE.map(item => {
                                        const label = lang === 'en' ? item.labelEN : item.labelID;
                                        return (
                                            <option key={item.code} value={item.crisp}>
                                                {item.code.startsWith('1/') ? p.r2.code : p.r1.code} {label.replace(/ Penting| Important/gi, '')} ({item.code})
                                            </option>
                                        )
                                    })}
                                </select>
                                <div className="fahp-risk right">{p.r2.code}<br /><small>{p.r2.name}</small></div>
                            </div>
                        )
                    })}
                </div>
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ChevronLeft size={16} /> {t.back}
                    </button>
                    <button className="btn btn-primary" onClick={onNext} disabled={!isFahpValid}>{t.next} →</button>
                </div>
                {!isFahpValid && (
                    <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={14} /> {t.fahpWarningTitle}
                        </strong><br />
                        {t.fahpWarningBody}
                    </div>
                )}
            </div>
        </>
    )
}
