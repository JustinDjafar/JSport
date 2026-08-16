import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'id'
const STORAGE_KEY = 'jsport-language'

function initialLanguage(): Language {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'id') return saved
  return navigator.languages.some(value => value.toLowerCase().split('-')[0] === 'id') ? 'id' : 'en'
}

const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void } | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])
  const value = useMemo(() => ({ language, setLanguage }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
