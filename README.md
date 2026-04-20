<div align="center">

# ClassTracker — Admin Panel & Student App

**Admin dashboard + Student companion app for the RFID-based smart attendance system with GPS presence verification.**

Built with **React 19** · **Tailwind CSS v4** · **Vite 7** · **Recharts**

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

This repo contains **two interfaces** for an RFID-based attendance tracking system:

1. **Admin Panel** — Dashboard for managing classes, students, attendance, devices, and scan logs
2. **Student Companion App** — Students view their own attendance and verify classroom presence via background GPS tracking

Connects to a Go backend API. Students log in with roll number + date of birth, and the app silently sends GPS coordinates every 2 minutes to verify they're actually in the classroom.

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Dashboard** | 6 stat cards (incl. "Currently In"), bar chart by class, pie chart, 7-day trend line chart, live attendance table, recent scans with scan_type badges, 30s auto-refresh |
| **Classes** | Full CRUD, card grid, search, capacity bars, **GPS geofence fields** (lat/lng/radius), "Use Current Location" button |
| **Students** | Table with responsive columns, search, class filter, CSV export, detail modal, 15-field CRUD form |
| **Attendance** | Daily reports by class + date, summary cards, attendance table with duration, pie chart, CSV export |
| **Scan Logs** | Paginated (50/page), **scan_type column with badges**, date + UID + type filters, CSV export |
| **Devices** | ESP8266 device management — online/offline status, labels, MAC display |
| **Settings** | Server health check, API key management, config display |
| **Student Login** | Roll number + DOB auth, dark glassmorphism design |
| **Student Dashboard** | Today's status, GPS verification % with progress bar, check-in/out times |
| **Student History** | 60-day color-coded attendance (green=verified, yellow=unverified, red=absent) |

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
│   └── favicon.svg             # App icon
├── src/
│   ├── api.js                  # API service layer (30+ endpoints)
│   ├── App.jsx                 # Root: routing, dual layouts, providers
│   ├── main.jsx                # React DOM entry point
│   ├── index.css               # Tailwind imports + custom theme
│   ├── components/
│   │   ├── Layout.jsx          # Admin shell: sidebar + header + Outlet
│   │   ├── StudentLayout.jsx   # Student shell: header (GPS) + bottom nav
│   │   ├── Modal.jsx           # Reusable modal (sm / md / lg / xl)
│   │   ├── UI.jsx              # Card, Button, Badge, StatCard, Spinner
│   │   └── ErrorBoundary.jsx   # Crash recovery
│   ├── context/
│   │   ├── AuthContext.jsx     # Admin API key auth
│   │   └── StudentContext.jsx  # Student token + GPS tracking loop
│   └── pages/
│       ├── Dashboard.jsx       # Stats, 3 charts, live attendance
│       ├── Classes.jsx         # CRUD + GPS geofence fields
│       ├── Students.jsx        # 15-field CRUD + detail modal
│       ├── Attendance.jsx      # Daily report + charts + CSV
│       ├── Logs.jsx            # Paginated, scan_type filter
│       ├── Devices.jsx         # ESP8266 device management
│       ├── Settings.jsx        # Health, API key, config
│       ├── NotFound.jsx        # 404 page
│       └── student/
│           ├── StudentLogin.jsx     # Dark glassmorphism login
│           ├── StudentDashboard.jsx # Today's status + GPS verification
│           └── StudentHistory.jsx   # Color-coded attendance history
├── .editorconfig
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
├── CONTRIBUTING.md
├── SECURITY.md
├── FRONTEND_SUMMARY.md         # Detailed technical documentation
└── README.md
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

This app uses **two authentication modes**:

### Admin Auth (API Key)
1. The Go backend expects `X-API-Key` header on admin-protected endpoints
2. Users enter their API key in **Settings → API Key**
3. Stored in `localStorage('rfid_api_key')` — injected automatically

### Student Auth (Bearer Token)
1. Students log in at `/student/login` with roll number + date of birth
2. Backend returns a Bearer token — stored in `localStorage('student_token')`
3. Token is sent as `Authorization: Bearer <token>` on student API calls
4. GPS tracking starts automatically after login

> **Note:** API keys and tokens are secrets. Never commit them.

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
