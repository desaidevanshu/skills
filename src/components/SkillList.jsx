import React from 'react';
import SkillCard from './SkillCard';
import '../index.css'; // Assuming you have a CSS file for styles

const SkillList = ({ skills, onProgress, onDelete }) => (
  <div className="skills-grid">
    {skills.map((skill, i) => (
      <SkillCard key={i} skill={skill} index={i} onProgress={onProgress} onDelete={onDelete} />
    ))}
  </div>
);

export default SkillList;