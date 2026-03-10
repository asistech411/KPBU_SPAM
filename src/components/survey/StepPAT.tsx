/**
 * StepPAT.tsx — Shared PAT Likert Table Component
 *
 * Dipakai untuk PAT Tier-1 (12 item, step 6) dan PAT Tier-2 (8 item, step 7).
 * Tab per risiko (R1–R6) dengan highlight completed.
 * Kolom: Pernyataan | 1 | 2 | 3 | 4 | 5 | TT
 *
 * reverse items ditandai * pada Tier-1 (Externality, sesuai CALC_PAT Excel).
 */
import { RISKS } from '@/lib/constants'
import { ClipboardList, Wrench, ChevronLeft } from '@/lib/icons'
import type { SurveyState } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

type PATItem = {
    code: string
    text: string
    reverse?: boolean
}

type Props = {
    tier: 1 | 2
    items: ReadonlyArray<PATItem>
    patData: SurveyState['pat1Data'] | SurveyState['pat2Data']
    activeTab: string
    onTabChange: (code: string) => void
    onUpdate: (riskCode: string, itemCode: string, value: number | 'TT') => void
    onNext: () => void
    onPrev: () => void
    nextLabel?: string
}

export default function StepPAT({ tier, items, patData, activeTab, onTabChange, onUpdate, onNext, onPrev, nextLabel }: Props) {
    const { t, lang } = useLang()
    const tierBadge = tier === 1 ? 'tier1' : 'tier2'
    const itemCount = items.length
    const btnNextLabel = nextLabel ?? `${t.next} →`

    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{tier === 1 ? <ClipboardList size={20} /> : <Wrench size={20} />} {t.patTitle(tier)}</h2>
            <p className="card-subtitle">{t.patSubtitle(tier)}</p>
            <div className="alert alert-info">
                <span className={`tier-badge ${tierBadge}`}>Tier-{tier}</span> <strong>{itemCount} {t.patItemPerRisk}</strong> — {t.patScaleHint(tier)}
            </div>

            <div className="tab-container">
                <div className="tab-nav">
                    {RISKS.map(r => {
                        const filled = items.filter(i => (patData as Record<string, Record<string, number | 'TT'>>)[r.code]?.[i.code] !== undefined).length
                        const completed = filled === itemCount
                        return (
                            <button key={r.code} className={`tab-btn ${activeTab === r.code ? 'active' : ''} ${completed ? 'completed' : ''}`} onClick={() => onTabChange(r.code)}>
                                {r.code}
                            </button>
                        )
                    })}
                </div>
                {RISKS.map(r => (
                    <div key={r.code} className={`tab-content ${activeTab === r.code ? 'active' : ''}`}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{r.code}: {r.fullName}</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="likert-grid">
                                <thead>
                                    <tr><th style={{ width: '40%' }}>{t.patStatementCol}</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>{t.patDkCol}</th></tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.code}>
                                            <td style={{ textAlign: 'left', fontWeight: 'normal', fontSize: '0.85rem' }}>
                                                <strong>{item.code}</strong>{'reverse' in item && item.reverse ? '*' : ''}: {lang === 'en' && 'textEN' in item ? (item.textEN as string) : item.text}
                                            </td>
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <td key={n}>
                                                    <input
                                                        type="radio"
                                                        name={`pat${tier}_${r.code}_${item.code}`}
                                                        checked={(patData as Record<string, Record<string, number | 'TT'>>)[r.code]?.[item.code] === n}
                                                        onChange={() => onUpdate(r.code, item.code, n)}
                                                    />
                                                </td>
                                            ))}
                                            <td>
                                                <input
                                                    type="radio"
                                                    name={`pat${tier}_${r.code}_${item.code}`}
                                                    checked={(patData as Record<string, Record<string, number | 'TT'>>)[r.code]?.[item.code] === 'TT'}
                                                    onChange={() => onUpdate(r.code, item.code, 'TT')}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={16} /> {t.back}</button>
                <button className="btn btn-primary" onClick={onNext}>{btnNextLabel}</button>
            </div>
        </div>
    )
}
