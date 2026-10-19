const NASA_API_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,discoverymethod,disc_year,pl_rade,pl_orbper,st_teff,sy_dist+from+ps+where+default_flag=1&format=json";

chrome.runtime.onInstalled.addListener(() => {
  console.log("[StellarIndex] Extension installed. Initializing exoplanet data sync...");
  fetchAndCacheExoplanets();
});

chrome.alarms.create("syncExoplanets", { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "syncExoplanets") {
    fetchAndCacheExoplanets();
  }
});

async function fetchAndCacheExoplanets() {
  try {
    const response = await fetch(NASA_API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const planets = await response.json();
    chrome.storage.local.set({ exoplanetDatabase: planets, lastSynced: Date.now() }, () => {
      console.log(`[StellarIndex] Successfully cached ${planets.length} exoplanets.`);
    });
  } catch (error) {
    console.error("[StellarIndex] Failed to fetch live NASA dataset. Using fallback cache.", error);
  }
}