# Guidance for AI coding agents

Purpose: help an AI quickly understand and modify this small client-side weather app so changes are safe, consistent, and productive.

Key entry points
- `wp3.html` — single-page entry (DOM skeleton, media references). Open this file when you want to understand the markup and asset layout.
- `styles.css` — extracted CSS. Look here for visual tokens used by JS (CSS variables: `--percent`, `--rotation-speed`).
- `script.js` — main application logic: DOM selection, OpenWeatherMap + USGS fetches, Leaflet map setup, UI updates.
- `videos/`, `*.jpg`, `*.png`, `*.mp4` — local assets referenced by both CSS and HTML. Filenames sometimes contain spaces (e.g., `clody sticker.png`) — prefer using safe filenames when adding assets.

Big picture architecture
- Static, client-side SPA (no backend) that calls third-party APIs directly from the browser:
  - OpenWeatherMap (current weather, forecast, UV endpoint)
  - USGS Earthquake API (alerts)
  - Leaflet + OpenStreetMap tiles for map display (loaded from CDN)
- No build system or package manifest. The app is served as static files; script ordering matters (Leaflet must be loaded before `script.js`).
- Data flows:
  1. `getWeather(city)` or geolocation → fetch current weather → `showWeather()` updates DOM and map
  2. `getForecast(lat, lon)` → `showForecast()` builds hourly/daily cards via template strings
  3. `getAlerts(lat, lon)` → fetches USGS data and appends alert items

Project-specific patterns and gotchas
- API key is embedded: `const apiKey` in `script.js`. When editing, note security implications. For local development it's OK; for production, move to a server or use a secret management approach.
- Timezone handling: `locationTimezoneOffset = data.timezone` (OpenWeatherMap returns seconds) and timestamps are formatted with: new Date((timestamp + offset) * 1000). This code expects offsets in seconds (correct for OpenWeatherMap) — follow the same convention.
- Unit conversions: OpenWeatherMap calls use `units=metric`; UI displays Fahrenheit via `celsiusToFahrenheit()` and converts wind speed km/h via `*3.6`.
- CSS variables control visual animations: the turbine rotation is driven by `--rotation-speed` and humidity gauge by `--percent` — update these names consistently if refactoring CSS/JS.
- DOM updates use template strings and innerHTML to render forecast cards. Keep ARIA-friendly attributes present (existing cards include `tabindex` and `aria-label`).
- Filenames with spaces: updating asset references must handle URL encoding or (preferably) rename assets to remove spaces.

Dev/test/debug workflow (no build)
- Serve the folder with a local static server to avoid CORS problems and to allow geolocation and fetch to work consistently. From PowerShell (Windows):

```powershell
# using python
python -m http.server 8000
# or using Node (if installed)
npx http-server -p 8000
```

Then open http://localhost:8000/wp3.html in a browser and use DevTools (Console / Network) to inspect API calls.
- Live reload: use VS Code Live Server extension for fast iteration.
- To test geolocation flows, run a browser that supports location and allow the permission prompt.

Files and examples to inspect when making changes
- `script.js`: where to change the API key, adjust unit handling, or refactor to async/await helpers.
  - Example: the UV fetch uses `https://api.openweathermap.org/data/2.5/uvi?lat=...` — if you update to newer OpenWeatherMap endpoints, update `getUV()` accordingly.
- `styles.css`: check `--percent` usage and `--rotation-speed` usage when changing visual components.
- `wp3.html`: initial map element (`#map`), video background `#bg-video`, and where `script.js` and Leaflet are loaded — preserve the order: Leaflet CDN then `script.js`.

Conservative change rules for AI
- Preserve API calls and parameter conventions unless explicitly asked to replace them. If you change an endpoint, update all callers and any formatting assumptions (e.g., timezone units).
- When touching assets, prefer renaming to URL-safe names and update references in HTML/CSS/JS.
- Keep DOM IDs stable (many are referenced by `script.js`). If you rename an ID, update every occurrence.
- Avoid inlining new secrets in the repo. If a change requires a key, instruct the human to provide it or add a local config file ignored by git.

If anything is unclear or you'd like the Copilot instructions expanded (examples for refactors, tests, or converting to a module/bundled app), tell me which area to expand and I will iterate.