# 🔦 LANTERN
### Local Area Network Television, Every Room Now

A personal Netflix-style streaming hub. Runs on any device on your home WiFi — open it on your TV browser, phone, tablet, or laptop.

---

## Quick Start (Windows)

### Step 1 — Install Node.js
Download and install from **[nodejs.org](https://nodejs.org)** (LTS version). Just click through the installer.

### Step 2 — Get a free TMDB API Key
1. Go to **[themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)**
2. Create a free account, request an API key, choose "Developer"

### Step 3 — Add your API key
Find `.env.example` in the folder. Rename it to `.env`, open in Notepad, replace the placeholder:
```
TMDB_API_KEY=paste_your_actual_key_here
```

### Step 4 — Start LANTERN
Double-click **`start-windows.bat`**

First launch installs everything and builds the app (about 1 minute). After that it starts in seconds.

---

## Accessing on Other Devices

When LANTERN starts, the console will show:
```
🔦  LANTERN is on!

   Local:   http://localhost:3000
   Network: http://192.168.1.42:3000  <- open this on TV / phone
```

Type the **Network address** into any browser on your WiFi.

**TV tip:** Samsung, LG, Fire TV Stick, Chromecast with Google TV browsers all work.

**Windows Firewall:** If other devices can't connect, search "Allow an app through Windows Firewall" and allow Node.js.

---

## Features

- Homepage with hero banner + trending, top rated, in-theatres, anime rows
- Browse movies or TV by genre, sorted by popularity / rating / newest
- TV detail pages with season picker and full episode list
- Player with 4 streaming sources — switch source if one fails
- Search across movies and TV
- Deep blue-black cinematic theme, TV-friendly layout

---

## Streaming Sources (in order)

| Button | Domain |
|--------|--------|
| VidSrc CC | vidsrc.cc |
| VidSrc MOV | vidsrc.mov |
| VidSrc ME | vidsrc.me |
| 2Embed | 2embed.cc |

All sources use your TMDB ID directly — no extra lookups needed.

> These are third-party embed services. LANTERN hosts nothing itself. For personal home use only.

---

## Manual Commands

```bash
npm install && cd client && npm install && npm run build && cd ..
npm start
```
