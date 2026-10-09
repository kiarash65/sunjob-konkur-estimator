'use client'

/**
 * SiteHeader — sticky top-of-page brand + main navigation, shared across all
 * routes via RootLayout. Mirrors masir.faradars.org's <header class="site-header">
 * but keeps the sunjob brand instead of "مسیر".
 *
 * - Uses usePathname() to mark the active link with aria-current="page".
 * - Mobile nav uses a native <details> element (no JS) — progressively enhanced
 *   if the user agent has JS, but works without it.
 * - Sticky header via Tailwind `sticky top-0 z-40`.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/catalog/', label: 'فهرست رشته‌محل‌ها', cat: undefined },
  { href: '/guides/', label: 'راهنمای انتخاب رشته', cat: 'guide' as const },
  { href: '/universities/', label: 'دانشگاه‌ها', cat: 'university' as const },
  { href: '/fields/', label: 'رشته‌های دانشگاهی', cat: 'field_of_study' as const },
]

function isActive(pathname: string, href: string): boolean {
  // Strip trailing slash except for "/"
  const p = pathname.replace(/\/$/, '') || '/'
  const h = href.replace(/\/$/, '') || '/'
  if (h === '/') return p === '/'
  return p === h || p.startsWith(h + '/') || p.startsWith(h + '?')
}

export function SiteHeader() {
  const pathname = usePathname() || '/'

  return (
    <>
      <a
        href="#main"
        className="skip-link"
      >
        پرش به محتوای اصلی
      </a>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand + tagline */}
          <Link href="/" className="anim-fade-in flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30 overflow-hidden">
                <img src="/sunjob-logo.png" alt="سان‌جاب" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-base sm:text-lg">سان‌جاب</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">نرم‌افزار رایگان انتخاب رشته هوشمند</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="ناوبری اصلی">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-cat={item.cat ?? undefined}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile nav (no-JS-friendly <details>) */}
          <details className="md:hidden relative" aria-label="منو">
            <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-foreground/5 select-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="sr-only">منو</span>
            </summary>
            <nav
              className="absolute top-full left-0 mt-2 w-56 bg-background border border-border/60 rounded-lg shadow-lg p-2 flex flex-col gap-1"
              aria-label="ناوبری اصلی"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-foreground/5',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </details>
        </div>
      </header>
    </>
  )
}
