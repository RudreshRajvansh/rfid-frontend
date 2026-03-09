# RFID Attendance — Admin Panel

Admin dashboard for the RFID-based smart attendance system. Built with React, Tailwind CSS, and Recharts.

## Features

- **Dashboard** — real-time stats, attendance charts, recent scan feed
- **Classes** — CRUD management with capacity tracking
- **Students** — full student registry with search, filter, CSV export
- **Attendance** — daily reports by class with present/absent breakdown
- **Scan Logs** — paginated raw log viewer with date/UID filters
- **Settings** — API key management, server health check

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
| Date utils | date-fns |

## Getting Started

```bash
# Install dependencies
npm install

# Copy env and set your backend URL
cp .env.example .env

# Start dev server (proxies /api to localhost:8080)
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://rfid-backend.onrender.com`) |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set environment variable `VITE_API_URL` to your backend URL
4. Framework preset: **Vite** (auto-detected)
5. Build command: `npm run build`
6. Output directory: `dist`

The included `vercel.json` handles SPA routing and security headers automatically.

## Project Structure

```
src/
├── api.js              # API service layer
├── App.jsx             # Root with lazy routes + error boundary
├── main.jsx            # Entry point
├── index.css           # Tailwind + global styles
├── components/
│   ├── Layout.jsx      # Sidebar + header shell
│   ├── Modal.jsx       # Reusable modal
│   ├── UI.jsx          # Card, Button, Badge, etc.
│   └── ErrorBoundary.jsx
├── context/
│   └── AuthContext.jsx # API key auth state
└── pages/
    ├── Dashboard.jsx
    ├── Classes.jsx
    ├── Students.jsx
    ├── Attendance.jsx
    ├── Logs.jsx
    ├── Settings.jsx
    └── NotFound.jsx
```

## License

Private — not for redistribution.
