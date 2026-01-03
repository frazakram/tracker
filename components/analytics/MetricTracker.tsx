"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { useHabitStore } from "@/store/useHabitStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export function MetricTracker() {
  const { dailyMetrics, setMetric, selectedDate } = useHabitStore()

  const data = useMemo(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    const days = eachDayOfInterval({ start, end })

    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      return {
        date: format(day, "d"),
        fullDate: dateStr,
        value: dailyMetrics[dateStr] || 0
      }
    })
  }, [dailyMetrics, selectedDate])

  const todayStr = format(new Date(), "yyyy-MM-dd")
  const currentMetric = dailyMetrics[todayStr] ?? ""

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Mood / Energy Tracker</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">Today:</span>
            <Input
              type="number"
              className="w-20 h-8"
              min={0}
              max={10}
              value={currentMetric}
              onChange={(e) => setMetric(todayStr, parseInt(e.target.value) || 0)}
              placeholder="1-10"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
