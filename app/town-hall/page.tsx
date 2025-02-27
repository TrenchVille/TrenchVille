"use client"

import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"
import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"

type Review = {
  id: number
  author: string
  title: string
  votes: number
  voted_by: string[] | null
}

export default function TownHallPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch('/api/proposals')
        const result = await response.json()
        
        if (result.success) {
          setReviews(result.data || [])
        } else {
          console.error("Error fetching proposals:", result.error)
          toast.error("Error loading proposals")
        }
      } catch (error) {
        console.error("Error fetching proposals:", error)
        toast.error("Error loading proposals")
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
    // Refresh every 30 seconds
    const interval = setInterval(fetchProposals, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const hasVotedOnAny = connected && publicKey && reviews.some(review => 
    review.voted_by && 
    Array.isArray(review.voted_by) && 
    review.voted_by.includes(publicKey.toBase58())
  )

  // Count user's suggestions
  const userProposalCount = connected && publicKey 
    ? reviews.filter(review => review.author === publicKey.toBase58()).length
    : reviews.length > 0 ? 1 : 0

  // Check if user has reached their suggestion limit
  const hasReachedProposalLimit = connected && publicKey 
    ? userProposalCount >= 2 // Connected users: limit of 2
    : userProposalCount >= 1 // Non-connected users: limit of 1

  const handleVoteClick = async (reviewId: number) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet to vote")
      return
    }

    const walletAddress = publicKey.toBase58()
    
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: reviewId,
          wallet_address: walletAddress
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Vote successfully registered!")
        // Update the reviews list
        const updatedReviews = reviews.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              votes: review.votes + 1,
              voted_by: [...(review.voted_by || []), walletAddress]
            }
          }
          return review
        })
        setReviews(updatedReviews)
      } else {
        toast.error(result.error || "Error registering vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Error registering vote")
    }
  }

  const addProposal = async (title: string) => {
    if (!connected && hasReachedProposalLimit) {
      toast.error("Without a connected wallet, you are limited to 1 suggestion")
      return
    }

    if (connected && !publicKey) {
      toast.error("Please connect your wallet to propose")
      return
    }

    if (connected && hasReachedProposalLimit) {
      toast.error("You have reached the limit of 2 suggestions")
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
        // Refresh suggestions
        const refreshResponse = await fetch('/api/proposals')
        const refreshResult = await refreshResponse.json()
        
        if (refreshResult.success) {
          setReviews(refreshResult.data || [])
        }
      } else {
        toast.error(result.error || "Error adding suggestion")
      }
    } catch (error) {
      console.error("Error adding suggestion:", error)
      toast.error("Error adding suggestion")
    }
  }

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-white/10 bg-black/95">
        <InfoFAQ />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 mr-64 min-h-[calc(100vh-4rem)] p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Town Hall</h1>
        
        {!connected && (
          <div className="text-center mb-8 p-4 bg-yellow-500/10 text-yellow-500 rounded-lg">
            Connect your wallet to view and participate in voting. 
            Without connecting, you're limited to 1 suggestion.
          </div>
        )}

        {connected && hasVotedOnAny && (
          <div className="text-center mb-8 p-4 bg-purple-500/10 text-purple-200 rounded-lg">
            Thank you for participating! Your vote has been registered.
          </div>
        )}

        {/* Proposal form section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add new suggestion</h2>
          
          {/* Display suggestions limit information */}
          {connected && publicKey && (
            <div className="mb-4 text-sm text-gray-400">
              You have submitted {userProposalCount} of 2 allowed suggestions
              {hasReachedProposalLimit && (
                <span className="ml-2 text-red-400">
                  (Maximum limit reached)
                </span>
              )}
            </div>
          )}
          
          {!connected && hasReachedProposalLimit && (
            <div className="mb-4 text-sm text-red-400">
              You have reached your limit of 1 suggestion. Connect a wallet to submit more.
            </div>
          )}
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const title = (form.elements.namedItem('title') as HTMLInputElement).value
            addProposal(title)
            form.reset()
          }}>
            <div className="flex gap-3">
              <input
                type="text"
                name="title"
                className="flex-1 bg-gray-900/50 rounded-lg p-2 border border-white/10"
                placeholder="Write your suggestion here..."
                required
                disabled={hasReachedProposalLimit}
              />
              <button
                type="submit"
                className={`px-6 py-2 rounded-lg transition-colors ${
                  hasReachedProposalLimit 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                disabled={hasReachedProposalLimit}
              >
                Send
              </button>
            </div>
          </form>
        </div>
        
        {loading ? (
          <div className="text-center p-10">Loading suggestions...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center p-10 bg-gray-900/30 rounded-lg">
            No suggestions yet. Be the first to suggest!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => {
              const hasVoted = connected && 
                            publicKey && 
                            review.voted_by && 
                            Array.isArray(review.voted_by) && 
                            review.voted_by.includes(publicKey.toBase58())
              
              const authorName = review.author.slice(0, 4)
              
              return (
                <div key={review.id} className="bg-gray-900/50 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                      {authorName}
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-purple-300">#{review.id}</h3>
                      {index === 0 && review.votes > 0 && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                          Top Voted
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{review.title}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">votes: {review.votes}</span>
                    {connected && !hasVotedOnAny && !hasVoted && (
                      <button
                        onClick={() => handleVoteClick(review.id)}
                        className="px-6 py-2 rounded-lg transition-colors duration-200 bg-white/5 hover:bg-white/10"
                      >
                        Vote
                      </button>
                    )}
                    {hasVoted && (
                      <span className="px-6 py-2 bg-purple-500/50 text-purple-200 rounded-lg">
                        Voted
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] border-l border-white/10 bg-black/95">
        <ProgressPanel />               
      </aside>
    </div>
  )
}
