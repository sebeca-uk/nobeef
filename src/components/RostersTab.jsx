import React from 'react';
import { LOCKED_TEAMS, ATHLETES_DATA } from '../data/seedData';
import { Lock, Shield, Flame } from 'lucide-react';

export default function RostersTab() {
  const getAthletePrice = (name) => {
    const clean = name.replace('*', '').trim();
    const ath = ATHLETES_DATA.find(a => a.name.replace('*', '').trim() === clean);
    return ath ? ath.price : 0;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 font-athletic uppercase tracking-wider">
              <Lock className="w-6 h-6 text-red-500" />
              <span>All 25 Locked Teams & Insurance Policies</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Official rosters locked as of July 20, 2026. No roster edits permitted after deadline.
            </p>
          </div>
          <div className="bg-red-600/20 border border-red-500/40 text-red-400 px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 font-athletic">
            <Lock className="w-3.5 h-3.5" /> Locked & Final
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-black text-red-500 uppercase tracking-wider bg-zinc-900/90 font-athletic">
                <th className="py-3.5 px-4 w-12">#</th>
                <th className="py-3.5 px-4">Coach Name</th>
                <th className="py-3.5 px-4">Active £11.5m Squad</th>
                <th className="py-3.5 px-4">🛡️ Insurance Policy (£2m or less)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm font-medium">
              {LOCKED_TEAMS.map((t, idx) => (
                <tr key={t.coach} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-zinc-400 font-mono">{idx + 1}</td>
                  <td className="py-4 px-4 font-black text-white text-base font-athletic uppercase tracking-wider">{t.coach}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      {t.squad.map(ath => {
                        const price = getAthletePrice(ath);
                        const isAimee = ath.includes("Aimee Cringle");
                        return (
                          <span
                            key={ath}
                            className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold"
                          >
                            <span>{ath}</span>
                            <span className="text-red-400 font-bold bg-red-600/20 px-1.5 py-0.5 rounded text-[10px] font-mono border border-red-500/30">
                              £{price}m
                            </span>
                            {isAimee && (
                              <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[9px] font-black uppercase flex items-center gap-0.5 font-athletic">
                                <Flame className="w-2.5 h-2.5" /> 60% Pick
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-emerald-400 font-extrabold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>{t.ins}</span>
                    <span className="text-xs text-zinc-400 font-mono">(£{getAthletePrice(t.ins)}m)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden space-y-4">
          {LOCKED_TEAMS.map((t, idx) => (
            <div key={t.coach} className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 font-bold text-xs font-mono">#{idx + 1}</span>
                  <span className="text-white font-black text-base font-athletic uppercase tracking-wider">{t.coach}</span>
                </div>
                <span className="text-xs text-zinc-400 font-bold font-athletic uppercase">{t.squad.length} Athletes</span>
              </div>

              <div>
                <span className="text-[11px] font-black text-red-500 uppercase tracking-wider block mb-1.5 font-athletic">
                  Active Squad:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {t.squad.map(ath => {
                    const price = getAthletePrice(ath);
                    return (
                      <span key={ath} className="bg-zinc-950 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-800 font-medium">
                        {ath} <strong className="text-red-400 font-mono ml-1">£{price}m</strong>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">🛡️ Insurance Policy:</span>
                <span className="text-emerald-400 font-bold">{t.ins} (£{getAthletePrice(t.ins)}m)</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
