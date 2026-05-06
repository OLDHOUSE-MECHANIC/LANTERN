import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, poster, backdrop, whereToWatchLinks, PLAYER_MODE, resolvePlayerMode } from '../utils/api';
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

  const playerConf = resolvePlayerMode(data, {
    youtubeMovieId: data.youtubeMovieId,
    archiveId: data.archiveId,
  });
  const isWatchable = playerConf.mode !== PLAYER_MODE.TRAILER;
  const wtw = whereToWatchLinks(data.title);
  const cast = data.credits?.cast?.slice(0, 12) || [];
  const bg = backdrop(data.backdrop_path);

  return (
    <div className="detail-page">
      {bg && <div className="detail-backdrop" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="detail-backdrop-overlay" />

      <div className="detail-main container">
        <div className="detail-poster-wrap">
          <img src={poster(data.poster_path, 'w500')} alt={data.title} className="detail-poster" />
          {isWatchable && (
            <div className="watchable-badge">
              ✓ Free to Watch on LANTERN
            </div>
          )}
        </div>

        <div className="detail-info fade-up">
          <div className="detail-badges">
            <span className="badge-type">Movie</span>
            {data.release_date && <span className="badge-year">{data.release_date.slice(0,4)}</span>}
            {data.runtime && <span className="badge-year">{Math.floor(data.runtime/60)}h {data.runtime%60}m</span>}
            {isWatchable && <span className="badge-free">▶ FREE</span>}
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
            {isWatchable ? (
              <Link to={`/play/movie/${data.id}`} className="btn-primary">
                ▶ &nbsp; Watch Free
              </Link>
            ) : (
              <Link to={`/play/movie/${data.id}`} className="btn-primary">
                ▷ &nbsp; Play Trailer
              </Link>
            )}
          </div>

          {/* Where to Watch — always shown */}
          <div className="detail-wtw">
            <h3 className="section-label">WHERE TO WATCH</h3>
            <div className="detail-wtw-links">
              {wtw.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="detail-wtw-btn"
                  style={{ '--wtw-color': link.color }}
                >
                  <span className="wtw-btn-dot" style={{ background: link.color }} />
                  {link.label}
                  <span className="wtw-arrow">↗</span>
                </a>
              ))}
            </div>
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
