import React, { useState } from 'react';
import { X, User, Lock, Mail, Globe, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { SUPPORTED_TIMEZONES } from '../utils/timezone';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ username, email, password, timezone });
        localStorage.setItem('contesthub_token', res.token);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        localStorage.setItem('contesthub_token', res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isRegister ? 'Create ContestHub Account' : 'Sign in to ContestHub'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {isRegister ? 'Track your ladder problems and participate in contests' : 'Access your solved ladders and preferences'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isRegister && (
            <div>
              <label className="text-xs text-slate-600 dark:text-zinc-400 block mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="tourist_fan"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-600 dark:text-zinc-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-zinc-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs text-slate-600 dark:text-zinc-400 block mb-1">Default Timezone</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
                >
                  {SUPPORTED_TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => { setIsRegister(false); setError(null); }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => { setIsRegister(true); setError(null); }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Register now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
