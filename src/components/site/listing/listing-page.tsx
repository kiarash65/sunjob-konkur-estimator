import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronLeft, Search } from 'lucide-react'
import { fa } from '@/lib/konkur-shared'
import { cn } from '@/lib/utils'
import { FilterToggle } from './filter-toggle'

/** Filter group shown in the sidebar accordion. */
export interface FilterGroup {
  label: string
  pills: { label: string; href: string; hidden?: boolean }[]
}

/** A panel of relation-cards grouped by category. */
export interface PanelData {
  title: string
  description: string
  /** Optional "see all" link at the bottom of the panel grid. */
  seeAllHref?: string
  seeAllLabel?: string
  cards: ListingCard[]
}

/** A single relation-card. Two variants: slim (one line + chevron) and
 *  post (with summary + "ادامه مطلب"). */
export interface ListingCard {
  href: string
  title: string
  srOnlyDescription?: string
  summary?: string
  readMore?: string
  variant: 'slim' | 'post'
}

export interface ListingPageProps {
  title: string
  count: number
  countLabel: string
  catScope: 'field_of_study' | 'university' | 'guide'
  searchPlaceholder: string
  searchAction?: string
  filterGroups: FilterGroup[]
  panels: PanelData[]
}

export function ListingPage(props: ListingPageProps) {
  return (
    <div data-cat={props.catScope} className="cat-scope">
      {/* Head band: breadcrumb + title row + count chip */}
      <section className="border-b border-border/40 bg-[var(--c-wash,--background)]/40">
        <div className="container mx-auto max-w-6xl px-4 py-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">خانه</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{props.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A2744] dark:text-foreground">
              {props.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--c-chip,--secondary)] text-[var(--c-dark,--foreground)]">
              {fa(props.count)} {props.countLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Doc-layout: sidebar + main */}
      <div className="container mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[18rem_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 self-start" id="page-sidebar">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-4">
            {/* Search box */}
            <form
              role="search"
              action={props.searchAction ?? '/catalog'}
              method="get"
              className="relative"
            >
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder={props.searchPlaceholder}
                aria-label="عبارت جست‌وجو"
                maxLength={200}
                className="w-full h-10 rounded-lg border border-border bg-background pr-9 pl-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--type-color,--ring)] focus:border-transparent"
              />
            </form>

            {/* Filter groups accordion */}
            <div>
              <p className="text-[11px] font-bold text-muted-foreground mb-2">فیلترها</p>
              <Accordion type="multiple" defaultValue={props.filterGroups.map((_, i) => `fg-${i}`)} className="w-full">
                {props.filterGroups.map((fg, i) => {
                  const visible = fg.pills.filter((p) => !p.hidden)
                  const hidden = fg.pills.filter((p) => p.hidden)
                  return (
                    <AccordionItem key={i} value={`fg-${i}`} className="border-b border-border/40 last:border-b-0">
                      <AccordionTrigger className="text-sm font-bold text-[#1A2744] dark:text-foreground hover:no-underline">
                        {fg.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-1.5">
                          {visible.map((p, j) => (
                            <Link
                              key={j}
                              href={p.href}
                              className="inline-block text-xs px-2.5 py-1 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] hover:border-[var(--type-color,--primary)] transition-colors"
                            >
                              {p.label}
                            </Link>
                          ))}
                          {hidden.length > 0 && (
                            <FilterToggle pills={hidden} />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </div>
          </div>
        </aside>

        {/* Main: category-panels */}
        <div className="space-y-6">
          {props.panels.map((panel, i) => (
            <section key={i} aria-labelledby={`panel-${i}`}>
              <div className="rounded-xl border border-[var(--c-border,--border)] bg-[var(--c-on,--card)] overflow-hidden">
                {/* Panel head */}
                <div className="flex items-center gap-3 px-5 py-4 bg-[var(--c-panel,--secondary)] border-b border-[var(--c-border,--border)]">
                  <span
                    className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-[var(--type-color,--primary)]"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 512 512" fill="currentColor" width="18" height="18">
                      <path d="M256 64L96 192v224h96v-96h128v96h96V192L256 64z" />
                    </svg>
                  </span>
                  <div>
                    <h2 id={`panel-${i}`} className="text-base font-extrabold text-[var(--c-dark,--foreground)]">
                      {panel.title}
                    </h2>
                  </div>
                </div>
                {/* Panel description */}
                {panel.description && (
                  <p className="px-5 pt-4 text-sm text-muted-foreground leading-7">
                    {panel.description}
                  </p>
                )}
                {/* Card grid */}
                <div className="p-5 grid sm:grid-cols-2 gap-2">
                  {panel.cards.map((card, j) => (
                    <ListingCardView key={j} card={card} />
                  ))}
                </div>
                {/* See-all footer */}
                {panel.seeAllHref && (
                  <div className="px-5 pb-5">
                    <Link
                      href={panel.seeAllHref}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--type-color,--primary)] hover:underline"
                    >
                      {panel.seeAllLabel ?? 'مشاهده همه'}
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </section>
          ))}
          {props.panels.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              موردی یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ListingCardView({ card }: { card: ListingCard }) {
  const cls = cn(
    'group flex items-center justify-between gap-3 rounded-lg border border-[var(--c-border,--border)] bg-[var(--c-on,--card)] px-4 py-3 hover:border-[var(--type-color,--primary)] hover:shadow-sm transition-all',
    card.variant === 'post' && 'flex-col items-stretch gap-2'
  )
  if (card.variant === 'post') {
    return (
      <Link href={card.href} className={cls}>
        <span className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-[var(--c-dark,--foreground)] group-hover:text-[var(--type-color,--primary)] transition-colors">
            {card.title}
          </h3>
          {card.summary && (
            <span className="text-xs text-muted-foreground leading-6 line-clamp-3">
              {card.summary}
            </span>
          )}
          {card.srOnlyDescription && <span className="sr-only">{card.srOnlyDescription}</span>}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-[var(--type-color,--primary)]">
          {card.readMore ?? 'ادامه مطلب'}
          <ChevronLeft className="w-3.5 h-3.5" />
        </span>
      </Link>
    )
  }
  // slim variant
  return (
    <Link href={card.href} className={cls}>
      <h3 className="text-sm font-bold text-[var(--c-dark,--foreground)] group-hover:text-[var(--type-color,--primary)] transition-colors">
        {card.title}
      </h3>
      {card.srOnlyDescription && <span className="sr-only">{card.srOnlyDescription}</span>}
      <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-[var(--type-color,--primary)] transition-colors shrink-0" />
    </Link>
  )
}
