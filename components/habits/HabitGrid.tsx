"use client"

import { useEffect, useState } from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isToday,
  isBefore,
  startOfDay,
  isSameDay
} from "date-fns"
import { ChevronLeft, ChevronRight, GripVertical, Plus } from "lucide-react"
import { Reorder, useDragControls } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Habit, useHabitStore } from "@/store/useHabitStore"
import { HabitRow } from "./HabitRow"

function WaterProgress({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="relative h-full w-full px-1.5 pb-1.5 pt-1">
      <div className="relative h-full w-full overflow-hidden rounded-md border border-white/15 bg-black/15">
        {/* bucket highlight */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

        {/* water fill */}
        <div
          className="absolute inset-x-0 bottom-0 water-fill transition-[height] duration-500 ease-out"
          style={{ height: `${clamped}%` }}
        >
          {/* surface wave */}
          <div className="absolute -top-1 left-0 right-0 h-3 water-surface" />
        </div>

        {/* percent label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black text-white/90 drop-shadow">
            {clamped}%
          </span>
        </div>
      </div>
    </div>
  )
}

function ReorderableHabitRow({ habit, days }: { habit: Habit; days: Date[] }) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={habit}
      id={habit.id}
      dragListener={false}
      dragControls={dragControls}
      className="select-none"
    >
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover/row:flex">
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            className="h-7 w-7 rounded-lg glass-panel border border-white/10 hover:bg-white/10 flex items-center justify-center"
            aria-label="Drag to reorder"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-white/70" />
          </button>
        </div>
        <div className="group/row">
          <HabitRow habit={habit} days={days} />
        </div>
      </div>
    </Reorder.Item>
  )
}

export function HabitGrid() {
  const { habits, addHabit, selectedDate, setSelectedDate, completions, reorderHabits } = useHabitStore()
  const [newHabitName, setNewHabitName] = useState("")
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [orderedHabits, setOrderedHabits] = useState(habits)

  useEffect(() => {
    setOrderedHabits(habits)
  }, [habits])

  // Persist order after drag-drop settles (light debounce)
  useEffect(() => {
    if (orderedHabits.length === 0) return
    const idList = orderedHabits.map(h => h.id)
    const t = window.setTimeout(() => {
      // avoid calling if it's the same order
      const currentIds = habits.map(h => h.id)
      const same =
        currentIds.length === idList.length &&
        currentIds.every((id, idx) => id === idList[idx])
      if (!same) {
        reorderHabits(idList)
      }
    }, 450)
    return () => window.clearTimeout(t)
  }, [orderedHabits, habits, reorderHabits])

  const daysInMonth = viewMode === 'month' 
    ? eachDayOfInterval({ 
        start: startOfMonth(selectedDate), 
        end: endOfMonth(selectedDate) 
      })
    : eachDayOfInterval({ 
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }), 
        end: endOfWeek(selectedDate, { weekStartsOn: 1 }) 
      })

  const [error, setError] = useState<string | null>(null)

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return
    setError(null)
    
    const err = await addHabit(newHabitName)
    if (err) {
      setError(err)
    } else {
      setNewHabitName("")
    }
  }

  const handlePrev = () => {
    if (viewMode === 'month') setSelectedDate(subMonths(selectedDate, 1))
    else setSelectedDate(subWeeks(selectedDate, 1))
  }
  
  const handleNext = () => {
    if (viewMode === 'month') setSelectedDate(addMonths(selectedDate, 1))
    else setSelectedDate(addWeeks(selectedDate, 1))
  }

  // Calculation Helper
  const getDailyStats = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    let done = 0
    habits.forEach(habit => {
      if (completions[habit.id]?.includes(dateStr)) {
        done++
      }
    })
    const notDone = habits.length - done
    const progress = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0
    return { done, notDone, progress }
  }

  return (
    <div className="flex flex-col glass-panel-strong overflow-hidden shadow-[0_30px_90px_-60px_rgba(0,0,0,0.85)] border border-white/10 rounded-3xl">
      {/* Spreadsheet Toolbar */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           {/* Date Nav */}
           <div className="flex items-center glass-panel border border-white/10 rounded-xl overflow-hidden">
             <button onClick={handlePrev} className="px-3 py-2 hover:bg-white/10 active:bg-white/15 transition-colors">
               <ChevronLeft className="h-5 w-5 text-white/80" />
             </button>
             <div className="px-6 py-2 text-lg font-bold text-white uppercase tracking-widest min-w-[140px] text-center border-x border-white/10">
               {viewMode === 'month' 
                 ? format(selectedDate, "MMM yyyy")
                 : `${format(daysInMonth[0], "MMM d")} - ${format(daysInMonth[6], "MMM d")}`
               }
             </div>
             <button onClick={handleNext} className="px-3 py-2 hover:bg-white/10 active:bg-white/15 transition-colors">
               <ChevronRight className="h-5 w-5 text-white/80" />
             </button>
           </div>
           
           {/* View Toggle */}
           <div className="flex glass-panel p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setViewMode('week')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                  viewMode === 'week' 
                    ? "bg-white/15 text-white border border-white/10" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                  viewMode === 'month' 
                    ? "bg-white/15 text-white border border-white/10" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                Month
              </button>
           </div>
           
           <div className="text-3xl font-extrabold text-white/10 select-none hidden md:block tracking-tighter">
             HABIT TRACKER
           </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleAddHabit} className="flex gap-0">
            <Input 
              placeholder="New Task..." 
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="h-12 w-64 rounded-l-xl rounded-r-none border border-white/10 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-sky-400/30 focus-visible:border-sky-300/40 text-base"
            />
            <Button type="submit" className="h-12 w-12 rounded-r-xl rounded-l-none bg-white/10 border border-white/10 hover:bg-white/15 text-white p-0">
              <Plus className="h-6 w-6 text-sky-200" />
            </Button>
          </form>
          {error && <p className="text-red-200 text-sm font-bold absolute top-20 right-4 bg-black/40 p-2 rounded shadow-lg border border-red-400/20 z-50">{error}</p>}
        </div>
      </div>

      {/* Grid Content */}
      <div className="overflow-auto custom-scrollbar bg-transparent">
        <div className="inline-block min-w-full align-middle">
          {/* Calendar Header Row */}
          <div className="flex border-b border-white/10 bg-white/5">
            <div className="sticky left-0 z-30 w-64 min-w-[16rem] glass-panel p-3 pl-4 font-extrabold text-xl text-white uppercase tracking-tight flex items-center border-r border-white/10">
              My Habits
            </div>
            {/* Remove justify-center loop, use flex-1 on items instead */}
            <div className="flex flex-1">
              {daysInMonth.map((date) => {
                 // Robust date comparison using strings to avoid time/timezone issues
                 const dateStr = format(date, "yyyy-MM-dd")
                 const todayStr = format(new Date(), "yyyy-MM-dd")
                 
                 const isTodayDate = dateStr === todayStr
                 const isPastDate = dateStr < todayStr
                 
                 // Explicit background classes to avoid merging issues
                 let colorClasses = "bg-white/5 border-white/10" // Default/Future
                 if (isTodayDate) colorClasses = "bg-sky-500/20 border-sky-300/30" // Today highlight
                 else if (isPastDate) colorClasses = "bg-white/5 border-white/10 opacity-70" 

                 return (
                  <div 
                    key={date.toISOString()} 
                    className={cn(
                      "py-2 flex flex-col items-center justify-between border-r border-white/10 last:border-r-0 relative group", 
                      colorClasses,
                      viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]"
                    )}
                  >
                     {/* Date Header Checkbox (Visual "at date") */}
                    <div className="mb-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className={cn("h-3 w-3 border rounded-[1px]", "border-white/40")} />
                    </div>
                    
                    <div className="text-center">
                    {isTodayDate && <span className="block text-[8px] font-bold text-sky-200 tracking-widest mb-0.5">TODAY</span>}
                    <span className={cn("block text-[10px] uppercase font-bold leading-none", "text-white/70")}>{format(date, "EEE")}</span>
                    <span className={cn("block text-xl font-black leading-none mt-1", "text-white")}>{format(date, "d")}</span>
                  </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rows */}
          <div className="bg-transparent">
            {habits.length === 0 ? (
               <div className="p-12 text-center text-white/60 italic bg-white/5">
                 No habits found. Add one to get started!
               </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={orderedHabits}
                onReorder={(next) => setOrderedHabits(next)}
                className="flex flex-col"
              >
                {orderedHabits.map((habit, index) => (
                  <div key={habit.id} className={cn(index % 2 === 0 ? 'bg-transparent' : 'bg-white/0')}>
                    <ReorderableHabitRow habit={habit} days={daysInMonth} />
                  </div>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Footer Stats Row */}
          <div className="border-t border-white/10 mt-2">
             {/* Progress % */}
             <div className="flex h-10 border-b border-white/10 bg-white/5">
                <div className="sticky left-0 z-20 w-64 min-w-[16rem] glass-panel px-4 flex items-center font-bold text-white/70 border-r border-white/10">
                  Progress
                </div>
                <div className="flex flex-1">
                   {daysInMonth.map(date => {
                     const { progress } = getDailyStats(date)
                     const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                     return (
                       <div
                         key={date.toISOString()}
                         className={cn(
                           "border-r border-white/10 relative",
                           isTodayDate && "bg-sky-500/10",
                           viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]"
                         )}
                       >
                         <WaterProgress percent={progress} />
                       </div>
                     )
                   })}
                </div>
             </div>

             {/* Done Count */}
             <div className="flex h-10 border-b border-white/10 bg-white/5">
                <div className="sticky left-0 z-20 w-64 min-w-[16rem] glass-panel px-4 flex items-center font-bold text-white/70 border-r border-white/10">
                  Done
                </div>
                <div className="flex flex-1">
                   {daysInMonth.map(date => {
                     const { done } = getDailyStats(date)
                     const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                     return (
                       <div key={date.toISOString()} className={cn("flex items-center justify-center border-r border-white/10 text-xs font-medium text-white/60", isTodayDate && "bg-sky-500/10", viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]")}>
                         {done}
                       </div>
                     )
                   })}
                </div>
             </div>

             {/* Not Done Count */}
             <div className="flex h-10 bg-white/5">
                <div className="sticky left-0 z-20 w-64 min-w-[16rem] glass-panel px-4 flex items-center font-bold text-white/70 border-r border-white/10">
                  Not Done
                </div>
                <div className="flex flex-1">
                   {daysInMonth.map(date => {
                     const { notDone } = getDailyStats(date)
                     const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                     return (
                       <div key={date.toISOString()} className={cn("flex items-center justify-center border-r border-white/10 text-xs font-medium text-white/60", isTodayDate && "bg-sky-500/10", viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]")}>
                         {notDone}
                       </div>
                     )
                   })}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
