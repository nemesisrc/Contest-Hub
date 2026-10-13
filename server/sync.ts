import { ContestProvider, ProviderHealth } from './providers/base';
import { CodeforcesProvider } from './providers/codeforces';
import { AtCoderProvider } from './providers/atcoder';
import { CodeChefProvider } from './providers/codechef';
import { LeetCodeProvider } from './providers/leetcode';
import { HackerRankProvider } from './providers/hackerrank';
import { db } from './db';
import { Contest } from '../src/types';

export class SyncService {
  private providers: Map<string, ContestProvider> = new Map();
  private intervalTimer: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;

  constructor() {
    this.registerProvider(new CodeforcesProvider());
    this.registerProvider(new AtCoderProvider());
    this.registerProvider(new CodeChefProvider());
    this.registerProvider(new LeetCodeProvider());
    this.registerProvider(new HackerRankProvider());
  }

  registerProvider(provider: ContestProvider) {
    this.providers.set(provider.slug, provider);
  }

  getProvider(slug: string): ContestProvider | undefined {
    return this.providers.get(slug);
  }

  getAllProviders(): ContestProvider[] {
    return Array.from(this.providers.values());
  }

  getHealthSummary(): Record<string, ProviderHealth> {
    const summary: Record<string, ProviderHealth> = {};
    for (const [slug, p] of this.providers.entries()) {
      summary[slug] = p.getHealth();
    }
    return summary;
  }

  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  async runSync(): Promise<{
    success: boolean;
    totalFetched: number;
    results: Record<string, { count: number; error?: string }>;
  }> {
    if (this.isSyncing) {
      return {
        success: false,
        totalFetched: 0,
        results: { error: { count: 0, error: 'Synchronization currently in progress' } },
      };
    }

    this.isSyncing = true;
    console.log('[SyncService] Starting background synchronization across all providers...');

    const allContests: Contest[] = [];
    const results: Record<string, { count: number; error?: string }> = {};

    for (const [slug, provider] of this.providers.entries()) {
      if (!provider.isEnabled()) {
        console.log(`[SyncService] Skipping disabled provider: ${provider.name}`);
        results[slug] = { count: 0, error: 'Provider is disabled in admin settings' };
        continue;
      }

      try {
        console.log(`[SyncService] Fetching from ${provider.name}...`);
        const contests = await provider.fetchContests();
        console.log(`[SyncService] Fetched ${contests.length} contests from ${provider.name}`);
        allContests.push(...contests);
        results[slug] = { count: contests.length };
      } catch (err: any) {
        console.error(`[SyncService] Failed to fetch from ${provider.name}:`, err);
        results[slug] = { count: 0, error: err.message || 'Unknown provider error' };
      }
    }

    // Upsert into persistent database (deduplicates automatically)
    const { inserted, updated } = db.upsertContests(allContests);
    this.lastSyncTime = new Date().toISOString();
    this.isSyncing = false;

    console.log(
      `[SyncService] Synchronization complete: ${allContests.length} processed (${inserted} inserted, ${updated} updated).`
    );

    return {
      success: true,
      totalFetched: allContests.length,
      results,
    };
  }

  startScheduledSync(intervalMinutes: number = 15): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    this.intervalTimer = setInterval(() => {
      console.log(`[SyncService] Periodic sync triggered (${intervalMinutes}m interval)`);
      this.runSync().catch(err => console.error('[SyncService] Scheduled sync error:', err));
    }, intervalMs);

    console.log(`[SyncService] Background worker active, polling every ${intervalMinutes} minutes.`);
  }

  stopScheduledSync(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}

export const syncService = new SyncService();
