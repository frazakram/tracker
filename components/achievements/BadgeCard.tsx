"use client"

import { motion } from "framer-motion"
import { Badge } from "@/lib/achievements/badgeDefinitions"
import { Lock } from "lucide-react"

interface BadgeCardProps {
  badge: Badge
  isUnlocked: boolean
  progress?: number
}

export function BadgeCard({ badge, isUnlocked, progress = 0 }: BadgeCardProps) {
  return (
    <motion.div
      layout
      className={`relative p-4 rounded-xl border-2 flex flex-col items-center text-center transition-colors ${
        isUnlocked
          ? "bg-white border-yellow-200 shadow-sm"
          : "bg-gray-50 border-gray-200 opacity-70"
      }`}
      initial={false}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative mb-3">
        <motion.div
          className={`text-4xl ${isUnlocked ? "" : "grayscale blur-[1px]"}`}
          animate={isUnlocked ? {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: isUnlocked ? Infinity : 0,
            repeatDelay: 5
          }}
        >
          {badge.icon}
        </motion.div>
        
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      <h3 className={`font-bold text-sm mb-1 ${
        isUnlocked ? "text-gray-900" : "text-gray-500"
      }`}>
        {badge.name}
      </h3>
      
      <p className="text-[10px] text-gray-500 leading-tight mb-2">
        {badge.description}
      </p>

      {/* Progress Bar for Locked Badges */}
      {!isUnlocked && progress > 0 && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-auto overflow-hidden">
          <motion.div 
            className="h-full bg-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isUnlocked && (
        <div className="mt-auto">
          <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
            UNLOCKED
          </span>
        </div>
      )}
    </motion.div>
  )
}
