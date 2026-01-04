"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Trash2, Check, Archive, MessageSquareText } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Habit, useHabitStore } from "@/store/useHabitStore"
// import { Checkbox } from "@/components/ui/Checkbox" // Removed as we use EmojiPicker now
import { EmojiPicker } from "./EmojiPicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


interface HabitRowProps {
  habit: Habit
  days: Date[]
}

export function HabitRow({ habit, days }: HabitRowProps) {
  const { toggleHabit, completions, deleteHabit, habits, saveHabitUpdates, archiveHabit, completionNotes, saveCompletionNote } = useHabitStore()
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(habit.name)
  const [noteDraft, setNoteDraft] = useState("")
  const [openNoteForDate, setOpenNoteForDate] = useState<string | null>(null)

  const habitCompletions = completions[habit.id] || []

  const isCompleted = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return habitCompletions.includes(dateStr)
  }

  const handleToggle = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const wasCompleted = isCompleted(date)
    toggleHabit(habit.id, dateStr)

    // Check if this completion brings the day to 100%
    if (!wasCompleted) {
      // Count completions for this day across all habits
      let completedCount = 0
      habits.forEach(h => {
        if (completions[h.id]?.includes(dateStr)) {
          completedCount++
        }
      })

      // If we just completed the last habit for the day, celebrate!
      if (completedCount + 1 === habits.length) {
        // Snappy celebration (fast burst, short duration)
        const origin = { y: 0.65 }
        requestAnimationFrame(() => {
          confetti({
            particleCount: 90,
            spread: 80,
            startVelocity: 52,
            gravity: 1.25,
            ticks: 170,
            scalar: 0.9,
            origin,
            disableForReducedMotion: true,
          })
          confetti({
            particleCount: 55,
            spread: 120,
            startVelocity: 62,
            gravity: 1.15,
            ticks: 155,
            scalar: 0.85,
            origin,
            disableForReducedMotion: true,
          })
        })
      }
    }
  }

  return (
    <div className="flex border-b border-white/10 hover:bg-white/5 transition-colors h-12">
      {/* Habit Name Column (Sticky) */}
      <div className="sticky left-0 z-10 w-64 min-w-[16rem] glass-panel border-r border-white/10 flex items-center px-3 gap-3 group">
        {/* Emoji Picker for Habit */}
        <div className="flex items-center justify-center">
            <EmojiPicker 
              currentEmoji={habit.emoji} 
              onChange={(emoji) => saveHabitUpdates(habit.id, { emoji })} 
            />
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const next = draftName.trim()
                if (!next) return
                const err = await saveHabitUpdates(habit.id, { name: next })
                if (!err) setIsEditing(false)
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="h-8 bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-sky-400/20"
                autoFocus
              />
              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <Check className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftName(habit.name)
                setIsEditing(true)
              }}
              className="text-sm font-semibold text-white truncate text-left w-full hover:opacity-90"
              title="Click to edit"
            >
              {habit.name}
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-white/35 hover:text-red-300 transition-opacity"
          onClick={() => deleteHabit(habit.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-white/35 hover:text-amber-200 transition-opacity"
          onClick={() => archiveHabit(habit.id)}
          title="Archive habit"
        >
          <Archive className="h-3 w-3" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="flex flex-1">
        {days.map((date) => {
          const completed = isCompleted(date)
          const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
          const dateStr = format(date, "yyyy-MM-dd")
          const note = completionNotes[habit.id]?.[dateStr] || ""

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "flex items-center justify-center border-r border-white/10 last:border-r-0 relative group/cell",
                isTodayDate && "bg-sky-500/10",
                days.length <= 7 ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]"
              )}
            >
              <div
                onClick={() => handleToggle(date)}
                className={cn(
                  "h-8 w-8 rounded cursor-pointer flex items-center justify-center transition-all duration-200",
                  completed
                    ? "bg-emerald-500/15 border border-emerald-400/40 shadow-sm scale-95"
                    : cn(
                        "bg-white/5 border border-white/15 hover:border-sky-300/40",
                        isTodayDate && "border-sky-300/40 bg-white/10 ring-2 ring-sky-400/20 ring-offset-0"
                      )
                )}
              >
                {completed && (
                  <Check className="h-5 w-5 text-emerald-200" strokeWidth={4} />
                )}
              </div>

              {/* Notes (only for completed cells) */}
              {completed && (
                <div className="absolute -right-1 -top-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                  <Popover
                    open={openNoteForDate === dateStr}
                    onOpenChange={(open) => {
                      if (open) {
                        setNoteDraft(note)
                        setOpenNoteForDate(dateStr)
                      } else if (openNoteForDate === dateStr) {
                        setOpenNoteForDate(null)
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="h-6 w-6 rounded-full glass-panel border border-white/10 hover:bg-white/10 flex items-center justify-center"
                        aria-label="Add note"
                        title={note ? "Edit note" : "Add note"}
                      >
                        <MessageSquareText className={cn("h-3 w-3", note ? "text-amber-200" : "text-white/60")} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-72 glass-panel-strong border border-white/10 text-white rounded-2xl"
                    >
                      <div className="space-y-3">
                        <div className="text-sm font-bold">Note</div>
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          className="w-full min-h-[90px] rounded-xl bg-white/10 border border-white/15 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                          placeholder="What helped today? What blocked you?"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                            onClick={async () => {
                              await saveCompletionNote(habit.id, dateStr, noteDraft)
                              setOpenNoteForDate(null)
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
