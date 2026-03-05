'use client'
/**
 * lang-context.tsx — React Context for bilingual toggle (BL-10)
 *
 * Provides: LangProvider, useLang() hook
 * Persists language choice to localStorage (key: 'kpbu-lang')
 * Default: 'id' (Indonesia)
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Lang, type TDict, T } from './i18n'

type LangContextValue = {
    lang: Lang
    setLang: (l: Lang) => void
    t: TDict
}

const LangContext = createContext<LangContextValue>({
    lang: 'id',
    setLang: () => { },
    t: T.id as TDict,
})

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('id')

    // Restore from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('kpbu-lang') as Lang | null
        if (saved === 'id' || saved === 'en') setLangState(saved)
    }, [])

    const setLang = (l: Lang) => {
        setLangState(l)
        localStorage.setItem('kpbu-lang', l)
    }

    return (
        <LangContext.Provider value={{ lang, setLang, t: T[lang] as TDict }}>
            {children}
        </LangContext.Provider>
    )
}

/** Hook: const { lang, setLang, t } = useLang() */
export function useLang() {
    return useContext(LangContext)
}
