import React from 'react';
import { LOCKED_TEAMS, ATHLETES_DATA } from '../data/seedData';
import { Trophy, Award, Shield, Sparkles, Flame, RefreshCw, Star } from 'lucide-react';

export default function LeaderboardTab({ events, cardSubmissions, scores, withdrawals, bonusPicks }) {
  // Real-time fantasy score calculator
  const leaderboardData = LOCKED_TEAMS.map(team => {
    let totalPoints = 0;
    let baseEventPoints = 0;
    let cardBonusPoints = 0;
    let bonusPickPoints = 0;

    const myCards = cardSubmissions.filter(c => c.coach === team.coach);
    const myBonusPicks = bonusPicks[team.coach] || {};

    // Calculate event points
    events.forEach(evt => {
      team.squad.forEach(athName => {
        let activeAthlete = athName;

        // Check if athlete has withdrawn due to injury/illness
        const isWithdrawn = withdrawals.some(w => w.athlete === athName && w.fromEventId <= evt.id);
        if (isWithdrawn && team.ins) {
          activeAthlete = team.ins; // Insurance Policy active!
        }

        // Check Hot Tag card swap for this event
        const hotTag = myCards.find(c => c.cardType === 'HOT_TAG' && c.eventId === evt.id && c.targetAthlete === athName);
        if (hotTag && hotTag.replacementAthlete) {
          activeAthlete = hotTag.replacementAthlete;
        }

        // Base score lookup
        const scoreRec = scores.find(s => s.eventId === evt.id && s.athlete === activeAthlete);
        let pts = scoreRec ? Number(scoreRec.points) || 0 : 0;
        baseEventPoints += pts;

        // Check Lovely Time override card
        const lovelyTime = myCards.find(c => c.cardType === 'LOVELY_TIME' && c.eventId === evt.id && c.targetAthlete === athName);
        if (lovelyTime) {
          const overridePts = evt.maxPoints === 50 ? 25 : 50;
          cardBonusPoints += (overridePts - pts);
          pts = overridePts;
        }

        // Check Moving Day 1.5x multiplier
        const movingDay = myCards.find(c => c.cardType === 'MOVING_DAY' && c.targetEventOrDay === evt.day && c.targetAthlete === athName);
        if (movingDay) {
          const extraPts = pts * 0.5;
          cardBonusPoints += extraPts;
          pts = pts * 1.5;
        }

        totalPoints += pts;
      });
    });

    // Add Analyst & Scout Bonus Pick points if awarded by admin
    if (myBonusPicks.analystPoints) bonusPickPoints += Number(myBonusPicks.analystPoints) || 0;
    if (myBonusPicks.scoutPoints) bonusPickPoints += Number(myBonusPicks.scoutPoints) || 0;

    totalPoints += bonusPickPoints;

    return {
      coach: team.coach,
      squad: team.squad,
      ins: team.ins,
      totalPoints,
      baseEventPoints,
      cardBonusPoints,
      bonusPickPoints,
      cardsCount: myCards.length
    };
  });

  // Sort descending by total fantasy points
  leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Real-Time Fantasy Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Scores calculate dynamically as official CrossFit Games event points and Power Cards are logged.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>25 Coaches Competing</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-amber-400 uppercase tracking-wider bg-slate-900/40">
                <th className="py-3.5 px-4 w-16">Rank</th>
                <th className="py-3.5 px-4">Coach Name</th>
                <th className="py-3.5 px-4">Active £11.5m Squad</th>
                <th className="py-3.5 px-4">Power Cards</th>
                <th className="py-3.5 px-4 text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {leaderboardData.map((row, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <tr key={row.coach} className={`hover:bg-slate-800/40 transition-colors ${isFirst ? 'bg-amber-500/10' : ''}`}>
                    <td className="py-4 px-4 font-black">
                      {isFirst && <span className="inline-flex items-center gap-1 text-amber-400 text-base font-extrabold">🥇 #1</span>}
                      {isSecond && <span className="inline-flex items-center gap-1 text-slate-300 text-base font-extrabold">🥈 #2</span>}
                      {isThird && <span className="inline-flex items-center gap-1 text-amber-600 text-base font-extrabold">🥉 #3</span>}
                      {!isFirst && !isSecond && !isThird && <span className="text-slate-400">#{idx + 1}</span>}
                    </td>

                    <td className="py-4 px-4 font-extrabold text-sky-400 text-base">
                      {row.coach}
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {row.squad.map(ath => (
                          <span key={ath} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                            {ath}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        {row.cardsCount} / 3 Active
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="text-xl font-black text-amber-400">
                        {row.totalPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-400">pts</span>
                      </div>
                      {row.cardBonusPoints > 0 && (
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          +{row.cardBonusPoints.toFixed(1)} card pts
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden space-y-3">
          {leaderboardData.map((row, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={row.coach}
                className={`p-4 rounded-xl border ${
                  isFirst
                    ? 'bg-amber-500/10 border-amber-500/40 glow-gold'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-lg ${isFirst ? 'text-amber-400' : 'text-slate-400'}`}>
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-sky-400 text-base">{row.coach}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-400">
                      {row.totalPoints.toFixed(1)} <span className="text-xs font-semibold text-slate-400">pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 my-2">
                  {row.squad.map(ath => (
                    <span key={ath} className="bg-slate-950 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-800 font-medium">
                      {ath}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Power Cards Played: <strong className="text-sky-400">{row.cardsCount}/3</strong></span>
                  <span className="text-emerald-400 font-medium">
                    🛡️ {row.ins}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
