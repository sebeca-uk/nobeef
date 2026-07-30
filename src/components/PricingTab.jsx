import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Tag, Search, Filter } from 'lucide-react';

export default function PricingTab() {
  const league = useLeague();
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');

  const rankA = league.athletes.find(a => a.rank === 'Rank A');
  const rankE = league.athletes.find(a => a.rank === 'Rank E');
  const rankAPrice = rankA ? rankA.price : 4.5;
  const rankEPrice = rankE ? rankE.price : 1.0;

  const filteredAthletes = league.athletes.filter(ath => {
    const matchesSearch = ath.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = divisionFilter === 'ALL' || ath.gender.toUpperCase() === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  const menAthletes = filteredAthletes.filter(a => a.gender === 'Men');
  const womenAthletes = filteredAthletes.filter(a => a.gender === 'Women');

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
              <Tag className="w-6 h-6 text-indigo-400" />
              <span>Official {league.rules.currency}{league.rules.salaryCap}m Athlete Pricing Guide</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Search and filter all {league.totalAthletes} official competitors across price ranks (Rank A {league.rules.currency}{rankAPrice.toFixed(1)}m down to Rank E {league.rules.currency}{rankEPrice.toFixed(1)}m Rookies).
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search athlete name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121316] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full bg-[#121316] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="ALL">All Divisions ({league.totalAthletes})</option>
              <option value="MEN">Men's Division ({league.menCount})</option>
              <option value="WOMEN">Women's Division ({league.womenCount})</option>
            </select>
          </div>
        </div>

        {/* Pricing Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(divisionFilter === 'ALL' || divisionFilter === 'MEN') &&
            renderDivision("MEN'S DIVISION", menAthletes)}
          {(divisionFilter === 'ALL' || divisionFilter === 'WOMEN') &&
            renderDivision("WOMEN'S DIVISION", womenAthletes)}
        </div>
      </div>
    </div>
  );

  function renderDivision(title, athletes) {
    return (
      <div key={title} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <h3 className="font-display text-base font-extrabold text-white mb-3 border-b border-slate-800 pb-2 uppercase tracking-wider flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs text-indigo-400 font-mono">({athletes.length})</span>
        </h3>

        {/* Desktop: table. Tables force horizontal scroll on narrow
            viewports, so mobile gets its own single-column row list below. */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-indigo-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Athlete Name</th>
                <th className="py-2.5 px-3">Rank Tier</th>
                <th className="py-2.5 px-3 text-right">Price ({league.rules.currency}m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {athletes.map(a => (
                <tr key={a.name} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {a.name} {a.isRookie && <span className="text-cyan-400 font-bold text-[10px] ml-1 uppercase">*Rookie</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-slate-700">
                      {a.rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right scoreboard-num text-indigo-400">
                    {league.rules.currency}{(a.price || 0).toFixed(1)}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked rows, each a single tap-friendly line */}
        <div className="sm:hidden divide-y divide-slate-800">
          {athletes.map(a => (
            <div key={a.name} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0">
                <div className="font-semibold text-white text-sm truncate">
                  {a.name}
                  {a.isRookie && <span className="text-cyan-400 font-bold text-[10px] ml-1.5 uppercase">*Rookie</span>}
                </div>
                <span className="inline-block mt-0.5 bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border border-slate-700">
                  {a.rank}
                </span>
              </div>
              <div className="scoreboard-num text-indigo-400 text-sm shrink-0">
                {league.rules.currency}{(a.price || 0).toFixed(1)}m
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
