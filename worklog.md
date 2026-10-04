# Worklog - تخمین رشته قبولی با رتبه (Konkur Rank Estimator)

## Project Overview
Building a Persian (Farsi) Next.js app that replicates the Heyva Group's "نرم افزار تخمین رشته قبولی با رتبه" (Software for estimating admission major based on Konkur rank).

Reference source: https://www.heyvagroup.com/shownews/5535/...

## Source Logic (extracted from the website)
The software estimates which university major a Konkur candidate can be admitted to, based on:
- **Group (گروه آزمایشی)**: ریاضی (Math), تجربی (Experimental), انسانی (Humanities), هنر (Art), زبان (Language)
- **Quota (سهمیه/منطقه)**: منطقه 1 (Region 1 - Tehran/big cities, most competitive), منطقه 2 (Region 2 - mid), منطقه 3 (Region 3 - rural/small towns, least competitive), ایثارگران (Sacrificers 5% & 25%)
- **Rank in quota (رتبه در سهمیه)**: integer

Output: Lists of major+university combinations classified into three buckets:
- **خوش‌بینانه (Optimistic)**: majors where the user's rank is well below (better than) the cutoff — high admission chance
- **منطقی (Realistic)**: majors near the cutoff — moderate chance
- **بدبینانه (Pessimistic)**: majors where user's rank is worse than cutoff — reach/long-shot

Error rate advertised on source: ~5% (based on past year admission data).

## Implementation Plan
1. Create realistic Konkur admission dataset for 5 groups × 4 quotas with past-year cutoff ranks for major×university rows.
2. Build API endpoint `/api/estimate` returning the three buckets.
3. Build Persian RTL frontend with the form + results cards.
4. Add "Download as standalone HTML" feature so the user can save a self-contained HTML file with the same logic.
5. Style with Tailwind + shadcn/ui + dark mode + animations.
6. Verify end-to-end with agent-browser.
7. Schedule cron job (webDevReview) every 15 minutes.

---
Task ID: 0
Agent: main
Task: Project bootstrap, source extraction, plan creation

Work Log:
- Read /home/z/my-project/src/app/page.tsx, layout.tsx, globals.css, package.json
- Fetched source URL via z-ai page_reader, extracted the software description, inputs, outputs, and FAQs
- Wrote worklog.md with the extracted logic and the implementation plan

Stage Summary:
- Project is Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui, dev server already running on :3000
- Source logic understood: form (group + quota + rank) → 3 categorized lists of major×university
- Ready to build data file, API, and RTL UI in the next steps

---
Task ID: 1
Agent: main
Task: Build the full Persian RTL rank estimation app + downloadable HTML feature

Work Log:
- Read existing project files (page.tsx, layout.tsx, globals.css, package.json)
- Created `src/lib/konkur-data.ts` with:
  - 5 group dataset (ریاضی 60 rows, تجربی 42 rows, انسانی 33 rows, هنر 21 rows, زبان 20 rows)
  - 5 quotas (region1/2/3 + eythar5/eythar25) with realistic past-year cutoff ranks
  - 6 university types (dolati, azad, payamnoor, ghayrentefai, elmikarbordi, fanhariyan)
  - estimate() function computing 3 buckets: optimistic/realistic/pessimistic
  - computeChance() function returning 0..100 admission probability
  - Persian digit formatter
- Created `src/app/api/estimate/route.ts` (POST + GET) that validates input and returns EstimateResult
- Created `src/app/api/download-html/route.ts` that returns a self-contained HTML page
  with the same estimation logic baked in as a JSON payload + vanilla JS. The page
  preselects group/quota/rank from query string and works fully offline after download.
  Bug fixed: jsonSafe() was over-escaping " to \u0022 which made the embedded JSON
  invalid for JSON.parse — replaced with safer `</` and `<!--` sequence neutralization.
- Rewrote `src/app/page.tsx` with:
  - Sticky header with theme toggle (next-themes)
  - Hero section with gradient title and badges
  - Two-column layout: sticky form (group + quota + rank inputs) + results area
  - ResultView with summary stats + 3-tab result list (optimistic/realistic/pessimistic)
  - RowItem with Progress bar showing admission chance, badges for university type,
    city, last-admitted rank, and rank distance
  - FAQ accordion + info cards
  - Sticky footer (mt-auto on a flex flex-col root)
- Created `src/components/theme-provider.tsx` for next-themes provider
- Updated `src/app/layout.tsx` to set lang="fa" dir="rtl" + ThemeProvider + Persian metadata

