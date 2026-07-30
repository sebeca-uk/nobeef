import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, ArrowRight, ArrowLeft, Users, Calendar, Flame } from 'lucide-react';

/**
 * GymPage — at /g/:gymSlug
 * 
 * Shows a gym/organisation profile and all their leagues across different competitions.
 * 
 * In Phase 1, this uses hardcoded data for the NoBeef gym.
 * In Phase 2+, this will fetch from Firestore.
 */

// Phase 1: Hardcoded (will come from Firestore)
const GYM_DATA = {
  'nobeef': {
    name: 'NoBeef',
    description: 'The original NoBeef Fantasy League crew. Running fantasy leagues for CrossFit competitions since 2026.',
    memberCount: 25,
    leagues: [
      {
        competitionSlug: 'crossfit-games-2026',
        competitionName: 'CrossFit Games 2026',
        leagueSlug: 'nobeef-crossfit-games-2026',
        coachCount: 25,
        status: 'active',
        dates: 'Jul 22 – Jul 26, 2026',
      },
    ],
  },
};

export default function GymPage() {
  const { gymSlug } = useParams();
  const gym = GYM_DATA[gymSlug];

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#121316] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏋️</div>
          <h2 className="font-display text-2xl font-bold text-white">Gym Not Found</h2>
          <p className="text-slate-400 text-sm">The gym "{gymSlug}" doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121316] text-slate-100 font-sans">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#e8462f] via-[#f2903d] to-[#f2b134]" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        {/* Gym Profile Header */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-indigo-500/20 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
              {gym.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                {gym.name}
              </h1>
              <p className="text-sm text-slate-400 mt-1">{gym.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {gym.memberCount} members
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                  {gym.leagues.length} league{gym.leagues.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leagues */}
        <div>
          <h2 className="font-display text-xl font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            Active Leagues
          </h2>

          <div className="space-y-3">
            {gym.leagues.map(league => (
              <Link
                key={league.leagueSlug}
                to={`/l/${league.leagueSlug}`}
                className="group glass-card rounded-xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                      {league.competitionName}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {league.dates}
                      </span>
                      <span>{league.coachCount} coaches</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        league.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {league.status}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-16">
        <p>NoBeef Fantasy Platform</p>
      </footer>
    </div>
  );
}
