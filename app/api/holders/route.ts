import { NextResponse } from "next/server"

async function fetchHoldersPage(page: number, apiKey: string) {
  const response = await fetch(
    `https://pro-api.solscan.io/v2.0/token/holders?address=${process.env.NEXT_PUBLIC_TOKEN_ADDRESS}&page=${page}&page_size=40`,
    {
      method: "GET",
      headers: {
        token: apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    throw new Error(`API request failed for page ${page}`)
  }

  return response.json()
}

export async function GET() {
  if (!process.env.SOLSCAN_API_KEY) {
    return NextResponse.json(
      { error: "API configuration error" }, 
      { status: 500 }
    )
  }

  try {
    // First, get the total number of holders
    const firstPage = await fetchHoldersPage(1, process.env.SOLSCAN_API_KEY)
    const totalHolders = firstPage.data.total
    const totalPages = Math.ceil(totalHolders / 40)

    console.log(`Total holders: ${totalHolders}, Total pages: ${totalPages}`)

    // Create an array of page numbers to fetch
    const pagePromises = []
    for (let page = 1; page <= totalPages; page++) {
      // Add a small delay between requests to avoid rate limiting
      const delay = (page - 1) * 100 // 100ms delay between requests
      pagePromises.push(
        new Promise(resolve => setTimeout(resolve, delay))
          .then(() => fetchHoldersPage(page, process.env.SOLSCAN_API_KEY))
      )
    }

    // Fetch all pages in parallel with delay
    const pages = await Promise.all(pagePromises)

    // Combine all holders from all pages
    const allHolders = pages.reduce((acc, page) => {
      return acc.concat(page.data.items)
    }, [])

    return NextResponse.json({
      success: true,
      data: {
        total: totalHolders,
        items: allHolders
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
