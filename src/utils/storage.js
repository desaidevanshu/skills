// storage.js
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

/**
 * Save a single skill to Firestore under the logged-in user's UID.
 * Also saves to localStorage for caching.
 * @param {Object} skill - The skill object (e.g., { name, category, date }).
 */
export const saveSkillToFirestore = async (skill) => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("⚠️ No authenticated user. Skill not saved.");
    return;
  }

  const userId = user.uid;

  try {
    const docRef = await addDoc(collection(db, 'skills'), {
      ...skill,
      userId,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Skill saved to Firestore with ID:", docRef.id);

    // Optionally update local cache
    const currentSkills = getSkillsFromLocal();
    currentSkills.push({ ...skill, id: docRef.id });
    saveSkillsToLocal(currentSkills);

  } catch (error) {
    console.error("❌ Error saving skill to Firestore:", error);
  }
};

/**
 * Fetch all skills for the logged-in user from Firestore.
 * Falls back to localStorage if no user is logged in or error occurs.
 * @returns {Promise<Array>} Array of skill objects.
 */
export const getSkillsFromFirestore = async () => {
  const user = auth.currentUser;

  if (!user) {
    console.warn("⚠️ No authenticated user. Falling back to localStorage.");
    return getSkillsFromLocal();
  }

  const userId = user.uid;

  try {
    const q = query(collection(db, 'skills'), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    const skills = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Update local cache
    saveSkillsToLocal(skills);

    return skills;
  } catch (error) {
    console.error("❌ Error fetching skills from Firestore:", error);
    return getSkillsFromLocal(); // fallback
  }
};

/**
 * Save skills to localStorage (as a backup or offline mode).
 * @param {Array} skills - Array of skill objects.
 */
export const saveSkillsToLocal = (skills) => {
  try {
    localStorage.setItem('skills', JSON.stringify(skills));
  } catch (error) {
    console.error("❌ Failed to save to localStorage:", error);
  }
};

/**
 * Get skills from localStorage.
 * @returns {Array} Array of skill objects (or empty array).
 */
export const getSkillsFromLocal = () => {
  try {
    const data = localStorage.getItem('skills');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Failed to read from localStorage:", error);
    return [];
  }
};

const markVideoAsWatched = async (videoId) => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('⚠️ No authenticated user. Skipping progress save.');
    return;
  }

  const userId = user.uid;

  if (!watched.includes(videoId)) {
    const updatedWatched = [...watched, videoId];
    setWatched(updatedWatched);

    try {
      await setDoc(doc(db, 'users', userId, 'progress', videoId), {
        watched: true,
        timestamp: new Date(),
      });
      console.log(`✅ Watched progress saved for video: ${videoId}`);
    } catch (error) {
      console.error('❌ Error saving watched progress:', error);
    }
  }
};

