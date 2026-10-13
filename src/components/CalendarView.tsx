import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Contest } from '../types';
import { formatContestTime, formatDuration } from '../utils/timezone';

interface CalendarViewProps {
  contests: Contest[];
  timezone: string;
  onSelectContest: (contest: Contest) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  contests,
  timezone,
  onSelectContest,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const jumpToday = () => setCurrentDate(new Date());

  // First day of month and days count
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map contests to dates based on user's timezone
  const contestsByDate: Record<number, Contest[]> = {};

  contests.forEach(contest => {
    try {
      const d = new Date(contest.start_time);
      // Format in target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      const parts = formatter.formatToParts(d);
      const cYear = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
      const cMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10) - 1;
      const cDay = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);

      if (cYear === year && cMonth === month) {
        if (!contestsByDate[cDay]) contestsByDate[cDay] = [];
        contestsByDate[cDay].push(contest);
      }
    } catch {
      // Fallback
    }
  });

  const getPlatformChipClass = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'codeforces':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'atcoder':
        return 'bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700';
      case 'codechef':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'leetcode':
        return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'hackerrank':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      
      {/* Calendar Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{monthName}</h2>
          <button
            onClick={jumpToday}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-center text-xs font-semibold text-slate-500 dark:text-zinc-400 py-2">
        {daysOfWeek.map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-zinc-800">
        
        {/* Previous Month Pad */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => {
          const prevDate = daysInPrevMonth - firstDayIndex + idx + 1;
          return (
            <div key={`prev-${idx}`} className="min-h-[100px] p-1.5 bg-slate-50/40 dark:bg-zinc-950/20 text-slate-300 dark:text-zinc-700 text-xs font-mono">
              {prevDate}
            </div>
          );
        })}

        {/* Current Month Days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const isToday = isCurrentMonth && today.getDate() === dayNum;
          const dayContests = contestsByDate[dayNum] || [];

          return (
            <div
              key={`day-${dayNum}`}
              className={`min-h-[110px] p-1.5 transition-colors ${
                isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : 'hover:bg-slate-50/60 dark:hover:bg-zinc-800/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded-sm ${
                    isToday
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {dayNum}
                </span>
                {dayContests.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dayContests.length} {dayContests.length === 1 ? 'event' : 'events'}
                  </span>
                )}
              </div>

              {/* Contest items list inside date cell */}
              <div className="space-y-1 overflow-y-auto max-h-[85px]">
                {dayContests.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelectContest(c)}
                    className={`w-full text-left p-1 rounded border text-[11px] leading-tight block truncate transition-transform hover:scale-[1.02] ${getPlatformChipClass(
                      c.platform
                    )}`}
                    title={`${c.name} (${c.platform}) at ${formatContestTime(c.start_time, timezone)}`}
                  >
                    <div className="font-semibold truncate">{c.name}</div>
                    <div className="flex items-center gap-1 text-[10px] opacity-80 font-mono mt-0.5">
                      <span>{formatContestTime(c.start_time, timezone)}</span>
                      <span>·</span>
                      <span>{formatDuration(c.duration_seconds)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
