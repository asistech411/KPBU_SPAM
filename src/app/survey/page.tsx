'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    RISKS, PHASES, STEPS, PAT1_ITEMS, PAT2_ITEMS,
    ROLE_OPTIONS, EXPERIENCE_OPTIONS, PROJECT_STATUS_OPTIONS
} from '@/lib/constants'

// Survey state type
interface SurveyState {
    id?: string
    consent: boolean
    screening01?: string
    role: string
    experience: string
    phases: string[]
    dualRole: boolean
    projectType: string
    projectLocation: string
    projectPayment: string
    projectStatus: string
    projectPhase: string
    fahpPairwise: Record<string, string>
    lcmExposure: Record<string, number>
    lcmPhaseCritical: Record<string, string>
    pat1Data: Record<string, Record<string, number | 'TT'>>
    pat2Data: Record<string, Record<string, number | 'TT'>>
    additionalNotes: string
    respondentName: string
    respondentEmail: string
}

const initialState: SurveyState = {
    consent: false,
    role: '',
    experience: '',
    phases: [],
    dualRole: false,
    projectType: '',
    projectLocation: '',
    projectPayment: '',
    projectStatus: '',
    projectPhase: '',
    fahpPairwise: {},
    lcmExposure: {},
    lcmPhaseCritical: {},
    pat1Data: {},
    pat2Data: {},
    additionalNotes: '',
    respondentName: '',
    respondentEmail: '',
}

