<p align="center">
  🚀 <b>Contest-Hub 🚀</b><br> 
 ⚡Live Link: <a href="https://contesthub.ai.studio" target="_blank">contesthub.ai.studio</a>⚡
</p>

### One hub. Every contest. Your next problem-solving milestone.

**ContestHub** is a full-stack competitive programming dashboard that
brings contest schedules from multiple platforms into one
place---alongside practice ladders to help you stay consistent and track
your progress.


![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind
CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)
![License](https://img.shields.io/badge/license-check%20repository-blue?style=flat-square)

------------------------------------------------------------------------

## 📌 Table of Contents

-   [🌟 About](#-about)
-   [✨ Features](#-features)
-   [🧰 Tech Stack](#-tech-stack)
-   [🏗️ Architecture](#️-architecture)
-   [📂 Project Structure](#-project-structure)
-   [⚡ Getting Started](#-getting-started)
    -   [Prerequisites](#-prerequisites)
    -   [Option A: Run with
        Docker](#option-a-run-with-docker-recommended)
    -   [Option B: Run locally](#option-b-run-locally)
-   [🔐 Environment Variables](#-environment-variables)
-   [🧭 How to Use](#-how-to-use)
-   [🧪 Testing and Troubleshooting](#-testing-and-troubleshooting)
-   [🚢 Deployment Notes](#-deployment-notes)
-   [🗺️ Roadmap](#️-roadmap)
-   [🤝 Contributing](#-contributing)
-   [📄 License](#-license)
-   [📬 Contact](#-contact)

------------------------------------------------------------------------

## 🌟 About

Keeping track of contests across several competitive programming
platforms can be inconvenient. ContestHub aims to make that easier by
providing a single place to discover upcoming contests, check
countdowns, plan practice sessions, and work through structured problem
ladders.

🎯 **The goal:** spend less time searching for contest information and
more time solving problems.

🔗 **Live demo:** [contesthub.ai.studio](https://contesthub.ai.studio)

> **Note:** The availability of individual features depends on the
> current implementation and configuration of the project. Check the
> repository and live demo for the latest behavior.

## ✨ Features

### 📅 Unified contest dashboard

-   View contest schedules from supported competitive programming
    platforms.
-   Check upcoming, live, and recently completed contests where source
    data is available.
-   See countdowns to help plan your next contest.
-   Use calendar-style views to organize your schedule.

### 🌍 Time-zone friendly planning

-   Display contest times in a convenient local time zone.
-   Reduce confusion when platforms publish schedules in different time
    zones.
-   Export supported events to Google Calendar when configured.

### 🧩 A2OJ-style practice ladders

-   Explore practice ladders organized by rating or topic.
-   Find a more structured path from easier problems to harder ones.
-   Keep practice focused instead of choosing problems at random.

### 📈 Progress and account features

-   Track practice progress where user accounts and progress persistence
    are enabled.
-   Keep a profile for your competitive programming activity.
-   Administrative health and synchronization controls may be available
    to authorized users.

### 🔌 Multiple platforms

The project is designed to aggregate contest information from platforms
such as:

-   [Codeforces](https://codeforces.com/)
-   [AtCoder](https://atcoder.jp/)
-   [CodeChef](https://www.codechef.com/)
-   [LeetCode](https://leetcode.com/)
-   [HackerRank](https://www.hackerrank.com/)

Platform coverage and available data can vary depending on source APIs,
rate limits, and the current application configuration.

## 🧰 Tech Stack

  Area                          Technologies
  ----------------------------- ---------------------------------------
  Frontend                      React, TypeScript, Vite, Tailwind CSS
  Web/API server                Node.js, Express
  Python API                    FastAPI, Pydantic v2
  Database                      PostgreSQL 16, SQLAlchemy 2.0
  Caching and background work   Redis 7, Celery
  Local orchestration           Docker, Docker Compose

## 🏗️ Architecture

At a high level, the application is organized into a frontend,
server/API layers, and supporting data services.

``` text
┌──────────────────────────────┐
│       React + TypeScript     │
│          Frontend            │
└──────────────┬───────────────┘
               │ HTTP / API
      ┌────────┴─────────┐
      ▼                  ▼
┌───────────────┐  ┌────────────────┐
│ Node / Express│  │ FastAPI service│
│ Web/API server│  │ Python API     │
└───────┬───────┘  └────────┬───────┘
        └──────────┬────────┘
                   ▼
       ┌────────────────────────┐
       │ PostgreSQL + Redis     │
       │ Persistent data/cache  │
       └────────────────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Contest platform APIs  │
       └────────────────────────┘
```

*This is a conceptual overview. Refer to the actual service definitions
and source code for the precise request flow and deployment topology.*

## 📂 Project Structure

The repository may evolve as the project develops. The main directories
and files are expected to serve these roles:

``` text
contesthub/
├── backend/            # Python/FastAPI backend
├── server/             # Server-side application modules
├── src/                # Frontend source code
├── server.ts           # Node/TypeScript server entry point
├── .env.example        # Example environment configuration
├── docker-compose.yml  # Local multi-service setup, if included
├── package.json        # Node dependencies and scripts
└── README.md
```

Use the actual files in your cloned repository as the source of truth;
directory names and service definitions can change.

## ⚡ Getting Started

Choose **Docker Compose** for the simplest multi-service setup, or use
the manual steps if you want to run and debug each service separately.

### 📋 Prerequisites

For the Docker option: - [Git](https://git-scm.com/downloads) - [Docker
Desktop](https://www.docker.com/products/docker-desktop/)
(Windows/macOS) or Docker Engine with the Compose plugin (Linux)

For manual development, you may also need: -
[Node.js](https://nodejs.org/) --- use the version specified in
`package.json` or the project documentation. -
[Python](https://www.python.org/downloads/) --- use the version
specified by the backend. - PostgreSQL and Redis, unless you run them
through Docker.

### Option A: Run with Docker (recommended)

**1. Clone the repository**

Replace the placeholder below with the actual GitHub repository URL.

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd contesthub
```

**2. Configure environment variables**

``` bash
# macOS / Linux
cp .env.example .env
```

On Windows PowerShell:

``` powershell
Copy-Item .env.example .env
```

Open `.env` and fill in the values required by your setup. Do not commit
real credentials or API keys.

**3. Build and start the services**

``` bash
docker compose up --build
```

To run in the background:

``` bash
docker compose up --build -d
```

**4. Open the application**

  -----------------------------------------------------------------------
  Service                             Local URL
  ----------------------------------- -----------------------------------
  Frontend / application              <http://localhost:3000>

  FastAPI interactive docs            <http://localhost:8000/docs>
  -----------------------------------------------------------------------

These are the expected local endpoints for the documented setup. If your
`docker-compose.yml` maps different ports, use the port mappings in that
file.

**5. Stop the services**

``` bash
docker compose down
```

To also remove Compose-managed volumes (⚠️ this may delete local
database data):

``` bash
docker compose down --volumes
```

### Option B: Run locally

> The exact scripts and dependency files can vary by branch. Check
> `package.json`, the backend requirements/`pyproject.toml`, and the
> Compose file before running these commands.

**1. Clone the repository**

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd contesthub
```

**2. Configure your environment**

Copy `.env.example` to `.env` and update the values. Ensure PostgreSQL
and Redis are running and accessible if the application requires them.

**3. Install frontend/server Node dependencies**

From the repository root (where `package.json` is located):

``` bash
npm install
```

Start the development server using the script defined in `package.json`.
If the project defines `dev` as its development script:

``` bash
npm run dev
```

Open <http://localhost:3000> if that is the port configured by the app.

**4. Set up the Python backend**

Open a second terminal in the repository root.

Create and activate a virtual environment:

``` bash
python -m venv .venv
```

Windows PowerShell:

``` powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

``` bash
source .venv/bin/activate
```

Install dependencies using the dependency file present in `backend/` (or
the relevant backend directory). For example, if it contains
`requirements.txt`:

``` bash
pip install -r backend/requirements.txt
```

If the backend uses `pyproject.toml` instead, follow its documented
installation command.

Start FastAPI using the actual import path of the application. For
example, if the FastAPI instance is `app` in `backend/main.py`:

``` bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Then visit <http://localhost:8000/docs>.

> **Important:** `backend.main:app` is an example import path, not a
> guarantee. If the entry point differs, replace it with the module and
> application variable used by your code. Avoid running duplicate
> services if `npm run dev` already starts the backend or coordinates
> all services.

## 🔐 Environment Variables

Start from `.env.example` and inspect the application configuration to
identify the exact required variable names.

Common configuration categories include:

  -----------------------------------------------------------------------
  Category                            Purpose
  ----------------------------------- -----------------------------------
  Database URL                        PostgreSQL connection string

  Redis URL                           Cache and background-task
                                      broker/backend configuration

  API host/port                       Local service binding and port
                                      configuration

  Platform API settings               Optional credentials or rate-limit
                                      settings for data sources

  Authentication secrets              Session/JWT signing secrets, if
                                      authentication is enabled

  Google Calendar credentials         OAuth configuration, if calendar
                                      integration is enabled
  -----------------------------------------------------------------------

Do not paste real secrets into this README, commit them to Git, or
expose them in screenshots. Keep `.env` out of version control and
provide safe placeholders in `.env.example`.

## 🧭 How to Use

1.  **Launch ContestHub** using Docker Compose or the local development
    commands.
2.  **Explore the dashboard** to see contest information from configured
    platforms.
3.  **Check contest details and countdowns** before choosing which event
    to enter.
4.  **Plan your schedule** using the calendar and time-zone features
    available in your build.
5.  **Practice consistently** by selecting a suitable rating/topic
    ladder and solving problems.
6.  **Track progress** if account and persistence features are enabled.
7.  **Report issues** if a platform's schedule is missing or appears
    incorrect; source APIs can change.

## 🧪 Testing and Troubleshooting

### Check service status

``` bash
docker compose ps
docker compose logs -f
```

To inspect one service, replace `<service-name>` with its name from
`docker-compose.yml`:

``` bash
docker compose logs -f <service-name>
```

### Common problems

  -----------------------------------------------------------------------
  Problem                             What to check
  ----------------------------------- -----------------------------------
  Port already in use                 Stop the conflicting process or
                                      update the port mapping in
                                      Compose/configuration.

  Frontend cannot reach the API       Check the configured API base URL,
                                      CORS settings, and service names.

  Database connection fails           Verify PostgreSQL is running and
                                      the connection string, username,
                                      password, and database name are
                                      correct.

  Redis connection fails              Confirm Redis is running and the
                                      configured URL matches the
                                      service/port.

  Missing environment variable        Compare `.env` with `.env.example`
                                      and the application settings.

  Dependency/install errors           Confirm the required Node.js/Python
                                      versions and use the dependency
                                      manager specified by the project.

  Contest data is missing or stale    Check backend logs, synchronization
                                      jobs, source API availability, and
                                      rate limits.
  -----------------------------------------------------------------------

Before opening a pull request, run the lint, type-check, and test
commands provided by the repository's `package.json` and backend test
configuration.

## 🚢 Deployment Notes

Before deploying to production:

-   Configure environment variables and secrets through your hosting
    provider.
-   Use a managed or secured PostgreSQL database and Redis instance.
-   Set production CORS origins explicitly; avoid permissive development
    settings.
-   Apply database migrations using the project's migration workflow.
-   Configure HTTPS, health checks, logging, and backups.
-   Keep API credentials and authentication secrets out of source
    control.
-   Respect the terms of service, rate limits, and attribution
    requirements of each contest platform.
-   Verify frontend and backend URLs, OAuth callback URLs, and allowed
    origins in the production environment.

## 🗺️ Roadmap

Potential areas for future improvement:

-   [ ] Broader contest-source coverage and resilient synchronization
-   [ ] More calendar and notification options
-   [ ] Richer practice analytics and progress insights
-   [ ] Improved filtering by platform, date, and contest type
-   [ ] Better accessibility and mobile experience
-   [ ] Expanded automated tests and deployment checks

> Roadmap items are ideas, not a promise that each item is currently
> implemented.

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1.  Fork the repository.

2.  Create a feature branch:

    ``` bash
    git checkout -b feature/your-feature-name
    ```

3.  Make your changes and add or update tests where appropriate.

4.  Run the relevant checks locally.

5.  Commit with a clear message:

    ``` bash
    git commit -m "feat: describe your change"
    ```

6.  Push your branch and open a Pull Request with a clear description
    and screenshots for UI changes.

Please avoid committing `.env` files, secrets, build outputs, or
unrelated formatting changes.

## 📄 License

No license is specified here because the repository's licensing terms
have not been confirmed. Add the license you intend to use and include
the corresponding `LICENSE` file before presenting the project as open
source. Without a license, default copyright restrictions generally
apply.

## 📬 Contact

-   **GitHub:** [nemesisrc](https://github.com/nemesisrc)
-   **Live Demo:** [contesthub.ai.studio](https://contesthub.ai.studio)

For bugs or feature requests, open an issue in the repository after
replacing `<YOUR_GITHUB_REPOSITORY_URL>` with the correct repository
URL.

------------------------------------------------------------------------


### 💻 Plan smarter. Practice consistently. Compete confidently. 🏆

**If you find ContestHub useful, consider giving the repository a ⭐!**

