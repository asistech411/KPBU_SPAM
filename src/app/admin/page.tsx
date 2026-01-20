'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SurveyItem {
    id: string
    respondentName: string | null
    respondentEmail: string | null
    role: string | null
    isSubmitted: boolean
    createdAt: string
    updatedAt: string
}

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [surveys, setSurveys] = useState<SurveyItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login')
        }
    }, [status, router])

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const res = await fetch('/api/admin/responses')
                if (res.ok) {
                    const data = await res.json()
                    setSurveys(data)
                }
            } catch (e) {
                console.error('Failed to fetch surveys:', e)
            }
            setLoading(false)
        }

        if (status === 'authenticated') {
            fetchSurveys()
        }
    }, [status])

    if (status === 'loading' || (status === 'unauthenticated')) {
        return (
            <main className="main">
                <div className="card">
                    <p>Memuat...</p>
                </div>
            </main>
        )
    }

    const submittedCount = surveys.filter(s => s.isSubmitted).length
    const inProgressCount = surveys.filter(s => !s.isSubmitted).length

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
                        <span>Admin Dashboard</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Halo, {session?.user?.name}</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => signOut({ callbackUrl: '/' })}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-value">{surveys.length}</div>
                        <div className="kpi-label">Total Responses</div>
                    </div>
                    <div className="kpi-card success">
                        <div className="kpi-value">{submittedCount}</div>
                        <div className="kpi-label">Submitted</div>
                    </div>
                    <div className="kpi-card warning">
                        <div className="kpi-value">{inProgressCount}</div>
                        <div className="kpi-label">In Progress</div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="card-title">📋 Daftar Responses</h2>
                    <p className="card-subtitle">Klik untuk melihat detail hasil survey.</p>

                    {loading ? (
                        <p>Memuat data...</p>
                    ) : surveys.length === 0 ? (
                        <div className="alert alert-info">Belum ada response survey.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="allocation-matrix">
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Email</th>
                                        <th>Peran</th>
                                        <th>Status</th>
                                        <th>Tanggal</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surveys.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 600 }}>{s.respondentName || '(Anonim)'}</td>
                                            <td>{s.respondentEmail || '-'}</td>
                                            <td>{s.role || '-'}</td>
                                            <td>
                                                <span className={`tier-badge ${s.isSubmitted ? 'tier1' : 'tier2'}`}>
                                                    {s.isSubmitted ? 'Submitted' : 'In Progress'}
                                                </span>
                                            </td>
                                            <td>{new Date(s.createdAt).toLocaleDateString('id-ID')}</td>
                                            <td>
                                                {s.isSubmitted ? (
                                                    <Link href={`/results/${s.id}`} className="btn btn-sm btn-primary">
                                                        Lihat Hasil
                                                    </Link>
                                                ) : (
                                                    <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="btn-group">
                    <Link href="/" className="btn btn-secondary">🏠 Kembali ke Beranda</Link>
                </div>
            </main>
        </>
    )
}
