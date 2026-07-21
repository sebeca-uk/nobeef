import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Calendar, BarChart3, Tag, Lock, ClipboardList, Timer, Flame, Sparkles, Users } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, events }) {
  const [timerText, setTimerText] = useState('00d : 00h : 00m : 00s');
  const [nextEventTitle, setNextEventTitle] = useState('Detecting Next Event...');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const upcoming = events
        .map(e => ({ ...e, startObj: new Date(e.startTime) }))
        .filter(e => e.startObj > now)
        .sort((a, b) => a.startObj - b.startObj);

      if (upcoming.length === 0) {
        setNextEventTitle('🏁 All Scheduled Games Events Underway / Completed!');
        setTimerText('00d : 00h : 00m : 00s');
        setIsCompleted(true);
        return;
      }

      setIsCompleted(false);
      const nextEvt = upcoming[0];
      const diff = nextEvt.startObj - now;

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setNextEventTitle(`⏳ Next Event — ${nextEvt.name} (${nextEvt.day}) Locks In:`);
      setTimerText(`${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m).padStart(2,'0')}m : ${String(s).padStart(2,'0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [events]);

  const navItems = [
    { id: 'dashboard', label: 'Coach Dashboard & Cards', icon: ClipboardList },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'rosters', label: 'All 25 Locked Teams', icon: Lock },
    { id: 'events', label: 'Games Event Feed', icon: Calendar },
    { id: 'snapshot', label: 'Draft Analytics', icon: BarChart3 },
    { id: 'pricing', label: 'Athlete Pricing Guide', icon: Tag },
    { id: 'admin', label: 'Admin Portal', icon: Shield },
  ];

  return (
    <header className="w-full">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-sky-900 border-b-4 border-amber-500 py-6 px-4 text-center shadow-2xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" /> 2026 CrossFit Games Official Edition
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white text-shadow-md">
            NoBeef Fantasy League 2026
          </h1>
          <p className="text-amber-400 font-medium text-xs sm:text-sm mt-1 tracking-wide">
            ⚡ Official Coach Dashboard, Live Leaderboard & Card Management Portal ⚡
          </p>
        </div>
      </div>

      {/* Countdown Timer Banner (Mobile Responsive) */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-6 relative z-10">
        <div className="bg-slate-900/95 border-2 border-sky-400/80 rounded-2xl p-4 text-center shadow-2xl backdrop-blur-md glow-cyan">
          <div className="flex items-center justify-center gap-2 text-sky-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">
            <Timer className="w-4 h-4 text-sky-400" />
            <span>{nextEventTitle}</span>
          </div>
          <div className={`text-xl sm:text-3xl font-black font-mono mt-1 ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
            {timerText}
          </div>
        </div>
      </div>

      {/* Navigation Bar (Mobile Swipeable) */}
      <div className="max-w-6xl mx-auto px-3 mb-6">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 rounded-xl bg-slate-900/60 border border-slate-800">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
