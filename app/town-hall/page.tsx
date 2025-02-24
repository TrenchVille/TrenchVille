"use client"

import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"
import { useStore } from "@/lib/store"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"

export default function TownHallPage() {
  const reviews = useStore((state) => state.reviews)
  const handleVote = useStore((state) => state.handleVote)
  const { connected, publicKey } = useWallet()

  // Sort reviews by votes in descending order
  const sortedReviews = [...reviews].sort((a, b) => b.votes - a.votes)

  const hasVotedOnAny = connected && publicKey && reviews.some(review => 
    review.votedBy && 
    Array.isArray(review.votedBy) && 
    review.votedBy.includes(publicKey.toBase58())
  )

  const handleVoteClick = (reviewId: number) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet to vote")
      return
    }

    const walletAddress = publicKey.toBase58()
    const success = handleVote(reviewId, walletAddress)
    
    if (!success) {
      toast.error("You have already voted for this proposal")
    } else {
      toast.success("Vote recorded successfully!")
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
            Connect your wallet to see and participate in votes
          </div>
        )}

        {connected && hasVotedOnAny && (
          <div className="text-center mb-8 p-4 bg-purple-500/10 text-purple-200 rounded-lg">
            Thank you for participating! Your vote has been recorded.
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReviews.map((review, index) => {
            const hasVoted = connected && 
                           publicKey && 
                           review.votedBy && 
                           Array.isArray(review.votedBy) && 
                           review.votedBy.includes(publicKey.toBase58())
            
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
      </main>

      {/* Right Sidebar */}
      <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] border-l border-white/10 bg-black/95">
        <ProgressPanel />               
      </aside>
    </div>
  )
}
