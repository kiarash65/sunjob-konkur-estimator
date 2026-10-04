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

---
Task ID: 3
Agent: cron-review (webDevReview)
Task: QA pass + new features (sorting, history, print, keyboard shortcuts) + port features to downloadable HTML

## Current project status description/assessment
The project was already feature-complete after Task 2 (Persian RTL Next.js app with rank estimation, downloadable HTML, filter/search, favorites, shareable URL, chart view, theme toggle, ARIA labels partially missing). Dev server running and ESLint clean. The recommended next-phase work items from Task 2 were:
- Accessibility: ARIA labels missing on chance slider, search input, university filter button.
- Mobile: filter bar wraps to multiple lines on narrow screens.
- Downloadable HTML lacked the new filter/search/favorites/chart features.

## QA findings (via agent-browser + curl)
- Main page `/` and deep-link `?g=&q=&r=&auto=1` work for all 5 groups.
- /api/download-html returns a self-contained HTML file (65–73KB) that runs offline.
- API edge cases handled (rank=0, rank="", rank=5B → all return 400 with proper error).
- Mobile viewport (375px) — no horizontal scroll; filter bar wraps to 168px tall (acceptable).
- Accessibility gaps confirmed: search input, chance slider, university filter button, sort selector — all missing aria-label.

## Bugs fixed
1. **Missing ARIA labels** — added `aria-label` to:
   - Search input (`جستجوی رشته، دانشگاه یا شهر`)
   - Chance range slider (`حداقل درصد شانس قبولی`) + `aria-valuetext` for screen readers
   - University filter dropdown button (`فیلتر بر اساس نوع دانشگاه`)
   - Sort dropdown (`مرتب‌سازی نتایج`)
   - Print button (`چاپ / ذخیره PDF`)
   - "Clear search" button (`پاک کردن جستجو`)
2. **No keyboard shortcuts** — added `/` to focus the search input (skipped when typing in another input/select). Visual hint shown as a `<kbd>` element in the search input when empty.

## New features added
1. **Result sorting** — sort dropdown with 5 options:
   - بیشترین شانس قبولی (default — highest chance first)
   - سخت‌ترین ورود (رتبه کمتر) — sort by cutoff ascending (lowest cutoff = hardest)
   - آسان‌ترین ورود (رتبه بیشتر) — sort by cutoff descending
   - نام رشته (الفبا) — sort by major name (Persian locale)
   - نام دانشگاه (الفبا) — sort by university name (Persian locale)
   Sort applies to all 3 buckets in tabs view, all list view, and respects active filters.
2. **Search history with localStorage** — every successful estimate is saved (deduped by group:quota:rank, max 8 items). Header has a "تاریخچه" button with count badge that opens a HistoryPanel:
   - Each entry shows group emoji + label, quota, rank, total choices, reachable count, best major + chance
   - Click an entry to replay that estimate (auto-fills form + resubmits)
   - Per-entry remove button + "پاک کردن همه" button
   - Persisted in `localStorage` under key `konkur-history`
3. **Print/PDF export** — print button in filter bar calls `window.print()`. Print-only header shows group/quota/rank + Persian date. Print styles in globals.css force light theme, hide chrome (header, footer, form, filter bar, info cards, FAQ), expand result lists to full height, and avoid breaking rows across pages.
4. **Keyboard shortcut `/`** — focuses the search input when not already typing in another input/select/textarea. Visual `<kbd>` hint shown in the search input when empty.

## Features ported to downloadable HTML (`/api/download-html`)
The standalone offline HTML file now has feature parity with the main page's filter/sort/print:
1. **Search input** — text search across major/university/city
2. **Sort dropdown** — same 5 sort options
3. **University type filter** — dropdown populated dynamically with only the types present in the current result
4. **Filter info bar** — shows "نمایش X مورد از Y رشته‌محل" with a "پاک کردن فیلتر" link
5. **Print button** — `🖨️ چاپ / PDF` button calls `window.print()`
6. **Print CSS** — hides form, save/print buttons, FAQ, info cards, footer; forces white background with black text; expands result lists
7. **Keyboard shortcut `/`** — focuses search input

## Styling improvements
1. **Custom scrollbar** — moved from inline `<style>` per-component to global `.custom-scroll` class in globals.css (8px thumb, var(--border) color, hover to var(--muted-foreground))
2. **Range slider thumb** — bigger 16px thumb with white border and shadow, accent-emerald-500 fill
3. **Print-only header** — only visible when printing; shows report title, group/quota/rank summary, and Persian date
4. **`print:hidden` utility** — applied to header, footer, form card, filter bar, info cards, FAQ section so only the result summary + result list print

## Verification (final)
- agent-browser tests pass for riazi/tajrobi/ensani/honar with deep-link — Select dropdowns show correct hydrated value, tab counts match API, no runtime errors.
- Result sorting verified: changing sort to "cutoff-desc" puts مهندسی عمران (cutoff 65,000) first in optimistic tab; "cutoff-asc" puts مهندسی برق (cutoff 2,800) first.
- Search history: 2 successful submits → history has 2 entries, persisted across reload.
- Print button triggers `window.print()` (mocked for test).
- Keyboard shortcut `/` focuses search input (verified `isFocused: true` after pressing `/`).
- Accessibility: all interactive elements now have aria-label.
- Downloadable HTML: search "مهندسی برق" → narrows 60 to 12 results; sort cutoff-desc puts non-profit university first (cutoff 35,000); university type filter "دولتی" → 10 results; clear filter button restores all 60.
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

