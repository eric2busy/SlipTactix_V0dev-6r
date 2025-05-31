import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const playerName = decodeURIComponent(params.name)
    const player = await dataService.getPlayer(playerName)

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      player,
    })
  } catch (error) {
    console.error("Error fetching player:", error)
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 })
  }
}
