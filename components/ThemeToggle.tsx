'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('system')
    } else {
      setTheme('dark')
    }
  }

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="w-5 h-5" />
    } else if (theme === 'light') {
      return <Sun className="w-5 h-5" />
    } else {
      return <Monitor className="w-5 h-5" />
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded border border-foreground/40 hover:bg-foreground hover:text-background transition-colors"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  )
}
