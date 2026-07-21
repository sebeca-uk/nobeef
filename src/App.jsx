import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import LeaderboardTab from './components/LeaderboardTab';
import RostersTab from './components/RostersTab';
import EventsTab from './components/EventsTab';
import AnalyticsTab from './components/AnalyticsTab';
import PricingTab from './components/PricingTab';
import AdminTab from './components/AdminTab';
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
  saveLocalBonusPicks
} from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Site Access Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('nobeef_site_access') === 'true';
  });
  const [sitePassword, setSitePassword] = useState('');
  const [authError, setAuthError] = useState(false);
  
  const [events, setEvents] = useState(getLocalOrSeedEvents);
  const [cardSubmissions, setCardSubmissions] = useState(getLocalCards);
  const [scores, setScores] = useState(getLocalScores);
  const [withdrawals, setWithdrawals] = useState(getLocalWithdrawals);
  const [bonusPicks, setBonusPicks] = useState(getLocalBonusPicks);

  // Sync state when storage changes
  useEffect(() => {
    const handleSync = () => {
      setEvents(getLocalOrSeedEvents());
      setCardSubmissions(getLocalCards());
      setScores(getLocalScores());
      setWithdrawals(getLocalWithdrawals());
      setBonusPicks(getLocalBonusPicks());
    };

    window.addEventListener('nobeef_data_change', handleSync);
    return () => window.removeEventListener('nobeef_data_change', handleSync);
  }, []);

  const handleSiteLogin = (e) => {
    e.preventDefault();
    const cleanPw = sitePassword.trim().toLowerCase();
    if (cleanPw === 'nobeef' || cleanPw === 'nobeef2026') {
      setIsAuthenticated(true);
      setAuthError(false);
      localStorage.setItem('nobeef_site_access', 'true');
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
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-lg glow-gold">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="uppercase text-[10px] font-extrabold tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Private Fantasy Portal
            </span>
            <h1 className="text-2xl font-black text-white mt-3 tracking-wide">
              NoBeef CrossFit Games Fantasy 2026
            </h1>
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
                  authError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700/80 focus:border-amber-400'
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
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <span>Enter League Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Official NoBeef Fantasy League Portal</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0f19] text-slate-100 font-sans pb-12">
      <div>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} events={events} />

        <main className="max-w-6xl mx-auto px-4">
          {activeTab === 'dashboard' && (
            <DashboardTab
              events={events}
              cardSubmissions={cardSubmissions}
              onSaveCard={handleSaveCard}
              onDeleteCard={handleDeleteCard}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              events={events}
              cardSubmissions={cardSubmissions}
              scores={scores}
              withdrawals={withdrawals}
              bonusPicks={bonusPicks}
            />
          )}

          {activeTab === 'rosters' && <RostersTab />}

          {activeTab === 'events' && <EventsTab events={events} />}

          {activeTab === 'snapshot' && <AnalyticsTab />}

          {activeTab === 'pricing' && <PricingTab />}

          {activeTab === 'admin' && (
            <AdminTab
              events={events}
              scores={scores}
              withdrawals={withdrawals}
              onSaveSchedule={handleSaveSchedule}
              onSaveScores={handleSaveScores}
              onSaveWithdrawals={handleSaveWithdrawals}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-500 border-t border-slate-900 pt-6 px-4">
        <p className="font-semibold text-slate-400">
          NoBeef CrossFit Games Fantasy League 2026 — Official Portal
        </p>
        <p className="mt-1 text-slate-500">
          Organizers: Team Sim & JJ | Locked Deadline: July 20, 2026
        </p>
      </footer>
    </div>
  );
}
