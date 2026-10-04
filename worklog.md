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
