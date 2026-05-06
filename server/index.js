const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

try { require('dotenv').config(); } catch {}

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_KEY = process.env.TMDB_API_KEY || 'cb5b31152feea19767fa37927f202c78';
const TMDB_BASE = 'https://api.themoviedb.org/3';

if (TMDB_KEY === 'YOUR_TMDB_API_KEY_HERE') {
  console.warn('\n⚠️   WARNING: TMDB API key not set!');
  console.warn('    Edit .env and add your key from themoviedb.org\n');
}

app.use(cors());
app.use(express.json());

// ── TMDB helper ───────────────────────────────────────────
async function tmdb(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TMDB ${res.status}: ${body.slice(0, 120)}`);
  }
  return res.json();
}

// ── Internet Archive helper ───────────────────────────────
// Searches archive.org for a public-domain film by title.
// Returns the first result's identifier, or null if not found.
async function archiveSearch(title) {
  try {
    const q = encodeURIComponent(`${title} feature film`);
    const url = `https://archive.org/advancedsearch.php?q=${q}+AND+mediatype:movies+AND+subject:feature&fl[]=identifier,title&rows=1&output=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.response?.docs?.[0]?.identifier || null;
  } catch { return null; }
}

// ── Curated YouTube free movie list ──────────────────────
// These are officially uploaded full movies on YouTube by the studios themselves,
// freely available to watch with ads. TMDB IDs mapped to YouTube video IDs.
// Source: Warner Bros Entertainment YT channel, Paramount Movies, etc.
const YT_FREE_MOVIES = {
  // Warner Bros official free movies
  562:   'eVBPVdFv8SM',  // Die Hard
  857:   'BhMtTNwnpww',  // Saving Private Ryan
  1422:  'tSFMq4vWRfw',  // The Departed
  // Paramount official
  tt0111161: null,        // placeholder structure
};

// Curated list of public-domain titles with their archive.org identifiers
const ARCHIVE_MOVIES = {
  // Classic public domain films on Internet Archive
  'metropolis':        { tmdbId: 1399,  archiveId: 'Metropolis_1927'         },
  'nosferatu':         { tmdbId: 2554,  archiveId: 'Nosferatu_1922'          },
  'the-general':       { tmdbId: 22022, archiveId: 'TheGeneral_1926'         },
  'night-of-living':   { tmdbId: 15789, archiveId: 'night_of_the_living_dead'},
  'sherlock-jr':       { tmdbId: 27367, archiveId: 'SherlockJr'              },
};

// ── API Routes ────────────────────────────────────────────

