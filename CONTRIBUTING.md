# Contributing

Quick rundown if you're working on this project.

## Getting started

1. Clone, run `npm install`, copy `.env.example` to `.env`
2. Set `VITE_API_URL` to wherever the backend is running
3. `npm run dev` — opens on port 5173
4. Go to Settings page, save your API key

Windows users might need `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` for npm to work.

## Code style

- Components go in `src/components/`, pages in `src/pages/`
- All API calls go through `src/api.js` — don't use fetch directly in components
- Tailwind for styling, avoid custom CSS unless you really need it
- Commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` prefix

## .gitignore explained

Here's why certain things are ignored:

**`node_modules/`** — gets rebuilt from package.json, don't commit this ever

**`dist/`** — build output, regenerated every time you run `npm run build`

**`.env` and `.env.local`** — has your backend URL and potentially sensitive config. Use `.env.example` as the template instead. Set real values in Vercel dashboard for production.

**`*.log`** — debug junk from npm/node

**`.vscode/`, `.idea/`** — your editor settings, not mine. Exception: `.vscode/extensions.json` is allowed through since it lists recommended extensions.

**`.DS_Store`, `Thumbs.db`** — OS clutter, nobody needs these

**`.vercel`** — local Vercel CLI state

## What to commit

Everything in `src/`, `public/`, config files (`vite.config.js`, `vercel.json`, `package.json`, `package-lock.json`), and the markdown docs.

## If you accidentally commit .env

Rotate the secret immediately. The key is compromised even if you delete the file — git keeps history. Use `git rm --cached .env` then recommit.

## Running checks

```bash
npm run lint     # eslint
npm run build    # make sure it compiles
```
