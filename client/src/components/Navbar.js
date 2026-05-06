import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-text">L.A.N.T.E.R.N.</span>
          <span className="nav-logo-sub">Local Area Network Television, Every Room Now</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/browse/movie" className={location.pathname.includes('movie') ? 'active' : ''}>Movies</Link>
          <Link to="/browse/tv" className={location.pathname.includes('/browse/tv') ? 'active' : ''}>Series</Link>
        </div>
      </div>
      <div className="nav-right">
        {searchOpen ? (
          <form className="search-form" onSubmit={handleSearch}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles..."
              className="search-input"
            />
            <button type="button" className="nav-icon-btn" onClick={() => setSearchOpen(false)}>✕</button>
          </form>
        ) : (
          <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}
