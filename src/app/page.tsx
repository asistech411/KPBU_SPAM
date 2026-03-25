'use client'

import Link from 'next/link'
import { Layers, ClipboardList } from '@/lib/icons'
import LangToggle from '@/components/ui/LangToggle'
import { useLang } from '@/lib/lang-context'

export default function HomePage() {
    const { t, lang } = useLang()
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
                        <span>{t.surveyTitle}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <LangToggle />
                        <Link href="/admin" className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Admin
                        </Link>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="landing-hero">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', textAlign: 'center' }}>
                        <Layers size={24} /> {t.homeTitle}
                    </h1>
                    <p style={{ textAlign: 'center' }}>{t.homeSubtitle}</p>
                    <div className="time-estimate">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        {lang === 'id' ? 'Sekitar 15–25 menit' : 'About 15–25 minutes'}
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
                        <h3>{t.homeStepByStep}</h3>
                        <p>{t.homeStepByStepDesc}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3>{t.homeExperience}</h3>
                        <p>{t.homeExperienceDesc}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M3 9h18" />
                                <path d="M9 21V9" />
                            </svg>
                        </div>
                        <h3>{t.homeImmediate}</h3>
                        <p>{t.homeImmediateDesc}</p>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ClipboardList size={18} /> {t.homeSurveyStructure}
                    </h3>
                    {lang === 'id' ? (
                        <ol style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
                            <li>Konfirmasi partisipasi</li>
                            <li>Profil singkat & pengalaman</li>
                            <li>Proyek acuan utama</li>
                            <li>Penilaian perbandingan risiko</li>
                            <li>Pemetaan kejadian & fase kritis</li>
                            <li>Relasi risiko Tier 1 (PJPK/Publik/PDAM ↔ BUP)</li>
                            <li>Relasi risiko Tier 2 (BUP ↔ Kontraktor/Operator & Pemelihara)</li>
                            <li>Tinjau jawaban & identitas responden</li>
                            <li>Ringkasan hasil & rekomendasi</li>
                        </ol>
                    ) : (
                        <ol style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
                            <li>Participation confirmation</li>
                            <li>Brief profile & experience</li>
                            <li>Main reference project</li>
                            <li>Risk comparison assessment</li>
                            <li>Occurrence & critical phase mapping</li>
                            <li>Tier 1 risk relation (GCA/Public/PDAM ↔ SPV)</li>
                            <li>Tier 2 risk relation (SPV ↔ Contractor/O&M)</li>
                            <li>Review responses & respondent identity</li>
                            <li>Results summary & recommendations</li>
                        </ol>
                    )}
                </div>

                <div className="btn-group" style={{ justifyContent: 'center' }}>
                    <Link href="/survey" className="btn btn-primary btn-lg">
                        {t.homeStartBtn}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </main>
        </>
    )
}
