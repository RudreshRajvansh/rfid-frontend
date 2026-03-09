<div align="center">

# RFID Attendance — Admin Panel

**Production-ready admin dashboard for the RFID-based smart attendance system.**

Built with **React 19** · **Tailwind CSS v4** · **Vite** · **Recharts**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License](https://img.shields.io/badge/license-private-red)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Endpoints Reference](#api-endpoints-reference)
- [Authentication](#authentication)
- [Build & Deployment](#build--deployment)
- [Git & Version Control](#git--version-control)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This is the **frontend admin panel** for an RFID-based attendance tracking system. It connects to a Go backend API and provides a rich interface for managing classes, students, attendance records, and scan logs.

The panel is designed for school/institution administrators who need real-time visibility into RFID tap-in/tap-out attendance data.

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | Real-time stats (6 metric cards), attendance-by-class bar chart, present/absent pie chart, recent scans feed with 30s auto-refresh |
| **Classes** | Full CRUD, card grid layout, search, capacity progress bars, student count display |
| **Students** | Sortable table, search by name/UID, class filter dropdown, CSV export, expandable detail modal, 15-field create/edit form |
| **Attendance** | Daily reports filterable by class + date, summary cards, per-student in/out times table, attendance pie chart, CSV export |
| **Scan Logs** | Paginated (50/page), date range + UID filter, CSV export, delete by UID + date |
| **Settings** | Server health check with latency, API key save/test/remove, backend config display |

### Production Features

- **Code splitting** — lazy-loaded routes with Suspense fallback
- **Error boundary** — catches render errors with retry UI
- **Request timeouts** — 15s AbortController-based timeouts on all API calls
- **Security headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy via Vercel
- **Immutable caching** — fingerprinted assets cached for 1 year
- **Mobile responsive** — sidebar collapses to hamburger menu

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | 19.x | UI components & state |
| Bundler | Vite | 7.x | Dev server, HMR, build |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Charts | Recharts | 3.x | Bar, pie, responsive charts |
| Icons | Lucide React | 0.577+ | Consistent icon set |
| Routing | React Router | 6.x | Client-side SPA routing |
| Notifications | react-hot-toast | 2.x | Toast alerts |
| Dates | date-fns | 4.x | Date formatting |

---

## Prerequisites

Before setting up, ensure you have:

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 (comes with Node)
- **Git** >= 2.30
- A running instance of the **RFID Attendance Go backend** ([see backend repo](https://github.com))

> **Windows users:** If you see PowerShell execution policy errors, run:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd rfid-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
# Copy the template
cp .env.example .env

# Edit .env and set your backend URL
# VITE_API_URL=https://your-backend-url.com
```

> **Important:** Never commit `.env` — it's excluded in `.gitignore`. See [Git & Version Control](#git--version-control) for details.

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server proxies `/api` requests to `localhost:8080` automatically.

### 5. Set your API key

Navigate to **Settings** in the sidebar, enter your backend API key, and click **Save & Test**. The key is stored in `localStorage` and sent as `X-API-Key` header on every request.

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | **Yes** | Backend API base URL (no trailing slash needed) | `https://rfid-backend.onrender.com` |

- All env vars prefixed with `VITE_` are embedded at **build time** (not runtime)
- The `.env.example` file serves as the template — copy it to `.env` and fill in values
- For Vercel deployment, set env vars in **Project Settings → Environment Variables**

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR on port 5173 |
| `npm run build` | Production build → `dist/` directory |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Project Structure

```
rfid-frontend/
├── public/
│   └── favicon.svg             # RFID-themed app icon
├── src/
│   ├── api.js                  # API service layer (all backend calls)
│   ├── App.jsx                 # Root: lazy routes, error boundary, auth provider
│   ├── main.jsx                # React DOM entry point
│   ├── index.css               # Tailwind imports + custom theme + global styles
│   ├── assets/                 # Static assets (images, etc.)
│   ├── components/
│   │   ├── Layout.jsx          # App shell: sidebar nav + header + mobile menu
│   │   ├── Modal.jsx           # Reusable modal (sm / md / lg / xl sizes)
│   │   ├── UI.jsx              # Shared primitives: Card, Button, Badge, StatCard, Spinner
│   │   └── ErrorBoundary.jsx   # React error boundary with retry
│   ├── context/
│   │   └── AuthContext.jsx     # API key auth state (localStorage-backed)
│   └── pages/
│       ├── Dashboard.jsx       # Stats, charts, recent scans
│       ├── Classes.jsx         # Class CRUD + grid view
│       ├── Students.jsx        # Student table + CRUD + CSV export
│       ├── Attendance.jsx      # Daily report + pie chart
│       ├── Logs.jsx            # Paginated log viewer + filters
│       ├── Settings.jsx        # Health check + API key management
│       └── NotFound.jsx        # 404 catch-all page
├── .editorconfig               # Editor formatting consistency
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules (see CONTRIBUTING.md)
├── index.html                  # HTML entry with meta tags + font preload
├── package.json                # Dependencies + scripts
├── vercel.json                 # Vercel: SPA routing + headers + caching
├── vite.config.js              # Vite: plugins, proxy, code splitting
├── CONTRIBUTING.md             # Contributor guide + gitignore reference
├── SECURITY.md                 # Security practices + secrets handling
└── README.md                   # This file
```

---

## API Endpoints Reference

The frontend communicates with these backend endpoints via `src/api.js`:

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check (no auth) |
| GET | `/api/stats` | Dashboard statistics |
| POST | `/api/scan` | Simulate RFID scan |

### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | List all classes |
| GET | `/api/classes/:id` | Get single class |
| POST | `/api/classes` | Create class |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students (supports `?class_id=`) |
| GET | `/api/students/:id` | Get single student |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/daily?date=YYYY-MM-DD&class_id=` | Daily attendance report |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs?limit=50&offset=0&date=&uid=` | Paginated scan logs |
| DELETE | `/api/logs?uid=XX&date=YYYY-MM-DD` | Delete logs by UID + date |

---

## Authentication

This app uses **API key authentication**:

1. The Go backend expects an `X-API-Key` header on all `/api/*` requests
2. Users enter their API key in **Settings → API Key**
3. The key is stored in the browser's `localStorage` (never sent to third parties)
4. On each request, `src/api.js` injects the key via the `AuthContext` provider
5. If no key is set, API requests will return `401 Unauthorized`

> **Note:** API keys are secrets. Never commit them to version control. The `.env` file is for the backend URL only — the API key is managed entirely in-browser.

---

## Build & Deployment

### Production Build

```bash
npm run build
```

Output goes to `dist/`. The build includes:
- **Code splitting** — vendor, charts, utils, and app chunks loaded on demand
- **Asset fingerprinting** — content-hashed filenames for cache busting
- **Minification** — JS and CSS fully minified
- **No sourcemaps** — disabled for production security

### Deploy to Vercel (Recommended)

1. **Push** this repo to GitHub / GitLab / Bitbucket
2. **Import** the repo in [Vercel Dashboard](https://vercel.com/new)
3. **Set environment variable:**
   - Key: `VITE_API_URL`
   - Value: your backend URL (e.g. `https://rfid-backend.onrender.com`)
4. **Deploy** — Vercel auto-detects Vite, runs `npm run build`, serves `dist/`

The included `vercel.json` provides:
- **SPA routing** — all non-API paths rewrite to `index.html`
- **Immutable caching** — `/assets/*` cached for 1 year
- **Security headers** — nosniff, frame deny, strict referrer

### Deploy Elsewhere

Any static hosting works (Netlify, Cloudflare Pages, Firebase Hosting, nginx):

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

For non-Vercel hosts, configure a catch-all redirect to `index.html` for SPA routing.

---

## Git & Version Control

This project includes a carefully configured `.gitignore`. See [CONTRIBUTING.md](CONTRIBUTING.md) for a full breakdown of what's tracked vs. ignored and why.

### Quick Reference

| Ignored | Reason |
|---------|--------|
| `node_modules/` | Reproducible via `npm install` — never commit |
| `dist/` | Build output — regenerated on every build |
| `.env`, `.env.local`, `.env.production` | Contains secrets/URLs specific to your environment |
| `*.log`, `logs/` | Runtime noise — not source code |
| `.vscode/`, `.idea/` | Editor-specific — varies per developer |
| `.DS_Store`, `Thumbs.db` | OS junk files |
| `.vercel` | Vercel CLI local state |

### What IS Tracked

| File | Why |
|------|-----|
| `.env.example` | Template so new devs know which vars to set |
| `.gitignore` | Ignore rules must be shared |
| `vercel.json` | Deployment config is part of the project |
| `package-lock.json` | Ensures reproducible installs across machines |
| `.editorconfig` | Consistent formatting across editors |

---

## Troubleshooting

### Common Issues

**"Network Error" or "Failed to fetch"**
- Check that `VITE_API_URL` in `.env` points to a running backend
- Verify the backend allows CORS from your frontend origin
- Check the browser console → Network tab for actual HTTP errors

**"401 Unauthorized" on all requests**
- Go to Settings and enter a valid API key
- Click "Test Connection" to verify

**Blank page after build**
- Ensure you're serving from `dist/` with a catch-all SPA redirect
- Check browser console for chunk loading errors

**PowerShell won't run npm commands (Windows)**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Port 5173 already in use**
```bash
# Kill the process using the port, or use a different port:
npm run dev -- --port 3000
```

**Charts not rendering**
- Ensure the backend returns data for the selected class/date
- Check that Recharts responsive container has a parent with defined height

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Setting up the development environment
- Code style and conventions
- Git workflow and commit messages
- What files to never commit (`.gitignore` reference)

---

## License

**Private** — not for redistribution without permission.
