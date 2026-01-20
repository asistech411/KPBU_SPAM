import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
    title: 'Survey Alokasi Risiko KPBU SPAM',
    description: 'Survey untuk mengumpulkan persepsi tentang kepentingan risiko proyek KPBU SPAM',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="id">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
