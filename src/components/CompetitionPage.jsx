import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, Users, Calendar, MapPin, ArrowRight, ArrowLeft, Flame, Star } from 'lucide-react';
import { ATHLETES_DATA, SEED_EVENTS, COMPETITION_DAYS } from '../data/seedData';

/**
 * CompetitionPage — at /c/:competitionSlug
 * 
 * Shows competition details (athletes, events, schedule) and lists all
 * leagues running for this competition across different gyms.
 * 
 * In Phase 1, this uses hardcoded seed data for CrossFit Games 2026.
 * In Phase 2+, this will fetch from Firestore.
 */

// Phase 1: Hardcoded (will come from Firestore)
const COMPETITION_DATA = {
  'crossfit-games-2026': {
    name: 'CrossFit Games 2026',
    dates: 'Jul 22 – Jul 26, 2026',
    location: 'Fort Worth, Texas',
    description: 'The ultimate test of fitness. 60 of the world\'s fittest athletes compete across 5 grueling events to crown the Fittest on Earth.',
    status: 'active',
    athletes: ATHLETES_DATA,
    events: SEED_EVENTS,
    competitionDays: COMPETITION_DAYS,
    leagues: [
      { gymId: 'nobeef', gymName: 'NoBeef', coachCount: 25, status: 'active' },
    ],
  },
};

export default function CompetitionPage() {
  const { competitionSlug } = useParams();
  const competition = COMPETITION_DATA[competitionSlug];

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#121316] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏟️</div>
          <h2 className="font-display text-2xl font-bold text-white">Competition Not Found</h2>
          <p className="text-slate-400 text-sm">The competition "{competitionSlug}" doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  const menAthletes = competition.athletes.filter(a => a.gender === 'Men');
  const womenAthletes = competition.athletes.filter(a => a.gender === 'Women');
  const priceGroups = {};
  competition.athletes.forEach(a => {
    const key = `${a.rank} (${a.price}m)`;
    if (!priceGroups[key]) priceGroups[key] = [];
    priceGroups[key].push(a);
  });

  return (
    <div className="min-h-screen bg-[#121316] text-slate-100 font-sans">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#e8462f] via-[#f2903d] to-[#f2b134]" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to competitions
        </Link>

        {/* Competition Header */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-indigo-500/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    {competition.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-indigo-400" /> {competition.dates}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {competition.location}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                🔴 Live
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl">{competition.description}</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Athletes</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{competition.athletes.length}</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Men</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{menAthletes.length}</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Women</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{womenAthletes.length}</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Events</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">{competition.events.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leagues for this Competition */}
        <div className="mb-10">
          <h2 className="font-display text-xl font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Leagues
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {competition.leagues.map(league => (
              <Link
                key={league.gymId}
                to={`/g/${league.gymId}/${competitionSlug}`}
                className="group glass-card rounded-xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {league.gymName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">{league.gymName}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      league.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {league.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{league.coachCount} coaches</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}

            {/* Create League CTA */}
            <div className="glass-card rounded-xl p-5 border border-dashed border-slate-700 flex flex-col items-center justify-center text-center min-h-[140px]">
              <Flame className="w-6 h-6 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">Create a league for this competition</p>
              <span className="mt-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Coming in Phase 2
              </span>
            </div>
          </div>
        </div>

        {/* Events Schedule */}
        <div className="mb-10">
          <h2 className="font-display text-xl font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Event Schedule
          </h2>
          <div className="space-y-2">
            {competition.events.map(evt => (
              <div key={evt.id} className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{evt.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{evt.day} • {evt.desc}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-xs font-bold text-indigo-400 font-mono">{evt.maxPoints} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>NoBeef Fantasy Platform</p>
      </footer>
    </div>
  );
}
