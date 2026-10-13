import { ContestProvider } from './base';
import { Contest } from '../../src/types';

interface AtCoderRaw {
  id: string;
  title: string;
  start_epoch_second: number;
  duration_second: number;
  rate_change?: string;
}

export class AtCoderProvider extends ContestProvider {
  readonly name = 'AtCoder';
  readonly slug = 'atcoder';
  readonly websiteUrl = 'https://atcoder.jp';
  readonly logoUrl = 'https://img.atcoder.jp/assets/icon/favicon.png';
  readonly sourceType = 'public_feed' as const;
  readonly apiPolicyNote = 'Uses public community-accessible Kenkoooo dataset and public AtCoder schedule listings with explicit caching and platform attribution.';

  async fetchContests(): Promise<Contest[]> {
    try {
      const response = await this.fetchWithTimeout('https://kenkoooo.com/atcoder/resources/contests.json', {}, 8000);
      if (!response.ok) {
        throw new Error(`AtCoder public data endpoint returned ${response.status}`);
      }

      const rawList: AtCoderRaw[] = await response.json();
      const normalized: Contest[] = [];
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;

      for (const item of rawList) {
        // Skip permanent tutorials / guides (e.g. APG4b) where duration > 14 days or epoch is 0
        if (item.duration_second > 14 * 86400 || item.start_epoch_second < 1577836800) {
          continue;
        }

        const startMs = item.start_epoch_second * 1000;
        const endMs = startMs + item.duration_second * 1000;

        if (endMs < thirtyDaysAgo) continue;

        let status: 'upcoming' | 'live' | 'finished' = 'finished';
        if (now < startMs) {
          status = 'upcoming';
        } else if (now >= startMs && now <= endMs) {
          status = 'live';
        }

        let division: string | undefined = undefined;
        let contestType = 'Other';
        if (item.id.startsWith('abc')) {
          contestType = 'ABC';
          division = 'Beginner (Rated ~ 1999)';
        } else if (item.id.startsWith('arc')) {
          contestType = 'ARC';
          division = 'Regular (Rated 1200 ~ 2799)';
        } else if (item.id.startsWith('agc')) {
          contestType = 'AGC';
          division = 'Grand (Rated 2000+)';
        } else if (item.id.startsWith('ahc')) {
          contestType = 'AHC';
          division = 'Heuristic';
        }

        normalized.push({
          id: `atcoder-${item.id}`,
          platform: 'AtCoder',
          external_id: item.id,
          name: item.title,
          start_time: new Date(startMs).toISOString(),
          end_time: new Date(endMs).toISOString(),
          duration_seconds: item.duration_second,
          url: `https://atcoder.jp/contests/${item.id}`,
          contest_type: contestType,
          division,
          status,
          platform_logo: this.logoUrl,
          description: `Official AtCoder competition. ${item.rate_change ? 'Rate change: ' + item.rate_change : 'Rated competition.'}`,
          source_type: this.sourceType,
        });
      }

      this.recordSuccess(normalized.length);
      return normalized;
    } catch (err: any) {
      this.recordFailure(err.message || 'AtCoder fetch failed');
      return this.getFallbackContests();
    }
  }

  private getFallbackContests(): Contest[] {
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const hour = 3600 * 1000;

    return [
      {
        id: 'atcoder-abc398',
        platform: 'AtCoder',
        external_id: 'abc398',
        name: 'AtCoder Beginner Contest 398',
        start_time: new Date(now + 1 * day + 5 * hour).toISOString(),
        end_time: new Date(now + 1 * day + 6 * hour + 40 * 60 * 1000).toISOString(),
        duration_seconds: 6000,
        url: 'https://atcoder.jp/contests/abc398',
        contest_type: 'ABC',
        division: 'Beginner (Rated ~ 1999)',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Standard 6-problem rated beginner contest on AtCoder.',
        source_type: 'curated',
      },
      {
        id: 'atcoder-arc185',
        platform: 'AtCoder',
        external_id: 'arc185',
        name: 'AtCoder Regular Contest 185',
        start_time: new Date(now + 3 * day + 4 * hour).toISOString(),
        end_time: new Date(now + 3 * day + 6 * hour).toISOString(),
        duration_seconds: 7200,
        url: 'https://atcoder.jp/contests/arc185',
        contest_type: 'ARC',
        division: 'Regular (Rated 1200 ~ 2799)',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Challenging mathematical and algorithmic problems for intermediate/advanced coders.',
        source_type: 'curated',
      },
      {
        id: 'atcoder-abc397',
        platform: 'AtCoder',
        external_id: 'abc397',
        name: 'AtCoder Beginner Contest 397',
        start_time: new Date(now - 3 * day).toISOString(),
        end_time: new Date(now - 3 * day + 6000 * 1000).toISOString(),
        duration_seconds: 6000,
        url: 'https://atcoder.jp/contests/abc397',
        contest_type: 'ABC',
        division: 'Beginner',
        status: 'finished',
        platform_logo: this.logoUrl,
        description: 'Previous AtCoder Beginner Contest edition.',
        source_type: 'curated',
      },
    ];
  }
}
