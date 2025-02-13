"use client"

import { ChevronDown, Lock } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function EvolutionStages() {
  return (
    <div className="p-4 space-y-2 bg-black text-white">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-lg font-semibold">Evolution Stages</h2>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span>Ancient Age</span>
            <span className="text-green-400">Current</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Middle Age</span>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Modern Age</span>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Contemporary Age</span>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

