import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import LeaderboardTab from './components/LeaderboardTab';
import RostersTab from './components/RostersTab';
import EventsTab from './components/EventsTab';
import AnalyticsTab from './components/AnalyticsTab';
import PricingTab from './components/PricingTab';
import AdminTab from './components/AdminTab';

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
