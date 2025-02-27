"use client"

import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function InfoFAQ() {
  return (
    <div className="space-y-2 bg-black text-white p-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h2 className="text-lg font-semibold">Info & FAQ</h2>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
              <span>What is TrenchVille?</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-2 text-sm text-gray-400">
              TrenchVille is a platform that combines artificial intelligence with blockchain technology to create
              evolving virtual civilizations in a trench warfare setting.
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
              <span>How do suggestions work?</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-2 text-sm text-gray-400">
              Users can submit suggestions to influence the evolution of TrenchVille. The best suggestions are
              implemented automatically to shape the trench warfare landscape.
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
              <span>How long does evolution take?</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-2 text-sm text-gray-400">
              Evolution in TrenchVille happens in real-time and is influenced by user interactions and suggestions. Each
              phase of trench warfare has its own completion requirements.
            </CollapsibleContent>
          </Collapsible>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
