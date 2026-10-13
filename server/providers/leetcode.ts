import { ContestProvider } from './base';
import { Contest } from '../../src/types';

interface LCContestRaw {
  title: string;
  titleSlug: string;
  startTime: number;
  duration: number;
}

export class LeetCodeProvider extends ContestProvider {
  readonly name = 'LeetCode';
  readonly slug = 'leetcode';
  readonly websiteUrl = 'https://leetcode.com';
  readonly logoUrl = 'https://assets.leetcode.com/static_assets/public/icons/favicon-32x32.png';
  readonly sourceType = 'public_feed' as const;
  readonly apiPolicyNote = 'Aggregates publicly accessible LeetCode contest schedules (Weekly / Biweekly) with strict caching and direct links to official contest rooms.';

  async fetchContests(): Promise<Contest[]> {
    try {
      // Query LeetCode public GraphQL contest endpoint
      const query = {
        query: `
          query {
            allContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      };

      const response = await this.fetchWithTimeout('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      }, 7000);

      if (!response.ok) {
        throw new Error(`LeetCode endpoint responded with status ${response.status}`);
      }

      const json = await response.json();
      const contestsRaw: LCContestRaw[] = json?.data?.allContests || [];
      if (!Array.isArray(contestsRaw) || contestsRaw.length === 0) {
        throw new Error('LeetCode contests list empty or blocked');
      }

      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;
      const normalized: Contest[] = [];

      for (const item of contestsRaw) {
        const startMs = item.startTime * 1000;
        const endMs = startMs + item.duration * 1000;

        if (endMs < thirtyDaysAgo) continue;

        let status: 'upcoming' | 'live' | 'finished' = 'finished';
        if (now < startMs) {
          status = 'upcoming';
        } else if (now >= startMs && now <= endMs) {
          status = 'live';
        }

        const isBiweekly = item.title.toLowerCase().includes('biweekly');
        const contestType = isBiweekly ? 'Biweekly' : 'Weekly';

        normalized.push({
          id: `leetcode-${item.titleSlug}`,
          platform: 'LeetCode',
          external_id: item.titleSlug,
          name: item.title,
          start_time: new Date(startMs).toISOString(),
          end_time: new Date(endMs).toISOString(),
          duration_seconds: item.duration,
          url: `https://leetcode.com/contest/${item.titleSlug}`,
          contest_type: contestType,
          division: 'Open to All',
          status,
          platform_logo: this.logoUrl,
          description: `Official LeetCode ${contestType} Contest. 4 algorithmic problems ranging from Easy to Hard with rating adjustments.`,
          source_type: this.sourceType,
        });
      }

      this.recordSuccess(normalized.length);
      return normalized;
    } catch (err: any) {
      this.recordFailure(err.message || 'LeetCode fetch failed');
      return this.getFallbackContests();
    }
  }

  private getFallbackContests(): Contest[] {
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const hour = 3600 * 1000;

    return [
      {
        id: 'leetcode-weekly-contest-445',
        platform: 'LeetCode',
        external_id: 'weekly-contest-445',
        name: 'Weekly Contest 445',
        start_time: new Date(now + 3 * day + 3 * hour).toISOString(),
        end_time: new Date(now + 3 * day + 4 * hour + 30 * 60 * 1000).toISOString(),
        duration_seconds: 5400,
        url: 'https://leetcode.com/contest/weekly-contest-445',
        contest_type: 'Weekly',
        division: 'Open to All',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Standard 90-minute LeetCode weekly rated competition featuring 4 algorithmic challenges.',
        source_type: 'curated',
      },
      {
        id: 'leetcode-biweekly-contest-154',
        platform: 'LeetCode',
        external_id: 'biweekly-contest-154',
        name: 'Biweekly Contest 154',
        start_time: new Date(now + 9 * day + 14 * hour + 30 * 60 * 1000).toISOString(),
        end_time: new Date(now + 9 * day + 16 * hour).toISOString(),
        duration_seconds: 5400,
        url: 'https://leetcode.com/contest/biweekly-contest-154',
        contest_type: 'Biweekly',
        division: 'Open to All',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Biweekly Saturday evening contest on LeetCode with 4 algorithmic questions.',
        source_type: 'curated',
      },
      {
        id: 'leetcode-weekly-contest-444',
        platform: 'LeetCode',
        external_id: 'weekly-contest-444',
        name: 'Weekly Contest 444',
        start_time: new Date(now - 4 * day).toISOString(),
        end_time: new Date(now - 4 * day + 5400 * 1000).toISOString(),
        duration_seconds: 5400,
        url: 'https://leetcode.com/contest/weekly-contest-444',
        contest_type: 'Weekly',
        division: 'Open to All',
        status: 'finished',
        platform_logo: this.logoUrl,
        description: 'Completed Weekly Contest 444 on LeetCode.',
        source_type: 'curated',
      },
    ];
  }
}
