import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';
import ContinueWatching from '../components/ContinueWatching';
import { api } from '../utils/api';

async function safeGet(fn) {
  try { return await fn(); } catch { return { results: [] }; }
}

export default function Home() {
  const [sections, setSections] = useState(null);
  const [error, setError] = useState(null);
  const [cwKey, setCwKey] = useState(0);

  useEffect(() => {
    const onFocus = () => setCwKey(k => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    Promise.all([
      safeGet(() => api.freeMovies()),        // actually watchable on LANTERN
      safeGet(() => api.anime()),             // Anime
      safeGet(() => api.trending('all')),     // Global trending
      safeGet(() => api.topRated('movie')),   // Top rated movies
      safeGet(() => api.topRated('tv')),      // Top rated TV
      safeGet(() => api.nowPlaying()),        // In theatres now
    ]).then(([free, anime, global, topMovie, topTV, nowPlay]) => {  // Fix 1: moved all destructuring inside single array
      setSections({ free, anime, global, topMovie, topTV, nowPlay });
    }).catch(err => setError(err.message));
  }, []);

  if (!sections && !error) return (
    <div style={{ paddingTop: 'var(--nav-height)', textAlign: 'center' }}>
      <div className="spinner" style={{ marginTop: 100 }} />
      <p style={{ color: 'var(--text-muted)', marginTop: 16, fontFamily: 'var(--font-display)', letterSpacing: 3, fontSize: 14 }}>
        LIGHTING UP...
      </p>
    </div>
  );

  if (error) return (
    <div style={{ paddingTop: 120, textAlign: 'center', padding: '120px 24px' }}>
      <p style={{ fontSize: 56 }}>🔦</p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: 3, marginBottom: 16, marginTop: 16, color: 'var(--accent-bright)' }}>
        LANTERN NEEDS YOUR API KEY
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.8 }}>
        Open <code style={{ color: 'var(--accent-bright)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>.env</code> and add your TMDB API key.
      </p>
      <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer"
        style={{ color: 'var(--accent-bright)', fontWeight: 600, textDecoration: 'underline' }}>
        → Get a free key at themoviedb.org
      </a>
      <details style={{ marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>
        <summary style={{ cursor: 'pointer' }}>Technical details</summary>
        <pre style={{ marginTop: 8, background: 'var(--bg-elevated)', padding: 12, borderRadius: 8, maxWidth: 600, margin: '8px auto', overflow: 'auto', textAlign: 'left' }}>{error}</pre>
      </details>
    </div>
  );

  const { free, anime, global, topMovie, topTV, nowPlay } = sections;

  // Hero: pull from free/watchable content first, fall back to trending
  const heroItems = [
    ...(free.results || []),
    ...(global.results || []),   // Fix 2: removed indMovie (undefined), kept global
  ].filter((item, idx, arr) => arr.findIndex(i => i.id === item.id) === idx)
   .slice(0, 10);

  return (
    <div>
      <Hero items={heroItems} />

      <div style={{ marginTop: '-40px', position: 'relative', zIndex: 2 }}>
        <ContinueWatching onUpdate={cwKey} />

        {/* What you can watch right now on LANTERN */}
        <div className="india-divider">
          <span>🎬 WATCH NOW ON LANTERN</span>
        </div>
        <MediaRow
          title="▶ FREE TO WATCH"
          items={free.results || []}
          type="movie"
          browseLink="/browse/movie"
          badge="FREE"
        />

        {/* Global section */}
        <div className="india-divider">   {/* Fix 3: restored missing opening <div> tag */}
          <span>🌍 GLOBAL</span>
        </div>
        <MediaRow title="🌐 TRENDING WORLDWIDE"   items={global.results    || []}                browseLink="/browse/movie" />
        <MediaRow title="🎬 IN THEATRES NOW"      items={nowPlay.results   || []} type="movie"  browseLink="/browse/movie" />
        <MediaRow title="⭐ TOP RATED MOVIES"     items={topMovie.results  || []} type="movie"  browseLink="/browse/movie" />
        <MediaRow title="📺 TOP RATED SERIES"     items={topTV.results     || []} type="tv"     browseLink="/browse/tv"    />
        {(anime.results || []).length > 0 && (
          <MediaRow title="🇯🇵 ANIME"             items={anime.results}           type="tv"     browseLink="/browse/tv"    />
        )}
      </div>
    </div>
  );
}
