"use client"

import { useEffect } from "react"
import { HabitGrid } from "@/components/habits/HabitGrid"
import { StatsCards } from "@/components/analytics/StatsCards"
import { AnalyticsSidebar } from "@/components/analytics/AnalyticsSidebar"
import { AppLayout } from "@/components/layout/AppLayout"
import { useHabitStore } from "@/store/useHabitStore"
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton"

export default function Home() {
  const loadUserData = useHabitStore(state => state.loadUserData)
  const isLoading = useHabitStore(state => state.isLoading)

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
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
