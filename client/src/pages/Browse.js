import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import MediaCard from '../components/MediaCard';
import './Browse.css';

export default function Browse() {
  const { type } = useParams(); // movie | tv
  const [items, setItems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    api.genres(type).then(d => setGenres(d.genres || []));
  }, [type, selectedGenre, sortBy]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    const params = { page, sort_by: sortBy };
    if (selectedGenre) params.genre = selectedGenre;
    api.discover(type, params).then(d => {
      const results = d.results || [];
      setItems(prev => page === 1 ? results : [...prev, ...results]);
      setHasMore(page < (d.total_pages || 1));
      setPage(p => p + 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [type, page, selectedGenre, sortBy, loading, hasMore]);

  useEffect(() => { loadMore(); }, [type, selectedGenre, sortBy]); // eslint-disable-line

  return (
    <div className="browse-page">
      <div className="browse-header container">
        <h1 className="browse-title">{type === 'movie' ? '🎬 Movies' : '📺 Series'}</h1>

        <div className="browse-filters">
          <select
            className="filter-select"
            value={selectedGenre}
            onChange={e => { setSelectedGenre(e.target.value); setItems([]); setPage(1); }}
          >
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setItems([]); setPage(1); }}
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Top Rated</option>
            <option value="release_date.desc">Newest</option>
            <option value="revenue.desc">Highest Grossing</option>
          </select>
        </div>
      </div>

      <div className="browse-grid container">
        {items.map(item => (
          <MediaCard key={item.id} item={{ ...item, media_type: type }} size="lg" />
        ))}
      </div>

      {loading && <div className="spinner" />}

      {!loading && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <button className="btn-secondary" onClick={loadMore}>Load More</button>
        </div>
      )}
    </div>
  );
}
