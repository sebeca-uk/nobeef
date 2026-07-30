import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import LeaderboardTab from './components/LeaderboardTab';
import RostersTab from './components/RostersTab';
import EventsTab from './components/EventsTab';
import AnalyticsTab from './components/AnalyticsTab';
import PricingTab from './components/PricingTab';
import FaqTab from './components/FaqTab';
import AdminTab from './components/AdminTab';
import { useLeague } from './context/LeagueContext';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

import {
  getLocalOrSeedEvents,
  saveLocalEvents,
  getLocalCards,
  saveLocalCards,
  getLocalScores,
  saveLocalScores,
  getLocalWithdrawals,
  saveLocalWithdrawals,
  getLocalBonusPicks,
  saveLocalBonusPicks,
  getLocalPaid2Coaches,
  saveLocalPaid2Coaches,
  getLocalPaid5Coaches,
  saveLocalPaid5Coaches
} from './firebase';

export default function App() {
  const league = useLeague();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Site Access Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // If it's a test/admin environment without a site password, bypass
    if (!league.sitePassword) return true;
    return localStorage.getItem(`${league.id}_site_access`) === 'true';
  });
  const [sitePassword, setSitePassword] = useState('');
  const [authError, setAuthError] = useState(false);
  
  const [events, setEvents] = useState(getLocalOrSeedEvents);
  const [cardSubmissions, setCardSubmissions] = useState(getLocalCards);
  const [scores, setScores] = useState(getLocalScores);
  const [withdrawals, setWithdrawals] = useState(getLocalWithdrawals);
  const [bonusPicks, setBonusPicks] = useState(getLocalBonusPicks);
  const [paid2Coaches, setPaid2Coaches] = useState(getLocalPaid2Coaches);
  const [paid5Coaches, setPaid5Coaches] = useState(getLocalPaid5Coaches);

  // Sync state when storage changes
  useEffect(() => {
    const handleSync = () => {
      setEvents(getLocalOrSeedEvents());
      setCardSubmissions(getLocalCards());
      setScores(getLocalScores());
      setWithdrawals(getLocalWithdrawals());
      setBonusPicks(getLocalBonusPicks());
      setPaid2Coaches(getLocalPaid2Coaches());
      setPaid5Coaches(getLocalPaid5Coaches());
    };

    window.addEventListener('nobeef_data_change', handleSync);
    return () => window.removeEventListener('nobeef_data_change', handleSync);
  }, []);

  // Sync custom theme brand color
  useEffect(() => {
    const colorMap = {
      indigo: '#6366f1',
      orange: '#f97316',
      emerald: '#10b981',
      rose: '#f43f5e',
      sky: '#0ea5e9'
    };
    const accentColor = colorMap[league.brandColor] || '#6366f1'; // indigo fallback
    document.documentElement.style.setProperty('--brand-accent', accentColor);
  }, [league.brandColor]);

  const handleSiteLogin = (e) => {
    e.preventDefault();
    const cleanPw = sitePassword.trim().toLowerCase();
    if (cleanPw === league.sitePassword || cleanPw === league.adminPassword) {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem(`${league.id}_site_access`, 'true');
    } else {
      setAuthError(true);
    }
  };

  const handleSaveCard = (cardData) => {
    const existingIdx = cardSubmissions.findIndex(
      c => c.coach === cardData.coach && c.cardType === cardData.cardType
    );
    let updatedList = [...cardSubmissions];
    if (existingIdx >= 0) {
      updatedList[existingIdx] = cardData;
    } else {
      updatedList.push(cardData);
    }
    setCardSubmissions(updatedList);
    saveLocalCards(updatedList);
  };

  const handleDeleteCard = (coach, cardType) => {
    const updated = cardSubmissions.filter(c => !(c.coach === coach && c.cardType === cardType));
    setCardSubmissions(updated);
    saveLocalCards(updated);
  };

  const handleSaveSchedule = (eventId, updateData) => {
    const updatedEvents = events.map(evt => {
      if (evt.id === eventId) {
        return { ...evt, ...updateData };
      }
      return evt;
    });
    setEvents(updatedEvents);
    saveLocalEvents(updatedEvents);
  };

  const handleSaveScores = (newScoresList) => {
    setScores(newScoresList);
    saveLocalScores(newScoresList);
  };

  const handleSaveWithdrawals = (newWithdrawal) => {
    const updated = [...withdrawals, newWithdrawal];
    setWithdrawals(updated);
    saveLocalWithdrawals(updated);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#121316] text-slate-100 font-sans pb-24 md:pb-12">
      <div>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} events={events} />

        <main className="max-w-6xl mx-auto px-4">
          {activeTab === 'dashboard' && (
            <DashboardTab
              events={events}
              cardSubmissions={cardSubmissions}
              onSaveCard={handleSaveCard}
              onDeleteCard={handleDeleteCard}
              paid2Coaches={paid2Coaches}
              paid5Coaches={paid5Coaches}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              events={events}
              cardSubmissions={cardSubmissions}
              scores={scores}
              withdrawals={withdrawals}
              bonusPicks={bonusPicks}
              paid2Coaches={paid2Coaches}
              paid5Coaches={paid5Coaches}
            />
          )}

          {activeTab === 'rosters' && (
            <RostersTab
              paid2Coaches={paid2Coaches}
              paid5Coaches={paid5Coaches}
            />
          )}

          {activeTab === 'events' && <EventsTab events={events} />}

          {activeTab === 'snapshot' && <AnalyticsTab />}

          {activeTab === 'pricing' && <PricingTab />}

          {activeTab === 'faq' && <FaqTab />}

          {activeTab === 'admin' && (
            <AdminTab
              events={events}
              scores={scores}
              withdrawals={withdrawals}
              paid2Coaches={paid2Coaches}
              paid5Coaches={paid5Coaches}
              onSaveSchedule={handleSaveSchedule}
              onSaveScores={handleSaveScores}
              onSaveWithdrawals={handleSaveWithdrawals}
              onSavePaid2Coaches={saveLocalPaid2Coaches}
              onSavePaid5Coaches={saveLocalPaid5Coaches}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 border-t border-slate-900 pt-6 px-4">
        <p className="font-semibold text-slate-400">
          {league.leagueName} — {league.competitionName} — {league.tagline}
        </p>
        <p className="mt-1 text-slate-500">
          Organizers: {league.organizers} | Locked Deadline: {league.lockDeadline}
        </p>
      </footer>
    </div>
  );
}
