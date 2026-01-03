"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { HabitHeatmap } from "@/components/analytics/HabitHeatmap"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Deep Dive</h1>
            <p className="text-gray-500 mt-1">Detailed insights into your habit consistency</p>
          </div>
        </div>
        
        <div className="grid gap-6">
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                <HabitHeatmap />
            </div>
        </div>
      </div>
    </AppLayout>
  )
}
