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
  freeMovies: () => get(`/free-movies`),
  trendingIndia: (type) => get(`/trending-india/${type}`),
  bollywood: () => get(`/bollywood`),
  southIndian: () => get(`/south-indian`),
  indianSeries: () => get(`/indian-series`),
};

// ── Player modes ──────────────────────────────────────────────────────────────
//
// LANTERN uses only legal, openly licensed sources:
//
//   1. YouTube official free movies  — full films officially uploaded by studios
//      (Warner Bros, Paramount, etc.), freely available with ads on YouTube.
//      Embedded via the standard YouTube IFrame API — no extra key required.
//
//   2. Internet Archive (archive.org) — public domain films whose copyright has
//      expired. Embedded via archive.org's own player embed URL.
//
//   3. Trailer + Where to Watch      — for everything else, LANTERN plays the
//      official YouTube trailer (sourced from TMDB's video data) and shows a
//      panel of links to licensed streaming platforms so the user can watch
//      legally through the service they already subscribe to.
//
// There are NO third-party embed sites, NO unlicensed stream sources, and NO
// grey-area iframes in this codebase.
// ─────────────────────────────────────────────────────────────────────────────

export const PLAYER_MODE = {
  YOUTUBE_FREE: 'youtube_free',
  ARCHIVE:      'archive',
  TRAILER:      'trailer',
};

export function youtubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

export function archiveEmbedUrl(identifier) {
  return `https://archive.org/embed/${identifier}`;
}

export function findTrailer(videos = []) {
  const results = videos?.results || [];
  return (
    results.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
    results.find(v => v.type === 'Teaser'  && v.site === 'YouTube') ||
    results.find(v => v.site === 'YouTube')
  );
}

export function resolvePlayerMode(data, { youtubeMovieId, archiveId } = {}) {
  if (youtubeMovieId) {
    return { mode: PLAYER_MODE.YOUTUBE_FREE, src: youtubeEmbedUrl(youtubeMovieId) };
  }
  if (archiveId) {
    return { mode: PLAYER_MODE.ARCHIVE, src: archiveEmbedUrl(archiveId) };
  }
  const trailer = findTrailer(data?.videos);
  return {
    mode: PLAYER_MODE.TRAILER,
    src: trailer ? youtubeEmbedUrl(trailer.key) : null,
    trailerKey: trailer?.key || null,
  };
}

export function whereToWatchLinks(title) {
  const q = encodeURIComponent(title);
  return [
    { label: 'Netflix',     url: `https://www.netflix.com/search?q=${q}`,               color: '#E50914' },
    { label: 'Prime Video', url: `https://www.amazon.com/s?k=${q}&i=instant-video`,      color: '#00A8E0' },
    { label: 'Disney+',     url: `https://www.disneyplus.com/search/${q}`,               color: '#1B3A6B' },
    { label: 'Apple TV+',   url: `https://tv.apple.com/search?term=${q}`,                color: '#888' },
    { label: 'Hotstar',     url: `https://www.hotstar.com/in/search?q=${q}`,             color: '#1F80E0' },
    { label: 'JioCinema',   url: `https://www.jiocinema.com/search/${q}`,                color: '#7B2FBE' },
    { label: 'SonyLIV',     url: `https://www.sonyliv.com/search/${q}`,                  color: '#0057A8' },
    { label: 'Mubi',        url: `https://mubi.com/search/${q}`,                         color: '#00A0E3' },
  ];
}

// ── Continue Watching ─────────────────────────────────────────────────────────
const CW_KEY = 'lantern_continue_watching';
const CW_MAX = 20;

export function getContinueWatching() {
  try { return JSON.parse(localStorage.getItem(CW_KEY) || '[]'); }
  catch { return []; }
}

export function saveContinueWatching(entry) {
  try {
    let list = getContinueWatching();
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
