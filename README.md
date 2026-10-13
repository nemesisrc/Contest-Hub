# ContestHub - Competitive Programming Contest Aggregator & A2OJ Practice Ladders

**ContestHub** is a production-quality full-stack competitive programming aggregator and practice platform. It synchronizes upcoming, live, and recently completed contests from multiple competitive programming platforms—including **Codeforces**, **AtCoder**, **CodeChef**, **LeetCode**, and **HackerRank**—into a single unified dashboard, featuring real-time countdown timers, interactive monthly calendar views, global timezone conversions, and progressive A2OJ-style difficulty and topic ladders with persistent user progress tracking.

---

## 1. Features

### A. Contest Aggregation & Normalization
- **Multi-Platform Support**: Ingests contests from Codeforces, AtCoder, CodeChef, LeetCode, and HackerRank.
- **Unified Normalized Schema**: Standardized data format across all platforms (Platform, Name, Start/End UTC, Duration, Status, Division, URL).
- **Duplicate Prevention**: Database-level unique constraint on `(platform_id, external_id)` prevents duplicates.
- **Provider Abstraction Architecture**: Pluggable `ContestProvider` base adapter. Adding new platforms (e.g., TopCoder, SPOJ, Luogu) requires implementing only a single adapter class.

### B. Real-Time Status & Timezone Handling
- **Real-Time Countdown Timers**: Millisecond-accurate tickers that automatically flip status from `UPCOMING` to `LIVE` to `FINISHED` without requiring page reloads.
- **Global Timezone Converter**: Contests are stored internally in **UTC** and dynamically formatted into the user's selected timezone (**Asia/Kolkata (IST)** by default, **UTC**, **GMT**, **US Eastern**, **US Pacific**, **Europe/London**, **Asia/Tokyo**, etc.).
- **Calendar & List Views**: Switch between a clean responsive list view and an interactive monthly grid view with color-coded platform chips.
- **Google Calendar Export**: One-click event creation in Google Calendar.

### C. A2OJ-Style Practice Ladders
- **Rating Ladders**: 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, and 1600+ expert tiers.
- **Topic Ladders**: Dynamic Programming, Graph Theory, Binary Search, Greedy Algorithms, and Number Theory.
- **User Progress Tracking**: Interactive toggles (`Not Attempted` -> `Attempted` -> `Solved`) with progress bar, completion percentage, and ladder problem positioning.
- **Official Problem Links**: Direct links to official Codeforces/AtCoder/LeetCode problem rooms—no proprietary statements are republished.

### D. User Authentication & Profile
- Full registration and login with salt-hashed password security.
- Profile dashboard displaying solved problem count, active ladders, joined handles, and statistics.
- Pre-seeded test accounts for instant evaluation.

### E. Admin Operations & Reliability
- Provider health metrics and circuit-breaker status monitoring.
- One-click manual synchronization trigger.
- Individual provider enable/disable toggles.
- Custom ladder and problem creation forms.
- Independent fault tolerance: if one platform feed times out or fails, all other platform providers continue syncing normally.

---

## 2. Architecture & Design

### Provider Adapter Pattern
```text
                  ┌─────────────────────┐
                  │   ContestProvider   │  (Base Abstract Class)
                  └──────────┬──────────┘
                             │
     ┌──────────────┬────────┼──────────────┬──────────────┐
     ▼              ▼        ▼              ▼              ▼
Codeforces       AtCoder  CodeChef      LeetCode      HackerRank
 Provider        Provider  Provider      Provider       Provider
```

Each provider implements:
- `fetchContests(): Promise<Contest[]>`
- Timeout and retry logic with exponential backoff
- Source type classification (`official_api`, `public_feed`, or `curated`)
- Structured error reporting that records failure without halting the global sync worker

### Directory Structure
```text
contesthub/
├── backend/                  # Python FastAPI Backend Architecture
│   ├── app/
│   │   ├── api/v1/           # REST Endpoints
│   │   ├── core/             # Configuration & Security (JWT, settings)
│   │   ├── database/         # Database Sessions & Engine
│   │   ├── models/           # SQLAlchemy 2.0 ORM Models
│   │   ├── schemas/          # Pydantic v2 Validation Schemas
│   │   ├── providers/        # Python ContestProvider Implementations
│   │   ├── tasks/            # Celery Periodic Worker Tasks
│   │   └── main.py           # FastAPI Application Entry
│   ├── tests/                # Pytest Test Suite
│   ├── requirements.txt      # Python Dependencies
│   └── Dockerfile            # Python Dockerfile
├── server/                   # Full-Stack Node / Express Aggregator Runtime
│   ├── data/                 # A2OJ Ladder & Problem Datasets
│   ├── providers/            # TypeScript Contest Providers
│   ├── db.ts                 # Storage Repository & Deduplication Store
│   └── sync.ts               # Background Sync Engine & Health Monitor
├── src/                      # React / TypeScript Frontend
│   ├── components/           # UI Components (Navbar, Calendar, Ladders, etc.)
│   ├── services/             # API Client
│   ├── utils/                # Timezone & Countdown Utilities
│   ├── types/                # TypeScript Interfaces
│   ├── App.tsx               # Main Dashboard Application
│   └── index.css             # Tailwind CSS Configuration
├── server.ts                 # Full-Stack Server & Vite Dev Middleware
├── docker-compose.yml        # Multi-container Docker Orchestration
├── .env.example              # Environment Variable Template
└── package.json
```

