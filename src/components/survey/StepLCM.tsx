/**
 * StepLCM.tsx — Step 5: Lifecycle Mapping
 *
 * LCM-01: Skor Keterjadian 1–5 per risiko (radio table)
 * LCM-02: Fase paling kritis per risiko (radio table × fase)
 *
 * Data fase disimpan dengan p.value (number/string ID),
 * lalu di-resolve ke label saat rendering hasil.
 * Backward-compat: checked if value === p.value OR === p.label
 */
import { RISKS, PHASES } from '@/lib/constants'
import { AlertTriangle, Activity, ChevronLeft } from '@/lib/icons'
import type { SurveyState } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

type Props = {
    lcmExposure: SurveyState['lcmExposure']
    lcmPhaseCritical: SurveyState['lcmPhaseCritical']
    lcmExpCount: number
    lcmPhaseCount: number
    isLcmValid: boolean
    onUpdateLcmExposure: (code: string, value: number) => void
    onUpdateLcmPhase: (code: string, value: string | number) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepLCM({
    lcmExposure, lcmPhaseCritical, lcmExpCount, lcmPhaseCount,
    isLcmValid, onUpdateLcmExposure, onUpdateLcmPhase, onNext, onPrev,
}: Props) {
    const { t } = useLang()
    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} /> {t.lcmTitle}</h2>
            <p className="card-subtitle">{t.lcmSubtitle}</p>

            <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1.1rem' }}>{t.lcm01Title}</h3>
            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                <strong>Skala Keterjadian:</strong><br />
                <span style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    {t.lcmExposureHint}
                </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="likert-grid">
                    <thead>
                        <tr><th>Risiko</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
                    </thead>
                    <tbody>
                        {RISKS.map(r => (
                            <tr key={r.code}>
                                <td><strong>{r.code}</strong> {r.name}</td>
                                {[1, 2, 3, 4, 5].map(v => (
                                    <td key={v}>
                                        <input type="radio" name={`lcm01_${r.code}`} checked={lcmExposure[r.code] === v} onChange={() => onUpdateLcmExposure(r.code, v)} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.1rem' }}>{t.lcm02Title}</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="likert-grid">
                    <thead>
                        <tr><th>Risiko</th>{PHASES.map(p => <th key={p.value}>{t.phases[p.label] ?? p.label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {RISKS.map(r => (
                            <tr key={r.code}>
                                <td><strong>{r.code}</strong> {r.name}</td>
                                {PHASES.map(p => (
                                    <td key={p.value}>
                                        <input
                                            type="radio"
                                            name={`lcm02_${r.code}`}
                                            checked={lcmPhaseCritical[r.code] === p.value || lcmPhaseCritical[r.code] === p.label}
                                            onChange={() => onUpdateLcmPhase(r.code, p.value)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={16} /> {t.back}</button>
                <button className="btn btn-primary" onClick={onNext} disabled={!isLcmValid}>{t.next} →</button>
            </div>
            {!isLcmValid && (
                <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} /> {t.fahpWarningTitle}
                    </strong><br />
                    Keterjadian: <strong>{lcmExpCount}</strong>/6 | Fase Kritis: <strong>{lcmPhaseCount}</strong>/6<br />
                    {t.lcmWarning}
                </div>
            )}
        </div>
    )
}
