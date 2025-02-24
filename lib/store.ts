import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Review {
  id: number
  author: string
  title: string
  votes: number
  votedBy: string[]
}

interface StoreState {
  reviews: Review[]
  addReview: (title: string) => void
  handleVote: (reviewId: number, walletAddress: string) => boolean
}

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const savedState = localStorage.getItem('suggestions-store')
    return savedState ? JSON.parse(savedState) : { reviews: [] }
  } catch (error) {
    console.error('Error loading state:', error)
    return { reviews: [] }
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      reviews: loadInitialState().reviews,

      addReview: (title: string) => set((state) => {
        const newReview: Review = {
          id: state.reviews.length + 1,
          author: window?.solana?.publicKey?.toBase58() || 'anonymous',
          title,
          votes: 0,
          votedBy: []
        }
        
        const updatedReviews = [...state.reviews, newReview]
        
        return {
          reviews: updatedReviews
        }
      }),

      handleVote: (reviewId: number, walletAddress: string) => {
        let voteSuccessful = false;
        
        set((state) => {
          const updatedReviews = state.reviews.map(review => {
            if (review.id === reviewId) {
              if (review.votedBy.includes(walletAddress)) {
                return review;
              }
              
              voteSuccessful = true;
              return {
                ...review,
                votes: review.votes + 1,
                votedBy: [...review.votedBy, walletAddress]
              }
            }
            return review;
          });

          return {
            reviews: updatedReviews
          }
        });

        return voteSuccessful;
      }
    }),
    {
      name: 'suggestions-store',
      skipHydration: true,
    }
  )
)

// Hydrate the store when the app loads
if (typeof window !== 'undefined') {
  useStore.persist.rehydrate()
}
