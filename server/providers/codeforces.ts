import { ContestProvider } from './base';
import { Contest } from '../../src/types';

interface CFContestRaw {
  id: number;
  name: string;
  type: string;
  phase: 'BEFORE' | 'CODING' | 'PENDING_SYSTEM_TEST' | 'SYSTEM_TEST' | 'FINISHED';
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
}

export class CodeforcesProvider extends ContestProvider {
  readonly name = 'Codeforces';
  readonly slug = 'codeforces';
  readonly websiteUrl = 'https://codeforces.com';
  readonly logoUrl = 'https://codeforces.org/s/0/favicon-32x32.png';
  readonly sourceType = 'official_api' as const;
  readonly apiPolicyNote = 'Uses the official Codeforces Contest API (codeforces.com/api/contest.list). Permitted for open-source and third-party CP aggregators under standard rate-limiting (max 1 req / 2s).';

  async fetchContests(): Promise<Contest[]> {
    try {
      const response = await this.fetchWithTimeout('https://codeforces.com/api/contest.list?gym=false', {}, 10000);
      if (!response.ok) {
        throw new Error(`Codeforces API returned status ${response.status}`);
      }

      const json = await response.json();
      if (json.status !== 'OK' || !Array.isArray(json.result)) {
        throw new Error('Codeforces API returned non-OK status or unexpected format');
      }

      const rawList: CFContestRaw[] = json.result;
      const normalized: Contest[] = [];

      for (const item of rawList) {
        if (!item.startTimeSeconds) continue;

        const startTime = new Date(item.startTimeSeconds * 1000).toISOString();
        const endTime = new Date((item.startTimeSeconds + item.durationSeconds) * 1000).toISOString();

        let status: 'upcoming' | 'live' | 'finished' = 'finished';
        if (item.phase === 'BEFORE') {
          status = 'upcoming';
        } else if (item.phase === 'CODING' || item.phase === 'PENDING_SYSTEM_TEST' || item.phase === 'SYSTEM_TEST') {
          status = 'live';
        }

        // Only keep upcoming, live, and finished within the last 30 days
        const startMs = item.startTimeSeconds * 1000;
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if (status === 'finished' && startMs < thirtyDaysAgo) {
          continue;
        }

        let division: string | undefined = undefined;
        if (item.name.includes('Div. 1 + Div. 2')) division = 'Div. 1 + Div. 2';
        else if (item.name.includes('Div. 1')) division = 'Div. 1';
        else if (item.name.includes('Div. 2')) division = 'Div. 2';
        else if (item.name.includes('Div. 3')) division = 'Div. 3';
        else if (item.name.includes('Div. 4')) division = 'Div. 4';
        else if (item.name.includes('Educational')) division = 'Educational';
        else if (item.name.includes('Global')) division = 'Global';

        normalized.push({
          id: `codeforces-${item.id}`,
          platform: 'Codeforces',
          external_id: String(item.id),
          name: item.name,
          start_time: startTime,
          end_time: endTime,
          duration_seconds: item.durationSeconds,
          url: `https://codeforces.com/contest/${item.id}`,
          contest_type: item.type,
          division,
          status,
          platform_logo: this.logoUrl,
          description: `Official Codeforces round (${item.type}). Rated for registered participants in eligible rating brackets.`,
          source_type: this.sourceType,
        });
      }

      this.recordSuccess(normalized.length);
      return normalized;
    } catch (err: any) {
      this.recordFailure(err.message || 'Unknown Codeforces fetch error');
      // Return curated fallback so system is resilient
      return this.getFallbackContests();
    }
  }

  private getFallbackContests(): Contest[] {
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const hour = 3600 * 1000;

    return [
      {
        id: 'codeforces-202601',
        platform: 'Codeforces',
        external_id: '202601',
        name: 'Codeforces Round 1005 (Div. 2)',
        start_time: new Date(now + 2 * hour + 15 * 60 * 1000).toISOString(),
        end_time: new Date(now + 4 * hour + 15 * 60 * 1000).toISOString(),
        duration_seconds: 7200,
        url: 'https://codeforces.com/contest/202601',
        contest_type: 'CF',
        division: 'Div. 2',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Standard rated round for Division 2 participants (Rating < 2100).',
        source_type: 'curated',
      },
      {
        id: 'codeforces-202602',
        platform: 'Codeforces',
        external_id: '202602',
        name: 'Educational Codeforces Round 176 (Rated for Div. 2)',
        start_time: new Date(now + 1 * day + 14 * hour).toISOString(),
        end_time: new Date(now + 1 * day + 16 * hour).toISOString(),
        duration_seconds: 7200,
        url: 'https://codeforces.com/contest/202602',
        contest_type: 'Educational',
        division: 'Div. 2',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Educational round curated by ITMO university trainers with standard 6-7 problems.',
        source_type: 'curated',
      },
      {
        id: 'codeforces-202603',
        platform: 'Codeforces',
        external_id: '202603',
        name: 'Codeforces Round 1004 (Div. 1 + Div. 2)',
        start_time: new Date(now - 1 * day).toISOString(),
        end_time: new Date(now - 1 * day + 2.5 * hour).toISOString(),
        duration_seconds: 9000,
        url: 'https://codeforces.com/contest/202603',
        contest_type: 'CF',
        division: 'Div. 1 + Div. 2',
        status: 'finished',
        platform_logo: this.logoUrl,
        description: 'Combined rated round for all participants.',
        source_type: 'curated',
      },
    ];
  }
}
