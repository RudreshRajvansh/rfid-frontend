# Security

## Don't commit secrets

The `.env` file has your backend URL and is gitignored. If you push it by accident, rotate the credentials — deleting the file won't remove it from git history.

```bash
git rm --cached .env
```

API keys are entered in-browser (Settings page) and stored in localStorage. They're only sent as `X-API-Key` headers to your own backend.

## Production headers

`vercel.json` sets these on all responses:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Other stuff

- Source maps are off in production (`sourcemap: false` in vite config)
- API requests have a 15s timeout so nothing hangs forever
- All calls go through `src/api.js`, never raw `fetch` in components