Verification (agent-browser):
- Main page / renders in 200ms, sticky header sticky, RTL layout correct.
- Form validation works: empty rank → error message "لطفاً یک رتبه معتبر وارد کنید".
- POST /api/estimate with {group:riazi, quota:region1, rank:1500} returns 60 rows total
  (43 optimistic / 1 realistic / 16 pessimistic) — matches the same numbers in the UI.
- Switching group to تجربی + submit returns (30/1/11) for the same rank — UI tabs update.
- Theme toggle (dark↔light) works, screenshot shows correct contrast in both modes.
- /api/download-html returns a 91KB self-contained HTML file; opening it in agent-browser
  shows the form pre-filled with group/quota/rank from query string, and clicking
  "مشاهده تخمین رشته قبولی" produces the same 30/1/11 result as the API. ✅
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

Stage Summary:
- The app is feature-complete and end-to-end verified in the browser.
- The downloadable HTML is a true offline mirror of the main app: it runs the same
  estimate logic locally (vanilla JS) and lets the user save itself as an HTML file.
- Three-tier categorization (خوش‌بینانه / منطقی / بدبینانه) mirrors the source Heyva app.
- Next: schedule a webDevReview cron job for ongoing improvements per user instructions.

---
Task ID: 2
Agent: cron-review (webDevReview)
Task: QA pass + new features + styling improvements

