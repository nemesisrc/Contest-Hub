import React from 'react';
import { ExternalLink, CalendarPlus, Clock, ArrowRight } from 'lucide-react';
import { Contest } from '../types';
import { formatContestDateTime, formatDuration } from '../utils/timezone';
import { Countdown } from './Countdown';

interface ContestCardProps {
  contest: Contest;
  timezone: string;
  onSelect: (contest: Contest) => void;
  onPlatformClick?: (platformSlug: string) => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({
  contest,
  timezone,
  onSelect,
  onPlatformClick,
}) => {
  const isLive = contest.status === 'live';
  const isUpcoming = contest.status === 'upcoming';

  const generateGoogleCalendarUrl = () => {
    const s = new Date(contest.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const e = new Date(contest.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(contest.name);
    const details = encodeURIComponent(`Platform: ${contest.platform}\nContest URL: ${contest.url}\nDuration: ${formatDuration(contest.duration_seconds)}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${s}/${e}&details=${details}&location=${encodeURIComponent(contest.url)}`;
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all duration-200 ${
        isLive
          ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/60 shadow-sm'
          : 'bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        
        {/* Left Column: Metadata & Title */}
        <div className="space-y-1.5 flex-1 min-w-0">
          
          {/* Unboxed Metadata Header (Anti-slop zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-zinc-400">
            {/* Platform clickable */}
            <button
              onClick={() => onPlatformClick?.(contest.platform.toLowerCase())}
              className="font-semibold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5 transition-colors"
            >
              {contest.platform_logo && (
                <img
                  src={contest.platform_logo}
                  alt={contest.platform}
                  className="w-3.5 h-3.5 object-contain rounded-xs"
                  onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
              <span>{contest.platform}</span>
            </button>

            <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">·</span>

            {/* Division or Contest Type */}
            {contest.division && (
              <>
                <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300 font-medium">{contest.division}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">·</span>
              </>
            )}

            {/* Duration */}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 opacity-60" />
              <span>{formatDuration(contest.duration_seconds)}</span>
            </span>

            {contest.source_type && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">·</span>
                <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500">
                  {contest.source_type === 'official_api' ? 'Official API' : 'Public Feed'}
                </span>
              </>
            )}
          </div>

          {/* Contest Title */}
          <h3
            onClick={() => onSelect(contest)}
            className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug line-clamp-2"
          >
            {contest.name}
          </h3>

          {/* Schedule in Selected Timezone */}
          <div className="text-xs text-slate-600 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 pt-0.5">
            <span>Starts: <strong className="font-medium text-slate-800 dark:text-zinc-200">{formatContestDateTime(contest.start_time, timezone)}</strong></span>
            <span aria-hidden="true" className="text-slate-300 dark:text-zinc-700">·</span>
            <span className="text-slate-500 dark:text-zinc-500">Ends: {formatContestDateTime(contest.end_time, timezone)}</span>
          </div>
        </div>

        {/* Right Column: Countdown & Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800/80 shrink-0">
          
          {/* Live countdown ticker */}
          <div className="text-right">
            <Countdown
              startTimeIso={contest.start_time}
              endTimeIso={contest.end_time}
              status={contest.status}
              format="compact"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            {/* Add to Calendar */}
            {isUpcoming && (
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                title="Add to Google Calendar"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
              </a>
            )}

            {/* View Details modal */}
            <button
              onClick={() => onSelect(contest)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md border border-slate-200 dark:border-zinc-800 transition-colors"
            >
              Details
            </button>

            {/* Official Contest Link */}
            <a
              href={contest.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md shadow-xs transition-colors ${
                isLive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white'
              }`}
            >
              <span>{isLive ? 'Enter Live' : 'Register'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
