import React from 'react';
import { Calendar, Lock, CheckCircle2, Award, Clock } from 'lucide-react';

export default function EventsTab({ events }) {
  return (
    <div className="space-y-6 font-sans">
      <div className="glass-card rounded-2xl p-5 border border-zinc-800">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-athletic uppercase tracking-wider">
            <Calendar className="w-6 h-6 text-red-500" />
            <span>2026 CrossFit Games Event Schedule</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
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
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl font-black text-white font-athletic uppercase tracking-wide">{evt.name}</h3>
                    <div className="text-xs text-red-400 font-bold mt-0.5 flex items-center gap-2 font-athletic uppercase">
                      <Clock className="w-3.5 h-3.5 inline text-red-500" />
                      <span>📅 Day: {evt.day} | Scheduled Start: {new Date(evt.startTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold font-athletic uppercase ${
                      is50Pt ? 'bg-red-600/20 text-red-400 border border-red-500/40' : 'bg-zinc-800 text-white border border-zinc-700'
                    }`}>
                      {evt.maxPoints} Pts Cap
                    </span>

                    {isLocked ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-red-600/20 text-red-400 border border-red-500/40 flex items-center gap-1 font-athletic uppercase">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-athletic uppercase">
                        <CheckCircle2 className="w-3 h-3" /> OPEN FOR CARDS
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 font-medium">
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
