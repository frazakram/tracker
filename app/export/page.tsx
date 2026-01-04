"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useHabitStore } from "@/store/useHabitStore"
import { Download, FileJson, Sheet } from "lucide-react"

function downloadText(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const habits = useHabitStore((s) => s.habits)
  const completions = useHabitStore((s) => s.completions)
  const completionNotes = useHabitStore((s) => s.completionNotes)
  const unlockedBadges = useHabitStore((s) => s.unlockedBadges)
  const longestStreak = useHabitStore((s) => s.longestStreak)

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      habits,
      completions,
      achievements: {
        unlockedBadges,
        longestStreak,
      },
    }
    downloadText(
      `routely-export-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
      JSON.stringify(payload, null, 2)
    )
  }

  const exportCsv = () => {
    const habitNameById = new Map(habits.map((h) => [h.id, h.name]))

    const esc = (v: string) => `"${v.replaceAll('"', '""')}"`
    const rows: string[] = ["habit_id,habit_name,completed_date,note"]

    Object.entries(completions).forEach(([habitId, dates]) => {
      const name = habitNameById.get(habitId) || ""
      dates.forEach((d) => {
        const note = completionNotes[habitId]?.[d] || ""
        rows.push([esc(habitId), esc(name), esc(d), esc(note)].join(","))
      })
    })
    downloadText(
      `routely-completions-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv",
      rows.join("\n")
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Data Export</h1>
            <p className="text-white/60 mt-2">
              Download a backup of your habits, completions, and achievements.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/60">
            <Download className="h-4 w-4" />
            <span className="text-sm font-semibold">Backup</span>
          </div>
        </div>

        <Card className="glass-panel-strong border border-white/10 rounded-3xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white/80">Export (JSON)</div>
              <div className="text-sm text-white/60">
                Full backup including habits, completions, and achievements.
              </div>
            </div>
            <Button
              onClick={exportJson}
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white"
            >
              <FileJson className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </Card>

        <Card className="glass-panel-strong border border-white/10 rounded-3xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white/80">Export (CSV)</div>
              <div className="text-sm text-white/60">
                Completions only (useful for spreadsheets).
              </div>
            </div>
            <Button
              onClick={exportCsv}
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white"
            >
              <Sheet className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}


