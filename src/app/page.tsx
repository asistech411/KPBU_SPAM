import Link from 'next/link'

export default function HomePage() {
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
                    <Link href="/admin/login" className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Admin
                    </Link>
                </div>
            </header>

            <main className="main">
                <div className="landing-hero">
                    <h1>🌊 Survey Alokasi Risiko Proyek KPBU SPAM</h1>
                    <p>Selamat datang! Survey ini mengumpulkan persepsi Anda tentang kepentingan risiko, fase kritis, dan indikator untuk rekomendasi alokasi risiko yang adil pada proyek KPBU SPAM.</p>
                    <div className="time-estimate">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        Estimasi waktu: 15–25 menit
                    </div>
                </div>

                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <h3>Otomatis Tersimpan</h3>
                        <p>Jawaban disimpan ke database. Anda bisa melanjutkan kapan saja.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3>Kerahasiaan Terjaga</h3>
                        <p>Jawaban bersifat rahasia untuk kepentingan akademik.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18" />
                                <path d="M9 21V9" />
                            </svg>
                        </div>
                        <h3>Hasil Langsung</h3>
                        <p>Lihat hasil analisis dan rekomendasi setelah submit.</p>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📋 Struktur Survey</h3>
                    <ol style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
                        <li>Persetujuan partisipasi</li>
                        <li>Screening responden & pengalaman</li>
                        <li>Proyek referensi utama</li>
                        <li>FAHP: Perbandingan berpasangan 6 risiko</li>
                        <li>Lifecycle Mapping: Keterjadian & fase kritis</li>
                        <li>PAT Tier-1: Publik/PDAM ↔ BU/SPV</li>
                        <li>PAT Tier-2: BU/SPV ↔ EPC/O&M</li>
                        <li>Review & Submit (+ nama responden)</li>
                        <li>Hasil & Rekomendasi</li>
                    </ol>
                </div>

                <div className="btn-group" style={{ justifyContent: 'center' }}>
                    <Link href="/survey" className="btn btn-primary btn-lg">
                        Mulai Survey
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </main>
        </>
    )
}
