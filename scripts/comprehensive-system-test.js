// Comprehensive System Test - Diagnose and Fix All Issues
console.log("🚀 Starting Comprehensive System Test...")
console.log("=".repeat(60))

// Test 1: Environment Variables
console.log("\n📋 TEST 1: Environment Variables")
console.log("-".repeat(30))

const sportsApiKey = process.env.SPORTS_API_KEY
const grokApiKey = process.env.GROK_API_KEY

console.log(`Sports API Key: ${sportsApiKey ? "✅ Present" : "❌ Missing"}`)
console.log(`Grok API Key: ${grokApiKey ? "✅ Present" : "❌ Missing"}`)

if (sportsApiKey) {
  console.log(`Sports API Key Preview: ${sportsApiKey.substring(0, 10)}...`)
}
if (grokApiKey) {
  console.log(`Grok API Key Preview: ${grokApiKey.substring(0, 10)}...`)
}

// Test 2: Sports Games Odds API Connection
console.log("\n🏀 TEST 2: Sports Games Odds API Connection")
console.log("-".repeat(40))

async function testSportsAPI() {
  const possibleUrls = [
    "https://api.sportsgamesodds.com/v1",
    "https://api.sportsgamesodds.com/v2",
    "https://api.sportsgamesodds.com",
    "https://sportsgamesodds.com/api/v1",
  ]

  const possibleEndpoints = ["/sports", "/leagues", "/teams", "/nba", "/status"]

  for (const baseUrl of possibleUrls) {
    console.log(`\n🔍 Testing base URL: ${baseUrl}`)

    for (const endpoint of possibleEndpoints) {
      try {
        const url = `${baseUrl}${endpoint}`
        console.log(`  Testing: ${url}`)

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${sportsApiKey}`,
            "X-API-Key": sportsApiKey,
            "Content-Type": "application/json",
          },
        })

        console.log(`  Status: ${response.status}`)

        if (response.ok) {
          const data = await response.json()
          console.log(`  ✅ SUCCESS! Working endpoint found: ${url}`)
          console.log(`  Response preview:`, JSON.stringify(data).substring(0, 200) + "...")
          return { baseUrl, endpoint, working: true }
        } else {
          const errorText = await response.text()
          console.log(`  ❌ Failed: ${response.status} - ${errorText.substring(0, 100)}`)
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`)
      }
    }
  }

  return { working: false }
}

const sportsApiResult = await testSportsAPI()

// Test 3: Grok API Connection
console.log("\n🤖 TEST 3: Grok API Connection")
console.log("-".repeat(30))

