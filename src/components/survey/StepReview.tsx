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
    const pat1Count = RISKS.reduce((sum, r) => sum + Object.keys(data.pat1Data[r.code] || {}).length, 0)
    const pat2Count = RISKS.reduce((sum, r) => sum + Object.keys(data.pat2Data[r.code] || {}).length, 0)

    const validations = [
        { label: 'Persetujuan', valid: data.consent },
        { label: 'Screening', valid: data.screening01 === 'Ya' },
        { label: 'Peran', valid: !!data.role },
        { label: 'Pengalaman', valid: !!data.experience },
        { label: 'Fase ditangani', valid: data.phases.length > 0 },
        { label: 'Tipe proyek', valid: !!data.projectType },
        { label: 'Fase dominan', valid: !!data.projectPhase },
        { label: `FAHP (${fahpCount}/15)`, valid: fahpCount === 15 },
        { label: `LCM (${lcmExpCount}/6, ${lcmPhaseCount}/6)`, valid: lcmExpCount === 6 && lcmPhaseCount === 6 },
        { label: `PAT T1 (${pat1Count}/72)`, valid: pat1Count >= 36 },
        { label: `PAT T2 (${pat2Count}/48)`, valid: pat2Count >= 24 },
        { label: 'Nama responden', valid: !!data.respondentName },
    ]

    const allValid = validations.every(v => v.valid)

    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={20} /> Review &amp; Submit
            </h2>
            <p className="card-subtitle">Periksa kembali jawaban Anda sebelum mengirim.</p>

            <ul className="validation-list">
                {validations.map(v => (
                    <li key={v.label} className={v.valid ? 'valid' : 'invalid'}>
                        {v.valid
                            ? <><CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {v.label}</>
                            : <><XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {v.label}</>}
                    </li>
                ))}
            </ul>
            {!allValid && <div className="alert alert-warning">Beberapa bagian belum lengkap.</div>}
            {allValid && <div className="alert alert-success">Semua bagian lengkap!</div>}

            <div className="review-section">
                <h4>Profil Responden</h4>
                <div className="review-item"><span>Peran:</span><strong>{data.role || '-'}</strong></div>
                <div className="review-item"><span>Pengalaman:</span><strong>{data.experience || '-'}</strong></div>
                <div className="review-item"><span>Fase:</span><strong>{data.phases.join(', ') || '-'}</strong></div>
                <div className="review-item"><span>Dual-role:</span><strong>{data.dualRole ? 'Ya' : 'Tidak'}</strong></div>
            </div>

            <div className="review-section">
                <h4>Proyek Referensi</h4>
                <div className="review-item"><span>Tipe:</span><strong>{data.projectType || '-'}</strong></div>
                <div className="review-item"><span>Lokasi:</span><strong>{data.projectLocation || '-'}</strong></div>
                <div className="review-item"><span>Fase dominan:</span><strong>{data.projectPhase || '-'}</strong></div>
            </div>

            <div className="review-section">
                <h4>Completeness</h4>
                <div className="review-item"><span>FAHP:</span><strong>{fahpCount}/15</strong></div>
                <div className="review-item"><span>LCM Keterjadian:</span><strong>{lcmExpCount}/6</strong></div>
                <div className="review-item"><span>LCM Fase:</span><strong>{lcmPhaseCount}/6</strong></div>
                <div className="review-item"><span>PAT Tier-1:</span><strong>{pat1Count}/72</strong></div>
                <div className="review-item"><span>PAT Tier-2:</span><strong>{pat2Count}/48</strong></div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className="form-label">Nama Anda: <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Nama lengkap" value={data.respondentName} onChange={e => onUpdateField('respondentName', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">Email (opsional):</label>
                <input type="email" className="form-input" placeholder="email@example.com" value={data.respondentEmail} onChange={e => onUpdateField('respondentEmail', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">Catatan tambahan (opsional):</label>
                <textarea className="form-textarea" placeholder="Konteks khusus atau alasan di balik jawaban..." value={data.additionalNotes} onChange={e => onUpdateField('additionalNotes', e.target.value)} />
            </div>

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronLeft size={16} /> Kembali
                </button>
                <button className="btn btn-accent btn-lg" onClick={onSubmit} disabled={saving || !data.respondentName}>
                    {saving ? 'Menyimpan...' : <><Rocket size={16} /> Submit &amp; Lihat Hasil</>}
                </button>
            </div>
        </div>
    )
}
