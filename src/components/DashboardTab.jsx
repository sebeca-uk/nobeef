import React, { useState } from 'react';
import { useLeague, getAthletePrice as getAthletePriceHelper } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import { Flame, Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Trash2, Shield, Info, Lock, ClipboardList, Zap, Award } from 'lucide-react';

export default function DashboardTab({ 
  events, 
  cardSubmissions, 
  onSaveCard, 
  onDeleteCard,
  paid2Coaches = [],
  paid5Coaches = []
}) {
  const league = useLeague();
  const { user } = useAuth();
  const [selectedCoach, setSelectedCoach] = useState('');
  
  // Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [newCoachName, setNewCoachName] = useState('');
  const [newCoachPassword, setNewCoachPassword] = useState('');
  const [draftSquad, setDraftSquad] = useState([]);
  const [draftIns, setDraftIns] = useState('');

  // Lock Screen States
  const [coachPasswordInput, setCoachPasswordInput] = useState('');
  const [unlockedCoaches, setUnlockedCoaches] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`nobeef_${league.id}_unlocked_coaches`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Card Form Inputs
  const [mdAthlete, setMdAthlete] = useState('');
  const [mdDay, setMdDay] = useState(league.competitionDays[0]);

  const [ltEventId, setLtEventId] = useState(events[0]?.id || '');
  const [ltAthlete, setLtAthlete] = useState('');

  const [htEventId, setHtEventId] = useState(events[0]?.id || '');
  const [htTarget, setHtTarget] = useState('');
  const [htReplacement, setHtReplacement] = useState('');

  const [ttEventId, setTtEventId] = useState(events[0]?.id || '');
  const [ttAthlete, setTtAthlete] = useState('');

  const [snEventId, setSnEventId] = useState(events[0]?.id || '');
  const [snAthlete, setSnAthlete] = useState('');

  const [udEventId, setUdEventId] = useState(events[0]?.id || '');
  const [udAthlete, setUdAthlete] = useState('');

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

  const draftSpent = draftSquad.reduce((sum, name) => sum + getAthletePrice(name), 0);
  const isUnlocked = checkIsUnlocked(currentTeam);

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
    setIsRegistering(false);
    const team = league.lockedTeams.find(t => t.coach === coachName);
    if (team && team.squad.length > 0) {
      setMdAthlete(team.squad[0]);
      setLtAthlete(team.squad[0]);
      setHtTarget(team.squad[0]);
      setTtAthlete(team.squad[0]);
      setSnAthlete(team.squad[0]);
      setUdAthlete(team.squad[0]);
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

  const handleToggleDraftAthlete = (athName) => {
    setDraftSquad(prev => {
      if (prev.includes(athName)) {
        return prev.filter(name => name !== athName);
      }
      if (prev.length >= (league.rules.rosterMax || 5)) {
        alert(`You can select a maximum of ${league.rules.rosterMax || 5} athletes!`);
        return prev;
      }
      return [...prev, athName];
    });
  };

  const checkIsUnlocked = (team) => {
    if (!team) return false;
    if (team.ownerId && user && team.ownerId === user.uid) return true;
    if (team.ownerEmail && user && team.ownerEmail.toLowerCase() === user.email.toLowerCase()) return true;
    if (!team.ownerId && !team.password) return true;
    if (team.password && unlockedCoaches[team.coach] === team.password) return true;
    return false;
  };

  const handlePasswordUnlock = (e) => {
    e.preventDefault();
    if (!currentTeam) return;
    if (coachPasswordInput === currentTeam.password) {
      const updated = { ...unlockedCoaches, [currentTeam.coach]: currentTeam.password };
      setUnlockedCoaches(updated);
      sessionStorage.setItem(`nobeef_${league.id}_unlocked_coaches`, JSON.stringify(updated));
      setCoachPasswordInput('');
    } else {
      alert('⛔ Incorrect Coach Password!');
    }
  };

  const handleRegisterCoach = (e) => {
    e.preventDefault();
    if (!newCoachName.trim()) return alert('Please enter a Coach Name!');
    if (league.lockedTeams.some(t => t.coach.toLowerCase() === newCoachName.trim().toLowerCase())) {
      return alert('A coach with this name already exists in the league!');
    }
    const squadMin = league.rules.rosterMin || 3;
    const squadMax = league.rules.rosterMax || 5;
    if (draftSquad.length < squadMin || draftSquad.length > squadMax) {
      return alert(`Your squad must have between ${squadMin} and ${squadMax} athletes!`);
    }
    if (draftSpent > (league.rules.salaryCap || 11.5)) {
      return alert(`Your squad exceeds the Salary Cap of £${league.rules.salaryCap || 11.5}m!`);
    }
    if (!draftIns) {
      return alert('Please select an Insurance Athlete!');
    }
    if (draftSquad.includes(draftIns)) {
      return alert('Your Insurance Athlete cannot also be in your active squad!');
    }
    const insCost = getAthletePrice(draftIns);
    if (insCost > (league.rules.insuranceMaxPrice || 2.0)) {
      return alert(`Your Insurance Athlete must cost ≤ £${league.rules.insuranceMaxPrice || 2.0}m!`);
    }
    if (!user && !newCoachPassword.trim()) {
      return alert('You must enter a Coach Password when registering without an account!');
    }

    const newTeam = {
      coach: newCoachName.trim(),
      squad: draftSquad,
      ins: draftIns,
      ownerId: user ? user.uid : null,
      ownerEmail: user ? user.email : null,
      password: !user ? newCoachPassword : null
    };

    if (typeof league.updateLeagueTeams === 'function') {
      league.updateLeagueTeams([...league.lockedTeams, newTeam]);
      alert('🎉 Roster successfully submitted and locked!');
      setSelectedCoach(newTeam.coach);
      setIsRegistering(false);
      // Reset form
      setNewCoachName('');
      setNewCoachPassword('');
      setDraftSquad([]);
      setDraftIns('');
    } else {
      alert('Error: updateLeagueTeams is not available in context.');
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
    } else if (cardType === 'TRIPLE_THREAT') {
      if (!ttEventId || !ttAthlete) return alert('Please select target event and athlete for Triple Threat!');
      eventId = ttEventId;
      const evt = events.find(e => e.id === eventId);
      targetEventOrDay = evt ? evt.name : eventId;
      targetAthlete = ttAthlete;

      // Lock check
      if (evt && new Date() >= new Date(evt.startTime)) {
        return alert(`🔒 LOCKED! Event "${evt.name}" has already begun.`);
      }
    } else if (cardType === 'SAFETY_NET') {
      if (!snEventId || !snAthlete) return alert('Please select target event and athlete for Safety Net!');
      eventId = snEventId;
      const evt = events.find(e => e.id === eventId);
      targetEventOrDay = evt ? evt.name : eventId;
      targetAthlete = snAthlete;

      // Lock check
      if (evt && new Date() >= new Date(evt.startTime)) {
        return alert(`🔒 LOCKED! Event "${evt.name}" has already begun.`);
      }
    } else if (cardType === 'UNDERDOG') {
      if (!udEventId || !udAthlete) return alert('Please select target event and athlete for Underdog!');
      eventId = udEventId;
      const evt = events.find(e => e.id === eventId);
      targetEventOrDay = evt ? evt.name : eventId;
      targetAthlete = udAthlete;

      // Lock check
      if (evt && new Date() >= new Date(evt.startTime)) {
        return alert(`🔒 LOCKED! Event "${evt.name}" has already begun.`);
      }

      // Check price eligibility
      const athletePrice = getAthletePrice(udAthlete);
      if (athletePrice > (league.rules.insuranceMaxPrice || 2.0)) {
        return alert(`⚠️ ELIGIBILITY ERROR: Athlete must cost ≤ ${league.rules.currency}${league.rules.insuranceMaxPrice || 2.0}m to be eligible for Underdog!`);
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Your Coach Name:
              </label>
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setSelectedCoach('');
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase underline"
              >
                {isRegistering ? 'Cancel Registration' : 'Register New Coach'}
              </button>
            </div>
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

      {isRegistering && (
        <form onSubmit={handleRegisterCoach} className="glass-card rounded-2xl p-5 border border-indigo-500/30 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Draft Your Fantasy Roster</h3>
            <p className="text-xs text-slate-400 mt-1">Select your team athletes and register your coach name to join the league.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coach Name:</label>
              <input
                type="text"
                placeholder="e.g. Clo"
                value={newCoachName}
                onChange={(e) => setNewCoachName(e.target.value)}
                className="w-full bg-[#121316] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Insurance Athlete (≤ {league.rules.currency}{league.rules.insuranceMaxPrice || 2.0}m):
              </label>
              <select
                value={draftIns}
                onChange={(e) => setDraftIns(e.target.value)}
                className="w-full bg-[#121316] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                required
              >
                <option value="">-- Select Insurance Athlete --</option>
                {league.athletes
                  .filter(a => a.price <= (league.rules.insuranceMaxPrice || 2.0) && !draftSquad.includes(a.name))
                  .map(a => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({league.rules.currency}{a.price}m - {a.gender})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="sm:col-span-2">
              {user ? (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Profile Ownership</span>
                  <span className="text-emerald-400 font-bold">🛡️ Auto-Linking to account: {user.email} (No password needed)</span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Profile Password (Option A):
                  </label>
                  <input
                    type="password"
                    placeholder="Enter a password to protect your coach dashboard"
                    value={newCoachPassword}
                    onChange={(e) => setNewCoachPassword(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Or sign in (Option B) via the header to link this roster to your Google/Email account automatically.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center text-xs font-bold">
            <div>
              <span className="text-slate-400 block uppercase text-[10px]">Salary Budget Spent</span>
              <span className={`text-base font-mono ${draftSpent > (league.rules.salaryCap || 11.5) ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`}>
                {league.rules.currency}{draftSpent.toFixed(1)}m / {league.rules.currency}{league.rules.salaryCap || 11.5}m
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block uppercase text-[10px]">Roster Slots</span>
              <span className="text-base text-white font-mono">
                {draftSquad.length} / {league.rules.rosterMax || 5}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select Squad Athletes ({league.rules.rosterMin || 3} - {league.rules.rosterMax || 5} required):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-2">
              {league.athletes.map(a => {
                const isSelected = draftSquad.includes(a.name);
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => handleToggleDraftAthlete(a.name)}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500/80 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-xs sm:text-sm block text-white">{a.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{a.gender} • {a.rank}</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-indigo-400">
                      {league.rules.currency}{a.price}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            Submit & Lock Roster
          </button>
        </form>
      )}

      {selectedCoach && !isUnlocked && (
        <div className="max-w-md mx-auto my-12 glass-card rounded-2xl p-6 border border-rose-500/30 text-center shadow-2xl space-y-6">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-450">
            <Lock className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-wider">Coach Profile Locked</h3>
            {currentTeam.ownerEmail ? (
              <p className="text-xs text-slate-400 mt-2">
                This coach profile is linked to <strong className="text-slate-200">{currentTeam.ownerEmail}</strong>. 
                Please sign in with that Google/Email account via the header to access this dashboard.
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-2 font-medium">
                This coach profile is password-protected. Enter the profile password to manage rosters and play cards.
              </p>
            )}
          </div>

          {!currentTeam.ownerEmail && (
            <form onSubmit={handlePasswordUnlock} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Coach Password"
                value={coachPasswordInput}
                onChange={(e) => setCoachPasswordInput(e.target.value)}
                className="w-full bg-[#121316] border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-sm focus:outline-none focus:border-indigo-550 font-mono"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3 rounded-xl text-sm transition-all uppercase tracking-wider shadow-lg shadow-indigo-500/20"
              >
                Unlock Dashboard
              </button>
            </form>
          )}
        </div>
      )}

      {selectedCoach && isUnlocked && (
        <>
          {/* Cards Assignment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* MOVING DAY CARD */}
            {league.rules.powerCards?.includes('MOVING_DAY') && (
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
            )}

            {/* LOVELY TIME CARD */}
            {league.rules.powerCards?.includes('LOVELY_TIME') && (
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
            )}

            {/* HOT TAG CARD */}
            {league.rules.powerCards?.includes('HOT_TAG') && (
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
            )}

            {/* TRIPLE THREAT CARD */}
            {league.rules.powerCards?.includes('TRIPLE_THREAT') && (
              <div className="glass-card rounded-2xl p-5 border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xl mb-1 uppercase">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Triple Threat (3× Multiplier)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Triples one active athlete's points for a single selected event.
                  </p>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Target Event:</label>
                  <select
                    value={ttEventId}
                    onChange={(e) => setTtEventId(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3 font-medium"
                  >
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name} ({evt.maxPoints} Pts)
                      </option>
                    ))}
                  </select>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Target Active Athlete:</label>
                  <select
                    value={ttAthlete}
                    onChange={(e) => setTtAthlete(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4 font-medium"
                  >
                    {currentTeam.squad.map(ath => (
                      <option key={ath} value={ath}>{ath} ({league.rules.currency}{getAthletePrice(ath)}m)</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => submitCard('TRIPLE_THREAT')}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 uppercase tracking-wider border border-amber-500/40"
                >
                  Save Triple Threat Card
                </button>
              </div>
            )}

            {/* SAFETY NET CARD */}
            {league.rules.powerCards?.includes('SAFETY_NET') && (
              <div className="glass-card rounded-2xl p-5 border border-rose-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xl mb-1 uppercase">
                    <Shield className="w-5 h-5 text-rose-400" />
                    <span>Safety Net (Zero Protection)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Protects your athlete for a single event. If they score 0 points (DNF/DNS), they receive the score of your Insurance Athlete.
                  </p>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Target Event:</label>
                  <select
                    value={snEventId}
                    onChange={(e) => setSnEventId(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3 font-medium"
                  >
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name} ({evt.maxPoints} Pts)
                      </option>
                    ))}
                  </select>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Target Active Athlete:</label>
                  <select
                    value={snAthlete}
                    onChange={(e) => setSnAthlete(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4 font-medium"
                  >
                    {currentTeam.squad.map(ath => (
                      <option key={ath} value={ath}>{ath} ({league.rules.currency}{getAthletePrice(ath)}m)</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => submitCard('SAFETY_NET')}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-rose-500/25 uppercase tracking-wider border border-rose-500/40"
                >
                  Save Safety Net Card
                </button>
              </div>
            )}

            {/* UNDERDOG CARD */}
            {league.rules.powerCards?.includes('UNDERDOG') && (
              <div className="glass-card rounded-2xl p-5 border border-orange-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 font-extrabold text-xl mb-1 uppercase">
                    <Award className="w-5 h-5 text-orange-400" />
                    <span>Underdog (Double cheap)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Double points for a single event if the athlete's value is ≤ {league.rules.currency}{league.rules.insuranceMaxPrice || 2.0}m.
                  </p>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Target Event:</label>
                  <select
                    value={udEventId}
                    onChange={(e) => setUdEventId(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-3 font-medium"
                  >
                    {events.map(evt => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name} ({evt.maxPoints} Pts)
                      </option>
                    ))}
                  </select>

                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Target Active Athlete (≤ {league.rules.currency}{league.rules.insuranceMaxPrice || 2.0}m):</label>
                  <select
                    value={udAthlete}
                    onChange={(e) => setUdAthlete(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-700 rounded-lg p-2.5 text-white text-xs sm:text-sm mb-4 font-medium"
                  >
                    {currentTeam.squad.map(ath => {
                      const price = getAthletePrice(ath);
                      const isEligible = price <= (league.rules.insuranceMaxPrice || 2.0);
                      return (
                        <option key={ath} value={ath} disabled={!isEligible}>
                          {ath} ({league.rules.currency}{price}m) {!isEligible && '(Ineligible)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() => submitCard('UNDERDOG')}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25 uppercase tracking-wider border border-orange-500/40"
                >
                  Save Underdog Card
                </button>
              </div>
            )}

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
