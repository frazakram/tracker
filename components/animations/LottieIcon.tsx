"use client"

import React, { useRef, useEffect } from "react"
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { cn } from "@/lib/utils"

interface LottieIconProps {
  animationData: any // Lottie JSON type
  className?: string
  loop?: boolean
  autoplay?: boolean
  hover?: boolean // Play on hover
  onClick?: () => void
}

export function LottieIcon({
  animationData,
  className,
  loop = false,
  autoplay = true,
  hover = false,
  onClick
}: LottieIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    if (hover && lottieRef.current) {
      lottieRef.current.stop()
    }
  }, [hover])

  const handleMouseEnter = () => {
    if (hover && lottieRef.current) {
      lottieRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (hover && lottieRef.current) {
      lottieRef.current.stop()
    }
  }

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay && !hover}
        className="w-full h-full"
      />
    </div>
  )
}
