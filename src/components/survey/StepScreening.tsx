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

type Props = {
    data: Pick<SurveyState, 'screening01' | 'role' | 'experience' | 'phases' | 'dualRole'>
    isValid: boolean
    onUpdateField: <K extends 'screening01' | 'role' | 'experience' | 'dualRole'>(f: K, v: SurveyState[K]) => void
    onTogglePhase: (phase: string) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepScreening({ data, isValid, onUpdateField, onTogglePhase, onNext, onPrev }: Props) {
    return (
        <div className="card">
            <h2 className="card-title">👥 Screening Responden</h2>
            <p className="card-subtitle">Informasi latar belakang dan pengalaman Anda.</p>

            <div className="form-group">
                <label className="form-label">SCR-01. Apakah Anda pernah terlibat dalam proyek KPBU SPAM atau PPP sejenis? <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="radio-group horizontal">
                    {['Ya', 'Tidak'].map(v => (
                        <label key={v} className={`radio-label ${data.screening01 === v ? 'selected' : ''}`}>
                            <input type="radio" name="scr01" value={v} checked={data.screening01 === v} onChange={() => onUpdateField('screening01', v)} />
                            <span>{v}</span>
                        </label>
                    ))}
                </div>
                {data.screening01 === 'Tidak' && (
                    <div className="alert alert-danger">Maaf, survey ini ditujukan untuk responden yang pernah terlibat dalam proyek KPBU SPAM.</div>
                )}
            </div>

            {data.screening01 === 'Ya' && (
                <>
                    <div className="form-group">
                        <label className="form-label">SCR-02. Peran utama Anda: <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select className="form-select" value={data.role} onChange={e => onUpdateField('role', e.target.value)}>
                            <option value="">-- Pilih peran --</option>
                            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">SCR-03. Lama pengalaman: <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div className="radio-group horizontal">
                            {EXPERIENCE_OPTIONS.map(o => (
                                <label key={o.value} className={`radio-label ${data.experience === o.value ? 'selected' : ''}`}>
                                    <input type="radio" name="scr03" value={o.value} checked={data.experience === o.value} onChange={() => onUpdateField('experience', o.value)} />
                                    <span>{o.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">SCR-04. Fase KPBU yang pernah ditangani (boleh &gt;1): <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div className="checkbox-group horizontal">
                            {PHASES.map(p => (
                                <label key={p.value} className={`checkbox-label ${data.phases.includes(p.label) ? 'selected' : ''}`}>
                                    <input type="checkbox" checked={data.phases.includes(p.label)} onChange={() => onTogglePhase(p.label)} />
                                    <span>{p.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">SCR-05. Apakah Anda memiliki dua peran/afiliasi yang berpotensi konflik?</label>
                        <div className="radio-group horizontal">
                            {['Tidak', 'Ya'].map(v => (
                                <label key={v} className={`radio-label ${(data.dualRole ? 'Ya' : 'Tidak') === v ? 'selected' : ''}`}>
                                    <input type="radio" name="scr05" value={v} checked={(data.dualRole ? 'Ya' : 'Tidak') === v} onChange={() => onUpdateField('dualRole', v === 'Ya')} />
                                    <span>{v}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev}>← Kembali</button>
                <button className="btn btn-primary" onClick={onNext} disabled={!isValid}>Lanjutkan →</button>
            </div>
            {!isValid && data.screening01 === 'Ya' && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                    Mohon lengkapi semua field yang bertanda * sebelum melanjutkan.
                </div>
            )}
        </div>
    )
}
