import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, poster, backdrop } from '../utils/api';
import MediaRow from '../components/MediaRow';
import './DetailPage.css';

export default function MovieDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.movie(id).then(setData).catch(console.error);
  }, [id]);

  if (!data) return <div style={{ paddingTop: 'var(--nav-height)' }}><div className="spinner" /></div>;

  // Use TMDB ID directly for playback — no IMDB dependency needed
  const playId = data.id;
  const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = data.credits?.cast?.slice(0, 12) || [];
  const bg = backdrop(data.backdrop_path);

  return (
    <div className="detail-page">
      {bg && <div className="detail-backdrop" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="detail-backdrop-overlay" />

      <div className="detail-main container">
        <div className="detail-poster-wrap">
          <img
            src={poster(data.poster_path, 'w500')}
            alt={data.title}
            className="detail-poster"
          />
        </div>

        <div className="detail-info fade-up">
          <div className="detail-badges">
            <span className="badge-type">Movie</span>
            {data.release_date && <span className="badge-year">{data.release_date.slice(0,4)}</span>}
            {data.runtime && <span className="badge-year">{Math.floor(data.runtime/60)}h {data.runtime%60}m</span>}
          </div>

          <h1 className="detail-title">{data.title}</h1>
          {data.tagline && <p className="detail-tagline">"{data.tagline}"</p>}

          <div className="detail-meta">
            {data.vote_average > 0 && (
              <span className="meta-rating">⭐ {data.vote_average.toFixed(1)}</span>
            )}
            {data.genres?.map(g => (
              <span key={g.id} className="meta-genre">{g.name}</span>
            ))}
          </div>

          <p className="detail-overview">{data.overview}</p>

          <div className="detail-actions">
            <Link to={`/play/movie/${playId}`} className="btn-primary">
              ▶ &nbsp; Play Movie
            </Link>
            {trailer && (
              <a
                href={`https://youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                ▷ &nbsp; Trailer
              </a>
            )}
          </div>

          {cast.length > 0 && (
            <div className="detail-cast">
              <h3 className="section-label">CAST</h3>
              <div className="cast-list">
                {cast.map(c => (
                  <div key={c.id} className="cast-item">
                    <div className="cast-avatar">
                      {c.profile_path
                        ? <img src={poster(c.profile_path, 'w185')} alt={c.name} />
                        : <span>{c.name[0]}</span>
                      }
                    </div>
                    <span className="cast-name">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data.similar?.results?.length > 0 && (
        <div className="detail-similar">
          <MediaRow title="MORE LIKE THIS" items={data.similar.results} type="movie" />
        </div>
      )}
    </div>
  );
}
