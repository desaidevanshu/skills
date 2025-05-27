import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import SkillForm from './components/SkillForm';
import SkillList from './components/SkillList';
import FilterSearch from './components/FilterSearch';
import './index.css';

const App = () => {
  const { user, login, logout } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const hasLoaded = useRef(false);

  // Load skills from Firestore when user logs in
  useEffect(() => {
    if (!user) {
      setSkills([]);
      setLoading(false);
      hasLoaded.current = false;
      return;
    }
    setLoading(true);
    const fetchSkills = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSkills(snap.data().skills || []);
      } else {
        setSkills([]);
      }
      setLoading(false);
      hasLoaded.current = true;
    };
    fetchSkills();
  }, [user, db]);

  // Save skills to Firestore whenever they change, but only after initial load
  useEffect(() => {
    if (!user) return;
    if (!hasLoaded.current) return;
    const saveSkills = async () => {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, { skills }, { merge: true });
    };
    saveSkills();
  }, [skills, user, db]);

  // Add a new skill
  const handleAddSkill = (skill) => {
    const exists = skills.some(
    s => s.name.trim().toLowerCase() === skill.name.trim().toLowerCase()
  );
  if (exists) {
    alert('Skill name must be unique!');
    return;
  }
    setSkills([...skills, skill]);
  };

  // Delete a skill
  const handleDeleteSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
  };

  // Update progress
  const handleProgressChange = (index, value) => {
    const updated = [...skills];
    updated[index].progress = value;
    setSkills(updated);
  };

  // Filtered skills for search
  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Not logged in
  if (!user) {
    return (
      <div className="app-container">
        <h1 className="app-title">SkillSync - Personalized Learning Tracker</h1>
        <button onClick={login} className="google-btn">Sign in with Google</button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="app-container">
        <h1 className="app-title">Loading your skills...</h1>
      </div>
    );
  }

  // Logged in
  return (
    <div className="app-container">
      <div className="user-bar">
        <p className="welcome-text">Welcome, {user.displayName}</p>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
      <h1 className="app-title">SkillSync - Personalized Learning Tracker</h1>
      <SkillForm onAdd={handleAddSkill} />
      <FilterSearch setSearchTerm={setSearchTerm} />
      <SkillList
        skills={filteredSkills}
        onDelete={handleDeleteSkill}
        onProgress={handleProgressChange}
      />
    </div>
  );
};

export default App;