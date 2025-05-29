import React, { useEffect, useState, useRef } from 'react';
import { fetchYouTubeVideos, fetchCourseraCourses } from '../utils/api';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import '../index.css';

function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return +(hours + minutes / 60 + seconds / 3600).toFixed(2);
}

let isYouTubeAPILoaded = false;
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (isYouTubeAPILoaded) return resolve();
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = () => {
      isYouTubeAPILoaded = true;
      resolve();
    };
  });
};

const YouTubePlayer = ({ videoId, expanded, onExpand, onClose, onWatched }) => {
  const playerRef = useRef(null);
  const containerId = `player-${videoId}`;

  useEffect(() => {
    if (!expanded) return;
    loadYouTubeAPI().then(() => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onWatched(videoId);
            }
          },
        },
      });
    });
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [expanded, videoId, onWatched]);

  return expanded ? (
    <div className='popup-content'>
      <div className="popup-video-wrapper">
      <div id={containerId}></div>
      </div>
      <button className="see-more-btn" style={{ marginTop: 8 }} onClick={onClose}>
        Close
      </button>
    
    </div>
  ) : (
    <img
      src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
      alt="thumbnail"
      style={{ width: 320, height: 180, cursor: 'pointer', borderRadius: 8 }}
      onClick={onExpand}
    />
  );
};

