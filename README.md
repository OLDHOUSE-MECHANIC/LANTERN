![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![React](https://img.shields.io/badge/React-CRA-blue)
![TMDB](https://img.shields.io/badge/API-TMDB-brightgreen)
![License](https://img.shields.io/badge/License-MIT-orange)
![Status](https://img.shields.io/badge/Status-Live-success)

<img width="817" height="144" alt="image" src="https://github.com/user-attachments/assets/7525672c-11ed-4bea-a8be-63ac30bca9a1" />

A self-hosted home streaming hub and media discovery platform. Full-stack, runs on your local network, works on any screen in the house.

## Demo

Give it a try, it's a cool project.

# https://lantern-dqft.onrender.com/

---

## Why LANTERN?

LAN Television. Every Room Now. Wanted something that runs at home, looks good, and doesn't need a subscription to tell you what's available to watch.

---

## What It Does

Pulls metadata from TMDB and plays from whatever's legally available. Official full movies uploaded by studios on YouTube (Warner Bros, Paramount, the usual — free with ads), public domain classics from Internet Archive, and for everything else it gives you the trailer and links to where it's actually streaming. That's the whole pipeline.

---

## Stack

**Frontend:** React (CRA), React Router, CSS custom properties  
**Backend:** Node.js + Express (TMDB proxy + source resolution)  
**APIs:** TMDB, YouTube IFrame API, Internet Archive  

---

## Get It Running

**1. Get a free TMDB API key**  
→ [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

**2. Set up your environment**
```bash
cp .env.example .env
# Edit .env and set TMDB_API_KEY=your_key_here
```

**3. Install and start**
```bash
npm install
cd client && npm install && npm run build && cd ..
npm start
```

**4. Open it up**
```
http://localhost:3000
```

Server also prints your local network IP on startup — open that on your TV or phone and you're done.

---

## Project Structure

```
LANTERN/
├── server/
│   └── index.js          # Express server — TMDB proxy + source resolution
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Home.js         # Home page — curated rows
│       │   ├── MovieDetail.js  # Movie detail + Where to Watch
│       │   ├── TVDetail.js     # TV detail + episodes + Where to Watch
│       │   ├── Player.js       # Legal player (YouTube / Archive / Trailer+WTW)
│       │   ├── Browse.js       # Genre browse with filters
│       │   └── Search.js       # Search results
│       ├── components/
│       │   ├── Hero.js         # Hero banner
│       │   ├── MediaRow.js     # Horizontal scroll row
│       │   ├── MediaCard.js    # Poster card
│       │   ├── Navbar.js       # Navigation + search
│       │   └── ContinueWatching.js
│       └── utils/
│           └── api.js          # API helpers + player mode resolution
├── .env.example
└── package.json
```

---

## Legal

LANTERN hosts nothing. Metadata is from TMDB under their terms. Playable content is either officially on YouTube by the rights holders or public domain via Internet Archive. Everything else points you to where it's actually licensed.
