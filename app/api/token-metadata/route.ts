import { NextResponse } from "next/server"

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
    }
  }
  throw new Error("Max retries reached")
}

export async function GET() {
  if (!process.env.SOLSCAN_API_KEY) {
    console.error("SOLSCAN_API_KEY is not configured")
    return NextResponse.json({ error: "API configuration error" }, { status: 500 })
  }

  try {
    const response = await fetchWithRetry(
      "https://pro-api.solscan.io/v2.0/token/meta?address=8aryhMEcqxsJdqZxEDfwKFKiHGyRJstuYXskYpsHpump",
      {
        method: "GET",
        headers: {
          token: process.env.SOLSCAN_API_KEY,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store", // Disable caching
      },
    )

    const data = await response.json()

    // Validate response structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Detailed error fetching token metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch token metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

