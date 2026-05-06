import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PLAYER_MODE,
  resolvePlayerMode,
  whereToWatchLinks,
  saveContinueWatching,
  findTrailer,
  api,
  poster,
  youtubeEmbedUrl,
} from '../utils/api';
import './Player.css';

export default function Player() {
  const { type, id, season, episode } = useParams();
  const isTV = type === 'tv';

  const [mediaInfo, setMediaInfo]   = useState(null);
  const [playerConf, setPlayerConf] = useState(null); // { mode, src }
  const [loading, setLoading]       = useState(true);
  const [uiVisible, setUiVisible]   = useState(true);
  const savedRef = useRef(false);

  // Fetch media info + resolve player mode
  useEffect(() => {
    setLoading(true);
    savedRef.current = false;
    const fetch = isTV ? api.tv(id) : api.movie(id);
    fetch.then(data => {
      setMediaInfo(data);
      const conf = resolvePlayerMode(data, {
        youtubeMovieId: data.youtubeMovieId,
        archiveId: data.archiveId,
      });
      setPlayerConf(conf);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, isTV, season, episode]);

  // Save to Continue Watching
  useEffect(() => {
    if (!loading && mediaInfo && !savedRef.current) {
      savedRef.current = true;
      saveContinueWatching({
        id,
        type: isTV ? 'tv' : 'movie',
        title: mediaInfo.title || mediaInfo.name,
        poster_path: mediaInfo.poster_path,
        season: season ? parseInt(season) : undefined,
        episode: episode ? parseInt(episode) : undefined,
        progress: 5,
      });
    }
  }, [loading, mediaInfo, id, isTV, season, episode]);

  // Hide UI after 4s inactivity (only in full-player modes)
  useEffect(() => {
    if (!playerConf || playerConf.mode === PLAYER_MODE.TRAILER) return;
    let t;
    const show = () => {
      setUiVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setUiVisible(false), 4000);
    };
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    show();
    return () => {
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
      clearTimeout(t);
    };
  }, [playerConf]);

  const title = mediaInfo ? (mediaInfo.title || mediaInfo.name) : '';
  const backUrl = isTV ? `/tv/${id}` : `/movie/${id}`;

  // ── Loading state ────────────────────────────────────────
  if (loading || !playerConf) {
    return (
      <div className="player-page">
        <div className="player-loading">
          {mediaInfo?.poster_path && (
            <img src={poster(mediaInfo.poster_path, 'w342')} alt="" className="loading-poster" />
          )}
          <div className="spinner" style={{ marginTop: 24 }} />
          <p style={{ marginTop: 12 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Full-screen player (YouTube free movie or Archive) ───
  if (playerConf.mode === PLAYER_MODE.YOUTUBE_FREE || playerConf.mode === PLAYER_MODE.ARCHIVE) {
    const sourceLabel = playerConf.mode === PLAYER_MODE.YOUTUBE_FREE
      ? '▶ YouTube — Official Free Movie'
      : '▶ Internet Archive — Public Domain';

    return (
      <div className="player-page">
        <div className={`player-topbar ${uiVisible ? 'visible' : ''}`}>
          <Link to={backUrl} className="player-back">← Back</Link>
          <div className="player-title">
            {title}{isTV ? ` · S${season} E${episode}` : ''}
          </div>
          <div className="player-source-badge">{sourceLabel}</div>
        </div>

        <iframe
          key={playerConf.src}
          src={playerConf.src}
          className="player-iframe"
          allowFullScreen
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
          title={`${title} — LANTERN`}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  // ── Trailer + Where to Watch mode ────────────────────────
  const wtw = whereToWatchLinks(title);
  const trailer = findTrailer(mediaInfo?.videos);

  // For TV: find episode-specific trailer if available, else show series trailer
  const embedSrc = playerConf.src;

  return (
    <div className="player-page trailer-mode">
      {/* Top bar */}
      <div className="player-topbar visible trailer-topbar">
        <Link to={backUrl} className="player-back">← Back</Link>
        <div className="player-title">
          {title}{isTV ? ` · S${season} E${episode}` : ''}
        </div>
      </div>

      <div className="trailer-layout">
        {/* Left: trailer embed */}
        <div className="trailer-embed-wrap">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              className="trailer-iframe"
              allowFullScreen
              allow="fullscreen; autoplay; encrypted-media"
              title={`${title} — Official Trailer`}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="trailer-no-video">
              {mediaInfo?.poster_path && (
                <img src={poster(mediaInfo.poster_path, 'w500')} alt={title} className="trailer-fallback-poster" />
              )}
              <p>No trailer available</p>
            </div>
          )}

          {/* Source context */}
          <div className="trailer-context">
            <span className="trailer-badge">🎬 Official Trailer</span>
            {embedSrc && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer?.key}`}
                target="_blank"
                rel="noreferrer"
                className="trailer-yt-link"
              >
                Watch on YouTube ↗
              </a>
            )}
          </div>
        </div>

        {/* Right: Where to Watch */}
        <div className="wtw-panel">
          <div className="wtw-header">
            <h2 className="wtw-title">Where to Watch</h2>
            <p className="wtw-subtitle">
              Find <strong>{title}</strong> on a platform you subscribe to.
            </p>
          </div>

          <div className="wtw-links">
            {wtw.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="wtw-btn"
                style={{ '--wtw-color': link.color }}
              >
                <span className="wtw-btn-dot" style={{ background: link.color }} />
                {link.label}
                <span className="wtw-arrow">↗</span>
              </a>
            ))}
          </div>

          <p className="wtw-note">
            LANTERN is a discovery platform. Links open the official service — your subscription or free tier applies.
          </p>
        </div>
      </div>
    </div>
  );
}
