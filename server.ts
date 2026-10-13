import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { syncService } from './server/sync';
import { ProblemStatus } from './src/types';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = express();

  app.use(express.json());

  // CORS and Security Headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Auth token helper (Lightweight Bearer token scheme: Bearer user-id or Bearer demo)
  const getUserIdFromAuth = (req: Request): string | undefined => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return undefined;
    const token = auth.substring(7).trim();
    if (!token) return undefined;
    // Token can be the user's ID or format `user_id:<id>`
    if (token.startsWith('user_id:')) return token.replace('user_id:', '');
    return token;
  };

  // ==========================================
  // CONTESTS API ROUTES
  // ==========================================

  // GET /api/v1/contests
  app.get('/api/v1/contests', (req: Request, res: Response) => {
    try {
      const {
        platform,
        status,
        search,
        start_date,
        end_date,
        contest_type,
        division,
        page = '1',
        limit = '20',
        sort = 'start_time_asc',
      } = req.query;

      let platformList: string[] | undefined = undefined;
      if (platform) {
        if (Array.isArray(platform)) {
          platformList = platform.map(p => String(p));
        } else if (typeof platform === 'string') {
          platformList = platform.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const results = db.queryContests({
        platforms: platformList,
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined,
        startDate: typeof start_date === 'string' ? start_date : undefined,
        endDate: typeof end_date === 'string' ? end_date : undefined,
        contestType: typeof contest_type === 'string' ? contest_type : undefined,
        division: typeof division === 'string' ? division : undefined,
        page: parseInt(String(page), 10),
        limit: parseInt(String(limit), 10),
        sortBy: typeof sort === 'string' ? sort : undefined,
      });

      res.json({
        data: results.data,
        pagination: {
          page: results.page,
          limit: results.limit,
          total: results.total,
          total_pages: Math.ceil(results.total / results.limit) || 1,
        },
      });
    } catch (err: any) {
      console.error('Error fetching contests:', err);
      res.status(500).json({ error: 'Failed to query contests', details: err.message });
    }
  });

  // GET /api/v1/contests/upcoming
  app.get('/api/v1/contests/upcoming', (req: Request, res: Response) => {
    const limit = parseInt(String(req.query.limit || '15'), 10);
    const results = db.queryContests({
      status: 'upcoming',
      limit,
      page: 1,
      sortBy: 'start_time_asc',
    });
    res.json({ data: results.data, total: results.total });
  });

  // GET /api/v1/contests/live
  app.get('/api/v1/contests/live', (req: Request, res: Response) => {
    const results = db.queryContests({
      status: 'live',
      limit: 50,
      page: 1,
    });
    res.json({ data: results.data, total: results.total });
  });

  // GET /api/v1/contests/recent
  app.get('/api/v1/contests/recent', (req: Request, res: Response) => {
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const results = db.queryContests({
      status: 'finished',
      limit,
      page: 1,
      sortBy: 'start_time_desc',
    });
    res.json({ data: results.data, total: results.total });
  });

  // GET /api/v1/contests/:id
  app.get('/api/v1/contests/:id', (req: Request, res: Response) => {
    const contest = db.getContestById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: `Contest with ID '${req.params.id}' not found` });
    }
    res.json({ data: contest });
  });

  // ==========================================
  // PLATFORMS API ROUTES
  // ==========================================

  // GET /api/v1/platforms
  app.get('/api/v1/platforms', (req: Request, res: Response) => {
    const platforms = db.getPlatforms();
    res.json({ data: platforms });
  });

  // GET /api/v1/platforms/:slug
  app.get('/api/v1/platforms/:slug', (req: Request, res: Response) => {
    const platform = db.getPlatformBySlug(req.params.slug);
    if (!platform) {
      return res.status(404).json({ error: `Platform '${req.params.slug}' not found` });
    }
    res.json({ data: platform });
  });

  // GET /api/v1/platforms/:slug/contests
  app.get('/api/v1/platforms/:slug/contests', (req: Request, res: Response) => {
    const platform = db.getPlatformBySlug(req.params.slug);
    if (!platform) {
      return res.status(404).json({ error: `Platform '${req.params.slug}' not found` });
    }

    const { status, page = '1', limit = '20' } = req.query;
    const results = db.queryContests({
      platforms: [platform.slug],
      status: typeof status === 'string' ? status : undefined,
      page: parseInt(String(page), 10),
      limit: parseInt(String(limit), 10),
    });

    res.json({
      platform,
      data: results.data,
      pagination: {
        page: results.page,
        limit: results.limit,
        total: results.total,
        total_pages: Math.ceil(results.total / results.limit) || 1,
      },
    });
  });

  // ==========================================
  // LADDERS API ROUTES
  // ==========================================

  // GET /api/v1/ladders
  app.get('/api/v1/ladders', (req: Request, res: Response) => {
    const userId = getUserIdFromAuth(req);
    const ladders = db.getLadders(userId);
    res.json({ data: ladders });
  });

  // GET /api/v1/ladders/:id
  app.get('/api/v1/ladders/:id', (req: Request, res: Response) => {
    const userId = getUserIdFromAuth(req);
    const ladder = db.getLadderById(req.params.id, userId);
    if (!ladder) {
      return res.status(404).json({ error: `Ladder '${req.params.id}' not found` });
    }
    res.json({ data: ladder });
  });

  // GET /api/v1/ladders/:id/problems
  app.get('/api/v1/ladders/:id/problems', (req: Request, res: Response) => {
    const userId = getUserIdFromAuth(req);
    const ladder = db.getLadderById(req.params.id, userId);
    if (!ladder) {
      return res.status(404).json({ error: `Ladder '${req.params.id}' not found` });
    }
    const problems = db.getProblemsForLadder(ladder.id, userId);
    res.json({ data: problems, ladder_name: ladder.name, ladder_id: ladder.id });
  });

  // POST /api/v1/problems/:id/complete
  app.post('/api/v1/problems/:id/complete', (req: Request, res: Response) => {
    const userId = getUserIdFromAuth(req) || 'user-demo'; // Default to demo user for effortless interactive testing
    const { status = 'solved' } = req.body;

    if (!['not_attempted', 'attempted', 'solved'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: not_attempted, attempted, solved' });
    }

    const result = db.updateProblemStatus(userId, req.params.id, status as ProblemStatus);
    res.json({ success: true, problem_id: req.params.id, status: result.status });
  });

  // ==========================================
  // AUTHENTICATION & USER ROUTES
  // ==========================================

  // POST /api/v1/auth/register
  app.post('/api/v1/auth/register', (req: Request, res: Response) => {
    const { username, email, password, timezone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = db.registerUser({ username, email, password, timezone });
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const token = `user_id:${result.user!.id}`;
    res.status(201).json({
      message: 'Registration successful',
      user: result.user,
      token,
    });
  });

  // POST /api/v1/auth/login
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = db.authenticateUser(email, password);
    if (result.error) {
      return res.status(401).json({ error: result.error });
    }

    const token = `user_id:${result.user!.id}`;
    res.json({
      message: 'Login successful',
      user: result.user,
      token,
    });
  });

  // GET /api/v1/users/me
  app.get('/api/v1/users/me', (req: Request, res: Response) => {
    const userId = getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please provide a valid Bearer token.' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  });

  // GET /api/v1/users/me/progress
  app.get('/api/v1/users/me/progress', (req: Request, res: Response) => {
    const userId = getUserIdFromAuth(req) || 'user-demo';
    const progressData = db.getUserProgress(userId);
    res.json({ data: progressData });
  });

  // GET /api/v1/users/:username
  app.get('/api/v1/users/profile/:username', (req: Request, res: Response) => {
    const user = db.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: `User '${req.params.username}' not found` });
    }
    const progressData = db.getUserProgress(user.id);
    res.json({ data: { user, progress: progressData } });
  });

  // ==========================================
  // ADMIN & SYSTEM ROUTES
  // ==========================================

  // GET /api/v1/admin/stats
  app.get('/api/v1/admin/stats', (req: Request, res: Response) => {
    const stats = db.getAdminStats();
    const providerHealth = syncService.getHealthSummary();
    res.json({
      data: {
        ...stats,
        is_syncing: syncService.getIsSyncing(),
        provider_health: providerHealth,
      },
    });
  });

  // POST /api/v1/admin/sync
  app.post('/api/v1/admin/sync', async (req: Request, res: Response) => {
    try {
      const outcome = await syncService.runSync();
      res.json({
        message: 'Manual synchronization completed',
        ...outcome,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Synchronization failed', details: err.message });
    }
  });

  // POST /api/v1/admin/providers/:slug/toggle
  app.post('/api/v1/admin/providers/:slug/toggle', (req: Request, res: Response) => {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Field "enabled" (boolean) is required' });
    }

    const provider = syncService.getProvider(req.params.slug);
    if (!provider) {
      return res.status(404).json({ error: `Provider '${req.params.slug}' not found` });
    }

    provider.setEnabled(enabled);
    db.togglePlatform(req.params.slug, enabled);

    res.json({
      message: `Provider ${provider.name} ${enabled ? 'enabled' : 'disabled'}`,
      provider: provider.getHealth(),
    });
  });

  // POST /api/v1/admin/ladders
  app.post('/api/v1/admin/ladders', (req: Request, res: Response) => {
    const { name, slug, description, difficulty, rating_min, rating_max, category } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Ladder name and slug are required' });
    }

    const created = db.createLadder({
      name,
      slug,
      description: description || '',
      difficulty: difficulty || 'Intermediate',
      rating_min: rating_min ? parseInt(rating_min, 10) : undefined,
      rating_max: rating_max ? parseInt(rating_max, 10) : undefined,
      category: category || 'curated',
      problem_count: 0,
    });

    res.status(201).json({ message: 'Ladder created successfully', data: created });
  });

  // POST /api/v1/admin/problems
  app.post('/api/v1/admin/problems', (req: Request, res: Response) => {
    const { ladder_id, name, platform, external_id, url, rating, tags, position } = req.body;
    if (!ladder_id || !name || !platform || !url) {
      return res.status(400).json({ error: 'ladder_id, name, platform and url are required' });
    }

    const created = db.createProblem({
      ladder_id,
      name,
      platform,
      external_id: external_id || String(Date.now()),
      url,
      rating: parseInt(rating || '1000', 10),
      tags: Array.isArray(tags) ? tags : [],
      position: position ? parseInt(position, 10) : 1,
    });

    res.status(201).json({ message: 'Problem added successfully', data: created });
  });

  // GET /api/v1/sync/status
  app.get('/api/v1/sync/status', (req: Request, res: Response) => {
    res.json({
      is_syncing: syncService.getIsSyncing(),
      last_sync: syncService.getLastSyncTime(),
      providers: syncService.getHealthSummary(),
    });
  });

  // ==========================================
  // FRONTEND INTEGRATION (Vite dev or Prod static)
  // ==========================================

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ContestHub] Full-Stack server running on port ${PORT}`);

    // Trigger initial background sync asynchronously
    syncService.runSync().catch(err => {
      console.warn('[ContestHub] Initial sync warning:', err.message);
    });

    // Start background sync polling loop (every 15 min)
    syncService.startScheduledSync(15);
  });
}

bootstrap().catch(err => {
  console.error('[ContestHub] Fatal server boot error:', err);
  process.exit(1);
});
