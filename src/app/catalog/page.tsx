import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ChevronLeft } from 'lucide-react'
import { fa, faFmt } from '@/lib/konkur-shared'
import CatalogViewLazy from '@/components/site/catalog-view-lazy'
import {
  getAllCatalogRows,
  getAllUniversities,
  getAllMajors,
  GROUPS,
  UNIVERSITY_TYPE_LABEL,
  type UniversityType,
} from '@/lib/konkur-data'

export const metadata: Metadata = {
  title: 'فهرست رشته‌محل‌های کنکور ۱۴۰۴ | سان‌جاب',
  description: 'جست‌وجو و مرور فهرست کامل رشته‌محل‌های کنکور سراسری ۱۴۰۴ شامل گروه آزمایشی، دانشگاه، شهر، نوع دانشگاه و رتبه‌های قبولی.',
  alternates: { canonical: '/catalog' },
  openGraph: {
    title: 'فهرست رشته‌محل‌های کنکور ۱۴۰۴ | سان‌جاب',
    description: 'جست‌وجو و مرور فهرست کامل رشته‌محل‌های کنکور سراسری ۱۴۰۴.',
    type: 'website',
    url: '/catalog',
  },
}

const BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
    { '@type': 'ListItem', position: 2, name: 'فهرست رشته‌محل‌ها', item: '/catalog' },
  ],
}

// CatalogView client chunk is loaded lazily by the CatalogViewLazy wrapper
// (a separate client component file using next/dynamic ssr:false).

export default function CatalogPage() {
  const allRows = getAllCatalogRows()
  const unis = getAllUniversities()
  const majors = getAllMajors()
  const cities = Array.from(new Set(allRows.map((r) => r.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fa'))

  const uniTypes = (Object.keys(UNIVERSITY_TYPE_LABEL) as UniversityType[]).map((k) => ({
    key: k,
    label: UNIVERSITY_TYPE_LABEL[k],
  }))

  return (
    <div data-cat="field_of_study" className="cat-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <section className="border-b border-border/40 bg-[var(--c-wash,--background)]/40">
        <div className="container mx-auto max-w-6xl px-4 py-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/">خانه</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronLeft className="size-3.5" /></BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>فهرست رشته‌محل‌ها</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A2744] dark:text-foreground">
              فهرست رشته‌محل‌ها
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--c-chip,--secondary)] text-[var(--c-dark,--foreground)]">
              {faFmt(allRows.length)} رشته‌محل
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-7 max-w-2xl">
            فهرست کامل رشته‌محل‌های کنکور سراسری ۱۴۰۴ را مرور کنید. با فیلتر گروه آزمایشی، نوع دانشگاه و شهر می‌توانید رشته‌محل‌های مرتبط را پیدا کنید و فهرست انتخاب رشته‌تان را آگاهانه بچینید.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[18rem_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-4">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground mb-2">آمار کلی</p>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">رشته‌محل</span>
                  <strong className="text-[var(--type-color,--primary)]">{faFmt(allRows.length)}</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">دانشگاه</span>
                  <strong className="text-[var(--type-color,--primary)]">{faFmt(unis.length)}</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">رشته تحصیلی</span>
                  <strong className="text-[var(--type-color,--primary)]">{faFmt(majors.length)}</strong>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground mb-2">گروه آزمایشی</p>
              <div className="flex flex-wrap gap-1.5">
                {GROUPS.map((g) => (
                  <Link
                    key={g.key}
                    href={`/fields/?category=${g.key}`}
                    className="inline-block text-xs px-2.5 py-1 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] hover:border-[var(--type-color,--primary)] transition-colors"
                  >
                    {g.emoji} {g.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground mb-2">نوع دانشگاه</p>
              <div className="flex flex-wrap gap-1.5">
                {uniTypes.map((t) => (
                  <Link
                    key={t.key}
                    href={`/universities/?type=${t.key}`}
                    className="inline-block text-xs px-2.5 py-1 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] hover:border-[var(--type-color,--primary)] transition-colors"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground mb-2">شهر</p>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scroll">
                {cities.slice(0, 30).map((c) => (
                  <Link
                    key={c}
                    href={`/universities/?city=${encodeURIComponent(c)}`}
                    className="inline-block text-xs px-2.5 py-1 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] hover:border-[var(--type-color,--primary)] transition-colors"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main: catalog view (existing client component) */}
        <div>
          <CatalogViewLazy />
        </div>
      </div>
    </div>
  )
}
