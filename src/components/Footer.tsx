import React from 'react';
import { Terminal, Shield, Scale, Heart } from 'lucide-react';
import { Platform } from '../types';

interface FooterProps {
  platforms: Platform[];
  onOpenDisclaimer: () => void;
  onSelectPlatform: (slug: string) => void;
  selectedTimezone: string;
}

export const Footer: React.FC<FooterProps> = ({
  platforms,
  onOpenDisclaimer,
  onSelectPlatform,
  selectedTimezone,
}) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm">
                &gt;_
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">ContestHub</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              Open aggregation platform for competitive programming contests and progressive A2OJ ladders. Synchronizes schedules across Codeforces, AtCoder, CodeChef, LeetCode, and HackerRank in UTC with user-customizable timezone rendering.
            </p>
            <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
              Active Timezone: <span className="font-semibold text-slate-700 dark:text-zinc-300">{selectedTimezone}</span>
            </div>
          </div>

          {/* Supported Platforms */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platforms
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
              {platforms.map(p => (
                <li key={p.slug}>
                  <button
                    onClick={() => onSelectPlatform(p.slug)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {p.name} Contests
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Attribution */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Compliance & Data
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <li>
                <button
                  onClick={onOpenDisclaimer}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Platform Attribution & Terms</span>
                </button>
              </li>
              <li>
                <a
                  href="https://codeforces.com/apiHelp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Codeforces API Specs
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-400 block pt-2">
                  Built for the global CP community.
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 gap-2">
          <span>&copy; {new Date().getFullYear()} ContestHub. An independent CP aggregator.</span>
          <span>Timestamps stored internally in UTC · Rendered client-side</span>
        </div>
      </div>
    </footer>
  );
};
