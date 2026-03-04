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

type Props = {
    data: Pick<SurveyState, 'projectType' | 'projectLocation' | 'projectPayment' | 'projectStatus' | 'projectPhase'>
    isValid: boolean
    onUpdateField: <K extends 'projectType' | 'projectLocation' | 'projectPayment' | 'projectStatus' | 'projectPhase'>(f: K, v: string) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepProjectRef({ data, isValid, onUpdateField, onNext, onPrev }: Props) {
    return (
        <div className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={20} /> Proyek Referensi Utama</h2>
            <p className="card-subtitle">Pilih 1 proyek yang paling Anda pahami. Jawab semua pertanyaan dengan konteks proyek ini.</p>
            <div className="alert alert-info">Tidak perlu menyebutkan nama proyek/lembaga untuk menjaga kerahasiaan.</div>

            <div className="form-group">
                <label className="form-label">PR-01. Tipe proyek referensi: <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="radio-group">
                    {['KPBU SPAM langsung', 'KPBU SPAM diketahui', 'PPP sejenis'].map(v => (
                        <label key={v} className={`radio-label ${data.projectType === v ? 'selected' : ''}`}>
                            <input type="radio" name="pr01" value={v} checked={data.projectType === v} onChange={() => onUpdateField('projectType', v)} />
                            <span>{v === 'KPBU SPAM langsung' ? 'KPBU SPAM yang saya tangani langsung' : v === 'KPBU SPAM diketahui' ? 'KPBU SPAM yang saya ketahui sangat baik' : 'PPP air minum sejenis'}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">PR-02. Lokasi proyek (opsional):</label>
                <input type="text" className="form-input" placeholder="Contoh: Jawa Barat" value={data.projectLocation} onChange={e => onUpdateField('projectLocation', e.target.value)} />
            </div>

            <div className="form-group">
                <label className="form-label">PR-03. Skema pembayaran:</label>
                <div className="radio-group horizontal">
                    {['AP', 'Tarif', 'Campuran', 'Tidak tahu'].map(v => (
                        <label key={v} className={`radio-label ${data.projectPayment === v ? 'selected' : ''}`}>
                            <input type="radio" name="pr03" value={v} checked={data.projectPayment === v} onChange={() => onUpdateField('projectPayment', v)} />
                            <span>{v}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">PR-04. Status proyek:</label>
                <select className="form-select" value={data.projectStatus} onChange={e => onUpdateField('projectStatus', e.target.value)}>
                    <option value="">-- Pilih status --</option>
                    {PROJECT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">PR-05. Fase dominan pengalaman Anda: <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select className="form-select" value={data.projectPhase} onChange={e => onUpdateField('projectPhase', e.target.value)}>
                    <option value="">-- Pilih fase --</option>
                    {PHASES.map(p => <option key={p.value} value={p.label}>{p.label}</option>)}
                </select>
            </div>

            <div className="btn-group">
                <button className="btn btn-secondary" onClick={onPrev} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ChevronLeft size={16} /> Kembali</button>
                <button className="btn btn-primary" onClick={onNext} disabled={!isValid}>Lanjutkan →</button>
            </div>
            {!isValid && (
                <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                    Mohon lengkapi Tipe proyek dan Fase dominan sebelum melanjutkan.
                </div>
            )}
        </div>
    )
}
