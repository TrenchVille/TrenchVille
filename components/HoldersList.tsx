"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Search } from "lucide-react"

interface Holder {
  address: string
  amount: number
  decimals: number
  owner: string
  rank: number
}

interface HoldersListProps {
  initialHolders: {
    total: number
    items: Holder[]
  }
}

export default function HoldersList({ initialHolders }: HoldersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['holders'],
    queryFn: async () => {
      try {
        setIsLoadingMore(true)
        const response = await fetch('/api/holders')
        const responseData = await response.json()
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to fetch data')
        }
        
        return responseData
      } catch (error) {
        console.error('Fetch error:', error)
        throw error
      } finally {
        setIsLoadingMore(false)
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  })

  const formatAmount = (amount: number, decimals: number) => {
    return (amount / Math.pow(10, decimals)).toLocaleString()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-sm text-gray-500">Loading holders data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-4">
        <div className="text-red-500">
          Error loading holders data: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  const holders = data?.data?.items || []
  const filteredHolders = holders.filter((holder: Holder) =>
    holder.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSupply = holders.reduce((acc: number, holder: Holder) => 
    acc + holder.amount / Math.pow(10, holder.decimals), 0
  )

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle>All Holders ({data?.data?.total?.toLocaleString() || 0})</CardTitle>
            {isLoadingMore && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading all holders...
              </div>
            )}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolders.map((holder: Holder) => (
                  <TableRow key={holder.address}>
                    <TableCell>{holder.rank}</TableCell>
                    <TableCell>
                      <a 
                        href={`https://solscan.io/account/${holder.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {truncateAddress(holder.address)}
                      </a>
                    </TableCell>
                    <TableCell>{formatAmount(holder.amount, holder.decimals)}</TableCell>
                    <TableCell>
                      {((holder.amount / Math.pow(10, holder.decimals)) / totalSupply * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Total Holders: {data?.data?.total?.toLocaleString() || 0}</span>
          <span>Total Supply: {totalSupply.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
