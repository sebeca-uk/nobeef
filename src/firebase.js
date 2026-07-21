import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, collection, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { SEED_EVENTS } from './data/seedData';

// Fallback or environment Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDevelopment",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nobeef-fantasy-2026.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nobeef-fantasy-2026",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nobeef-fantasy-2026.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Local Storage Fallback Engine for instant reactivity before live Firestore keys are attached
const STORAGE_KEYS = {
  EVENTS: 'nobeef_events_v1',
  CARDS: 'nobeef_cards_v1',
  SCORES: 'nobeef_scores_v1',
  WITHDRAWALS: 'nobeef_withdrawals_v1',
  BONUS_PICKS: 'nobeef_bonus_picks_v1'
};

export const getLocalOrSeedEvents = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
  return SEED_EVENTS;
};

export const saveLocalEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalCards = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.CARDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalCards = (cards) => {
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalScores = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.SCORES);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalScores = (scores) => {
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalWithdrawals = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
  return stored ? JSON.parse(stored) : [];
};

export const saveLocalWithdrawals = (withdrawals) => {
  localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  window.dispatchEvent(new Event('nobeef_data_change'));
};

export const getLocalBonusPicks = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.BONUS_PICKS);
  return stored ? JSON.parse(stored) : {};
};

export const saveLocalBonusPicks = (bonusPicks) => {
  localStorage.setItem(STORAGE_KEYS.BONUS_PICKS, JSON.stringify(bonusPicks));
  window.dispatchEvent(new Event('nobeef_data_change'));
};
