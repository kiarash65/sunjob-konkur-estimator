import type { Metadata } from 'next'
import KonkurApp, { type KonkurAppData } from '@/components/konkur/KonkurApp'
import {
  GROUPS,
  QUOTAS,
  getAllCatalogRows,
  getAllUniversities,
  getAllMajors,
  type GroupKey,
} from '@/lib/konkur-data'

/**
 * Server page for the estimator route (kept at `/` as before).
 *
 * SEO: full metadata + JSON-LD (WebApplication, FAQPage, BreadcrumbList) and
 * the interactive app as a client island. Home-section data (stats counts,
 * popular majors, sample lists, group/quota labels) is computed here on the
 * server from the frozen dataset and passed to the client as serializable
 * props, so the client shell never needs the dataset in its initial bundle.
 *
 * DATA & LOGIC FREEZE: nothing in this module changes any estimator data or
 * logic — it only reads the same frozen exports as the old client code did.
 */

const SITE_URL = 'https://konkur.sunjob.ir'
const MAIN_SITE = 'https://sunjob.ir'

const PAGE_TITLE = 'تخمین رشته‌محل قبولی کنکور ۱۴۰۵ با رتبه | سان‌جاب'
const PAGE_DESCRIPTION =
  'با این رتبه چه رشته‌هایی قبول می‌شوم؟ گروه آزمایشی، سهمیه و رتبه خود را وارد کنید و فهرست رشته‌محل‌های قابل قبولی را در سه دسته خوش‌بینانه، منطقی و بدبینانه ببینید. ابزار رایگان تخمین قبولی کنکور سراسری ۱۴۰۵ سان‌جاب.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'تخمین رشته‌محل قبولی',
    'تخمین قبولی کنکور',
    'تخمین قبولی رشته',
    'تخمین رشته قبولی با رتبه',
    'با این رتبه چه رشته‌ای قبول می‌شوم',
    'تخمین قبولی دانشگاه',
    'انتخاب رشته کنکور ۱۴۰۵',
    'نرم افزار تخمین رشته',
    'سان‌جاب',
  ],
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: 'سان‌جاب',
    type: 'website',
    locale: 'fa_IR',
    images: [{ url: '/sunjob-logo.png', width: 512, height: 512, alt: 'سان‌جاب' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: 'تخمین رشته‌محل قبولی کنکور ۱۴۰۵ با رتبه — ابزار رایگان سان‌جاب',
    images: ['/sunjob-logo.png'],
  },
  robots: { index: true, follow: true },
}

const FAQS = [
  {
    q: 'برای استفاده از نرم افزار چه اطلاعاتی لازم است؟',
    a: 'داوطلبان باید گروه آزمایشی، نوع سهمیه و رتبه خود در کنکور ۱۴۰۵ را وارد کنند.',
  },
  {
    q: 'آیا تخمین ارائه شده بدون خطاست؟',
    a: 'تخمین بر اساس کارنامه سال گذشته طراحی شده است. نتیجه یک برآورد است، نه قطعیت نهایی؛ رتبه نهایی هر داوطلب فقط با کارنامه رسمی مشخص می‌شود.',
  },
  {
    q: 'آیا فهرست رشته‌محل‌های قابل قبولی نمایش داده می‌شود؟',
    a: 'بله، نرم افزار شانس قبولی در رشته‌محل‌های مختلف را در سه دسته خوش‌بینانه، منطقی و بدبینانه ارائه می‌کند.',
  },
  {
    q: 'نسخه HTML قابل دانلود چیست؟',
    a: 'دکمه «دانلود HTML» یک فایل HTML مستقل تولید می‌کند که شامل تمام منطق و داده‌ها است و پس از دانلود بدون نیاز به اینترنت و سرور، آفلاین کار می‌کند.',
  },
  {
    q: 'آیا می‌توانم نتایج را با دیگران به اشتراک بگذارم؟',
    a: 'بله. دکمه «اشتراک‌گذاری» لینک نتایج شما (با وضعیت فعلی فرم) را در کلیپ‌بورد کپی می‌کند. هر کس با باز کردن این لینک، همان فرم و نتایج را می‌بیند.',
  },
]

const WEB_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'تخمین رشته‌محل قبولی کنکور سان‌جاب',
  url: `${SITE_URL}/`,
  applicationCategory: 'EducationalApplication',
  inLanguage: 'fa-IR',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IRR' },
  description: PAGE_DESCRIPTION,
}

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: MAIN_SITE },
    { '@type': 'ListItem', position: 2, name: 'ابزارهای انتخاب رشته', item: `${MAIN_SITE}/taraz-estimator/` },
    { '@type': 'ListItem', position: 3, name: 'تخمین رشته‌محل قبولی', item: `${SITE_URL}/` },
  ],
}

