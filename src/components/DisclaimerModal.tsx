import React from 'react';
import { X, ShieldCheck, Scale, ExternalLink, HeartHandshake } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Legal Disclaimer & Data Source Attribution</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Platform Terms of Service, API Polling Policy, and Fair Use</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>1. Aggregator Role & Content Ownership</span>
            </h3>
            <p>
              ContestHub is an independent competitive programming schedule indexer and practice ladder aggregator.
              <strong> ContestHub does NOT own, claim copyright over, or re-license any contest questions, contest brand names, or editorial content.</strong>
              All trademarks, contest logos, and problem sets belong entirely to their respective platforms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-zinc-300">
              <li><strong>Codeforces:</strong> Hosted and maintained by Codeforces and ITMO University.</li>
              <li><strong>AtCoder:</strong> Hosted by AtCoder Inc.</li>
              <li><strong>CodeChef:</strong> Hosted by Unacademy / CodeChef.</li>
              <li><strong>LeetCode:</strong> Hosted by LeetCode LLC.</li>
              <li><strong>HackerRank:</strong> Hosted by HackerRank.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-indigo-500" />
              <span>2. Respect for Robots.txt and Rate Limits</span>
            </h3>
            <p>
              All contest synchronizations run on scheduled, rate-limited intervals (15 to 30 minutes) using official public APIs where provided (such as the Codeforces Contest API) or publicly available schedule feeds. We strictly prohibit aggressive scraping, bypass of bot protections, or CAPTCHA circumvention.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              3. A2OJ-Style Practice Ladders & Problem Statements
            </h3>
            <p>
              To respect intellectual property and authors' rights, ContestHub ladders only index metadata (problem name, rating, external platform ID, and difficulty tags). We do not reproduce full statement texts. Clicking any problem routes the user directly to the official platform where the author's work is credited and solved.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              4. Contact and Removal Requests
            </h3>
            <p>
              If you represent any platform or copyright holder and wish for your schedule feed or provider adapter to be adjusted or disabled, administrators can instantly toggle the provider off via our Admin Panel or reach our engineering team.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
