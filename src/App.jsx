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

  // Front of Site Password Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121316] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-lg glow-indigo">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>

          <div>
            <span className="uppercase text-[10px] font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Private Fantasy Portal
            </span>
            <h1 className="font-display text-3xl font-black text-white mt-3 tracking-tight uppercase">
              {league.leagueName}
            </h1>
            <p className="text-sm text-slate-300 font-semibold mt-1">
              {league.competitionName} — {league.tagline}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Please enter the site password to view rosters, submit Power Cards, and access real-time leaderboards.
            </p>
          </div>

          <form onSubmit={handleSiteLogin} className="space-y-4 pt-2">
            <div>
              <input
                type="password"
                placeholder="Enter Site Password"
                value={sitePassword}
                onChange={(e) => {
                  setSitePassword(e.target.value);
                  if (authError) setAuthError(false);
                }}
                className={`w-full bg-slate-950 border ${
                  authError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-indigo-400'
                } rounded-xl px-4 py-3.5 text-white text-center text-sm focus:outline-none transition shadow-inner font-mono tracking-wider`}
                autoFocus
              />
              {authError && (
                <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs mt-2 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Incorrect password. Please try again.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <span>Enter League Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>{league.leagueName} — {league.gymName} Official Portal</span>
          </div>
        </div>
      </div>
    );
  }

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
