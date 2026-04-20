# RFID Attendance Admin Panel + Student App — Frontend Documentation

## v4.0 — With GPS Verification & Student Companion App

---

## What It Is

A **React Single Page Application** that serves two interfaces:

1. **Admin Panel** — Dashboard for managing classes, students, attendance, devices, and scan logs
2. **Student Companion App** — Students view their own attendance and verify classroom presence via GPS

Connects to a Go backend API. Deployed on **Vercel**.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| **React** | 19.2 | UI library — functional components, hooks |
| **Vite** | 7.3.1 | Build + dev server — ESBuild for HMR, Rollup for prod |
| **Tailwind CSS** | 4.2.1 | Utility-first CSS via @tailwindcss/vite plugin |
| **React Router** | 6.30.3 | Client-side routing with nested layouts |
| **Recharts** | 3.8.0 | BarChart, PieChart, LineChart |
| **Lucide React** | 0.577+ | SVG icon components |
| **react-hot-toast** | 2.6.0 | Toast notifications |
| **date-fns** | 4.1.0 | Date formatting |
| **ESLint** | 9.39.1 | Linting with react-hooks + react-refresh plugins |

---

## Architecture & Design Patterns

### Dual-Interface Architecture

The app has **two separate layouts** sharing the same codebase:

```
BrowserRouter
├── Admin Layout (sidebar + header)
│   ├── / (Dashboard)
│   ├── /classes
│   ├── /students
│   ├── /attendance
│   ├── /logs
│   ├── /devices
│   └── /settings
├── Student Login (/student/login — no layout wrapper)
└── Student Layout (header + bottom nav)
    ├── /student/dashboard
    └── /student/history
```

### Provider Stack

```jsx
<ErrorBoundary>
  <AuthProvider>        // Admin API key
    <StudentProvider>   // Student token + GPS tracking
      <BrowserRouter>
        <Toaster />
        <Suspense>
          <Routes>...</Routes>
        </Suspense>
      </BrowserRouter>
    </StudentProvider>
  </AuthProvider>
</ErrorBoundary>
```

### Code Splitting

- Every page lazy-loaded via `React.lazy()` + `Suspense`
- Vite `manualChunks` splits: vendor (react), charts (recharts), utils (date-fns, icons)

### API Layer (src/api.js)

- **30+ endpoint functions** through centralized `request()` wrapper
- Automatic header injection:
  - Admin: `X-API-Key` from `localStorage('rfid_api_key')`
  - Student: `Authorization: Bearer <token>` from `localStorage('student_token')`
- 15-second AbortController timeout on every request
- `encodeURIComponent` on all query params

---

## File Structure

```
rfid-frontend/
├── src/
│   ├── App.jsx                        # Routes + providers
│   ├── api.js                         # API layer (30+ endpoints)
│   ├── index.css                      # Tailwind @theme + custom styles
│   ├── main.jsx                       # React entry
│   │
│   ├── components/
│   │   ├── Layout.jsx                 # Admin: sidebar + header
│   │   ├── StudentLayout.jsx          # Student: header (GPS indicator) + bottom nav
│   │   ├── UI.jsx                     # Card, StatCard, Badge, Button, EmptyState, Spinner
│   │   ├── Modal.jsx                  # Overlay dialog (sm/md/lg/xl)
│   │   └── ErrorBoundary.jsx          # Crash recovery
│   │
│   ├── context/
│   │   ├── AuthContext.jsx            # Admin API key in localStorage
│   │   └── StudentContext.jsx         # Student token + GPS tracking loop
│   │
│   └── pages/
│       ├── Dashboard.jsx              # Stats, 3 charts, live attendance
│       ├── Classes.jsx                # CRUD + GPS geofence fields
│       ├── Students.jsx               # CRUD (15 fields) + detail modal
│       ├── Attendance.jsx             # Daily report + charts + CSV
│       ├── Logs.jsx                   # Paginated, scan_type filter
│       ├── Devices.jsx                # ESP8266 management
│       ├── Settings.jsx               # Health, API key, config
│       ├── NotFound.jsx               # 404
│       └── student/
│           ├── StudentLogin.jsx       # Dark glassmorphism login
│           ├── StudentDashboard.jsx   # Today status + GPS verification
│           └── StudentHistory.jsx     # 60-day color-coded history
│
├── public/                            # Static assets
├── dist/                              # Build output
├── vite.config.js                     # Plugins, proxy, chunks
├── vercel.json                        # Deployment config
├── package.json                       # Dependencies
├── .env                               # VITE_API_URL
└── eslint.config.js                   # Lint rules
```

