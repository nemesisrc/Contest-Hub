import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  Calendar as CalendarIcon,
  Award,
  Globe,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Radio,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ContestCard } from './components/ContestCard';
import { ContestFilters } from './components/ContestFilters';
import { CalendarView } from './components/CalendarView';
import { ContestDetailModal } from './components/ContestDetailModal';
import { LaddersView } from './components/LaddersView';
import { PlatformPage } from './components/PlatformPage';
import { DisclaimerModal } from './components/DisclaimerModal';
import { api } from './services/api';
import { Contest, Platform, Ladder, FilterState } from './types';
import { DEFAULT_TIMEZONE, formatDuration } from './utils/timezone';

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'contests' | 'calendar' | 'ladders' | 'platforms' | 'platform_detail'>('home');
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string>('codeforces');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  // Timezone State (Default: Asia/Kolkata as requested)
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    return localStorage.getItem('contesthub_timezone') || DEFAULT_TIMEZONE;
  });

  // Theme State (Dark mode default with system detection)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('contesthub_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);

  // Contests & Aggregator Data State
  const [contests, setContests] = useState<Contest[]>([]);
  const [dedicatedUpcoming, setDedicatedUpcoming] = useState<Contest[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);

  // Contest Filters
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    status: 'all',
    dateRange: 'all',
    contestType: 'all',
    division: 'all',
    search: '',
    sortBy: 'start_time_asc',
  });

  // Keep dark mode class in sync on <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('contesthub_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('contesthub_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Save selected timezone
  const handleTimezoneChange = (tz: string) => {
    setSelectedTimezone(tz);
    localStorage.setItem('contesthub_timezone', tz);
  };

  // Initial Data Fetching
  const loadInitialData = async () => {
    try {
      const [platData, ladData, upcomingData] = await Promise.all([
        api.getPlatforms(),
        api.getLadders(),
        api.getUpcomingContests(30),
      ]);
      setPlatforms(platData);
      setLadders(ladData);
      if (upcomingData && upcomingData.length > 0) {
        setDedicatedUpcoming(upcomingData);
      }
    } catch (err) {
      console.error('Initial load failed:', err);
    }
  };

  // Fetch Contests with Filters
  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await api.getContests({
        platforms: filters.platforms,
        status: filters.status,
        search: filters.search,
        contestType: filters.contestType,
        division: filters.division,
        limit: 250,
        sort: filters.sortBy,
      });
      setContests(res.data);
    } catch (err) {
      console.error('Failed to fetch contests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchContests();
  }, [filters]);

  const handleOpenPlatform = (slug: string) => {
    setSelectedPlatformSlug(slug);
    setCurrentTab('platform_detail');
  };

  // Categorize contests for Homepage Dashboard
  const liveContests = useMemo(() => {
    return contests.filter(c => c.status === 'live');
  }, [contests]);

  const upcomingContests = useMemo(() => {
    const list = contests.filter(c => c.status === 'upcoming');
    if (list.length > 0) return list;
    return dedicatedUpcoming;
  }, [contests, dedicatedUpcoming]);

  const startingSoonContests = useMemo(() => {
    const now = Date.now();
    const next24h = now + 24 * 3600 * 1000;
    return upcomingContests.filter(c => {
      const s = new Date(c.start_time).getTime();
      return s > now && s <= next24h;
    });
  }, [upcomingContests]);

  const recentContests = useMemo(() => {
    return contests.filter(c => c.status === 'finished');
  }, [contests]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab: string) => setCurrentTab(tab as any)}
        selectedTimezone={selectedTimezone}
        setSelectedTimezone={handleTimezoneChange}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        searchQuery={filters.search}
        setSearchQuery={q => {
          setFilters(prev => ({ ...prev, search: q }));
          if (currentTab !== 'contests') setCurrentTab('contests');
        }}
        onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-12">
            
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-radial-[at_top_left] from-indigo-900/20 via-slate-900/5 to-transparent dark:from-indigo-950/40 dark:via-zinc-900/30 p-8 sm:p-12 border border-slate-200/80 dark:border-zinc-800">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Unified Competitive Programming Hub</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  All Coding Contests. <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    In One Place.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  Never miss a competitive programming round. Track upcoming and live contests from Codeforces, CodeChef, AtCoder, LeetCode, and HackerRank with real-time countdowns and practice A2OJ rating ladders.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={() => setCurrentTab('contests')}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    <span>View Contests</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('ladders')}
                    className="px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold text-sm border border-slate-200 dark:border-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <span>Explore Ladders</span>
                    <Award className="w-4 h-4 text-indigo-500" />
                  </button>
                </div>
              </div>

              {/* Supported Platform Badges Quick Strip */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-zinc-800/80 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-zinc-400">
                <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px] uppercase">
                  Aggregating from:
                </span>
                {platforms.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => handleOpenPlatform(p.slug)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                  >
                    {p.logo_url && (
                      <img src={p.logo_url} alt="" className="w-3.5 h-3.5 object-contain rounded-xs" />
                    )}
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* SECTION: 🔴 Happening Now (Live Contests) */}
            {liveContests.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Happening Now
                    </h2>
                  </div>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-semibold">
                    {liveContests.length} {liveContests.length === 1 ? 'contest active' : 'contests active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {liveContests.map(c => (
                    <ContestCard
                      key={c.id}
                      contest={c}
                      timezone={selectedTimezone}
                      onSelect={setSelectedContest}
                      onPlatformClick={handleOpenPlatform}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION: ⏰ Starting Soon (Next 24h) */}
            {startingSoonContests.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Starting Soon (Next 24 Hours)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {startingSoonContests.length} upcoming
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {startingSoonContests.map(c => (
                    <ContestCard
                      key={c.id}
                      contest={c}
                      timezone={selectedTimezone}
                      onSelect={setSelectedContest}
                      onPlatformClick={handleOpenPlatform}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* SECTION: 📅 Upcoming Contests */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Upcoming Contests
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentTab('contests')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Contests</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading contests feed...</div>
              ) : upcomingContests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                  No upcoming contests scheduled.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {upcomingContests.slice(0, 8).map(c => (
                    <ContestCard
                      key={c.id}
                      contest={c}
                      timezone={selectedTimezone}
                      onSelect={setSelectedContest}
                      onPlatformClick={handleOpenPlatform}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* SECTION: 🧩 Popular Ladders */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Popular Practice Ladders
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentTab('ladders')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Browse All Ladders</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ladders.filter(lad => (lad.problem_count || 0) > 0).slice(0, 3).map(lad => (
                  <div
                    key={lad.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {lad.difficulty} · {lad.problem_count} Problems
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {lad.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 line-clamp-2">
                        {lad.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentTab('ladders')}
                      className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      Start Ladder
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: CONTESTS PAGE (with filters and list/calendar switch) */}
        {currentTab === 'contests' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Competitive Programming Contests
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Real-time aggregated schedule across Codeforces, AtCoder, CodeChef, LeetCode, and HackerRank.
              </p>
            </div>

            {/* Filter controls */}
            <ContestFilters
              filters={filters}
              setFilters={setFilters}
              platforms={platforms}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalCount={contests.length}
            />

            {/* View Mode: List vs Calendar */}
            {viewMode === 'calendar' ? (
              <CalendarView
                contests={contests}
                timezone={selectedTimezone}
                onSelectContest={setSelectedContest}
              />
            ) : (
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-16 text-slate-400">Loading filtered contests...</div>
                ) : contests.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                    No contests match your selected filter criteria. Try clearing some filters.
                  </div>
                ) : (
                  contests.map(c => (
                    <ContestCard
                      key={c.id}
                      contest={c}
                      timezone={selectedTimezone}
                      onSelect={setSelectedContest}
                      onPlatformClick={handleOpenPlatform}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: CALENDAR VIEW */}
        {currentTab === 'calendar' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Contests Calendar
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Visual monthly schedule converted to your timezone ({selectedTimezone}). Click any contest to inspect details.
              </p>
            </div>

            <CalendarView
              contests={contests}
              timezone={selectedTimezone}
              onSelectContest={setSelectedContest}
            />
          </div>
        )}

        {/* VIEW 4: A2OJ LADDERS */}
        {currentTab === 'ladders' && (
          <LaddersView
            ladders={ladders}
            onRefreshLadders={loadInitialData}
          />
        )}

        {/* VIEW 5: PLATFORMS DIRECTORY */}
        {currentTab === 'platforms' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Supported Platforms & Data Feeds
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Explore platform integrations, contest types, and public data policies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {platforms.map(p => (
                <div
                  key={p.slug}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {p.logo_url && (
                        <img
                          src={p.logo_url}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded-lg p-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
                        />
                      )}
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                        {p.contest_count} contests
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {p.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenPlatform(p.slug)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Contests</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    >
                      Official Site &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: SINGLE PLATFORM DEDICATED PAGE */}
        {currentTab === 'platform_detail' && (
          <PlatformPage
            platformSlug={selectedPlatformSlug}
            timezone={selectedTimezone}
            onBack={() => setCurrentTab('platforms')}
            onSelectContest={setSelectedContest}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        platforms={platforms}
        onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
        onSelectPlatform={handleOpenPlatform}
        selectedTimezone={selectedTimezone}
      />

      {/* MODALS */}
      <ContestDetailModal
        contest={selectedContest}
        timezone={selectedTimezone}
        onClose={() => setSelectedContest(null)}
        onPlatformClick={handleOpenPlatform}
      />

      <DisclaimerModal
        isOpen={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
      />
    </div>
  );
};
export default App;
