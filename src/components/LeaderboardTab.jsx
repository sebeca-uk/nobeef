import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { 
  Trophy, Award, Shield, Sparkles, Flame, Star, Zap, 
  ChevronDown, ChevronUp, Search, User, CheckCircle2, 
  AlertCircle, AlertTriangle, TrendingUp, DollarSign
} from 'lucide-react';

// Color gradients for coach avatars
const AVATAR_GRADIENTS = [
  'from-amber-500 to-red-600',
  'from-sky-500 to-indigo-600',
  'from-emerald-500 to-teal-700',
  'from-purple-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-orange-500 to-amber-600',
  'from-rose-500 to-red-700',
  'from-violet-500 to-purple-700',
];

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarGradient = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

export default function LeaderboardTab({ 
  events, 
  cardSubmissions, 
  scores, 
  withdrawals, 
  bonusPicks,
  paid2Coaches = [],
  paid5Coaches = []
}) {
  const league = useLeague();
  const [expandedCoach, setExpandedCoach] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLeague, setActiveLeague] = useState('FREE'); // 'FREE', 'PAID_2', 'PAID_5'

  // Real-time fantasy score calculator
  const leaderboardData = league.lockedTeams.map(team => {
    let totalPoints = 0;
    let baseEventPoints = 0;
    let cardBonusPoints = 0;
    let bonusPickPoints = 0;

    const myCards = cardSubmissions.filter(c => c.coach === team.coach);
    const myBonusPicks = bonusPicks[team.coach] || {};

    // Track per-athlete breakdown
    const squadDetails = team.squad.map(athName => {
      const athData = league.athletes.find(a => a.name === athName) || { name: athName, gender: 'N/A', price: 0, rank: 'N/A' };
      let athleteTotalPts = 0;
      const eventBreakdown = [];

      events.forEach(evt => {
        let activeAthlete = athName;
        let isSubbed = false;
        let subReason = null;

        // Check if athlete has withdrawn due to injury/illness
        const isWithdrawn = withdrawals.some(w => w.athlete === athName && w.fromEventId <= evt.id);
        if (isWithdrawn && team.ins) {
          activeAthlete = team.ins;
          isSubbed = true;
          subReason = `Insurance (${team.ins})`;
        }

        // Check Hot Tag card swap for this event
        const hotTag = myCards.find(c => c.cardType === 'HOT_TAG' && c.eventId === evt.id && c.targetAthlete === athName);
        if (hotTag && hotTag.replacementAthlete) {
          activeAthlete = hotTag.replacementAthlete;
          isSubbed = true;
          subReason = `Hot Tag (${hotTag.replacementAthlete})`;
        }

        // Base score lookup
        const scoreRec = scores.find(s => s.eventId === evt.id && s.athlete === activeAthlete);
        let pts = scoreRec ? Number(scoreRec.points) || 0 : 0;
        let rawPts = pts;
        let cardBonusOnThisEvt = 0;

        // Check Lovely Time override card
        const lovelyTime = myCards.find(c => c.cardType === 'LOVELY_TIME' && c.eventId === evt.id && c.targetAthlete === athName);
        if (lovelyTime) {
          const overridePts = evt.maxPoints === 50 ? league.rules.lovelyTimeBonus50 : league.rules.lovelyTimeBonus100;
          cardBonusOnThisEvt += (overridePts - pts);
          pts = overridePts;
        }

        // Check Moving Day multiplier
        const movingDay = myCards.find(c => c.cardType === 'MOVING_DAY' && c.targetEventOrDay === evt.day && c.targetAthlete === athName);
        if (movingDay) {
          const extraPts = pts * (league.rules.movingDayMultiplier - 1);
          cardBonusOnThisEvt += extraPts;
          pts = pts * league.rules.movingDayMultiplier;
        }

        athleteTotalPts += pts;

        eventBreakdown.push({
          eventId: evt.id,
          eventName: evt.name,
          activeAthlete,
          isSubbed,
          subReason,
          rawPts,
          finalPts: pts,
          cardBonusOnThisEvt
        });
      });

      return {
        name: athName,
        data: athData,
        athleteTotalPts,
        eventBreakdown
      };
    });

    // Calculate totals
    squadDetails.forEach(s => {
      s.eventBreakdown.forEach(eb => {
        baseEventPoints += eb.rawPts;
        cardBonusPoints += eb.cardBonusOnThisEvt;
        totalPoints += eb.finalPts;
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
      squadDetails,
      myCards,
      myBonusPicks,
      totalPoints,
      baseEventPoints,
      cardBonusPoints,
      bonusPickPoints,
      cardsCount: myCards.length
    };
  });

  // Sort descending by total fantasy points
  leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

  // Filter coaches by league membership
  const leagueCoaches = leaderboardData.filter(item => {
    if (activeLeague === 'PAID_2') return paid2Coaches.includes(item.coach);
    if (activeLeague === 'PAID_5') return paid5Coaches.includes(item.coach);
    return true; // FREE includes all 25 coaches
  });

  const getMinCoaches = () => {
    if (activeLeague === 'PAID_2') return league.leagueTiers.paid_tier_1.minCoaches;
    if (activeLeague === 'PAID_5') return league.leagueTiers.paid_tier_2.minCoaches;
    return 0;
  };

  const isLeagueActive = activeLeague === 'FREE' || leagueCoaches.length >= getMinCoaches();

  // Filter leaderboard by search term
  const filteredLeaderboard = leagueCoaches.filter(item => 
    item.coach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top 3 Podium Ranks inside the selected league
  const top1 = leagueCoaches[0];
  const top2 = leagueCoaches[1];
  const top3 = leagueCoaches[2];

  const toggleExpand = (coachName) => {
    setExpandedCoach(prev => prev === coachName ? null : coachName);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="glass-card rounded-2xl p-6 border border-indigo-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">
              Fantasy Leaderboards
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Standings and podium leaders are calculated in real-time. Expand details to see active rosters & Power Cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121316] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition font-medium"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#121316] px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-indigo-300 font-bold uppercase font-mono">
              <span>{leagueCoaches.length} Coaches</span>
            </div>
          </div>
        </div>
      </div>

      {/* League Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#121316]/50 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        <button
          onClick={() => {
            setActiveLeague('FREE');
            setExpandedCoach(null);
          }}
          className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            activeLeague === 'FREE'
              ? 'bg-[#e8462f] text-white shadow-lg shadow-indigo-500/25 scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span>🏆 {league.leagueTiers.free.name}</span>
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${activeLeague === 'FREE' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {league.totalCoaches} Coaches
          </span>
        </button>

        <button
          onClick={() => {
            setActiveLeague('PAID_2');
            setExpandedCoach(null);
          }}
          className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            activeLeague === 'PAID_2'
              ? 'bg-slate-700 text-white shadow-lg scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-300" />
            <span>🥈 {league.leagueTiers.paid_tier_1.name}</span>
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${activeLeague === 'PAID_2' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'} flex items-center gap-1.5`}>
            <span>{paid2Coaches.length} Coaches</span>
            <span className={`w-2 h-2 rounded-full ${paid2Coaches.length >= league.leagueTiers.paid_tier_1.minCoaches ? 'bg-emerald-500' : 'bg-amber-500'}`} title={paid2Coaches.length >= league.leagueTiers.paid_tier_1.minCoaches ? "Active" : `Pending activation (<${league.leagueTiers.paid_tier_1.minCoaches} coaches)`} />
          </span>
        </button>

        <button
          onClick={() => {
            setActiveLeague('PAID_5');
            setExpandedCoach(null);
          }}
          className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
            activeLeague === 'PAID_5'
              ? 'bg-amber-600 text-white shadow-lg scale-[1.01]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>🥇 {league.leagueTiers.paid_tier_2.name}</span>
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${activeLeague === 'PAID_5' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'} flex items-center gap-1.5`}>
            <span>{paid5Coaches.length} Coaches</span>
            <span className={`w-2 h-2 rounded-full ${paid5Coaches.length >= league.leagueTiers.paid_tier_2.minCoaches ? 'bg-emerald-500' : 'bg-amber-500'}`} title={paid5Coaches.length >= league.leagueTiers.paid_tier_2.minCoaches ? "Active" : `Pending activation (<${league.leagueTiers.paid_tier_2.minCoaches} coaches)`} />
          </span>
        </button>
      </div>

      {/* Active League Views */}
      {isLeagueActive ? (
        <>
          {/* Top 3 Podium Highlights Section */}
          {top1 && top2 && top3 && !searchTerm && (
            <div className="pt-4 pb-2">
              <div className="text-center mb-6">
                <span className="uppercase text-[11px] font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/30">
                  {activeLeague === 'FREE' ? league.leagueTiers.free.name : activeLeague === 'PAID_2' ? league.leagueTiers.paid_tier_1.name : league.leagueTiers.paid_tier_2.name} Podium
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-4xl mx-auto">
                {/* 2nd Place (Left) */}
                <div 
                  onClick={() => toggleExpand(top2.coach)}
                  className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 glass-card rounded-2xl p-4 md:p-6 border text-center relative ${
                    expandedCoach === top2.coach 
                      ? 'ring-2 ring-zinc-300 border-zinc-300 bg-zinc-800/90' 
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/90'
                  }`}
                >
                  <div className="flex justify-center mb-3 relative">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr ${getAvatarGradient(top2.coach)} flex items-center justify-center text-white font-extrabold text-xl md:text-2xl shadow-lg border-2 border-slate-400/60`}>
                      {getInitials(top2.coach)}
                    </div>
                    {/* Silver Rank Badge */}
                    <div className="absolute -bottom-2 bg-slate-800 text-slate-200 border border-slate-500 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <span>🥈</span> #2
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-white text-sm md:text-lg truncate mt-3 uppercase tracking-wide">
                    {top2.coach}
                  </h3>

                  {/* League Badges */}
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {paid2Coaches.includes(top2.coach) && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_1.price}</span>
                    )}
                    {paid5Coaches.includes(top2.coach) && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_2.price}</span>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-xl md:text-2xl font-black text-white tracking-tight font-mono">
                      {top2.totalPoints.toFixed(1)}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 ml-1 uppercase">pts</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-center items-center text-[10px] md:text-xs text-indigo-400 font-bold gap-1 uppercase">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span>{top2.cardsCount}/{league.rules.maxPowerCards} Cards</span>
                  </div>
                </div>

                {/* 1st Place (Center - Elevated & Highlighted Indigo Glow) */}
                <div 
                  onClick={() => toggleExpand(top1.coach)}
                  className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-2 glass-card rounded-2xl p-5 md:p-7 border text-center relative glow-indigo ${
                    expandedCoach === top1.coach 
                      ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-950/40' 
                      : 'border-indigo-500/60 bg-gradient-to-b from-indigo-950/50 via-slate-900 to-slate-950 hover:border-indigo-400'
                  }`}
                >
                  {/* Crown indicator */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8462f] text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                    👑 CHAMPION
                  </div>

                  <div className="flex justify-center mb-3 relative mt-1">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr ${getAvatarGradient(top1.coach)} flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl border-4 border-[#e8462f]`}>
                      {getInitials(top1.coach)}
                    </div>
                    {/* Gold Rank Badge */}
                    <div className="absolute -bottom-2 bg-[#e8462f] text-white font-extrabold text-xs px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                      <span>🥇</span> #1
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-white text-base md:text-xl truncate mt-4 uppercase tracking-wider">
                    {top1.coach}
                  </h3>

                  {/* League Badges */}
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {paid2Coaches.includes(top1.coach) && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_1.price}</span>
                    )}
                    {paid5Coaches.includes(top1.coach) && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_2.price}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="text-2xl md:text-4xl font-black text-indigo-400 tracking-tight font-mono">
                      {top1.totalPoints.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-300 ml-1 uppercase">pts</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-indigo-500/30 flex justify-center items-center text-xs text-indigo-400 font-bold gap-1 uppercase">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{top1.cardsCount}/{league.rules.maxPowerCards} Cards</span>
                  </div>
                </div>

                {/* 3rd Place (Right) */}
                <div 
                  onClick={() => toggleExpand(top3.coach)}
                  className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 glass-card rounded-2xl p-4 md:p-6 border text-center relative ${
                    expandedCoach === top3.coach 
                      ? 'ring-2 ring-amber-500 border-amber-500 bg-slate-800/90' 
                      : 'border-slate-800 hover:border-amber-500/50 bg-slate-900/90'
                  }`}
                >
                  <div className="flex justify-center mb-3 relative">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr ${getAvatarGradient(top3.coach)} flex items-center justify-center text-white font-extrabold text-xl md:text-2xl shadow-lg border-2 border-amber-600/70`}>
                      {getInitials(top3.coach)}
                    </div>
                    {/* Bronze Rank Badge */}
                    <div className="absolute -bottom-2 bg-slate-800 text-amber-400 border border-amber-600/70 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <span>🥉</span> #3
                    </div>
                  </div>

                  <h3 className="font-display font-extrabold text-white text-sm md:text-lg truncate mt-3 uppercase tracking-wide">
                    {top3.coach}
                  </h3>

                  {/* League Badges */}
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {paid2Coaches.includes(top3.coach) && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_1.price}</span>
                    )}
                    {paid5Coaches.includes(top3.coach) && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">{league.rules.currency}{league.leagueTiers.paid_tier_2.price}</span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="text-xl md:text-2xl font-black text-white tracking-tight font-mono">
                      {top3.totalPoints.toFixed(1)}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 ml-1 uppercase">pts</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-center items-center text-[10px] md:text-xs text-indigo-400 font-bold gap-1 uppercase">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span>{top3.cardsCount}/{league.rules.maxPowerCards} Cards</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Leaderboard List */}
          <div className="glass-card rounded-2xl border border-indigo-500/20 overflow-hidden shadow-xl">
            <div className="p-4 bg-[#121316]/90 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <span>Rank & Coach</span>
              <span className="text-right">Total Points</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {filteredLeaderboard.map((row) => {
                const rank = leagueCoaches.findIndex(item => item.coach === row.coach) + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;
                const isExpanded = expandedCoach === row.coach;

                return (
                  <div key={row.coach} className="transition-colors">
                    {/* Main Row Header */}
                    <div 
                      onClick={() => toggleExpand(row.coach)}
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition ${
                        isExpanded ? 'bg-slate-800/60' : isFirst ? 'bg-indigo-500/10' : ''
                      }`}
                    >
                      {/* Left: Rank, Avatar, Coach Name */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Rank Badge */}
                        <div className="w-8 flex justify-center items-center shrink-0">
                          {isFirst && <span className="text-lg font-black text-amber-400">🥇</span>}
                          {isSecond && <span className="text-lg font-black text-slate-300">🥈</span>}
                          {isThird && <span className="text-lg font-black text-amber-600">🥉</span>}
                          {!isFirst && !isSecond && !isThird && (
                            <span className="text-sm font-bold text-slate-400 font-mono">#{rank}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarGradient(row.coach)} flex items-center justify-center text-white font-bold text-sm shadow shrink-0 border border-slate-700`}>
                          {getInitials(row.coach)}
                        </div>

                        {/* Coach Name & Quick Squad Pill */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm md:text-base truncate uppercase tracking-wider">
                              {row.coach}
                            </span>
                            {/* League Badges */}
                            <div className="flex items-center gap-1">
                              {paid2Coaches.includes(row.coach) && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shadow-sm font-mono leading-none">
                                  🥈 {league.rules.currency}{league.leagueTiers.paid_tier_1.price}
                                </span>
                              )}
                              {paid5Coaches.includes(row.coach) && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm font-mono leading-none">
                                  🥇 {league.rules.currency}{league.leagueTiers.paid_tier_2.price}
                                </span>
                              )}
                            </div>
                            {row.cardBonusPoints > 0 && (
                              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                +{row.cardBonusPoints.toFixed(1)} card pts
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                            <span className="truncate">{row.squad.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Score & Expand Toggle */}
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <div className="text-right">
                          <div className="text-base md:text-lg font-black text-white font-mono">
                            {row.totalPoints.toFixed(1)}
                            <span className="text-xs font-bold text-slate-400 ml-1 uppercase">pts</span>
                          </div>
                          <div className="text-[10px] text-indigo-400 font-bold flex items-center justify-end gap-1 uppercase">
                            <Zap className="w-3 h-3 text-indigo-400" />
                            <span>{row.cardsCount}/{league.rules.maxPowerCards}</span>
                          </div>
                        </div>

                        <div className="p-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Card */}
                    {isExpanded && (
                      <div className="p-4 md:p-6 bg-slate-950/90 border-t border-b border-slate-800 space-y-6 animate-fadeIn">
                        {/* Top Stats Overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <div className="text-slate-400 font-bold uppercase">Base Event Points</div>
                            <div className="text-base font-black text-white mt-1 font-mono">{row.baseEventPoints.toFixed(1)}</div>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <div className="text-slate-400 font-bold uppercase">Power Card Boosts</div>
                            <div className="text-base font-black text-emerald-400 mt-1 font-mono">+{row.cardBonusPoints.toFixed(1)}</div>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <div className="text-slate-400 font-bold uppercase">Bonus Pick Pts</div>
                            <div className="text-base font-black text-indigo-400 mt-1 font-mono">+{row.bonusPickPoints.toFixed(1)}</div>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                            <div className="text-slate-400 font-bold uppercase">Insurance Policy</div>
                            <div className="text-xs font-bold text-cyan-400 mt-1 truncate">🛡️ {row.ins}</div>
                          </div>
                        </div>

                        {/* Active Squad Breakdown */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-indigo-400" />
                            <span>Active Squad & Event Breakdown</span>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {row.squadDetails.map((ath) => (
                              <div key={ath.name} className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-extrabold text-sm text-white uppercase tracking-wide">{ath.name}</span>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-semibold">
                                      <span>{ath.data.gender}</span>
                                      <span>•</span>
                                      <span className="font-mono">{league.rules.currency}{ath.data.price}m</span>
                                      <span>•</span>
                                      <span className="text-indigo-400 font-semibold">{ath.data.rank}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-black text-white font-mono">
                                      {ath.athleteTotalPts.toFixed(1)} pts
                                    </span>
                                  </div>
                                </div>

                                {/* Event detail scores */}
                                <div className="pt-2 border-t border-slate-800 space-y-1">
                                  {ath.eventBreakdown.map((eb) => (
                                    <div key={eb.eventId} className="flex justify-between items-center text-[11px] text-slate-300">
                                      <span className="text-slate-400 truncate max-w-[180px] font-medium">{eb.eventName}</span>
                                      <div className="flex items-center gap-1.5">
                                        {eb.isSubbed && (
                                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                                            {eb.subReason}
                                          </span>
                                        )}
                                        {eb.cardBonusOnThisEvt > 0 && (
                                          <span className="text-[9px] text-emerald-400 font-bold font-mono">
                                            (+{eb.cardBonusOnThisEvt.toFixed(1)})
                                          </span>
                                        )}
                                        <span className="font-bold text-white font-mono">{eb.finalPts} pts</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Submitted Power Cards */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-indigo-400" />
                            <span>Submitted Power Cards ({row.myCards.length}/{league.rules.maxPowerCards})</span>
                          </h4>

                          {row.myCards.length === 0 ? (
                            <div className="bg-slate-900 rounded-xl p-3 text-xs text-slate-400 border border-slate-800">
                              No Power Cards locked in yet.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {row.myCards.map((card, idx) => (
                                <div key={idx} className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-indigo-400 uppercase">
                                    {card.cardType === 'HOT_TAG' && <Flame className="w-3.5 h-3.5 text-cyan-400" />}
                                    {card.cardType === 'LOVELY_TIME' && <Star className="w-3.5 h-3.5 text-purple-400" />}
                                    {card.cardType === 'MOVING_DAY' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                                    <span>{card.cardType.replace('_', ' ')}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-300 mt-1">
                                    {card.targetAthlete && <div>Target: <strong>{card.targetAthlete}</strong></div>}
                                    {card.replacementAthlete && <div>Swap: <strong>{card.replacementAthlete}</strong></div>}
                                    {card.targetEventOrDay && <div>Day: <strong>{card.targetEventOrDay}</strong></div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Pending Activation Status Card (Requires >= 5 players) */
        <div className="glass-card rounded-2xl p-8 border border-amber-500/20 text-center max-w-2xl mx-auto space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/30" />
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/5 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-wider">
              {activeLeague === 'PAID_2' ? league.leagueTiers.paid_tier_1.name : league.leagueTiers.paid_tier_2.name} Pending Activation
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              This league is currently inactive. It requires a minimum of <strong className="text-white">{getMinCoaches()} registered coaches</strong> to calculate relative standings. 
              Currently, there are only <strong className="text-amber-400 font-mono text-sm">{leagueCoaches.length}</strong> coaches registered.
            </p>
          </div>
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-semibold text-slate-300 text-left">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/80 mb-2.5">
              <span className="text-slate-400 uppercase tracking-wider text-[10px]">Registered Coaches ({leagueCoaches.length})</span>
              <span className="text-amber-400 font-mono font-bold">{leagueCoaches.length} / {getMinCoaches()}</span>
            </div>
            {leagueCoaches.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-start">
                {leagueCoaches.map(item => (
                  <span key={item.coach} className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-white font-bold uppercase tracking-wide">
                    {item.coach}
                  </span>
                ))}
              </div>
            ) : (
              <span className="italic text-slate-500 text-center block py-2">No coaches registered in this league tier yet.</span>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Coaches' membership status can be updated in the <strong>Admin Control Panel</strong>.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Helper Icon Component
function Crown({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
    </svg>
  );
}
