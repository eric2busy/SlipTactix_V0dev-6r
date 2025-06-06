import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.SPORTS_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "SPORTS_API_KEY not found in environment variables",
        instructions: [
          "Add SPORTS_API_KEY=your_key_here to your .env.local file",
          "Restart your development server after adding the key",
        ],
      })
    }

    console.log(`🔑 Testing API key: ${apiKey.substring(0, 8)}...`)

    // Test the API key with Sports Games Odds V2
    const testUrl = `https://api.sportsgameodds.com/v2/events?apiKey=${apiKey}&limit=1`

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: "✅ Sports Games Odds API key is working!",
        keyPrefix: `${apiKey.substring(0, 8)}...`,
        dataReceived: data.data?.length || 0,
        status: "API key validated successfully",
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: `❌ API key test failed: ${response.status}`,
        error: errorText,
        keyPrefix: `${apiKey.substring(0, 8)}...`,
        instructions: [
          response.status === 401 ? "API key is invalid or expired" : "API error occurred",
          "Check your Sports Games Odds account",
          "Generate a new API key if needed",
        ],
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Failed to test API key",
      error: error.message,
    })
  }
}
