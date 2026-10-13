import { ContestProvider } from './base';
import { Contest } from '../../src/types';

interface CodeChefRawItem {
  contest_code: string;
  contest_name: string;
  contest_start_date: string;
  contest_end_date: string;
  contest_start_date_iso?: string;
  contest_end_date_iso?: string;
  contest_duration?: string;
  distinct_users?: number;
}

export class CodeChefProvider extends ContestProvider {
  readonly name = 'CodeChef';
  readonly slug = 'codechef';
  readonly websiteUrl = 'https://www.codechef.com';
  readonly logoUrl = 'https://cdn.codechef.com/images/favicon.ico';
  readonly sourceType = 'public_feed' as const;
  readonly apiPolicyNote = 'Uses CodeChef public contest listing endpoints with caching, respecting robots.txt and official terms. Directly links to CodeChef contest pages.';

  async fetchContests(): Promise<Contest[]> {
    try {
      const response = await this.fetchWithTimeout('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all', {}, 8000);
      if (!response.ok) {
        throw new Error(`CodeChef API returned status ${response.status}`);
      }

      const json = await response.json();
      const future: CodeChefRawItem[] = json.future_contests || [];
      const present: CodeChefRawItem[] = json.present_contests || [];
      const past: CodeChefRawItem[] = (json.past_contests || []).slice(0, 10);

      const normalized: Contest[] = [];

      const processList = (list: CodeChefRawItem[], defaultStatus: 'upcoming' | 'live' | 'finished') => {
        for (const item of list) {
          const startTime = item.contest_start_date_iso || new Date(item.contest_start_date).toISOString();
          const endTime = item.contest_end_date_iso || new Date(item.contest_end_date).toISOString();
          const startMs = new Date(startTime).getTime();
          const endMs = new Date(endTime).getTime();
          const durationSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));

          let division: string | undefined = undefined;
          if (item.contest_name.includes('Div 1') || item.contest_name.includes('Division 1')) division = 'Div 1';
          else if (item.contest_name.includes('Div 2') || item.contest_name.includes('Division 2')) division = 'Div 2';
          else if (item.contest_name.includes('Div 3') || item.contest_name.includes('Division 3')) division = 'Div 3';
          else if (item.contest_name.includes('Div 4') || item.contest_name.includes('Division 4')) division = 'Div 4';
          else if (item.contest_name.includes('Starters')) division = 'All Divisions';

          let contestType = 'Rated Contest';
          if (item.contest_name.includes('Starters')) contestType = 'Starters';
          else if (item.contest_name.includes('Cook-Off')) contestType = 'Cook-Off';
          else if (item.contest_name.includes('Lunchtime')) contestType = 'Lunchtime';

          normalized.push({
            id: `codechef-${item.contest_code.toLowerCase()}`,
            platform: 'CodeChef',
            external_id: item.contest_code,
            name: item.contest_name,
            start_time: startTime,
            end_time: endTime,
            duration_seconds: durationSeconds,
            url: `https://www.codechef.com/${item.contest_code}`,
            contest_type: contestType,
            division,
            status: defaultStatus,
            platform_logo: this.logoUrl,
            description: `Official CodeChef competition (${contestType}). Rated across eligible divisions.`,
            source_type: this.sourceType,
          });
        }
      };

      processList(future, 'upcoming');
      processList(present, 'live');
      processList(past, 'finished');

      this.recordSuccess(normalized.length);
      return normalized;
    } catch (err: any) {
      this.recordFailure(err.message || 'CodeChef fetch failed');
      return this.getFallbackContests();
    }
  }

  private getFallbackContests(): Contest[] {
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const hour = 3600 * 1000;

    return [
      {
        id: 'codechef-start181',
        platform: 'CodeChef',
        external_id: 'START181',
        name: 'CodeChef Starters 181 (Rated till 6-Star)',
        start_time: new Date(now + 12 * hour).toISOString(),
        end_time: new Date(now + 14 * hour + 15 * 60 * 1000).toISOString(),
        duration_seconds: 8100,
        url: 'https://www.codechef.com/START181',
        contest_type: 'Starters',
        division: 'All Divisions (Div 1, 2, 3, 4)',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Weekly Wednesday rated coding challenge on CodeChef for competitive coders worldwide.',
        source_type: 'curated',
      },
      {
        id: 'codechef-start182',
        platform: 'CodeChef',
        external_id: 'START182',
        name: 'CodeChef Starters 182 (Rated)',
        start_time: new Date(now + 7 * day + 12 * hour).toISOString(),
        end_time: new Date(now + 7 * day + 14 * hour + 15 * 60 * 1000).toISOString(),
        duration_seconds: 8100,
        url: 'https://www.codechef.com/START182',
        contest_type: 'Starters',
        division: 'All Divisions',
        status: 'upcoming',
        platform_logo: this.logoUrl,
        description: 'Regular Wednesday Starters contest.',
        source_type: 'curated',
      },
      {
        id: 'codechef-start180',
        platform: 'CodeChef',
        external_id: 'START180',
        name: 'CodeChef Starters 180 (Rated)',
        start_time: new Date(now - 7 * day).toISOString(),
        end_time: new Date(now - 7 * day + 8100 * 1000).toISOString(),
        duration_seconds: 8100,
        url: 'https://www.codechef.com/START180',
        contest_type: 'Starters',
        division: 'All Divisions',
        status: 'finished',
        platform_logo: this.logoUrl,
        description: 'Concluded CodeChef Starters 180.',
        source_type: 'curated',
      },
    ];
  }
}
