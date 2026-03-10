'use client'
/**
 * LangToggle.tsx — Reusable ID/EN language toggle button
 *
 * Usage: <LangToggle /> — renders ID | EN pill toggle
 * Plugs into LangContext via useLang()
 */
import { useLang } from '@/lib/lang-context'

export default function LangToggle() {
    const { lang, setLang } = useLang()
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding: '3px',
        }}>
            {(['id', 'en'] as const).map(l => (
                <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                        background: lang === l ? 'rgba(255,255,255,0.9)' : 'transparent',
                        color: lang === l ? '#1e3a5f' : 'rgba(255,255,255,0.75)',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '3px 10px',
                        fontSize: '0.75rem',
                        fontWeight: lang === l ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                    }}
                >
                    {l}
                </button>
            ))}
        </div>
    )
}
