"use client"

import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"
import { useStore } from "@/lib/store"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"

const House3DScene = dynamic(() => import("@/components/3d/House3DScene"), {
  ssr: false,
  loading: () => <div className="h-[calc(100vh-8rem)] flex items-center justify-center">Loading TrenchVille...</div>,
})

export default function ThreeDPage() {
  const [message, setMessage] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const addReview = useStore((state) => state.addReview)
  const reviews = useStore((state) => state.reviews)
  const { connected, publicKey } = useWallet()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Get user's suggestions count
    const userSuggestions =
      connected && publicKey
        ? reviews.filter((review) => review.author === publicKey.toBase58()).length
        : reviews.filter((review) => review.author === "anonymous").length

    const maxSuggestions = connected ? 2 : 1

    if (userSuggestions >= maxSuggestions) {
      toast.error(
        connected ? "You can only submit up to 2 suggestions" : "Please connect your wallet to submit more suggestions",
      )
      return
    }

    // Add the message as a new review
    addReview(message)

    // Show success message
    setShowResponse(true)
    setMessage("")

    // Hide the response after 3 seconds
    setTimeout(() => {
      setShowResponse(false)
    }, 3000)
  }

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-white/10 bg-black/95">
        <InfoFAQ />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 mr-64 min-h-[calc(100vh-4rem)] relative">
        <div className="h-[calc(100vh-8rem)]">
          <House3DScene key="house3d-scene" />
        </div>

        {/* Response Message */}
        {showResponse && (
          <div className="absolute bottom-24 left-4 right-4 bg-green-500/20 text-green-400 p-3 rounded-lg text-center">
            Completed! Check the Town Hall
          </div>
        )}

        {/* Chat Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/95 border-t border-white/10">
          {/* Suggestions Remaining */}
          <div className="px-4 py-2 text-center">
            <span className="text-sm text-gray-400">
              {connected
                ? `${2 - reviews.filter((review) => review.author === publicKey?.toBase58()).length} suggestions remaining`
                : `${1 - reviews.filter((review) => review.author === "anonymous").length} suggestions remaining`}
            </span>
          </div>

          {/* Chat Input Form */}
          <div className="p-4 pt-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={connected ? "Type your suggestion..." : "Connect wallet for more suggestions"}
                className="flex-1 bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] border-l border-white/10 bg-black/95">
        <ProgressPanel />
      </aside>
    </div>
  )
}
