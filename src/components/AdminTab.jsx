import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { 
  Shield, Key, Calendar, Award, Save, Lock, AlertCircle, 
  CheckCircle2, UserX, DollarSign, Search, Users, AlertTriangle 
} from 'lucide-react';

export default function AdminTab({
  events,
  scores,
  withdrawals,
  paid2Coaches = [],
  paid5Coaches = [],
  onSaveSchedule,
  onSaveScores,
  onSaveWithdrawals,
  onSavePaid2Coaches,
  onSavePaid5Coaches
}) {
  const league = useLeague();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('schedule');

  // Sub-Tab 1: Schedule Editor State
  const [selectedEditEvtId, setSelectedEditEvtId] = useState(events[0]?.id || '');
  const selectedEditEvt = events.find(e => e.id === selectedEditEvtId) || events[0];

  const [editPoints, setEditPoints] = useState(selectedEditEvt?.maxPoints || 100);
  const [editDay, setEditDay] = useState(selectedEditEvt?.day || league.competitionDays[0]);
  const [editTime, setEditTime] = useState(selectedEditEvt?.startTime || '2026-07-22T09:00');

  // Sub-Tab 2: Batch Scoring State
  const [selectedScoreEvtId, setSelectedScoreEvtId] = useState(events[0]?.id || '');
  const selectedScoreEvt = events.find(e => e.id === selectedScoreEvtId) || events[0];
  const currentMaxPoints = selectedScoreEvt?.maxPoints || 100;

  const [batchScoreInputs, setBatchScoreInputs] = useState(() => {
    const map = {};
    league.athletes.forEach(a => {
      const existing = scores.find(s => s.eventId === events[0]?.id && s.athlete === a.name);
      map[a.name] = existing ? String(existing.points) : '';
    });
    return map;
  });

  // Sub-Tab 3: Withdrawal State
  const [withdrawalAthlete, setWithdrawalAthlete] = useState(league.athletes[0]?.name || '');
  const [withdrawalEventId, setWithdrawalEventId] = useState(events[0]?.id || '');

  // Sub-Tab 4: Leagues & Payments State
  const [coachSearchTerm, setCoachSearchTerm] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const expectedAdminPw = league.adminPassword;
    if (passwordInput.toLowerCase() === expectedAdminPw) {
      setIsAdminLoggedIn(true);
    } else {
      alert('⛔ Incorrect Admin Password!');
    }
  };

  const handleSelectEventToEdit = (evtId) => {
    setSelectedEditEvtId(evtId);
    const evt = events.find(e => e.id === evtId);
    if (evt) {
      setEditPoints(evt.maxPoints);
      setEditDay(evt.day);
      let formatted = evt.startTime;
      if (formatted.length > 16) formatted = formatted.slice(0, 16);
      setEditTime(formatted);
    }
  };

  const handleSaveScheduleUpdates = () => {
    if (!editTime) return alert('Please enter a valid official start time!');
    onSaveSchedule(selectedEditEvtId, {
      maxPoints: Number(editPoints),
      day: editDay,
      startTime: editTime
    });
    alert(`✅ Schedule updated successfully for "${selectedEditEvt.name}"!`);
  };

  const handleSelectEventToScore = (evtId) => {
    setSelectedScoreEvtId(evtId);
    const map = {};
    league.athletes.forEach(a => {
      const existing = scores.find(s => s.eventId === evtId && s.athlete === a.name);
      map[a.name] = existing ? String(existing.points) : '';
    });
    setBatchScoreInputs(map);
  };

  const handleScoreInputChange = (athleteName, val) => {
    setBatchScoreInputs(prev => ({
      ...prev,
      [athleteName]: val
    }));
  };

  const handleSaveAllBatchScores = () => {
    const newScoresList = [...scores.filter(s => s.eventId !== selectedScoreEvtId)];
    
    Object.entries(batchScoreInputs).forEach(([athlete, pointsStr]) => {
      if (pointsStr !== '' && !isNaN(pointsStr)) {
        newScoresList.push({
          eventId: selectedScoreEvtId,
          athlete,
          points: Number(pointsStr)
        });
      }
    });

    onSaveScores(newScoresList);
    const selectedEvtName = events.find(e => e.id === selectedScoreEvtId)?.name;
    alert(`💾 All official batch scores saved for "${selectedEvtName}"! Leaderboard updated.`);
  };

  const handleAddWithdrawal = () => {
    if (!withdrawalAthlete || !withdrawalEventId) return alert('Select athlete and event!');
    onSaveWithdrawals({
      athlete: withdrawalAthlete,
      fromEventId: withdrawalEventId,
      timestamp: new Date().toISOString()
    });
    alert(`🚑 Official withdrawal logged for ${withdrawalAthlete}. Insurance policy activated!`);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 glass-card rounded-2xl p-6 border border-indigo-500/30 text-center shadow-2xl font-sans">
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
          <Key className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-white mb-2 uppercase tracking-wider">Admin Control Portal</h2>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          Enter Admin Password to access schedule editors, batch scoring, and insurance withdrawal managers.
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-[#121316] border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-sm focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 uppercase tracking-wider"
          >
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="font-display text-xl font-extrabold text-white uppercase tracking-wider">Admin Authorized Control Panel</h2>
              <span className="text-xs text-indigo-300 font-bold uppercase">Logged in as Administrator</span>
            </div>
          </div>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition-all uppercase"
          >
            Lock Panel
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setAdminSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all uppercase tracking-wider ${
              adminSubTab === 'schedule'
                ? 'bg-[#e8462f] text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Schedule & Lock Times
          </button>
          
          <button
            onClick={() => setAdminSubTab('scoring')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all uppercase tracking-wider ${
              adminSubTab === 'scoring'
                ? 'bg-[#e8462f] text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Batch Athlete Scoring Table
          </button>

          <button
            onClick={() => setAdminSubTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all uppercase tracking-wider ${
              adminSubTab === 'withdrawals'
                ? 'bg-[#e8462f] text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <UserX className="w-4 h-4" /> Injury Withdrawals
          </button>

          <button
            onClick={() => setAdminSubTab('leagues')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all uppercase tracking-wider ${
              adminSubTab === 'leagues'
                ? 'bg-[#e8462f] text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Leagues & Buy-Ins
          </button>
        </div>

        {/* SUB TAB 1: SCHEDULE EDITOR */}
        {adminSubTab === 'schedule' && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-indigo-400" /> Edit Event Schedule & Lock Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Event to Edit:</label>
              <select
                value={selectedEditEvtId}
                onChange={(e) => handleSelectEventToEdit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.maxPoints} Pts) - {evt.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Max Point Cap (Scales Lovely Time +{league.rules.lovelyTimeBonus100} vs +{league.rules.lovelyTimeBonus50} pts):
              </label>
              <select
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                <option value={100}>100 Points (Lovely Time awards +{league.rules.lovelyTimeBonus100} pts)</option>
                <option value={50}>50 Points (Lovely Time awards +{league.rules.lovelyTimeBonus50} pts halved)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Competition Day:</label>
              <select
                value={editDay}
                onChange={(e) => setEditDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {league.competitionDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Official Start Time (Locks Card Edits Automatically):</label>
              <input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-mono"
              />
            </div>

            <button
              onClick={handleSaveScheduleUpdates}
              className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3 rounded-xl text-sm transition-all mt-4 uppercase tracking-wider shadow-lg shadow-indigo-500/25"
            >
              Save Schedule Updates
            </button>
          </div>
        )}

        {/* SUB TAB 2: BATCH SCORING TABLE */}
        {adminSubTab === 'scoring' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-indigo-400" /> Batch Official Athlete Scoring
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Tab through the table to input official points (0 - {currentMaxPoints}) for each competitor, then save all once!
                </p>
              </div>

              <div className="w-full sm:w-72">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Select Event to Score:</label>
                <select
                  value={selectedScoreEvtId}
                  onChange={(e) => handleSelectEventToScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm font-medium"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.maxPoints} Pts)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto max-h-[500px] overflow-y-auto pr-2">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-indigo-400 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Athlete Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Rank Tier</th>
                    <th className="py-2.5 px-3 text-right">Official Event Points (0 - {currentMaxPoints})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {league.athletes.map(a => (
                    <tr key={a.name} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">{a.name}</td>
                      <td className="py-2 px-3 text-slate-400">{a.gender}</td>
                      <td className="py-2 px-3 text-slate-400">{a.rank}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max={currentMaxPoints}
                          placeholder="0"
                          value={batchScoreInputs[a.name] || ''}
                          onChange={(e) => handleScoreInputChange(a.name, e.target.value)}
                          className="w-24 bg-slate-950 border border-indigo-500/80 rounded-lg p-1.5 text-center text-white font-mono font-bold text-sm focus:outline-none focus:bg-slate-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: one card per athlete */}
            <div className="sm:hidden max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {league.athletes.map(a => (
                <div key={a.name} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{a.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{a.gender} · {a.rank}</div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={currentMaxPoints}
                    placeholder="0"
                    value={batchScoreInputs[a.name] || ''}
                    onChange={(e) => handleScoreInputChange(a.name, e.target.value)}
                    className="w-20 h-11 bg-[#121316] border border-indigo-500/80 rounded-lg text-center text-white font-mono font-bold text-base focus:outline-none focus:bg-slate-800 shrink-0"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAllBatchScores}
              className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Save className="w-4 h-4" /> Save All Scores for Selected Event
            </button>
          </div>
        )}

        {/* SUB TAB 3: INJURY WITHDRAWALS */}
        {adminSubTab === 'withdrawals' && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-display text-base font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2 uppercase tracking-wider">
              <UserX className="w-4 h-4 text-indigo-400" /> Log Official Athlete Injury/Illness Withdrawal
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Logging a withdrawal automatically activates the Insurance Policy backup athlete ({league.rules.currency}{league.rules.insuranceMaxPrice}m or less) for all coaches holding that athlete from the selected event onwards.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Withdrawn Athlete:</label>
              <select
                value={withdrawalAthlete}
                onChange={(e) => setWithdrawalAthlete(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {league.athletes.map(a => (
                  <option key={a.name} value={a.name}>{a.name} ({a.gender})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Effective Starting Event:</label>
              <select
                value={withdrawalEventId}
                onChange={(e) => setWithdrawalEventId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name} ({evt.day})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddWithdrawal}
              className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 uppercase tracking-wider"
            >
              Log Official Withdrawal & Activate Insurance
            </button>
          </div>
        )}

        {/* SUB TAB 4: LEAGUES & PAYMENTS */}
        {adminSubTab === 'leagues' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-display text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-indigo-400" /> Manage League Subscriptions & Buy-Ins
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Verify payments and toggle buy-in status for coaches. Stands/rankings update in real-time.
              </p>
            </div>

            {/* Top Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* £2 summary */}
              <div className={`p-4 rounded-xl border ${paid2Coaches.length >= league.leagueTiers.paid_tier_1.minCoaches ? 'bg-slate-950/60 border-slate-800' : 'bg-amber-950/20 border-amber-900/30'} flex justify-between items-center text-xs`}>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-300" />
                    <span>{league.leagueTiers.paid_tier_1.name}</span>
                  </h4>
                  <p className="text-slate-400 font-medium">
                    Min {league.leagueTiers.paid_tier_1.minCoaches} coaches required. Registered: <strong className="text-white font-mono text-sm">{paid2Coaches.length}</strong>
                  </p>
                </div>
                <div>
                  {paid2Coaches.length >= league.leagueTiers.paid_tier_1.minCoaches ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      🟢 Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                      ⚠️ Pending ({league.leagueTiers.paid_tier_1.minCoaches - paid2Coaches.length} more)
                    </span>
                  )}
                </div>
              </div>

              {/* £5 summary */}
              <div className={`p-4 rounded-xl border ${paid5Coaches.length >= league.leagueTiers.paid_tier_2.minCoaches ? 'bg-slate-950/60 border-slate-800' : 'bg-amber-950/20 border-amber-900/30'} flex justify-between items-center text-xs`}>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>{league.leagueTiers.paid_tier_2.name}</span>
                  </h4>
                  <p className="text-slate-400 font-medium">
                    Min {league.leagueTiers.paid_tier_2.minCoaches} coaches required. Registered: <strong className="text-white font-mono text-sm">{paid5Coaches.length}</strong>
                  </p>
                </div>
                <div>
                  {paid5Coaches.length >= league.leagueTiers.paid_tier_2.minCoaches ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                      🟢 Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                      ⚠️ Pending ({league.leagueTiers.paid_tier_2.minCoaches - paid5Coaches.length} more)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Coach search controls */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search coach profile name..."
                value={coachSearchTerm}
                onChange={(e) => setCoachSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Table Checklist */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-1 border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-indigo-400 font-bold uppercase text-[10px] tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-4">Coach Name</th>
                    <th className="py-3 px-4 text-center">{league.leagueTiers.paid_tier_1.name}</th>
                    <th className="py-3 px-4 text-center">{league.leagueTiers.paid_tier_2.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium bg-[#121316]/20">
                  {league.lockedTeams.filter(t => t.coach.toLowerCase().includes(coachSearchTerm.toLowerCase())).map(t => {
                    const isIn2 = paid2Coaches.includes(t.coach);
                    const isIn5 = paid5Coaches.includes(t.coach);
                    
                    const handleToggle2 = () => {
                      let updated;
                      if (isIn2) {
                        updated = paid2Coaches.filter(name => name !== t.coach);
                      } else {
                        updated = [...paid2Coaches, t.coach];
                      }
                      onSavePaid2Coaches(updated);
                    };

                    const handleToggle5 = () => {
                      let updated;
                      if (isIn5) {
                        updated = paid5Coaches.filter(name => name !== t.coach);
                      } else {
                        updated = [...paid5Coaches, t.coach];
                      }
                      onSavePaid5Coaches(updated);
                    };

                    return (
                      <tr key={t.coach} className="hover:bg-slate-850 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-white uppercase tracking-wider text-xs sm:text-sm">{t.coach}</td>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isIn2}
                            onChange={handleToggle2}
                            className="w-4 h-4 bg-slate-950 border border-slate-700 rounded text-[#e8462f] focus:ring-rose-500 focus:ring-offset-slate-900 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isIn5}
                            onChange={handleToggle5}
                            className="w-4 h-4 bg-slate-950 border border-slate-700 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850/60 flex items-start gap-2.5 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Setting these statuses updates the leaderboard stand filters instantly. Changes are synchronized automatically in local storage on this browser session.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
