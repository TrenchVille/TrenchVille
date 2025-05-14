"use client"

import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function InfoFAQ() {
  return (
    <div className="space-y-2 bg-black text-white p-4">
      <div className="py-2">
        <h2 className="text-lg font-semibold">Info & FAQ</h2>
      </div>
      <div className="space-y-2">
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
            <span>What is TrenchVille?</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-2 text-sm text-gray-400">
          TrenchVille is a city that combines artificial intelligence with Solana technology to create an evolving city that grows constantly
          with the holders.
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
            <span>How do suggestions work?</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-2 text-sm text-gray-400">
          Users can submit suggestions to influence the evolution of TrenchVille, 
          the best suggestions are implemented to shape the future of the City.
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
            <span>What is the Town Hall?</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-2 text-sm text-gray-400">
          The Town Hall is a place where people can vote for ideas and the best ones will be implemented into TrenchVille.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
