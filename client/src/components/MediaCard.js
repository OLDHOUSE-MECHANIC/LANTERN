import React from 'react';
import { Link } from 'react-router-dom';
import { poster } from '../utils/api';
import './MediaCard.css';

export default function MediaCard({ item, size = 'md' }) {
  if (!item) return null;
  const isTV = item.media_type === 'tv' || item.first_air_date;
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const href = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;
  const rating = item.vote_average?.toFixed(1);

  return (
    <Link to={href} className={`media-card size-${size}`}>
      <div className="card-poster">
        {item.poster_path
          ? <img src={poster(item.poster_path)} alt={title} loading="lazy" />
          : <div className="card-no-poster"><span>{title}</span></div>
        }
        <div className="card-overlay">
          <div className="card-play">▶</div>
        </div>
        {rating && <div className="card-rating">⭐ {rating}</div>}
        <div className="card-type">{isTV ? 'Series' : 'Movie'}</div>
      </div>
      <div className="card-info">
        <p className="card-title">{title}</p>
        {year && <span className="card-year">{year}</span>}
      </div>
    </Link>
  );
}
