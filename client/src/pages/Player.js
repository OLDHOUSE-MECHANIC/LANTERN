import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SOURCES, SOURCE_LABELS, saveContinueWatching, api, poster } from '../utils/api';
import './Player.css';

// Language options shown in the UI
const LANG_OPTIONS = [
  { code: '', label: '🌐 Default' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'ta', label: '🇮🇳 Tamil' },
  { code: 'te', label: '🇮🇳 Telugu' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'ja', label: '🇯🇵 Japanese' },
];

export default function Player() {
  const { type, id, season, episode } = useParams();
  const [sourceIdx, setSourceIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [lang, setLang] = useState('');
  const [showLang, setShowLang] = useState(false);
  const [mediaInfo, setMediaInfo] = useState(null);
  const savedRef = useRef(false);

  const isTV = type === 'tv';
  const sources = SOURCES[isTV ? 'tv' : 'movie'];

  const currentUrl = isTV
    ? sources[sourceIdx](id, season, episode, lang)
    : sources[sourceIdx](id, lang);

  // Fetch media info for Continue Watching
  useEffect(() => {
    const fn = isTV ? api.tv(id) : api.movie(id);
    fn.then(d => setMediaInfo(d)).catch(() => {});
  }, [id, isTV]);

  // Save to Continue Watching when player loads
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
        progress: 5, // initial — we can't read iframe progress due to cross-origin
      });
    }
  }, [loading, mediaInfo, id, isTV, season, episode]);

  // Reset saved flag when episode changes
  useEffect(() => {
    savedRef.current = false;
    setLoading(true);
    setIframeError(false);
  }, [id, season, episode, sourceIdx, lang]);

  // Hide UI after 4s inactivity
  useEffect(() => {
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
  }, []);

  const switchSource = (i) => { setSourceIdx(i); setLoading(true); setIframeError(false); savedRef.current = false; };
  const tryNextSource = () => { if (sourceIdx < sources.length - 1) switchSource(sourceIdx + 1); };

  const selectedLangLabel = LANG_OPTIONS.find(l => l.code === lang)?.label || '🌐 Default';

  return (
    <div className="player-page">
      {/* Top bar */}
      <div className={`player-topbar ${uiVisible ? 'visible' : ''}`}>
        <Link to={isTV ? `/tv/${id}` : `/movie/${id}`} className="player-back">← Back</Link>

        <div className="player-title">
          {mediaInfo ? (mediaInfo.title || mediaInfo.name) : ''}
          {isTV ? ` · S${season} E${episode}` : ''}
        </div>

        <div className="player-controls-right">
          {/* Language selector */}
          <div className="lang-selector">
            <button className="lang-btn" onClick={() => setShowLang(v => !v)}>
              🌐 {selectedLangLabel} ▾
            </button>
            {showLang && (
              <div className="lang-dropdown">
                <p className="lang-note">Sets subtitle language on VidSrc ME source. Audio tracks are controlled inside the player itself.</p>
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    className={`lang-option ${lang === opt.code ? 'active' : ''}`}
                    onClick={() => { setLang(opt.code); setShowLang(false); setLoading(true); setIframeError(false); savedRef.current = false; }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Source switcher */}
          <div className="source-switcher">
            <span className="source-label-text">Source:</span>
            {SOURCE_LABELS.map((label, i) => (
              <button key={i} className={`source-btn ${i === sourceIdx ? 'active' : ''}`} onClick={() => switchSource(i)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="player-loading">
          {mediaInfo?.poster_path && (
            <img src={poster(mediaInfo.poster_path, 'w342')} alt="" className="loading-poster" />
          )}
          <div className="spinner" style={{ marginTop: 24 }} />
          <p style={{ marginTop: 12 }}>Loading via <strong>{SOURCE_LABELS[sourceIdx]}</strong>...</p>
          <p className="loading-hint">If it stalls, try another source above.</p>
          {sourceIdx < sources.length - 1 && (
            <button className="btn-try-next" onClick={tryNextSource}>
              Try {SOURCE_LABELS[sourceIdx + 1]} →
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {iframeError && !loading && (
        <div className="player-loading">
          <p style={{ fontSize: 40 }}>😕</p>
          <p style={{ marginBottom: 8 }}>This source didn't load.</p>
          {sourceIdx < sources.length - 1
            ? <button className="btn-primary" style={{ marginTop: 12 }} onClick={tryNextSource}>Try {SOURCE_LABELS[sourceIdx + 1]} →</button>
            : <p className="loading-hint">All sources tried. This title may not be available.</p>
          }
          <Link to={isTV ? `/tv/${id}` : `/movie/${id}`} className="btn-secondary" style={{ marginTop: 12 }}>← Go Back</Link>
        </div>
      )}

      {/* Iframe */}
      {!iframeError && (
        <iframe
          key={`${currentUrl}-${lang}`}
          src={currentUrl}
          className="player-iframe"
          allowFullScreen
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
          title="LANTERN Player"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setIframeError(true); }}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Bottom nav removed — use source switcher in top bar instead */}
    </div>
  );
}
