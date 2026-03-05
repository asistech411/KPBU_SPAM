/**
 * StepConsent.tsx — Step 1: Lembar Informasi & Persetujuan
 *
 * Menampilkan tujuan, kerahasiaan, sukarela,
 * dan checkbox persetujuan responden.
 */
import type { SurveyState } from '@/lib/types'
import { ClipboardList, ChevronLeft } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

type Props = {
    consent: SurveyState['consent']
    onConsentChange: (v: boolean) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepConsent({ consent, onConsentChange, onNext, onPrev }: Props) {
    const { t } = useLang()
    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={20} /> {t.consentTitle}
            </h2>
            <p className="card-subtitle">{t.consentSubtitle}</p>
            <div className="alert alert-info"><strong>{t.consentPurpose}:</strong> {t.consentPurposeText}</div>
            <div className="alert alert-success"><strong>{t.consentConfidential}:</strong> {t.consentConfidentialText}</div>
            <div className="alert alert-warning"><strong>{t.consentVoluntary}:</strong> {t.consentVoluntaryText}</div>
            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`checkbox-label ${consent ? 'selected' : ''}`}>
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={e => onConsentChange(e.target.checked)}
                    />
                    <span>{t.consentCheck}</span>
                </label>
            </div>
            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronLeft size={16} /> {t.back}
                </button>
                <button className="btn btn-primary" onClick={onNext} disabled={!consent}>{t.next} →</button>
            </div>
        </div>
    )
}
