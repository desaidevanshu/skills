import React from 'react';
import SkillCard from './SkillCard';

const SkillList = ({ skills, onProgress, onDelete }) => (
  <div>
    {skills.map((skill, i) => (
      <SkillCard key={i} skill={skill} index={i} onProgress={onProgress} onDelete={onDelete} />
    ))}
  </div>
);

export default SkillList;
