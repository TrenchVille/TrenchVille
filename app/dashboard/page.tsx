"use client"

import type React from "react"
import dynamic from "next/dynamic"
import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"
import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"

const House3DScene = dynamic(() => import("@/components/3d/House3DScene"), {
  ssr: false,
  loading: () => <div className="h-[calc(100vh-4rem)] flex items-center justify-center">Loading TrenchVille...</div>,
})

export default function DashboardPage() {
  const [userProposalCount, setUserProposalCount] = useState(0)
  const [hasReachedProposalLimit, setHasReachedProposalLimit] = useState(false)
  const [totalProposals, setTotalProposals] = useState(0)
  const { connected, publicKey } = useWallet()
  
  // Calculate remaining suggestions
  const proposalLimit = connected ? 2 : 1
  const remainingSuggestions = Math.max(0, proposalLimit - userProposalCount)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/proposals')
        const result = await response.json()
        
        if (result.success && result.data) {
          // Set total proposals count
          setTotalProposals(result.data.length)
          
          // If connected with a wallet, filter to find user proposals
          if (connected && publicKey) {
            const userProposals = result.data.filter(p => p.author === publicKey.toBase58())
            setUserProposalCount(userProposals.length)
            setHasReachedProposalLimit(userProposals.length >= 2)
          } else {
            // For non-connected users, check if they've made an anonymous proposal
            const anonymousProposals = result.data.filter(p => p.author === "anonymous")
            // This is simplified - in a real app you'd need to track this per-user
            setUserProposalCount(anonymousProposals.length > 0 ? 1 : 0)
            setHasReachedProposalLimit(anonymousProposals.length >= 1)
          }
        }
      } catch (error) {
        console.error("Error fetching proposals:", error)
      }
    }

    fetchProposals()
  }, [connected, publicKey])

  const addProposal = async (title: string) => {
    if (!connected && hasReachedProposalLimit) {
      toast.error("Without a connected wallet, you are limited to 1 proposal")
      return
    }

    if (connected && !publicKey) {
      toast.error("Please connect your wallet to propose")
      return
    }

    if (connected && hasReachedProposalLimit) {
      toast.error("You have reached the limit of 2 proposals")
      return
    }

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          author: publicKey ? publicKey.toBase58() : "anonymous"
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Proposal successfully added!")
        setUserProposalCount(prev => prev + 1)
        setTotalProposals(prev => prev + 1)
        
        if (!connected && userProposalCount + 1 >= 1) {
          setHasReachedProposalLimit(true)
        } else if (connected && userProposalCount + 1 >= 2) {
          setHasReachedProposalLimit(true)
        }
      } else {
        toast.error(result.error || "Error adding proposal")
      }
    } catch (error) {
      console.error("Error adding proposal:", error)
      toast.error("Error adding proposal")
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main Content with Sidebars */}
      <div className="flex h-full relative">
        {/* Left Sidebar */}
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-white/10 bg-black/95 z-10 overflow-y-auto">
          <InfoFAQ />
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 mr-64 h-full relative">
          <div className="absolute inset-0 bottom-[78px]">
            <House3DScene key="house3d-scene" />
          </div>
          
          {/* Proposal Input - Fixed at bottom with padding to match design */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10">
            {/* Suggestions remaining counter */}
            <div className="text-center py-2 text-gray-400 text-sm">
              {remainingSuggestions} suggestions remaining
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const title = (form.elements.namedItem('title') as HTMLInputElement).value
                if (title.trim()) {
                  addProposal(title)
                  form.reset()
                }
              }}
              className="flex items-center w-full px-4 py-2"
            >
              <input
                type="text"
                name="title"
                className="flex-1 bg-transparent text-gray-300 border-none outline-none py-2 px-1"
                placeholder="Type your suggestion..."
                required
                disabled={hasReachedProposalLimit}
              />
              {!hasReachedProposalLimit && (
                <button
                  type="submit"
                  className="ml-4 px-6 py-2 rounded-md font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Send
                </button>
              )}
            </form>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] border-l border-white/10 bg-black/95 z-10 overflow-y-auto">
          <ProgressPanel />
        </aside>
      </div>
    </div>
  )
}