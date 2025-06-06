// Test Grok 3 Mini using the official xAI example format
console.log("🧪 Testing Grok 3 Mini with official xAI configuration...")

const apiKey = "xai-BJxM2fDN4o31T73ZWdrwhhNdZ35mNKhi5XIQ1XPKgeXFcih8qSaQbQ6002d8ppyo1hxI9OPcGrzp8pWn"

try {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [
        {
          role: "system",
          content: "You are SLIPTACTIX, a sports analyst.",
        },
        {
          role: "user",
          content: "What is 2 + 2? Just say the answer.",
        },
      ],
    }),
  })

  console.log("📡 Response status:", response.status)
  console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ Error response:", errorText)

    if (response.status === 404) {
      console.log("🔍 Model 'grok-3-mini' not found. Checking available models...")
    } else if (response.status === 403) {
      console.log("🚫 Access forbidden. Check API key permissions.")
    } else if (response.status === 401) {
      console.log("🔑 Authentication failed. Check API key.")
    }

    // Removed the illegal return statement outside of a function
  }

  const data = await response.json()
  console.log("✅ Success! Grok 3 Mini response:")
  console.log("📝 Message:", data.choices[0].message.content)
  console.log("📊 Usage:", data.usage)
  console.log("🤖 Model used:", data.model || "grok-3-mini")
} catch (error) {
  console.error("💥 Request failed:", error.message)
}
