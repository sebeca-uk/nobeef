import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Calendar, BarChart3, Tag, Lock, ClipboardList, Timer, Flame, Sparkles, Menu, X, ChevronRight, HelpCircle } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';

export default function Header({ activeTab, setActiveTab, events }) {
  const league = useLeague();
  const [timerText, setTimerText] = useState('00d : 00h : 00m : 00s');
  const [nextEventTitle, setNextEventTitle] = useState('Detecting Next Event...');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const upcoming = events
        .map(e => ({ ...e, startObj: new Date(e.startTime) }))
        .filter(e => e.startObj > now)
        .sort((a, b) => a.startObj - b.startObj);

      if (upcoming.length === 0) {
        setNextEventTitle('All Scheduled Events Underway / Completed!');
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

      setNextEventTitle(`Next Event — ${nextEvt.name} (${nextEvt.day}) Locks In:`);
      setTimerText(`${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m).padStart(2,'0')}m : ${String(s).padStart(2,'0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [events]);

  const primaryNavItems = [
    { id: 'dashboard', label: 'Coach Dashboard & Cards', icon: ClipboardList, badge: 'Dashboard' },
    { id: 'leaderboard', label: 'Live Score Leaderboard', icon: Trophy, badge: 'Leaderboard' },
    { id: 'rosters', label: `All ${league.totalCoaches} Locked Teams`, icon: Lock, badge: 'Teams' },
    { id: 'events', label: 'Event Feed', icon: Calendar, badge: 'Events' },
  ];

  const moreNavItems = [
    { id: 'faq', label: 'FAQ & Rules', icon: HelpCircle, badge: 'FAQ' },
    { id: 'snapshot', label: 'Draft Analytics', icon: BarChart3, badge: 'Analytics' },
    { id: 'pricing', label: 'Athlete Pricing Guide', icon: Tag, badge: 'Pricing' },
    { id: 'admin', label: 'Admin Portal', icon: Shield, badge: 'Admin' },
  ];

  const allNavItems = [...primaryNavItems, ...moreNavItems];
  const isMoreActive = moreNavItems.some(item => item.id === activeTab);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMoreOpen(false);
  };

  return (
    <header className="w-full">
      {/* Top Stripe Gradient Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#e8462f] via-[#f2903d] to-[#f2b134]" />

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#121316] via-[#241a14] to-[#1a1b1f] border-b border-indigo-500/20 py-7 px-4 text-center shadow-2xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-indigo-400" /> {league.competitionName} — {league.tagline}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight uppercase stripe-gradient-text drop-shadow-sm">
            {league.leagueName}
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1.5 tracking-wider uppercase">
            Official Coach Dashboard • Live Leaderboard • RX+ Card Portal
          </p>
        </div>
      </div>

      {/* Countdown Timer Banner */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-6 relative z-10">
        <div className="bg-[#1a1b1f]/95 border border-indigo-500/30 rounded-2xl p-4 text-center shadow-2xl backdrop-blur-xl glow-indigo">
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">
            <Timer className="w-4 h-4 text-indigo-400" />
            <span>{nextEventTitle}</span>
          </div>
          <div className={`scoreboard-num text-2xl sm:text-4xl mt-1 ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
            {timerText}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar (md and up) */}
      <div className="hidden md:block max-w-6xl mx-auto px-3 mb-6">
        <nav className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-[#1a1b1f]/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          {allNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all duration-200 uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#e8462f] text-white shadow-lg shadow-indigo-500/30 scale-[1.02]'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Popover Overlay Sheet (for More pages) */}
      {isMobileMoreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-[#121316]/80 backdrop-blur-md z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-16 left-3 right-3 z-50 bg-[#1a1b1f] border border-indigo-500/30 rounded-2xl p-4 shadow-2xl space-y-2 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Additional League Pages</span>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {moreNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#e8462f] text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Single Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121316]/95 border-t border-slate-800 px-2 py-2 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-around">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight font-bold uppercase">{item.badge}</span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
              isMoreActive || isMobileMoreOpen
                ? 'text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className={`w-5 h-5 ${isMoreActive || isMobileMoreOpen ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span className={`text-[10px] leading-tight font-bold uppercase ${isMoreActive || isMobileMoreOpen ? 'text-indigo-400' : 'text-slate-400'}`}>
              More
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
