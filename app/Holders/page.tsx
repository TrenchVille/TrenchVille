"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import HoldersList from "@/components/HoldersList"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 60 * 1000,
    },
  },
})

export default function HoldersPage() {
  const initialHolders = {
    total: 0,
    items: []
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <HoldersList initialHolders={initialHolders} />
      </div>
    </QueryClientProvider>
  )
}
