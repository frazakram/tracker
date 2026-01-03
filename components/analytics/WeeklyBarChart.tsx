"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { useHabitStore } from "@/store/useHabitStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

export function WeeklyBarChart() {
  const { completions } = useHabitStore()

  const data = useMemo(() => {
    const end = endOfWeek(new Date())
    const start = startOfWeek(new Date())
    const days = eachDayOfInterval({ start, end })

    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      const count = Object.values(completions).reduce((acc, dates) => {
        return acc + (dates.includes(dateStr) ? 1 : 0)
      }, 0)

      return {
        day: format(day, "EEE"), // Mon, Tue...
        completions: count
      }
    })
  }, [completions])

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Performance</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: "8px", border: "none" }}
            />
            <Bar
              dataKey="completions"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
