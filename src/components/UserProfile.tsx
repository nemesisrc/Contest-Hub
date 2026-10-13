import React, { useState, useEffect } from 'react';
import { User, Award, CheckCircle2, Clock, Globe, Code2, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType, ProblemStatus, Ladder } from '../types';

interface UserProfileProps {
  currentUser: UserType | null;
  ladders: Ladder[];
  onOpenAuth: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  ladders,
  onOpenAuth,
}) => {
  const [progress, setProgress] = useState<Record<string, ProblemStatus>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      api.getUserProgress()
        .then(res => setProgress(res.progress || {}))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to Track Your Progress</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Save your solved problems, track ladder rankings, and personalize your contest schedules.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors"
        >
          Sign In or Register
        </button>
      </div>
    );
  }

  const solvedEntries = Object.entries(progress).filter(([_, s]) => s === 'solved');
  const attemptedEntries = Object.entries(progress).filter(([_, s]) => s === 'attempted');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-bold font-mono shadow-md">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {currentUser.username}
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{currentUser.email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(currentUser.created_at).toLocaleDateString()}
                </span>
                <span>·</span>
                <span className="font-mono">Timezone: {currentUser.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Problems Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {solvedEntries.length || currentUser.solved_problems_count}
          </div>
          <span className="text-[11px] text-slate-400">Verified solutions recorded</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Attempted</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {attemptedEntries.length || currentUser.attempted_problems_count}
          </div>
          <span className="text-[11px] text-slate-400">Currently in progress</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <span>Ladders Active</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {ladders.filter(l => (l.solved_count || 0) > 0).length} / {ladders.length}
          </div>
          <span className="text-[11px] text-slate-400">Active training tracks</span>
        </div>
      </div>

      {/* Platform Handles */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-500" />
          <span>Connected Platform Profiles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Codeforces:</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {currentUser.handles?.codeforces || 'Not linked'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">LeetCode:</span>
            <span className="font-mono text-orange-600 dark:text-orange-400">
              {currentUser.handles?.leetcode || 'Not linked'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">AtCoder:</span>
            <span className="font-mono text-slate-800 dark:text-zinc-200">
              {currentUser.handles?.atcoder || 'Not linked'}
            </span>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/40 flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">CodeChef:</span>
            <span className="font-mono text-amber-700 dark:text-amber-400">
              {currentUser.handles?.codechef || 'Not linked'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
