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

export interface Crumb {
  label: string
  href?: string
}

export function DocHead({
  crumbs,
  title,
  excerpt,
}: {
  crumbs: Crumb[]
  title: string
  excerpt?: string
}) {
  return (
    <section className="border-b border-border/40 bg-[var(--c-wash,--background)]/40">
      <div className="container mx-auto max-w-6xl px-4 py-5">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1
              return (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {i > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronLeft className="size-3.5" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {last || !c.href ? (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={c.href}>{c.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1A2744] dark:text-foreground leading-tight">
            {title}
          </h1>
          {excerpt && (
            <p className="mt-3 text-sm text-muted-foreground leading-7 max-w-3xl">
              {excerpt}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

/** Shared article-body wrapper. Sidebars are passed as <aside> children. */
export function DocLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[18rem_minmax(0,1fr)] gap-6">
      <aside className="lg:sticky lg:top-24 self-start space-y-4" id="page-sidebar">
        {sidebar}
      </aside>
      <article className="doc min-w-0">
        {children}
      </article>
    </div>
  )
}
