import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import SkillForm from './components/SkillForm';
import SkillList from './components/SkillList';
import FilterSearch from './components/FilterSearch';
import logo from "/logo.png"; 
import './index.css';

const App = () => {
  const { user, login, logout } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const hasLoaded = useRef(false);

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

  useEffect(() => {
    if (!user) return;
    if (!hasLoaded.current) return;
    const saveSkills = async () => {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, { skills }, { merge: true });
    };
    saveSkills();
  }, [skills, user, db]);

  const handleAddSkill = (skill) => {
    const exists = skills.some(
      s => s.name.trim().toLowerCase() === skill.name.trim().toLowerCase()
    );
    if (exists) {
      alert('Skill name must be unique!');
      return;
    }
    const newSkill = {
      ...skill,
      progress: skill.progress || 0,
      testTaken: false
    };
    setSkills([...skills, newSkill]);
  };

  const handleDeleteSkill = (index) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
  };

  const handleProgressChange = (index, value) => {
    setSkills(prevSkills => {
      const updated = [...prevSkills];
      updated[index].progress = value;
      if (value >= 100 && updated[index].testTaken === undefined) {
        updated[index].testTaken = false;
      }
      return updated;
    });
  };

  const handleTestTaken = (skillName) => {
    const updated = skills.map(skill =>
      skill.name === skillName ? { ...skill, testTaken: true } : skill
    );
    setSkills(updated);
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleResourceProgress = useCallback(
    (value) => handleProgressChange(0, value),
    []
  );

  if (!user) {
    return (
      <div className="app-container1">
        <h1 className="app-title">Skillitron - Personalized Learning Tracker</h1>
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

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-title">Skillitron</span>
          <img src={logo} alt="Logo" className="navbar-logo" />
        </div>
        <div className="navbar-right">
         
          
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-welcome">
          {user ? `Welcome, ${user.displayName || user.email}!` : 'Welcome!'}
        </h1>
        <p className="hero-subtitle">Skillitron - Personalized Learning Tracker</p>
      </section>

      {/* Main Content */}
      <div className="main-content">
        <SkillForm onAdd={handleAddSkill} />
        <FilterSearch setSearchTerm={setSearchTerm} />
        <SkillList
          skills={filteredSkills}
          onDelete={handleDeleteSkill}
          onProgress={handleProgressChange}
        />
      </div>
    </div>
  );
};

export default App;