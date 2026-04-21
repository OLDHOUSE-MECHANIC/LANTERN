import React from 'react';
import { Link } from 'react-router-dom';
import MediaCard from './MediaCard';
import './MediaRow.css';

export default function MediaRow({ title, items = [], type, browseLink }) {
  if (!items.length) return null;
  const normalised = items.map(i => ({
    ...i,
    media_type: i.media_type || type,
  }));

  return (
    <section className="media-row fade-up">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        {browseLink && <Link to={browseLink} className="row-more">See all →</Link>}
      </div>
      <div className="row-scroll">
        {normalised.map(item => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
