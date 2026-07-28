import React, { useState } from 'react';
import { useLeague, getAthletePrice as getAthletePriceHelper } from '../context/LeagueContext';
import { Flame, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Trash2, Shield, Info, Lock, ClipboardList } from 'lucide-react';

export default function DashboardTab({ 
  events, 
  cardSubmissions, 
  onSaveCard, 
  onDeleteCard,
  paid2Coaches = [],
  paid5Coaches = []
}) {
  const league = useLeague();
  const [selectedCoach, setSelectedCoach] = useState('');
  
  // Card Form Inputs
  const [mdAthlete, setMdAthlete] = useState('');
  const [mdDay, setMdDay] = useState(league.competitionDays[0]);

  const [ltEventId, setLtEventId] = useState(events[0]?.id || '');
  const [ltAthlete, setLtAthlete] = useState('');

  const [htEventId, setHtEventId] = useState(events[0]?.id || '');
  const [htTarget, setHtTarget] = useState('');
  const [htReplacement, setHtReplacement] = useState('');

  const currentTeam = league.lockedTeams.find(t => t.coach === selectedCoach);

  const getAthletePrice = (name) => {
    const clean = name.replace('*', '').trim();
    const ath = league.athletes.find(a => a.name.replace('*', '').trim() === clean);
    return ath ? ath.price : 0;
  };

  const getAthleteGender = (name) => {
    const clean = name.replace('*', '').trim();
    const ath = league.athletes.find(a => a.name.replace('*', '').trim() === clean);
    return ath ? ath.gender : '';
  };

  const totalSpent = currentTeam
    ? currentTeam.squad.reduce((sum, ath) => sum + getAthletePrice(ath), 0)
    : 0;

  // Selected event for Lovely Time preview
  const selectedLtEvt = events.find(e => e.id === ltEventId) || events[0];
  const isLovelyTime50Pt = selectedLtEvt?.maxPoints === 50;

  // Filter valid Hot Tag replacement options (equal or lesser price, not in coach's squad)
  const targetPrice = htTarget ? getAthletePrice(htTarget) : 0;
  const validReplacements = league.athletes.filter(ath => {
    if (!currentTeam) return false;
    const isAlreadyInSquad = currentTeam.squad.includes(ath.name);
    return !isAlreadyInSquad && ath.price <= targetPrice;
  });

  const handleCoachSelect = (coachName) => {
    setSelectedCoach(coachName);
    const team = league.lockedTeams.find(t => t.coach === coachName);
    if (team && team.squad.length > 0) {
      setMdAthlete(team.squad[0]);
      setLtAthlete(team.squad[0]);
      setHtTarget(team.squad[0]);
    }
  };

  const handleTargetChangeForHotTag = (targetName) => {
    setHtTarget(targetName);
    const price = getAthletePrice(targetName);
    const replacements = league.athletes.filter(ath => {
      if (!currentTeam) return false;
      return !currentTeam.squad.includes(ath.name) && ath.price <= price;
    });
    if (replacements.length > 0) {
      setHtReplacement(replacements[0].name);
    } else {
      setHtReplacement('');
    }
  };

  const submitCard = (cardType) => {
    if (!selectedCoach) return alert('Please select a Coach profile first!');

    let targetEventOrDay = '';
    let targetAthlete = '';
    let replacementAthlete = null;
    let eventId = null;

    if (cardType === 'MOVING_DAY') {
      if (!mdAthlete || !mdDay) return alert('Please select target athlete and day for Moving Day!');
      targetAthlete = mdAthlete;
      targetEventOrDay = mdDay;
    } else if (cardType === 'LOVELY_TIME') {
      if (!ltEventId || !ltAthlete) return alert('Please select target event and athlete for Lovely Time!');
      eventId = ltEventId;
      const evt = events.find(e => e.id === eventId);
      targetEventOrDay = evt ? evt.name : eventId;
      targetAthlete = ltAthlete;

      // Lock check
      if (evt && new Date() >= new Date(evt.startTime)) {
        return alert(`🔒 LOCKED! Event "${evt.name}" has already begun.`);
      }
    } else if (cardType === 'HOT_TAG') {
      if (!htEventId || !htTarget || !htReplacement) return alert('Please select event, swap-out athlete, and replacement athlete!');
      eventId = htEventId;
      const evt = events.find(e => e.id === eventId);
      targetEventOrDay = evt ? evt.name : eventId;
      targetAthlete = htTarget;
      replacementAthlete = htReplacement;

      // Lock check
      if (evt && new Date() >= new Date(evt.startTime)) {
        return alert(`🔒 LOCKED! Event "${evt.name}" has already begun.`);
      }
    }

    // Anti-stacking check
    const isStacked = cardSubmissions.some(sub => 
      sub.coach === selectedCoach &&
      sub.cardType !== cardType &&
      sub.targetAthlete === targetAthlete &&
      sub.targetEventOrDay === targetEventOrDay
    );

    if (isStacked) {
      return alert(`⚠️ ANTI-STACKING RULE VIOLATION: You cannot play multiple Power Cards on ${targetAthlete} for the same event!`);
    }

    onSaveCard({
      coach: selectedCoach,
      cardType,
      targetEventOrDay,
      targetAthlete,
      replacementAthlete,
      eventId
    });
  };

  const coachCards = cardSubmissions.filter(c => c.coach === selectedCoach);

  return (
    <div className="space-y-6 font-sans">
      {/* Coach Profile Selector */}
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          <span>Select Coach Profile & View Roster</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Your Coach Name:
            </label>
            <select
              value={selectedCoach}
              onChange={(e) => handleCoachSelect(e.target.value)}
              className="w-full bg-[#121316]/90 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="">-- Choose Your Coach Profile --</option>
              {league.lockedTeams.map(t => (
                <option key={t.coach} value={t.coach}>
                  {t.coach} ({t.squad.length} Athletes)
                </option>
              ))}
            </select>
          </div>

          {currentTeam && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-white text-base uppercase">{currentTeam.coach} Squad</span>
                <span className="text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-400/30 font-mono">
                  Spent: {league.rules.currency}{totalSpent.toFixed(1)}m / {league.rules.currency}{league.rules.salaryCap}m
                </span>
              </div>
              <div className="text-slate-300 mt-2 flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400 inline" />
                <span>Insurance Pick: <strong className="text-emerald-400">{currentTeam.ins}</strong> ({league.rules.currency}{getAthletePrice(currentTeam.ins)}m)</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Leagues:</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                  🏆 Free
                </span>
                {paid2Coaches.includes(currentTeam.coach) && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wide font-mono">
                    🥈 {league.rules.currency}{league.leagueTiers.paid_tier_1.price} League
                  </span>
                )}
                {paid5Coaches.includes(currentTeam.coach) && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide font-mono">
                    🥇 {league.rules.currency}{league.leagueTiers.paid_tier_2.price} League
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentTeam.squad.map(ath => (
                  <span key={ath} className="bg-slate-900/90 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    {ath} <span className="text-indigo-400 font-mono ml-1">{league.rules.currency}{getAthletePrice(ath)}m</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCoach && (
        <>
          {/* Cards Assignment Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* MOVING DAY CARD */}
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xl mb-1 uppercase">
                  <Flame className="w-5 h-5 text-indigo-400" />
                  <span>Moving Day ({league.rules.movingDayMultiplier}×)</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Multiplies one active athlete's points by {league.rules.movingDayMultiplier}× across an entire competition day.
                </p>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Target Active Athlete:</label>
                <select
                  value={mdAthlete}
                  onChange={(e) => setMdAthlete(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3 font-medium"
                >
                  {currentTeam.squad.map(ath => (
                    <option key={ath} value={ath}>{ath} ({league.rules.currency}{getAthletePrice(ath)}m)</option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Competition Day:</label>
                <select
                  value={mdDay}
                  onChange={(e) => setMdDay(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4 font-medium"
                >
                  {league.competitionDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => submitCard('MOVING_DAY')}
                className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/25 uppercase tracking-wider"
              >
                Save Moving Day Card
              </button>
            </div>

            {/* LOVELY TIME CARD */}
            <div className="glass-card rounded-2xl p-5 border border-purple-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xl mb-1 uppercase">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Lovely Time (+{league.rules.lovelyTimeBonus100} / +{league.rules.lovelyTimeBonus50})</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Guarantees points regardless of workout performance. Proportional to event cap.
                </p>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Target Event:</label>
                <select
                  value={ltEventId}
                  onChange={(e) => setLtEventId(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-2 font-medium"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.maxPoints} Pts)
                    </option>
                  ))}
                </select>

                <div className={`text-xs font-bold p-2 rounded-lg mb-3 ${isLovelyTime50Pt ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                  {isLovelyTime50Pt ? `⚠️ 50-Point Event Yields: +${league.rules.lovelyTimeBonus50} Guaranteed Pts` : `✨ 100-Point Event Yields: +${league.rules.lovelyTimeBonus100} Guaranteed Pts`}
                </div>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Target Active Athlete:</label>
                <select
                  value={ltAthlete}
                  onChange={(e) => setLtAthlete(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4 font-medium"
                >
                  {currentTeam.squad.map(ath => (
                    <option key={ath} value={ath}>{ath} ({league.rules.currency}{getAthletePrice(ath)}m)</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => submitCard('LOVELY_TIME')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm border border-purple-500/40 transition-all uppercase tracking-wider shadow-lg shadow-purple-500/25"
              >
                Save Lovely Time Card
              </button>
            </div>

            {/* HOT TAG CARD */}
            <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xl mb-1 uppercase">
                  <RefreshCw className="w-5 h-5 text-cyan-400" />
                  <span>Hot Tag (1-Event Swap)</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Temporarily swap an active athlete for an unpicked athlete of equal or lesser {league.rules.currency} value.
                </p>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Target Event:</label>
                <select
                  value={htEventId}
                  onChange={(e) => setHtEventId(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3 font-medium"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.maxPoints} Pts)
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Swap OUT (Active):</label>
                <select
                  value={htTarget}
                  onChange={(e) => handleTargetChangeForHotTag(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3 font-medium"
                >
                  {currentTeam.squad.map(ath => (
                    <option key={ath} value={ath}>{ath} ({league.rules.currency}{getAthletePrice(ath)}m)</option>
                  ))}
                </select>

                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Replacement IN (≤ {league.rules.currency}{targetPrice}m):</label>
                <select
                  value={htReplacement}
                  onChange={(e) => setHtReplacement(e.target.value)}
                  className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4 font-medium"
                >
                  {validReplacements.map(ath => (
                    <option key={ath.name} value={ath.name}>
                      {ath.name} ({league.rules.currency}{ath.price}m - {ath.gender})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => submitCard('HOT_TAG')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 uppercase tracking-wider"
              >
                Save Hot Tag Card
              </button>
            </div>

          </div>

          {/* Active Cards Table */}
          <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
            <h3 className="font-display text-lg font-extrabold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>Your Active Power Card Assignments</span>
            </h3>

            {coachCards.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm italic border border-dashed border-slate-800 rounded-xl">
                No Power Cards assigned yet. Make your selections using the cards above!
              </div>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Card Type</th>
                        <th className="py-3 px-4">Target Event / Day</th>
                        <th className="py-3 px-4">Athlete Assigned</th>
                        <th className="py-3 px-4">Replacement (Hot Tag)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm font-medium">
                      {coachCards.map((c, i) => {
                        let isLocked = false;
                        if (c.eventId) {
                          const evt = events.find(e => e.id === c.eventId);
                          if (evt && new Date() >= new Date(evt.startTime)) isLocked = true;
                        }

                        return (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-white uppercase">
                              {c.cardType.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{c.targetEventOrDay}</td>
                            <td className="py-3 px-4 font-semibold text-white">{c.targetAthlete}</td>
                            <td className="py-3 px-4 text-cyan-400 font-semibold">
                              {c.replacementAthlete || 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {isLocked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                                  <Lock className="w-3 h-3" /> LOCKED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                                  🟢 OPEN
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {!isLocked && (
                                <button
                                  onClick={() => onDeleteCard(c.coach, c.cardType)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/30 transition-all"
                                  title="Remove Card"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: one card per assignment */}
                <div className="md:hidden space-y-3">
                  {coachCards.map((c, i) => {
                    let isLocked = false;
                    if (c.eventId) {
                      const evt = events.find(e => e.id === c.eventId);
                      if (evt && new Date() >= new Date(evt.startTime)) isLocked = true;
                    }

                    return (
                      <div key={i} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm uppercase">{c.cardType.replace('_', ' ')}</span>
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                              <Lock className="w-3 h-3" /> LOCKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                              🟢 OPEN
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-300 space-y-1">
                          <div>Event / Day: <span className="text-white font-semibold">{c.targetEventOrDay}</span></div>
                          <div>Athlete: <span className="text-white font-semibold">{c.targetAthlete}</span></div>
                          {c.replacementAthlete && (
                            <div>Replacement: <span className="text-cyan-400 font-semibold">{c.replacementAthlete}</span></div>
                          )}
                        </div>
                        {!isLocked && (
                          <button
                            onClick={() => onDeleteCard(c.coach, c.cardType)}
                            className="w-full mt-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/30 transition-all text-xs font-bold uppercase"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Card
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
