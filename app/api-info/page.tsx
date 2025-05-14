"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"

export default function ApiInfoPage() {
  const [expanded, setExpanded] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ["token-data"],
    queryFn: async () => {
      const response = await fetch("/api/market-cap", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      return await response.json()
    },
  })

  if (isLoading) return <div className="text-center mt-8">Loading...</div>
  if (error)
    return (
      <div className="text-center mt-8 text-red-500">
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </div>
    )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Info</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${data?.marketCap.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5,385</p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                Suggestions
              </div>
              <div className="text-right">
                <div>6,920</div>
                <div className="text-xs text-gray-500">Target: 1000/day</div>
              </div>
            </div>
            <Progress value={69.2} className="h-2" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Growing Speed Boost:</h3>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  Suggestions
                </div>
                <div className="text-green-400">1.5x (-12h)</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Maximum 2x boost from suggestions</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <ScrollArea className={`${expanded ? "h-[500px]" : "h-[200px]"} overflow-auto`}>
            <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
