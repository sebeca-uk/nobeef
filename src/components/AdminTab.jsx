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
    const expectedAdminPw = import.meta.env.VITE_ADMIN_PASSWORD || 'nobeef2026';
    if (passwordInput === expectedAdminPw) {
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
      <div className="max-w-md mx-auto my-12 glass-card rounded-2xl p-6 border border-zinc-800 text-center shadow-2xl font-sans">
        <div className="w-12 h-12 bg-red-600/10 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
          <Key className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 font-athletic uppercase tracking-wider">Admin Control Portal</h2>
        <p className="text-xs text-zinc-400 mb-6 font-medium">
          Enter Admin Password to access schedule editors, batch scoring, and insurance withdrawal managers.
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-sm focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-red-600/30 font-athletic uppercase tracking-wider"
          >
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-zinc-800">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-black text-white font-athletic uppercase tracking-wider">Admin Authorized Control Panel</h2>
              <span className="text-xs text-red-400 font-bold font-athletic uppercase">Logged in as Administrator</span>
            </div>
          </div>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-red-600 hover:text-white transition-all font-athletic uppercase"
          >
            Lock Panel
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setAdminSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all font-athletic uppercase tracking-wider ${
              adminSubTab === 'schedule'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Schedule & Lock Times
          </button>
          
          <button
            onClick={() => setAdminSubTab('scoring')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all font-athletic uppercase tracking-wider ${
              adminSubTab === 'scoring'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Award className="w-4 h-4" /> Batch Athlete Scoring Table
          </button>

          <button
            onClick={() => setAdminSubTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all font-athletic uppercase tracking-wider ${
              adminSubTab === 'withdrawals'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <UserX className="w-4 h-4" /> Injury Withdrawals
          </button>
        </div>

        {/* SUB TAB 1: SCHEDULE EDITOR */}
        {adminSubTab === 'schedule' && (
          <div className="max-w-2xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-zinc-800 pb-2 font-athletic uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-red-500" /> Edit Event Schedule & Lock Settings
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Select Event to Edit:</label>
              <select
                value={selectedEditEvtId}
                onChange={(e) => handleSelectEventToEdit(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.maxPoints} Pts) - {evt.day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Max Point Cap (Scales Lovely Time +50 vs +25 pts):</label>
              <select
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                <option value={100}>100 Points (Lovely Time awards +50 pts)</option>
                <option value={50}>50 Points (Lovely Time awards +25 pts halved)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Competition Day:</label>
              <select
                value={editDay}
                onChange={(e) => setEditDay(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {COMPETITION_DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Official Start Time (Locks Card Edits Automatically):</label>
              <input
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-sm font-mono"
              />
            </div>

            <button
              onClick={handleSaveScheduleUpdates}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-sm transition-all mt-4 font-athletic uppercase tracking-wider shadow-lg shadow-red-600/30"
            >
              Save Schedule Updates
            </button>
          </div>
        )}

        {/* SUB TAB 2: BATCH SCORING TABLE */}
        {adminSubTab === 'scoring' && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 font-athletic uppercase tracking-wider">
                  <Award className="w-4 h-4 text-red-500" /> Batch Official Athlete Scoring
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  Tab through the table to input official points (0 - 100) for each competitor, then save all once!
                </p>
              </div>

              <div className="w-full sm:w-72">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Select Event to Score:</label>
                <select
                  value={selectedScoreEvtId}
                  onChange={(e) => handleSelectEventToScore(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white text-xs sm:text-sm font-medium"
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
                <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-red-500 font-black uppercase text-[11px] font-athletic tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Athlete Name</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Rank Tier</th>
                    <th className="py-2.5 px-3 text-right">Official Event Points (0 - 100)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-medium">
                  {ATHLETES_DATA.map(a => (
                    <tr key={a.name} className="hover:bg-zinc-800/40">
                      <td className="py-2 px-3 font-semibold text-white">{a.name}</td>
                      <td className="py-2 px-3 text-zinc-400">{a.gender}</td>
                      <td className="py-2 px-3 text-zinc-400">{a.rank}</td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={batchScoreInputs[a.name] || ''}
                          onChange={(e) => handleScoreInputChange(a.name, e.target.value)}
                          className="w-24 bg-zinc-950 border border-red-500/80 rounded-lg p-1.5 text-center text-white font-mono font-bold text-sm focus:outline-none focus:bg-zinc-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSaveAllBatchScores}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 font-athletic uppercase tracking-wider"
            >
              <Save className="w-4 h-4" /> Save All Scores for Selected Event
            </button>
          </div>
        )}

        {/* SUB TAB 3: INJURY WITHDRAWALS */}
        {adminSubTab === 'withdrawals' && (
          <div className="max-w-2xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-zinc-800 pb-2 font-athletic uppercase tracking-wider">
              <UserX className="w-4 h-4 text-red-500" /> Log Official Athlete Injury/Illness Withdrawal
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              Logging a withdrawal automatically activates the Insurance Policy backup athlete (£2m or less) for all coaches holding that athlete from the selected event onwards.
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Withdrawn Athlete:</label>
              <select
                value={withdrawalAthlete}
                onChange={(e) => setWithdrawalAthlete(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {ATHLETES_DATA.map(a => (
                  <option key={a.name} value={a.name}>{a.name} ({a.gender})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1 font-athletic">Effective Starting Event:</label>
              <select
                value={withdrawalEventId}
                onChange={(e) => setWithdrawalEventId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-white text-sm font-medium"
              >
                {events.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name} ({evt.day})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddWithdrawal}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-sm transition-all shadow-lg shadow-red-600/30 font-athletic uppercase tracking-wider"
            >
              Log Official Withdrawal & Activate Insurance
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