---

## Reusable Components

### Layout.jsx — Admin Shell

- **Fixed sidebar** (w-64): Radio icon + "RFID Admin" branding
- **7 nav items**: Dashboard, Classes, Students, Attendance, Logs, Devices, Settings
- **Student App link** at sidebar bottom (opens in new tab)
- **Mobile responsive**: hamburger menu + backdrop overlay (hidden on lg:)
- **Sticky header**: green pulse dot "System Online"
- **Outlet** renders active page

### StudentLayout.jsx — Student Shell

- **Sticky header**: "ClassTracker" brand + student name + GPS status indicator
- **GPS status badges**: Idle / Locating… / In Class ✓ / Not in Range / GPS Error
- **Bottom tab navigation**: Home + History (NavLink with active state)
- **Auth guard**: redirects to `/student/login` if not authenticated
- **Max-width**: 512px centered (mobile-first)

### UI.jsx — Component Library

| Component | Props | Description |
|---|---|---|
| `Card` | children, className | White rounded-xl container with border + shadow |
| `CardHeader` | children, className | Section header with bottom border |
| `CardBody` | children, className | Padded content area |
| `StatCard` | icon, label, value, sublabel, color | Metric card (6 colors: primary, green, red, amber, violet, sky) |
| `Badge` | children, variant | Pill label (success, danger, warning, info, default) |
| `Button` | variant, size, className, ...rest | 4 variants × 3 sizes with focus rings |
| `EmptyState` | icon, title, description, action | Centered placeholder |
| `Spinner` | className | Animated SVG spinner |
| `LoadingScreen` | — | Centered spinner (h-64) |

### Modal.jsx

- Props: `open`, `onClose`, `title`, `children`, `size`
- Fixed overlay with black/50 backdrop
- 4 sizes: sm (max-w-md), md (max-w-lg), lg (max-w-2xl), xl (max-w-4xl)
- Max height 90vh with scroll

---

## Admin Pages — Detailed

### Dashboard (`/`)

| Feature | API Used |
|---|---|
| 6 stat cards (Students, Classes, Scans, Present, Currently In, Rate) | `GET /api/stats` |
| Bar chart — attendance by class (Present/Absent) | `GET /api/stats` |
| Donut pie chart — today's present vs absent | `GET /api/stats` |
| 7-day attendance trend line chart | `GET /api/stats/weekly` |
| "Currently In Class" live table | `GET /api/attendance/live` |
| Recent scans table with scan_type badges | `GET /api/stats` |

- Auto-refreshes every 30 seconds
- Uses `Promise.allSettled` for parallel data loading

### Classes (`/classes`)

| Feature | Details |
|---|---|
| Card grid layout | 1/2/3 columns responsive |
| Each card shows | Name, department, semester badge, section, room, teacher, student count, capacity bar |
| GPS indicator on cards | Shows lat/lng + radius if set |
| Create/Edit modal | 8 standard fields + 3 GPS geofence fields |
| "Use Current Location" button | `navigator.geolocation.getCurrentPosition()` fills lat/lng |
| Search | Client-side by class name, department, or teacher |
| Soft delete | window.confirm → sets is_active=false |

### Students (`/students`)

