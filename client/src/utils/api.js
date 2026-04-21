const BASE = '/api';
export const IMG = 'https://image.tmdb.org/t/p';

export const poster = (path, size = 'w342') =>
  path ? `${IMG}/${size}${path}` : null;

export const backdrop = (path, size = 'w1280') =>
  path ? `${IMG}/${size}${path}` : null;

async function get(url) {
  const res = await fetch(BASE + url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text.slice(0, 100)}`);
  }
  return res.json();
}

export const api = {
  trending: (type = 'all') => get(`/trending/${type}`),
  discover: (type, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/discover/${type}?${q}`);
  },
  search: (q, page = 1) => get(`/search?q=${encodeURIComponent(q)}&page=${page}`),
  movie: (id) => get(`/movie/${id}`),
  tv: (id) => get(`/tv/${id}`),
  season: (id, s) => get(`/tv/${id}/season/${s}`),
  genres: (type) => get(`/genres/${type}`),
  topRated: (type) => get(`/top-rated/${type}`),
  nowPlaying: () => get(`/now-playing`),
  popular: (type) => get(`/popular/${type}`),
  anime: () => get(`/anime`),
  // Indian content
  trendingIndia: (type) => get(`/trending-india/${type}`),
  bollywood: () => get(`/bollywood`),
  southIndian: () => get(`/south-indian`),
  indianSeries: () => get(`/indian-series`),
};

// ── Embed sources ─────────────────────────────────────────
// All accept TMDB numeric IDs. ds_lang sets default subtitle language.
export const SOURCES = {
  movie: [
    (id, lang) => `https://vidlink.pro/movie/${id}`,                                               // 1. VidLink    — fast CDN, multi-server
    (id, lang) => `https://player.videasy.net/movie/${id}`,                                        // 2. Videasy    — 4K, very fast
    (id, lang) => `https://player.autoembed.cc/embed/movie/${id}`,                                 // 3. AutoEmbed  — large library
    (id, lang) => `https://vidfast.pro/movie/${id}`,                                               // 4. VidFast    — 4K, fast HLS
    (id, lang) => `https://vidsrc.cc/v2/embed/movie/${id}`,                                        // 5. VidSrc CC  — reliable
    (id, lang) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,                                 // 6. MultiEmbed — multiple servers inside
    (id, lang) => `https://vidsrc.me/embed/movie?tmdb=${id}${lang ? '&ds_lang=' + lang : ''}`,    // 7. VidSrc ME  — subtitle lang support
    (id, lang) => `https://www.2embed.cc/embed/${id}`,                                             // 8. 2Embed     — fallback
  ],
  tv: [
    (id, s, e, lang) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
    (id, s, e, lang) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
    (id, s, e, lang) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
    (id, s, e, lang) => `https://vidfast.pro/tv/${id}/${s}/${e}`,
    (id, s, e, lang) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
    (id, s, e, lang) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    (id, s, e, lang) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}${lang ? '&ds_lang=' + lang : ''}`,
    (id, s, e, lang) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  ],
};

export const SOURCE_LABELS = ['VidLink', 'Videasy', 'AutoEmbed', 'VidFast', 'VidSrc CC', 'MultiEmbed', 'VidSrc ME', '2Embed'];

// ── Continue Watching — stored in localStorage ────────────
const CW_KEY = 'lantern_continue_watching';
const CW_MAX = 20;

export function getContinueWatching() {
  try {
    return JSON.parse(localStorage.getItem(CW_KEY) || '[]');
  } catch { return []; }
}

export function saveContinueWatching(entry) {
  // entry: { id, type, title, poster_path, season?, episode?, progress, timestamp }
  try {
    let list = getContinueWatching();
    // Remove existing entry for same id+season+episode
    list = list.filter(e => !(e.id === entry.id && e.season === entry.season && e.episode === entry.episode));
    list.unshift({ ...entry, timestamp: Date.now() });
    list = list.slice(0, CW_MAX);
    localStorage.setItem(CW_KEY, JSON.stringify(list));
  } catch {}
}

export function removeContinueWatching(id, season, episode) {
  try {
    let list = getContinueWatching();
    list = list.filter(e => !(e.id === id && e.season === season && e.episode === episode));
    localStorage.setItem(CW_KEY, JSON.stringify(list));
  } catch {}
}