export default function SurveyPage() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(0)
    const [data, setData] = useState<SurveyState>(initialState)
    const [saving, setSaving] = useState(false)
    const [activePat1Tab, setActivePat1Tab] = useState('R1')
    const [activePat2Tab, setActivePat2Tab] = useState('R1')

    // Generate FAHP pairs
    const fahpPairs: { r1: typeof RISKS[number]; r2: typeof RISKS[number] }[] = []
    for (let i = 0; i < 6; i++) {
        for (let j = i + 1; j < 6; j++) {
            fahpPairs.push({ r1: RISKS[i], r2: RISKS[j] })
        }
    }

    // Auto-save to database
    const saveToDatabase = useCallback(async (surveyData: SurveyState) => {
        setSaving(true)
        try {
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData),
            })
            const result = await res.json()
            if (result.id && !surveyData.id) {
                setData(prev => ({ ...prev, id: result.id }))
            }
        } catch (e) {
            console.error('Save failed:', e)
        }
        setSaving(false)
    }, [])

    // Debounced save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.consent) {
                saveToDatabase(data)
            }
        }, 1000)
        return () => clearTimeout(timer)
    }, [data, saveToDatabase])

    // Update handlers
    const updateField = <K extends keyof SurveyState>(field: K, value: SurveyState[K]) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const updateFahp = (pair: string, value: string) => {
        setData(prev => ({
            ...prev,
            fahpPairwise: { ...prev.fahpPairwise, [pair]: value }
        }))
    }

    const updateLcmExposure = (code: string, value: number) => {
        setData(prev => ({
            ...prev,
            lcmExposure: { ...prev.lcmExposure, [code]: value }
        }))
    }

    const updateLcmPhase = (code: string, value: string) => {
        setData(prev => ({
            ...prev,
            lcmPhaseCritical: { ...prev.lcmPhaseCritical, [code]: value }
        }))
    }

    const updatePat1 = (riskCode: string, itemCode: string, value: number | 'TT') => {
        setData(prev => ({
            ...prev,
            pat1Data: {
                ...prev.pat1Data,
                [riskCode]: { ...prev.pat1Data[riskCode], [itemCode]: value }
            }
        }))
    }

    const updatePat2 = (riskCode: string, itemCode: string, value: number | 'TT') => {
        setData(prev => ({
            ...prev,
            pat2Data: {
                ...prev.pat2Data,
                [riskCode]: { ...prev.pat2Data[riskCode], [itemCode]: value }
            }
        }))
    }

    const togglePhase = (phase: string) => {
        setData(prev => ({
            ...prev,
            phases: prev.phases.includes(phase)
                ? prev.phases.filter(p => p !== phase)
                : [...prev.phases, phase]
        }))
    }

    // Validation checks for each page
    const isScreeningValid = data.screening01 === 'Ya' && !!data.role && !!data.experience && data.phases.length > 0
    const isProjectValid = !!data.projectType && !!data.projectPhase

    // Navigation
    const nextPage = () => setCurrentPage(p => Math.min(p + 1, 9))
    const prevPage = () => setCurrentPage(p => Math.max(p - 1, 0))
    const goToPage = (n: number) => setCurrentPage(n)

    // Submit survey
    const submitSurvey = async () => {
        if (!data.respondentName) {
            alert('Mohon isi nama Anda sebelum submit.')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, isSubmitted: true }),
            })
            const result = await res.json()
            if (result.surveyId) {
                router.push(`/results/${result.surveyId}`)
            }
        } catch (e) {
            console.error('Submit failed:', e)
            alert('Gagal submit survey. Silakan coba lagi.')
        }
        setSaving(false)
    }

    // FAHP completeness
    const fahpCount = Object.keys(data.fahpPairwise).filter(k => data.fahpPairwise[k]).length
    const isFahpValid = fahpCount === 15

    // LCM completeness
    const lcmExpCount = Object.keys(data.lcmExposure).length
    const lcmPhaseCount = Object.keys(data.lcmPhaseCritical).length
    const isLcmValid = lcmExpCount === 6 && lcmPhaseCount === 6

    // Render current page
    const renderPage = () => {
        switch (currentPage) {
            case 0: // Landing
                return (
                    <div className="card">
                        <h2 className="card-title">Selamat Datang</h2>
                        <p className="card-subtitle">Klik tombol di bawah untuk memulai survey.</p>
                        <div className="btn-group" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-primary btn-lg" onClick={nextPage}>
                                Mulai Survey →
                            </button>
                        </div>
                    </div>
                )

            case 1: // Consent
                return (
                    <div className="card">
                        <h2 className="card-title">📋 Lembar Informasi & Persetujuan</h2>
                        <p className="card-subtitle">Silakan baca informasi berikut sebelum melanjutkan.</p>
                        <div className="alert alert-info"><strong>Tujuan:</strong> Mengumpulkan persepsi tentang 6 risiko utama, fase kritis, dan indikator PAT untuk rekomendasi alokasi risiko.</div>
                        <div className="alert alert-success"><strong>Kerahasiaan:</strong> Jawaban rahasia, hasil disajikan agregat tanpa menyebut nama.</div>
                        <div className="alert alert-warning"><strong>Sukarela:</strong> Partisipasi sukarela, Anda dapat berhenti kapan saja.</div>
                        <div className="form-group" style={{ marginTop: '2rem' }}>
                            <label className={`checkbox-label ${data.consent ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={data.consent}
                                    onChange={e => updateField('consent', e.target.checked)}
                                />
                                <span>Saya telah membaca informasi di atas dan <strong>bersedia menjadi responden</strong>.</span>
                            </label>
                        </div>
                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-primary" onClick={nextPage} disabled={!data.consent}>Lanjutkan →</button>
                        </div>
                    </div>
                )

            case 2: // Screening
                return (
                    <div className="card">
                        <h2 className="card-title">👥 Screening Responden</h2>
                        <p className="card-subtitle">Informasi latar belakang dan pengalaman Anda.</p>

                        <div className="form-group">
                            <label className="form-label">SCR-01. Apakah Anda pernah terlibat dalam proyek KPBU SPAM atau PPP sejenis? <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <div className="radio-group horizontal">
                                {['Ya', 'Tidak'].map(v => (
                                    <label key={v} className={`radio-label ${data.screening01 === v ? 'selected' : ''}`}>
                                        <input type="radio" name="scr01" value={v} checked={data.screening01 === v} onChange={() => updateField('screening01', v)} />
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
                                    <select className="form-select" value={data.role} onChange={e => updateField('role', e.target.value)}>
                                        <option value="">-- Pilih peran --</option>
                                        {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">SCR-03. Lama pengalaman: <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <div className="radio-group horizontal">
                                        {EXPERIENCE_OPTIONS.map(o => (
                                            <label key={o.value} className={`radio-label ${data.experience === o.value ? 'selected' : ''}`}>
                                                <input type="radio" name="scr03" value={o.value} checked={data.experience === o.value} onChange={() => updateField('experience', o.value)} />
                                                <span>{o.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">SCR-04. Fase KPBU yang pernah ditangani (boleh &gt;1): <span style={{ color: 'var(--danger)' }}>*</span></label>
                                    <div className="checkbox-group horizontal">
                                        {PHASES.map(p => (
                                            <label key={p} className={`checkbox-label ${data.phases.includes(p) ? 'selected' : ''}`}>
                                                <input type="checkbox" checked={data.phases.includes(p)} onChange={() => togglePhase(p)} />
                                                <span>{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">SCR-05. Apakah Anda memiliki dua peran/afiliasi yang berpotensi konflik?</label>
                                    <div className="radio-group horizontal">
                                        {['Tidak', 'Ya'].map(v => (
                                            <label key={v} className={`radio-label ${(data.dualRole ? 'Ya' : 'Tidak') === v ? 'selected' : ''}`}>
                                                <input type="radio" name="scr05" value={v} checked={(data.dualRole ? 'Ya' : 'Tidak') === v} onChange={() => updateField('dualRole', v === 'Ya')} />
                                                <span>{v}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-primary" onClick={nextPage} disabled={!isScreeningValid}>
                                Lanjutkan →
                            </button>
                        </div>
                        {!isScreeningValid && data.screening01 === 'Ya' && (
                            <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                                Mohon lengkapi semua field yang bertanda * sebelum melanjutkan.
                            </div>
                        )}
                    </div>
                )

            case 3: // Project Reference
                return (
                    <div className="card">
                        <h2 className="card-title">📁 Proyek Referensi Utama</h2>
                        <p className="card-subtitle">Pilih 1 proyek yang paling Anda pahami. Jawab semua pertanyaan dengan konteks proyek ini.</p>
                        <div className="alert alert-info">Tidak perlu menyebutkan nama proyek/lembaga untuk menjaga kerahasiaan.</div>

                        <div className="form-group">
                            <label className="form-label">PR-01. Tipe proyek referensi: <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <div className="radio-group">
                                {['KPBU SPAM langsung', 'KPBU SPAM diketahui', 'PPP sejenis'].map(v => (
                                    <label key={v} className={`radio-label ${data.projectType === v ? 'selected' : ''}`}>
                                        <input type="radio" name="pr01" value={v} checked={data.projectType === v} onChange={() => updateField('projectType', v)} />
                                        <span>{v === 'KPBU SPAM langsung' ? 'KPBU SPAM yang saya tangani langsung' : v === 'KPBU SPAM diketahui' ? 'KPBU SPAM yang saya ketahui sangat baik' : 'PPP air minum sejenis'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">PR-02. Lokasi proyek (opsional):</label>
                            <input type="text" className="form-input" placeholder="Contoh: Jawa Barat" value={data.projectLocation} onChange={e => updateField('projectLocation', e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">PR-03. Skema pembayaran:</label>
                            <div className="radio-group horizontal">
                                {['AP', 'Tarif', 'Campuran', 'Tidak tahu'].map(v => (
                                    <label key={v} className={`radio-label ${data.projectPayment === v ? 'selected' : ''}`}>
                                        <input type="radio" name="pr03" value={v} checked={data.projectPayment === v} onChange={() => updateField('projectPayment', v)} />
                                        <span>{v}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">PR-04. Status proyek:</label>
                            <select className="form-select" value={data.projectStatus} onChange={e => updateField('projectStatus', e.target.value)}>
                                <option value="">-- Pilih status --</option>
                                {PROJECT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">PR-05. Fase dominan pengalaman Anda: <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <select className="form-select" value={data.projectPhase} onChange={e => updateField('projectPhase', e.target.value)}>
                                <option value="">-- Pilih fase --</option>
                                {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-primary" onClick={nextPage} disabled={!isProjectValid}>
                                Lanjutkan →
                            </button>
                        </div>
                        {!isProjectValid && (
                            <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                                Mohon lengkapi Tipe proyek dan Fase dominan sebelum melanjutkan.
                            </div>
                        )}
                    </div>
                )

            case 4: // FAHP
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
                            <h2 className="card-title">📊 FAHP: Perbandingan Berpasangan</h2>
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
                                            <select className="form-select fahp-select" value={data.fahpPairwise[k] || ''} onChange={e => updateFahp(k, e.target.value)}>
                                                <option value="">-- Pilih --</option>
                                                <option value="EI">{p.r1.code} Ekstrem (EI)</option>
                                                <option value="SVI">{p.r1.code} Sangat (SVI)</option>
                                                <option value="LI">{p.r1.code} Lebih (LI)</option>
                                                <option value="SLI">{p.r1.code} Sedikit (SLI)</option>
                                                <option value="SI">Sama (SI)</option>
                                                <option value="1/SLI">{p.r2.code} Sedikit (1/SLI)</option>
                                                <option value="1/LI">{p.r2.code} Lebih (1/LI)</option>
                                                <option value="1/SVI">{p.r2.code} Sangat (1/SVI)</option>
                                                <option value="1/EI">{p.r2.code} Ekstrem (1/EI)</option>
                                            </select>
                                            <div className="fahp-risk right">{p.r2.code}<br /><small>{p.r2.name}</small></div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                                <button className="btn btn-primary" onClick={nextPage} disabled={!isFahpValid}>
                                    Lanjutkan →
                                </button>
                            </div>
                            {!isFahpValid && (
                                <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                                    <strong>⚠️ Perlu diisi lengkap!</strong><br />
                                    Anda baru mengisi <strong>{fahpCount}</strong> dari <strong>15</strong> perbandingan.<br />
                                    Semua 15 pasangan harus diisi agar perhitungan bobot FAHP valid. Data yang tidak lengkap akan menghasilkan Consistency Ratio (CR) yang tidak akurat.
                                </div>
                            )}
                        </div>
                    </>
                )

            case 5: // LCM
                return (
                    <div className="card">
                        <h2 className="card-title">📈 Lifecycle Mapping</h2>
                        <p className="card-subtitle">Penilaian keterjadian risiko dan fase paling kritis.</p>

                        <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1.1rem' }}>LCM-01. Skor Keterjadian (1–5)</h3>
                        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                            <strong>Skala Keterjadian:</strong><br />
                            <span style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                <strong>1</strong> = Sangat Jarang | <strong>2</strong> = Jarang | <strong>3</strong> = Kadang-kadang | <strong>4</strong> = Sering | <strong>5</strong> = Sangat Sering
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
                                                    <input type="radio" name={`lcm01_${r.code}`} checked={data.lcmExposure[r.code] === v} onChange={() => updateLcmExposure(r.code, v)} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.1rem' }}>LCM-02. Fase Paling Kritis (pilih 1 per risiko)</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="likert-grid">
                                <thead>
                                    <tr><th>Risiko</th>{PHASES.map(p => <th key={p}>{p}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {RISKS.map(r => (
                                        <tr key={r.code}>
                                            <td><strong>{r.code}</strong> {r.name}</td>
                                            {PHASES.map(p => (
                                                <td key={p}>
                                                    <input type="radio" name={`lcm02_${r.code}`} checked={data.lcmPhaseCritical[r.code] === p} onChange={() => updateLcmPhase(r.code, p)} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-primary" onClick={nextPage} disabled={!isLcmValid}>
                                Lanjutkan →
                            </button>
                        </div>
                        {!isLcmValid && (
                            <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                                <strong>⚠️ Perlu diisi lengkap!</strong><br />
                                Keterjadian: <strong>{lcmExpCount}</strong>/6 | Fase Kritis: <strong>{lcmPhaseCount}</strong>/6<br />
                                Semua 6 risiko harus dinilai untuk kedua tabel. Data fase kritis sangat penting untuk menentukan alokasi risiko yang tepat.
                            </div>
                        )}
                    </div>
                )

            case 6: // PAT Tier-1
                return (
                    <div className="card">
                        <h2 className="card-title">👥 PAT Tier-1: Publik/PDAM ↔ BU/SPV</h2>
                        <p className="card-subtitle">Penilaian konstruk Principal-Agent Theory.</p>
                        <div className="alert alert-info"><span className="tier-badge tier1">Tier-1</span> <strong>12 item per risiko</strong> — Skala: 1–5, TT=Tidak tahu</div>
                        <div className="alert alert-warning" style={{ marginTop: '0.5rem' }}>
                            <strong>Skala Penilaian (1–5):</strong><br />
                            <span style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                <strong>1</strong> = Sangat Tidak Setuju | <strong>2</strong> = Tidak Setuju | <strong>3</strong> = Netral | <strong>4</strong> = Setuju | <strong>5</strong> = Sangat Setuju | <strong>TT</strong> = Tidak Tahu
                            </span>
                        </div>

                        <div className="tab-container">
                            <div className="tab-nav">
                                {RISKS.map(r => {
                                    const filled = PAT1_ITEMS.filter(i => data.pat1Data[r.code]?.[i.code] !== undefined).length
                                    const completed = filled === PAT1_ITEMS.length
                                    return (
                                        <button key={r.code} className={`tab-btn ${activePat1Tab === r.code ? 'active' : ''} ${completed ? 'completed' : ''}`} onClick={() => setActivePat1Tab(r.code)}>
                                            {r.code}
                                        </button>
                                    )
                                })}
                            </div>
                            {RISKS.map(r => (
                                <div key={r.code} className={`tab-content ${activePat1Tab === r.code ? 'active' : ''}`}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{r.code}: {r.fullName}</h4>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="likert-grid">
                                            <thead>
                                                <tr><th style={{ width: '40%' }}>Pernyataan</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>TT</th></tr>
                                            </thead>
                                            <tbody>
                                                {PAT1_ITEMS.map(item => (
                                                    <tr key={item.code}>
                                                        <td style={{ textAlign: 'left', fontWeight: 'normal', fontSize: '0.85rem' }}>
                                                            <strong>{item.code}</strong>{'reverse' in item && item.reverse ? '*' : ''}: {item.text}
                                                        </td>
                                                        {[1, 2, 3, 4, 5].map(n => (
                                                            <td key={n}>
                                                                <input type="radio" name={`pat1_${r.code}_${item.code}`} checked={data.pat1Data[r.code]?.[item.code] === n} onChange={() => updatePat1(r.code, item.code, n)} />
                                                            </td>
                                                        ))}
                                                        <td>
                                                            <input type="radio" name={`pat1_${r.code}_${item.code}`} checked={data.pat1Data[r.code]?.[item.code] === 'TT'} onChange={() => updatePat1(r.code, item.code, 'TT')} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-primary" onClick={nextPage}>Lanjutkan ke Tier-2 →</button>
                        </div>
                    </div>
                )

            case 7: // PAT Tier-2
                return (
                    <div className="card">
                        <h2 className="card-title">🔧 PAT Tier-2: BU/SPV ↔ EPC/O&M</h2>
                        <p className="card-subtitle">Penilaian konstruk PAT untuk hubungan BU/SPV dengan EPC/O&M.</p>
                        <div className="alert alert-info"><span className="tier-badge tier2">Tier-2</span> <strong>8 item per risiko</strong> — Skala: 1–5, TT=Tidak tahu</div>
                        <div className="alert alert-warning" style={{ marginTop: '0.5rem' }}>
                            <strong>Skala Penilaian (1–5):</strong><br />
                            <span style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                <strong>1</strong> = Sangat Tidak Setuju | <strong>2</strong> = Tidak Setuju | <strong>3</strong> = Netral | <strong>4</strong> = Setuju | <strong>5</strong> = Sangat Setuju | <strong>TT</strong> = Tidak Tahu
                            </span>
                        </div>

                        <div className="tab-container">
                            <div className="tab-nav">
                                {RISKS.map(r => {
                                    const filled = PAT2_ITEMS.filter(i => data.pat2Data[r.code]?.[i.code] !== undefined).length
                                    const completed = filled === PAT2_ITEMS.length
                                    return (
                                        <button key={r.code} className={`tab-btn ${activePat2Tab === r.code ? 'active' : ''} ${completed ? 'completed' : ''}`} onClick={() => setActivePat2Tab(r.code)}>
                                            {r.code}
                                        </button>
                                    )
                                })}
                            </div>
                            {RISKS.map(r => (
                                <div key={r.code} className={`tab-content ${activePat2Tab === r.code ? 'active' : ''}`}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{r.code}: {r.fullName}</h4>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="likert-grid">
                                            <thead>
                                                <tr><th style={{ width: '40%' }}>Pernyataan</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>TT</th></tr>
                                            </thead>
                                            <tbody>
                                                {PAT2_ITEMS.map(item => (
                                                    <tr key={item.code}>
                                                        <td style={{ textAlign: 'left', fontWeight: 'normal', fontSize: '0.85rem' }}>
                                                            <strong>{item.code}</strong>: {item.text}
                                                        </td>
                                                        {[1, 2, 3, 4, 5].map(n => (
                                                            <td key={n}>
                                                                <input type="radio" name={`pat2_${r.code}_${item.code}`} checked={data.pat2Data[r.code]?.[item.code] === n} onChange={() => updatePat2(r.code, item.code, n)} />
                                                            </td>
                                                        ))}
                                                        <td>
                                                            <input type="radio" name={`pat2_${r.code}_${item.code}`} checked={data.pat2Data[r.code]?.[item.code] === 'TT'} onChange={() => updatePat2(r.code, item.code, 'TT')} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-primary" onClick={nextPage}>Review & Submit →</button>
                        </div>
                    </div>
                )

            case 8: // Review
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
                        <h2 className="card-title">📝 Review & Submit</h2>
                        <p className="card-subtitle">Periksa kembali jawaban Anda sebelum mengirim.</p>

                        <ul className="validation-list">
                            {validations.map(v => (
                                <li key={v.label} className={v.valid ? 'valid' : 'invalid'}>
                                    {v.valid ? '✓' : '✗'} {v.label}
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
                            <input type="text" className="form-input" placeholder="Nama lengkap" value={data.respondentName} onChange={e => updateField('respondentName', e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email (opsional):</label>
                            <input type="email" className="form-input" placeholder="email@example.com" value={data.respondentEmail} onChange={e => updateField('respondentEmail', e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Catatan tambahan (opsional):</label>
                            <textarea className="form-textarea" placeholder="Konteks khusus atau alasan di balik jawaban..." value={data.additionalNotes} onChange={e => updateField('additionalNotes', e.target.value)} />
                        </div>

                        <div className="btn-group">
                            <button className="btn btn-secondary" onClick={prevPage}>← Kembali</button>
                            <button className="btn btn-accent btn-lg" onClick={submitSurvey} disabled={saving || !data.respondentName}>
                                {saving ? 'Menyimpan...' : '🚀 Submit & Lihat Hasil'}
                            </button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span>Survey Alokasi Risiko KPBU SPAM</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {saving && <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Menyimpan...</span>}
                    </div>
                </div>
            </header>

            <div className="stepper-container">
                <div className="stepper">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`step ${i === currentPage ? 'active' : ''} ${i < currentPage ? 'completed' : ''}`} onClick={() => goToPage(i)}>
                            <div className="step-number">{i}</div>
                            <div className="step-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(currentPage / 9) * 100}%` }} />
                </div>
                <div className="progress-text">Halaman {currentPage} dari 9</div>
            </div>

            <main className="main">
                {renderPage()}
            </main>
        </>
    )
}
