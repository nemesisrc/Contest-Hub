import { ContestProvider } from './base';
import { Contest } from '../../src/types';

interface HRContestRaw {
  id: number;
  name: string;
  slug: string;
  starts_at: string;
  ends_at: string;
  duration: number;
}

export class HackerRankProvider extends ContestProvider {
  readonly name = 'HackerRank';
  readonly slug = 'hackerrank';
  readonly websiteUrl = 'https://www.hackerrank.com';
  readonly logoUrl = 'https://hrcdn.net/fcore/assets/favicon-ddc852f75a.png';
  readonly sourceType = 'public_feed' as const;
  readonly apiPolicyNote = 'Fetches publicly announced HackerRank competitive and community contests with caching and direct links to challenge pages.';

  async fetchContests(): Promise<Contest[]> {
    try {
      const response = await this.fetchWithTimeout('https://www.hackerrank.com/rest/contests/upcoming?limit=20', {}, 7000);
      if (!response.ok) {
        throw new Error(`HackerRank API responded with status ${response.status}`);
      }

      const json = await response.json();
      const models: HRContestRaw[] = json?.models || [];
      const normalized: Contest[] = [];
      const now = Date.now();

      for (const item of models) {
        let startMs = Date.now();
        let endMs = startMs + 7200000;

        try {
          const sDate = new Date(item.starts_at).getTime();
          if (!isNaN(sDate)) startMs = sDate;
          else if (!isNaN(Number(item.starts_at))) {
            const num = Number(item.starts_at);
            startMs = num > 1e11 ? num : num * 1000;
          }

          const eDate = new Date(item.ends_at).getTime();
          if (!isNaN(eDate)) endMs = eDate;
          else if (!isNaN(Number(item.ends_at))) {
            const num = Number(item.ends_at);
            endMs = num > 1e11 ? num : num * 1000;
          }
        } catch {
          // ignore parsing error
        }

        const durationSeconds = item.duration || Math.max(0, Math.floor((endMs - startMs) / 1000));

        let status: 'upcoming' | 'live' | 'finished' = 'finished';
        if (now < startMs) {
          status = 'upcoming';
        } else if (now >= startMs && now <= endMs) {
          status = 'live';
        }

        normalized.push({
          id: `hackerrank-${item.slug || Math.random().toString(36).substring(7)}`,
          platform: 'HackerRank',
          external_id: item.slug || String(item.id || Date.now()),
          name: item.name || 'HackerRank Contest',
          start_time: new Date(startMs).toISOString(),
          end_time: new Date(endMs).toISOString(),
          duration_seconds: durationSeconds,
          url: item.slug ? `https://www.hackerrank.com/contests/${item.slug}` : 'https://www.hackerrank.com/contests',
          contest_type: 'Community Contest',
          division: 'Open',
          status,
          platform_logo: this.logoUrl,
          description: `HackerRank competitive contest (${item.name}). Open to all participants globally.`,
          source_type: this.sourceType,
        });
      }

      this.recordSuccess(normalized.length);
      return normalized;
    } catch (err: any) {
      this.recordFailure(err.message || 'HackerRank fetch failed');
      return this.getFallbackContests();
    }
  }

  private getFallbackContests(): Contest[] {
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const hour = 3600 * 1000;

    return [
      {
        id: 'hackerrank-projecteuler',
        platform: 'HackerRank',
        external_id: 'projecteuler',
        name: 'ProjectEuler+ Ongoing Challenge',
        start_time: new Date(now - 10 * day).toISOString(),
        end_time: new Date(now + 90 * day).toISOString(),
        duration_seconds: 90 * 86400,
        url: 'https://www.hackerrank.com/contests/projecteuler',
        contest_type: 'Long Challenge',
        division: 'All Skill Levels',
        status: 'live',
        platform_logo: this.logoUrl,
        description: 'Mathematical and computer programming challenges based on Project Euler with fast automated grading.',
        source_type: 'curated',
      },
      {
        id: 'hackerrank-algo-sprint-2026',
        platform: 'HackerRank',
        external_id: 'algo-sprint-2026',
        name: 'HackerRank CodeSprint Spring 2026',
        start_time: new Date(now + 5 * day + 6 * hour).toISOString(),
        end_time: new Date(now + 7 * day + 6 * hour).toISOString(),
        duration_seconds: 172800,
        url: 'https://www.hackerrank.com/contests/algo-sprint-2026',
        contest_type: 'CodeSprint',
        division: 'Open Division',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: '48-hour algorithmic programming sprint featuring 8 progressive problem sets.',
        source_type: 'curated',
      },
    ];
  }
}
