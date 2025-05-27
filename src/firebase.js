import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc ,updateDoc} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBUuiKD7SVPKWk2EA5Q0258iQVYpijBMA8',
  authDomain: 'skillsync-b5ee1.firebaseapp.com',
  projectId: 'skillsync-b5ee1',
  storageBucket: 'skillsync-b5ee1.firebasestorage.app',
  messagingSenderId: '942619465506',
  appId: '1:942619465506:web:85ce412330846bdfe7777b',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
export {  signInWithPopup, signOut, doc, getDoc, setDoc, updateDoc };
