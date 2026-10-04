import { NextRequest, NextResponse } from "next/server";
import {
  GROUPS,
  QUOTAS,
  UNIVERSITY_TYPE_LABEL,
  DATASET,
  type GroupKey,
  type QuotaKey,
} from "@/lib/konkur-data";

export const dynamic = "force-dynamic";

function jsonSafe(obj: unknown): string {
  // Embed JSON inside <script type="application/json"> safely.
  // Keep the JSON itself valid (literal quotes); only neutralize the
  // `</` sequence (which would prematurely close the script tag) and
  // the `<!--` HTML-comment opener (which some parsers treat specially).
  return JSON.stringify(obj)
    .replace(/<\//g, "<\\/")
    .replace(/<!--/g, "<\\!--");
}

export async function GET(req: NextRequest) {
  // Optional preselect: pass ?group=tajrobi&quota=region1&rank=1200 to pre-fill
  // Also accepts short form ?g=tajrobi&q=region1&r=1200 (used by the main page's
  // share URL).
  const url = new URL(req.url);
  const group = url.searchParams.get("group") ?? url.searchParams.get("g");
  const quota = url.searchParams.get("quota") ?? url.searchParams.get("q");
  const rank = url.searchParams.get("rank") ?? url.searchParams.get("r");

  const groups = GROUPS;
  const quotas = QUOTAS;
  const uniTypes = UNIVERSITY_TYPE_LABEL;
  const dataset = DATASET;

  const preselect = group || quota || rank
    ? { group: group || "", quota: quota || "", rank: rank || "" }
    : null;

  // The HTML payload below is a self-contained file with the same estimation logic.
  // Logic is replicated in JS so the downloaded file works fully offline.
  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>نرم افزار تخمین رشته قبولی با رتبه کنکور ۱۴۰۵</title>
<meta name="description" content="نرم افزار رایگان تخمین رشته قبولی با رتبه کنکور سراسری ۱۴۰۵ — بر اساس کارنامه سال گذشته" />
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
<style>
  :root {
    --bg: #0b1220;
    --bg-soft: #111a2e;
    --card: #131c34;
    --card-2: #16213e;
    --border: #24324f;
    --text: #e6eefc;
    --text-soft: #b3c0d8;
    --muted: #8190ad;
    --primary: #10b981;
    --primary-2: #14b8a6;
    --gold: #f59e0b;
    --gold-2: #fbbf24;
    --red: #ef4444;
    --blue: #6366f1;
    --shadow: 0 10px 30px -10px rgba(0,0,0,.6);
    --radius: 16px;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    background:
      radial-gradient(1200px 700px at 10% -10%, rgba(16,185,129,.18), transparent 60%),
      radial-gradient(1000px 600px at 100% 0%, rgba(99,102,241,.18), transparent 60%),
      var(--bg);
    color: var(--text);
    font-family: 'Vazirmatn', system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    line-height: 1.9;
  }
  .wrap { max-width: 1100px; margin: 0 auto; padding: 24px 16px 96px; }
  header.hero {
    text-align: center;
    padding: 28px 16px 18px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(16,185,129,.18), rgba(20,184,166,.18));
    border: 1px solid rgba(16,185,129,.35);
    padding: 6px 14px;
    border-radius: 999px;
    color: #6ee7b7;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 14px;
  }
  h1 {
    margin: 0 0 8px;
    font-size: clamp(26px, 5vw, 44px);
    line-height: 1.4;
    background: linear-gradient(135deg, #5eead4, #34d399 40%, #38bdf8);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 800;
  }
  .sub {
    color: var(--text-soft);
    font-size: clamp(14px, 2.5vw, 17px);
    margin: 0 auto;
    max-width: 760px;
  }
  .card {
    background: linear-gradient(180deg, var(--card), var(--card-2));
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px;
    box-shadow: var(--shadow);
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 768px) {
    .form-grid { grid-template-columns: 1fr 1fr; }
    .form-grid .full { grid-column: span 2; }
  }
  label.lbl {
    display: block;
    color: var(--text-soft);
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .select, .input {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 12px;
    padding: 12px 14px;
    font: inherit;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .select:focus, .input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(16,185,129,.18);
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--primary), var(--primary-2));
    color: #04201a;
    border: 0;
    padding: 12px 20px;
    border-radius: 12px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition: transform .1s, box-shadow .15s, filter .15s;
    box-shadow: 0 10px 20px -10px rgba(16,185,129,.6);
  }
  .btn:hover { transform: translateY(-1px); filter: brightness(1.06); }
  .btn:active { transform: translateY(0); }
  .btn.secondary {
    background: rgba(255,255,255,.06);
    color: var(--text);
    border: 1px solid var(--border);
    box-shadow: none;
  }
  .btn.secondary:hover { background: rgba(255,255,255,.1); }
  .error {
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.5);
    color: #fecaca;
    padding: 10px 14px;
    border-radius: 10px;
    margin-top: 10px;
    font-size: 14px;
  }
  .summary {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 18px 0;
  }
  @media (min-width: 640px) {
    .summary { grid-template-columns: repeat(3, 1fr); }
  }
  .stat {
    background: rgba(255,255,255,.03);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    text-align: center;
  }
  .stat .v { font-size: 22px; font-weight: 800; color: #fff; }
  .stat .l { color: var(--muted); font-size: 12px; margin-top: 4px; }
  .bucket {
    margin: 18px 0;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }
  .bucket .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    font-weight: 800;
  }
  .bucket.optimistic .head { background: linear-gradient(90deg, rgba(16,185,129,.18), transparent); color: #6ee7b7; border-bottom: 1px solid rgba(16,185,129,.3); }
  .bucket.realistic .head { background: linear-gradient(90deg, rgba(245,158,11,.18), transparent); color: #fcd34d; border-bottom: 1px solid rgba(245,158,11,.3); }
  .bucket.pessimistic .head { background: linear-gradient(90deg, rgba(239,68,68,.18), transparent); color: #fca5a5; border-bottom: 1px solid rgba(239,68,68,.3); }
  .row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,.05);
    font-size: 14px;
  }
  .row:last-child { border-bottom: 0; }
  .row .top { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .row .major { font-weight: 700; color: #fff; }
  .row .uni { color: var(--text-soft); font-size: 13px; }
  .row .meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--muted); }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    background: rgba(255,255,255,.08);
    color: #cbd5e1;
    border: 1px solid rgba(255,255,255,.12);
  }
  .chance-bar {
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,.07);
    border-radius: 999px;
    margin-top: 8px;
    overflow: hidden;
  }
  .chance-bar > div {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--primary));
  }
  .chance-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-top: 4px; }
  .empty { color: var(--muted); padding: 12px 16px; font-size: 13px; }
  .tips { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 18px; }
  @media (min-width: 640px) { .tips { grid-template-columns: repeat(3, 1fr); } }
  .tip { padding: 14px; background: rgba(255,255,255,.03); border: 1px solid var(--border); border-radius: 12px; font-size: 13px; color: var(--text-soft); }
  .tip h4 { margin: 0 0 6px; color: #fff; font-size: 14px; }
  footer {
    margin-top: 32px;
    text-align: center;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.8;
  }
  footer a { color: #5eead4; text-decoration: none; }
  .muted { color: var(--muted); }
  .grid-list { display: grid; grid-template-columns: 1fr; gap: 8px; }
  @media (min-width: 640px) { .grid-list { grid-template-columns: repeat(2, 1fr); } }
  .field-block { background: rgba(255,255,255,.02); padding: 14px; border-radius: 12px; border: 1px solid var(--border); }
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,.85);
    border: 1px solid var(--border);
    color: #fff;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 14px;
    box-shadow: var(--shadow);
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s, transform .2s;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(-4px); }
  .save-line { display:flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .skeleton-row { height: 60px; background: linear-gradient(90deg, rgba(255,255,255,.03), rgba(255,255,255,.07), rgba(255,255,255,.03)); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; margin: 8px 0; }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .info-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 18px; }
  @media (min-width: 768px) { .info-grid { grid-template-columns: repeat(3, 1fr); } }
  .info-card { padding: 14px; border-radius: 12px; background: rgba(255,255,255,.02); border: 1px solid var(--border); }
  .info-card h3 { margin: 0 0 6px; color: #fff; font-size: 14px; }
  .info-card p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.8; }
  details.faq { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; margin-top: 8px; background: rgba(255,255,255,.02); }
  details.faq summary { cursor: pointer; color: #fff; font-weight: 700; font-size: 14px; }
  details.faq[open] summary { margin-bottom: 8px; }
  details.faq p { margin: 0; color: var(--text-soft); font-size: 13px; line-height: 1.9; }

  /* Print styles — clean white output with form/filter chrome hidden */
  @media print {
    html, body { background: white !important; color: black !important; }
    .hero, .card, .bucket, .row, .stat, .info-card, details.faq { background: white !important; color: black !important; border-color: #ccc !important; }
    .muted, .text-muted { color: #555 !important; }
    /* Hide form, filter bar, save/print buttons, FAQ, info cards, footer */
    #estForm, .hero .pill, #saveBtn, #printBtn, .tips, footer, #filterInfo { display: none !important; }
    /* Only show resultArea */
    body > .wrap > * { display: none !important; }
    body > .wrap > main { display: block !important; }
    body > .wrap > main > section:not(#resultArea) { display: none !important; }
    /* Expand result lists */
    #rowsOpt, #rowsReal, #rowsPes { max-height: none !important; overflow: visible !important; }
    .row { break-inside: avoid; page-break-inside: avoid; }
    .badge { color: #333 !important; background: #f5f5f5 !important; border-color: #ccc !important; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <span class="pill">● نرم افزار رایگان تخمین رشته قبولی</span>
    <h1>تخمین رشته قبولی با رتبه کنکور ۱۴۰۵</h1>
    <p class="sub">با انتخاب گروه آزمایشی، سهمیه (منطقه) و رتبه در سهمیه خود، فهرستی از رشته‌محل‌های پیشنهادی را در سه دسته خوش‌بینانه، منطقی و بدبینانه مشاهده کنید. داده‌ها بر اساس کارنامه قبولی سال گذشته با خطای تخمینی کمتر از ۵٪ است.</p>
  </header>

  <main>
    <section class="card" style="margin-bottom: 18px;">
      <form id="estForm" class="form-grid">
        <div class="field-block">
          <label class="lbl" for="groupSel">رشته تحصیلی (گروه آزمایشی) خود را انتخاب کنید</label>
          <select class="select" id="groupSel" required>
            ${groups.map((g) => `<option value="${g.key}">${g.emoji} ${g.label}</option>`).join("")}
          </select>
        </div>
        <div class="field-block">
          <label class="lbl" for="quotaSel">سهمیه (منطقه) خود را انتخاب کنید</label>
          <select class="select" id="quotaSel" required>
            ${quotas.map((q) => `<option value="${q.key}">${q.label} — ${q.description}</option>`).join("")}
          </select>
        </div>
        <div class="field-block full">
          <label class="lbl" for="rankInput">رتبه داوطلب در سهمیه (عدد)</label>
          <input class="input" id="rankInput" type="number" inputmode="numeric" min="1" placeholder="مثلاً ۱۲۰۰۰" required />
        </div>
        <div class="full" style="display:flex; gap: 8px; flex-wrap: wrap; align-items:center;">
          <button class="btn" type="submit" id="calcBtn">مشاهده تخمین رشته قبولی</button>
          <button class="btn secondary" type="button" id="saveBtn">💾 ذخیره این صفحه به صورت HTML</button>
          <button class="btn secondary" type="button" id="printBtn">🖨️ چاپ / PDF</button>
          <span class="muted" style="font-size: 12px;">همه‌چیز آفلاین در همین فایل کار می‌کند.</span>
        </div>
        <div class="full" style="display:flex; gap: 8px; flex-wrap: wrap; align-items:center;">
          <span class="muted" style="font-size: 12px;">صدور خروجی نتایج:</span>
          <button class="btn secondary" type="button" id="csvBtn" style="padding: 6px 12px; font-size: 12px;">📊 CSV (Excel)</button>
          <button class="btn secondary" type="button" id="jsonBtn" style="padding: 6px 12px; font-size: 12px;">📄 JSON</button>
          <button class="btn secondary" type="button" id="priorityBtn" style="padding: 6px 12px; font-size: 12px;">✨ لیست اولویت پیشنهادی</button>
          <button class="btn secondary" type="button" id="copyPriorityBtn" style="padding: 6px 12px; font-size: 12px;">📋 کپی لیست اولویت</button>
        </div>
        <div class="full"><div id="errBox" class="error" style="display:none"></div></div>
      </form>
    </section>

    <section id="resultArea" style="display:none">
      <div class="summary" id="summaryBox"></div>

      <div class="card" style="margin-bottom: 16px; padding: 14px;">
        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <div style="position:relative; flex:1; min-width:180px;">
            <span style="position:absolute; right:10px; top:50%; transform:translateY(-50%); color: var(--muted); pointer-events:none;">🔍</span>
            <input id="searchInput" type="search" placeholder="جستجوی رشته، دانشگاه یا شهر..." aria-label="جستجوی رشته، دانشگاه یا شهر" style="width:100%; background:rgba(255,255,255,.04); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:10px 32px 10px 14px; font:inherit; outline:none;" />
          </div>
          <select id="sortSel" aria-label="مرتب‌سازی نتایج" style="background:rgba(255,255,255,.04); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:10px 14px; font:inherit; outline:none; cursor:pointer;">
            <option value="chance">بیشترین شانس قبولی</option>
            <option value="cutoff-asc">سخت‌ترین ورود (رتبه کمتر)</option>
            <option value="cutoff-desc">آسان‌ترین ورود (رتبه بیشتر)</option>
            <option value="major">نام رشته (الفبا)</option>
            <option value="university">نام دانشگاه (الفبا)</option>
          </select>
          <select id="uniTypeSel" aria-label="فیلتر نوع دانشگاه" style="background:rgba(255,255,255,.04); border:1px solid var(--border); color:var(--text); border-radius:10px; padding:10px 14px; font:inherit; outline:none; cursor:pointer;">
            <option value="">همه انواع دانشگاه</option>
          </select>
        </div>
        <div id="filterInfo" style="margin-top:8px; font-size:12px; color:var(--muted); display:none;"></div>
      </div>

      <div class="bucket optimistic" id="bOpt">
        <div class="head"><span>✅ انتخاب‌های خوش‌بینانه</span><span id="cOpt" class="muted"></span></div>
        <div id="rowsOpt"></div>
      </div>
      <div class="bucket realistic" id="bReal">
        <div class="head"><span>⚖️ انتخاب‌های منطقی</span><span id="cReal" class="muted"></span></div>
        <div id="rowsReal"></div>
      </div>
      <div class="bucket pessimistic" id="bPes">
        <div class="head"><span>⚠️ انتخاب‌های بدبینانه</span><span id="cPes" class="muted"></span></div>
        <div id="rowsPes"></div>
      </div>

      <!-- Priority list (hidden until shown) -->
      <div id="priorityArea" style="display:none; margin-top: 18px;">
        <div class="card" style="border-color: rgba(16,185,129,0.3); background: linear-gradient(135deg, rgba(16,185,129,0.05), transparent); padding: 18px; margin-bottom: 12px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom: 8px;">
            <span style="font-size: 20px;">✨</span>
            <h3 style="margin: 0; font-size: 16px; color: #5eead4;">لیست پیشنهادی اولویت انتخاب رشته</h3>
          </div>
          <p id="priorityMeta" style="margin: 0 0 10px; font-size: 12px; color: var(--muted);"></p>
          <p style="margin: 0; font-size: 12px; color: var(--muted); line-height: 1.8;">
            💡 این لیست بر اساس استراتژی استاندارد <strong>۳ دسته ۸ تایی</strong> پیشنهاد می‌شود:
            ۸ انتخاب امن، ۸ انتخاب منطقی و ۸ انتخاب شانس.
          </p>
        </div>
        <div id="priorityList"></div>
      </div>

      <div class="tips">
        <div class="tip"><h4>خوش‌بینانه چیست؟</h4><p>رشته‌محل‌هایی که رتبه شما به‌طور قابل توجهی بهتر از آخرین رتبه قبولی سال گذشته است. شانس قبولی بالا.</p></div>
        <div class="tip"><h4>منطقی چیست؟</h4><p>رشته‌محل‌هایی که رتبه شما نزدیک به آخرین رتبه قبولی است. شانس قبولی متوسط — برای چینش اولویت حتماً در نظر بگیرید.</p></div>
        <div class="tip"><h4>بدبینانه چیست؟</h4><p>رشته‌محل‌هایی که رتبه شما از آخرین رتبه قبولی بدتر است. برای زنجیره امن (به‌عنوان گزینه پشتیبان) استفاده کنید.</p></div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <h3 style="margin: 0 0 6px; font-size: 18px;">سوالات متداول</h3>
      <p class="muted" style="margin: 0 0 12px; font-size: 13px;">پاسخ به پرسش‌های رایگان داوطلبان کنکور سراسری ۱۴۰۵</p>
      <details class="faq" open>
        <summary>۱) برای استفاده از این نرم افزار چه اطلاعاتی لازم است؟</summary>
        <p>گروه آزمایشی، نوع سهمیه (منطقه) و رتبه شما در سهمیه کنکور ۱۴۰۵.</p>
      </details>
      <details class="faq">
        <summary>۲) آیا تخمین ارائه شده بدون خطاست؟</summary>
        <p>تخمین بر اساس کارنامه سال گذشته است و خطای نرم افزار تقریباً کمتر از ۵٪ است. این رقم یک تخمین است، نه قطعیت.</p>
      </details>
      <details class="faq">
        <summary>۳) آیا فهرست رشته‌محل‌های قابل قبولی نمایش داده می‌شود؟</summary>
        <p>بله. در سه دسته خوش‌بینانه، منطقی و بدبینانه فهرست می‌شود تا برای چینش اولویت‌ها استفاده کنید.</p>
      </details>
    </section>

    <section class="card" style="margin-top: 18px;">
      <h3 style="margin: 0 0 6px; font-size: 18px;">درباره نرم افزار</h3>
      <p class="muted" style="margin: 0 0 14px; font-size: 13px; line-height: 1.9;">این فایل HTML قابل دانلود، یک بازسازی مستقل از نرم افزار «تخمین رشته قبولی با رتبه» است و همه‌چیز را به‌صورت آفلاین اجرا می‌کند. داده‌ها بر اساس الگوهای رتبه قبولی سال‌های گذشته کنکور سراسری تنظیم شده‌اند.</p>
      <div class="info-grid">
        <div class="info-card"><h3>۵ گروه آزمایشی</h3><p>ریاضی، تجربی، انسانی، هنر، زبان</p></div>
        <div class="info-card"><h3>۵ نوع سهمیه</h3><p>منطقه‌های ۱، ۲، ۳ و ایثارگران ۵٪ و ۲۵٪</p></div>
        <div class="info-card"><h3>۶ نوع دانشگاه</h3><p>دولتی، آزاد، پیام نور، غیرانتفاعی، علمی کاربردی، فرهنگیان</p></div>
      </div>
    </section>
  </main>

  <footer>
    <p>© ${new Date().getFullYear()} — نسخه مستقل و قابل‌دانلود نرم افزار تخمین رشته قبولی با رتبه.<br/>
    این فایل هیچ وابستگی به سرور ندارد و پس از دانلود آفلاین کار می‌کند.</p>
  </footer>
</div>

<div id="toast" class="toast">✔ ذخیره شد</div>

<script id="payload" type="application/json">
${jsonSafe({ groups, quotas, uniTypes, dataset, preselect })}
</script>
<script>
(function () {
  var persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  function fa(n) { return String(n).replace(/\\d/g, function (d) { return persianDigits[+d]; }); }
  function faFmt(n) { return fa(String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')); }
  function uniLabel(t) { return window.PAYLOAD.uniTypes[t] || t; }

  var payloadEl = document.getElementById('payload');
  var PAYLOAD = JSON.parse(payloadEl.textContent);
  window.PAYLOAD = PAYLOAD;

  var GROUP_LABELS = {};
  PAYLOAD.groups.forEach(function (g) { GROUP_LABELS[g.key] = g.label; });
  var QUOTA_LABELS = {};
  PAYLOAD.quotas.forEach(function (q) { QUOTA_LABELS[q.key] = q.label; });

  function computeChance(rank, cutoff) {
    if (rank <= cutoff) {
      var ratio = cutoff === 0 ? 0 : (cutoff - rank) / cutoff;
      return Math.min(99, Math.round(75 + ratio * 100));
    }
    var r = rank === 0 ? 0 : (rank - cutoff) / cutoff;
    if (r < 0.05) return Math.round(70 - r * 400);
    if (r < 0.15) return Math.round(50 - (r - 0.05) * 200);
    if (r < 0.4)  return Math.round(30 - (r - 0.15) * 80);
    return Math.max(1, Math.round(10 - (r - 0.4) * 15));
  }

  function estimate(group, quota, rank) {
    var rows = PAYLOAD.dataset[group] || [];
    var all = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var cutoff = row.cutoffs[quota];
      if (cutoff === undefined || cutoff === null) continue;
      var chance = computeChance(rank, cutoff);
      var bucket;
      if (rank <= cutoff * 0.85) bucket = 'optimistic';
      else if (rank <= cutoff * 1.15) bucket = 'realistic';
      else bucket = 'pessimistic';
      all.push(Object.assign({}, row, { cutoff: cutoff, chance: chance, bucket: bucket, rankDistance: cutoff - rank }));
    }
    var opt = all.filter(function (r) { return r.bucket === 'optimistic'; }).sort(function (a, b) { return b.chance - a.chance; });
    var real = all.filter(function (r) { return r.bucket === 'realistic'; }).sort(function (a, b) { return b.chance - a.chance; });
    var pes = all.filter(function (r) { return r.bucket === 'pessimistic'; }).sort(function (a, b) { return b.chance - a.chance; });
    var reachable = opt.length + real.length;
    var cutoffs = all.map(function (r) { return r.cutoff; }).sort(function (a, b) { return a - b; });
    var median = cutoffs.length ? cutoffs[Math.floor(cutoffs.length / 2)] : null;
    var best = all.length ? all.reduce(function (a, b) { return b.chance > a.chance ? b : a; }) : null;
    return { group: group, quota: quota, rank: rank, optimistic: opt, realistic: real, pessimistic: pes,
             totalChoices: all.length, summary: { bestChance: best, medianRank: median, reachableCount: reachable } };
  }

  function rowHTML(r) {
    var chanceColor = r.chance >= 70 ? '#10b981' : (r.chance >= 40 ? '#f59e0b' : '#ef4444');
    return ''
      + '<div class="row">'
      + '  <div class="top">'
      + '    <span class="major">' + r.major + '</span>'
      + '    <span class="badge">🎓 ' + r.university + '</span>'
      + '    <span class="badge">🏷️ ' + uniLabel(r.universityType) + '</span>'
      + '    <span class="badge">📍 ' + (r.city || '—') + '</span>'
      + '  </div>'
      + '  <div class="uni">آخرین رتبه قبولی سال گذشته: ' + faFmt(r.cutoff) + '</div>'
      + '  <div class="chance-row"><span>شانس قبولی شما</span><span style="color:' + chanceColor + '; font-weight:700">' + fa(r.chance) + '٪</span></div>'
      + '  <div class="chance-bar"><div style="width:' + r.chance + '%; background:linear-gradient(90deg,#f59e0b,' + chanceColor + ')"></div></div>'
      + '</div>';
  }

  // Global state for filter/search/sort
  var currentResult = null;
  var filterState = { search: '', sortBy: 'chance', uniType: '' };

  function applyFiltersAndSort(list) {
    var q = filterState.search.trim().toLowerCase();
    var filtered = list.filter(function (r) {
      if (filterState.uniType && r.universityType !== filterState.uniType) return false;
      if (q) {
        var hay = (r.major + ' ' + r.university + ' ' + (r.city || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var sorted = filtered.slice();
    switch (filterState.sortBy) {
      case 'chance': sorted.sort(function (a, b) { return b.chance - a.chance; }); break;
      case 'cutoff-asc': sorted.sort(function (a, b) { return a.cutoff - b.cutoff; }); break;
      case 'cutoff-desc': sorted.sort(function (a, b) { return b.cutoff - a.cutoff; }); break;
      case 'major': sorted.sort(function (a, b) { return a.major.localeCompare(b.major, 'fa'); }); break;
      case 'university': sorted.sort(function (a, b) { return a.university.localeCompare(b.university, 'fa'); }); break;
    }
    return sorted;
  }

  function render(result) {
    currentResult = result;
    document.getElementById('resultArea').style.display = 'block';
    document.getElementById('summaryBox').innerHTML =
      '<div class="stat"><div class="v">' + faFmt(result.summary.reachableCount) + '</div><div class="l">تعداد انتخاب‌های در دسترس</div></div>'
      + '<div class="stat"><div class="v">' + (result.summary.medianRank ? faFmt(result.summary.medianRank) : '—') + '</div><div class="l">میانه رتبه قبولی</div></div>'
      + '<div class="stat"><div class="v">' + (result.summary.bestChance ? result.summary.bestChance.major : '—') + '</div><div class="l">بیشترین شانس</div></div>';

    // Populate university type filter options (only types present in this result)
    var uniTypeSel = document.getElementById('uniTypeSel');
    var presentTypes = {};
    var allRows = result.optimistic.concat(result.realistic, result.pessimistic);
    allRows.forEach(function (r) { presentTypes[r.universityType] = true; });
    // Clear existing options except the first "همه"
    while (uniTypeSel.options.length > 1) uniTypeSel.remove(1);
    Object.keys(presentTypes).forEach(function (t) {
      var opt = document.createElement('option');
      opt.value = t;
      opt.textContent = uniLabel(t);
      uniTypeSel.appendChild(opt);
    });

    reRender();
  }

  function reRender() {
    if (!currentResult) return;
    var allRows = currentResult.optimistic.concat(currentResult.realistic, currentResult.pessimistic);
    var filtered = applyFiltersAndSort(allRows);
    var opt = filtered.filter(function (r) { return r.bucket === 'optimistic'; });
    var real = filtered.filter(function (r) { return r.bucket === 'realistic'; });
    var pes = filtered.filter(function (r) { return r.bucket === 'pessimistic'; });

    function fill(id, list, countId) {
      var el = document.getElementById(id);
      var cEl = document.getElementById(countId);
      cEl.textContent = list.length ? ('(' + fa(list.length) + ' رشته‌محل)') : '';
      if (!list.length) { el.innerHTML = '<div class="empty">موردی در این دسته یافت نشد.</div>'; return; }
      el.innerHTML = list.map(rowHTML).join('');
    }
    fill('rowsOpt', opt, 'cOpt');
    fill('rowsReal', real, 'cReal');
    fill('rowsPes', pes, 'cPes');

    // Update filter info text
    var info = document.getElementById('filterInfo');
    if (filterState.search || filterState.uniType) {
      info.style.display = 'block';
      info.innerHTML = 'نمایش <strong>' + fa(filtered.length) + '</strong> مورد از <strong>' + fa(allRows.length) + '</strong> رشته‌محل' +
        ' <a href="#" id="clearFilters" style="color: #5eead4; text-decoration: none; margin-right: 8px;">↺ پاک کردن فیلتر</a>';
      var clr = document.getElementById('clearFilters');
      if (clr) {
        clr.addEventListener('click', function (e) {
          e.preventDefault();
          filterState.search = '';
          filterState.uniType = '';
          document.getElementById('searchInput').value = '';
          document.getElementById('uniTypeSel').value = '';
          reRender();
        });
      }
    } else {
      info.style.display = 'none';
    }
  }

  var form = document.getElementById('estForm');
  var errBox = document.getElementById('errBox');
  function showError(msg) { errBox.textContent = msg || ''; errBox.style.display = msg ? 'block' : 'none'; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var group = document.getElementById('groupSel').value;
    var quota = document.getElementById('quotaSel').value;
    var rank = parseInt(document.getElementById('rankInput').value, 10);
    if (!group) return showError('گروه آزمایشی را انتخاب کنید.');
    if (!quota) return showError('سهمیه را انتخاب کنید.');
    if (!rank || rank <= 0) return showError('رتبه معتبر وارد کنید.');
    showError('');
    var result = estimate(group, quota, rank);
    render(result);
    document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Filter / search / sort listeners
  document.getElementById('searchInput').addEventListener('input', function (e) {
    filterState.search = e.target.value;
    reRender();
  });
  document.getElementById('sortSel').addEventListener('change', function (e) {
    filterState.sortBy = e.target.value;
    reRender();
  });
  document.getElementById('uniTypeSel').addEventListener('change', function (e) {
    filterState.uniType = e.target.value;
    reRender();
  });

  // Keyboard shortcut: "/" focuses search (when not typing in another input)
  document.addEventListener('keydown', function (e) {
    var target = e.target;
    var isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isTyping) return;
    if (e.key === '/' && document.getElementById('resultArea').style.display !== 'none') {
      e.preventDefault();
      var inp = document.getElementById('searchInput');
      inp.focus();
      inp.select();
    }
  });

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  document.getElementById('saveBtn').addEventListener('click', function () {
    // Save this very HTML page (it's already self-contained).
    var html = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'taghmin-reshte-qaboli.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('✔ نسخه HTML ذخیره شد');
  });

  document.getElementById('printBtn').addEventListener('click', function () {
    window.print();
  });

  // ───── Export CSV / JSON ─────
  function downloadBlob(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  function resultToCSVLocal(result) {
    var headers = ['اولویت پیشنهادی', 'دسته', 'رشته', 'دانشگاه', 'نوع دانشگاه', 'شهر', 'آخرین رتبه قبولی', 'شانس قبولی (٪)', 'اختلاف رتبه با آخرین قبولی'];
    var all = result.optimistic.concat(result.realistic, result.pessimistic);
    var bucketOrder = { optimistic: 0, realistic: 1, pessimistic: 2 };
    var bucketLabel = { optimistic: 'خوش‌بینانه', realistic: 'منطقی', pessimistic: 'بدبینانه' };
    all.sort(function (a, b) {
      var bo = bucketOrder[a.bucket] - bucketOrder[b.bucket];
      if (bo !== 0) return bo;
      return b.chance - a.chance;
    });
    var rows = all.map(function (r, i) {
      return [
        i + 1,
        bucketLabel[r.bucket],
        r.major,
        r.university,
        uniLabel(r.universityType),
        r.city || '',
        r.cutoff,
        r.chance,
        r.rankDistance > 0 ? '+' + r.rankDistance + ' (بهتر)' : r.rankDistance + ' (بدتر)'
      ];
    });
    var allRows = [headers].concat(rows);
    var csv = allRows.map(function (row) {
      return row.map(function (cell) {
        var s = String(cell);
        if (/[",\\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      }).join(',');
    }).join('\\n');
    return '\\uFEFF' + csv; // BOM for Excel
  }

  function resultToJSONLocal(result) {
    var all = result.optimistic.concat(result.realistic, result.pessimistic);
    var payload = {
      meta: {
        group: result.group,
        quota: result.quota,
        rank: result.rank,
        totalChoices: result.totalChoices,
        reachableCount: result.summary.reachableCount,
        medianRank: result.summary.medianRank,
        bestChance: result.summary.bestChance ? {
          major: result.summary.bestChance.major,
          university: result.summary.bestChance.university,
          chance: result.summary.bestChance.chance
        } : null,
        generatedAt: new Date().toISOString()
      },
      rows: all.map(function (r) {
        return {
          major: r.major,
          university: r.university,
          universityType: uniLabel(r.universityType),
          city: r.city,
          cutoff: r.cutoff,
          chance: r.chance,
          bucket: r.bucket,
          rankDistance: r.rankDistance
        };
      })
    };
    return JSON.stringify(payload, null, 2);
  }

  // ───── Build priority list (mirrors lib/konkur-data.ts) ─────
  function buildPriorityListLocal(result) {
    var safe = result.optimistic.slice().sort(function (a, b) { return b.chance - a.chance; }).slice(0, 8).map(function (r, i) {
      return Object.assign({}, r, { priority: i + 1, strategy: 'safe' });
    });
    var logical = result.realistic.slice().sort(function (a, b) { return Math.abs(a.rankDistance) - Math.abs(b.rankDistance); }).slice(0, 8).map(function (r, i) {
      return Object.assign({}, r, { priority: safe.length + i + 1, strategy: 'logical' });
    });
    var reach = result.pessimistic.slice().sort(function (a, b) { return b.chance - a.chance; }).slice(0, 8).map(function (r, i) {
      return Object.assign({}, r, { priority: safe.length + logical.length + i + 1, strategy: 'reach' });
    });
    var all = safe.concat(logical, reach).map(function (r, i) {
      return Object.assign({}, r, { priority: i + 1 });
    });
    return {
      items: all,
      safe: all.filter(function (r) { return r.strategy === 'safe'; }),
      logical: all.filter(function (r) { return r.strategy === 'logical'; }),
      reach: all.filter(function (r) { return r.strategy === 'reach'; })
    };
  }

  function priorityRowHTML(p) {
    var chanceColor = p.chance >= 70 ? '#10b981' : (p.chance >= 40 ? '#f59e0b' : '#ef4444');
    var stratColor = p.strategy === 'safe' ? '#10b981' : (p.strategy === 'logical' ? '#f59e0b' : '#ef4444');
    var stratLabel = p.strategy === 'safe' ? 'امن' : (p.strategy === 'logical' ? 'منطقی' : 'شانس');
    return ''
      + '<div class="row" style="display:flex; gap:12px; align-items:flex-start;">'
      + '  <div style="shrink:0; width:36px; height:36px; border-radius:8px; border:1px solid ' + stratColor + '40; background:' + stratColor + '1a; color:' + stratColor + '; display:flex; align-items:center; justify-content:center; font-weight:700; font-family:monospace;">' + fa(p.priority) + '</div>'
      + '  <div style="flex:1; min-width:0;">'
      + '    <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">'
      + '      <div style="flex:1; min-width:0;">'
      + '        <div class="major" style="font-weight:700; font-size:14px; margin-bottom:2px;">' + p.major + '</div>'
      + '        <div class="uni" style="font-size:12px; color:var(--muted); margin-bottom:4px;">' + p.university + (p.city ? ' — ' + p.city : '') + '</div>'
      + '        <div style="display:flex; gap:6px; flex-wrap:wrap;">'
      + '          <span class="badge">' + uniLabel(p.universityType) + '</span>'
      + '          <span class="badge">آخرین رتبه: ' + faFmt(p.cutoff) + '</span>'
      + '          <span class="badge" style="border-color:' + stratColor + '40; color:' + stratColor + ';">' + stratLabel + '</span>'
      + '        </div>'
      + '      </div>'
      + '      <div style="text-align:left; shrink:0;">'
      + '        <div style="font-size:18px; font-weight:800; color:' + chanceColor + '; font-variant-numeric: tabular-nums;">' + fa(p.chance) + '٪</div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }

  function renderPriorityList(result) {
    var priority = buildPriorityListLocal(result);
    var meta = document.getElementById('priorityMeta');
    var gLabel = GROUP_LABELS[result.group] || result.group;
    var qLabel = QUOTA_LABELS[result.quota] || result.quota;
    meta.textContent = gLabel + ' — ' + qLabel + ' — رتبه ' + faFmt(result.rank) + ' (مجموعاً ' + fa(priority.items.length) + ' رشته‌محل)';

    var strategies = [
      { key: 'safe', label: '✅ امن (خوش‌بینانه)', desc: '۸ رشته‌محل با بالاترین شانس قبولی', color: '#10b981' },
      { key: 'logical', label: '⚖️ منطقی', desc: '۸ رشته‌محل نزدیک به آخرین رتبه قبولی', color: '#f59e0b' },
      { key: 'reach', label: '⚠️ شانس (بدبینانه)', desc: '۸ رشته‌محل با رتبه پایین‌تر', color: '#ef4444' }
    ];
    var html = '';
    strategies.forEach(function (s) {
      var items = priority[s.key];
      if (!items.length) return;
      html += '<div class="bucket" style="border-color:' + s.color + '40; background: linear-gradient(90deg, ' + s.color + '15, transparent); border-radius: 12px; overflow:hidden; margin-bottom: 12px;">';
      html += '<div class="head" style="background: linear-gradient(90deg, ' + s.color + '18, transparent); color:' + s.color + '; padding: 10px 14px; font-weight:700; border-bottom:1px solid ' + s.color + '30;"><span>' + s.label + ' (' + fa(items.length) + ')</span></div>';
      html += '<div style="padding: 0;">';
      items.forEach(function (p) { html += priorityRowHTML(p); });
      html += '</div></div>';
    });
    document.getElementById('priorityList').innerHTML = html;
    return priority;
  }

  function togglePriorityView() {
    if (!currentResult) {
      toast('ابتدا یک تخمین انجام دهید');
      return;
    }
    var area = document.getElementById('priorityArea');
    if (area.style.display === 'none') {
      renderPriorityList(currentResult);
      area.style.display = 'block';
      area.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('✨ لیست اولویت نمایش داده شد');
    } else {
      area.style.display = 'none';
      toast('لیست اولویت بسته شد');
    }
  }

  document.getElementById('csvBtn').addEventListener('click', function () {
    if (!currentResult) { toast('ابتدا یک تخمین انجام دهید'); return; }
    var csv = resultToCSVLocal(currentResult);
    var fname = 'taghmin-' + currentResult.group + '-' + currentResult.quota + '-' + currentResult.rank + '.csv';
    downloadBlob(csv, fname, 'text/csv;charset=utf-8');
    toast('✔ فایل CSV دانلود شد');
  });

  document.getElementById('jsonBtn').addEventListener('click', function () {
    if (!currentResult) { toast('ابتدا یک تخمین انجام دهید'); return; }
    var json = resultToJSONLocal(currentResult);
    var fname = 'taghmin-' + currentResult.group + '-' + currentResult.quota + '-' + currentResult.rank + '.json';
    downloadBlob(json, fname, 'application/json;charset=utf-8');
    toast('✔ فایل JSON دانلود شد');
  });

  document.getElementById('priorityBtn').addEventListener('click', togglePriorityView);

  document.getElementById('copyPriorityBtn').addEventListener('click', function () {
    if (!currentResult) { toast('ابتدا یک تخمین انجام دهید'); return; }
    var priority = buildPriorityListLocal(currentResult);
    var lines = priority.items.map(function (p) {
      var strat = p.strategy === 'safe' ? 'امن' : (p.strategy === 'logical' ? 'منطقی' : 'شانس');
      return p.priority + '. ' + p.major + ' — ' + p.university + ' (' + p.chance + '٪ — ' + strat + ')';
    });
    var gLabel = GROUP_LABELS[currentResult.group] || currentResult.group;
    var qLabel = QUOTA_LABELS[currentResult.quota] || currentResult.quota;
    var text = 'لیست پیشنهادی اولویت انتخاب رشته — ' + gLabel + ' / ' + qLabel + ' / رتبه ' + faFmt(currentResult.rank) + '\\n\\n' + lines.join('\\n');
    try {
      navigator.clipboard.writeText(text).then(function () {
        toast('✔ لیست اولویت در کلیپ‌بورد کپی شد (' + fa(priority.items.length) + ' مورد)');
      }, function () {
        // Fallback for older browsers
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); toast('✔ لیست اولویت کپی شد'); } catch (e) { toast('کپی ناموفق بود'); }
        ta.remove();
      });
    } catch (e) {
      toast('کپی ناموفق بود');
    }
  });

  // preselect from query if provided
  if (PAYLOAD.preselect) {
    if (PAYLOAD.preselect.group) document.getElementById('groupSel').value = PAYLOAD.preselect.group;
    if (PAYLOAD.preselect.quota) document.getElementById('quotaSel').value = PAYLOAD.preselect.quota;
    if (PAYLOAD.preselect.rank)   document.getElementById('rankInput').value = PAYLOAD.preselect.rank;
  }
})();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Disposition": 'inline; filename="taghmin-reshte-qaboli.html"',
    },
  });
}
