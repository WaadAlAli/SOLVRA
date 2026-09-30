import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('solvra-theme')

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    const nextIsDark = !isDark

    setIsDark(nextIsDark)

    if (nextIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('solvra-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('solvra-theme', 'light')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="
        flex h-9 w-9 items-center justify-center rounded-full
        border border-[var(--border)]
        bg-[var(--bg-secondary)]
        text-[var(--text-primary)]
        transition-all duration-300
        hover:border-[var(--border-strong)]
        hover:scale-105
      "
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export default ThemeToggle
