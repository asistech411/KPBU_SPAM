/**
 * StepConsent.tsx — Step 1: Lembar Informasi & Persetujuan
 *
 * Menampilkan tujuan, kerahasiaan, sukarela,
 * dan checkbox persetujuan responden.
 */
import type { SurveyState } from '@/lib/types'

type Props = {
    consent: SurveyState['consent']
    onConsentChange: (v: boolean) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepConsent({ consent, onConsentChange, onNext, onPrev }: Props) {
    return (
        <div className="card">
            <h2 className="card-title">📋 Lembar Informasi &amp; Persetujuan</h2>
            <p className="card-subtitle">Silakan baca informasi berikut sebelum melanjutkan.</p>
            <div className="alert alert-info"><strong>Tujuan:</strong> Mengumpulkan persepsi tentang 6 risiko utama, fase kritis, dan indikator PAT untuk rekomendasi alokasi risiko.</div>
            <div className="alert alert-success"><strong>Kerahasiaan:</strong> Jawaban rahasia, hasil disajikan agregat tanpa menyebut nama.</div>
            <div className="alert alert-warning"><strong>Sukarela:</strong> Partisipasi sukarela, Anda dapat berhenti kapan saja.</div>
            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`checkbox-label ${consent ? 'selected' : ''}`}>
                    <input
                        type="checkbox"
                        checked={consent}
                        onChange={e => onConsentChange(e.target.checked)}
                    />
                    <span>Saya telah membaca informasi di atas dan <strong>bersedia menjadi responden</strong>.</span>
                </label>
            </div>
            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev}>← Kembali</button>
                <button className="btn btn-primary" onClick={onNext} disabled={!consent}>Lanjutkan →</button>
            </div>
        </div>
    )
}
