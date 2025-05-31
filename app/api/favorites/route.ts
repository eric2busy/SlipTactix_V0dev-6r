import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, propId } = await request.json()

    if (!userId || !propId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await dataService.saveFavorite(userId, propId)

    if (!success) {
      return NextResponse.json({ error: "Failed to save favorite" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving favorite:", error)
    return NextResponse.json({ error: "Failed to save favorite" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const favorites = await dataService.getUserFavorites(userId)

    return NextResponse.json({
      success: true,
      favorites,
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}
