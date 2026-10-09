import type { Metadata } from 'next'
import Link from 'next/link'
import { ListingPage } from '@/components/site/listing/listing-page'
import { MAJOR_DESCRIPTIONS, FIELD_CATEGORIES, slugify } from '@/lib/masir-content'
import { fa } from '@/lib/konkur-shared'

export const metadata: Metadata = {
  title: 'رشته‌های دانشگاهی: معرفی و فهرست کامل',
  description: 'معرفی و فهرست کامل رشته‌های دانشگاهی به تفکیک گروه آموزشی.',
  alternates: { canonical: '/fields/' },
  openGraph: {
    title: 'رشته‌های دانشگاهی: معرفی و فهرست کامل',
    description: 'معرفی و فهرست کامل رشته‌های دانشگاهی به تفکیک گروه آموزشی.',
    type: 'website',
    url: '/fields/',
  },
}

const BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
    { '@type': 'ListItem', position: 2, name: 'رشته‌های دانشگاهی', item: '/fields/' },
  ],
}

export default function FieldsListingPage() {
  // Build the ItemList JSON-LD from all major slugs (top 100 max to keep payload small).
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: MAJOR_DESCRIPTIONS.slice(0, 100).map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `/fields/${m.slug}/`,
      name: m.name,
    })),
  }

  const panels = FIELD_CATEGORIES.map((cat) => {
    const cards = MAJOR_DESCRIPTIONS.filter((m) => m.category === cat.id).map((m) => ({
      href: `/fields/${m.slug}/`,
      title: m.name,
      srOnlyDescription: m.shortDescription,
      variant: 'slim' as const,
    }))
    return {
      title: cat.title,
      description: cat.description,
      cards,
    }
  })

  // Hide the small categories (last 3) behind "نمایش بیشتر" toggle (masir pattern).
  const visibleCategories = FIELD_CATEGORIES.slice(0, 8)
  const hiddenCategories = FIELD_CATEGORIES.slice(8)
  const filterGroups = [
    {
      label: 'گروه آموزشی',
      pills: [
        ...visibleCategories.map((c) => ({ label: c.title, href: `/fields/?category=${c.id}` })),
        ...hiddenCategories.map((c) => ({ label: c.title, href: `/fields/?category=${c.id}`, hidden: true })),
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ListingPage
        title="رشته‌های دانشگاهی"
        count={MAJOR_DESCRIPTIONS.length}
        countLabel="رشته دانشگاهی"
        catScope="field_of_study"
        searchPlaceholder="جست‌وجو در رشته‌های دانشگاهی…"
        searchAction="/catalog"
        filterGroups={filterGroups}
        panels={panels}
      />
    </>
  )
}

// Export slugify for the [slug] route's generateStaticParams (kept here for cohesion).
export { slugify }
