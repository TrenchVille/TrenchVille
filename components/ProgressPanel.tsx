"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export function ProgressPanel() {
  const [marketCap, setMarketCap] = useState<number | null>(null)
  const [holders, setHolders] = useState<number | null>(null)

  useEffect(() => {
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
    const intervalId = setInterval(fetchData, 60000) // Refresh every minute

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="space-y-2 bg-black text-white p-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Overall Progress</span>
              <span>100.00%</span>
            </div>
            <Progress value={100} className="h-1 bg-gray-800 [&>div]:bg-white" />
          </div>

          <div className="space-y-4">
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
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Buildings
              </div>
              <div className="text-right">
                <div>7</div>
                <div className="text-xs text-gray-500">Base: 5 + 2 from Market Cap</div>
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
                <div>6,920</div>
                <div className="text-xs text-gray-500">Target: 2000/day</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>Time Elapsed</div>
              <div>0d 0h</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium">Growing Speed Boosts:</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  Holders
                </div>
                <div className="text-green-400">1.5x (-12h)</div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  Suggestions
                </div>
                <div className="text-green-400">1.5x (-12h)</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 pt-1">
              Maximum 2x boost from each source
              <br />
              Total boost: 2.0x (-24h)
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

