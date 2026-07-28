import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Lock, Shield, Flame, Filter, DollarSign } from 'lucide-react';

export default function RostersTab({ paid2Coaches = [], paid5Coaches = [] }) {
  const league = useLeague();
  const [rosterFilter, setRosterFilter] = useState('ALL'); // 'ALL', 'PAID_2', 'PAID_5'

  const getAthletePrice = (name) => {
    const clean = name.replace('*', '').trim();
    const ath = league.athletes.find(a => a.name.replace('*', '').trim() === clean);
    return ath ? ath.price : 0;
  };

  // Filter roster list based on selection
  const filteredTeams = league.lockedTeams.filter(t => {
    if (rosterFilter === 'PAID_2') return paid2Coaches.includes(t.coach);
    if (rosterFilter === 'PAID_5') return paid5Coaches.includes(t.coach);
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
        {/* Roster Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <Lock className="w-6 h-6 text-indigo-400" />
              <span>All Coach Rosters & Insurance Policies</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Official rosters locked as of {league.lockDeadline}. No roster edits permitted after deadline.
            </p>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-3.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Lock className="w-3.5 h-3.5" /> Locked & Final
          </div>
        </div>

        {/* League Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4 border-t border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter rosters by league buy-in:</span>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['ALL', 'PAID_2', 'PAID_5'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setRosterFilter(filterType)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-250 border border-slate-800 hover:text-white ${
                  rosterFilter === filterType
                    ? filterType === 'PAID_2'
                      ? 'bg-slate-700 text-white shadow-md border-slate-600 scale-[1.02]'
                      : filterType === 'PAID_5'
                        ? 'bg-amber-600 text-white shadow-md border-amber-500 scale-[1.02]'
                        : 'bg-[#e8462f] text-white shadow-md border-rose-500 scale-[1.02]'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {filterType === 'ALL' 
                  ? `🏆 All (${league.lockedTeams.length})` 
                  : filterType === 'PAID_2' 
                    ? `🥈 ${league.rules.currency}${league.leagueTiers.paid_tier_1.price} League (${paid2Coaches.length})` 
                    : `🥇 ${league.rules.currency}${league.leagueTiers.paid_tier_2.price} League (${paid5Coaches.length})`
                }
              </button>
            ))}
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm italic border border-dashed border-slate-800 rounded-xl">
            No rosters found matching this league filter.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-indigo-400 uppercase tracking-wider bg-slate-900/90">
                    <th className="py-3.5 px-4 w-12">#</th>
                    <th className="py-3.5 px-4">Coach Name</th>
                    <th className="py-3.5 px-4">Active {league.rules.currency}{league.rules.salaryCap}m Squad</th>
                    <th className="py-3.5 px-4">🛡️ Insurance Policy ({league.rules.currency}{league.rules.insuranceMaxPrice}m or less)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm font-medium">
                  {filteredTeams.map((t) => {
                    const originalIdx = league.lockedTeams.findIndex(team => team.coach === t.coach) + 1;
                    return (
                      <tr key={t.coach} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-400 font-mono">#{originalIdx}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col justify-center">
                            <span className="font-black text-white text-base uppercase tracking-wider leading-tight">{t.coach}</span>
                            {/* League Badges below name */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-mono">Free</span>
                              {paid2Coaches.includes(t.coach) && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono shadow-sm">🥈 {league.rules.currency}{league.leagueTiers.paid_tier_1.price}</span>
                              )}
                              {paid5Coaches.includes(t.coach) && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono shadow-sm">🥇 {league.rules.currency}{league.leagueTiers.paid_tier_2.price}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            {t.squad.map(ath => {
                              const price = getAthletePrice(ath);
                              const isMostPicked = league.mostPickedAthlete && ath.includes(league.mostPickedAthlete.name);
                              return (
                                <span
                                  key={ath}
                                  className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-inner"
                                >
                                  <span>{ath}</span>
                                  <span className="text-indigo-300 font-bold bg-indigo-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono border border-indigo-500/30">
                                    {league.rules.currency}{price}m
                                  </span>
                                  {isMostPicked && (
                                    <span className="bg-indigo-600 text-white px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase flex items-center gap-0.5">
                                      <Flame className="w-2.5 h-2.5 text-cyan-400" /> {league.mostPickedAthlete.percentage}% Pick
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-emerald-400 font-bold">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>{t.ins}</span>
                            <span className="text-xs text-slate-400 font-mono">({league.rules.currency}{getAthletePrice(t.ins)}m)</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden space-y-4">
              {filteredTeams.map((t) => {
                const originalIdx = league.lockedTeams.findIndex(team => team.coach === t.coach) + 1;
                return (
                  <div key={t.coach} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold text-xs font-mono">#{originalIdx}</span>
                          <span className="text-white font-black text-base uppercase tracking-wider">{t.coach}</span>
                        </div>
                        {/* League Badges for Mobile */}
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-mono">Free</span>
                          {paid2Coaches.includes(t.coach) && (
                            <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_1.price}</span>
                          )}
                          {paid5Coaches.includes(t.coach) && (
                            <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_2.price}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-bold uppercase shrink-0 mt-0.5">{t.squad.length} Athletes</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1.5">
                        Active Squad:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.squad.map(ath => {
                          const price = getAthletePrice(ath);
                          return (
                            <span key={ath} className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800 font-medium">
                              {ath} <strong className="text-indigo-300 font-mono ml-1">{league.rules.currency}{price}m</strong>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">🛡️ Insurance Policy:</span>
                      <span className="text-emerald-400 font-bold">{t.ins} ({league.rules.currency}{getAthletePrice(t.ins)}m)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
