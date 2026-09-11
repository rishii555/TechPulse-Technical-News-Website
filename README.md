# TechPulse

A responsive technical news publication built with plain HTML, CSS, JavaScript, and an Express API. No React or Next.js is used.

## Run locally

Install the backend dependency and start the Express server:

```bash
npm install
npm start
```

For live headlines, create a free key at [newsapi.org](https://newsapi.org), then set it in PowerShell before starting the server:

```powershell
$env:NEWS_API_KEY="your_key_here"
npm run dev
```

`NEWS_API_KEY` is required because the site displays live NewsAPI stories only. Then visit `http://localhost:8000`. The API is available at `/api/articles`, `/api/articles/:id`, `/api/trending`, and `/api/health`.

## Structure

- `index.html` - semantic shell, navigation, footer
- `styles.css` - responsive editorial design system and dark mode
- `app.js` - API fetching, routes, rendering, filters, search, saving, newsletter, and article interactions
- `server.js` - Express server, live NewsAPI integration, filtering endpoints, and static file hosting
- `package.json` - Express dependency and start scripts

NewsAPI is called from the server so the secret never reaches the browser. The server normalizes live responses for the frontend and returns an explicit error when live news is unavailable.
