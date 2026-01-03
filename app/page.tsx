"use client"

import { useEffect } from "react"
import { HabitGrid } from "@/components/habits/HabitGrid"
import { StatsCards } from "@/components/analytics/StatsCards"
import { AnalyticsSidebar } from "@/components/analytics/AnalyticsSidebar"
import { AppLayout } from "@/components/layout/AppLayout"
import { useHabitStore } from "@/store/useHabitStore"

export default function Home() {
  const loadUserData = useHabitStore(state => state.loadUserData)
  const isLoading = useHabitStore(state => state.isLoading)

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600">Loading your habits...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <StatsCards />
      <HabitGrid />
    </AppLayout>
  )
}
