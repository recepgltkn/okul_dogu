import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config should be provided via environment variables.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
};

let app;
try{
  app = initializeApp(firebaseConfig);
}catch(e){ console.warn('Firebase init error', e); }

const db = (() => { try{ return getFirestore(app); }catch(e){ return null; } })();
const auth = (() => { try{ return getAuth(app); }catch(e){ return null; } })();

export async function saveGameState(userId, payload){
  if(!db || !userId) return;
  try{
    const ref = doc(db, 'gameStates', String(userId));
    await setDoc(ref, { updatedAt: new Date(), payload }, { merge: true });
  }catch(e){ console.warn('saveGameState error', e); }
}

export async function loadGameState(userId){
  if(!db || !userId) return null;
  try{
    const ref = doc(db, 'gameStates', String(userId));
    const snap = await getDoc(ref);
    if(snap && snap.exists()){
      const data = snap.data();
      return data.payload || null;
    }
  }catch(e){ console.warn('loadGameState error', e); }
  return null;
}

export async function saveStudentReport(userId, report){
  if(!db || !userId) return;
  try{
    const ref = doc(db, 'studentReports', String(userId));
    await setDoc(ref, { updatedAt: new Date(), ...report }, { merge: true });
  }catch(e){ console.warn('saveStudentReport error', e); }
}

export function getAuthInstance(){ return auth; }

export default { saveGameState, loadGameState, saveStudentReport, getAuthInstance };