const Resources = ({ query, targetDate, onProgressUpdate }) => {
  const [videos, setVideos] = useState([]);
  const [watched, setWatched] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [channelFilter, setChannelFilter] = useState('');
  const [sortByViews, setSortByViews] = useState(false);
  const [onlyTutorials, setOnlyTutorials] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);



  useEffect(() => {
  if (!query) return;
  // Fetch both the main query and CodeWithHarry channel videos
  Promise.all([
    fetchYouTubeVideos(query, 50),
    fetchYouTubeVideos('CodeWithHarry'+ query, 50)
  ]).then(([rawVideos, harryVideos]) => {
    // Merge and remove duplicates by video id
    const allVideos = [...rawVideos, ...harryVideos];
    const uniqueVideos = [];
    const seenIds = new Set();
    for (const v of allVideos) {
      if (!seenIds.has(v.id)) {
        uniqueVideos.push({
          ...v,
          durationHours: v.durationHours !== undefined
            ? v.durationHours
            : v.duration
              ? parseISO8601Duration(v.duration)
              : 0
        });
        seenIds.add(v.id);
      }
    }
    setVideos(uniqueVideos);
  });

  fetchCourseraCourses(query).then(setCourses);
  setExpandedVideo(null);
  setWatched([]);
  setVisibleCount(3);
}, [query]);

  useEffect(() => {
    const fetchWatchedProgress = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'progress'));
        const watchedIds = snapshot.docs.map(doc => doc.id);
        setWatched(watchedIds);
      } catch (error) {
        console.error('❌ Error fetching watched progress:', error);
      }
    };
    fetchWatchedProgress();
  }, [query]);

  const markVideoAsWatched = async (videoId) => {
    const user = auth.currentUser;
    if (!user || watched.includes(videoId)) return;
    const updatedWatched = [...watched, videoId];
    setWatched(updatedWatched);
    try {
      await setDoc(doc(db, 'users', user.uid, 'progress', videoId), {
        watched: true,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('❌ Error saving watched progress:', error);
    }
  };

  let displayedVideos = [...videos];

  if (sortByViews) {
    displayedVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  const tutorialKeywords = ['tutorial', 'course', 'how to', 'full', 'complete', 'bootcamp', 'crash'];
  if (onlyTutorials) {
    displayedVideos = displayedVideos.filter(video =>
      tutorialKeywords.some(keyword =>
        video.title.toLowerCase().includes(keyword)
      )
    );
  }

  const filteredVideos = displayedVideos.filter(video =>
    video.channelTitle.toLowerCase().includes(channelFilter.toLowerCase())
  );

  const watchedVideos = videos.filter(v => watched.includes(v.id));
  const watchedHours = watchedVideos.reduce((sum, v) => sum + (v.durationHours || 0), 0);
  const minVideos = 3;
  const minHours = 6;
  const progress = Math.min(
    100,
    Math.round(Math.min(watched.length / minVideos, watchedHours / minHours) * 100)
  );

  

  const daysLeft = targetDate
    ? Math.max(1, Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 1;
  const dailyHours = Math.ceil(minHours / daysLeft);

  useEffect(() => {
    if (progress === 100 && onProgressUpdate) {
      onProgressUpdate(100);
    }
  }, [progress, onProgressUpdate]);

    useEffect(() => {
    if (progress === 100 && onProgressUpdate) {
      onProgressUpdate(100);
      setShowCompletionPopup(true);
    }
  }, [progress, onProgressUpdate]);


  return (
    <div className="resources">
      {progress === 100 && (
        <div style={{ width: '100%', margin: '16px 0' }}>
          <div style={{
            background: '#e0e0e0',
            borderRadius: 8,
            height: 16,
            width: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #4caf50 60%, #81c784 100%)',
              transition: 'width 0.5s'
            }} />
          </div>
          <div style={{ textAlign: 'center', color: 'green', fontWeight: 'bold', marginTop: 4 }}>
            Skill Completed! 100%
          </div>
        </div>
      )}

       {showCompletionPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem 3rem',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#4caf50', marginBottom: 16 }}>🎉 Congratulations!</h2>
            <p style={{ fontSize: 18, marginBottom: 24 }}>You have completed this skill!</p>
            <button
              className="see-more-btn"
              onClick={() => setShowCompletionPopup(false)}
              style={{ fontSize: 16, padding: '8px 24px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}


      <h3 className="resources-title">YouTube Resources</h3>

      <div className="resources-controls">
        <input
          type="text"
          placeholder="Search by channel name..."
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="resources-search-bar"
        />
        <div className="resources-filters">
        <button
          onClick={() => setSortByViews(prev => !prev)}
          className="see-more-btn"
        >
          {sortByViews ? 'Default Order' : 'Sort by Views'}
        </button>
        <button
          onClick={() => setOnlyTutorials(prev => !prev)}
          className="see-more-btn"
        >
          {onlyTutorials ? 'Show All Types' : 'Only Tutorials'}
        </button>
      </div>
      </div>

      <div className="resources-grid">
        {filteredVideos.slice(0, visibleCount).map(video => (
          <div key={video.id} className="resources-card">
            <YouTubePlayer
              videoId={video.id}
              expanded={expandedVideo === video.id}
              onExpand={() => setExpandedVideo(video.id)}
              onClose={() => setExpandedVideo(null)}
              onWatched={markVideoAsWatched}
            />
            <div className="resources-card-content">
              {watched.includes(video.id) ? (
                <>
                  <input type="checkbox" checked disabled /> <span style={{ color: 'green', fontWeight: 'bold' }}>Watched</span>
                </>
              ) : (
                <input type="checkbox" disabled />
              )}
              <div className="resources-card-title">{video.title}</div>
              <div className="resources-card-views">
                {video.views?.toLocaleString()} views
              </div>
              <div className="resources-card-channel">
                Channel: {video.channelTitle}
              </div>
              <div className="resources-card-duration">
                Duration: {video.durationHours ?? '?'} hrs
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {visibleCount < filteredVideos.length && (
        <button className="see-more-btn" onClick={() => setVisibleCount(prev => prev + 2)}>
          Show 2 More
        </button>
        )}
        <button className="see-more-btn" onClick={() => setVisibleCount(2)}>
          Close
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Progress:</strong> {progress}%<br />
        
      </div>

      <h3 className="resources-title" style={{ marginTop: '2rem' }}>Coursera Courses:</h3>
      <div className="resources-courses-list">
        {courses.map(course => (
          <a
            key={course.id}
            href={course.link}
            target="_blank"
            rel="noopener noreferrer"
            className="resources-course-link"
          >
            {course.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Resources;
