"use client"

import { useState, useEffect } from "react"
import { Star, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { NextCycle } from "@/components/NextCycle"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useStore } from "@/lib/store"

// Helper function to get EST time
function getESTTime() {
  return new Date().toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })
}

export function ProgressPanel() {
  const [marketCap, setMarketCap] = useState<number | null>(null)
  const [holders, setHolders] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(getESTTime())
  const reviews = useStore((state) => state.reviews)
  
  // Get total number of suggestions
  const totalSuggestions = reviews.length

  useEffect(() => {
    // Update EST time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(getESTTime())
    }, 1000)

    const fetchData = async () => {
      try {
        const response = await fetch("/api/token-metadata")
        const data = await response.json()
        setMarketCap(data.data?.market_cap ? Number(data.data.market_cap) : null)
        setHolders(data.data?.holder ? Number(data.data.holder) : null)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
    const dataInterval = setInterval(fetchData, 60000) // Refresh every minute

    return () => {
      clearInterval(timeInterval)
      clearInterval(dataInterval)
    }
  }, [])

  return (
    <div className="space-y-2 bg-black text-white p-4">
      <NextCycle />
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-lg font-semibold">Information</h2>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="space-y-4">
            {/* EST Time Display */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                EST Time
              </div>
              <div className="text-right font-mono">{currentTime}</div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                Market Cap
              </div>
              <div className="text-right">
                <div>{marketCap ? `$${marketCap.toLocaleString()}` : "Loading..."}</div>
                <div className="text-xs text-gray-500">Target: $1,000,000</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>Holders</div>
              <div>{holders ? holders.toLocaleString() : "Loading..."}</div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                Suggestions
              </div>
              <div className="text-right">
                <div>{totalSuggestions}</div>
                <div className="text-xs text-gray-500">Target: 2000/day</div>
              </div>
            </div>
            
            <Progress 
              value={(totalSuggestions / 2000) * 100} 
              className="h-2"
            />

            <div className="flex justify-between items-center">
              <div>Time Elapsed</div>
              <div>0d 0h</div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
