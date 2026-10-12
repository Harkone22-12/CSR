# Network log: before and after submit

Recorded automatically with Chromium (Playwright) on the production build (`npm run build` + `npm run preview`, http://localhost:4173), 2026-10-12.
Fonts and icons from Google Fonts / unpkg may show as "blocked" because the test machine had no access to them; on a normal computer they load from cache or the CDN.

## 1. Before submit: first page load

| # | Method | Type | Status | URL |
|---|---|---|---|---|
| 1 | GET | document | 200 | `/` |
| 2 | GET | stylesheet | 200 | `/pixel.css` |
| 3 | GET | script | 200 | `/assets/index-EVA3Y_zI.js` |
| 4 | GET | stylesheet | blocked | `https://fonts.googleapis.com/css2?family=Handjet:wght@400..800&family=VT323&display=swap` |
| 5 | GET | stylesheet | blocked | `https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css` |

- Document requests: **1** (the HTML shell `/`).
- There is no request for student data: the seed data is inside the JS bundle.
- Students in state after load: **9**.

## 2. After submit: adding one student

Filled the form (Full name "Phạm Minh Thư", ID `STU-2026-111`, email, major) and pressed **Add student**.

| # | Method | Type | Status | URL |
|---|---|---|---|---|
| (none) | | | | |

- Requests after submit: **0**. Document requests: **0**.
- `performance.getEntriesByType('navigation').length` = **1** (still only the first page load, so the page was not reloaded).
- Students in state now: **10**. First card in the list: **Phạm Minh Thư** (marked "New").
- Form after submit: Full name = "" (empty), suggested ID = `STU-2026-112` (reset for the next student).

Screenshots: `state-before-submit.png`, `state-after-submit.png`.
