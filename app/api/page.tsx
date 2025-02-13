"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingDots } from "@/components/LoadingDots"
import { Button } from "@/components/ui/button"
import { RefreshCw, Copy, Pause, Play } from "lucide-react"

const REFRESH_INTERVAL = 60000 // 1 minute in milliseconds

interface TokenData {
  holders?: number
  marketCap?: number
}

export default function APIPage() {
  const [tokenMetadata, setTokenMetadata] = useState<any>(null)
  const [tokenData, setTokenData] = useState<TokenData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState(false)

  const fetchTokenMetadata = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/token-metadata", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTokenMetadata(data)

      // Extract holders and marketCap from the API response
      const holders = data.data?.holder
      const marketCap = data.data?.marketCap
      setTokenData({ holders, marketCap })

      setCountdown(REFRESH_INTERVAL / 1000)
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokenMetadata()

    const intervalId = setInterval(() => {
      if (!isAutoRefreshPaused) {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            fetchTokenMetadata()
            return REFRESH_INTERVAL / 1000
          }
          return prevCountdown - 1
        })
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [fetchTokenMetadata, isAutoRefreshPaused])

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(JSON.stringify(tokenMetadata, null, 2))
      .then(() => alert("JSON copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err))
  }

  const toggleAutoRefresh = () => {
    setIsAutoRefreshPaused((prev) => !prev)
  }

  if (loading && !tokenMetadata) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoadingDots />
        <p className="mt-4 text-gray-400">Fetching token metadata...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Holders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tokenData.holders?.toLocaleString() ?? "N/A"}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {tokenMetadata?.data?.market_cap ? `$${Number(tokenMetadata.data.market_cap).toLocaleString()}` : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Token Metadata JSON</CardTitle>
            <div className="flex space-x-2 items-center">
              <span className="text-sm text-gray-400 mr-2">Next refresh in: {countdown}s</span>
              <Button onClick={toggleAutoRefresh} variant="outline" size="icon" className="h-8 w-8">
                {isAutoRefreshPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              <Button onClick={copyToClipboard} variant="outline" size="icon" className="h-8 w-8">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={fetchTokenMetadata} variant="outline" size="icon" className="h-8 w-8">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-500 bg-red-500/10 p-4 rounded-lg mb-4">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <pre className="bg-black/50 p-4 rounded-lg overflow-auto max-h-[60vh] text-xs">
                {JSON.stringify(tokenMetadata, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

