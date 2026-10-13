import React, { useState, useEffect } from 'react';
import { getTimeRemaining } from '../utils/timezone';

interface CountdownProps {
  startTimeIso: string;
  endTimeIso: string;
  status: 'upcoming' | 'live' | 'finished';
  format?: 'compact' | 'detailed';
  onStatusChange?: (newStatus: 'upcoming' | 'live' | 'finished') => void;
}

export const Countdown: React.FC<CountdownProps> = ({
  startTimeIso,
  endTimeIso,
  status: initialStatus,
  format = 'compact',
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(startTimeIso));

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const startMs = new Date(startTimeIso).getTime();
      const endMs = new Date(endTimeIso).getTime();

      let newStatus: 'upcoming' | 'live' | 'finished' = 'finished';
      if (now < startMs) {
        newStatus = 'upcoming';
      } else if (now >= startMs && now <= endMs) {
        newStatus = 'live';
      }

      if (newStatus !== currentStatus) {
        setCurrentStatus(newStatus);
        onStatusChange?.(newStatus);
      }

      if (newStatus === 'upcoming') {
        setTimeLeft(getTimeRemaining(startTimeIso));
      } else if (newStatus === 'live') {
        setTimeLeft(getTimeRemaining(endTimeIso));
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTimeIso, endTimeIso, currentStatus, onStatusChange]);

  if (currentStatus === 'finished') {
    return (
      <span className="font-mono text-xs text-slate-500 dark:text-zinc-500 font-medium tracking-tight">
        FINISHED
      </span>
    );
  }

  if (currentStatus === 'live') {
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs text-rose-600 dark:text-rose-400 font-semibold tracking-tight">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
        <span>LIVE · Ends in {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ''}{timeLeft.minutes}m {timeLeft.seconds}s</span>
      </div>
    );
  }

  // Upcoming
  const pad = (n: number) => String(n).padStart(2, '0');

  if (format === 'detailed') {
    return (
      <div className="flex items-center gap-2 font-mono text-sm">
        <div className="bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700/60 text-center">
          <span className="text-base font-bold text-slate-900 dark:text-white">{pad(timeLeft.days)}</span>
          <span className="block text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Days</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700/60 text-center">
          <span className="text-base font-bold text-slate-900 dark:text-white">{pad(timeLeft.hours)}</span>
          <span className="block text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Hours</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700/60 text-center">
          <span className="text-base font-bold text-slate-900 dark:text-white">{pad(timeLeft.minutes)}</span>
          <span className="block text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Mins</span>
        </div>
        <span className="text-slate-400 font-bold">:</span>
        <div className="bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700/60 text-center">
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{pad(timeLeft.seconds)}</span>
          <span className="block text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Secs</span>
        </div>
      </div>
    );
  }

  // Compact format
  if (timeLeft.days > 0) {
    return (
      <span className="font-mono text-xs text-slate-700 dark:text-zinc-300 font-medium">
        in {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m
      </span>
    );
  }

  return (
    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
      in {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  );
};
