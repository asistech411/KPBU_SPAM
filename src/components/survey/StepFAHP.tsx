/**
 * StepFAHP.tsx — Step 4: FAHP Perbandingan Berpasangan
 *
 * Responden membandingkan tingkat kepentingan antar 6 risiko.
 * 15 pair combinations (C(6,2)), diisi via dropdown skala FAHP.
 *
 * Sidebar definisi risiko ditampilkan di kiri (hanya pada step ini).
 * Completeness bar menunjukkan {fahpCount}/15 sudah diisi.
 * Warning jika belum lengkap — CR tidak bisa dihitung.
 */
import { RISKS, FAHP_SCALE } from '@/lib/constants'
import { BarChart2, AlertTriangle } from '@/lib/icons'
import type { SurveyState } from '@/lib/types'

type FAHPPair = { r1: typeof RISKS[number]; r2: typeof RISKS[number] }

type Props = {
    fahpPairwise: SurveyState['fahpPairwise']
    fahpPairs: FAHPPair[]
    fahpCount: number
    isFahpValid: boolean
    onUpdateFahp: (pair: string, value: string) => void
    onNext: () => void
    onPrev: () => void
}

export default function StepFAHP({ fahpPairwise, fahpPairs, fahpCount, isFahpValid, onUpdateFahp, onNext, onPrev }: Props) {
    return (
        <>
            <div className="risk-sidebar">
                <h3>ℹ️ Definisi 6 Risiko</h3>
                {RISKS.map(r => (
                    <div key={r.code} className="risk-item">
                        <strong>{r.code} {r.name}</strong>
                        {r.code === 'R1' && 'Risiko desain, konstruksi, uji operasi (keterlambatan, cost overrun).'}
                        {r.code === 'R2' && 'Ketidakpastian pembiayaan, inflasi/kurs, struktur finansial.'}
                        {r.code === 'R3' && 'Layanan terhambat (pemeliharaan, cacat, teknologi usang).'}
                        {r.code === 'R4' && 'Pendapatan tidak memenuhi proyeksi (permintaan/tarif).'}
                        {r.code === 'R5' && 'Ketidakselarasan antar pihak (metode, standar layanan).'}
                        {r.code === 'R6' && 'Akibat kebijakan pemerintah (regulasi, perizinan, pajak).'}
                    </div>
                ))}
            </div>
            <div className="card">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart2 size={20} /> FAHP: Perbandingan Berpasangan
                </h2>
                <p className="card-subtitle">Bandingkan tingkat kepentingan relatif antar risiko.</p>
                <div className="alert alert-info"><strong>Skala:</strong> SI=Sama | SLI=Sedikit Lebih | LI=Lebih | SVI=Sangat Lebih | EI=Ekstrem Lebih Penting</div>
                <div className={`completeness ${fahpCount === 15 ? 'complete' : 'incomplete'}`}>
                    <span>Terisi: <strong>{fahpCount}</strong>/15</span>
                </div>
                <div className="fahp-grid">
                    {fahpPairs.map(p => {
                        const k = `${p.r1.code}_${p.r2.code}`
                        return (
                            <div key={k} className="fahp-pair">
                                <div className="fahp-risk left">{p.r1.code}<br /><small>{p.r1.name}</small></div>
                                <select className="form-select fahp-select" value={fahpPairwise[k] || ''} onChange={e => onUpdateFahp(k, e.target.value)}>
                                    <option value="">-- Pilih --</option>
                                    {FAHP_SCALE.map(item => (
                                        <option key={item.code} value={item.crisp}>
                                            {item.code.startsWith('1/') ? p.r2.code : p.r1.code} {item.labelID.replace(' Penting', '')} ({item.code})
                                        </option>
                                    ))}
                                </select>
                                <div className="fahp-risk right">{p.r2.code}<br /><small>{p.r2.name}</small></div>
                            </div>
                        )
                    })}
                </div>
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={onPrev}>← Kembali</button>
                    <button className="btn btn-primary" onClick={onNext} disabled={!isFahpValid}>Lanjutkan →</button>
                </div>
                {!isFahpValid && (
                    <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={14} /> Perlu diisi lengkap!
                        </strong><br />
                        Anda baru mengisi <strong>{fahpCount}</strong> dari <strong>15</strong> perbandingan.<br />
                        Semua 15 pasangan harus diisi agar perhitungan bobot FAHP valid. Data yang tidak lengkap akan menghasilkan Consistency Ratio (CR) yang tidak akurat.
                    </div>
                )}
            </div>
        </>
    )
}
