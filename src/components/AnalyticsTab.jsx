import React from 'react';
import { DRAFT_ANALYTICS } from '../data/seedData';
import { BarChart3, Flame, Users, Shield, Trophy, Award, PieChart, TrendingUp } from 'lucide-react';

export default function AnalyticsTab() {
  const stats = DRAFT_ANALYTICS;

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-zinc-800">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-athletic uppercase tracking-wider">
            <BarChart3 className="w-6 h-6 text-red-500" />
            <span>Official Draft Snapshot & League Analytics</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Consensus trends, pick distributions, and draft insights across all 25 coach submissions.
          </p>
        </div>

        {/* Top Highlight Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Stat 1 */}
          <div className="bg-zinc-900/90 border border-red-600/40 rounded-2xl p-4 text-center glow-red">
            <div className="inline-flex items-center gap-1 text-xs font-black text-red-500 uppercase tracking-wider mb-1 font-athletic">
              <Flame className="w-4 h-4 text-red-500" /> Most Picked Athlete
            </div>
            <div className="text-2xl font-black text-white font-athletic uppercase">{stats.mostPicked.name}</div>
            <div className="text-xs font-bold text-red-400 mt-1 font-mono">
              {stats.mostPicked.count} of 25 Coaches ({stats.mostPicked.percentage}%)
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">Runaway #1 overall pick across all 25 teams!</p>
          </div>

          {/* Stat 2 */}
          <div className="bg-zinc-900/90 border border-zinc-700 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1 text-xs font-black text-white uppercase tracking-wider mb-1 font-athletic">
              <Users className="w-4 h-4 text-red-500" /> Tied 2nd Most Picked
            </div>
            <div className="text-xl font-black text-white font-athletic uppercase">Quinn & Lucy</div>
            <div className="text-xs font-bold text-zinc-300 mt-1 font-mono">9 Coaches Each (36%)</div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">Quinn Robinson* & Lucy Campbell selected on 9 rosters.</p>
          </div>

          {/* Stat 3 */}
          <div className="bg-zinc-900/90 border border-zinc-700 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1 text-xs font-black text-red-500 uppercase tracking-wider mb-1 font-athletic">
              <PieChart className="w-4 h-4 text-red-500" /> Untouched Athletes
            </div>
            <div className="text-2xl font-black text-red-500 font-mono">{stats.untouchedAthletesCount} of 60</div>
            <div className="text-xs font-bold text-red-400 mt-1 font-athletic uppercase">40% Never Drafted</div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">Includes Vellner, Khrennikov, Lawson, & Kerstetter.</p>
          </div>

          {/* Stat 4 */}
          <div className="bg-zinc-900/90 border border-zinc-700 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 uppercase tracking-wider mb-1 font-athletic">
              <Shield className="w-4 h-4 text-emerald-400" /> #1 Insurance Choice
            </div>
            <div className="text-2xl font-black text-white font-athletic uppercase">{stats.mostPopularInsurance.name}</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">
              Picked by {stats.mostPopularInsurance.count} Coaches
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-medium">Selected as backup policy by 20% of the league.</p>
          </div>
        </div>

        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-base font-black text-white mb-3 flex items-center gap-2 font-athletic uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-red-500" /> Analyst Consensus (Podium Predictions)
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span>Women's Gold Medal Consensus: <strong className="text-red-400">{stats.analystPodiumConsensusGold.name}</strong></span>
                <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded font-bold font-mono">{stats.analystPodiumConsensusGold.percentage}% (15 Coaches)</span>
              </div>
              <p className="text-zinc-400 text-xs font-medium">
                60% of all coaches backed Lucy Campbell to take 1st place in the Women's Division.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-base font-black text-white mb-3 flex items-center gap-2 font-athletic uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-red-500" /> Roster Strategy & Gender Balance
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center font-medium">
                <span>Squad Size Strategy:</span>
                <span className="text-white font-bold font-mono">40% Full (5 Athletes) vs 60% Power (3-4 Athletes)</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center font-medium">
                <span>Drafted Gender Split:</span>
                <span className="text-red-400 font-bold font-mono">{stats.genderBalance.menSlots} Men's Slots vs {stats.genderBalance.womenSlots} Women's Slots</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
