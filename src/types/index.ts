export type ContestStatus = 'upcoming' | 'live' | 'finished';

export interface Contest {
  id: string;
  platform: string;
  external_id: string;
  name: string;
  start_time: string; // ISO 8601 UTC
  end_time: string;   // ISO 8601 UTC
  duration_seconds: number;
  url: string;
  contest_type?: string;
  division?: string;
  status: ContestStatus;
  platform_logo?: string;
  description?: string;
  source_type?: 'official_api' | 'public_feed' | 'curated';
  created_at?: string;
  updated_at?: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  logo_url: string;
  enabled: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  last_sync?: string;
  last_error?: string;
  contest_count: number;
  description?: string;
  api_policy_note?: string;
}

export type ProblemStatus = 'not_attempted' | 'attempted' | 'solved';

export interface Problem {
  id: string;
  ladder_id?: string;
  platform_id?: string;
  platform: string;
  external_id: string;
  name: string;
  url: string;
  rating: number;
  tags: string[];
  position?: number;
  status?: ProblemStatus;
}

export interface Ladder {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: string;
  rating_min?: number;
  rating_max?: number;
  category: 'rating' | 'topic' | 'curated';
  problem_count: number;
  problems?: Problem[];
  solved_count?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  timezone: string;
  role: 'user' | 'admin';
  created_at: string;
  solved_problems_count: number;
  attempted_problems_count: number;
  handles?: {
    codeforces?: string;
    leetcode?: string;
    atcoder?: string;
    codechef?: string;
    hackerrank?: string;
  };
}

export interface UserProgressMap {
  [problemId: string]: ProblemStatus;
}

export interface FilterState {
  platforms: string[];
  status: 'all' | 'upcoming' | 'live' | 'finished';
  dateRange: 'all' | 'today' | 'week' | 'month';
  contestType: string;
  division: string;
  search: string;
  sortBy: 'start_time_asc' | 'start_time_desc' | 'duration';
}

export interface SyncStats {
  total_contests: number;
  upcoming_count: number;
  live_count: number;
  finished_count: number;
  platforms_count: number;
  last_sync_timestamp: string;
  is_syncing: boolean;
  provider_health: {
    [slug: string]: {
      status: 'healthy' | 'degraded' | 'offline';
      last_sync: string;
      contests_synced: number;
      error?: string;
    };
  };
}
