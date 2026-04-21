import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContinueWatching, removeContinueWatching, poster } from '../utils/api';
import './ContinueWatching.css';

export default function ContinueWatching({ onUpdate }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getContinueWatching());
  }, [onUpdate]);

  if (items.length === 0) return null;

  const remove = (e, id, season, episode) => {
    e.preventDefault();
    e.stopPropagation();
    removeContinueWatching(id, season, episode);
    setItems(getContinueWatching());
  };

  const playUrl = (item) => {
    if (item.type === 'tv') return `/play/tv/${item.id}/${item.season}/${item.episode}`;
    return `/play/movie/${item.id}`;
  };

  const label = (item) => {
    if (item.type === 'tv') return `S${item.season} E${item.episode}`;
    return 'Movie';
  };

  return (
    <section className="cw-section">
      <div className="cw-header">
        <h2 className="row-title">▶ CONTINUE WATCHING</h2>
      </div>
      <div className="row-scroll cw-row">
        {items.map(item => (
          <Link to={playUrl(item)} key={`${item.id}-${item.season}-${item.episode}`} className="cw-card">
            <div className="cw-thumb">
              {item.poster_path
                ? <img src={poster(item.poster_path, 'w342')} alt={item.title} />
                : <div className="cw-no-img"><span>{item.title?.[0]}</span></div>
              }
              <div className="cw-overlay">
                <div className="cw-play">▶</div>
              </div>
              {/* Progress bar */}
              {item.progress > 0 && (
                <div className="cw-progress-bar">
                  <div className="cw-progress-fill" style={{ width: `${Math.min(item.progress, 100)}%` }} />
                </div>
              )}
              <button className="cw-remove" onClick={(e) => remove(e, item.id, item.season, item.episode)} title="Remove">✕</button>
              <span className="cw-episode-badge">{label(item)}</span>
            </div>
            <p className="cw-title">{item.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
