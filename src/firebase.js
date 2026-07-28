import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { SEED_EVENTS } from './data/seedData';

let db = null;

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
  }
} catch (e) {
  console.warn("Firebase initialization skipped (running in local storage mode):", e);
}

export { db };

// Local Storage Fallback Engine for instant reactivity & full functionality
const STORAGE_KEYS = {
  EVENTS: 'nobeef_events_v1',
  CARDS: 'nobeef_cards_v1',
  SCORES: 'nobeef_scores_v1',
  WITHDRAWALS: 'nobeef_withdrawals_v1',
  BONUS_PICKS: 'nobeef_bonus_picks_v1',
  PAID_2: 'nobeef_paid_2_coaches_v1',
  PAID_5: 'nobeef_paid_5_coaches_v1'
};

export const getLocalOrSeedEvents = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local events", e);
  }
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
  return SEED_EVENTS;
};

export const saveLocalEvents = (events) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error("Failed to save local events", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalCards = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CARDS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse local cards", e);
    return [];
  }
};

export const saveLocalCards = (cards) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error("Failed to save local cards", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalScores = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCORES);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse local scores", e);
    return [];
  }
};

export const saveLocalScores = (scores) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  } catch (e) {
    console.error("Failed to save local scores", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalWithdrawals = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse local withdrawals", e);
    return [];
  }
};

export const saveLocalWithdrawals = (withdrawals) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  } catch (e) {
    console.error("Failed to save local withdrawals", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalBonusPicks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BONUS_PICKS);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse local bonus picks", e);
    return {};
  }
};

export const saveLocalBonusPicks = (bonusPicks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BONUS_PICKS, JSON.stringify(bonusPicks));
  } catch (e) {
    console.error("Failed to save local bonus picks", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalPaid2Coaches = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAID_2);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local paid 2 coaches", e);
  }
  const defaultPaid = ["Boycey", "Sam Joyce", "Connor Baker-Elliott", "Luke Boer", "Al Beard", "Chris Quinney", "Han Greenwood", "Jack Kettlety"];
  localStorage.setItem(STORAGE_KEYS.PAID_2, JSON.stringify(defaultPaid));
  return defaultPaid;
};

export const saveLocalPaid2Coaches = (coaches) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAID_2, JSON.stringify(coaches));
  } catch (e) {
    console.error("Failed to save local paid 2 coaches", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalPaid5Coaches = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAID_5);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse local paid 5 coaches", e);
  }
  const defaultPaid = ["Clo", "Joshua Brooke", "Sean Carey"];
  localStorage.setItem(STORAGE_KEYS.PAID_5, JSON.stringify(defaultPaid));
  return defaultPaid;
};

export const saveLocalPaid5Coaches = (coaches) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAID_5, JSON.stringify(coaches));
  } catch (e) {
    console.error("Failed to save local paid 5 coaches", e);
  }
  window.dispatchEvent(new Event('nobeef_data_change'));
};
