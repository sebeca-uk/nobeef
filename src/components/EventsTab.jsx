import React from 'react';
import { Calendar, Lock, CheckCircle2, Award, Clock } from 'lucide-react';

export default function EventsTab({ events }) {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>2026 CrossFit Games Event Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Start times and point caps update dynamically via Admin Portal. Events lock automatically at scheduled start time.
          </p>
        </div>

        <div className="space-y-4">
          {events.map(evt => {
            const isLocked = new Date() >= new Date(evt.startTime);
            const is50Pt = evt.maxPoints === 50;

            return (
              <div
                key={evt.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-sky-400">{evt.name}</h3>
                    <div className="text-xs text-amber-400 font-medium mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 inline" />
                      <span>📅 Day: {evt.day} | Scheduled Start: {new Date(evt.startTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      is50Pt ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {evt.maxPoints} Pts Cap
                    </span>

                    {isLocked ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> OPEN FOR CARDS
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
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
