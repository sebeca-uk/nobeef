import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Search, ArrowRight, Flame, Users, Calendar, Sparkles, Zap } from 'lucide-react';

/**
 * LandingPage — The platform home at /
 * 
 * Browse active competitions, join a league with a code, or create your own.
 * In Phase 1, this shows the hardcoded CrossFit Games competition.
 * In Phase 2+, this will query Firestore for all public competitions.
 */

// Phase 1: Hardcoded competition list (will come from Firestore in Phase 2)
const DEMO_COMPETITIONS = [
  {
    id: 'crossfit-games-2026',
    name: 'CrossFit Games 2026',
    dates: 'Jul 22 – Jul 26, 2026',
    location: 'Fort Worth, Texas',
    athleteCount: 60,
    leagueCount: 1,
    status: 'active',
    description: 'The ultimate test of fitness — 60 athletes competing across 5 grueling events.',
  },
];

const DEMO_GYMS = [
  {
    id: 'nobeef',
    name: 'NoBeef',
    leagueCount: 1,
    competitionSlug: 'crossfit-games-2026',
  },
];

export default function LandingPage() {
  const [joinCode, setJoinCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompetitions = DEMO_COMPETITIONS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121316] text-slate-100 font-sans">
      {/* Top Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#e8462f] via-[#f2903d] to-[#f2b134]" />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Fantasy Sports Platform
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            NoBeef Fantasy
          </h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Create and manage fantasy leagues for any competition. Pick your athletes, play your cards, and compete for glory.
          </p>

          {/* Join Code Input */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Zap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter join code (e.g., N7BEF-Q9M2K)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono tracking-wider placeholder:text-slate-500"
                />
              </div>
              <button className="bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 flex items-center gap-1.5">
                Join
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Got a join code from your gym? Enter it above to jump straight into your league.
            </p>
          </div>
        </div>
      </div>

      {/* Active Competitions */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-white uppercase tracking-wider">
              Active Competitions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse competitions and find leagues to join
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search competitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1b1f] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompetitions.map(comp => (
            <Link
              key={comp.id}
              to={`/c/${comp.id}`}
              className="group glass-card rounded-2xl p-6 border border-indigo-500/20 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-indigo-400" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  comp.status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {comp.status === 'active' ? '🔴 Live' : comp.status}
                </span>
              </div>

              <h3 className="font-display text-lg font-extrabold text-white uppercase tracking-wide group-hover:text-indigo-300 transition-colors">
                {comp.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{comp.description}</p>

              <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {comp.dates}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {comp.athleteCount} athletes
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {comp.leagueCount} active league{comp.leagueCount !== 1 ? 's' : ''}
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}

          {/* Create Competition Card */}
          <div className="glass-card rounded-2xl p-6 border border-dashed border-slate-700 hover:border-indigo-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[240px] cursor-pointer hover:-translate-y-1">
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider">
              Create a League
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              Set up a fantasy league for your gym — pick a competition, configure rules, invite your crew.
            </p>
            <span className="mt-3 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Coming in Phase 2
            </span>
          </div>
        </div>

        {/* Existing Leagues Quick Access */}
        <div className="mt-12">
          <h2 className="font-display text-lg font-extrabold text-white uppercase tracking-wider mb-4">
            Active Leagues
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_GYMS.map(gym => (
              <Link
                key={gym.id}
                to={`/g/${gym.id}/${gym.competitionSlug}`}
                className="group glass-card rounded-xl p-4 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {gym.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide truncate">
                    {gym.name} Fantasy League
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {gym.leagueCount} league{gym.leagueCount !== 1 ? 's' : ''} active
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-400">NoBeef Fantasy Platform</p>
        <p className="mt-1">Create fantasy leagues for any competition</p>
      </footer>
    </div>
  );
}
