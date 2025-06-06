/**
 * Secure Grok API Key Test Script
 * Tests the new API key without exposing it in logs
 */

async function testGrokAPI() {
  console.log("🧪 Testing new Grok API key securely...")

  const apiKey = "xai-BJxM2fDN4o31T73ZWdrwhhNdZ35mNKhi5XIQ1XPKgeXFcih8qSaQbQ6002d8ppyo1hxI9OPcGrzp8pWn"

  try {
    // Test the API key directly with xAI
    console.log("📡 Making direct API call to xAI...")

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a test assistant.",
          },
          {
            role: "user",
            content: "Testing. Just say 'API test successful' and nothing else.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0,
        max_tokens: 10,
      }),
    })

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API Test Failed:")
      console.error(`Status: ${response.status}`)
      console.error(`Error: ${errorText}`)

      if (response.status === 403 && errorText.includes("blocked")) {
        console.error("🚫 API key is blocked - need a new one")
        return {
          success: false,
          status: "blocked",
          message: "API key is blocked due to security leak",
        }
      }

      return {
        success: false,
        status: "error",
        message: `API error: ${response.status} - ${errorText}`,
      }
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    console.log("✅ API Test Successful!")
    console.log(`🤖 AI Response: "${aiResponse}"`)
    console.log(`📈 Model: ${data.model || "grok-3-latest"}`)
    console.log(`🔑 Key Status: Active (${apiKey.substring(0, 8)}...)`)

    // Test with a sports-related query
    console.log("\n🏀 Testing sports analysis capability...")

    const sportsResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are SLIPTACTIX, a sports analysis assistant. Be concise.",
          },
          {
            role: "user",
            content: "Explain what makes a good NBA player in 2 sentences.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    if (sportsResponse.ok) {
      const sportsData = await sportsResponse.json()
      const sportsAnalysis = sportsData.choices?.[0]?.message?.content
      console.log(`🏀 Sports Analysis: "${sportsAnalysis}"`)
    }

    return {
      success: true,
      status: "active",
      message: "New Grok API key is working perfectly!",
      response: aiResponse,
      model: "grok-3-latest",
      keyPrefix: `${apiKey.substring(0, 8)}...`,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Test Error:", error.message)
    return {
      success: false,
      status: "error",
      message: `Test failed: ${error.message}`,
    }
  }
}

// Run the test
testGrokAPI()
  .then((result) => {
    console.log("\n📋 Final Test Result:")
    console.log(JSON.stringify(result, null, 2))

    if (result.success) {
      console.log("\n🎉 SUCCESS! Your new Grok API key is working!")
      console.log("✅ Next steps:")
      console.log("1. Add GROK_API_KEY to your .env.local file")
      console.log("2. Restart your development server")
      console.log("3. Test the chat functionality")
    } else {
      console.log("\n❌ FAILED! API key test unsuccessful")
      console.log("🔄 You may need to get another new API key from console.x.ai")
    }
  })
  .catch((error) => {
    console.error("💥 Script execution failed:", error)
  })
