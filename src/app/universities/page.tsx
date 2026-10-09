import type { Metadata } from 'next'
import Link from 'next/link'
import { ListingPage } from '@/components/site/listing/listing-page'
import { UNI_TYPE_CATEGORIES, mapUniType } from '@/lib/masir-content'
import { getAllUniversities } from '@/lib/konkur-data'
import { fa } from '@/lib/konkur-shared'

// Universities listing iterates through the full 1444-entry dataset to
// derive the 273 unique universities. Render on-demand to avoid
// pre-rendering a huge HTML file.
export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'دانشگاه‌ها و مراکز آموزش عالی | سان‌جاب',
  description: 'فهرست کامل دانشگاه‌ها و مراکز آموزش عالی ایران به تفکیک نوع دانشگاه (دولتی، آزاد، پیام نور، غیرانتفاعی، علمی‌کاربردی و فرهنگیان) و شهر.',
  alternates: { canonical: '/universities/' },
  openGraph: {
    title: 'دانشگاه‌ها و مراکز آموزش عالی | سان‌جاب',
    description: 'فهرست کامل دانشگاه‌ها و مراکز آموزش عالی ایران به تفکیک نوع دانشگاه و شهر.',
    type: 'website',
    url: '/universities/',
  },
}

const BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
    { '@type': 'ListItem', position: 2, name: 'دانشگاه‌ها', item: '/universities/' },
  ],
}

export default function UniversitiesListingPage() {
  const unis = getAllUniversities()
  const cities = Array.from(new Set(unis.map((u) => u.city).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'fa')
  )

  // Group universities by masir-style type id.
  const panels = UNI_TYPE_CATEGORIES.map((cat) => {
    const cards = unis
      .filter((u) => mapUniType(u.type) === cat.id)
      .map((u) => ({
        href: `/universities/${encodeURIComponent(u.name)}/`,
        title: u.name,
        srOnlyDescription: `دانشگاهی در شهر ${u.city || 'نامشخص'} از نوع ${u.typeLabel} با ${u.majorCount} رشته‌محل.`,
        variant: 'slim' as const,
      }))
    return {
      title: cat.title,
      description: cat.description,
      cards,
    }
  }).filter((p) => p.cards.length > 0)

  // Filter group 1: type (visible top-3 + hidden rest, mirroring masir)
  const visibleTypes = UNI_TYPE_CATEGORIES.slice(0, 7)
  const hiddenTypes = UNI_TYPE_CATEGORIES.slice(7)
  const typePills = [
    ...visibleTypes.map((c) => ({ label: c.title, href: `/universities/?type=${c.id}` })),
    ...hiddenTypes.map((c) => ({ label: c.title, href: `/universities/?type=${c.id}`, hidden: true })),
  ]

  // Filter group 2: city (top-10 visible, rest hidden)
  const visibleCities = cities.slice(0, 10)
  const hiddenCities = cities.slice(10)
  const cityPills = [
    ...visibleCities.map((c) => ({ label: c, href: `/universities/?city=${encodeURIComponent(c)}` })),
    ...hiddenCities.map((c) => ({ label: c, href: `/universities/?city=${encodeURIComponent(c)}`, hidden: true })),
  ]

  const filterGroups = [
    { label: 'نوع دانشگاه', pills: typePills },
    { label: 'شهر', pills: cityPills },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <ListingPage
        title="دانشگاه‌ها"
        count={unis.length}
        countLabel="دانشگاه"
        catScope="university"
        searchPlaceholder="جست‌وجو در دانشگاه‌ها…"
        searchAction="/catalog"
        filterGroups={filterGroups}
        panels={panels}
      />
    </>
  )
}
