import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocHead, DocLayout } from '@/components/site/doc/doc-head'
import { ScrollSpyTOC, HeadingAnchor } from '@/components/site/doc/scroll-spy'
import { MAJOR_DESCRIPTIONS, FIELD_CATEGORIES, getMajorDescription } from '@/lib/masir-content'
import { getAllCatalogRows } from '@/lib/konkur-data'
import { fa, faFmt } from '@/lib/konkur-shared'

export function generateStaticParams() {
  return MAJOR_DESCRIPTIONS.map((m) => ({ slug: m.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const major = getMajorDescription(slug)
  if (!major) return { title: 'رشته یافت نشد' }
  const title = `رشته ${major.name}: دروس، گرایش‌ها و بازار کار`
  const description = major.shortDescription
  return {
    title,
    description,
    alternates: { canonical: `/fields/${major.slug}/` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/fields/${major.slug}/`,
    },
  }
}

export default async function FieldDetailPage({ params }: PageProps) {
  const { slug } = await params
  const major = getMajorDescription(slug)
  if (!major) notFound()

  // Find universities offering this major. Strict match first, then fall back
  // to "major contains the field name" to catch variants like
  // "مهندسی کامپیوتر (نرم‌افزار)".
  const catalogRows = getAllCatalogRows()
  const strictRows = catalogRows.filter((r) => r.major === major.name)
  const looseRows = catalogRows.filter(
    (r) => r.major.startsWith(major.name) || r.major.includes(major.name)
  )
  const uniRows = strictRows.length > 0 ? strictRows : looseRows
  const unisOffering = Array.from(
    new Map(uniRows.map((r) => [r.university + '|' + r.city, r])).values()
  ).slice(0, 50)

  const category = FIELD_CATEGORIES.find((c) => c.id === major.category)

  const sections = [
    { id: 'sec-intro', title: 'معرفی' },
    { id: 'sec-courses', title: 'دروس اصلی' },
    { id: 'sec-career', title: 'بازار کار' },
    { id: 'sec-suitable-for', title: 'مناسب چه کسانی است' },
    { id: 'sec-universities', title: 'دانشگاه‌های دارای این رشته' },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'رشته‌های دانشگاهی', item: '/fields/' },
      { '@type': 'ListItem', position: 3, name: major.name, item: `/fields/${major.slug}/` },
    ],
  }

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: major.name,
    description: major.shortDescription,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: 'دانشگاه‌های ایران',
    },
    inLanguage: 'fa-IR',
  }

  return (
    <div data-cat="field_of_study" className="cat-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <DocHead
        crumbs={[
          { label: 'خانه', href: '/' },
          { label: 'رشته‌های دانشگاهی', href: '/fields/' },
          { label: major.name },
        ]}
        title={`رشته ${major.name}: دروس، گرایش‌ها و بازار کار در ایران`}
        excerpt={major.shortDescription}
      />

      <DocLayout
        sidebar={
          <>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <p className="text-sm font-bold text-[var(--c-dark,--foreground)]">{major.name}</p>
              {major.englishName && (
                <p className="text-xs text-muted-foreground mt-1" dir="ltr">{major.englishName}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {category && (
                  <Link
                    href={`/fields/?category=${category.id}`}
                    className="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] transition-colors"
                  >
                    {category.title}
                  </Link>
                )}
                <Link
                  href={`/catalog?major=${encodeURIComponent(major.name)}`}
                  className="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] transition-colors"
                >
                  مشاهده در فهرست رشته‌محل‌ها
                </Link>
              </div>
            </div>
            <ScrollSpyTOC sections={sections} />
          </>
        }
      >
        {/* معرفی */}
        <Section id="sec-intro" title="معرفی">
          <p className="text-sm leading-8 text-foreground/90">{major.intro}</p>
        </Section>

        {/* دروس اصلی */}
        {major.courses && (
          <Section id="sec-courses" title="دروس اصلی">
            <p className="text-sm leading-8 text-muted-foreground mb-3">
              نمونه‌ای از دروس اصلی و تخصصی رشته {major.name}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {major.courses.split(/[،,]/).map((c, i) => (
                <span
                  key={i}
                  className="inline-block text-xs px-2.5 py-1 rounded-full bg-[var(--c-panel,--secondary)] text-[var(--c-dark,--foreground)] border border-[var(--c-border,--border)]"
                >
                  {c.trim()}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* بازار کار */}
        {major.career && (
          <Section id="sec-career" title="بازار کار">
            <p className="text-sm leading-8 text-foreground/90">{major.career}</p>
          </Section>
        )}

        {/* مناسب چه کسانی است */}
        {major.suitableFor && (
          <Section id="sec-suitable-for" title="مناسب چه کسانی است">
            <p className="text-sm leading-8 text-foreground/90">{major.suitableFor}</p>
          </Section>
        )}

        {/* دانشگاه‌های دارای این رشته */}
        <Section id="sec-universities" title="دانشگاه‌های دارای این رشته">
          {unisOffering.length > 0 ? (
            <>
              <p className="text-sm leading-8 text-muted-foreground mb-3">
                در دیتابیس کنکور ۱۴۰۴ سان‌جاب، {fa(unisOffering.length)} دانشگاه این رشته را ارائه می‌دهند. رتبه‌های قبولی در هر سهمیه متفاوت‌اند؛ برای جزئیات هر سهمیه به صفحه دانشگاه مراجعه کنید.
              </p>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm border border-border/60 rounded-lg overflow-hidden">
                  <thead className="bg-[var(--c-panel,--secondary)] text-[var(--c-dark,--foreground)]">
                    <tr>
                      <th className="text-right font-bold px-3 py-2">دانشگاه</th>
                      <th className="text-right font-bold px-3 py-2">شهر</th>
                      <th className="text-right font-bold px-3 py-2">نوع</th>
                      <th className="text-right font-bold px-3 py-2">گروه</th>
                      <th className="text-right font-bold px-3 py-2">منطقه ۱</th>
                      <th className="text-right font-bold px-3 py-2">منطقه ۲</th>
                      <th className="text-right font-bold px-3 py-2">منطقه ۳</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unisOffering.map((r, i) => (
                      <tr key={i} className="border-t border-border/40 hover:bg-[var(--c-wash,--background)]">
                        <td className="px-3 py-2 font-medium">
                          {r.city ? (
                            <Link
                              href={`/universities/${encodeURIComponent(slugifyUni(r.university))}/`}
                              className="hover:text-[var(--type-color,--primary)] hover:underline"
                            >
                              {r.university}
                            </Link>
                          ) : (
                            r.university
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.city || '—'}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.universityTypeLabel}</td>
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
                توجه: رتبه‌های قبولی بر اساس دفترچه پذیرش ۱۴۰۴ است. برای سهمیه‌های ویژه و دوره‌های مشروط، دفترچه رسمی جاری را بررسی کنید.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              فهرست دانشگاه‌های ارائه‌دهنده این رشته در حال تکمیل است. برای جست‌وجوی کامل‌تر به{' '}
              <Link href="/catalog" className="text-[var(--type-color,--primary)] hover:underline">فهرست رشته‌محل‌ها</Link>{' '}
              مراجعه کنید.
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

/** Tiny helper to slugify a university name for inline links. Keeps this
 *  file self-contained without importing the masir-content slugify. */
function slugifyUni(input: string): string {
  // Persian names need to be URL-encoded as-is. We just return the name
  // URL-encoded; the [slug] route accepts the value as-is.
  return encodeURIComponent(input)
}
