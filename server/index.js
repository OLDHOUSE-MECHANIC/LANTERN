const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

// Load .env file if present
try { require('dotenv').config(); } catch {}

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// ── Startup check ───────────────────────────────────────
if (TMDB_KEY === 'YOUR_TMDB_API_KEY_HERE') {
  console.warn('\n⚠️   WARNING: TMDB API key not set!');
  console.warn('    The homepage will show an error until you add your key.');
  console.warn('    Edit server/index.js and replace YOUR_TMDB_API_KEY_HERE');
  console.warn('    OR run:  set TMDB_API_KEY=your_key_here  (Windows)');
  console.warn('             export TMDB_API_KEY=your_key_here  (Linux/Mac)\n');
}

app.use(cors());
app.use(express.json());

// ── TMDB helper ─────────────────────────────────────────
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

// ── API Routes ───────────────────────────────────────────

// Trending
app.get('/api/trending/:type', async (req, res) => {
  try {
    res.json(await tmdb(`/trending/${req.params.type}/week`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Discover with genre + sort filters
app.get('/api/discover/:type', async (req, res) => {
  try {
    const { genre, sort_by = 'popularity.desc', page = 1 } = req.query;
    const params = { sort_by, page, 'vote_count.gte': 50 };
    if (genre) params.with_genres = genre;
    res.json(await tmdb(`/discover/${req.params.type}`, params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Multi-search
app.get('/api/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.json({ results: [] });
    res.json(await tmdb('/search/multi', { query: q, page, include_adult: false }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Movie detail — everything in one call via append_to_response
app.get('/api/movie/:id', async (req, res) => {
  try {
    const data = await tmdb(`/movie/${req.params.id}`, {
      append_to_response: 'credits,videos,similar,external_ids'
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// TV detail
app.get('/api/tv/:id', async (req, res) => {
  try {
    const data = await tmdb(`/tv/${req.params.id}`, {
      append_to_response: 'credits,videos,similar,external_ids'
    });
    res.json(data);
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

// Popular TV / Anime helper rows
app.get('/api/popular/:type', async (req, res) => {
  try {
    res.json(await tmdb(`/${req.params.type}/popular`));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Anime row — TV with Animation genre (16) from JP
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
    const type = req.params.type;
    const data = await tmdb(`/discover/${type}`, {
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


// ── Serve React build ────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  const lines = [];
  Object.values(ifaces).flat().forEach(i => {
    if (i.family === 'IPv4' && !i.internal) lines.push(i.address);
  });

  console.log('\n🔦  LANTERN is on!\n');
  console.log(`   Local:   http://localhost:${PORT}`);
  lines.forEach(ip => console.log(`   Network: http://${ip}:${PORT}  ← paste this in your TV browser`));
  console.log('\n   Open the Network address on any device on your WiFi.\n');
});
