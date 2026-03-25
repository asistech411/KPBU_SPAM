import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
    title: 'Penilaian Alokasi Risiko KPBU SPAM',
    description: 'Borang penilaian untuk mengumpulkan persepsi tentang alokasi risiko proyek KPBU SPAM',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="id">
            <body>
                <Providers>
                    <Toaster position="top-center" />
                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <div style={{ flex: 1 }}>{children}</div>
                        <footer style={{ textAlign: 'center', padding: '1.25rem', fontSize: '0.85rem', color: '#6b7280', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', marginTop: 'auto' }}>
                            &copy; 2026 Moammar Alzia Viqolbi
                        </footer>
                    </div>
                </Providers>
            </body>
        </html>
    )
}
