/**
 * StepProjectRef.tsx — Step 3: Proyek Referensi Utama
 *
 * Responden memilih 1 proyek yang paling dipahami.
 * PR-01: Tipe proyek (radio)
 * PR-02: Lokasi (opsional, text)
 * PR-03: Skema pembayaran (radio)
 * PR-04: Status proyek (dropdown)
 * PR-05: Fase dominan pengalaman (dropdown)
 */
import { PHASES, PROJECT_STATUS_OPTIONS } from '@/lib/constants'
import type { SurveyState } from '@/lib/types'
import { FileText, ChevronLeft } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

type Props = {
    data: Pick<SurveyState, 'projectType' | 'projectLocation' | 'projectPayment' | 'projectStatus' | 'projectPhase'>
    isValid: boolean
    onUpdateField: <K extends 'projectType' | 'projectLocation' | 'projectPayment' | 'projectStatus' | 'projectPhase'>(f: K, v: string) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepProjectRef({ data, isValid, onUpdateField, onNext, onPrev }: Props) {
    const { t, lang } = useLang()
    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={20} /> {t.projectTitle}</h2>
            <p className="card-subtitle">{t.projectSubtitle}</p>
            <div className="alert alert-info">{t.projectAnon}</div>

            <div className="form-group">
                <label className="form-label">{t.pr01} <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="radio-group">
                    {['KPBU SPAM langsung', 'KPBU SPAM diketahui', 'PPP sejenis'].map(v => (
                        <label key={v} className={`radio-label ${data.projectType === v ? 'selected' : ''}`}>
                            <input type="radio" name="pr01" value={v} checked={data.projectType === v} onChange={() => onUpdateField('projectType', v)} />
                            <span>{t.projectType[v] ?? v}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">{t.pr02}</label>
                <input type="text" className="form-input" placeholder="Contoh: Jawa Barat" value={data.projectLocation} onChange={e => onUpdateField('projectLocation', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">{t.pr03}</label>
                <div className="radio-group horizontal">
                    {['AP', 'Tarif', 'Campuran', 'Tidak tahu'].map(v => (
                        <label key={v} className={`radio-label ${data.projectPayment === v ? 'selected' : ''}`}>
                            <input type="radio" name="pr03" value={v} checked={data.projectPayment === v} onChange={() => onUpdateField('projectPayment', v)} />
                            <span>{t.projectPayment[v] ?? v}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">{t.pr04}</label>
                <select className="form-select" value={data.projectStatus} onChange={e => onUpdateField('projectStatus', e.target.value)}>
                    <option value="">-- {t.selectPlaceholder} --</option>
                    {PROJECT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{t.projectStatus[o.value] ?? o.label}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">{t.pr05} <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select className="form-select" value={data.projectPhase} onChange={e => onUpdateField('projectPhase', e.target.value)}>
                    <option value="">-- {t.selectPlaceholder} --</option>
                    {PHASES.map(p => <option key={p.value} value={p.label}>{t.phases[p.label] ?? p.label}</option>)}
                </select>
            </div>

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={16} /> {t.back}</button>
                <button className="btn btn-primary" onClick={onNext} disabled={!isValid}>{t.next} →</button>
            </div>
            {!isValid && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                    {lang === 'en'
                        ? 'Please complete the project type and the last phase you handled before continuing.'
                        : 'Mohon lengkapi tipe proyek dan fase terakhir yang Anda tangani sebelum melanjutkan.'}
                </div>
            )}
        </div>
    )
}
