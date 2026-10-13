import React, { useState, useEffect } from 'react';
import { ExternalLink, Globe, ArrowLeft, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { Platform, Contest } from '../types';
import { api } from '../services/api';
import { ContestCard } from './ContestCard';

interface PlatformPageProps {
  platformSlug: string;
  timezone: string;
  onBack: () => void;
  onSelectContest: (contest: Contest) => void;
}

export const PlatformPage: React.FC<PlatformPageProps> = ({
  platformSlug,
  timezone,
  onBack,
  onSelectContest,
}) => {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'finished'>('all');

  useEffect(() => {
    let mounted = true;
    const fetchPlatformData = async () => {
      setLoading(true);
      try {
        const res = await api.getPlatformContests(platformSlug, 1, 50);
        if (mounted) {
          setPlatform(res.platform);
          setContests(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch platform details', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlatformData();
    return () => { mounted = false; };
  }, [platformSlug]);

  const filteredContests = contests.filter(c => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading platform details...</div>;
  }

  if (!platform) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Platform not found</p>
        <button onClick={onBack} className="mt-4 text-xs text-indigo-600 underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Platforms</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {platform.logo_url && (
              <img
                src={platform.logo_url}
                alt={platform.name}
                className="w-12 h-12 rounded-xl object-contain p-1 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{platform.name}</h1>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Provider Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                {platform.description}
              </p>
            </div>
          </div>

          <a
            href={platform.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors shadow-xs shrink-0"
          >
            <Globe className="w-4 h-4" />
            <span>Visit {platform.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* API policy / Terms note */}
        {platform.api_policy_note && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>{platform.api_policy_note}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-lg text-xs font-medium">
          {(['all', 'upcoming', 'live', 'finished'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'live' ? '🔴 Live' : st}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
          {filteredContests.length} {platform.name} contests
        </span>
      </div>

      {/* Contests Feed */}
      <div className="space-y-3">
        {filteredContests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            No {statusFilter} contests found for {platform.name}.
          </div>
        ) : (
          filteredContests.map(c => (
            <ContestCard
              key={c.id}
              contest={c}
              timezone={timezone}
              onSelect={onSelectContest}
            />
          ))
        )}
      </div>
    </div>
  );
};
