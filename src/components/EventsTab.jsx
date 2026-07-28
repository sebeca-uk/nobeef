import React from 'react';
import { useLeague } from '../context/LeagueContext';
import { Calendar, Lock, CheckCircle2, Clock } from 'lucide-react';

export default function EventsTab({ events }) {
  const league = useLeague();
  const eventList = events || league.events;

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-indigo-500/20">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>{league.competitionName} Event Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Start times and point caps update dynamically via Admin Portal. Events lock automatically at scheduled start time.
          </p>
        </div>

        <div className="space-y-4">
          {eventList.map(evt => {
            const isLocked = new Date() >= new Date(evt.startTime);
            const is50Pt = evt.maxPoints === league.rules.lovelyTimeBonus100;

            return (
              <div
                key={evt.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-5 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-white uppercase tracking-wide">{evt.name}</h3>
                    <div className="text-xs text-indigo-400 font-semibold mt-0.5 flex items-center gap-2 uppercase">
                      <Clock className="w-3.5 h-3.5 inline text-indigo-400" />
                      <span>📅 Day: {evt.day} | Scheduled Start: {new Date(evt.startTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                      is50Pt ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {evt.maxPoints} Pts Cap
                    </span>

                    {isLocked ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 uppercase">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 uppercase">
                        <CheckCircle2 className="w-3 h-3" /> OPEN FOR CARDS
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-medium">
                  {evt.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
