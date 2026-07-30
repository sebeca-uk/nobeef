import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, isMockMode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0c0d0f]/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#1a1b1f] border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl z-10 space-y-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 mb-3 shadow-lg glow-indigo">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-extrabold text-white uppercase tracking-wider">
            {isSignUp ? 'Create Coach Profile' : 'Sign In to NoBeef'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isMockMode && '⚠️ Running in local storage mock account mode'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. coach@yourgym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#e8462f] hover:bg-[#ff6a4d] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-red-500/20 uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {submitting ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold tracking-widest">Or Connect With</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs uppercase transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Signup/Login Link */}
        <div className="text-center text-xs text-slate-400 font-medium">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-indigo-400 hover:text-indigo-300 font-bold underline">
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-indigo-400 hover:text-indigo-300 font-bold underline">
                Create Profile
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
