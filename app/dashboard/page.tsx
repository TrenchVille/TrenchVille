"use client"

import type React from "react"
import dynamic from "next/dynamic"
import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"
import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"
import { Socials } from "@/components/Socials"
import { v4 as uuidv4 } from 'uuid'
import Cookies from 'js-cookie'

const House3DScene = dynamic(() => import("@/components/3d/House3DScene"), {
  ssr: false,
  loading: () => <div className="h-[calc(100vh-4rem)] flex items-center justify-center">Loading TrenchVille...</div>,
})

export default function DashboardPage() {
  const [userProposalCount, setUserProposalCount] = useState(0)
  const [hasReachedProposalLimit, setHasReachedProposalLimit] = useState(false)
  const [totalProposals, setTotalProposals] = useState(0)
  const { connected, publicKey } = useWallet()
  const [browserFingerprint, setBrowserFingerprint] = useState<string>("")
  
  // Proposal limit per user
  const proposalLimit = 1
  const remainingSuggestions = Math.max(0, proposalLimit - userProposalCount)

  useEffect(() => {
    // Generate or retrieve a unique ID for this browser
    const getBrowserFingerprint = () => {
      let fingerprint = Cookies.get('browser_fingerprint')
      if (!fingerprint) {
        fingerprint = uuidv4()
        Cookies.set('browser_fingerprint', fingerprint, { expires: 365 })
      }
      return fingerprint
    }

    setBrowserFingerprint(getBrowserFingerprint())
  }, [])

  useEffect(() => {
    const fetchProposals = async () => {
      if (!browserFingerprint) return;
      
      try {
        const response = await fetch('/api/proposals')
        const result = await response.json()
        
        if (result.success && result.data) {
          // Set the total number of proposals
          setTotalProposals(result.data.length)
          
          // Identify current user's proposals
          const userIdentifier = connected && publicKey ? publicKey.toBase58() : browserFingerprint
          const userProposals = result.data.filter(p => p.author === userIdentifier)
          setUserProposalCount(userProposals.length)
          setHasReachedProposalLimit(userProposals.length >= proposalLimit)
        }
      } catch (error) {
        console.error("Error fetching proposals:", error)
      }
    }

    if (browserFingerprint) {
      fetchProposals()
    }
  }, [connected, publicKey, browserFingerprint])

  const addProposal = async (title: string) => {
    if (hasReachedProposalLimit) {
      toast.error("You have reached the limit of 1 proposal per browser")
      return
    }

    if (!browserFingerprint) {
      toast.error("Could not identify your browser")
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
          author: connected && publicKey ? publicKey.toBase58() : browserFingerprint
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Proposal added successfully!")
        setUserProposalCount(prev => prev + 1)
        setTotalProposals(prev => prev + 1)
        
        if (userProposalCount + 1 >= proposalLimit) {
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
          
          {/* Add the Socials component here */}
          <Socials />
          
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
                placeholder="Write your suggestion..."
                required
                disabled={hasReachedProposalLimit}
              />
              {!hasReachedProposalLimit && (
                <button
                  type="submit"
                  className="ml-4 px-6 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-500">
                  Submit
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