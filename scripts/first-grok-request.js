/**
 * First Grok API Request Test
 * Makes the initial request to the Grok API to test the connection
 */

// Use environment variable for API key
const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY

if (!apiKey) {
  console.error("❌ Error: No API key found in environment variables")
  console.log("Please set XAI_API_KEY or GROK_API_KEY in your environment")
  process.exit(1)
}

console.log("🔑 API key found in environment variables")
console.log(`🔒 Key prefix: ${apiKey.substring(0, 10)}...`)

async function makeFirstRequest() {
  console.log("\n🚀 Making first request to Grok API...")

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "What is the meaning of life, the universe, and everything?",
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      console.error(`Error details: ${errorText}`)
      return
    }

    const data = await response.json()

    console.log("\n✅ SUCCESS! First Grok API request completed!")
    console.log("\n📝 Response:")
    console.log("=".repeat(50))
    console.log(data.choices[0].message.content)
    console.log("=".repeat(50))

    console.log("\n📊 Usage Statistics:")
    console.log(`- Prompt tokens: ${data.usage.prompt_tokens}`)
    console.log(`- Completion tokens: ${data.usage.completion_tokens}`)
    console.log(`- Total tokens: ${data.usage.total_tokens}`)

    console.log("\n🎉 Your Grok API key is working correctly!")
    console.log("You can now use it in your application.")
  } catch (error) {
    console.error("❌ Request failed:", error.message)
  }
}

// Execute the request
makeFirstRequest()
