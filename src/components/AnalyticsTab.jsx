import React from 'react';
import { DRAFT_ANALYTICS } from '../data/seedData';
import { BarChart3, Flame, Users, Shield, Trophy, PieChart, TrendingUp } from 'lucide-react';

export default function AnalyticsTab() {
  const stats = DRAFT_ANALYTICS;

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Official Draft Snapshot & League Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Consensus trends, pick distributions, and draft insights across all 25 coach submissions.
          </p>
        </div>

        {/* Top Highlight Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Stat 1 */}
          <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 text-center glow-indigo">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-indigo-400" /> Most Picked Athlete
            </div>
            <div className="text-2xl font-black text-white uppercase">{stats.mostPicked.name}</div>
            <div className="text-xs font-bold text-indigo-300 mt-1 font-mono">
              {stats.mostPicked.count} of 25 Coaches ({stats.mostPicked.percentage}%)
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Runaway #1 overall pick across all 25 teams!</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-white uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-purple-400" /> Tied 2nd Most Picked
            </div>
            <div className="text-xl font-black text-white uppercase">Quinn & Lucy</div>
            <div className="text-xs font-bold text-slate-300 mt-1 font-mono">9 Coaches Each (36%)</div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Quinn Robinson* & Lucy Campbell selected on 9 rosters.</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <PieChart className="w-4 h-4 text-cyan-400" /> Untouched Athletes
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono">{stats.untouchedAthletesCount} of 60</div>
            <div className="text-xs font-bold text-cyan-300 mt-1 uppercase">40% Never Drafted</div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Includes Vellner, Khrennikov, Lawson, & Kerstetter.</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4 text-emerald-400" /> #1 Insurance Choice
            </div>
            <div className="text-2xl font-black text-white uppercase">{stats.mostPopularInsurance.name}</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">
              Picked by {stats.mostPopularInsurance.count} Coaches
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Selected as backup policy by 20% of the league.</p>
          </div>
        </div>

        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-indigo-400" /> Analyst Consensus (Podium Predictions)
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>Women's Gold Medal Consensus: <strong className="text-indigo-300">{stats.analystPodiumConsensusGold.name}</strong></span>
                <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold font-mono">{stats.analystPodiumConsensusGold.percentage}% (15 Coaches)</span>
              </div>
              <p className="text-slate-400 text-xs font-medium">
                60% of all coaches backed Lucy Campbell to take 1st place in the Women's Division.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Roster Strategy & Gender Balance
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center font-medium">
                <span>Squad Size Strategy:</span>
                <span className="text-white font-bold font-mono">40% Full (5 Athletes) vs 60% Power (3-4 Athletes)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center font-medium">
                <span>Drafted Gender Split:</span>
                <span className="text-indigo-300 font-bold font-mono">{stats.genderBalance.menSlots} Men's Slots vs {stats.genderBalance.womenSlots} Women's Slots</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
