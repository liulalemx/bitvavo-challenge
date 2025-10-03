// src/providers/theme-context.ts
import { createContext, useContext } from "react"

export type Theme = "dark" | "light" | "system"

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Create context but do NOT export any React components from this file.
export const ThemeProviderContext = createContext<
  ThemeProviderState | undefined
>(undefined)

export function useTheme(): ThemeProviderState {
  const ctx = useContext(ThemeProviderContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
