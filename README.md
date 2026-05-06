# 🔦 LANTERN

A self-hosted home streaming hub and media discovery platform — built as a full-stack concept project demonstrating React, Express, REST API integration, and product design.

---

## What it does

LANTERN is a Netflix-style frontend for discovering movies and TV shows. It uses the [TMDB API](https://www.themoviedb.org/) for metadata, and plays content from **legally licensed, openly available sources only**:

| Source | What's available |
|---|---|
| **YouTube** (official) | Full movies officially uploaded by studios (Warner Bros, Paramount etc.) with ads — freely and legally watchable |
| **Internet Archive** | Public domain films (pre-copyright-expiry classics) via archive.org |
| **Trailer + Where to Watch** | For everything else — official YouTube trailer + links to Netflix, Prime, Hotstar etc. |

There are no grey-area embed sources, no unlicensed stream iframes, and no piracy anywhere in the codebase.

---

## Features

- 🎬 Hero banner with auto-rotation — surfaces free-to-watch content first
- 🇮🇳 Deep Indian content curation — Bollywood, South Indian, Indian web series, India trending
- 🌍 Balanced India / Global split across home sections
- ▶ Free movie player — YouTube official + Internet Archive embeds
- 📺 Trailer player + Where to Watch panel for subscription content
- 🔍 Search across movies and TV
- 📂 Browse by genre with sort filters
- 🕐 Continue Watching (localStorage)
- Fully responsive — works on mobile, tablet, and TV browsers

---

## Stack

- **Frontend:** React (CRA), React Router, CSS custom properties
- **Backend:** Node.js + Express (TMDB proxy + source resolution)
- **APIs:** TMDB, YouTube IFrame API, Internet Archive

---

## Setup

**1. Get a free TMDB API key**
→ [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

**2. Configure environment**
```bash
cp .env.example .env
# Edit .env and set TMDB_API_KEY=your_key_here
```

**3. Install and run**
```bash
npm install
cd client && npm install && npm run build && cd ..
npm start
```

**4. Open in browser**
```
http://localhost:3000
```
The server also prints your local network IP — open that URL on your TV or phone.

---

## Project structure

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

LANTERN hosts no content. All metadata is from TMDB under their terms of use. Playable content is either officially uploaded to YouTube by rights holders, or in the public domain via Internet Archive. "Where to Watch" links direct users to licensed platforms.
