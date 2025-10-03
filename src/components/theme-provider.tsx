import React, { useLayoutEffect, useMemo, useState } from "react"
import { ThemeProviderContext } from "../utils/theme-context"
import type { Theme } from "../utils/theme-context"

function readStoredTheme(storageKey: string): Theme | null {
  try {
    if (typeof window === "undefined") return null
    const v = localStorage.getItem(storageKey)
    if (v === "dark" || v === "light" || v === "system") return v
    return null
  } catch {
    return null
  }
}

function applyDocumentTheme(theme: Theme) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.remove("light", "dark")

  if (theme === "system") {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.add(prefersDark ? "dark" : "light")
    return
  }
  root.classList.add(theme)
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  useLayoutEffect(() => {
    const stored = readStoredTheme(storageKey)
    const effective = stored ?? defaultTheme
    applyDocumentTheme(effective)
    if (stored && stored !== theme) {
      setThemeState(stored)
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(storageKey, theme)
    } catch {
      /* ignore */
    }
    applyDocumentTheme(theme)
  }, [theme, storageKey])

  const value = useMemo(
    () => ({
      theme,
      setTheme: (t: Theme) => setThemeState(t),
    }),
    [theme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
