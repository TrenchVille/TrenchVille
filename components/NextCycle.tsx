"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

function getESTTime() {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return {
    hours: est.getHours(),
    minutes: est.getMinutes(),
    seconds: est.getSeconds()
  }
}

function getTimeUntilNextCycle() {
  const estTime = getESTTime()
  const currentMinute = estTime.minutes
  
  if (currentMinute < 40) {
    // We're in day, calculate time until night (40 minute mark)
    return (40 - currentMinute) * 60 - estTime.seconds
  } else {
    // We're in night, calculate time until next hour's day
    return ((60 - currentMinute) + 0) * 60 - estTime.seconds
  }
}

export function NextCycle() {
  const [timeUntilNext, setTimeUntilNext] = useState(getTimeUntilNextCycle())
  const [isNight, setIsNight] = useState(() => {
    const estTime = getESTTime()
    return estTime.minutes >= 40
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const estTime = getESTTime()
      setIsNight(estTime.minutes >= 40)
      setTimeUntilNext(getTimeUntilNextCycle())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Calculate progress percentage based on current phase
  const getProgressPercentage = () => {
    const estTime = getESTTime()
    const currentMinute = estTime.minutes
    const currentSecond = estTime.seconds

    if (currentMinute < 40) {
      // Day phase (0-40 minutes)
      return ((currentMinute * 60 + currentSecond) / (40 * 60)) * 100
    } else {
      // Night phase (40-60 minutes)
      return (((currentMinute - 40) * 60 + currentSecond) / (20 * 60)) * 100
    }
  }

  return (
    <div className="p-3 rounded-lg bg-gray-900/50 border border-white/10 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{isNight ? "Day" : "Night"} Time</span>
          {isNight ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        <span className="font-mono">{formatTime(timeUntilNext)}</span>
      </div>
      <Progress 
        value={getProgressPercentage()} 
        className="h-1.5"
      />
    </div>
  )
}
