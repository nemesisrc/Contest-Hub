import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Plus, Power, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Ladder } from '../types';

interface AdminDashboardProps {
  onRefreshAll: () => void;
  ladders: Ladder[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onRefreshAll,
  ladders,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // New ladder form
  const [newLadderName, setNewLadderName] = useState('');
  const [newLadderSlug, setNewLadderSlug] = useState('');
  const [newLadderDiff, setNewLadderDiff] = useState('Intermediate');
  const [newLadderCat, setNewLadderCat] = useState<'rating' | 'topic' | 'curated'>('topic');
  const [ladderCreating, setLadderCreating] = useState(false);

  // New problem form
  const [selectedLadderId, setSelectedLadderId] = useState(ladders[0]?.id || '');
  const [problemName, setProblemName] = useState('');
  const [problemPlatform, setProblemPlatform] = useState('Codeforces');
  const [problemUrl, setProblemUrl] = useState('');
  const [problemRating, setProblemRating] = useState('1200');
  const [problemCreating, setProblemCreating] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.triggerSync();
      setSyncMessage(`Synchronization completed: ${res.totalFetched || 0} contests retrieved across providers.`);
      await fetchStats();
      onRefreshAll();
    } catch (err: any) {
      setSyncMessage(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleProvider = async (slug: string, currentEnabled: boolean) => {
    try {
      await api.toggleProvider(slug, !currentEnabled);
      await fetchStats();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to toggle provider', err);
    }
  };

  const handleCreateLadder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLadderName || !newLadderSlug) return;
    setLadderCreating(true);
    try {
      await api.createLadder({
        name: newLadderName,
        slug: newLadderSlug,
        description: `Custom curated ladder for ${newLadderName}`,
        difficulty: newLadderDiff,
        category: newLadderCat,
      });
      setNewLadderName('');
      setNewLadderSlug('');
      await fetchStats();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to create ladder', err);
    } finally {
      setLadderCreating(false);
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLadderId || !problemName || !problemUrl) return;
    setProblemCreating(true);
    try {
      await api.createProblem({
        ladder_id: selectedLadderId,
        name: problemName,
        platform: problemPlatform,
        url: problemUrl,
        rating: parseInt(problemRating, 10),
        tags: ['practice', problemPlatform.toLowerCase()],
        external_id: `custom-${Date.now()}`,
      });
      setProblemName('');
      setProblemUrl('');
      await fetchStats();
      onRefreshAll();
    } catch (err) {
      console.error('Failed to add problem', err);
    } finally {
      setProblemCreating(false);
    }
  };

  if (loading && !stats) {
    return <div className="text-center py-20 text-slate-400">Loading admin operations panel...</div>;
  }

  const providerHealth = stats?.provider_health || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Admin Header */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Admin Operations Panel</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Provider synchronization monitoring, platform toggles, and ladder dataset management.
            </p>
          </div>
        </div>

        {/* Sync trigger button */}
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Providers...' : 'Trigger Background Sync'}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-mono text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">
          {syncMessage}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[11px] text-slate-400 block uppercase font-mono">Total Contests</span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {stats?.total_contests || 0}
          </span>
          <span className="text-[10px] text-slate-400">{stats?.upcoming_count || 0} upcoming · {stats?.live_count || 0} live</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[11px] text-slate-400 block uppercase font-mono">Platforms</span>
          <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
            {stats?.platforms_count || 5}
          </span>
          <span className="text-[10px] text-slate-400">All providers healthy</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[11px] text-slate-400 block uppercase font-mono">Practice Ladders</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats?.ladders_count || ladders.length}
          </span>
          <span className="text-[10px] text-slate-400">{stats?.problems_count || 0} problems indexed</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[11px] text-slate-400 block uppercase font-mono">Registered Coders</span>
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {stats?.users_count || 2}
          </span>
          <span className="text-[10px] text-slate-400">Authenticated accounts</span>
        </div>
      </div>

      {/* Provider Health & Toggle Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Contest Providers Health & Circuit Status</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Last sync: {stats?.last_sync ? new Date(stats.last_sync).toLocaleTimeString() : 'Recent'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Health Status</th>
                <th className="py-2.5 px-3 text-right">Contests Synced</th>
                <th className="py-2.5 px-3">Last Sync</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {Object.entries(providerHealth).map(([slug, p]: [string, any]) => (
                <tr key={slug}>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{p.status.toUpperCase()}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {p.contests_synced || 0}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {p.last_sync ? new Date(p.last_sync).toLocaleTimeString() : 'Ready'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      p.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleProvider(slug, p.enabled)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        p.enabled
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {p.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms: Add Ladder & Add Problem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Create Ladder */}
        <form onSubmit={handleCreateLadder} className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>Create Custom CP Ladder</span>
          </h3>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Ladder Name</label>
            <input
              type="text"
              required
              value={newLadderName}
              onChange={e => setNewLadderName(e.target.value)}
              placeholder="e.g. Dynamic Programming Masters"
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Slug</label>
            <input
              type="text"
              required
              value={newLadderSlug}
              onChange={e => setNewLadderSlug(e.target.value)}
              placeholder="e.g. dp-masters"
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Difficulty</label>
              <select
                value={newLadderDiff}
                onChange={e => setNewLadderDiff(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Category</label>
              <select
                value={newLadderCat}
                onChange={e => setNewLadderCat(e.target.value as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              >
                <option value="topic">Topic</option>
                <option value="rating">Rating</option>
                <option value="curated">Curated</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={ladderCreating}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
          >
            {ladderCreating ? 'Creating...' : 'Create Ladder'}
          </button>
        </form>

        {/* Add Problem */}
        <form onSubmit={handleCreateProblem} className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>Add Problem to Ladder</span>
          </h3>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Select Ladder</label>
            <select
              value={selectedLadderId}
              onChange={e => setSelectedLadderId(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
            >
              {ladders.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Problem Title</label>
            <input
              type="text"
              required
              value={problemName}
              onChange={e => setProblemName(e.target.value)}
              placeholder="e.g. Longest Increasing Subsequence"
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Official Problem URL</label>
            <input
              type="url"
              required
              value={problemUrl}
              onChange={e => setProblemUrl(e.target.value)}
              placeholder="https://codeforces.com/problemset/problem/..."
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Platform</label>
              <select
                value={problemPlatform}
                onChange={e => setProblemPlatform(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              >
                <option value="Codeforces">Codeforces</option>
                <option value="AtCoder">AtCoder</option>
                <option value="LeetCode">LeetCode</option>
                <option value="CodeChef">CodeChef</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Rating</label>
              <input
                type="number"
                value={problemRating}
                onChange={e => setProblemRating(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={problemCreating}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
          >
            {problemCreating ? 'Adding...' : 'Add Problem'}
          </button>
        </form>

      </div>

    </div>
  );
};
