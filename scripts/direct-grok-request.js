/**
 * Direct Grok API Request
 * Makes a direct request to the Grok API using the hardcoded API key
 */

// IMPORTANT: This is only for testing purposes
// In production, always use environment variables
const API_KEY = "xai-BJxM2fDN4o31T73ZWdrwhhNdZ35mNKhi5XIQ1XPKgeXFcih8qSaQbQ6002d8ppyo1hxI9OPcGrzp8pWn"

console.log("🚀 Making direct request to Grok API...")
console.log("📝 Request details:")
console.log("- URL: https://api.x.ai/v1/chat/completions")
console.log("- Model: grok-3-latest")
console.log("- API Key: " + API_KEY.substring(0, 10) + "...")

async function makeDirectRequest() {
  try {
    console.log("\n⏳ Sending request...")

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Hello! This is my first request to the Grok API. Please respond with a short greeting.",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0.7,
      }),
    })

    console.log(`\n📡 Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Error response:")
      console.error(errorText)
      return
    }

    const data = await response.json()

    console.log("\n✅ SUCCESS! Response received:")
    console.log("=".repeat(50))
    console.log(data.choices[0].message.content)
    console.log("=".repeat(50))

    console.log("\n📊 Usage statistics:")
    console.log(JSON.stringify(data.usage, null, 2))

    console.log("\n🎉 Your request has been successfully sent to the Grok API!")
    console.log("Check your dashboard - it should now show your first request.")
  } catch (error) {
    console.error("\n❌ Request failed:")
    console.error(error)
  }
}

// Execute the request
makeDirectRequest()