function buildAppData(): KonkurAppData {
  // Same computations the old client-side code performed inline (masir-style
  // home sections), now executed on the server so the dataset stays out of
  // the client's initial bundle.
  const allCatalogRows = getAllCatalogRows()

  function getPopularMajors(gk: GroupKey): { university: string; major: string; percent: number }[] {
    const rows = allCatalogRows.filter((r) => r.group === gk)
    // Sort by lowest cutoff (= hardest to get in = most popular)
    const sorted = rows
      .filter((r) => r.cutoffs.region1 !== undefined)
      .sort((a, b) => (a.cutoffs.region1 ?? 999999) - (b.cutoffs.region1 ?? 999999))
    const total = sorted.length || 1
    return sorted.slice(0, 10).map((r, i) => ({
      university: r.university,
      major: r.major,
      percent: Math.round(((total - i) / total) * 100),
    }))
  }

  const popular: KonkurAppData['popular'] = {}
  for (const g of GROUPS) {
    popular[g.key] = getPopularMajors(g.key)
  }

  return {
    groupsMeta: GROUPS.map((g) => ({ key: g.key, label: g.label, emoji: g.emoji })),
    quotasMeta: QUOTAS.map((q) => ({ key: q.key, label: q.label, description: q.description })),
    catalogCount: allCatalogRows.length,
    universitiesCount: getAllUniversities().length,
    majorsCount: getAllMajors().length,
    popular,
    majorsTop: getAllMajors().slice(0, 5).map((m) => ({ name: m.name })),
    universitiesTop: getAllUniversities().slice(0, 5).map((u) => ({ name: u.name })),
  }
}

export default function Page() {
  const appData = buildAppData()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APP_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <KonkurApp appData={appData} />
      <SiteFooter />
    </>
  )
}

/** Static footer — server-rendered, with internal links to the sunjob.ir tool family. */
function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#1A2744] text-white overflow-hidden print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/sunjob-logo.png" alt="سان‌جاب" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold">سان‌جاب</span>
            </div>
            <p className="text-gray-400 text-sm leading-6 mb-4">
              سان‌جاب، همراه تو در مسیر کشف خود و ساخت آینده‌ای روشن. ما باور داریم انتخاب رشته، انتخاب یک مسیر زندگی است.
            </p>
            <a
              href="https://t.me/Sunjob1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-9 h-9 rounded-lg bg-white/10 hover:bg-[#0EA5A0]/20 transition-colors justify-center"
              aria-label="کانال تلگرام سان‌جاب"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#9CA3AF" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </a>
          </div>
          {/* Quick Access */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-gray-300">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li><a href={`${MAIN_SITE}/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">خانه سان‌جاب</a></li>
              <li><a href={`${MAIN_SITE}/taraz-estimator/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">ابزارهای انتخاب رشته</a></li>
              <li><a href={`${MAIN_SITE}/majors/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">راهنمای انتخاب رشته</a></li>
              <li><a href="https://t.me/Sunjob1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">مشاوره انتخاب رشته</a></li>
            </ul>
          </div>
          {/* Tools */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-gray-300">ابزارهای انتخاب رشته</h4>
            <ul className="space-y-2">
              <li><a href={`${MAIN_SITE}/taraz-estimator/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">تخمین رتبه و تراز</a></li>
              <li><a href={`${MAIN_SITE}/taraz-estimator/calculator/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">تبدیل تراز به رتبه</a></li>
              <li><a href="/" className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">تخمین رشته‌محل قبولی</a></li>
            </ul>
          </div>
          {/* Fields */}
          <div>
            <h4 className="text-sm font-bold mb-3 text-gray-300">رشته‌ها</h4>
            <ul className="space-y-2">
              <li><a href={`${MAIN_SITE}/fields/riazi/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">رشته‌های ریاضی</a></li>
              <li><a href={`${MAIN_SITE}/fields/tajrobi/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">رشته‌های تجربی</a></li>
              <li><a href={`${MAIN_SITE}/fields/ensani/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">رشته‌های انسانی</a></li>
              <li><a href={`${MAIN_SITE}/products/`} className="text-gray-400 hover:text-[#0EA5A0] text-sm transition-all duration-200">پلن PRO انتخاب رشته</a></li>
            </ul>
          </div>
        </div>
        {/* Contact */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} تمامی حقوق برای SUNJOB محفوظ است. | کشف • تجربه • انتخاب
          </p>
          <a href="mailto:info@sunjob.ir" className="text-gray-500 text-xs hover:text-[#0EA5A0] transition-colors">
            info@sunjob.ir
          </a>
        </div>
      </div>
    </footer>
  )
}
