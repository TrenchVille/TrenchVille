import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    // Simulating a market cap value
    const marketCap = Math.floor(Math.random() * 1000000000) // Random value up to 1 billion

    return NextResponse.json({ marketCap })
  } catch (error) {
    console.error("Error generating market cap:", error)
    return NextResponse.json({ error: "Failed to generate market cap" }, { status: 500 })
  }
}
