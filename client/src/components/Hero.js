import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { backdrop } from '../utils/api';
import './Hero.css';

export default function Hero({ items = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % Math.min(items.length, 8)), 7000);
    return () => clearInterval(t);
  }, [items]);

  if (!items.length) return <div className="hero-skeleton" />;

  const item = items[current];
  const isTV = item.media_type === 'tv' || !!item.first_air_date;
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const bg = backdrop(item.backdrop_path);

  // Items surfaced on hero are from freeMovies + trendingIndia — mark watchable ones
  const isFree = !!item.youtubeMovieId || !!item.archiveId;
  const detailUrl = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;
  const playUrl   = isTV ? `/play/tv/${item.id}/1/1` : `/play/movie/${item.id}`;

  return (
    <div className="hero">
      <div className="hero-bg" style={{ backgroundImage: bg ? `url(${bg})` : 'none' }} />
      <div className="hero-gradient" />
      <div className="hero-gradient-bottom" />

      <div className="hero-content fade-up">
        <div className="hero-badge">
          {isFree ? '▶ FREE TO WATCH' : (isTV ? '📺 Series' : '🎬 Movie')} · {year}
        </div>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-overview">
          {item.overview?.slice(0, 200)}{item.overview?.length > 200 ? '...' : ''}
        </p>
        <div className="hero-meta">
          {item.vote_average > 0 && (
            <span className="hero-rating">⭐ {item.vote_average?.toFixed(1)}</span>
          )}
        </div>
        <div className="hero-actions">
          {isFree ? (
            <Link to={playUrl} className="btn-primary">▶ &nbsp; Watch Free</Link>
          ) : (
            <Link to={playUrl} className="btn-primary">▷ &nbsp; Play Trailer</Link>
          )}
          <Link to={detailUrl} className="btn-secondary">ⓘ &nbsp; More Info</Link>
        </div>
      </div>

      <div className="hero-dots">
        {items.slice(0, 8).map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
