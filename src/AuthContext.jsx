import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔐 Your Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyBUuiKD7SVPKWk2EA5Q0258iQVYpijBMA8',
  authDomain: 'skillsync-b5ee1.firebaseapp.com',
  projectId: 'skillsync-b5ee1',
  storageBucket: 'skillsync-b5ee1.firebasestorage.app',
  messagingSenderId: '942619465506',
  appId: '1:942619465506:web:85ce412330846bdfe7777b',
};

// 🔌 Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// 📦 Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, auth, db }}>
      {children}
    </AuthContext.Provider>
  );
};

export { auth, db };