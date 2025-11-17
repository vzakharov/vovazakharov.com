'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-20 h-8" />
  }

  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-foreground text-background' : 'opacity-50'}`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-foreground text-background' : 'opacity-50'}`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1 rounded ${theme === 'system' ? 'bg-foreground text-background' : 'opacity-50'}`}
      >
        Auto
      </button>
    </div>
  )
}
