import React from 'react';
import ProgressBar from './ProgressBar';
import Resources from './Resources';
import '../styles/SkillCard.css'; 

const SkillCard = ({ skill, index, onProgress, onDelete }) => {
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
      <div className="skill-card-progress">
        <input
          type="range"
          min="0"
          max="100"
          value={skill.progress}
          onChange={(e) => onProgress(index, parseInt(e.target.value))}
        />
        <ProgressBar value={skill.progress} />
        <p className="skill-card-progress-label">Progress: {skill.progress}%</p>
      </div>
      <Resources query={skill.name} />
    </div>
  );
};

export default SkillCard;