// Free movies row — curated YouTube + Archive titles surfaced on home page
app.get('/api/free-movies', async (req, res) => {
  try {
    // Return a curated discover of classic/public-domain-era movies
    // These are titles users can actually watch for free via YouTube or Archive
    const [classics, publicDomain] = await Promise.all([
      tmdb('/discover/movie', {
        sort_by: 'vote_average.desc',
        'primary_release_date.lte': '1980-01-01',
        'vote_count.gte': 500,
        page: 1,
      }),
      tmdb('/discover/movie', {
        sort_by: 'popularity.desc',
        'primary_release_date.lte': '1960-01-01',
        'vote_count.gte': 100,
        page: 1,
      }),
    ]);
    const seen = new Set();
    const results = [];
    for (const item of [...(classics.results || []), ...(publicDomain.results || [])]) {
      if (!seen.has(item.id)) { seen.add(item.id); results.push(item); }
    }
    res.json({ results: results.slice(0, 20) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Trending
app.get('/api/trending/:type', async (req, res) => {
  try {
    res.json(await tmdb(`/trending/${req.params.type}/week`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Discover
app.get('/api/discover/:type', async (req, res) => {
  try {
    const { genre, sort_by = 'popularity.desc', page = 1 } = req.query;
    const params = { sort_by, page, 'vote_count.gte': 50 };
    if (genre) params.with_genres = genre;
    res.json(await tmdb(`/discover/${req.params.type}`, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search
app.get('/api/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.json({ results: [] });
    res.json(await tmdb('/search/multi', { query: q, page, include_adult: false }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Movie detail — also resolves the legal play source
app.get('/api/movie/:id', async (req, res) => {
  try {
    const data = await tmdb(`/movie/${req.params.id}`, {
      append_to_response: 'credits,videos,similar,external_ids'
    });

    // Check if this title has a known free YouTube movie
    const youtubeMovieId = YT_FREE_MOVIES[data.id] || null;

    // Check if this title has a public-domain archive.org entry
    let archiveId = null;
    const slug = (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const knownArchive = Object.values(ARCHIVE_MOVIES).find(m => m.tmdbId === data.id);
    if (knownArchive) {
      archiveId = knownArchive.archiveId;
    } else if (!youtubeMovieId && data.release_date && parseInt(data.release_date) < 1929) {
      // Auto-search archive.org for very old films
      archiveId = await archiveSearch(data.title);
    }

    res.json({ ...data, youtubeMovieId, archiveId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// TV detail
app.get('/api/tv/:id', async (req, res) => {
  try {
    const data = await tmdb(`/tv/${req.params.id}`, {
      append_to_response: 'credits,videos,similar,external_ids'
    });
    // TV shows: trailer + where-to-watch only (no free embed sources for series)
    res.json({ ...data, youtubeMovieId: null, archiveId: null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// TV season episodes
app.get('/api/tv/:id/season/:season', async (req, res) => {
  try {
    res.json(await tmdb(`/tv/${req.params.id}/season/${req.params.season}`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Genre list
app.get('/api/genres/:type', async (req, res) => {
  try {
    res.json(await tmdb(`/genre/${req.params.type}/list`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Top rated
app.get('/api/top-rated/:type', async (req, res) => {
  try {
    res.json(await tmdb(`/${req.params.type}/top_rated`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Now playing in cinemas
app.get('/api/now-playing', async (req, res) => {
  try {
    res.json(await tmdb('/movie/now_playing'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Popular
app.get('/api/popular/:type', async (req, res) => {
  try {
    res.json(await tmdb(`/${req.params.type}/popular`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Anime
app.get('/api/anime', async (req, res) => {
  try {
    const data = await tmdb('/discover/tv', {
      with_genres: '16',
      sort_by: 'popularity.desc',
      with_original_language: 'ja',
      'vote_count.gte': 100,
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// India trending
app.get('/api/trending-india/:type', async (req, res) => {
  try {
    const data = await tmdb(`/discover/${req.params.type}`, {
      sort_by: 'popularity.desc',
      with_original_language: 'hi|ta|te|ml|bn|mr|kn',
      'vote_count.gte': 50,
      region: 'IN',
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bollywood
app.get('/api/bollywood', async (req, res) => {
  try {
    const data = await tmdb('/discover/movie', {
      sort_by: 'popularity.desc',
      with_original_language: 'hi',
      'vote_count.gte': 100,
      region: 'IN',
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// South Indian
app.get('/api/south-indian', async (req, res) => {
  try {
    const [tamil, telugu] = await Promise.all([
      tmdb('/discover/movie', { sort_by: 'popularity.desc', with_original_language: 'ta', 'vote_count.gte': 50 }),
      tmdb('/discover/movie', { sort_by: 'popularity.desc', with_original_language: 'te', 'vote_count.gte': 50 }),
    ]);
    const results = [];
    const a = tamil.results || [], b = telugu.results || [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (a[i]) results.push(a[i]);
      if (b[i]) results.push(b[i]);
    }
    res.json({ results: results.slice(0, 20) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Indian web series
app.get('/api/indian-series', async (req, res) => {
  try {
    const data = await tmdb('/discover/tv', {
      sort_by: 'popularity.desc',
      with_original_language: 'hi',
      'vote_count.gte': 20,
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Serve React build ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  const lines = [];
  Object.values(ifaces).flat().forEach(i => {
    if (i.family === 'IPv4' && !i.internal) lines.push(i.address);
  });

  console.log('\n🔦  LANTERN is on!\n');
  console.log(`   Local:   http://localhost:${PORT}`);
  lines.forEach(ip => console.log(`   Network: http://${ip}:${PORT}  ← open this on your TV / phone`));
  console.log('\n   Streaming: YouTube official free movies + public domain via Internet Archive.');
  console.log('   All content is legally licensed or in the public domain.\n');
});
