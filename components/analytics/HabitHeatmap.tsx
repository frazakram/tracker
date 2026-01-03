"use client"

import { useState } from "react"
import { useHabitStore } from "@/store/useHabitStore"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths,
  isSameDay
} from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function HabitHeatmap() {
  const { habits, completions } = useHabitStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Generate calendar days for the current view
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  // Calculate stats for the current month
  const currentMonthStr = format(currentMonth, "yyyy-MM")
  const currentMonthReps = habits.reduce((acc, habit) => {
    const habitCompletions = completions[habit.id] || []
    return acc + habitCompletions.filter(dateStr => dateStr.startsWith(currentMonthStr)).length
  }, 0)

  // Helper to get intensity (same as before)
  const getIntensity = (date: Date) => {
    if (habits.length === 0) return 0
    const dateStr = format(date, "yyyy-MM-dd")
    let completedCount = 0
    habits.forEach(habit => {
      if (completions[habit.id]?.includes(dateStr)) {
        completedCount++
      }
    })
    return completedCount / habits.length
  }

  // Helper to get color (same as before)
  const getColor = (intensity: number) => {
    if (intensity === 0) return undefined // Handled by class
    if (intensity <= 0.25) return '#bbf7d0' // 1-25%
    if (intensity <= 0.5) return '#4ade80'  // 26-50%
    if (intensity <= 0.75) return '#16a34a' // 51-75%
    return '#15803d'                        // 76-100%
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  return (
    <div className="w-full max-w-4xl mx-auto border border-gray-200 rounded-xl p-6 bg-white shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-6">
             <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        {currentMonthReps} reps in {format(currentMonth, "MMMM")}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Consistency Map
                    </p>
                </div>
                
                {/* Month Navigation */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateMonth('prev')}
                        className="h-8 w-8 hover:bg-white hover:shadow-sm"
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </Button>
                    <span className="text-sm font-bold text-gray-700 w-32 text-center select-none">
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateMonth('next')}
                        className="h-8 w-8 hover:bg-white hover:shadow-sm"
                    >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>
             </div>

             {/* Legend */}
             <div className="flex items-center text-xs text-gray-500 self-end">
                <span className="mr-2">Less</span>
                <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-md border border-gray-100 bg-gray-50" /> {/* 0% */}
                    <div style={{ background: '#bbf7d0' }} className="w-5 h-5 rounded-md border border-transparent" />
                    <div style={{ background: '#4ade80' }} className="w-5 h-5 rounded-md border border-transparent" />
                    <div style={{ background: '#16a34a' }} className="w-5 h-5 rounded-md border border-transparent" />
                    <div style={{ background: '#15803d' }} className="w-5 h-5 rounded-md border border-transparent shadow-[0_0_8px_rgba(21,128,61,0.6)]" /> {/* 100% */}
                </div>
                <span className="ml-2">More</span>
            </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="w-full">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, i) => {
                    const intensity = getIntensity(day)
                    const isFull = intensity === 1
                    const isEmpty = intensity === 0
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    
                    return (
                        <div 
                            key={day.toISOString()} 
                            className={cn(
                                "h-20 sm:h-24 rounded-lg flex items-start justify-start p-2 relative group transition-all duration-300", // Fixed Height
                                !isCurrentMonth && "opacity-30 grayscale", // Dim days not in current month
                                isEmpty ? "bg-gray-50 border border-gray-100" : "border border-transparent"
                            )}
                            style={{ 
                                backgroundColor: isEmpty ? undefined : getColor(intensity),
                                boxShadow: isFull ? '0 0 12px rgba(21, 128, 61, 0.4)' : 'none',
                                transform: isFull ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            {/* Date Number */}
                            <span className={cn(
                                "text-xs font-bold z-10",
                                isEmpty ? "text-gray-400" : "text-green-900/80 mix-blend-multiply"
                            )}>
                                {format(day, "d")}
                            </span>

                            {/* Hover Tooltip */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block z-50 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                                {format(day, "MMM d")}: {Math.round(intensity * 100)}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  )
}
