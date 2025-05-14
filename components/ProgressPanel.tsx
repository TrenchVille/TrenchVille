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

// Helper function to get UTC time
function getUTCTime() {
  return new Date().toLocaleString('en-US', { 
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })
}

export function ProgressPanel() {
  const [marketCap, setMarketCap] = useState<number | null>(null)
  const [holders, setHolders] = useState<number | null>(null)
  const [totalProposals, setTotalProposals] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState(getUTCTime())
  const [refreshProgress, setRefreshProgress] = useState(0)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60)
  
  // Function to fetch data from API
  const fetchData = async () => {
    try {
      // Fetch token metadata
      const metadataResponse = await fetch("/api/token-metadata")
      const metadataData = await metadataResponse.json()
      setMarketCap(metadataData.data?.market_cap ? Number(metadataData.data.market_cap) : null)
      setHolders(metadataData.data?.holder ? Number(metadataData.data.holder) : null)

      // Fetch total proposals from the API
      const proposalsResponse = await fetch("/api/proposals")
      const proposalsData = await proposalsResponse.json()
      if (proposalsData.success && Array.isArray(proposalsData.data)) {
        setTotalProposals(proposalsData.data.length)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }
  
  useEffect(() => {
    // Update UTC time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(getUTCTime())
    }, 1000)

    // Load initial data
    fetchData()
    
    // Update progress bar every second
    const progressInterval = setInterval(() => {
      setRefreshProgress(prev => {
        // If we reach 100%, reset and fetch new data
        if (prev >= 100) {
          // Call API to update data
          fetchData()
          return 0
        }
        return prev + (100/60) // Increment to complete in 60 seconds
      })
      
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(progressInterval)
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
            {/* UTC Time Display */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                UTC Time
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
                <div className="text-xs text-gray-500">Next update: {secondsUntilRefresh}s</div>
              </div>
            </div>
            
            {/* Progress bar for update */}
            <Progress 
              value={refreshProgress} 
              className="h-1 bg-gray-800"
            />

            <div className="flex justify-between items-center">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                  Holders
                </div>
              </div>
              <div className="text-right">
                <div>{holders ? holders.toLocaleString() : "Loading..."}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                Suggestions
              </div>
              <div className="text-right">
                <div>{totalProposals}</div>
                <div className="text-xs text-gray-500">Target: 1000/day</div>
              </div>
            </div>
            
            <Progress 
              value={(totalProposals / 2000) * 100} 
              className="h-2"
            />
            
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
