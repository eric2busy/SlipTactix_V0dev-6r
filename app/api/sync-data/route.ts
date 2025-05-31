import { NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

export async function POST() {
  try {
    // Sync all data sources
    const [games, injuries, news] = await Promise.all([
      dataService.syncLiveGames(),
      dataService.syncInjuries(),
      dataService.syncNews(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        games: games.length,
        injuries: injuries.length,
        news: news.length,
      },
    })
  } catch (error) {
    console.error("Error syncing data:", error)
    return NextResponse.json({ error: "Failed to sync data" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const games = await dataService.getLiveGames()

    return NextResponse.json({
      success: true,
      games,
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
