"use client"

import { Search, Antenna } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export function ViewOptions() {
  return (
    <div className="p-4 space-y-2 bg-black text-white">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-lg font-semibold">View Options</h2>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              <span>Night Time</span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">Coming Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <Antenna className="w-4 h-4 text-purple-400" />
            <span>Normal Mode</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
