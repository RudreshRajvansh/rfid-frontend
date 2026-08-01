<div align="center">
  <h2>ClassTracker: Admin Panel & Student App</h2>
</div>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-00ADD8?logo=react&logoColor=white"></a>
  <img alt="GitHub" src="https://img.shields.io/github/license/RudreshRajvansh/rfid-frontend">
  <img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/RudreshRajvansh/rfid-frontend">
  <a href="https://rfid-frontend-dusky.vercel.app/"><img alt="Deployed on Vercel" src="https://img.shields.io/badge/deployed%20on-vercel-000000?logo=vercel&logoColor=white"></a>
  <a href="https://www.repostatus.org/#inactive"><img src="https://www.repostatus.org/badges/latest/inactive.svg" alt="Project Status: Inactive" /></a>
</p>

<p align="center">
  <a href="https://rfid-frontend-dusky.vercel.app/"><strong>Live Demo →</strong></a>
</p>

------

> [!Note]
> This project is not under active development right now. It still works and is documented as-is — if you'd like to pick it up, extend it, or fix something, contributions are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

------

**ClassTracker** is the admin panel and student companion app for an RFID-based smart attendance system. Admins manage classes, students, and devices and watch live attendance roll in; students log in to see their own attendance and get a second, GPS-based verification layer that confirms they're actually in the classroom, not just tapping a card and leaving.

Talks to [rfid-backend](https://github.com/RudreshRajvansh/rfid-backend) — see that repo for the API this app calls.

------

<h2 align="center">Highlights</h2>

- Admin dashboard — live stats, class/weekly trend charts, recent scans, CSV export.
- Full CRUD for classes, students, and devices, including GPS geofence config per class.
- Student portal — attendance history, today's status, background GPS presence check every 2 minutes.
- Code-split routes, an error boundary, and request timeouts on every API call.
- Light, fast — no state management library, just React + context.

------

<h2 align="center">Setup</h2>

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend
npm run dev
```

Then open Settings in the sidebar and enter your backend's admin API key.

------

<h2 align="center">Tech Stack</h2>

- [React 19](https://react.dev) — UI, via plain hooks + context, no state library.
- [Vite](https://vitejs.dev) — dev server and build.
- [Tailwind CSS v4](https://tailwindcss.com) — styling.
- [Recharts](https://recharts.org) — dashboard charts.
- [React Router](https://reactrouter.com) — client-side routing.

------

<h2 align="center">Contributing</h2>

Contributions are welcome!

> [!Note]
>
> Please read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, style, and PR guidelines before opening a pull request.

------

<h2 align="center">License</h2>

[MIT License][license] © [Rudresh Rajvansh][github]

[license]: LICENSE
[github]: https://github.com/RudreshRajvansh
