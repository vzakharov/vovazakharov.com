'use client'

import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

export function LocalePicker() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isI18nPage = pathname === '/cv'
  
  if (!mounted || !isI18nPage) {
    return null
  }

  const currentLocale = locale as string
  const nextLocale = currentLocale === 'en' ? 'ru' : 'en'
  const currentFlag = currentLocale === 'en' ? '🇬🇧' : '🇷🇺'

  const toggleLocale = () => {
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button
      onClick={toggleLocale}
      className="p-2 rounded border border-foreground/40 hover:bg-foreground hover:text-background transition-colors text-lg"
      aria-label={`Switch to ${nextLocale === 'en' ? 'English' : 'Russian'}`}
    >
      {currentFlag}
    </button>
  )
}

