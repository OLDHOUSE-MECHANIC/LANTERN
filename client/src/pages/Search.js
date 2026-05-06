import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import MediaCard from '../components/MediaCard';
import './Browse.css';

export default function Search() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    api.search(query)
      .then(d => {
        const filtered = (d.results || []).filter(
          i => (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path
        );
        setResults(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="browse-page">
      <div className="browse-header container">
        <h1 className="browse-title">Search Results</h1>
        {query && <p className="browse-subtitle">Showing results for: <strong>"{query}"</strong></p>}
      </div>
      {loading
        ? <div className="spinner" />
        : results.length === 0
          ? <p className="empty-msg">No results found for "{query}"</p>
          : (
            <div className="browse-grid container">
              {results.map(item => <MediaCard key={item.id} item={item} size="lg" />)}
            </div>
          )
      }
    </div>
  );
}
