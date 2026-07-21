import React, { useState } from 'react';
import { ATHLETES_DATA } from '../data/seedData';
import { Tag, Search, Filter } from 'lucide-react';

export default function PricingTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');

  const filteredAthletes = ATHLETES_DATA.filter(ath => {
    const matchesSearch = ath.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = divisionFilter === 'ALL' || ath.gender.toUpperCase() === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  const menAthletes = filteredAthletes.filter(a => a.gender === 'Men');
  const womenAthletes = filteredAthletes.filter(a => a.gender === 'Women');

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 font-athletic uppercase tracking-wider">
              <Tag className="w-6 h-6 text-red-500" />
              <span>Official £11.5m Athlete Pricing Guide</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Search and filter all 60 official competitors across price ranks (Rank A £4.5m down to Rank E £1.0m Rookies).
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search athlete name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 font-semibold"
            >
              <option value="ALL">All Divisions (60)</option>
              <option value="MEN">Men's Division (31)</option>
              <option value="WOMEN">Women's Division (29)</option>
            </select>
          </div>
        </div>

        {/* Pricing Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Men's Division */}
          {(divisionFilter === 'ALL' || divisionFilter === 'MEN') && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-base font-black text-white mb-3 border-b border-zinc-800 pb-2 font-athletic uppercase tracking-wider flex items-center justify-between">
                <span>MEN'S DIVISION</span>
                <span className="text-xs text-red-500 font-mono">({menAthletes.length})</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-red-500 font-black uppercase text-[11px] font-athletic tracking-wider">
                      <th className="py-2.5 px-3">Athlete Name</th>
                      <th className="py-2.5 px-3">Rank Tier</th>
                      <th className="py-2.5 px-3 text-right">Price (£m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-medium">
                    {menAthletes.map(a => (
                      <tr key={a.name} className="hover:bg-zinc-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {a.name} {a.isRookie && <span className="text-red-400 font-bold text-[10px] ml-1 font-athletic uppercase">*Rookie</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded font-bold font-athletic uppercase border border-zinc-700">
                            {a.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-red-500 font-mono">
                          £{a.price.toFixed(1)}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Women's Division */}
          {(divisionFilter === 'ALL' || divisionFilter === 'WOMEN') && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-base font-black text-white mb-3 border-b border-zinc-800 pb-2 font-athletic uppercase tracking-wider flex items-center justify-between">
                <span>WOMEN'S DIVISION</span>
                <span className="text-xs text-red-500 font-mono">({womenAthletes.length})</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-red-500 font-black uppercase text-[11px] font-athletic tracking-wider">
                      <th className="py-2.5 px-3">Athlete Name</th>
                      <th className="py-2.5 px-3">Rank Tier</th>
                      <th className="py-2.5 px-3 text-right">Price (£m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-medium">
                    {womenAthletes.map(a => (
                      <tr key={a.name} className="hover:bg-zinc-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {a.name} {a.isRookie && <span className="text-red-400 font-bold text-[10px] ml-1 font-athletic uppercase">*Rookie</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded font-bold font-athletic uppercase border border-zinc-700">
                            {a.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-red-500 font-mono">
                          £{a.price.toFixed(1)}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
