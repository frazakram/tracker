"use client"

import { useState } from "react"
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
import { ChevronLeft, ChevronRight, Plus, LogOut } from "lucide-react"
import { signout } from "@/app/actions/auth"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useHabitStore } from "@/store/useHabitStore"
import { HabitRow } from "./HabitRow"

export function HabitGrid() {
  const { habits, addHabit, selectedDate, setSelectedDate, completions } = useHabitStore()
  const [newHabitName, setNewHabitName] = useState("")
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

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
    <div className="flex flex-col bg-white overflow-hidden shadow-lg border-2 border-gray-300 rounded-lg">
      {/* Spreadsheet Toolbar */}
      <div className="bg-white border-b-2 border-gray-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           {/* Date Nav */}
           <div className="flex items-center bg-white border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
             <button onClick={handlePrev} className="px-3 py-2 hover:bg-gray-100 border-r-2 border-gray-800 active:bg-gray-200 transition-colors">
               <ChevronLeft className="h-5 w-5 text-gray-800" />
             </button>
             <div className="px-6 py-2 text-lg font-bold text-gray-800 uppercase tracking-widest bg-white min-w-[140px] text-center">
               {viewMode === 'month' 
                 ? format(selectedDate, "MMM yyyy")
                 : `${format(daysInMonth[0], "MMM d")} - ${format(daysInMonth[6], "MMM d")}`
               }
             </div>
             <button onClick={handleNext} className="px-3 py-2 hover:bg-gray-100 border-l-2 border-gray-800 active:bg-gray-200 transition-colors">
               <ChevronRight className="h-5 w-5 text-gray-800" />
             </button>
           </div>
           
           {/* View Toggle */}
           <div className="flex bg-gray-200 p-1 rounded-lg border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button 
                onClick={() => setViewMode('week')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded transition-all",
                  viewMode === 'week' 
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-300/50"
                )}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded transition-all",
                  viewMode === 'month' 
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-300/50"
                )}
              >
                Month
              </button>
           </div>
           
           <div className="text-4xl font-extrabold text-gray-200 select-none hidden md:block tracking-tighter">
             HABIT TRACKER
           </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleAddHabit} className="flex gap-0 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
            <Input 
              placeholder="New Task..." 
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="h-12 w-64 rounded-none border-2 border-gray-800 focus:ring-0 focus:border-gray-800 text-lg"
            />
            <Button type="submit" className="h-12 w-12 rounded-none bg-white border-y-2 border-r-2 border-gray-800 hover:bg-green-50 text-gray-800 p-0">
              <Plus className="h-6 w-6" />
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm font-bold absolute top-20 right-4 bg-white p-2 rounded shadow-lg border border-red-200 z-50">{error}</p>}

          {/* Logout Button */}
          <button
            onClick={() => signout()}
            className="h-12 px-6 flex items-center gap-2 bg-white border-2 border-red-600 rounded hover:bg-red-50 active:bg-red-100 transition-colors shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] group"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-red-600" />
            <span className="hidden lg:inline font-bold text-red-600">Logout</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="overflow-auto custom-scrollbar bg-white">
        <div className="inline-block min-w-full align-middle">
          {/* Calendar Header Row */}
          <div className="flex border-b-2 border-gray-800 bg-[#4ade80]">
            <div className="sticky left-0 z-30 w-64 min-w-[16rem] bg-green-400 p-3 pl-4 font-extrabold text-xl text-white uppercase tracking-tight flex items-center border-r-2 border-gray-800 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
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
                 let colorClasses = "bg-green-400 border-green-600/30" // Default/Future
                 if (isTodayDate) colorClasses = "bg-green-700 border-green-800 shadow-inner" // Fallback class
                 else if (isPastDate) colorClasses = "bg-gray-200 border-gray-300" 

                 return (
                  <div 
                    key={date.toISOString()} 
                    className={cn(
                      "py-2 flex flex-col items-center justify-between border-r border-gray-300 last:border-r-0 relative group", 
                      colorClasses,
                      viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]"
                    )}
                    style={isTodayDate ? { backgroundColor: '#15803d', borderColor: '#166534' } : undefined} // Dark Green (Green-700)
                  >
                     {/* Date Header Checkbox (Visual "at date") */}
                    <div className="mb-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className={cn("h-3 w-3 border rounded-[1px]", isTodayDate || isPastDate ? "border-gray-500" : "border-green-800")} />
                    </div>
                    
                    <div className="text-center">
                    {isTodayDate && <span className="block text-[8px] font-bold text-green-400 tracking-widest mb-0.5">TODAY</span>}
                    <span className={cn("block text-[10px] uppercase font-bold leading-none", isTodayDate ? "text-white" : (isPastDate ? "text-gray-700" : "text-green-900"))}>{format(date, "EEE")}</span>
                    <span className={cn("block text-xl font-black leading-none mt-1", isTodayDate ? "text-white" : (isPastDate ? "text-gray-800" : "text-white"))}>{format(date, "d")}</span>
                  </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rows */}
          <div className="bg-white">
            {habits.length === 0 ? (
               <div className="p-12 text-center text-gray-400 italic bg-gray-50">
                 No habits found. Add one to get started!
               </div>
            ) : (
              habits.map((habit, index) => (
                <div key={habit.id} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-green-50/10')}>
                  <HabitRow habit={habit} days={daysInMonth} />
                </div>
              ))
            )}
          </div>

          {/* Footer Stats Row */}
          <div className="border-t-4 border-gray-300 mt-2">
             {/* Progress % */}
             <div className="flex h-10 border-b border-gray-200 bg-gray-100">
                <div className="sticky left-0 z-20 w-64 min-w-[16rem] bg-gray-100 px-4 flex items-center font-bold text-gray-600 border-r border-gray-300 shadow-[4px_0_5px_rgba(0,0,0,0.05)]">
                  Progress
                </div>
                <div className="flex flex-1">
                   {daysInMonth.map(date => {
                     const { progress } = getDailyStats(date)
                     const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                     return (
                       <div key={date.toISOString()} className={cn("flex items-end justify-center border-r border-gray-300 text-xs font-bold text-gray-700 relative", isTodayDate && "bg-green-500/10", viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]")}>
                         {/* Moving Bar Background */}
                         <div 
                           className="absolute bottom-0 left-0 w-full bg-[#4ade80] opacity-30 transition-all duration-500 ease-out"
                           style={{ height: `${progress}%` }}
                         />
                         <span className="relative z-10 mb-2">{progress}%</span>
                       </div>
                     )
                   })}
                </div>
             </div>

             {/* Done Count */}
             <div className="flex h-10 border-b border-gray-200 bg-gray-50">
                <div className="sticky left-0 z-20 w-64 min-w-[16rem] bg-gray-50 px-4 flex items-center font-bold text-gray-600 border-r border-gray-300 shadow-[4px_0_5px_rgba(0,0,0,0.05)]">
                  Done
                </div>
                <div className="flex flex-1">
                   {daysInMonth.map(date => {
                     const { done } = getDailyStats(date)
                     const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                     return (
                       <div key={date.toISOString()} className={cn("flex items-center justify-center border-r border-gray-300 text-xs font-medium text-gray-500", isTodayDate && "bg-green-500/10", viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]")}>
                         {done}
                       </div>
                     )
                   })}
                </div>
             </div>

             {/* Not Done Count */}
             <div className="flex h-10 bg-gray-100">
                <div className="sticky left-0 z-20 w-64 min-w-[16rem] bg-gray-100 px-4 flex items-center font-bold text-gray-600 border-r border-gray-300 shadow-[4px_0_5px_rgba(0,0,0,0.05)]">
                  Not Done
                </div>
                <div className="flex flex-1">
                   {daysInMonth.map(date => {
                     const { notDone } = getDailyStats(date)
                     const isTodayDate = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                     return (
                       <div key={date.toISOString()} className={cn("flex items-center justify-center border-r border-gray-300 text-xs font-medium text-gray-500", isTodayDate && "bg-green-500/10", viewMode === 'week' ? "flex-1 min-w-[3rem]" : "w-12 min-w-[3rem]")}>
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