| Feature | Details |
|---|---|
| Table view | Roll No., Name (clickable), UID, Class, Gender badge, Phone, Actions |
| Responsive columns | UID hidden <md, Class/Gender <lg, Phone <xl |
| Detail modal | 14 read-only rows |
| Create/Edit modal | 15 fields in 3-column grid |
| Class filter | Dropdown re-fetches from API |
| Search | Client-side by name, roll number, UID |
| CSV export | Client-side blob generation + download |

### Attendance (`/attendance`)

| Feature | Details |
|---|---|
| Filters | Class dropdown + Date picker |
| 4 stat cards | Total, Present, Absent, Rate |
| Attendance table | Roll No., Name, Status badge, First In, Last Out, Scans |
| Donut pie chart | Present vs Absent distribution |
| CSV export | 7-column CSV download |

### Logs (`/logs`)

| Feature | Details |
|---|---|
| Paginated table | 50 records per page, offset-based |
| Columns | ID, Roll No., Name, UID, Date, Time, **Type** (NEW: scan_type badge), Actions |
| Filters | Date picker, UID search, **Type dropdown** (NEW: checkin/checkout/unknown) |
| Scan type badges | Green=checkin, Red=checkout, Gray=unknown |
| CSV export | 7 columns including scan_type |
| Delete | Removes all scans for UID on date |

### Devices (`/devices`) — NEW

| Feature | Details |
|---|---|
| Card grid | Each device shows MAC, label, last seen, online/offline badge |
| Online detection | Device "online" if last_seen < 10 minutes ago |
| Add/Edit modal | MAC address + label fields |
| Auto-registration | Devices register on first scan, can be labeled here |

### Settings (`/settings`)

| Feature | Details |
|---|---|
| Server health | GET / → shows Connected/Unreachable + version |
| API key | Enter, test, mask display, remove |
| Config | Shows VITE_API_URL, environment badge |

---

## Student App Pages — Detailed

### StudentLogin (`/student/login`)

- **Design**: Dark gradient (gray-900 → gray-800) with glassmorphism card (white/10 backdrop-blur)
- **Branding**: Blue rounded icon + "ClassTracker" + "Student Attendance App"
- **Fields**: Roll number (text, autofocus) + Date of birth (date picker with toggle)
- **Auth flow**: `POST /api/student/login` → token → `localStorage('student_token')` → redirect
- **Info text**: "GPS location will be used to verify your classroom presence"

### StudentDashboard (`/student/dashboard`)

- **Profile card**: Blue gradient, avatar initial, name, roll number, class, total days + hours
- **Today's status card**:
  - Green border + CheckCircle = Present
  - Red border + XCircle = Absent
  - Shows: check-in/out times, duration, scan count
- **GPS verification section**:
  - Live GPS status badge (In Class / Out of Range / Error / etc.)
  - Distance from classroom in meters
  - Pings today: X / Y (in-range / total)
  - In-class percentage with color-coded progress bar (green ≥70%, amber ≥40%, red <40%)
- **Auto-refresh**: Reloads today's data every 30 seconds

### StudentHistory (`/student/history`)

- **Last 60 days** of attendance cards
- **Color coding**:
  - 🟢 Green = Present + GPS verified (≥60% in-range)
  - 🟡 Yellow = Present, low GPS verification
  - 🔴 Red = Absent
- **Each card shows**: formatted date, status, GPS verification badge, time range, duration, scan count
- **Loading state**: Blue spinning border animation

---

## Context Providers

### AuthContext.jsx — Admin Auth

```javascript
// Provides:
{ apiKey, isAuthenticated, login, logout }

// Storage: localStorage('rfid_api_key')
// Usage: X-API-Key header on admin API calls
```

### StudentContext.jsx — Student Auth + GPS

```javascript
// Provides:
{ token, isLoggedIn, student, gpsStatus, lastPing,
  login, logout, loadProfile, startTracking, stopTracking }

// Storage: localStorage('student_token')
// Usage: Authorization: Bearer header on student API calls

// GPS Tracking:
// - Starts on login, stops on logout
// - navigator.geolocation.getCurrentPosition() every 2 minutes
// - Posts to POST /api/student/location
// - Updates gpsStatus: idle → tracking → in_range / out_of_range / error
```

