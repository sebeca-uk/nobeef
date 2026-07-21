import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Calendar, BarChart3, Tag, Lock, ClipboardList, Timer, Flame, Sparkles, Menu, X, ChevronRight, HelpCircle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, events }) {
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
        setNextEventTitle('All Scheduled Games Events Underway / Completed!');
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
    { id: 'rosters', label: 'All 25 Locked Teams', icon: Lock, badge: 'Teams' },
    { id: 'events', label: 'Games Event Feed', icon: Calendar, badge: 'Events' },
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
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b-4 border-red-600 py-6 px-4 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
        <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/40 text-red-500 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 font-athletic">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" /> 2026 CrossFit Games Official Edition
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-white font-athletic text-shadow-md">
            NoBeef Fantasy League 2026
          </h1>
          <p className="text-zinc-400 font-semibold text-xs sm:text-sm mt-1 tracking-widest uppercase font-athletic">
            Official Coach Dashboard • Live Leaderboard • RX+ Card Portal
          </p>
        </div>
      </div>

      {/* Countdown Timer Banner */}
      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-5 relative z-10">
        <div className="bg-zinc-900/95 border-2 border-red-600/80 rounded-2xl p-3.5 text-center shadow-2xl backdrop-blur-md glow-red">
          <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-xs sm:text-sm uppercase tracking-wider font-athletic">
            <Timer className="w-4 h-4 text-red-500" />
            <span>{nextEventTitle}</span>
          </div>
          <div className={`text-2xl sm:text-4xl font-black font-mono mt-1 ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
            {timerText}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar (md and up) - Flex wrapped to prevent any clipping */}
      <div className="hidden md:block max-w-6xl mx-auto px-3 mb-6">
        <nav className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md">
          {allNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all duration-200 font-athletic uppercase tracking-wider ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                    : 'bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-500'}`} />
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
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-16 left-3 right-3 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-2 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-red-500 font-athletic">Additional League Pages</span>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800"
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all font-athletic uppercase tracking-wider ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                        : 'bg-zinc-950 text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Single Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800 px-2 py-2 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-around">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-red-500 font-bold bg-red-600/10 border border-red-600/20' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-zinc-400'}`} />
                <span className="text-[10px] leading-tight font-bold font-athletic uppercase">{item.badge}</span>
              </button>
            );
          })}

          {/* More Menu Trigger (Opens non-primary pages drawer) */}
          <button
            onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
              isMoreActive || isMobileMoreOpen
                ? 'text-red-500 font-bold bg-red-600/10 border border-red-600/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Menu className={`w-5 h-5 ${isMoreActive || isMobileMoreOpen ? 'text-red-500' : 'text-zinc-400'}`} />
            <span className={`text-[10px] leading-tight font-bold font-athletic uppercase ${isMoreActive || isMobileMoreOpen ? 'text-red-500' : 'text-zinc-400'}`}>
              More
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
