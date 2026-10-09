import type { Metadata } from 'next'
import { ListingPage } from '@/components/site/listing/listing-page'
import { GUIDES, GUIDE_CATEGORIES } from '@/lib/masir-content'

export const metadata: Metadata = {
  title: 'راهنمای انتخاب رشته | سان‌جاب',
  description: 'راهنمای گام‌به‌گام انتخاب رشته کنکور: از خواندن کارنامه و دفترچه تا چیدن فهرست نهایی و ثبت در سامانه سازمان سنجش.',
  alternates: { canonical: '/guides/' },
  openGraph: {
    title: 'راهنمای انتخاب رشته | سان‌جاب',
    description: 'راهنمای گام‌به‌گام انتخاب رشته کنکور: از کارنامه و دفترچه تا چیدن فهرست نهایی.',
    type: 'website',
    url: '/guides/',
  },
}

const BREADCRUMB_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'خانه', item: '/' },
    { '@type': 'ListItem', position: 2, name: 'راهنماها', item: '/guides/' },
  ],
}

export default function GuidesListingPage() {
  // Group guides by category and build panels of relation-card-post cards.
  const panels = GUIDE_CATEGORIES.map((cat) => {
    const cards = GUIDES.filter((g) => g.category === cat.id).map((g) => ({
      href: `/guides/${g.slug}/`,
      title: g.title,
      summary: g.excerpt,
      readMore: 'ادامه مطلب',
      variant: 'post' as const,
    }))
    return {
      title: cat.label,
      description: cat.description,
      cards,
    }
  })

  const filterGroups = [
    {
      label: 'موضوع راهنما',
      pills: GUIDE_CATEGORIES.map((c) => ({
        label: c.label,
        href: `/guides/?category=${c.id}`,
      })),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSONLD) }}
      />
      <ListingPage
        title="راهنماها"
        count={GUIDES.length}
        countLabel="راهنما"
        catScope="guide"
        searchPlaceholder="جست‌وجو در راهنماها…"
        searchAction="/catalog"
        filterGroups={filterGroups}
        panels={panels}
      />
    </>
  )
}