---

## 3. Quickstart & Local Setup

### Option 1: Live Full-Stack Express + React (Port 3000)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The applet serves the React frontend and all `/api/v1/*` backend endpoints together.

### Option 2: Docker Compose (FastAPI + React + Postgres + Redis + Celery)
```bash
docker compose up --build
```
This boots:
- **Frontend**: `http://localhost:3000`
- **FastAPI API & Docs**: `http://localhost:8000/docs`
- **PostgreSQL 16**: `localhost:5432`
- **Redis 7**: `localhost:6379`
- **Celery Worker & Celery Beat**: Periodic background synchronization every 15 minutes.

---

## 4. API Endpoints

### Contests
- `GET /api/v1/contests`: Search and filter contests (parameters: `platform`, `status`, `start_date`, `end_date`, `search`, `page`, `limit`, `sort`).
- `GET /api/v1/contests/upcoming`: Future contests sorted chronologically.
- `GET /api/v1/contests/live`: Currently running contests.
- `GET /api/v1/contests/recent`: Recently completed contests.
- `GET /api/v1/contests/:id`: Single contest metadata.

### Platforms
- `GET /api/v1/platforms`: List supported platforms and health status.
- `GET /api/v1/platforms/:slug/contests`: Dedicated contests feed for a platform.

### Ladders & Problems
- `GET /api/v1/ladders`: List all A2OJ rating and topic ladders.
- `GET /api/v1/ladders/:id`: Single ladder with problem counts.
- `GET /api/v1/ladders/:id/problems`: Problem set for ladder with user completion status.
- `POST /api/v1/problems/:id/complete`: Update user problem status (`not_attempted`, `attempted`, `solved`).

### Authentication
- `POST /api/v1/auth/register`: Register with username, email, password, and timezone.
- `POST /api/v1/auth/login`: Authenticate and receive session token.
- `GET /api/v1/users/me`: Current user profile.
- `GET /api/v1/users/me/progress`: User's problem progress map.

### Admin Operations
- `GET /api/v1/admin/stats`: Aggregate system and provider health metrics.
- `POST /api/v1/admin/sync`: Manually trigger synchronization.
- `POST /api/v1/admin/providers/:slug/toggle`: Enable or disable an individual provider.
- `POST /api/v1/admin/ladders`: Create custom ladder.
- `POST /api/v1/admin/problems`: Add problem to ladder.

---

## 5. Adding a New Contest Provider

To add a new platform (e.g. `TopCoder`), implement the `ContestProvider` interface:

```typescript
import { ContestProvider } from './base';
import { Contest } from '../../src/types';

export class TopCoderProvider extends ContestProvider {
  readonly name = 'TopCoder';
  readonly slug = 'topcoder';
  readonly websiteUrl = 'https://www.topcoder.com';
  readonly logoUrl = 'https://www.topcoder.com/favicon.ico';
  readonly sourceType = 'official_api';
  readonly apiPolicyNote = 'Uses public TopCoder SRM API with rate limiting.';

  async fetchContests(): Promise<Contest[]> {
    const res = await this.fetchWithTimeout('https://api.topcoder.com/v5/contests');
    const data = await res.json();
    return data.map(item => ({
      id: `topcoder-${item.id}`,
      platform: 'TopCoder',
      external_id: String(item.id),
      name: item.name,
      start_time: new Date(item.startDate).toISOString(),
      end_time: new Date(item.endDate).toISOString(),
      duration_seconds: item.duration,
      url: `https://www.topcoder.com/challenges/${item.id}`,
      status: 'upcoming',
      platform_logo: this.logoUrl,
    }));
  }
}
```
Then register it in `SyncService`:
```typescript
this.registerProvider(new TopCoderProvider());
```

---

## 6. Legal & Terms of Service Compliance

ContestHub acts solely as an informational aggregator and educational practice directory:
1. **No Proprietary Problem Statement Redistribution**: Ladder entries store only metadata (Name, Platform, ID, Rating) and link directly to the official problem URL where users solve the problem.
2. **Rate Limiting & Caching**: External APIs are polled conservatively (15-30 minute intervals) with user-agent identification and backoff logic.
3. **Provider Disabling**: If any platform requests feed exclusion, administrators can disable that provider instantly from the Admin Panel.

---

## 7. License
MIT License. Open source and built for the global competitive programming community.
