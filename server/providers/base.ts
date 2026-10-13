import { Contest } from '../../src/types';

export interface ProviderHealth {
  slug: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  last_sync: string | null;
  last_error: string | null;
  contests_synced: number;
  enabled: boolean;
}

export abstract class ContestProvider {
  abstract readonly name: string;
  abstract readonly slug: string;
  abstract readonly websiteUrl: string;
  abstract readonly logoUrl: string;
  abstract readonly sourceType: 'official_api' | 'public_feed' | 'curated';
  abstract readonly apiPolicyNote: string;

  protected enabled: boolean = true;
  protected lastSync: string | null = null;
  protected lastError: string | null = null;
  protected lastContestCount: number = 0;
  protected status: 'healthy' | 'degraded' | 'offline' = 'healthy';

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(val: boolean): void {
    this.enabled = val;
  }

  getHealth(): ProviderHealth {
    return {
      slug: this.slug,
      name: this.name,
      status: this.status,
      last_sync: this.lastSync,
      last_error: this.lastError,
      contests_synced: this.lastContestCount,
      enabled: this.enabled,
    };
  }

  /**
   * Fetch contests from the provider.
   * Implementations must normalize all data into the standard Contest structure.
   */
  abstract fetchContests(): Promise<Contest[]>;

  /**
   * Helper to perform safe fetch with timeout
   */
  protected async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 8000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'ContestHub-Aggregator/1.0 (https://contesthub.dev; contact: dev@contesthub.dev)',
          'Accept': 'application/json, text/plain, */*',
          ...(options.headers || {}),
        },
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Record synchronization outcome
   */
  recordSuccess(count: number): void {
    this.lastSync = new Date().toISOString();
    this.lastError = null;
    this.lastContestCount = count;
    this.status = 'healthy';
  }

  recordFailure(errorMsg: string): void {
    this.lastError = errorMsg;
    this.status = this.lastSync ? 'degraded' : 'offline';
  }
}