---

## API Functions (api.js)

### Admin APIs

| Function | Endpoint | Pages Using It |
|---|---|---|
| `health()` | `GET /` | Settings |
| `getStats()` | `GET /api/stats` | Dashboard |
| `getWeeklyStats(classId)` | `GET /api/stats/weekly` | Dashboard |
| `scan(uid, mac)` | `POST /api/scan` | — |
| `getDailyReport(date, classId)` | `GET /api/attendance/daily` | Attendance |
| `getLiveAttendance(classId)` | `GET /api/attendance/live` | Dashboard |
| `getAttendanceRange(classId, from, to)` | `GET /api/attendance/range` | — |
| `exportAttendance(classId, date)` | `GET /api/export` | — |
| `getClasses()` | `GET /api/classes` | Classes, Students, Attendance |
| `getClass(id)` | `GET /api/class` | — |
| `createClass(data)` | `POST /api/classes` | Classes |
| `updateClass(id, data)` | `PUT /api/class` | Classes |
| `deleteClass(id)` | `DELETE /api/class` | Classes |
| `getStudents(classId)` | `GET /api/students` | Students |
| `getStudent(id)` | `GET /api/student` | — |
| `createStudent(data)` | `POST /api/students` | Students |
| `updateStudent(id, data)` | `PUT /api/student` | Students |
| `deleteStudent(id)` | `DELETE /api/student` | Students |
| `getStudentHistory(uid, limit, offset)` | `GET /api/student/history` | — |
| `getLogs(params)` | `GET /api/logs` | Logs |
| `deleteLog(uid, date)` | `DELETE /api/log` | Logs |
| `getDevices()` | `GET /api/devices` | Devices |
| `createDevice(data)` | `POST /api/devices` | Devices |

### Student APIs

| Function | Endpoint | Pages Using It |
|---|---|---|
| `studentLogin(roll, dob)` | `POST /api/student/login` | StudentLogin |
| `studentMe()` | `GET /api/student/me` | StudentContext, StudentDashboard |
| `studentAttendance(limit)` | `GET /api/student/attendance` | StudentHistory |
| `studentLocation(lat, lng)` | `POST /api/student/location` | StudentContext (GPS) |
| `studentToday()` | `GET /api/student/today` | StudentDashboard |

---

## Styling System

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **Custom theme** in `index.css` via `@theme`:
  - 11-shade blue primary palette (50 → 950)
- **Font**: Inter (Google Fonts with preconnect)
- **Custom `.input` class**: gray border, blue focus ring, smooth transitions
- **Custom scrollbar**: 6px slim, slate colors
- **Responsive breakpoints**: sm (640), md (768), lg (1024), xl (1280)
- **Dark theme elements**: Student login page uses dark gradients + glassmorphism

---

## Production Build

```bash
npm run build
```

**Output: 18 chunks**

| Chunk | Size | Gzipped |
|---|---|---|
| charts (recharts) | 394 KB | 115 KB |
| index (app core) | 213 KB | 68 KB |
| vendor (react) | 34 KB | 12 KB |
| utils (date-fns, icons) | 29 KB | 9 KB |
| CSS | 34 KB | 7 KB |
| Students page | 12 KB | 3 KB |
| Classes page | 9 KB | 3 KB |
| Dashboard page | 7 KB | 2 KB |
| Logs / Attendance | ~6 KB each | ~2 KB |
| StudentDashboard | 5 KB | 2 KB |
| Devices | 4 KB | 1 KB |
| Settings | 5 KB | 1 KB |
| StudentLogin | 3 KB | 1 KB |
| StudentHistory | 3 KB | 1 KB |

**Total:** ~780 KB raw / ~225 KB gzipped

---

## Deployment (vercel.json)

- **SPA rewrite**: All routes → `index.html`
- **Asset caching**: `max-age=31536000, immutable` on `/assets/*`
- **Security headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`

---

*ClassTracker v4.0 — Frontend Documentation*
*Updated: April 2026*
