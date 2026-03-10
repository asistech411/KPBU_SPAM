/**
 * StepScreening.tsx — Step 2: Screening Responden
 *
 * Pertanyaan latar belakang: SCR-01 s/d SCR-05.
 * SCR-01: Ya/Tidak → jika Tidak, ditolak
 * SCR-02: Peran utama (dropdown)
 * SCR-03: Lama pengalaman (radio)
 * SCR-04: Fase yang ditangani (multi-checkbox)
 * SCR-05: Dual-role conflict (radio)
 */
import { PHASES, ROLE_OPTIONS, EXPERIENCE_OPTIONS } from '@/lib/constants'
import type { SurveyState } from '@/lib/types'
import { Users, ChevronLeft } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

type Props = {
    data: Pick<SurveyState, 'screening01' | 'role' | 'experience' | 'phases' | 'dualRole'>
    isValid: boolean
    onUpdateField: <K extends 'screening01' | 'role' | 'experience' | 'dualRole'>(f: K, v: SurveyState[K]) => void
    onTogglePhase: (phase: string) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepScreening({ data, isValid, onUpdateField, onTogglePhase, onNext, onPrev }: Props) {
    const { t, lang } = useLang()
    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> {t.screeningTitle}
            </h2>
            <p className="card-subtitle">{t.screeningSubtitle}</p>

            <div className="form-group">
                <label className="form-label">{t.scr01} <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="radio-group horizontal">
                    {[t.yes, t.no].map(v => (
                        <label key={v} className={`radio-label ${data.screening01 === (v === t.yes ? 'Ya' : 'Tidak') ? 'selected' : ''}`}>
                            <input type="radio" name="scr01" value={v} checked={data.screening01 === (v === t.yes ? 'Ya' : 'Tidak')} onChange={() => onUpdateField('screening01', v === t.yes ? 'Ya' : 'Tidak')} />
                            <span>{v}</span>
                        </label>
                    ))}
                </div>
                {data.screening01 === 'Tidak' && (
                    <div className="alert alert-danger">{t.scr01No}</div>
                )}
            </div>

            {data.screening01 === 'Ya' && (
                <>
                    <div className="form-group">
                        <label className="form-label">{t.scr02} <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select className="form-select" value={data.role} onChange={e => onUpdateField('role', e.target.value)}>
                            <option value="">-- {t.selectPlaceholder} --</option>
                            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{t.roles[o.value] ?? o.label}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t.scr03} <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div className="radio-group horizontal">
                            {EXPERIENCE_OPTIONS.map(o => (
                                <label key={o.value} className={`radio-label ${data.experience === o.value ? 'selected' : ''}`}>
                                    <input type="radio" name="scr03" value={o.value} checked={data.experience === o.value} onChange={() => onUpdateField('experience', o.value)} />
                                    <span>{t.experience[o.value] ?? o.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t.scr04} <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div className="checkbox-group horizontal">
                            {PHASES.map(p => (
                                <label key={p.value} className={`checkbox-label ${data.phases.includes(p.label) ? 'selected' : ''}`}>
                                    <input type="checkbox" checked={data.phases.includes(p.label)} onChange={() => onTogglePhase(p.label)} />
                                    <span>{t.phases[p.label] ?? p.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t.scr05}</label>
                        <div className="radio-group horizontal">
                            {([t.no, t.yes] as const).map(v => (
                                <label key={v} className={`radio-label ${(data.dualRole ? t.yes : t.no) === v ? 'selected' : ''}`}>
                                    <input type="radio" name="scr05" value={v} checked={(data.dualRole ? t.yes : t.no) === v} onChange={() => onUpdateField('dualRole', v === t.yes)} />
                                    <span>{v}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronLeft size={16} /> {t.back}
                </button>
                <button className="btn btn-primary" onClick={onNext} disabled={!isValid}>{t.next} →</button>
            </div>
            {!isValid && data.screening01 === 'Ya' && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                    {lang === 'en' ? 'Please complete all required fields (*) before continuing.' : 'Mohon lengkapi semua field yang bertanda * sebelum melanjutkan.'}
                </div>
            )}
        </div>
    )
}
