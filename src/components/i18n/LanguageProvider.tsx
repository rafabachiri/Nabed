"use client"

import { createContext, useContext } from "react"
import { type Locale, type Dict, getDictionary } from "@/lib/i18n"

interface LanguageContextValue {
  locale: Locale
  t: Dict
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "fr",
  t: getDictionary("fr"),
})

export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <LanguageContext.Provider value={{ locale, t: getDictionary(locale) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
