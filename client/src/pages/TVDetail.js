import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, poster, backdrop } from '../utils/api';
import MediaRow from '../components/MediaRow';
import './DetailPage.css';

export default function TVDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEps, setLoadingEps] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setData(null);
    setError(null);
    api.tv(id)
      .then(d => { setData(d); setSelectedSeason(1); })
      .catch(e => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!data) return;
    setLoadingEps(true);
    api.season(id, selectedSeason)
      .then(s => { setEpisodes(s.episodes || []); setLoadingEps(false); })
      .catch(() => setLoadingEps(false));
  }, [id, data, selectedSeason]);

  if (error) return (
    <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>
      <p>Failed to load. {error}</p>
    </div>
  );
  if (!data) return <div style={{ paddingTop: 'var(--nav-height)' }}><div className="spinner" /></div>;

  const playId = data.id; // TMDB ID used directly
  const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = data.credits?.cast?.slice(0, 12) || [];
  const bg = backdrop(data.backdrop_path);
  const seasons = (data.seasons || []).filter(s => s.season_number > 0);

  return (
    <div className="detail-page">
      {bg && <div className="detail-backdrop" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="detail-backdrop-overlay" />

      <div className="detail-main container">
        <div className="detail-poster-wrap">
          <img src={poster(data.poster_path, 'w500')} alt={data.name} className="detail-poster" />
        </div>

        <div className="detail-info fade-up">
          <div className="detail-badges">
            <span className="badge-type">Series</span>
            {data.first_air_date && <span className="badge-year">{data.first_air_date.slice(0,4)}</span>}
            {data.number_of_seasons && <span className="badge-year">{data.number_of_seasons} Season{data.number_of_seasons > 1 ? 's' : ''}</span>}
            {data.status && <span className="badge-year">{data.status}</span>}
          </div>

          <h1 className="detail-title">{data.name}</h1>
          {data.tagline && <p className="detail-tagline">"{data.tagline}"</p>}

          <div className="detail-meta">
            {data.vote_average > 0 && <span className="meta-rating">⭐ {data.vote_average.toFixed(1)}</span>}
            {data.genres?.map(g => <span key={g.id} className="meta-genre">{g.name}</span>)}
          </div>

          <p className="detail-overview">{data.overview}</p>

          <div className="detail-actions">
            {/* Play S1E1 directly */}
            <Link to={`/play/tv/${playId}/1/1`} className="btn-primary">
              ▶ &nbsp; Play S1 E1
            </Link>
            {trailer && (
              <a href={`https://youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" className="btn-secondary">
                ▷ &nbsp; Trailer
              </a>
            )}
          </div>

          {/* Season tabs */}
          {seasons.length > 0 && (
            <div className="season-selector">
              <h3 className="section-label">SEASON</h3>
              <div className="season-tabs">
                {seasons.map(s => (
                  <button
                    key={s.season_number}
                    className={`season-tab ${selectedSeason === s.season_number ? 'active' : ''}`}
                    onClick={() => setSelectedSeason(s.season_number)}
                  >
                    S{s.season_number}
                    {s.episode_count && <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>{s.episode_count}ep</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          <div className="episodes-section">
            <h3 className="section-label">EPISODES — Season {selectedSeason}</h3>
            {loadingEps ? (
              <div className="spinner" style={{ margin: '20px 0', width: 28, height: 28 }} />
            ) : episodes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No episodes found.</p>
            ) : (
              <div className="episodes-list">
                {episodes.map(ep => (
                  <Link
                    key={ep.episode_number}
                    to={`/play/tv/${playId}/${selectedSeason}/${ep.episode_number}`}
                    className="episode-item"
                  >
                    <div className="ep-thumb">
                      {ep.still_path
                        ? <img src={poster(ep.still_path, 'w300')} alt="" />
                        : <span className="ep-num">E{ep.episode_number}</span>
                      }
                      <div className="ep-play-icon">▶</div>
                    </div>
                    <div className="ep-info">
                      <span className="ep-label">E{ep.episode_number}</span>
                      <p className="ep-name">{ep.name}</p>
                      {ep.runtime && <span className="ep-time">{ep.runtime}m</span>}
                      {ep.vote_average > 0 && <span className="ep-time">⭐ {ep.vote_average.toFixed(1)}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cast */}
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

      {(data.similar?.results?.length > 0) && (
        <div className="detail-similar">
          <MediaRow title="MORE LIKE THIS" items={data.similar.results} type="tv" />
        </div>
      )}
    </div>
  );
}
