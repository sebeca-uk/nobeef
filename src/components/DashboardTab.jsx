import React, { useState } from 'react';
import { ATHLETES_DATA, LOCKED_TEAMS, COMPETITION_DAYS } from '../data/seedData';
import { Flame, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Trash2, Shield, Info, Lock } from 'lucide-react';

export default function DashboardTab({ events, cardSubmissions, onSaveCard, onDeleteCard }) {
  const [selectedCoach, setSelectedCoach] = useState('');
  
  // Card Form Inputs
  const [mdAthlete, setMdAthlete] = useState('');
  const [mdDay, setMdDay] = useState(COMPETITION_DAYS[0]);

  const [ltEventId, setLtEventId] = useState(events[0]?.id || '');
  const [ltAthlete, setLtAthlete] = useState('');

  const [htEventId, setHtEventId] = useState(events[0]?.id || '');
  const [htTarget, setHtTarget] = useState('');
  const [htReplacement, setHtReplacement] = useState('');

  const currentTeam = LOCKED_TEAMS.find(t => t.coach === selectedCoach);

  const getAthletePrice = (name) => {
    const clean = name.replace('*', '').trim();
    const ath = ATHLETES_DATA.find(a => a.name.replace('*', '').trim() === clean);
    return ath ? ath.price : 0;
  };

  const getAthleteGender = (name) => {
    const clean = name.replace('*', '').trim();
    const ath = ATHLETES_DATA.find(a => a.name.replace('*', '').trim() === clean);
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
  const validReplacements = ATHLETES_DATA.filter(ath => {
    if (!currentTeam) return false;
    const isAlreadyInSquad = currentTeam.squad.includes(ath.name);
    return !isAlreadyInSquad && ath.price <= targetPrice;
  });

  const handleCoachSelect = (coachName) => {
    setSelectedCoach(coachName);
    const team = LOCKED_TEAMS.find(t => t.coach === coachName);
    if (team && team.squad.length > 0) {
      setMdAthlete(team.squad[0]);
      setLtAthlete(team.squad[0]);
      setHtTarget(team.squad[0]);
    }
  };

  const handleTargetChangeForHotTag = (targetName) => {
    setHtTarget(targetName);
    const price = getAthletePrice(targetName);
    const replacements = ATHLETES_DATA.filter(ath => {
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
    <div className="space-y-6">
      {/* Coach Profile Selector */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-amber-400" />
          <span>Select Coach Profile & View Roster</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Your Coach Name:
            </label>
            <select
              value={selectedCoach}
              onChange={(e) => handleCoachSelect(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-400 font-medium"
            >
              <option value="">-- Choose Your Coach Profile --</option>
              {LOCKED_TEAMS.map(t => (
                <option key={t.coach} value={t.coach}>
                  {t.coach} ({t.squad.length} Athletes)
                </option>
              ))}
            </select>
          </div>

          {currentTeam && (
            <div className="bg-sky-500/10 border border-sky-400/30 rounded-xl p-4 text-xs sm:text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sky-400 text-base">{currentTeam.coach} Squad</span>
                <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  Spent: £{totalSpent.toFixed(1)}m / £11.5m
                </span>
              </div>
              <div className="text-slate-300 mt-2 flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400 inline" />
                <span>Insurance Pick: <strong className="text-emerald-400">{currentTeam.ins}</strong> (£{getAthletePrice(currentTeam.ins)}m)</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentTeam.squad.map(ath => (
                  <span key={ath} className="bg-slate-900/80 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    {ath} <span className="text-amber-400 ml-1">£{getAthletePrice(ath)}m</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCoach && (
        <>
          {/* Rules Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs sm:text-sm text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>RX+ Power Card Rules & Constraints:</span>
            </div>
            <p className="text-slate-300">
              • <strong>Lovely Time Halved Rule:</strong> 100-pt events award <strong>+50 pts</strong>. 50-pt events award <strong>+25 pts</strong>.
            </p>
            <p className="text-slate-300">
              • <strong>No Card Stacking:</strong> You cannot play multiple Power Cards on the same athlete for the same event.
            </p>
            <p className="text-slate-300">
              • <strong>Hot Tag Limit:</strong> Replacement athlete must cost equal or less (£m) than the athlete swapped out.
            </p>
            <p className="text-slate-300">
              • <strong>Dynamic Event Locking:</strong> Card assignments lock automatically once an event start time passes.
            </p>
          </div>

          {/* Cards Assignment Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* MOVING DAY CARD */}
            <div className="glass-card rounded-2xl p-5 border border-rose-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-extrabold text-lg mb-1">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <span>Moving Day (1.5×)</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Multiplies one active athlete's points by 1.5× across an entire competition day.
                </p>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Active Athlete:</label>
                <select
                  value={mdAthlete}
                  onChange={(e) => setMdAthlete(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3"
                >
                  {currentTeam.squad.map(ath => (
                    <option key={ath} value={ath}>{ath} (£{getAthletePrice(ath)}m)</option>
                  ))}
                </select>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Competition Day:</label>
                <select
                  value={mdDay}
                  onChange={(e) => setMdDay(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4"
                >
                  {COMPETITION_DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => submitCard('MOVING_DAY')}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/20"
              >
                Save Moving Day Card
              </button>
            </div>

            {/* LOVELY TIME CARD */}
            <div className="glass-card rounded-2xl p-5 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg mb-1">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Lovely Time (+50 / +25)</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Guarantees points regardless of workout performance. Proportional to event cap.
                </p>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Event:</label>
                <select
                  value={ltEventId}
                  onChange={(e) => setLtEventId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-2"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.maxPoints} Pts)
                    </option>
                  ))}
                </select>

                <div className={`text-xs font-bold p-2 rounded-lg mb-3 ${isLovelyTime50Pt ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                  {isLovelyTime50Pt ? '⚠️ 50-Point Event Yields: +25 Guaranteed Pts' : '✨ 100-Point Event Yields: +50 Guaranteed Pts'}
                </div>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Active Athlete:</label>
                <select
                  value={ltAthlete}
                  onChange={(e) => setLtAthlete(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4"
                >
                  {currentTeam.squad.map(ath => (
                    <option key={ath} value={ath}>{ath} (£{getAthletePrice(ath)}m)</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => submitCard('LOVELY_TIME')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                Save Lovely Time Card
              </button>
            </div>

            {/* HOT TAG CARD */}
            <div className="glass-card rounded-2xl p-5 border border-sky-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-400 font-extrabold text-lg mb-1">
                  <RefreshCw className="w-5 h-5 text-sky-400" />
                  <span>Hot Tag (1-Event Swap)</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Temporarily swap an active athlete for an unpicked athlete of equal or lesser £ value.
                </p>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Event:</label>
                <select
                  value={htEventId}
                  onChange={(e) => setHtEventId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.maxPoints} Pts)
                    </option>
                  ))}
                </select>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Swap OUT (Active):</label>
                <select
                  value={htTarget}
                  onChange={(e) => handleTargetChangeForHotTag(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3"
                >
                  {currentTeam.squad.map(ath => (
                    <option key={ath} value={ath}>{ath} (£{getAthletePrice(ath)}m)</option>
                  ))}
                </select>

                <label className="block text-xs font-semibold text-slate-300 mb-1">Replacement IN (≤ £{targetPrice}m):</label>
                <select
                  value={htReplacement}
                  onChange={(e) => setHtReplacement(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4"
                >
                  {validReplacements.map(ath => (
                    <option key={ath.name} value={ath.name}>
                      {ath.name} (£{ath.price}m - {ath.gender})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => submitCard('HOT_TAG')}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-sky-500/20"
              >
                Save Hot Tag Card
              </button>
            </div>

          </div>

          {/* Active Cards Table */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Your Active Power Card Assignments</span>
            </h3>

            {coachCards.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-xl">
                No Power Cards assigned yet. Make your selections using the cards above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Card Type</th>
                      <th className="py-3 px-4">Target Event / Day</th>
                      <th className="py-3 px-4">Athlete Assigned</th>
                      <th className="py-3 px-4">Replacement (Hot Tag)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {coachCards.map((c, i) => {
                      let isLocked = false;
                      if (c.eventId) {
                        const evt = events.find(e => e.id === c.eventId);
                        if (evt && new Date() >= new Date(evt.startTime)) isLocked = true;
                      }

                      return (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-amber-400">
                            {c.cardType.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{c.targetEventOrDay}</td>
                          <td className="py-3 px-4 font-semibold text-white">{c.targetAthlete}</td>
                          <td className="py-3 px-4 text-sky-400 font-semibold">
                            {c.replacementAthlete || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                <Lock className="w-3 h-3" /> LOCKED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
