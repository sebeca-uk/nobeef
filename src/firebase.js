import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { SEED_EVENTS } from './data/seedData';

let db = null;
let auth = null;
let googleProvider = null;

// Safe Firebase initialization
try {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (apiKey && apiKey !== "AIzaSyDummyKeyForLocalDevelopment") {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  }
} catch (e) {
  console.warn("Firebase initialization skipped (running in local storage mode):", e);
}

export { db, auth, googleProvider };

// Helper to get active league namespace prefix
const getLeaguePrefix = () => {
  // If we are in /nobeef/l/:leagueSlug or /nobeef/g/:gymSlug/:compSlug, parse from URL
  const pathParts = window.location.pathname.split('/');
  
  const lIndex = pathParts.indexOf('l');
  if (lIndex !== -1 && pathParts.length > lIndex + 1) {
    return pathParts[lIndex + 1];
  }

  // Legacy fallback
  const gIndex = pathParts.indexOf('g');
  if (gIndex !== -1 && pathParts.length > gIndex + 2) {
    return `${pathParts[gIndex + 1]}_${pathParts[gIndex + 2]}`;
  }
  
  return 'nobeef_crossfit-games-2026';
};

const getKeys = () => {
  const prefix = getLeaguePrefix();
  return {
    EVENTS: `${prefix}_events_v1`,
    CARDS: `${prefix}_cards_v1`,
    SCORES: `${prefix}_scores_v1`,
    WITHDRAWALS: `${prefix}_withdrawals_v1`,
    BONUS_PICKS: `${prefix}_bonus_picks_v1`,
    PAID_2: `${prefix}_paid_2_coaches_v1`,
    PAID_5: `${prefix}_paid_5_coaches_v1`
  };
};

export const getLocalOrSeedEvents = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.EVENTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local events", e);
  }
  localStorage.setItem(keys.EVENTS, JSON.stringify(SEED_EVENTS));
  return SEED_EVENTS;
};

export const saveLocalEvents = (events) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error("Failed to save local events", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalCards = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.CARDS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse local cards", e);
    return [];
  }
};

export const saveLocalCards = (cards) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error("Failed to save local cards", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalScores = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.SCORES);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse local scores", e);
    return [];
  }
};

export const saveLocalScores = (scores) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.SCORES, JSON.stringify(scores));
  } catch (e) {
    console.error("Failed to save local scores", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalWithdrawals = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.WITHDRAWALS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse local withdrawals", e);
    return [];
  }
};

export const saveLocalWithdrawals = (withdrawals) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.WITHDRAWALS, JSON.stringify(withdrawals));
  } catch (e) {
    console.error("Failed to save local withdrawals", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalBonusPicks = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.BONUS_PICKS);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse local bonus picks", e);
    return {};
  }
};

export const saveLocalBonusPicks = (bonusPicks) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.BONUS_PICKS, JSON.stringify(bonusPicks));
  } catch (e) {
    console.error("Failed to save local bonus picks", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalPaid2Coaches = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.PAID_2);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local paid 2 coaches", e);
  }
  const defaultPaid = ["Boycey", "Sam Joyce", "Connor Baker-Elliott", "Luke Boer", "Al Beard", "Chris Quinney", "Han Greenwood", "Jack Kettlety"];
  localStorage.setItem(keys.PAID_2, JSON.stringify(defaultPaid));
  return defaultPaid;
};

export const saveLocalPaid2Coaches = (coaches) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.PAID_2, JSON.stringify(coaches));
  } catch (e) {
    console.error("Failed to save local paid 2 coaches", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalPaid5Coaches = () => {
  const keys = getKeys();
  try {
    const stored = localStorage.getItem(keys.PAID_5);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local paid 5 coaches", e);
  }
  const defaultPaid = ["Clo", "Joshua Brooke", "Sean Carey"];
  localStorage.setItem(keys.PAID_5, JSON.stringify(defaultPaid));
  return defaultPaid;
};

export const saveLocalPaid5Coaches = (coaches) => {
  const keys = getKeys();
  try {
    localStorage.setItem(keys.PAID_5, JSON.stringify(coaches));
  } catch (e) {
    console.error("Failed to save local paid 5 coaches", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

