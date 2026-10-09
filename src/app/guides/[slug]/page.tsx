import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocHead, DocLayout } from '@/components/site/doc/doc-head'
import { ScrollSpyTOC, HeadingAnchor } from '@/components/site/doc/scroll-spy'
import { GUIDES, getGuide, type GuideSection } from '@/lib/masir-content'
import { GUIDE_CATEGORIES } from '@/lib/masir-content'

// Render on-demand at runtime instead of pre-rendering all 24 guide
// pages at build time (only one guide has full body content; the rest
// are placeholders).

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return { title: 'راهنما یافت نشد' }
  const title = guide.title
  const description = guide.excerpt
  return {
    title,
    description,
    alternates: { canonical: `/guides/${guide.slug}/` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/guides/${guide.slug}/`,
    },
  }
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const cat = GUIDE_CATEGORIES.find((c) => c.id === guide.category)

  // Build TOC sections from the body.
  const tocSections = guide.body.map((s) => ({
    id: s.id,
    title: s.title,
    sub: s.level === 3,
  }))

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'راهنماها', item: '/guides/' },
      { '@type': 'ListItem', position: 3, name: guide.title, item: `/guides/${guide.slug}/` },
    ],
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.excerpt,
    articleSection: cat?.label,
    datePublished: guide.publishedTime,
    inLanguage: 'fa-IR',
  }

  return (
    <div data-cat="guide" className="cat-scope">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <DocHead
        crumbs={[
          { label: 'خانه', href: '/' },
          { label: 'راهنماها', href: '/guides/' },
          { label: guide.title },
        ]}
        title={guide.title}
        excerpt={guide.excerpt}
      />

      <DocLayout
        sidebar={
          <>
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <p className="text-sm font-bold text-[var(--c-dark,--foreground)]">{guide.title}</p>
              {cat && (
                <Link
                  href={`/guides/?category=${cat.id}`}
                  className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] transition-colors"
                >
                  {cat.label}
                </Link>
              )}
              {guide.publishedTime && (
                <p className="mt-2 text-xs text-muted-foreground">منتشر شده در {guide.publishedTime}</p>
              )}
            </div>
            {tocSections.length > 0 && <ScrollSpyTOC sections={tocSections} />}
          </>
        }
      >
        {guide.body.length > 0 ? (
          <>
            {/* Intro paragraph */}
            <p className="text-sm leading-8 text-foreground/90 mb-6 pb-6 border-b border-border/40">
              {guide.excerpt}
            </p>
            {guide.body.map((s, i) => (
              <GuideSectionView key={i} section={s} />
            ))}
          </>
        ) : (
          // No body — show placeholder
          <div className="space-y-6">
            <p className="text-sm leading-8 text-foreground/90">{guide.excerpt}</p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-7 text-amber-700 dark:text-amber-300">
              <p>
                محتوای کامل این راهنما در دست آماده‌سازی است. در نسخه رسمی فرادرس، این صفحه به مقاله کامل لینک می‌شود.
              </p>
              <p className="mt-3">
                <Link
                  href="/guides/major-selection-overview/"
                  className="font-bold underline hover:text-amber-800"
                >
                  مرور کلی انتخاب رشته
                </Link>{' '}
                — تنها راهنمایی است که محتوای کامل آن آماده است.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <Link href="/guides/" className="hover:underline text-[var(--type-color,--primary)]">
                بازگشت به فهرست راهنماها
              </Link>
            </p>
          </div>
        )}
      </DocLayout>
    </div>
  )
}

function GuideSectionView({ section }: { section: GuideSection }) {
  const isH3 = section.level === 3
  const Tag = isH3 ? 'h3' : 'h2'
  return (
    <section id={section.id} className="scroll-mt-24 mb-8">
      <div className={`group flex items-center mb-3 ${isH3 ? 'ms-4' : ''}`}>
        <Tag className={[
          'font-extrabold text-[var(--c-dark,--foreground)]',
          isH3 ? 'text-sm' : 'text-base sm:text-lg',
        ].join(' ')}>
          {section.title}
        </Tag>
        <HeadingAnchor id={section.id} />
      </div>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className={`text-sm leading-8 text-foreground/90 mb-3 ${isH3 ? 'ms-4' : ''}`}>
          {p}
        </p>
      ))}
      {section.bullets && section.bullets.length > 0 && (
        <ul className={isH3 ? 'ms-4 ms-8' : 'ms-4'}>
          {section.bullets.map((b, i) => (
            <li key={i} className="text-sm leading-8 text-foreground/90 flex gap-2 mb-1.5">
              <span className="text-[var(--type-color,--primary)] mt-1 shrink-0" aria-hidden="true">
                {section.ordered ? `${i + 1}.` : '•'}
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
