import { Contest, Platform, Ladder, Problem, User, ProblemStatus } from '../types';

const BASE_URL = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('contesthub_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const api = {
  // Contests
  async getContests(params: {
    platforms?: string[];
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    contestType?: string;
    division?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ data: Contest[]; pagination: { page: number; limit: number; total: number; total_pages: number } }> {
    const query = new URLSearchParams();
    if (params.platforms && params.platforms.length > 0) {
      query.set('platform', params.platforms.join(','));
    }
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.startDate) query.set('start_date', params.startDate);
    if (params.endDate) query.set('end_date', params.endDate);
    if (params.contestType && params.contestType !== 'all') query.set('contest_type', params.contestType);
    if (params.division && params.division !== 'all') query.set('division', params.division);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sort) query.set('sort', params.sort);

    const res = await fetch(`${BASE_URL}/contests?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch contests: ${res.statusText}`);
    return res.json();
  },

  async getUpcomingContests(limit: number = 15): Promise<Contest[]> {
    const res = await fetch(`${BASE_URL}/contests/upcoming?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch upcoming contests');
    const json = await res.json();
    return json.data || [];
  },

  async getLiveContests(): Promise<Contest[]> {
    const res = await fetch(`${BASE_URL}/contests/live`);
    if (!res.ok) throw new Error('Failed to fetch live contests');
    const json = await res.json();
    return json.data || [];
  },

  async getRecentContests(limit: number = 10): Promise<Contest[]> {
    const res = await fetch(`${BASE_URL}/contests/recent?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch recent contests');
    const json = await res.json();
    return json.data || [];
  },

  async getContestById(id: string): Promise<Contest> {
    const res = await fetch(`${BASE_URL}/contests/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Contest ${id} not found`);
    const json = await res.json();
    return json.data;
  },

  // Platforms
  async getPlatforms(): Promise<Platform[]> {
    const res = await fetch(`${BASE_URL}/platforms`);
    if (!res.ok) throw new Error('Failed to fetch platforms');
    const json = await res.json();
    return json.data || [];
  },

  async getPlatformContests(slug: string, page: number = 1, limit: number = 20): Promise<{ platform: Platform; data: Contest[]; pagination: any }> {
    const res = await fetch(`${BASE_URL}/platforms/${slug}/contests?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch platform contests for ${slug}`);
    return res.json();
  },

  // Ladders
  async getLadders(): Promise<Ladder[]> {
    const res = await fetch(`${BASE_URL}/ladders`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch ladders');
    const json = await res.json();
    return json.data || [];
  },

  async getLadderById(id: string): Promise<Ladder> {
    const res = await fetch(`${BASE_URL}/ladders/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(`Failed to fetch ladder ${id}`);
    const json = await res.json();
    return json.data;
  },

  async getLadderProblems(ladderId: string): Promise<{ data: Problem[]; ladder_name: string }> {
    const res = await fetch(`${BASE_URL}/ladders/${ladderId}/problems`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(`Failed to fetch problems for ladder ${ladderId}`);
    return res.json();
  },

  async updateProblemStatus(problemId: string, status: ProblemStatus): Promise<{ success: boolean; status: ProblemStatus }> {
    const res = await fetch(`${BASE_URL}/problems/${problemId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update problem status');
    return res.json();
  },

  // Auth & Profile
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async register(data: { username: string; email: string; password: string; timezone?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Not authenticated');
    const json = await res.json();
    return json.data;
  },

  async getUserProgress(): Promise<{ progress: Record<string, ProblemStatus>; solvedCount: number; attemptedCount: number }> {
    const res = await fetch(`${BASE_URL}/users/me/progress`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch user progress');
    const json = await res.json();
    return json.data;
  },

  // Admin
  async getAdminStats(): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    const json = await res.json();
    return json.data;
  },

  async triggerSync(): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/sync`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to trigger synchronization');
    return res.json();
  },

  async toggleProvider(slug: string, enabled: boolean): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/providers/${slug}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error('Failed to toggle provider');
    return res.json();
  },

  async createLadder(data: any): Promise<Ladder> {
    const res = await fetch(`${BASE_URL}/admin/ladders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create ladder');
    const json = await res.json();
    return json.data;
  },

  async createProblem(data: any): Promise<Problem> {
    const res = await fetch(`${BASE_URL}/admin/problems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add problem');
    const json = await res.json();
    return json.data;
  },
};
