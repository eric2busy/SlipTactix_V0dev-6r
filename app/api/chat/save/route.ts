import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "@/lib/data-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, content, sender, messageType, data } = await request.json()

    if (!userId || !content || !sender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await dataService.saveChatMessage(userId, content, sender, messageType, data)

    if (!success) {
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving chat message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
