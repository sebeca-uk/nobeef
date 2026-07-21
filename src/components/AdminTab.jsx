import React, { useState } from 'react';
import { ATHLETES_DATA, COMPETITION_DAYS } from '../data/seedData';
import { Shield, Key, Calendar, Award, Save, Lock, AlertCircle, CheckCircle2, UserX } from 'lucide-react';

export default function AdminTab({
  events,
  scores,
  withdrawals,
  onSaveSchedule,
  onSaveScores,
  onSaveWithdrawals
}) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [adminSubTab, setAdminSubTab] = useState('schedule');

  // Sub-Tab 1: Schedule Editor State
  const [selectedEditEvtId, setSelectedEditEvtId] = useState(events[0]?.id || '');
  const selectedEditEvt = events.find(e => e.id === selectedEditEvtId) || events[0];

  const [editPoints, setEditPoints] = useState(selectedEditEvt?.maxPoints || 100);
  const [editDay, setEditDay] = useState(selectedEditEvt?.day || COMPETITION_DAYS[0]);
  const [editTime, setEditTime] = useState(selectedEditEvt?.startTime || '2026-07-22T09:00');

  // Sub-Tab 2: Batch Scoring State
  const [selectedScoreEvtId, setSelectedScoreEvtId] = useState(events[0]?.id || '');
  const [batchScoreInputs, setBatchScoreInputs] = useState(() => {
    const map = {};
    ATHLETES_DATA.forEach(a => {
      const existing = scores.find(s => s.eventId === events[0]?.id && s.athlete === a.name);
      map[a.name] = existing ? String(existing.points) : '';
    });
    return map;
  });

  // Sub-Tab 3: Withdrawal State
  const [withdrawalAthlete, setWithdrawalAthlete] = useState(ATHLETES_DATA[0].name);
  const [withdrawalEventId, setWithdrawalEventId] = useState(events[0]?.id || '');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'nobeef2026') {
      setIsAdminLoggedIn(true);
    } else {
      alert('⛔ Incorrect Admin Password! (Default password is nobeef2026)');
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
    ATHLETES_DATA.forEach(a => {
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
      <div className="max-w-md mx-auto my-12 glass-card rounded-2xl p-6 border border-slate-800 text-center shadow-2xl">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Key className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Admin Control Portal</h2>
        <p className="text-xs text-slate-400 mb-6">
          Enter Admin Password to access schedule editors, batch scoring, and insurance withdrawal managers.
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter Admin Password (nobeef2026)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Admin Authorized Control Panel</h2>
              <span className="text-xs text-emerald-400 font-medium">Logged in as Administrator</span>
            </div>
          </div>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all"
          >
            Lock Panel
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setAdminSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminSubTab === 'schedule'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Schedule & Lock Times
          </button>
          
          <button
            onClick={() => setAdminSubTab('scoring')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminSubTab === 'scoring'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Batch Athlete Scoring Table
          </button>

          <button
            onClick={() => setAdminSubTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              adminSubTab === 'withdrawals'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <UserX className="w-4 h-4" /> Injury Withdrawals
          </button>
        </div>

        {/* SUB TAB 1: SCHEDULE EDITOR */}
        {adminSubTab === 'schedule' && (
          <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Calendar className="w-4 h-4" /> Edit Event Schedule & Lock Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Event to Edit:</label>
              <select
                value={selectedEditEvtId}
                onChange={(e) => handleSelectEventToEdit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm"
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.maxPoints} Pts) - {evt.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Point Cap (Scales Lovely Time +50 vs +25 pts):</label>
              <select
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm"
              >
                <option value={100}>100 Points (Lovely Time awards +50 pts)</option>
                <option value={50}>50 Points (Lovely Time awards +25 pts halved)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Competition Day:</label>
              <select
                value={editDay}
                onChange={(e) => setEditDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm"
              >
                {COMPETITION_DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Official Start Time (Locks Card Edits Automatically):</label>
              <input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm font-mono"
              />
            </div>

            <button
              onClick={handleSaveScheduleUpdates}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all mt-4"
            >
              Save Schedule Updates
            </button>
          </div>
        )}

        {/* SUB TAB 2: BATCH SCORING TABLE */}
        {adminSubTab === 'scoring' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <Award className="w-4 h-4" /> Batch Official Athlete Scoring
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tab through the table to input official points (0 - 100) for each competitor, then save all once!
                </p>
              </div>

              <div className="w-full sm:w-72">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Event to Score:</label>
                <select
                  value={selectedScoreEvtId}
                  onChange={(e) => handleSelectEventToScore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.maxPoints} Pts)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-amber-400 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Athlete Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Rank Tier</th>
                    <th className="py-2.5 px-3 text-right">Official Event Points (0 - 100)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ATHLETES_DATA.map(a => (
                    <tr key={a.name} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-white">{a.name}</td>
                      <td className="py-2 px-3 text-slate-400">{a.gender}</td>
                      <td className="py-2 px-3 text-slate-400">{a.rank}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={batchScoreInputs[a.name] || ''}
                          onChange={(e) => handleScoreInputChange(a.name, e.target.value)}
                          className="w-24 bg-slate-950 border border-sky-400/80 rounded-lg p-1.5 text-center text-amber-400 font-bold text-sm focus:outline-none focus:bg-slate-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSaveAllBatchScores}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save All Scores for Selected Event
            </button>
          </div>
        )}

        {/* SUB TAB 3: INJURY WITHDRAWALS */}
        {adminSubTab === 'withdrawals' && (
          <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserX className="w-4 h-4" /> Log Official Athlete Injury/Illness Withdrawal
            </h3>
            <p className="text-xs text-slate-400">
              Logging a withdrawal automatically activates the Insurance Policy backup athlete (£2m or less) for all coaches holding that athlete from the selected event onwards.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Withdrawn Athlete:</label>
              <select
                value={withdrawalAthlete}
                onChange={(e) => setWithdrawalAthlete(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm"
              >
                {ATHLETES_DATA.map(a => (
                  <option key={a.name} value={a.name}>{a.name} ({a.gender})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Effective Starting Event:</label>
              <select
                value={withdrawalEventId}
                onChange={(e) => setWithdrawalEventId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm"
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name} ({evt.day})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddWithdrawal}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-rose-600/20"
            >
              Log Official Withdrawal & Activate Insurance
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