async function testGrokAPI() {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${grokApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: "Test connection - just say 'working'" }],
        max_tokens: 10,
      }),
    })

    console.log(`Grok API Status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Grok API is working!")
      console.log(`Response: ${data.choices[0].message.content}`)
      return { working: true, model: "grok-3-mini" }
    } else {
      const errorText = await response.text()
      console.log(`❌ Grok API failed: ${response.status}`)
      console.log(`Error: ${errorText}`)
      return { working: false, error: errorText }
    }
  } catch (error) {
    console.log(`❌ Grok API error: ${error.message}`)
    return { working: false, error: error.message }
  }
}

const grokApiResult = await testGrokAPI()

// Test 4: Alternative Sports APIs (if Sports Games Odds fails)
console.log("\n🔄 TEST 4: Alternative Sports Data Sources")
console.log("-".repeat(40))

async function testAlternativeSportsAPIs() {
  // Test ESPN API (free, no key required)
  try {
    console.log("🔍 Testing ESPN API...")
    const espnResponse = await fetch("http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard")

    if (espnResponse.ok) {
      const espnData = await espnResponse.json()
      console.log("✅ ESPN API is working!")
      console.log(`Found ${espnData.events?.length || 0} games`)
      return {
        working: true,
        source: "ESPN",
        url: "http://site.api.espn.com/apis/site/v2/sports/basketball/nba",
        data: espnData.events?.slice(0, 2), // Sample data
      }
    }
  } catch (error) {
    console.log(`❌ ESPN API failed: ${error.message}`)
  }

  // Test NBA API (free, no key required)
  try {
    console.log("🔍 Testing NBA Stats API...")
    const nbaResponse = await fetch(
      "https://stats.nba.com/stats/scoreboardV2?DayOffset=0&LeagueID=00&gameDate=" +
        new Date().toISOString().split("T")[0],
    )

    if (nbaResponse.ok) {
      const nbaData = await nbaResponse.json()
      console.log("✅ NBA Stats API is working!")
      return {
        working: true,
        source: "NBA Stats",
        url: "https://stats.nba.com/stats",
        data: nbaData,
      }
    }
  } catch (error) {
    console.log(`❌ NBA Stats API failed: ${error.message}`)
  }

  return { working: false }
}

const alternativeApiResult = await testAlternativeSportsAPIs()

// Test Results Summary
console.log("\n📊 TEST RESULTS SUMMARY")
console.log("=".repeat(60))

console.log(`\n🔑 API Keys:`)
console.log(`  Sports API Key: ${sportsApiKey ? "✅ Present" : "❌ Missing"}`)
console.log(`  Grok API Key: ${grokApiKey ? "✅ Present" : "❌ Missing"}`)

console.log(`\n🏀 Sports Data:`)
if (sportsApiResult.working) {
  console.log(`  Sports Games Odds API: ✅ Working`)
  console.log(`  Base URL: ${sportsApiResult.baseUrl}`)
  console.log(`  Endpoint: ${sportsApiResult.endpoint}`)
} else if (alternativeApiResult.working) {
  console.log(`  Sports Games Odds API: ❌ Not Working`)
  console.log(`  Alternative Source: ✅ ${alternativeApiResult.source} Working`)
} else {
  console.log(`  All Sports APIs: ❌ Not Working`)
}

console.log(`\n🤖 AI Integration:`)
console.log(`  Grok API: ${grokApiResult.working ? "✅ Working" : "❌ Not Working"}`)

// Recommendations
console.log("\n💡 RECOMMENDATIONS")
console.log("=".repeat(60))

if (!sportsApiResult.working && !alternativeApiResult.working) {
  console.log("❌ CRITICAL: No sports data sources are working")
  console.log("   → Check your Sports Games Odds API key")
  console.log("   → Verify API documentation for correct endpoints")
  console.log("   → Consider using ESPN API as fallback")
} else if (!sportsApiResult.working && alternativeApiResult.working) {
  console.log("⚠️  Sports Games Odds API not working, but alternatives available")
  console.log(`   → Switch to ${alternativeApiResult.source} API`)
  console.log("   → Update sports data client to use working API")
} else {
  console.log("✅ Sports data sources are working")
}

if (!grokApiResult.working) {
  console.log("❌ Grok API not working")
  console.log("   → Check your Grok API key")
  console.log("   → Verify the key hasn't been blocked")
  console.log("   → Try regenerating the API key")
} else {
  console.log("✅ Grok API is working")
}

// Final Status
console.log("\n🎯 FINAL STATUS")
console.log("=".repeat(60))

const overallWorking = (sportsApiResult.working || alternativeApiResult.working) && grokApiResult.working

if (overallWorking) {
  console.log("🎉 SYSTEM STATUS: READY TO GO!")
  console.log("   All critical components are working")
  console.log("   RAG system can function properly")
} else {
  console.log("🚨 SYSTEM STATUS: NEEDS ATTENTION")
  console.log("   Some components need fixing before full functionality")
}

// Return results for decision making
const results = {
  sportsApi: sportsApiResult,
  alternativeApi: alternativeApiResult,
  grokApi: grokApiResult,
  overallWorking,
  recommendations: {
    useSportsGamesOdds: sportsApiResult.working,
    useAlternativeApi: !sportsApiResult.working && alternativeApiResult.working,
    fixGrokApi: !grokApiResult.working,
    systemReady: overallWorking,
  },
}

console.log(results)
