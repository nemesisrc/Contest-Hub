import React from 'react';
import { Filter, List, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { FilterState, Platform } from '../types';

interface ContestFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  platforms: Platform[];
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  totalCount: number;
}

export const ContestFilters: React.FC<ContestFiltersProps> = ({
  filters,
  setFilters,
  platforms,
  viewMode,
  setViewMode,
  totalCount,
}) => {
  const togglePlatform = (slug: string) => {
    setFilters(prev => {
      const exists = prev.platforms.includes(slug);
      const nextPlatforms = exists
        ? prev.platforms.filter(p => p !== slug)
        : [...prev.platforms, slug];
      return { ...prev, platforms: nextPlatforms };
    });
  };

  const resetFilters = () => {
    setFilters({
      platforms: [],
      status: 'all',
      dateRange: 'all',
      contestType: 'all',
      division: 'all',
      search: '',
      sortBy: 'start_time_asc',
    });
  };

  const hasActiveFilters =
    filters.platforms.length > 0 ||
    filters.status !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.contestType !== 'all' ||
    filters.division !== 'all' ||
    filters.search !== '';

  return (
    <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50">
      
      {/* Top Bar: View Mode Switcher, Status Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-zinc-800/80 rounded-lg text-xs font-medium">
          {(['all', 'upcoming', 'live', 'finished'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilters(prev => ({ ...prev, status: st }))}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                filters.status === st
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === 'live' ? '🔴 Live' : st}
            </button>
          ))}
        </div>

        {/* View Switcher & Result Count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            <strong>{totalCount}</strong> contests
          </span>

          {/* List vs Calendar View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-zinc-800/80 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

      </div>

      {/* Second Row: Platform Checkboxes Multi-Select */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-indigo-500" />
          Platforms:
        </span>
        {platforms.map(p => {
          const isSelected = filters.platforms.includes(p.slug);
          return (
            <button
              key={p.slug}
              onClick={() => togglePlatform(p.slug)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {isSelected ? '✓' : '+'}
              <span>{p.name}</span>
            </button>
          );
        })}

        {/* Date Scope Buttons */}
        <div className="hidden sm:flex items-center gap-1 ml-auto text-xs">
          {(['all', 'today', 'week', 'month'] as const).map(dr => (
            <button
              key={dr}
              onClick={() => setFilters(prev => ({ ...prev, dateRange: dr }))}
              className={`px-2 py-1 rounded-md capitalize transition-colors ${
                filters.dateRange === dr
                  ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {dr === 'all' ? 'Any Date' : dr === 'week' ? 'This Week' : dr === 'month' ? 'This Month' : 'Today'}
            </button>
          ))}
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:underline ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

    </div>
  );
};
