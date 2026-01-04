"use client"

import { Skeleton } from "@/components/ui/Skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-52 rounded-full" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-8 w-20 ml-auto" />
          <Skeleton className="h-4 w-44 ml-auto" />
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[320px] w-[220px] flex-shrink-0 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-[520px] w-full rounded-3xl" />
    </div>
  )
}


