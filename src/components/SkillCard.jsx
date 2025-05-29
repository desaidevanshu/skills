import React, { useState, useCallback } from 'react';
import Resources from './Resources';
import '../styles/SkillCard.css';

const SkillCard = ({ skill, index, onProgress, onDelete }) => {
  const [watched, setWatched] = useState([]);

  // Callback when a resource is watched
  const handleResourceWatched = useCallback(
    (videoId) => {
      if (!watched.includes(videoId)) {
        const newWatched = [...watched, videoId];
        setWatched(newWatched);
        // Automatically update progress
        if (skill.resourcesCount && skill.resourcesCount > 0) {
          const progress = Math.round((newWatched.length / skill.resourcesCount) * 100);
          onProgress(index, progress);
        }
      }
    },
    [watched, onProgress, index, skill.resourcesCount]
  );

  return (
    <div className="skill-card">
      <div className="skill-card-header">
        <div>
          <h2 className="skill-card-title">{skill.name}</h2>
          <p className="skill-card-category">{skill.category}</p>
          <p className="skill-card-date">Target: {skill.targetDate}</p>
        </div>
        <button onClick={() => onDelete(index)} className="skill-card-delete">X</button>
      </div>
      {/* ProgressBar removed */}
      <div className="skill-card-progress">
      
        {skill.progress === 100 && (
          <span className="skill-completed-badge" style={{ color: 'green', fontWeight: 'bold' }}>
            Skill Completed!
          </span>
        )}
      </div>
      <Resources query={skill.name} onResourceWatched={handleResourceWatched} />
    </div>
  );
};

export default SkillCard;