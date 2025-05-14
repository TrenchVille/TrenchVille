"use client"

import { ProgressPanel } from "@/components/ProgressPanel"
import { InfoFAQ } from "@/components/InfoFAQ"
import { Socials } from "@/components/Socials"
import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid'
import Cookies from 'js-cookie'
import { Search } from "lucide-react"

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
  const [browserFingerprint, setBrowserFingerprint] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

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

  // Check if the user has voted on any proposal
  const hasVotedOnAny = reviews.some(review => 
    review.voted_by && 
    Array.isArray(review.voted_by) && 
    review.voted_by.includes(browserFingerprint)
  )

  // Count user suggestions (by browser or wallet)
  const userProposalCount = connected && publicKey 
    ? reviews.filter(review => review.author === publicKey.toBase58()).length
    : reviews.filter(review => review.author === browserFingerprint).length

  // Check if the user has reached their suggestion limit
  const hasReachedProposalLimit = userProposalCount >= 1

  const handleVoteClick = async (reviewId: number) => {
    if (!browserFingerprint) {
      toast.error("Could not identify your browser")
      return
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: reviewId,
          wallet_address: connected && publicKey ? publicKey.toBase58() : browserFingerprint
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Vote registered successfully!")
        // Update the reviews list
        const updatedReviews = reviews.map(review => {
          if (review.id === reviewId) {
            return {
              ...review,
              votes: review.votes + 1,
              voted_by: [...(review.voted_by || []), connected && publicKey ? publicKey.toBase58() : browserFingerprint]
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
    if (hasReachedProposalLimit) {
      toast.error("You have reached the limit of 1 suggestion per browser")
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

  // Filtrar las propuestas basadas en el término de búsqueda
  const filteredReviews = reviews.filter(review => 
    review.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r border-white/10 bg-black/95">
        <InfoFAQ />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 mr-64 min-h-[calc(100vh-4rem)] p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Town Hall</h1>
        
        {hasVotedOnAny && (
          <div className="text-center mb-8 p-4 bg-purple-500/10 text-purple-200 rounded-lg">
            Thank you for participating! Your vote has been registered.
          </div>
        )}

        

        {/* Proposal form section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add new suggestion</h2>
          
          {/* Display suggestions limit information */}
          <div className="mb-4 text-sm text-gray-400">
            You have submitted {userProposalCount} of 1 allowed suggestion
            {hasReachedProposalLimit && (
              <span className="ml-2 text-red-400">
                (Maximum limit reached)
              </span>
            )}
          </div>
          
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
                    : 'bg-red-600 hover:bg-red-500'
                }`}
                disabled={hasReachedProposalLimit}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-10 bg-gray-900/50 border border-white/10 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search for a suggestion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10">Loading suggestions...</div>
        ) : filteredReviews.length === 0 ? (
          searchTerm ? (
            <div className="text-center p-10 bg-gray-900/30 rounded-lg">
              No se encontraron sugerencias que coincidan con "{searchTerm}"
            </div>
          ) : (
            <div className="text-center p-10 bg-gray-900/30 rounded-lg">
              No suggestions yet. Be the first to suggest!
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review, index) => {
              const hasVoted = review.voted_by && 
                            Array.isArray(review.voted_by) && 
                            review.voted_by.includes(connected && publicKey ? publicKey.toBase58() : browserFingerprint)
              
              const authorName = review.author.slice(-4)
              
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
                          Most Voted
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{review.title}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">votes: {review.votes}</span>
                    {!hasVoted && (
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
        <Socials />               
      </aside>
    </div>
  )
}
