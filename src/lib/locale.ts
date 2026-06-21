import { cookies } from "next/headers"
import { type Locale, LOCALE_COOKIE, DEFAULT_LOCALE, getDictionary } from "@/lib/i18n"

// Server-side locale resolution (App Router server components).
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value
  return value === "en" ? "en" : DEFAULT_LOCALE
}

export function getT() {
  return getDictionary(getLocale())
}
