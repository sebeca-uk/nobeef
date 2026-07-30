import React, { useState, useEffect } from 'react';
import { useLeague } from '../context/LeagueContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function LeagueLockScreen({ message = "Rosters and coach details are locked. Enter the league access code to unlock." }) {
  const league = useLeague();
  const { user } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [codeAccepted, setCodeAccepted] = useState(false);

  // If user signs in after code is accepted, finalize the unlock
  useEffect(() => {
    if (codeAccepted && user) {
      const success = league.unlockLeague(accessCode);
      if (success) {
        setCodeAccepted(false);
        setShowAuthModal(false);
      }
    }
  }, [user, codeAccepted, accessCode, league]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = accessCode.trim().toLowerCase();
    const matches = cleanCode === (league.sitePassword || '').toLowerCase() || 
                    cleanCode === (league.joinCode || '').toLowerCase();

    if (matches) {
      if (user) {
        // Already logged in, unlock immediately
        league.unlockLeague(accessCode);
      } else {
        // Not logged in: accept code, but prompt login/signup first
        setCodeAccepted(true);
        setShowAuthModal(true);
      }
    } else {
      setError('Incorrect access code. Please try again.');
    }
  };

  const handleAuthClose = () => {
    // If they close the auth modal without signing in, but the code was correct,
    // we can still unlock the league for them
    league.unlockLeague(accessCode);
    setCodeAccepted(false);
    setShowAuthModal(false);
  };

  return (
    <div className="max-w-md mx-auto my-12 glass-card rounded-3xl p-8 border border-indigo-500/20 text-center shadow-2xl space-y-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
      
      <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-lg glow-indigo">
        <Lock className="w-8 h-8 text-indigo-400" />
      </div>

      <div>
        <span className="uppercase text-[9px] font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Access Restricted
        </span>
        <h3 className="font-display text-xl font-extrabold text-white mt-3 uppercase tracking-wider">
          {league.leagueName}
        </h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {message}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            placeholder="Enter League Access Code"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value);
              if (error) setError('');
            }}
            className={`w-full bg-slate-950 border ${
              error ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-indigo-550'
            } rounded-xl px-4 py-3 text-center text-xs sm:text-sm focus:outline-none transition font-mono tracking-wider`}
            required
          />
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] mt-2 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400">{error}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm transition-all uppercase tracking-wider shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5"
        >
          <span>Unlock League</span>
        </button>
      </form>

      <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Secured League Portal</span>
      </div>

      {/* Auth Modal Triggered if they enter correct code but aren't logged in */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthClose}
      />
    </div>
  );
}
