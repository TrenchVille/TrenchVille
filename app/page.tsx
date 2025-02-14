import dynamic from "next/dynamic"
import { EvolutionStages } from "@/components/EvolutionStages"
import { ViewOptions } from "@/components/ViewOptions"
import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"

const CyberpunkCity = dynamic(() => import("@/components/3d/CyberpunkCity"), { ssr: false })


export default function Home() {
  return (
    <div className="flex">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-white/10 bg-black/95">
        <ViewOptions />
        <EvolutionStages />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 mr-64 min-h-[calc(100vh-4rem)]">
        <div className="h-[calc(100vh-4rem)]">
          <CyberpunkCity />
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] border-l border-white/10 bg-black/95">
        <ProgressPanel />
        <InfoFAQ />
      </aside>
    </div>
  )
}