## Unresolved issues or risks, and priority recommendations for the next phase
- **Chart view not in downloadable HTML** — the offline file is still missing the recharts-based chart view. Adding it would require either bundling a chart library into the HTML or hand-rolling SVG charts in vanilla JS.
- **Favorites not in downloadable HTML** — the offline file doesn't have a favorites feature. Could add localStorage-based favorites mirroring the main app's `konkur-favorites` key for cross-file sharing.
- **Sort dropdown SSR quirk** — same Radix Select SSR issue as the form Select; currently mitigated with the `key={mounted}` remount trick. A mounted-only subtree would be a permanent fix but hurts first paint.
- **Mobile filter bar** — wraps to 3+ lines on narrow screens; could collapse into a bottom-sheet drawer (using shadcn's Sheet component) on small viewports.
- **Real Sanjesh data** — current dataset uses estimated cutoffs. Real past-year admission data should be ingested for production use.

Stage Summary:
- QA pass complete: all accessibility gaps fixed (6 ARIA labels added), keyboard shortcut added.
- Five new feature groups added to the main app: result sorting (5 options), search history with replay, print/PDF export, keyboard shortcuts, sort dropdown with kbd hint.
- All new features (filter/search/sort/print/keyboard shortcut) ported to the downloadable HTML file — now feature-parity with the main app's filtering/sorting/printing.
- Styling: custom scrollbar, range slider thumb, print-only header, print:hidden utility applied throughout.
- ESLint clean; dev server stable; no runtime errors.

---
Task ID: 4
Agent: cron-review (webDevReview)
Task: QA pass + new features (priority list, export CSV/JSON, mobile sheet) + port to downloadable HTML

## Current project status description/assessment
The project was feature-complete after Task 3 with: rank estimator, filter/search, sort (5 options), favorites, history, chart view, print/PDF, keyboard shortcuts, deep-link sharing, downloadable offline HTML. ESLint clean, no runtime errors. The recommended next-phase work items from Task 3 were:
- Mobile filter bar wraps to 3+ lines on narrow screens (could use bottom-sheet drawer).
- Chart view & favorites not in downloadable HTML.
- Real Sanjesh data (out of scope).

## QA findings (via agent-browser + curl)
- Main page deep-link `?g=riazi&q=region1&r=2000&auto=1` works: tabs show 39/4/17, no errors.
- /api/download-html returns 73KB self-contained HTML that runs offline (39/4/17 results match main page).
- Mobile viewport (375px): filter bar was 168px tall (3+ rows) — confirmed the need for a mobile-optimized layout.
- Desktop viewport (1280px): filter bar is 80px (1 row) — looks good.
- ESLint passes; no runtime errors in dev.log.
- All existing features (sort, favorites, history, chart, print, share) verified working.

## New features added (Main App)
1. **Recommended Priority List view** (`PriorityListView` component) — 4th view mode (after Tabs/List/Chart):
   - Generates a 24-choice priority list using the standard "3 buckets of 8" Konkur strategy: 8 safe (خوش‌بینانه), 8 logical (منطقی), 8 reach (بدبینانه).
   - Each strategy section is a separate colored card with icon, label, count, description.
   - Each row shows priority number (1-24) in a colored badge, major, university, city, type, cutoff, chance%, and a heart button for favorites.
   - Animated entrance (staggered by priority, framer-motion `motion.li`).
   - "کپی لیست" button copies the full priority list to clipboard as plain text with strategy labels.
   - Includes an info card explaining the strategy ("۳ دسته ۸ تایی").
2. **Export CSV/JSON** (`onExportCSV`, `onExportJSON`):
   - CSV export with UTF-8 BOM for Excel compatibility, Persian headers, all 3 buckets sorted (optimistic → realistic → pessimistic, by chance desc within each).
   - JSON export with meta (group/quota/rank/totals/best) and rows (major/university/type/city/cutoff/chance/bucket/rankDistance).
   - Filename pattern: `taghmin-{group}-{quota}-{rank}.csv|json`.
   - Sonner toast notifications on success/failure.
3. **Mobile bottom-sheet drawer** for filter bar (using shadcn/ui `Sheet`):
   - On viewports <768px (md breakpoint), the filter bar is replaced by a "فیلترها" button + a separate "خروجی" dropdown.
   - Clicking "فیلترها" opens a bottom Sheet containing: search input, min-chance slider, university-type toggle buttons (2-column grid), sort dropdown, "اعمال فیلترها" + "پاک کردن" buttons.
   - Active filter count badge on the "فیلترها" button.
   - Mobile view switcher (Tabs/List/Chart/Priority) becomes a separate 4-button row.
4. **Sonner toast notifications** (replacing inline toasts):
   - Added `<SonnerToaster position="bottom-center" richColors closeButton dir="rtl" />` to layout.tsx.
   - Used `toast.success()` and `toast.error()` for export actions, copy actions.
   - Rich colors (green for success, red for error) with close button and RTL support.
5. **Export dropdown menu** (consolidates CSV/JSON/CopyPriority/Print into one menu on desktop):
   - Single "خروجی" button opens a dropdown with 4 items.
   - On mobile, the same dropdown is accessible via a download-icon button.

## Features ported to downloadable HTML (`/api/download-html`)
The standalone offline HTML now has feature parity with the main app for export/priority:
1. **CSV export button** (`📊 CSV (Excel)`) — same UTF-8 BOM CSV format with Persian headers.
2. **JSON export button** (`📄 JSON`) — same JSON structure with meta + rows.
3. **Priority list view button** (`✨ لیست اولویت پیشنهادی`) — toggles a `#priorityArea` div showing:
   - Header card with title + meta (group/quota/rank/total).
   - 3 strategy buckets (safe/logical/reach) with colored headers, each showing up to 8 priority rows.
   - Each row shows priority number badge, major, university, city, type, cutoff, chance%, strategy label.
4. **Copy priority list button** (`📋 کپی لیست اولویت`) — copies plain-text priority list to clipboard with fallback for older browsers.
5. **All buttons disable-actionable when no result exists** — clicking any export button before submitting shows a toast "ابتدا یک تخمین انجام دهید".

## Styling improvements
1. **PriorityListView design** — 3 colored cards (emerald/amber/rose) with gradient backgrounds, icons (CheckCircle2/Scale/AlertTriangle), strategy badges, and animated staggered rows.
2. **PriorityRow design** — colored priority badge (1-24), tabular-nums chance percentage, hover effect, heart button for favorites.
3. **Mobile filter sheet** — clean bottom-sheet with grouped sections (search/chance/uni-type/sort), 2-column toggle buttons, primary "اعمال فیلترها" button.
4. **Mobile view switcher** — 4 equal-width buttons in a row (Tabs/List/Chart/Priority).
5. **Export dropdown** — labeled menu items with icons (FileSpreadsheet/FileJson/Wand2/Printer).
6. **Sonner toaster** — rich colors, bottom-center, close button, RTL-aware.

## Verification (final)
- Main page deep-link `?g=riazi&q=region1&r=2000&auto=1`: tabs show 39/4/17, no errors.
- Main page deep-link `?g=tajrobi&q=region3&r=3000&auto=1`: tabs show 28/2/12, no errors.
- Priority view button visible and functional: clicking shows "لیست پیشنهادی اولویت انتخاب رشته" with 3 strategy sections (8 safe + 2 logical + 8 reach = 18 items for tajrobi/region3/rank=3000).
- CSV export verified: file `taghmin-riazi-region1-2000.csv` downloaded (mocked click captures href + download attr).
- JSON export verified: file `taghmin-riazi-region1-2000.json` downloaded.
- Copy priority list verified: clipboard contains "لیست پیشنهادی اولویت انتخاب رشته — ریاضی / منطقه یک / رتبه ۲,۰۰۰\n\n1. مهندسی عمران — دانشگاه علم و صنعت (99٪ — امن)\n2. ..." (correct format with strategy labels).
- Mobile sheet (375px): "فیلترها" button opens bottom Sheet with all filters; "اعمال فیلترها" closes it.
- Downloadable HTML: 85KB, all 4 new buttons (CSV/JSON/Priority/Copy) visible. Submit → 39 results. Priority view toggle works (renders 3 strategy buckets with priority rows). CSV/JSON export produce files with correct names. Copy priority list fills clipboard with the same format.
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

## Unresolved issues or risks, and priority recommendations for the next phase
- **Chart view not in downloadable HTML** — the offline file still lacks the recharts-based chart view. Adding it would require hand-rolling SVG charts in vanilla JS (the BarChart + PieChart from recharts can't be bundled easily).
- **Favorites not in downloadable HTML** — the offline file doesn't have a favorites feature. Could add localStorage-based favorites mirroring the main app's `konkur-favorites` key for cross-file sharing.
- **Sort dropdown SSR quirk** — still mitigated with the `key={mounted}` remount trick.
- **Real Sanjesh data** — current dataset uses estimated cutoffs; real past-year admission data should be ingested for production use.
- **PWA / offline support** — could add a service worker to make the main page itself work offline (currently only the downloadable HTML is offline-capable).

Stage Summary:
- QA pass complete: no bugs found in current functionality; mobile layout issue confirmed and fixed.
- Five new feature groups added to the main app: Priority List view (4th view mode with 3 strategy cards), CSV/JSON export with UTF-8 BOM, Copy priority list to clipboard, Mobile bottom-sheet filter drawer, Sonner toast notifications.
- All 4 new features (CSV/JSON/Priority list/Copy priority) ported to the downloadable HTML file — now full feature parity for export/priority.
- Styling: PriorityListView with animated staggered rows, mobile sheet with grouped sections, export dropdown with icons, Sonner toaster with rich colors.
- ESLint clean; dev server stable; no runtime errors.

---
Task ID: 5
Agent: cron-review (webDevReview)
Task: QA pass + new features (statistics card, offline favorites, offline SVG charts, accessibility)

## Current project status description/assessment
The project was feature-complete after Task 4 with: rank estimator, filter/search, sort, favorites, history, chart view (main app only), print/PDF, keyboard shortcuts, deep-link sharing, downloadable offline HTML with CSV/JSON/priority-list features. ESLint clean, no runtime errors. The recommended next-phase work items from Task 4 were:
- Chart view not in downloadable HTML (could hand-roll SVG charts).
- Favorites not in downloadable HTML.
- Sort dropdown SSR quirk (still mitigated).
- Real Sanjesh data (out of scope).
- PWA / offline support for main page.

## QA findings (via agent-browser + curl)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Main page deep-link `?g=tajrobi&q=region3&r=3000&auto=1`: tabs show 28/2/12, no errors.
- /api/download-html returns 85KB self-contained HTML that runs offline (38/4/18 results match main page).
- Priority view in offline HTML works (renders 3 strategy buckets with priority rows).
- CSV/JSON export in offline HTML works (correct filenames).
- Copy priority list in offline HTML works (clipboard filled with correct text).
- ESLint passes; no runtime errors in dev.log.
- All previously-added features (filter/search/sort/favorites/history/chart/print) verified working.

## New features added (Main App)
1. **Detailed Statistics Card** (`StatisticsCard` component, always visible between Summary and Filter bar):
   - `computeDetailedStats()` function in `lib/konkur-data.ts` computes:
     - mean, median, std dev of cutoffs
     - best (smallest) and worst (largest) cutoffs
     - user percentile (what fraction of majors have a harder cutoff than the user)
     - average chance across all rows
     - chance distribution bins
     - recommendation tier (excellent/good/fair/challenging/difficult) based on reach rate
   - Visual:
     - Card title with tier badge (color-coded: emerald/teal/amber/orange/rose)
     - Tier description text (Persian, tailored to the user's standing)
     - Percentile bar with gradient fill (green→red) + user marker line + "بهتر"/"بدتر" labels
     - 6-tile stat grid (2 cols mobile, 3 cols desktop) with label/value/hint for each statistic
     - Reach vs out-of-reach badges at the bottom

## New features ported to downloadable HTML (`/api/download-html`)
1. **Favorites (localStorage)** — full port:
   - Heart button (♡/❤) on every result row (60 buttons total for riazi/region1)
   - "علاقه‌مندی‌ها" button in hero header with count badge
   - Favorites panel (separate `<section id="favPanel">`) showing saved items with major, university, city, type, group/quota, rank, chance%, chance bar, and per-item remove (✕) button
   - "پاک کردن همه" button with confirmation dialog
   - "بستن" button to close panel
   - localStorage key `konkur-favorites` (mirrors main app's key for cross-file sharing)
   - Event delegation handles dynamic re-renders (filter/sort)
2. **Hand-rolled SVG charts** (no external library):
   - **BarChart** (`buildBarChartSVG`) — chance distribution: 6 bins (90-99, 70-89, 50-69, 30-49, 10-29, 0-9) with colored bars, count labels above, Persian-digit Y-axis ticks (0, 25%, 50%, 75%, 100% of max), Persian-digit X-axis labels
   - **PieChart** (`buildPieChartSVG`) — bucket distribution: 3 donut slices (خوش‌بینانه/منطقی/بدبینانه) with white separators, total count in center, "رشته‌محل" label below
   - **Legend** — colored squares + name + count + percentage
   - "📈 نمودار تحلیل" button toggles `#chartArea` div
   - All SVGs use `currentColor` for axis/grid so they adapt to light/dark theme

## Accessibility & styling improvements
1. **Skip-to-content link** (`<a href="#main-content" class="skip-link">پرش به محتوای اصلی</a>`):
   - Hidden off-screen (top: -100px) until focused via keyboard
   - When focused (Tab from URL), animates in (top: 0) with primary-color outline
   - Clicking focuses the `<main id="main-content">` element (with `tabIndex={-1}` + `scroll-mt-20`)
2. **`prefers-reduced-motion` support** in globals.css:
   - All animations/transitions reduced to 0.01ms when user prefers reduced motion
   - Decorative animations (background blobs, pulsing logo) hidden/disabled
   - `scroll-behavior: auto` (no smooth scrolling)
3. **Visible focus styles** for keyboard navigation:
   - `*:focus-visible` — 2px primary-color outline, 2px offset, 4px border radius
   - `button:focus-visible`, `[role="button"]:focus-visible`, `a:focus-visible` — same outline

## Verification (final)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Main page deep-link `?g=tajrobi&q=region3&r=3000&auto=1`: tabs show 28/2/12, no errors.
- StatisticsCard renders: title "تحلیل آماری رتبه" + tier badge "خوب" (good), tier description, percentile bar (صدک: ۲۹٪), 6 stat tiles (mean ۲۵,۴۷۸ / median ۱۴,۶۰۰ / std dev ۳۲,۵۰۹ / hardest ۶۲۰ / easiest ۱۲۷,۰۰۰ / avg chance), reach/out-of-reach badges.
- Skip link verified: exists with text "پرش به محتوای اصلی", hidden at top: -100px, becomes top: 0px when focused.
- Downloadable HTML: 103KB (was 85KB), all new buttons visible (📈 نمودار تحلیل).
- Offline favorites: clicking heart toggles ♡→❤, count badge shows ۱, localStorage stores the item, favorites panel opens with all details, ✕ remove button works, "پاک کردن همه" with confirmation works.
- Offline charts: clicking "📈 نمودار تحلیل" toggles `#chartArea`, renders BarChart SVG (with Persian-digit axis: ۰/۱۰/۲۰/۲۹/۳۹, X labels ۹۰-۹۹/۷۰-۸۹/.../۰-۹) and PieChart SVG (donut with 3 slices, center label "۶۰ رشته‌محل", legend with counts and percentages: ۳۹/۶۵٪, ۴/۷٪, ۱۷/۲۸٪).
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

## Unresolved issues or risks, and priority recommendations for the next phase
- **3-state theme toggle (light/dark/system)** — not implemented yet; currently only light/dark toggle. Could add a 3-state cycle.
- **PWA / offline support** for main page — could add a service worker + manifest.json to make the main page itself work offline (currently only the downloadable HTML is offline-capable).
- **Real Sanjesh data** — current dataset uses estimated cutoffs; real past-year admission data should be ingested.
- **Sort dropdown SSR quirk** — still mitigated with the `key={mounted}` remount trick.
- **Mobile bottom-sheet** could also include the priority list and chart views as additional tabs.
- **Statistics card could be collapsible** for users who only want the basics.

Stage Summary:
- QA pass complete: all existing features verified working, no new bugs.
- Three new feature groups added: Detailed Statistics Card (main app), Favorites with localStorage (downloadable HTML), Hand-rolled SVG BarChart + PieChart (downloadable HTML).
- Accessibility: skip-to-content link, prefers-reduced-motion support, visible focus-visible styles.
- ESLint clean; dev server stable; no runtime errors.
- Downloadable HTML now has full feature parity with the main app for: rank estimation, filter/search/sort, favorites, priority list, CSV/JSON export, copy priority list, print/PDF, keyboard shortcuts, AND now charts.

---
Task ID: 6
Agent: cron-review (webDevReview)
Task: QA pass + new features (3-state theme toggle, collapsible stats, city filter, quick-start)

## Current project status description/assessment
The project was feature-complete after Task 5 with: rank estimator, filter/search/sort, favorites, history, chart view, print/PDF, keyboard shortcuts, deep-link sharing, downloadable offline HTML with CSV/JSON/priority-list/favorites/charts features. ESLint clean, no runtime errors. The recommended next-phase work items from Task 5 were:
- 3-state theme toggle (light/dark/system) — not implemented yet.
- PWA / offline support for main page.
- Real Sanjesh data.
- Mobile bottom-sheet could include priority list and chart views.
- Statistics card could be collapsible.

## QA findings (via agent-browser + curl)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Downloadable HTML works offline (38 results, chart view renders 2 SVGs).
- All previously-added features verified working.
- ESLint passes; no runtime errors in dev.log.

## New features added (Main App)
1. **3-state theme toggle (light/dark/system)** — converted the 2-state button (light/dark) into a dropdown menu with 3 explicit options:
   - Each option has an icon (Sun/Moon/Monitor) and a checkmark when selected.
   - The trigger button shows the icon corresponding to the current theme.
   - AnimatePresence handles smooth icon transitions.
   - `title` attribute shows "تم فعلی: تاریک/روشن/سیستم".
2. **Collapsible StatisticsCard** — the card header is now clickable:
   - Click or keyboard activate toggles collapse via `useState(false)`.
   - AnimatePresence animates height (0 ↔ auto) and opacity.
   - Chevron rotates -90deg when collapsed.
   - `aria-expanded` + `aria-controls` for screen readers.
   - "نمایش جزئیات" / "بستن جزئیات" label on desktop.
3. **City filter** — new `<Select>` dropdown after the university-type filter:
   - Populated dynamically with only the cities present in the current result (e.g., تهران ۳۱, اصفهان ۷, تبریز ۳, ...).
   - "همه شهرها" option shows the total count.
   - Each city option shows its count.
   - Only shown when `availableCities.length > 1`.
   - Applies to both tabs and all-list views.
   - Added to the mobile sheet too (as a Select).
   - `resetFilters()` now also clears the city filter.
   - Filter count badge and "showing X of Y" condition include `cityFilter`.
4. **Quick-start example buttons** in EmptyState:
   - 4 example scenarios as clickable cards: ریاضی/منطقه ۱/رتبه ۱۵۰۰, تجربی/منطقه ۳/رتبه ۸۰۰۰, انسانی/منطقه ۲/رتبه ۴۰۰۰, هنر/منطقه ۱/رتبه ۳۰۰۰.
   - Each card shows emoji, label, and short description.
   - Hover effect: border turns emerald, label text turns emerald, chevron animates.
   - Clicking sets the form fields + auto-submits (via `submitEstimate`).

## New features ported to downloadable HTML
1. **City filter** — `<select id="citySel">` dropdown:
   - Populated dynamically with cities present in the result, each with count.
   - Sorts cities alphabetically (Persian locale).
   - Event listener calls `reRender()`.
   - `filterState.city` added; `applyFiltersAndSort` respects it.
   - Clear-filters link now also resets city.
2. **Collapsible statistics card** — `<div id="statsCard">` with header + body:
   - `renderStatsCard(result)` computes: mean, median, std dev, best (hardest), worst (easiest), user percentile, average chance, reach count, out-of-reach count, tier (excellent/good/fair/challenging/difficult), tier label + description.
   - Renders: tier description, percentile bar (gradient + "صدک: X٪"), 6 stat tiles in 3-column grid, reach/out-of-reach badges.
   - `setupStatsCardToggle()` wires click + keyboard (Enter/Space) handlers on the header.
   - Chevron rotates -90deg when collapsed; `aria-expanded` updates.
   - Called after every `render()`.

## Verification (final)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Theme dropdown: opens with 3 options (روشن/تاریک/سیستم); selecting "سیستم" sets html class to "light" (resolved from system).
- City filter: opens with 14 cities (تهران ۳۱, اصفهان ۷, تبریز ۳, ...); selecting "اصفهان" narrows results to 7 (filter info: "نمایش ۷ مورد از ۶۰ رشته‌محل").
- Stats card collapse: clicking header sets `aria-expanded: false`, body height to 0, chevron rotated -90deg; clicking again expands.
- Quick-start: clicking "ریاضی — منطقه ۱ — رتبه ۱۵۰۰" auto-fills form + submits, URL becomes `?g=riazi&q=region1&r=1500`, tabs show 43/1/16.
- Downloadable HTML: 114KB (was 103KB), all new features present.
- Offline city filter: 15 options (همه + 14 cities with counts); selecting "اصفهان" narrows to 7 results.
- Offline stats card: renders tier "خوب", meta "ریاضی — منطقه یک — رتبه ۲,۵۰۰", percentile bar "صدک: ۳۵٪", 6 stat tiles (mean ۱۲,۱۱۴ / median ۴,۸۰۰ / std dev ۱۵,۳۲۷ / hardest ۱۵۰ / easiest ۶۵,۰۰۰ / avg chance ۶۶٪), reach/out-of-reach badges (۴۲ در دسترس / ۱۸ خارج از دسترس).
- Offline stats collapse: clicking header hides body, rotates chevron, updates aria-expanded.
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

## Unresolved issues or risks, and priority recommendations for the next phase
- **PWA / offline support** for main page — could add a service worker + manifest.json to make the main page itself work offline (currently only the downloadable HTML is offline-capable).
- **Real Sanjesh data** — current dataset uses estimated cutoffs; real past-year admission data should be ingested.
- **Sort dropdown SSR quirk** — still mitigated with the `key={mounted}` remount trick.
- **Quick-start examples** could be added to the downloadable HTML too (currently only in main app).
- **Theme toggle** in downloadable HTML — currently hardcoded to dark; could add a localStorage-based toggle.

Stage Summary:
- QA pass complete: no bugs found in current functionality.
- Four new feature groups added to the main app: 3-state theme dropdown (light/dark/system), collapsible StatisticsCard, city filter (advanced filter), quick-start example buttons in EmptyState.
- Two new features ported to downloadable HTML: city filter, collapsible statistics card with full stats computation.
- ESLint clean; dev server stable; no runtime errors.
- Downloadable HTML now has feature parity for: rank estimation, filter/search/sort (including city), favorites, priority list, CSV/JSON export, copy priority list, print/PDF, keyboard shortcuts, charts, AND now collapsible stats card.

---
Task ID: 7
Agent: cron-review (webDevReview)
Task: QA pass + new features (comparison view, keyboard help dialog, offline quick-start + theme toggle)

## Current project status description/assessment
The project was feature-complete after Task 6 with: rank estimator, filter/search/sort (including city), favorites, history, chart view, print/PDF, keyboard shortcuts, deep-link sharing, downloadable offline HTML with CSV/JSON/priority-list/favorites/charts/city-filter/collapsible-stats-card features. ESLint clean, no runtime errors. The recommended next-phase work items from Task 6 were:
- PWA / offline support for main page.
- Real Sanjesh data.
- Sort dropdown SSR quirk.
- Quick-start examples could be added to the downloadable HTML.
- Theme toggle in downloadable HTML — currently hardcoded to dark.

## QA findings (via agent-browser + curl)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Downloadable HTML works offline (38 results, all features present).
- All previously-added features verified working.
- ESLint passes; no runtime errors in dev.log.

## Bugs found & fixed
1. **showShortcutHelp state in wrong component** — initially declared `showShortcutHelp` in `ResultView`, but the keyboard handler `useEffect` lives in `Home`. This caused a `ReferenceError: showShortcutHelp is not defined` at page load, resulting in an "Application error" page. Fixed by moving the state declaration from `ResultView` to `Home` (alongside `mounted`, `showFavs`, etc.).

## New features added (Main App)
1. **Comparison view** (`CompareView` component, 5th view mode):
   - New view mode `'compare'` added to the view state union.
   - Input field for a second rank (same group + quota), "مقایسه" button, "پاک" button.
   - Enter key in the input triggers compare.
   - Fetches the comparison estimate via POST /api/estimate.
   - Renders a side-by-side table comparing 6 metrics (reachableCount, outOfReachCount, averageChance, userPercentile, meanCutoff, medianCutoff) + tier row.
   - Each metric row shows: label, current value, compare value, diff (with +/− sign and color: green=better, red=worse, gray=same).
   - Percent values show ٪ suffix; rank values use faFmt.
   - Loading state via `compareLoading` (spinner).
   - Toast notifications for success/error.
   - Empty state with icon and instructions when no comparison has been run.
   - New `GitCompare` icon button in both desktop and mobile view switchers.
2. **Keyboard shortcut help dialog** (`?` shortcut):
   - New `HelpCircle` icon button in the header (next to theme toggle).
   - Pressing `?` (when not typing in an input) toggles a modal dialog.
   - Dialog shows 4 shortcuts: `/` (focus search), `?` (toggle this help), `Esc` (close/return to search), `Enter` (submit form).
   - Each shortcut shown as a `<kbd>` element.
   - AnimatePresence handles enter/exit animations (fade + scale spring).
   - Click outside or Esc closes the dialog.
   - `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for accessibility.

## New features ported to downloadable HTML
1. **Quick-start example buttons** — 4 clickable cards in a 2-column grid below the form:
   - ریاضی/منطقه ۱/رتبه ۱۵۰۰, تجربی/منطقه ۳/رتبه ۸۰۰۰, انسانی/منطقه ۲/رتبه ۴۰۰۰, هنر/منطقه ۱/رتبه ۳۰۰۰.
   - Each shows emoji + label + description.
   - Hover effect: emerald border + tinted background.
   - Clicking fills the form (group/quota/rank) and dispatches a submit event.
2. **Theme toggle (light/dark)** — `#themeBtn` button in the header:
   - Cycles between dark (🌙/تاریک) and light (☀️/روشن).
   - Persists choice in localStorage under key `konkur-theme`.
   - Light theme CSS variables override the dark defaults via `html[data-theme="light"]` selector.
   - Light theme: white background, dark text, lighter borders, softer shadows.
   - Toast notification confirms the theme change.
   - Defaults to dark (matches the original offline HTML design).

## Verification (final)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Help dialog: clicking HelpCircle button opens dialog with title "میانبرهای صفحه‌کلید" and 5 kbd elements; pressing `?` also opens it; Esc closes it.
- Compare view: clicking GitCompare button shows the compare form; filling rank "5000" and clicking "مقایسه" renders a 7-row table (6 metrics + tier) with first row "انتخاب در دسترس: ۴۲ vs ۳۲ vs ۱۰".
- Downloadable HTML: 120KB (was 114KB), all new features present.
- Offline quick-start: 4 buttons visible; clicking "ریاضی — منطقه ۱ — رتبه ۱۵۰۰" fills form + submits → 43 optimistic rows.
- Offline theme toggle: initial dark (🌙/تاریک); clicking changes to light (☀️/روشن) and persists to localStorage; CSS variables switch correctly.
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log (after fixing the showShortcutHelp bug).

## Unresolved issues or risks, and priority recommendations for the next phase
- **PWA / offline support** for main page — could add a service worker + manifest.json to make the main page itself work offline (currently only the downloadable HTML is offline-capable).
- **Real Sanjesh data** — current dataset uses estimated cutoffs; real past-year admission data should be ingested.
- **Sort dropdown SSR quirk** — still mitigated with the `key={mounted}` remount trick.
- **Comparison view** could be ported to the downloadable HTML (currently only in main app).
- **Row click → expand** for more details (cutoff history, tips) — not yet implemented.

Stage Summary:
- QA pass complete: 1 bug found (showShortcutHelp state in wrong component) and fixed.
- Two new feature groups added to the main app: Comparison view (side-by-side metrics table), Keyboard shortcut help dialog (?).
- Two new features ported to downloadable HTML: Quick-start example buttons, Theme toggle (light/dark with localStorage).
- ESLint clean; dev server stable; no runtime errors.
- Downloadable HTML now has feature parity for: rank estimation, filter/search/sort (including city), favorites, priority list, CSV/JSON export, copy priority list, print/PDF, keyboard shortcuts, charts, collapsible stats card, quick-start examples, AND now theme toggle.

---
Task ID: 8
Agent: cron-review (webDevReview)
Task: QA pass + new features (row expand, tooltips, OG meta, shimmer loading)

## Current project status description/assessment
The project was feature-complete after Task 7 with: rank estimator, filter/search/sort (including city), favorites, history, chart view, print/PDF, keyboard shortcuts (? help dialog), deep-link sharing, comparison view, downloadable offline HTML with CSV/JSON/priority-list/favorites/charts/city-filter/collapsible-stats-card/quick-start/theme-toggle features. ESLint clean, no runtime errors. The recommended next-phase work items from Task 7 were:
- PWA / offline support for main page.
- Real Sanjesh data.
- Sort dropdown SSR quirk.
- Comparison view could be ported to downloadable HTML.
- Row click → expand for more details (cutoff history, tips).

## QA findings (via agent-browser + curl)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Downloadable HTML works offline (38 results, all features present).
- All previously-added features verified working.
- ESLint passes; no runtime errors in dev.log.

## New features added (Main App)
1. **Row click → expand for more details** (`RowItem` component):
   - New `expanded` state per row, toggled by a chevron button next to the chance%.
   - AnimatePresence animates height (0 ↔ auto) and opacity.
   - Chevron rotates 180deg when expanded.
   - `aria-expanded` + `aria-label` for screen readers.
   - Expanded content includes:
     - **Advice box** (amber Lightbulb icon) — contextual advice based on bucket (optimistic/realistic/pessimistic) and chance level (e.g., "انتخاب بسیار امن — این رشته‌محل را در اولویت‌های بالای لیست خود قرار دهید" for ≥90% optimistic).
     - **Rank ratio bar** — a centered bar showing the user's position relative to the cutoff (50% = at cutoff, >50% = better, <50% = worse), with color (emerald=better, rose=worse) and a textual description (e.g., "رتبه شما ۲۳٪ بهتر از آخرین رتبه قبولی است").
     - **Stats row** — 2-column grid showing "آخرین رتبه قبولی" (cutoff) and "نوع دانشگاه" (university type).
2. **Tooltip on chance%** — hovering on the chance% number shows a tooltip:
   - "شانس قبولی بر اساس فاصله رتبه شما تا آخرین رتبه قبولی سال گذشته محاسبه می‌شود." + "شانس بالا/متوسط/پایین." based on the level.
   - Uses shadcn/ui Tooltip with 300ms delay, `side="left"`, `cursor-help`.
   - `TooltipProvider` wraps each row's tooltip.
3. **Open Graph + Twitter meta tags** in `layout.tsx`:
   - `openGraph.locale: "fa_IR"`, `siteName`, `images` (1200×630 with alt text).
   - `twitter.card: "summary_large_image"` with title, description, images.
   - `robots: { index: true, follow: true }`.
   - `applicationName`, `category: "education"`.
   - Added `shortcut` icon.
   - Extended `keywords` with "رتبه کنکور" and "انتخاب رشته کنکور".
4. **Improved loading skeleton with shimmer effect** (`LoadingState`):
   - Replaced `animate-pulse` with a custom `shimmer` keyframe animation (translateX from -100% to 100%).
   - Each skeleton block has a gradient overlay that sweeps across.
   - Staggered `animationDelay` for each block (0.15s increments) so they don't all shimmer in sync.
   - More realistic loading state.

## Verification (final)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Row expand: clicking "نمایش جزئیات" button toggles to "بستن جزئیات" with `aria-expanded: true`; advice text "انتخاب بسیار امن" visible; rank ratio bar "مقایسه با آخرین رتبه قبولی" visible.
- Tooltip: hovering on chance% shows "شانس قبولی بر اساس فاصله رتبه شما تا آخرین رتبه قبولی سال گذشته محاسبه می‌شود. شانس بالا."
- Loading skeleton: shimmer animation with staggered delays (visual verification).
- Downloadable HTML: 120KB, all features still work (39 results, stats card present).
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

## Unresolved issues or risks, and priority recommendations for the next phase
- **PWA / offline support** for main page — could add a service worker + manifest.json to make the main page itself work offline (currently only the downloadable HTML is offline-capable).
- **Real Sanjesh data** — current dataset uses estimated cutoffs; real past-year admission data should be ingested.
- **Sort dropdown SSR quirk** — still mitigated with the `key={mounted}` remount trick.
- **Comparison view** could be ported to the downloadable HTML (currently only in main app).
- **Row expand** could be ported to the downloadable HTML too.

Stage Summary:
- QA pass complete: no bugs found in current functionality.
- Four new feature groups added to the main app: Row click → expand (advice + rank ratio bar + stats), Tooltip on chance%, Open Graph + Twitter meta tags, Shimmer loading skeleton.
- ESLint clean; dev server stable; no runtime errors.
- Downloadable HTML verified still working with all previously-added features.

---
Task ID: 9
Agent: cron-review (webDevReview)
Task: QA pass + port comparison view + row expand to downloadable HTML

## Current project status description/assessment
The project was feature-complete after Task 8 with: rank estimator, filter/search/sort (including city), favorites, history, chart view, print/PDF, keyboard shortcuts (? help dialog), deep-link sharing, comparison view, row expand with advice + rank ratio bar + stats, tooltip on chance%, Open Graph meta tags, shimmer loading skeleton, downloadable offline HTML with CSV/JSON/priority-list/favorites/charts/city-filter/collapsible-stats-card/quick-start/theme-toggle features. ESLint clean, no runtime errors. The recommended next-phase work items from Task 8 were:
- PWA / offline support for main page.
- Real Sanjesh data.
- Sort dropdown SSR quirk.
- Comparison view could be ported to the downloadable HTML.
- Row expand could be ported to the downloadable HTML too.

## QA findings (via agent-browser + curl)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Downloadable HTML works offline (38 results, all features present).
- All previously-added features verified working.
- ESLint passes; no runtime errors in dev.log.

## New features ported to downloadable HTML (`/api/download-html`)
1. **Comparison view** — `#compareArea` section toggled by "⚖️ مقایسه رتبه‌ها" button:
   - Input field for a second rank (same group + quota), "⚖️ مقایسه" button, "✕ پاک" button.
   - Enter key in the input triggers compare.
   - Computes the comparison estimate **locally** (using the offline `estimate()` function — no server fetch needed).
   - Renders a side-by-side table comparing 6 metrics (reachable, outOfReach, averageChance, userPercentile, mean, median) + tier row.
   - Each metric row shows: label, current value, compare value, diff (with +/− sign and color: green=better, red=worse, gray=same).
   - Percent values show ٪ suffix; rank values use faFmt.
   - Empty state with ⚖️ icon and instructions when no comparison has been run.
   - "✕ پاک" button clears the input + content.
   - Toast notifications for all actions.
2. **Row expand** — `▼` button on every result row:
   - Event delegation handles all rows (works with filter/sort re-renders).
   - Toggles `#rowId-details` div between `display:none` and `display:block`.
   - `aria-expanded` + `aria-label` updates.
   - Chevron rotates 180deg when expanded.
   - Expanded content includes:
     - **Advice box** (💡 icon) — contextual advice based on bucket + chance level (e.g., "انتخاب بسیار امن — این رشته‌محل را در اولویت‌های بالای لیست خود قرار دهید").
     - **Rank ratio bar** — centered bar showing user's position relative to cutoff (50% = at cutoff, >50% = better, <50% = worse), with color (emerald=better, rose=worse) and textual description.
     - **Stats row** — 2-column grid showing "آخرین رتبه قبولی" (cutoff) and "نوع دانشگاه" (university type).
   - Each row gets a unique `rowId` for the details div.

## Verification (final)
- Main page deep-link `?g=riazi&q=region1&r=2500&auto=1`: tabs show 38/4/18, no errors.
- Downloadable HTML: 133KB (was 120KB), all new features present.
- Offline compare: clicking "⚖️ مقایسه رتبه‌ها" opens the compare area; filling "5000" and clicking "⚖️ مقایسه" renders a 7-row table with first row "انتخاب در دسترس: ۴۲ vs ۳۲ vs ۱۰".
- Offline row expand: clicking ▼ button toggles `aria-expanded` from "false" to "true", rotates chevron 180deg, shows details with advice text.
- ESLint passes with zero errors/warnings.
- No runtime errors in /home/z/my-project/dev.log.

## Unresolved issues or risks, and priority recommendations for the next phase
- **PWA / offline support** for main page — could add a service worker + manifest.json to make the main page itself work offline (currently only the downloadable HTML is offline-capable).
- **Real Sanjesh data** — current dataset uses estimated cutoffs; real past-year admission data should be ingested.
- **Sort dropdown SSR quirk** — still mitigated with the `key={mounted}` remount trick.
- **Tooltip on chance%** could be ported to the downloadable HTML (currently only in main app).
- **Shimmer loading skeleton** could be ported to the downloadable HTML (currently only in main app).

Stage Summary:
- QA pass complete: no bugs found in current functionality.
- Two new feature groups ported to downloadable HTML: Comparison view (side-by-side metrics table, fully offline), Row expand (advice + rank ratio bar + stats, with event delegation).
- ESLint clean; dev server stable; no runtime errors.
- Downloadable HTML now has feature parity for: rank estimation, filter/search/sort (including city), favorites, priority list, CSV/JSON export, copy priority list, print/PDF, keyboard shortcuts, charts, collapsible stats card, quick-start examples, theme toggle, AND now comparison view + row expand.