## Current project status description/assessment
The project was feature-complete after Task 1 (Persian RTL Next.js app that estimates Konkur admission majors from a candidate's group+quota+rank, plus a downloadable standalone HTML mirror). The dev server was already running and ESLint was clean.

## QA findings (via agent-browser + curl)
- Main page `/` rendered correctly with proper RTL Persian layout.
- Form validation works (empty rank → "لطفاً یک رتبه معتبر وارد کنید (عدد مثبت)").
- POST /api/estimate returns the correct 3-bucket result for all 25 group×quota combos.
- Edge cases handled: rank=1 (60/0/0), rank=100000 (0/0/60), negative rank, invalid group, all 5 groups, all 5 quotas.
- /api/download-html returns a 65–91KB self-contained HTML file that runs the same logic offline.
- Result list is properly scrollable inside max-h-640px container.
- Sticky header and footer work.

## Bugs found & fixed
1. **Hydration mismatch (theme toggle)** — the `<AnimatePresence>` with conditional `motion.div` for Sun/Moon was rendering different markup on server vs client (because `theme` from next-themes is undefined on server). Fixed by gating the animated icon behind `mounted` and rendering a static `<Sun>` icon as fallback during SSR. Also added `suppressHydrationWarning` to the button.
2. **Hydration mismatch (favorites badge)** — the heart-icon badge count `fa(favs.length)` rendered 0 on SSR but a number on client after `loadFavs()` ran. Fixed by gating the count and the filled-heart className behind `mounted`.
3. **Hydration mismatch (footer year)** — `new Date().getFullYear()` can differ between SSR and client. Fixed with `suppressHydrationWarning`.
4. **Runtime error "Cannot read properties of undefined (reading 'emoji')"** — `GROUPS.find((g) => g.key === group)!` returned undefined when `group` was empty/invalid (transient state during deep-link hydration). Fixed with `?? GROUPS[0]` fallback (same for QUOTAS).
5. **Select components not showing hydrated value** — Radix UI Select doesn't render the option label server-side, so when the client hydrate effect set `group='tajrobi'`, the visible trigger still showed the placeholder. Fixed by adding `key={\`group-${mounted}\`}` and `key={\`quota-${mounted}\`}` to force a clean remount of the Select after `mounted` transitions to true.
6. **URL-sync overwriting hydrated URL params** — the URL-sync useEffect was running right after hydrate, replacing `?g=tajrobi&q=region3&r=5000&auto=1` with whatever was in state at that moment. Fixed by introducing a `userTouched` state flag set to true only on user input (onChange handlers), and gating the URL-sync on `mounted && userTouched`.

## New features added
1. **Filter & search bar** — text search across major/university/city, a university-type multi-select dropdown (6 types), and a min-chance percent slider (0–99). Filter applies to both tabs and "all" view. Includes a "پاک کردن همه" reset button. Shows live "displaying X of Y items" count.
2. **Three view modes** — Tabs (default, 3 categorized lists), List (all results in a single scrollable list with bucket badge), Chart (recharts BarChart of chance distribution + PieChart of bucket share, with Persian-friendly colors and tooltips).
3. **Favorites with localStorage** — heart button on every row toggles favorite. Header has a favorites button with a count badge that opens/closes a favorites panel. The panel shows each saved item with major, university, city, type, group/quota, rank, and chance. Persisted in `localStorage` under key `konkur-favorites`. Includes "پاک کردن همه" (clear all) and "بستن" (close) buttons.
4. **Shareable deep-link URL** — share button copies a URL like `?g=tajrobi&q=region3&r=5000&auto=1` to the clipboard. Opening that URL auto-fills the form and auto-submits (via `auto=1` param) to display results immediately.
5. **Two-way URL sync** — when the user changes any form field, the URL is updated with `replaceState` (no history spam) to keep the address bar in sync. Opening the same URL on another device reproduces the same form state.
6. **API endpoint accepts short params** — /api/download-html now accepts both `?group=` and `?g=` (and `?quota=`/`?q=`, `?rank=`/`?r=`) so it can be called from the share URL directly.

## Styling improvements
1. **Animated background blobs** — three slow-pulsing emerald/violet/amber gradient orbs in the background (12s `pulseSlow` keyframe).
2. **Glassmorphism sticky header** — `bg-background/70 backdrop-blur-xl` with a logo glow.
3. **Pulsing logo** — the header logo has a `blur-md opacity-60 animate-pulse` background.
4. **Spring-animated emoji in result card** — `motion.span` with rotate + scale spring.
5. **Staggered stat cards** — each summary stat animates in with a small delay.
6. **Hover micro-interactions** — info cards (5 groups / 5 quotas / 6 university types) get a colored border and shadow on hover.
7. **Animated icon rotation** — when hovering the primary "مشاهده تخمین" button, the calculator icon rotates 12°.
8. **Animated theme toggle** — Sun/Moon icons rotate and fade in/out via framer-motion.
9. **Per-row entrance animation** — each row in the results list slides in from the right (opacity + x: 10 → 0).
10. **Animated result view** — AnimatePresence handles enter/exit transitions when switching between results.
11. **Tabular numbers** — chance percent uses `tabular-nums` to keep the layout stable across values.

## Verification (final)
- agent-browser tests pass for all groups (riazi/tajrobi/ensani/honar/zaban) with deep-link (?g=&q=&r=&auto=1) — Select dropdowns show the correct hydrated value, tab counts match the API, no runtime errors.
- Search filter correctly narrows rows (e.g., "مهندسی برق" → 8 rows).
- University-type filter narrows correctly (دولتی → 27 rows in optimistic tab for riazi/region1/rank=2000).
- Min-chance slider correctly filters rows (>= 70% → all visible rows have chance ≥ 70%).
- Chart view renders both BarChart and PieChart SVGs.
- Favorites persist across reload (localStorage).
- Theme toggle works in both directions; `document.documentElement.className` switches between "light" and "dark".
- Share button copies URL with `&auto=1` to clipboard and shows a toast.
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.
- /api/download-html with short params `?g=tajrobi&q=region1&r=1500` works (HTTP 200).
- /api/download-html with long params `?group=riazi&quota=region1&rank=1200` still works (backward compatible).

## Unresolved issues or risks, and priority recommendations for the next phase
- The Radix Select SSR rendering quirk (placeholder shown server-side, value filled client-side) is now mitigated with a remount key, but it could re-appear if next-themes or shadcn/ui update behavior. A more permanent fix would be to render the form inside a mounted-only subtree, but that hurts first-paint UX.
- The downloadable HTML (`/api/download-html`) doesn't have the new filter/search/favorites/chart features — it's a simpler self-contained version. Next phase could port those features (filters + favorites using localStorage) to the downloadable HTML too.
- The current dataset uses estimated cutoffs; a real-world deployment should ingest actual past-year admission data from the Iranian Sanjesh organization. The dataset structure is already abstracted in `src/lib/konkur-data.ts` so swapping in real data is a drop-in.
- Accessibility: the chance slider is a native range input but lacks an explicit ARIA label — could add `aria-label="حداقل درصد شانس قبولی"`.
- Mobile: filter bar wraps to multiple lines on narrow screens; could collapse into a bottom-sheet drawer on small viewports.

Stage Summary:
- QA pass complete: all bugs found in the new feature set are fixed (5 hydration/runtime bugs + 1 URL-sync bug + 1 Select SSR quirk).
- Six new feature groups added: filter/search, three view modes, favorites, shareable URL, two-way URL sync, short-param API support.
- Styling improvements include animated background, glassmorphism, spring/stagger animations, hover micro-interactions, per-row entrance animations.
- All features verified end-to-end with agent-browser on multiple groups and edge cases.
- ESLint clean; dev server stable; no runtime errors.
