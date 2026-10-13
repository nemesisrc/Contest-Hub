import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Contest, Platform, Ladder, Problem, User, ProblemStatus } from '../src/types';
import { INITIAL_LADDERS, INITIAL_PROBLEMS } from './data/ladders';

export interface DatabaseState {
  platforms: Record<string, Platform>;
  contests: Record<string, Contest>; // keyed by platform:external_id
  ladders: Ladder[];
  problems: Problem[];
  users: (User & { password_hash: string; salt: string })[];
  user_progress: Record<string, Record<string, ProblemStatus>>; // userId -> problemId -> status
  last_sync: string | null;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitial();
  }

  private loadInitial(): DatabaseState {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      } catch (err) {
        console.error('Failed to parse existing db.json, reinitializing', err);
      }
    }

    // Default Seed Data
    const defaultPlatforms: Record<string, Platform> = {
      codeforces: {
        id: 'platform-cf',
        name: 'Codeforces',
        slug: 'codeforces',
        website_url: 'https://codeforces.com',
        logo_url: 'https://codeforces.org/s/0/favicon-32x32.png',
        enabled: true,
        status: 'healthy',
        contest_count: 0,
        description: 'World-renowned Russian competitive programming platform hosting regular Div 1, 2, 3, 4 and Educational rounds.',
        api_policy_note: 'Official Codeforces API (codeforces.com/api). Rate limit 1 request/2s strictly respected.',
      },
      atcoder: {
        id: 'platform-ac',
        name: 'AtCoder',
        slug: 'atcoder',
        website_url: 'https://atcoder.jp',
        logo_url: 'https://img.atcoder.jp/assets/icon/favicon.png',
        enabled: true,
        status: 'healthy',
        contest_count: 0,
        description: 'Premier Japanese competitive programming platform known for high problem quality in ABC, ARC, AGC, and AHC.',
        api_policy_note: 'Public syndication feeds and Kenkoooo AtCoder open dataset with respectful cache intervals.',
      },
      codechef: {
        id: 'platform-cc',
        name: 'CodeChef',
        slug: 'codechef',
        website_url: 'https://www.codechef.com',
        logo_url: 'https://cdn.codechef.com/images/favicon.ico',
        enabled: true,
        status: 'healthy',
        contest_count: 0,
        description: 'Global competitive programming community hosting weekly Wednesday Starters and divisional challenges.',
        api_policy_note: 'CodeChef public contest listing endpoints with rate-limiting and direct contest links.',
      },
      leetcode: {
        id: 'platform-lc',
        name: 'LeetCode',
        slug: 'leetcode',
        website_url: 'https://leetcode.com',
        logo_url: 'https://assets.leetcode.com/static_assets/public/icons/favicon-32x32.png',
        enabled: true,
        status: 'healthy',
        contest_count: 0,
        description: 'Leading technical interview and CP platform hosting weekly and biweekly algorithm competitions.',
        api_policy_note: 'Public schedule endpoints with caching and attribution.',
      },
      hackerrank: {
        id: 'platform-hr',
        name: 'HackerRank',
        slug: 'hackerrank',
        website_url: 'https://www.hackerrank.com',
        logo_url: 'https://hrcdn.net/fcore/assets/favicon-ddc852f75a.png',
        enabled: true,
        status: 'healthy',
        contest_count: 0,
        description: 'Popular technical challenge portal hosting open algorithm sprints and specialized hackathons.',
        api_policy_note: 'Public contest schedule listing with platform attribution.',
      },
    };

    // Pre-create admin user
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminHash = hashPassword('AdminPass123!', adminSalt);

    const demoUserSalt = crypto.randomBytes(16).toString('hex');
    const demoUserHash = hashPassword('Tourist123!', demoUserSalt);

    const initialUsers = [
      {
        id: 'user-admin',
        username: 'admin',
        email: 'admin@contesthub.dev',
        timezone: 'Asia/Kolkata',
        role: 'admin' as const,
        created_at: new Date().toISOString(),
        solved_problems_count: 5,
        attempted_problems_count: 2,
        password_hash: adminHash,
        salt: adminSalt,
        handles: {
          codeforces: 'tourist',
          leetcode: 'neal_wu',
          atcoder: 'chokudai',
        },
      },
      {
        id: 'user-demo',
        username: 'coder_rajdeep',
        email: 'coder@contesthub.dev',
        timezone: 'Asia/Kolkata',
        role: 'user' as const,
        created_at: new Date().toISOString(),
        solved_problems_count: 3,
        attempted_problems_count: 1,
        password_hash: demoUserHash,
        salt: demoUserSalt,
        handles: {
          codeforces: 'rajdeep_dev',
          leetcode: 'rajdeep_c',
          codechef: 'rajdeep_code',
        },
      },
    ];

    const initialProgress: Record<string, Record<string, ProblemStatus>> = {
      'user-demo': {
        'prob-4A': 'solved',
        'prob-71A': 'solved',
        'prob-231A': 'solved',
        'prob-158A': 'attempted',
      },
      'user-admin': {
        'prob-4A': 'solved',
        'prob-71A': 'solved',
        'prob-231A': 'solved',
        'prob-158A': 'solved',
        'prob-282A': 'solved',
        'prob-50A': 'attempted',
      },
    };

    const initial: DatabaseState = {
      platforms: defaultPlatforms,
      contests: {},
      ladders: INITIAL_LADDERS,
      problems: INITIAL_PROBLEMS,
      users: initialUsers,
      user_progress: initialProgress,
      last_sync: null,
    };

    this.saveState(initial);
    return initial;
  }

  private saveState(state: DatabaseState): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json', err);
    }
  }

  // --- Contests Repository ---

  /**
   * Upsert contests enforcing unique constraint: platform + ':' + external_id
   */
  upsertContests(newContests: Contest[]): { inserted: number; updated: number } {
    let inserted = 0;
    let updated = 0;
    const now = new Date().toISOString();

    for (const contest of newContests) {
      const key = `${contest.platform.toLowerCase()}:${contest.external_id}`;
      const existing = this.state.contests[key];

      if (existing) {
        this.state.contests[key] = {
          ...existing,
          ...contest,
          updated_at: now,
        };
        updated++;
      } else {
        this.state.contests[key] = {
          ...contest,
          created_at: now,
          updated_at: now,
        };
        inserted++;
      }
    }

    // Update platform contest counts
    for (const p of Object.values(this.state.platforms)) {
      const count = Object.values(this.state.contests).filter(
        c => c.platform.toLowerCase() === p.name.toLowerCase()
      ).length;
      p.contest_count = count;
    }

    this.state.last_sync = now;
    this.saveState(this.state);
    return { inserted, updated };
  }

  getAllContests(): Contest[] {
    return Object.values(this.state.contests);
  }

  getContestById(id: string): Contest | undefined {
    // Try by exact id (e.g. codeforces-202601) or by platform:external_id
    for (const c of Object.values(this.state.contests)) {
      if (c.id === id || `${c.platform.toLowerCase()}:${c.external_id}` === id.toLowerCase()) {
        return c;
      }
    }
    return undefined;
  }

  queryContests(params: {
    platforms?: string[];
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    contestType?: string;
    division?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  }): { data: Contest[]; total: number; page: number; limit: number } {
    let list = Object.values(this.state.contests);

    // Filter by enabled platforms
    list = list.filter(c => {
      const platSlug = c.platform.toLowerCase();
      const plat = this.state.platforms[platSlug];
      return plat ? plat.enabled : true;
    });

    // Recalculate dynamic live/upcoming status based on current time
    const now = Date.now();
    list = list.map(c => {
      const s = new Date(c.start_time).getTime();
      const e = new Date(c.end_time).getTime();
      let status: 'upcoming' | 'live' | 'finished' = 'finished';
      if (now < s) status = 'upcoming';
      else if (now >= s && now <= e) status = 'live';
      return { ...c, status };
    });

    // Filter by platforms
    if (params.platforms && params.platforms.length > 0) {
      const allowed = params.platforms.map(p => p.toLowerCase());
      list = list.filter(c => allowed.includes(c.platform.toLowerCase()));
    }

    // Filter by status
    if (params.status && params.status !== 'all') {
      list = list.filter(c => c.status === params.status);
    }

    // Filter by search query
    if (params.search && params.search.trim() !== '') {
      const query = params.search.toLowerCase().trim();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.platform.toLowerCase().includes(query) ||
          c.external_id.toLowerCase().includes(query) ||
          (c.contest_type && c.contest_type.toLowerCase().includes(query)) ||
          (c.division && c.division.toLowerCase().includes(query))
      );
    }

    // Filter by date range
    if (params.startDate) {
      const sLimit = new Date(params.startDate).getTime();
      list = list.filter(c => new Date(c.start_time).getTime() >= sLimit);
    }
    if (params.endDate) {
      const eLimit = new Date(params.endDate).getTime();
      list = list.filter(c => new Date(c.start_time).getTime() <= eLimit);
    }

    // Filter by contest type
    if (params.contestType && params.contestType !== 'all') {
      list = list.filter(c => c.contest_type?.toLowerCase() === params.contestType?.toLowerCase());
    }

    // Filter by division
    if (params.division && params.division !== 'all') {
      list = list.filter(c => c.division?.toLowerCase().includes(params.division?.toLowerCase() || ''));
    }

    // Sorting
    if (params.sortBy === 'start_time_desc') {
      list.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    } else if (params.sortBy === 'duration') {
      list.sort((a, b) => a.duration_seconds - b.duration_seconds);
    } else {
      // Standard CP Aggregator order:
      // 1. Live contests first
      // 2. Upcoming contests next (earliest start time first)
      // 3. Finished contests last (most recent first)
      const getPriority = (status: string) => {
        if (status === 'live') return 1;
        if (status === 'upcoming') return 2;
        return 3;
      };

      list.sort((a, b) => {
        const pA = getPriority(a.status);
        const pB = getPriority(b.status);
        if (pA !== pB) return pA - pB;

        const timeA = new Date(a.start_time).getTime();
        const timeB = new Date(b.start_time).getTime();

        if (a.status === 'finished') {
          return timeB - timeA;
        }

        return timeA - timeB;
      });
    }

    const total = list.length;
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      limit,
    };
  }

  // --- Platforms Repository ---

  getPlatforms(): Platform[] {
    return Object.values(this.state.platforms);
  }

  getPlatformBySlug(slug: string): Platform | undefined {
    return this.state.platforms[slug.toLowerCase()];
  }

  togglePlatform(slug: string, enabled: boolean): Platform | undefined {
    const key = slug.toLowerCase();
    const plat = this.state.platforms[key];
    if (plat) {
      plat.enabled = enabled;
      this.saveState(this.state);
      return plat;
    }
    return undefined;
  }

  // --- Ladders & Problems Repository ---

  getLadders(userId?: string): Ladder[] {
    return this.state.ladders
      .map(ladder => {
        const ladderProblems = this.state.problems.filter(p => p.ladder_id === ladder.id);
        let solvedCount = 0;
        if (userId && this.state.user_progress[userId]) {
          solvedCount = ladderProblems.filter(
            p => this.state.user_progress[userId][p.id] === 'solved'
          ).length;
        }
        return {
          ...ladder,
          problem_count: ladderProblems.length,
          solved_count: solvedCount,
        };
      })
      .filter(ladder => (ladder.problem_count || 0) > 0);
  }

  getLadderById(id: string, userId?: string): Ladder | undefined {
    const ladder = this.state.ladders.find(l => l.id === id || l.slug === id);
    if (!ladder) return undefined;

    const problems = this.getProblemsForLadder(ladder.id, userId);
    const solvedCount = problems.filter(p => p.status === 'solved').length;

    return {
      ...ladder,
      problem_count: problems.length,
      solved_count: solvedCount,
      problems,
    };
  }

  getProblemsForLadder(ladderId: string, userId?: string): Problem[] {
    const problems = this.state.problems
      .filter(p => p.ladder_id === ladderId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    if (!userId || !this.state.user_progress[userId]) {
      return problems.map(p => ({ ...p, status: 'not_attempted' }));
    }

    const progress = this.state.user_progress[userId];
    return problems.map(p => ({
      ...p,
      status: progress[p.id] || 'not_attempted',
    }));
  }

  updateProblemStatus(userId: string, problemId: string, status: ProblemStatus): { success: boolean; status: ProblemStatus } {
    if (!this.state.user_progress[userId]) {
      this.state.user_progress[userId] = {};
    }

    this.state.user_progress[userId][problemId] = status;

    // Recalculate user metrics
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      const allStatuses = Object.values(this.state.user_progress[userId]);
      user.solved_problems_count = allStatuses.filter(s => s === 'solved').length;
      user.attempted_problems_count = allStatuses.filter(s => s === 'attempted').length;
    }

    this.saveState(this.state);
    return { success: true, status };
  }

  createLadder(ladderData: Omit<Ladder, 'id'>): Ladder {
    const newLadder: Ladder = {
      ...ladderData,
      id: `ladder-${Date.now()}`,
    };
    this.state.ladders.push(newLadder);
    this.saveState(this.state);
    return newLadder;
  }

  createProblem(problemData: Omit<Problem, 'id'>): Problem {
    const newProblem: Problem = {
      ...problemData,
      id: `prob-${Date.now()}`,
    };
    this.state.problems.push(newProblem);
    this.saveState(this.state);
    return newProblem;
  }

  // --- Users & Authentication ---

  registerUser(data: { username: string; email: string; password: string; timezone?: string }): { user?: User; error?: string } {
    const existingEmail = this.state.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingEmail) {
      return { error: 'An account with this email already exists' };
    }

    const existingName = this.state.users.find(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (existingName) {
      return { error: 'Username is already taken' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = hashPassword(data.password, salt);

    const newUser = {
      id: `user-${Date.now()}`,
      username: data.username,
      email: data.email,
      timezone: data.timezone || 'Asia/Kolkata',
      role: 'user' as const,
      created_at: new Date().toISOString(),
      solved_problems_count: 0,
      attempted_problems_count: 0,
      password_hash,
      salt,
      handles: {},
    };

    this.state.users.push(newUser);
    this.saveState(this.state);

    const { password_hash: _, salt: __, ...userProfile } = newUser;
    return { user: userProfile };
  }

  authenticateUser(email: string, password: string): { user?: User; error?: string } {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const candidateHash = hashPassword(password, user.salt);
    if (candidateHash !== user.password_hash) {
      return { error: 'Invalid email or password' };
    }

    const { password_hash: _, salt: __, ...userProfile } = user;
    return { user: userProfile };
  }

  getUserById(id: string): User | undefined {
    const user = this.state.users.find(u => u.id === id);
    if (!user) return undefined;
    const { password_hash: _, salt: __, ...userProfile } = user;
    return userProfile;
  }

  getUserByUsername(username: string): User | undefined {
    const user = this.state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return undefined;
    const { password_hash: _, salt: __, ...userProfile } = user;
    return userProfile;
  }

  getUserProgress(userId: string): { progress: Record<string, ProblemStatus>; solvedCount: number; attemptedCount: number } {
    const userProgress = this.state.user_progress[userId] || {};
    const values = Object.values(userProgress);
    return {
      progress: userProgress,
      solvedCount: values.filter(s => s === 'solved').length,
      attemptedCount: values.filter(s => s === 'attempted').length,
    };
  }

  // --- Admin Stats ---

  getAdminStats() {
    const contests = Object.values(this.state.contests);
    const now = Date.now();

    const upcoming = contests.filter(c => new Date(c.start_time).getTime() > now).length;
    const live = contests.filter(c => {
      const s = new Date(c.start_time).getTime();
      const e = new Date(c.end_time).getTime();
      return now >= s && now <= e;
    }).length;
    const finished = contests.filter(c => new Date(c.end_time).getTime() < now).length;

    return {
      total_contests: contests.length,
      upcoming_count: upcoming,
      live_count: live,
      finished_count: finished,
      platforms_count: Object.keys(this.state.platforms).length,
      users_count: this.state.users.length,
      ladders_count: this.state.ladders.length,
      problems_count: this.state.problems.length,
      last_sync: this.state.last_sync,
    };
  }
}

export const db = new Database();
