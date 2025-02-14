import { NextResponse } from "next/server"

export async function GET() {
  if (!process.env.SOLSCAN_API_KEY) {
    return NextResponse.json(
      { error: "API configuration error" }, 
      { status: 500 }
    )
  }

  try {
    console.log('Fetching with API key:', process.env.SOLSCAN_API_KEY.substring(0, 10) + '...')
    
    const response = await fetch(
      "https://pro-api.solscan.io/v2.0/token/holders?address=8aryhMEcqxsJdqZxEDfwKFKiHGyRJstuYXskYpsHpump&page=1&page_size=40",
      {
        method: "GET",
        headers: {
          token: process.env.SOLSCAN_API_KEY,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )

    const responseText = await response.text()
    console.log('Raw response:', responseText)

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: "API request failed", 
          status: response.status,
          details: responseText
        }, 
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)
    console.log('Parsed data:', data)

    if (!data?.data?.items) {
      return NextResponse.json(
        { error: "Invalid data format from API" }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        total: data.data.total,
        items: data.data.items
      }
    })
  } catch (error) {
    console.error("Error fetching holders:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch holders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
