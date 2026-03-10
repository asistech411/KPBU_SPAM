/**
 * StepReview.tsx — Step 8: Review & Submit
 *
 * Menampilkan validasi checklist semua step (consent, screening, FAHP, LCM, PAT).
 * Jika semua valid, tampilkan "Semua bagian lengkap!" dan aktifkan tombol submit.
 * Form isian: Nama (required), Email (optional), Catatan tambahan (optional).
 *
 * Submit memanggil /api/calculate → redirects ke /results/[id].
 */
import { RISKS } from '@/lib/constants'
import { CheckCircle, XCircle, ClipboardList, ChevronLeft, Rocket } from '@/lib/icons'
import type { SurveyState } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

type Props = {
    data: SurveyState
    fahpCount: number
    lcmExpCount: number
    lcmPhaseCount: number
    saving: boolean
    onUpdateField: (f: 'respondentName' | 'respondentEmail' | 'additionalNotes', v: string) => void
    onSubmit: () => void
    onPrev: () => void
}

export default function StepReview({ data, fahpCount, lcmExpCount, lcmPhaseCount, saving, onUpdateField, onSubmit, onPrev }: Props) {
    const { t, lang } = useLang()
    const pat1Count = RISKS.reduce((sum, r) => sum + Object.keys(data.pat1Data[r.code] || {}).length, 0)
    const pat2Count = RISKS.reduce((sum, r) => sum + Object.keys(data.pat2Data[r.code] || {}).length, 0)

    const validations = [
        { label: t.stepLabelConsent, valid: data.consent },
        { label: t.stepLabelScreening, valid: data.screening01 === 'Ya' },
        { label: t.reviewRole.replace(':', ''), valid: !!data.role },
        { label: t.reviewExp.replace(':', ''), valid: !!data.experience },
        { label: lang === 'en' ? 'Handled phases' : 'Fase ditangani', valid: data.phases.length > 0 },
        { label: t.reviewType.replace(':', ''), valid: !!data.projectType },
        { label: t.reviewDomPhase.replace(':', ''), valid: !!data.projectPhase },
        { label: `FAHP (${fahpCount}/15)`, valid: fahpCount === 15 },
        { label: `LCM (${lcmExpCount}/6, ${lcmPhaseCount}/6)`, valid: lcmExpCount === 6 && lcmPhaseCount === 6 },
        { label: `PAT T1 (${pat1Count}/72)`, valid: pat1Count >= 36 },
        { label: `PAT T2 (${pat2Count}/48)`, valid: pat2Count >= 24 },
        { label: t.reviewNameLabel.replace(':', '').replace(' (opsional)', '').replace(' (optional)', ''), valid: !!data.respondentName },
    ]

    const allValid = validations.every(v => v.valid)

    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={20} /> {t.reviewTitle}
            </h2>
            <p className="card-subtitle">{t.reviewSubtitle}</p>

            <ul className="validation-list">
                {validations.map(v => (
                    <li key={v.label} className={v.valid ? 'valid' : 'invalid'}>
                        {v.valid
                            ? <><CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {v.label}</>
                            : <><XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {v.label}</>}
                    </li>
                ))}
            </ul>
            {!allValid && <div className="alert alert-warning">{t.reviewIncomplete}</div>}
            {allValid && <div className="alert alert-success">{t.reviewReady}</div>}

            <div className="review-section">
                <h4>{t.reviewProfile}</h4>
                <div className="review-item"><span>{t.reviewRole}</span><strong>{data.role ? (t.roles[data.role] ?? data.role) : '-'}</strong></div>
                <div className="review-item"><span>{t.reviewExp}</span><strong>{data.experience ? (t.experience[data.experience] ?? data.experience) : '-'}</strong></div>
                <div className="review-item"><span>{t.reviewPhase}</span><strong>{data.phases.length > 0 ? data.phases.map(p => t.phases[p] ?? p).join(', ') : '-'}</strong></div>
                <div className="review-item"><span>{t.reviewDual}</span><strong>{data.dualRole ? t.yes : t.no}</strong></div>
            </div>

            <div className="review-section">
                <h4>{t.reviewProj}</h4>
                <div className="review-item"><span>{t.reviewType}</span><strong>{data.projectType ? (t.projectType[data.projectType] ?? data.projectType) : '-'}</strong></div>
                <div className="review-item"><span>{t.reviewLoc}</span><strong>{data.projectLocation || '-'}</strong></div>
                <div className="review-item"><span>{t.reviewDomPhase}</span><strong>{data.projectPhase ? (t.phases[data.projectPhase] ?? data.projectPhase) : '-'}</strong></div>
            </div>

            <div className="review-section">
                <h4>{t.reviewChecklist}</h4>
                <div className="review-item"><span>FAHP:</span><strong>{fahpCount}/15</strong></div>
                <div className="review-item"><span>LCM {t.lcm01Title.replace('LCM-01. ', '')}:</span><strong>{lcmExpCount}/6</strong></div>
                <div className="review-item"><span>LCM {t.lcm02Title.replace('LCM-02. ', '')}:</span><strong>{lcmPhaseCount}/6</strong></div>
                <div className="review-item"><span>PAT Tier-1:</span><strong>{pat1Count}/72</strong></div>
                <div className="review-item"><span>PAT Tier-2:</span><strong>{pat2Count}/48</strong></div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className="form-label">{t.reviewNameLabel} <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" className="form-input" placeholder={t.reviewNamePlaceholder} value={data.respondentName} onChange={e => onUpdateField('respondentName', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">{t.reviewEmailLabel}</label>
                <input type="email" className="form-input" placeholder={t.reviewEmailPlaceholder} value={data.respondentEmail} onChange={e => onUpdateField('respondentEmail', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">{t.reviewNotesLabel}</label>
                <textarea className="form-textarea" placeholder={t.reviewNotesPlaceholder} value={data.additionalNotes} onChange={e => onUpdateField('additionalNotes', e.target.value)} />
            </div>

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronLeft size={16} /> {t.back}
                </button>
                <button className="btn btn-accent btn-lg" onClick={onSubmit} disabled={saving || !data.respondentName}>
                    {saving ? t.saving : <><Rocket size={16} /> {t.submit}</>}
                </button>
            </div>
        </div>
    )
}
