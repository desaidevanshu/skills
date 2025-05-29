import React from 'react';
import SkillCard from './SkillCard';
import '../styles/SkillList.css';

const SkillList = ({ skills, onProgress, onDelete }) => (
  <div className="skills-grid">
    {skills.map((skill, i) => (
      <SkillCard key={i} skill={skill} index={i} onProgress={onProgress} onDelete={onDelete} />
    ))}
  </div>
);

export default SkillList;