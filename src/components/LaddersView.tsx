import React, { useState } from 'react';
import { Award, CheckCircle2, Circle, Clock, ExternalLink, Filter, Search, ArrowLeft, TrendingUp, Sparkles } from 'lucide-react';
import { Ladder, Problem, ProblemStatus } from '../types';
import { api } from '../services/api';

interface LaddersViewProps {
  ladders: Ladder[];
  onSelectProblem?: (problem: Problem) => void;
  onRefreshLadders: () => void;
}

export const LaddersView: React.FC<LaddersViewProps> = ({
  ladders,
  onRefreshLadders,
}) => {
  const [selectedLadder, setSelectedLadder] = useState<Ladder | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'rating' | 'topic'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [updatingProblemId, setUpdatingProblemId] = useState<string | null>(null);

  // Exclude any ladders that have no questions
  const validLadders = ladders.filter(lad => (lad.problem_count || 0) > 0);

  const filteredLadders = validLadders.filter(lad => {
    if (activeCategory !== 'all' && lad.category !== activeCategory) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return lad.name.toLowerCase().includes(q) || lad.description.toLowerCase().includes(q) || lad.difficulty.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenLadder = async (ladder: Ladder) => {
    setSelectedLadder(ladder);
    setLoadingProblems(true);
    try {
      const fullLadder = await api.getLadderById(ladder.id);
      setSelectedLadder(fullLadder);
    } catch (err) {
      console.error('Failed to load ladder details:', err);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleToggleProblemStatus = async (problemId: string, currentStatus?: ProblemStatus) => {
    let nextStatus: ProblemStatus = 'attempted';
    if (!currentStatus || currentStatus === 'not_attempted') {
      nextStatus = 'attempted';
    } else if (currentStatus === 'attempted') {
      nextStatus = 'solved';
    } else {
      nextStatus = 'not_attempted';
    }

    setUpdatingProblemId(problemId);
    try {
      await api.updateProblemStatus(problemId, nextStatus);
      // Update local ladder state
      if (selectedLadder && selectedLadder.problems) {
        const updatedProblems = selectedLadder.problems.map(p =>
          p.id === problemId ? { ...p, status: nextStatus } : p
        );
        const newSolvedCount = updatedProblems.filter(p => p.status === 'solved').length;
        setSelectedLadder({
          ...selectedLadder,
          problems: updatedProblems,
          solved_count: newSolvedCount,
        });
      }
      onRefreshLadders();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingProblemId(null);
    }
  };

  // If a ladder is selected, render the detailed problem table view
  if (selectedLadder) {
    const problems = selectedLadder.problems || [];
    const totalCount = problems.length || selectedLadder.problem_count || 1;
    const solvedCount = selectedLadder.solved_count || 0;
    const percentage = Math.round((solvedCount / totalCount) * 100);

    return (
      <div className="space-y-6">
        {/* Back header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedLadder(null)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{selectedLadder.difficulty}</span>
                <span>·</span>
                <span>Rating: {selectedLadder.rating_min || '800'} – {selectedLadder.rating_max || 'Any'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {selectedLadder.name}
              </h2>
            </div>
          </div>

          {/* Progress Pill Bar */}
          <div className="bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 sm:w-64">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              <span>Ladder Progress</span>
              <span className="font-mono">{solvedCount} / {totalCount} ({percentage}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ladder description */}
        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          {selectedLadder.description}
        </p>

        {/* Problems List */}
        {loadingProblems ? (
          <div className="text-center py-16 text-slate-400">Loading ladder problems...</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No problems found for this ladder.</div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Problem Name</th>
                    <th className="py-3 px-4 w-28">Platform</th>
                    <th className="py-3 px-4 w-24 text-right">Rating</th>
                    <th className="py-3 px-4">Tags</th>
                    <th className="py-3 px-4 w-32 text-center">Your Status</th>
                    <th className="py-3 px-4 w-24 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {problems.map((prob, idx) => {
                    const isSolved = prob.status === 'solved';
                    const isAttempted = prob.status === 'attempted';

                    return (
                      <tr
                        key={prob.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                          isSolved ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5"
                          >
                            <span>{prob.name}</span>
                            <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                              ({prob.external_id})
                            </span>
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 font-medium">
                          {prob.platform}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {prob.rating}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">
                          <span className="truncate block max-w-xs">
                            {prob.tags && prob.tags.length > 0 ? prob.tags.join(', ') : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleProblemStatus(prob.id, prob.status)}
                            disabled={updatingProblemId === prob.id}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all inline-flex items-center gap-1.5 ${
                              isSolved
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                : isAttempted
                                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                            }`}
                            title="Click to cycle status: Not Attempted -> Attempted -> Solved"
                          >
                            {isSolved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Solved</span>
                              </>
                            ) : isAttempted ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Attempted</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Not Attempted</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1 p-1"
                            title="Open official problem"
                          >
                            <span>Solve</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ladder Browser Grid View
  return (
    <div className="space-y-6">
      
      {/* Intro banner */}
      <div className="bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-transparent p-6 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>A2OJ-Style Practice Ladders</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Level Up Your Competitive Programming Skills
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Curated progressive problem ladders ordered by difficulty rating and core algorithmic topics. Track your solve progress across Codeforces, AtCoder, and LeetCode problems.
          </p>
        </div>
      </div>

      {/* Filter and Category tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Ladders ({validLadders.length})
          </button>
          <button
            onClick={() => setActiveCategory('rating')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'rating'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Rating Ladders ({validLadders.filter(l => l.category === 'rating').length})
          </button>
          <button
            onClick={() => setActiveCategory('topic')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === 'topic'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Topic Ladders ({validLadders.filter(l => l.category === 'topic').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search ladder name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Ladders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLadders.map(ladder => {
          const solved = ladder.solved_count || 0;
          const total = ladder.problem_count || 1;
          const pct = Math.round((solved / total) * 100);

          return (
            <div
              key={ladder.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {ladder.difficulty}
                  </span>
                  <span className="font-mono">
                    {ladder.rating_min ? `${ladder.rating_min} – ${ladder.rating_max || 'Any'}` : 'Topic Focus'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {ladder.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {ladder.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 font-mono mb-1">
                    <span>Solved: {solved} / {total}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Open ladder button */}
                <button
                  onClick={() => handleOpenLadder(ladder)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Practice Ladder</span>
                  <TrendingUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
