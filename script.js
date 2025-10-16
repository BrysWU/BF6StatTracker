const BASE = "https://api.tracker.gg/api/v2/bf6/standard";
const profileEndpoint = (platform, userId) => `${BASE}/profile/${platform}/${userId}`;
const matchesEndpoint = (platform, userId, limit=5) => `${BASE}/matches/${platform}/${userId}?page=1&limit=${limit}`;
const searchEndpoint = (platform, name) => `${BASE}/search?platform=${platform}&query=${encodeURIComponent(name)}&autocomplete=true`;

const overviewKeys = [
  "careerPlayerRank", "score", "matchesPlayed", "matchesWon", "matchesLost", "wlPercentage",
  "timePlayed", "kills", "assists", "deaths", "kdRatio", "kdaRatio",
  "scorePerMinute", "killsPerMinute", "damagePerMinute", "headshotPercentage"
];

const statLabels = {
  careerPlayerRank: "Rank",
  score: "Score",
  matchesPlayed: "Matches Played",
  matchesWon: "Matches Won",
  matchesLost: "Matches Lost",
  wlPercentage: "Win %",
  timePlayed: "Time Played",
  kills: "Kills",
  assists: "Assists",
  deaths: "Deaths",
  kdRatio: "K/D Ratio",
  kdaRatio: "KDA Ratio",
  scorePerMinute: "Score/Min",
  killsPerMinute: "Kills/Min",
  damagePerMinute: "Damage/Min",
  headshotPercentage: "HS %"
};

const form = document.getElementById("stats-form");
const resultCard = document.getElementById("result-card");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const profileDiv = document.getElementById("profile");
const matchesDiv = document.getElementById("matches");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const playerName = document.getElementById("playerName").value.trim();
  const platform = document.getElementById("platform").value;

  resultCard.classList.remove("hidden");
  loading.classList.remove("hidden");
  errorDiv.classList.add("hidden");
  profileDiv.innerHTML = "";
  matchesDiv.innerHTML = "";

  try {
    // 1. Search for userId via /search
    let searchUrl = searchEndpoint(platform, playerName);
    let searchResp = await fetch(searchUrl, {headers: { "Accept": "application/json" }});
    if (!searchResp.ok) throw new Error("Could not search player. API may be blocking requests.");
    let searchData = await searchResp.json();
    let matches = searchData.matches || searchData.data || searchData || [];
    if (!Array.isArray(matches)) matches = [matches];
    if (!matches.length) throw new Error("Player not found. Check spelling and platform.");

    // Use first match
    let chosen = matches[0];
    let userId = chosen.titleUserId || chosen.userId;
    let displayName = chosen.platformUserHandle || playerName;
    let countryCode = chosen.additionalParameters?.countryCode || chosen.countryCode || "";

    // 2. Fetch profile
    let profileUrl = profileEndpoint(platform, userId);
    let profileResp = await fetch(profileUrl, {headers: { "Accept": "application/json" }});
    if (!profileResp.ok) throw new Error("Could not fetch player stats. API may be blocking requests.");
    let profileData = await profileResp.json();
    let data = profileData.data || profileData;
    let segments = data.segments || [];
    let overview = segments[0]?.stats || {};

    // 3. Render profile
    let flagEmoji = countryCode ? countryToEmoji(countryCode) : "";
    let rankImg = overview.careerPlayerRank?.metadata?.imageUrl;
    let thumbnail = rankImg ? `<img src="${imgsvcUrl(rankImg)}" alt="Rank" class="w-16 h-16 rounded-full mb-2"/>` : "";

    profileDiv.innerHTML = `
      <div class="flex flex-col items-center">
        ${thumbnail}
        <h2 class="text-2xl font-bold text-blue-100 mb-1">${displayName} ${flagEmoji} <span class="text-sm text-blue-400">(${platform})</span></h2>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4">
        ${overviewKeys.map(k => {
          let v = overview[k]?.displayValue;
          if (v) {
            return `<div class="bg-blue-900/70 rounded-lg p-2 flex flex-col items-center">
              <span class="text-blue-200 font-medium">${statLabels[k] || k}</span>
              <span class="text-white text-lg font-bold">${v}</span>
            </div>`;
          }
          return "";
        }).join("")}
      </div>
    `;

    // 4. Fetch recent matches
    let matchesUrl = matchesEndpoint(platform, userId, 5);
    let matchesResp = await fetch(matchesUrl, {headers: { "Accept": "application/json" }});
    let matchesData = await matchesResp.json();
    let recents = matchesData.matches || matchesData.data || matchesData || [];
    if (!Array.isArray(recents)) recents = [recents];

    if (recents.length) {
      matchesDiv.innerHTML = `
        <h3 class="text-xl text-blue-100 font-bold mb-2">Recent Matches</h3>
        <ul class="space-y-2">
          ${recents.slice(0, 5).map((m, idx) => {
            let seg = m.segments?.[0] || {};
            let meta = m.metadata || seg.metadata || {};
            let date = (meta.timestamp || "").slice(0, 10) || "--------";
            let ks = seg.stats || {};
            return `<li class="bg-blue-800/70 rounded-lg p-2 text-white flex flex-col sm:flex-row sm:justify-between gap-2">
              <span><strong>${date}</strong></span>
              <span>Kills: ${ks.kills?.displayValue ?? "-"}</span>
              <span>Deaths: ${ks.deaths?.displayValue ?? "-"}</span>
              <span>K/D: ${ks.kdRatio?.displayValue ?? "-"}</span>
            </li>`;
          }).join("")}
        </ul>
      `;
    } else {
      matchesDiv.innerHTML = `<div class="text-blue-200 font-semibold">No recent matches found.</div>`;
    }

    loading.classList.add("hidden");
  } catch (err) {
    loading.classList.add("hidden");
    errorDiv.textContent = err.message;
    errorDiv.classList.remove("hidden");
  }
});

function countryToEmoji(cc) {
  // Convert ISO country code to emoji flag
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 0x41));
}

function imgsvcUrl(img) {
  return `https://imgsvc.trackercdn.com/url/max-width(168),quality(70)/${encodeURIComponent(img)}/image.png`;
}