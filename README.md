# Battlefield 6 Stats Tracker (Netlify + GitHub Pages)

This project provides a modern website for looking up Battlefield 6 player stats using tracker.gg, with a Netlify backend proxy to get around CORS restrictions.

## Structure

```
BF6StatTracker/
├── index.html
├── script.js
├── netlify/
│   └── functions/
│       └── proxy.js
├── README.md
└── netlify.toml
```

## Setup

1. **Frontend:** `index.html` and `script.js` are your static site.  
   Host these with Netlify, GitHub Pages, or any static host.

2. **Backend Proxy:**  
   - Place `proxy.js` in `netlify/functions/`
   - Deploy to Netlify (it will be available at `/api/proxy`)
   - Set the `PROXY_BASE` in `script.js` to your Netlify domain.

3. **Redirects:**  
   - Include `netlify.toml` in your repo root for clean API routing.

4. **API Key (optional):**  
   - If you have a `TRN_API_KEY` for tracker.gg, set it in Netlify environment variables.

## Usage

- Users enter their player name and platform.
- The site displays their stats and recent matches with a modern UI.

## Credits

- Built using resources from [FlashZ/BF6StatsDiscordBot](https://github.com/FlashZ/BF6StatsDiscordBot)
- Powered by [tracker.gg](https://tracker.gg)