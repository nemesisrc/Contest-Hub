import React from 'react';
import { X, ExternalLink, CalendarPlus, Clock, ShieldCheck, Globe, Share2 } from 'lucide-react';
import { Contest } from '../types';
import { formatContestDateTime, formatDuration } from '../utils/timezone';
import { Countdown } from './Countdown';

interface ContestDetailModalProps {
  contest: Contest | null;
  timezone: string;
  onClose: () => void;
  onPlatformClick?: (platformSlug: string) => void;
}

export const ContestDetailModal: React.FC<ContestDetailModalProps> = ({
  contest,
  timezone,
  onClose,
  onPlatformClick,
}) => {
  if (!contest) return null;

  const isLive = contest.status === 'live';
  const isUpcoming = contest.status === 'upcoming';

  const generateGoogleCalendarUrl = () => {
    const s = new Date(contest.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const e = new Date(contest.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(contest.name);
    const details = encodeURIComponent(`Platform: ${contest.platform}\nOfficial URL: ${contest.url}\nDuration: ${formatDuration(contest.duration_seconds)}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${s}/${e}&details=${details}&location=${encodeURIComponent(contest.url)}`;
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${contest.name} on ${contest.platform}: ${contest.url}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <button
                onClick={() => {
                  onClose();
                  onPlatformClick?.(contest.platform.toLowerCase());
                }}
                className="font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1.5"
              >
                {contest.platform_logo && (
                  <img src={contest.platform_logo} alt={contest.platform} className="w-4 h-4 object-contain rounded-xs" />
                )}
                <span>{contest.platform}</span>
              </button>
              <span>·</span>
              <span className="font-mono">{contest.external_id}</span>
              {contest.contest_type && (
                <>
                  <span>·</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-300">{contest.contest_type}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {contest.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Real-time Countdown Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                Contest Status
              </span>
              <div className="text-sm">
                <Countdown
                  startTimeIso={contest.start_time}
                  endTimeIso={contest.end_time}
                  status={contest.status}
                  format="detailed"
                />
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-zinc-800 sm:pl-4">
              <span className="text-xs text-slate-400 dark:text-zinc-500 block">Duration</span>
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                {formatDuration(contest.duration_seconds)}
              </span>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <span className="text-xs text-slate-400 dark:text-zinc-500 block">Start Date & Time</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">
                {formatContestDateTime(contest.start_time, timezone)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                Timezone: {timezone}
              </span>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <span className="text-xs text-slate-400 dark:text-zinc-500 block">End Date & Time</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block mt-0.5">
                {formatContestDateTime(contest.end_time, timezone)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                Timezone: {timezone}
              </span>
            </div>
          </div>

          {/* Description & Rules Notes */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Contest Description & Rules</h4>
            <p>{contest.description || 'Standard competitive programming round with rating updates.'}</p>
            {contest.division && (
              <p>
                <strong>Division / Rating Bracket:</strong> {contest.division}
              </p>
            )}
          </div>

          {/* Legal Attribution Notice */}
          <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span>This contest belongs to and is hosted directly by <strong>{contest.platform}</strong>. ContestHub aggregates publicly published schedules without copying proprietary contest content.</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950/80 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isUpcoming && (
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add to Calendar</span>
              </a>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              title="Copy details link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              Close
            </button>

            {/* Official Link */}
            <a
              href={contest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-sm transition-colors"
            >
              <span>Visit Official Contest</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
