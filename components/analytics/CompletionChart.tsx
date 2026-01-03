"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns"
import { useHabitStore } from "@/store/useHabitStore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"

export function CompletionChart() {
  const { completions } = useHabitStore()

  const data = useMemo(() => {
    // Generate last 14 days
    const end = startOfDay(new Date())
    const start = subDays(end, 13)
    const days = eachDayOfInterval({ start, end })

    return days.map(day => {
      const dateStr = format(day, "yyyy-MM-dd")
      // Sum completions for this day across all habits
      const count = Object.values(completions).reduce((acc, dates) => {
        return acc + (dates.includes(dateStr) ? 1 : 0)
      }, 0)

      return {
        date: format(day, "MMM dd"),
        completions: count
      }
    })
  }, [completions])

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Consistency Trend</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
            <Line
              type="monotone"
              dataKey="completions"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
