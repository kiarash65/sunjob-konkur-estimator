import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocHead, DocLayout } from '@/components/site/doc/doc-head'
import { ScrollSpyTOC, HeadingAnchor } from '@/components/site/doc/scroll-spy'
import { UNI_TYPE_CATEGORIES, mapUniType, getMajorByName } from '@/lib/masir-content'
import {
  getAllUniversities,
  getAllCatalogRows,
  UNIVERSITY_TYPE_LABEL,
} from '@/lib/konkur-data'
import { fa, faFmt } from '@/lib/konkur-shared'

export function generateStaticParams() {
  // Pre-render a page for each known university name (URL-encoded as slug).
  return getAllUniversities().map((u) => ({ slug: encodeURIComponent(u.name) }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const name = decodeURIComponent(slug)
  const uni = getAllUniversities().find((u) => u.name === name)
  if (!uni) return { title: 'دانشگاه یافت نشد' }
  const title = `دانشگاه ${uni.name}: رشته‌ها، شهر و نوع`
  const description = `معرفی دانشگاه ${uni.name} در شهر ${uni.city || 'نامشخص'}، نوع ${uni.typeLabel} و رشته‌های ارائه‌شده.`
  return {
    title,
    description,
    alternates: { canonical: `/universities/${slug}/` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/universities/${slug}/`,
    },
  }
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { slug } = await params
  const name = decodeURIComponent(slug)
  const allUnis = getAllUniversities()
  const uni = allUnis.find((u) => u.name === name)
  if (!uni) notFound()

  const catId = mapUniType(uni.type)
  const cat = UNI_TYPE_CATEGORIES.find((c) => c.id === catId)

  // Catalog rows for this university.
  const rows = getAllCatalogRows().filter((r) => r.university === uni.name)
  const majorsOffering = Array.from(
    new Map(rows.map((r) => [r.major, r])).values()
  ).slice(0, 100)

  const sections = [
    { id: 'sec-intro', title: 'معرفی دانشگاه' },
    { id: 'sec-majors', title: 'رشته‌های ارائه‌شده' },
    { id: 'sec-city', title: 'شهر و استان' },
    { id: 'sec-type', title: 'نوع دانشگاه' },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'دانشگاه‌ها', item: '/universities/' },
      { '@type': 'ListItem', position: 3, name: uni.name, item: `/universities/${slug}/` },
    ],
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: uni.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: uni.city || '',
    },
  }

  return (
    <div data-cat="university" className="cat-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <DocHead
        crumbs={[
          { label: 'خانه', href: '/' },
          { label: 'دانشگاه‌ها', href: '/universities/' },
          { label: uni.name },
        ]}
        title={`دانشگاه ${uni.name}`}
        excerpt={`دانشگاهی در شهر ${uni.city || 'نامشخص'} از نوع ${uni.typeLabel}.`}
      />

      <DocLayout
        sidebar={
          <>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <p className="text-sm font-bold text-[var(--c-dark,--foreground)]">{uni.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{uni.city || 'شهر نامشخص'}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cat && (
                  <Link
                    href={`/universities/?type=${cat.id}`}
                    className="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] transition-colors"
                  >
                    {cat.title}
                  </Link>
                )}
                {uni.majorCount > 0 && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)]">
                    {fa(uni.majorCount)} رشته‌محل
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>کمینه رتبه</span>
                  <strong className="text-[var(--type-color,--primary)]">
                    {uni.minCutoff < Infinity ? faFmt(uni.minCutoff) : '—'}
                  </strong>
                </li>
                <li className="flex items-center justify-between">
                  <span>بیشینه رتبه</span>
                  <strong className="text-[var(--type-color,--primary)]">
                    {uni.maxCutoff > 0 ? faFmt(uni.maxCutoff) : '—'}
                  </strong>
                </li>
              </ul>
            </div>
            <ScrollSpyTOC sections={sections} />
          </>
        }
      >
        {/* معرفی دانشگاه */}
        <Section id="sec-intro" title="معرفی دانشگاه">
          <p className="text-sm leading-8 text-foreground/90">
            دانشگاه {uni.name} در شهر {uni.city || 'نامشخص'} قرار دارد و از نوع {uni.typeLabel} است. این دانشگاه در دیتابیس کنکور ۱۴۰۴ سان‌جاب، {fa(uni.majorCount)} رشته‌محل در گروه‌های مختلف آزمایشی ارائه می‌دهد.
          </p>
          <p className="mt-3 text-sm leading-8 text-muted-foreground">
            اطلاعات کامل درباره دانشکده‌ها، پردیس‌ها، امکانات آموزشی و پژوهشی این دانشگاه در دست آماده‌سازی است. برای جزئیات بیشتر، دفترچه رسمی پذیرش دوره جاری و سایت رسمی دانشگاه را بررسی کنید.
          </p>
        </Section>

        {/* رشته‌های ارائه‌شده */}
        <Section id="sec-majors" title="رشته‌های ارائه‌شده">
          {majorsOffering.length > 0 ? (
            <>
              <p className="text-sm leading-8 text-muted-foreground mb-3">
                {fa(majorsOffering.length)} رشته در این دانشگاه ارائه می‌شود. رتبه‌های قبولی هر رشته‌محل به تفکیک سهمیه در جدول زیر آمده است.
              </p>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm border border-border/60 rounded-lg overflow-hidden">
                  <thead className="bg-[var(--c-panel,--secondary)] text-[var(--c-dark,--foreground)]">
                    <tr>
                      <th className="text-right font-bold px-3 py-2">رشته</th>
                      <th className="text-right font-bold px-3 py-2">گروه</th>
                      <th className="text-right font-bold px-3 py-2">منطقه ۱</th>
                      <th className="text-right font-bold px-3 py-2">منطقه ۲</th>
                      <th className="text-right font-bold px-3 py-2">منطقه ۳</th>
                    </tr>
                  </thead>
                  <tbody>
                    {majorsOffering.map((r, i) => (
                      <tr key={i} className="border-t border-border/40 hover:bg-[var(--c-wash,--background)]">
                        <td className="px-3 py-2 font-medium">
                          {(() => {
                            const known = getMajorByName(r.major)
                            if (known) {
                              return (
                                <Link
                                  href={`/fields/${known.slug}/`}
                                  className="hover:text-[var(--type-color,--primary)] hover:underline"
                                >
                                  {r.major}
                                </Link>
                              )
                            }
                            return (
                              <Link
                                href={`/fields/?q=${encodeURIComponent(r.major)}`}
                                className="hover:text-[var(--type-color,--primary)] hover:underline"
                              >
                                {r.major}
                              </Link>
                            )
                          })()}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.groupEmoji} {r.groupLabel}</td>
                        <td className="px-3 py-2 font-mono">{r.cutoffs.region1 ? faFmt(r.cutoffs.region1) : '—'}</td>
                        <td className="px-3 py-2 font-mono">{r.cutoffs.region2 ? faFmt(r.cutoffs.region2) : '—'}</td>
                        <td className="px-3 py-2 font-mono">{r.cutoffs.region3 ? faFmt(r.cutoffs.region3) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                توجه: رتبه‌های قبولی بر اساس دفترچه پذیرش ۱۴۰۴ است.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              فهرست رشته‌های این دانشگاه در حال تکمیل است.
            </p>
          )}
        </Section>

        {/* شهر و استان */}
        <Section id="sec-city" title="شهر و استان">
          <p className="text-sm leading-8 text-foreground/90">
            دانشگاه {uni.name} در شهر {uni.city || 'نامشخص'} قرار دارد. برای داوطلبان خارج از این شهر، باید هزینه‌های سکونت (خوابگاه، اجاره، رفت‌وآمد) و دوری از خانواده را در نظر بگیرید.
          </p>
        </Section>

        {/* نوع دانشگاه */}
        <Section id="sec-type" title="نوع دانشگاه">
          {cat ? (
            <>
              <p className="text-sm leading-8 text-foreground/90 mb-2">
                {cat.title}
              </p>
              <p className="text-sm leading-8 text-muted-foreground">
                {cat.description}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {UNIVERSITY_TYPE_LABEL[uni.type] ?? uni.type}
            </p>
          )}
        </Section>
      </DocLayout>
    </div>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 mb-8">
      <div className="group flex items-center mb-3">
        <h2 className="text-base sm:text-lg font-extrabold text-[var(--c-dark,--foreground)]">
          {title}
        </h2>
        <HeadingAnchor id={id} />
      </div>
      {children}
    </section>
  )
}

/** (helper removed; we now look up the slug from MAJOR_DESCRIPTIONS by name) */
