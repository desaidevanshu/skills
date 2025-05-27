import React, { useEffect, useState } from 'react';
import { fetchYouTubeVideos } from '../utils/api';
import '../styles/Resources.css';

const Resources = ({ query }) => {
  const [videos, setVideos] = useState([]);
  const [maxResults, setMaxResults] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (!query) return;
    fetchYouTubeVideos(query, maxResults)
      .then(setVideos)
      .catch(e => {
        if (
          e.message &&
          e.message.toLowerCase().includes('quota')
        ) {
          setError('YouTube search limit reached. Please try again tomorrow.');
        } else {
          setError('Failed to fetch YouTube videos.');
        }
      });
  }, [query, maxResults]);

  return (
    <div className="resources">
      <h3 className="resources-title">YouTube Resources</h3>
      {error && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          {error}
        </div>
      )}
      {!error && videos.map(video => (
        <a
          key={video.id}
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="resources-link"
        >
          <img
            src={video.thumbnail}
            className="resources-thumbnail"
            alt={video.title}
          />
          <span className="resources-text">
            {video.title}
            <br />
            <span style={{ fontSize: '0.8em', color: '#888' }}>
              {video.views.toLocaleString()} views
            </span>
          </span>
        </a>
      ))}
      {!error && videos.length === maxResults && maxResults < 20 && (
        <button
          className="see-more-btn"
          onClick={() => setMaxResults(maxResults + 5)}
        >
          See More
        </button>
      )}
    </div>
  );
};

export default Resources;