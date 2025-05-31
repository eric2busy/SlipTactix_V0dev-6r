// Data synchronization script
const { dataService } = require("../lib/data-service")

async function syncAllData() {
  console.log("Starting data synchronization...")

  try {
    // Sync live games
    console.log("Syncing live games...")
    const games = await dataService.syncLiveGames()
    console.log(`Synced ${games.length} games`)

    // Sync injuries
    console.log("Syncing injury reports...")
    const injuries = await dataService.syncInjuries()
    console.log(`Synced ${injuries.length} injuries`)

    // Sync news
    console.log("Syncing news...")
    const news = await dataService.syncNews()
    console.log(`Synced ${news.length} news items`)

    console.log("Data synchronization completed successfully!")
  } catch (error) {
    console.error("Error during data synchronization:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  syncAllData()
}

module.exports = { syncAllData }
