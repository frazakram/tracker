"use client"

import { format, isToday } from "date-fns"
import { Trash2, Check } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Habit, useHabitStore } from "@/store/useHabitStore"
// import { Checkbox } from "@/components/ui/Checkbox" // Removed as we use EmojiPicker now
import { EmojiPicker } from "./EmojiPicker"


interface HabitRowProps {
  habit: Habit
  days: Date[]
}

export function HabitRow({ habit, days }: HabitRowProps) {
  const { toggleHabit, completions, deleteHabit, habits } = useHabitStore()

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
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    }
  }

  return (
    <div className="flex border-b border-gray-200 hover:bg-green-50/50 transition-colors h-12">
      {/* Habit Name Column (Sticky) */}
      <div className="sticky left-0 z-10 w-64 min-w-[16rem] bg-white border-r border-gray-200 flex items-center px-3 gap-3 group">
        {/* Emoji Picker for Habit */}
        <div className="flex items-center justify-center">
            <EmojiPicker 
              currentEmoji={habit.emoji} 
              onChange={(emoji) => useHabitStore.getState().updateHabit(habit.id, { emoji })} 
            />
        </div>

        <span className="text-sm font-semibold text-gray-800 truncate flex-1" title={habit.name}>
          {habit.name}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
          onClick={() => deleteHabit(habit.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Days Grid */}
      <div className="flex flex-1">
        {days.map((date) => {
          const completed = isCompleted(date)
          const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

          return (
            <div
              key={date.toISOString()}
              className={cn(
                "flex items-center justify-center border-r border-gray-200 last:border-r-0 relative group/cell",
                isTodayDate && "bg-green-500/10",
                days.length <= 7 ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]"
              )}
            >
              <div
                onClick={() => handleToggle(date)}
                className={cn(
                  "h-8 w-8 rounded cursor-pointer flex items-center justify-center transition-all duration-200",
                  completed
                    ? "bg-green-50 border-2 border-green-500 shadow-sm scale-95"
                    : cn(
                        "bg-gray-50 border-2 border-gray-200 hover:border-green-300",
                        isTodayDate && "border-green-600 bg-white ring-2 ring-green-400 ring-offset-1"
                      )
                )}
              >
                {completed && (
                  <Check className="h-5 w-5 text-green-600" strokeWidth={4} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
