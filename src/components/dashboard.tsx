"use client"

import FeesTable from "./fees-table"
import { ModeToggle } from "./mode-toggle"

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="@/../public/bitvavo-mark-and-logo-black.png"
              alt="Bitvavo"
              className="h-8 dark:hidden"
            />
            <img
              src="@/../public/bitvavo-mark-and-logo-white.png"
              alt="Bitvavo"
              className="h-8 hidden dark:block"
            />
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold text-foreground">
              Fee Analytics
            </h1>
          </div>
          <ModeToggle />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <FeesTable />
      </div>
    </div>
  )
}

export default Dashboard
