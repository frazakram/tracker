"use client"

import { Button } from "@/components/ui/Button"
import { Printer } from "lucide-react"

export default function PrintPage() {
  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-0">
      <div className="print:hidden mb-8 flex justify-between items-center max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Analog Protocol Template</h1>
          <p className="text-muted-foreground">Print this page to track offline.</p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print PDF
        </Button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white border print:border-none p-[10mm] shadow-lg print:shadow-none min-h-[297mm]">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter">ME SUPREME</h1>
            <p className="text-sm font-semibold tracking-widest mt-1">IT'S NOT OVER UNTIL I WIN</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold uppercase">Month / Year</div>
            <div className="h-8 w-32 border-b border-black"></div>
          </div>
        </div>

        {/* Protocols Grid */}
        <div className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest mb-2">Daily Protocols</h2>
          <div className="border border-black">
            {/* Header Row */}
            <div className="flex border-b border-black bg-gray-100 print:bg-gray-100">
              <div className="w-48 p-2 border-r border-black font-bold text-xs uppercase">Habit / Protocol</div>
              <div className="flex-1 flex">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r last:border-r-0 border-black/50 text-[8px] text-center p-0.5">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            {/* Rows */}
            {Array.from({ length: 15 }).map((_, row) => (
              <div key={row} className="flex border-b last:border-b-0 border-black/20 h-6">
                <div className="w-48 border-r border-black p-1"></div>
                <div className="flex-1 flex">
                   {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className="flex-1 border-r last:border-r-0 border-black/20"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-8 h-64">
          {/* Quantified Metrics */}
          <div className="border border-black p-4">
             <h2 className="text-xs font-black uppercase tracking-widest mb-4">Quantified Self</h2>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-xs font-bold">Screen Time</span>
                 <div className="flex gap-2 text-[10px]">
                   <span className="border border-black px-2 py-0.5">M</span>
                   <span className="border border-black px-2 py-0.5">D</span>
                   <span className="border border-black px-2 py-0.5">E</span>
                   <span className="border border-black px-2 py-0.5">N</span>
                 </div>
               </div>
               {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="flex items-center justify-between pt-2 border-t border-black/20">
                    <span className="text-xs">Metric {i+1}</span>
                    <div className="h-4 w-24 border-b border-black"></div>
                 </div>
               ))}
             </div>
          </div>
          
          {/* Graph Area */}
          <div className="border border-black p-4 relative">
            <h2 className="text-xs font-black uppercase tracking-widest mb-2">Mood / Energy Graph</h2>
            <div className="absolute inset-x-4 bottom-4 top-10 border-l border-b border-black">
              {/* Grid lines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute w-full border-t border-black/10" style={{ bottom: `${i * 20}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
