import React, { useState } from 'react';
import '../index.css'; // Assuming you have a CSS file for styles

const SkillForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAdd({ name, category, targetDate, progress: 0 });
    setName('');
    setCategory('');
    setTargetDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="skill-form">
      <input
        className="input"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Skill name"
        required
      />
      <input
        className="input"
        type="text"
        value={category}
        onChange={e => setCategory(e.target.value)}
        placeholder="Category"
      />
      <input
        className="input"
        type="date"
        value={targetDate}
        onChange={e => setTargetDate(e.target.value)}
      />
      <button className="add-skill-btn" type="submit">Add Skill</button>
    </form>
  );
};

export default SkillForm;