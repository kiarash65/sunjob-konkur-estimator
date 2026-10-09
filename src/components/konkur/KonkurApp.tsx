'use client'

/**
 * KonkurApp — interactive shell of the estimator (header, home sections,
 * form, result area, lazy views).
 *
 * Perf architecture:
 * - NO runtime import of `lib/konkur-data` here (group/quota metadata and the
 *   precomputed home-section data arrive as serializable props from the
 *   server page). Only type-only imports are used, which are erased.
 * - ResultView, CatalogView, UniversitiesView, MajorsView, FavsPanel and
 *   HistoryPanel are loaded lazily via next/dynamic.
 * - framer-motion was removed; decorative entrances use CSS utility classes.
 *
 * DATA & LOGIC FREEZE: all handlers (submit/share/download/history/favs) are
 * the same as before the refactor; only presentation wiring changed.
 */
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
} from 'react'
import dynamic from 'next/dynamic'
import {
  Calculator,
  Download,
  Sparkles,
  GraduationCap,
  MapPin,
  Award,
  Loader2,
  ListChecks,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Share2,
  Heart,
  X,
  RotateCcw,
  ChevronDown,
  History,
  Keyboard,
  Clock,
  Trash2,
  Lightbulb,
  Monitor,
  HelpCircle,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { fa, faFmt } from '@/lib/konkur-shared'
import {
  loadFavs,
  saveFavs,
  loadHistory,
  saveHistory,
  rowKey,
  MAX_HISTORY,
  type ApiResponse,
  type FavItem,
  type HistoryItem,
  type EstimateResult,
  type EstimatedRow,
  type GroupKey,
  type QuotaKey,
} from '@/lib/konkur-shared'

// Results-only chunk: pulled in on the first estimate, not before.
const ResultView = dynamic(() => import('@/components/konkur/ResultView'), {
  loading: () => <LoadingState />,
})
// Tab chunks + panels: loaded on first open only.
const CatalogView = dynamic(() => import('@/components/konkur/CatalogView'), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />,
})
const UniversitiesView = dynamic(() => import('@/components/konkur/UniversitiesView'), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />,
})
const MajorsView = dynamic(() => import('@/components/konkur/MajorsView'), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />,
})
const GuidesView = dynamic(() => import('@/components/konkur/GuidesView'), {
  ssr: false,
  loading: () => <div className="h-[420px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />,
})
const FavsPanel = dynamic(() => import('@/components/konkur/FavsPanel'), {
  ssr: false,
})
const HistoryPanel = dynamic(() => import('@/components/konkur/HistoryPanel'), {
  ssr: false,
})

export interface GroupMeta {
  key: GroupKey
  label: string
  emoji: string
}
export interface QuotaMeta {
  key: QuotaKey
  label: string
  description: string
}
export interface PopularItem {
  university: string
  major: string
  percent: number
}
export interface KonkurAppData {
  groupsMeta: GroupMeta[]
  quotasMeta: QuotaMeta[]
  catalogCount: number
  universitiesCount: number
  majorsCount: number
  popular: Record<string, PopularItem[]>
  majorsTop: { name: string }[]
  universitiesTop: { name: string }[]
}

const SITE = 'https://sunjob.ir'

export default function KonkurApp({ appData }: { appData: KonkurAppData }) {
  const { theme, setTheme } = useTheme()
  const [group, setGroup] = useState<GroupKey>('riazi')
  const [quota, setQuota] = useState<QuotaKey>('region1')
  const [rankInput, setRankInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [shareToast, setShareToast] = useState('')
  const [favs, setFavs] = useState<FavItem[]>([])
  const [showFavs, setShowFavs] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showShortcutHelp, setShowShortcutHelp] = useState(false)
  const [activePage, setActivePage] = useState<'estimator' | 'catalog' | 'universities' | 'majors' | 'guides'>('estimator')
  const [activeGroupTab, setActiveGroupTab] = useState<GroupKey>('riazi')
  const resultRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  // Print-only date: resolved after mount so server/client locale formats never
  // cause a hydration mismatch (printing always happens in the browser anyway).
  const [todayFa, setTodayFa] = useState('')

  const groupsMeta = appData.groupsMeta
  const quotasMeta = appData.quotasMeta

  const submitEstimate = useCallback(
    async (g: GroupKey, q: QuotaKey, rank: number) => {
      setError('')
      setLoading(true)
      setResult(null)
      try {
        const res = await fetch('/api/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group: g, quota: q, rank }),
        })
        const data: ApiResponse = await res.json()
        if (!data.ok || !data.result) {
          setError(data.error || 'خطای ناشناخته رخ داد.')
        } else {
          setResult(data.result)
          // Save to history (max MAX_HISTORY items, dedup by group:quota:rank)
          const id = `${g}:${q}:${rank}`
          setHistory((prev) => {
            const filtered = prev.filter((h) => h.id !== id)
            const item: HistoryItem = {
              id,
              group: g,
              quota: q,
              rank,
              totalChoices: data.result!.totalChoices,
              reachableCount: data.result!.summary.reachableCount,
              bestChance: data.result!.summary.bestChance?.chance ?? 0,
              bestMajor: data.result!.summary.bestChance?.major ?? '—',
              savedAt: Date.now(),
            }
            const next = [item, ...filtered].slice(0, MAX_HISTORY)
            saveHistory(next)
            return next
          })
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }
      } catch (err) {
        setError('ارتباط با سرور برقرار نشد.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Hydrate from URL and localStorage on mount
  useEffect(() => {
    setMounted(true)
    setFavs(loadFavs())
    setHistory(loadHistory())
    setTodayFa(new Date().toLocaleDateString('fa-IR'))
    try {
      const params = new URLSearchParams(window.location.search)
      const g = params.get('g') as GroupKey | null
      const q = params.get('q') as QuotaKey | null
      const r = params.get('r')
      const auto = params.get('auto') === '1'
      if (g && groupsMeta.some((x) => x.key === g)) setGroup(g)
      if (q && quotasMeta.some((x) => x.key === q)) setQuota(q)
      if (r && /^\d+$/.test(r)) setRankInput(r)
      if (auto && r) {
        // auto-submit if requested by URL
        setTimeout(() => submitEstimate(g || 'riazi', q || 'region1', parseInt(r, 10)), 300)
      }
    } catch {}
  }, [submitEstimate, groupsMeta, quotasMeta])

  // Keyboard shortcuts: "/" focuses search, "Esc" clears search, "?" shows help
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Only when not typing in an input/textarea
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('role') === 'combobox'
      if (isTyping) {
        if (e.key === 'Escape') {
          if (showShortcutHelp) {
            setShowShortcutHelp(false)
          } else if (searchInputRef.current) {
            searchInputRef.current.focus()
            searchInputRef.current.select()
          }
        }
        return
      }
      if (e.key === '/' && searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current.focus()
        searchInputRef.current.select()
      } else if (e.key === '?') {
        e.preventDefault()
        setShowShortcutHelp((v) => !v)
      } else if (e.key === 'Escape' && showShortcutHelp) {
        setShowShortcutHelp(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showShortcutHelp])

  // Sync form state to URL (no history spam — replace current entry).
  // Only update URL AFTER user interaction to avoid overwriting URL params that
  // hydrate may have just consumed. Track whether any of the form fields has been
  // touched by user input (set in the onChange handlers).
  const [userTouched, setUserTouched] = useState(false)
  useEffect(() => {
    if (!mounted || !userTouched) return
    const params = new URLSearchParams()
    if (group) params.set('g', group)
    if (quota) params.set('q', quota)
    if (rankInput) params.set('r', rankInput)
    const qs = params.toString()
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }, [group, quota, rankInput, mounted, userTouched])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const rank = parseInt(rankInput, 10)
    if (!rank || rank <= 0 || rank > 2_000_000) {
      setError('لطفاً یک رتبه معتبر وارد کنید (عدد مثبت).')
      return
    }
    await submitEstimate(group, quota, rank)
  }

  async function onDownloadHTML() {
    setDownloading(true)
    try {
      const params = new URLSearchParams()
      params.set('group', group)
      params.set('quota', quota)
      if (rankInput) params.set('rank', rankInput)
      const res = await fetch(`/api/download-html?${params.toString()}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'taghmin-reshte-qaboli.html'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        a.remove()
      }, 1000)
    } catch (err) {
      setError('دانلود فایل HTML ناموفق بود.')
    } finally {
      setDownloading(false)
    }
  }

  async function onShareLink() {
    const params = new URLSearchParams()
    if (group) params.set('g', group)
    if (quota) params.set('q', quota)
    if (rankInput) params.set('r', rankInput)
    params.set('auto', '1')
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setShareToast('لینک نتایج در کلیپ‌بورد کپی شد')
      setTimeout(() => setShareToast(''), 2500)
    } catch {
      setShareToast('لینک: ' + url)
      setTimeout(() => setShareToast(''), 4000)
    }
  }

  const isFav = useCallback(
    (key: string) => favs.some((f) => f.key === key),
    [favs]
  )

  const toggleFav = useCallback(
    (row: EstimatedRow, g: GroupKey, q: QuotaKey, rank: number) => {
      const key = rowKey(row, g, q)
      setFavs((prev) => {
        let next: FavItem[]
        if (prev.some((f) => f.key === key)) {
          next = prev.filter((f) => f.key !== key)
        } else {
          next = [
            ...prev,
            {
              key,
              major: row.major,
              university: row.university,
              city: row.city,
              universityType: row.universityType,
              cutoff: row.cutoff,
              chance: row.chance,
              group: g,
              quota: q,
              rank,
              savedAt: Date.now(),
            },
          ]
        }
        saveFavs(next)
        return next
      })
    },
    []
  )

  const clearFavs = useCallback(() => {
    setFavs([])
    saveFavs([])
  }, [])

  const removeHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id)
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    saveHistory([])
  }, [])

  const replayHistory = useCallback(
    (h: HistoryItem) => {
      setGroup(h.group)
      setQuota(h.quota)
      setRankInput(String(h.rank))
      setUserTouched(true)
      setShowHistory(false)
      setTimeout(() => submitEstimate(h.group, h.quota, h.rank), 50)
    },
    [submitEstimate]
  )

  const onPrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
      {/* Skip-to-content link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">پرش به محتوای اصلی</a>

      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-teal-500/15 dark:bg-teal-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute top-32 -left-40 w-[480px] h-[480px] rounded-full bg-teal-500/15 dark:bg-teal-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-20 right-1/3 w-[360px] h-[360px] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 print:hidden">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="anim-fade-in flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl blur-md opacity-60 animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30 overflow-hidden">
                <img src="/sunjob-logo.png" alt="سان‌جاب" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-base sm:text-lg">سان‌جاب</p>
              <p className="text-xs text-muted-foreground">کشف، تجربه، انتخاب</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFavs((v) => !v)}
              className="relative"
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  mounted && favs.length > 0 && 'fill-rose-500 text-rose-500'
                )}
              />
              <span className="hidden sm:inline me-1">علاقه‌مندی‌ها</span>
              {mounted && favs.length > 0 && (
                <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center">
                  {fa(favs.length)}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory((v) => !v)}
              className="relative"
              aria-label="تاریخچه جستجوها"
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline me-1">تاریخچه</span>
              {mounted && history.length > 0 && (
                <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 text-[10px] font-bold bg-teal-500 text-white rounded-full flex items-center justify-center">
                  {fa(history.length)}
                </span>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="تغییر تم"
                  suppressHydrationWarning
                  title={mounted ? `تم فعلی: ${theme === 'dark' ? 'تاریک' : theme === 'light' ? 'روشن' : 'سیستم'}` : 'تغییر تم'}
                >
                  {mounted ? (
                    theme === 'dark' ? (
                      <Moon className="w-4 h-4" />
                    ) : theme === 'light' ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs">انتخاب تم</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme('light')}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  <span className="flex-1">روشن</span>
                  {mounted && theme === 'light' && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('dark')}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  <span className="flex-1">تاریک</span>
                  {mounted && theme === 'dark' && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('system')}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="flex-1">سیستم</span>
                  {mounted && theme === 'system' && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              aria-label="راهنمای میانبرهای صفحه‌کلید"
              title="راهنمای میانبرها (?)"
              onClick={() => setShowShortcutHelp((v) => !v)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Navigation bar */}
        <div className="container mx-auto max-w-6xl px-4 pb-2 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActivePage('estimator')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activePage === 'estimator'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            <Calculator className="w-3.5 h-3.5 inline ml-1" />
            تخمین رتبه
          </button>
          <button
            onClick={() => setActivePage('catalog')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activePage === 'catalog'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            <ListChecks className="w-3.5 h-3.5 inline ml-1" />
            فهرست رشته‌محل‌ها
          </button>
          <button
            onClick={() => setActivePage('universities')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activePage === 'universities'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            <GraduationCap className="w-3.5 h-3.5 inline ml-1" />
            دانشگاه‌ها
          </button>
          <button
            onClick={() => setActivePage('majors')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activePage === 'majors'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            <MapPin className="w-3.5 h-3.5 inline ml-1" />
            رشته‌های دانشگاهی
          </button>
          <button
            onClick={() => setActivePage('guides')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activePage === 'guides'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            <BookOpen className="w-3.5 h-3.5 inline ml-1" />
            راهنماها
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-10 lg:pt-20 lg:pb-14">
        {/* Background blobs — sunjob style */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 right-10 w-[400px] h-[400px] rounded-full bg-[#0EA5A0]/12 blur-3xl" />
          <div className="absolute top-40 left-10 w-[350px] h-[350px] rounded-full bg-[#F7931E]/8 blur-3xl" />
        </div>
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="anim-fade-up">
            {/* Breadcrumb (crawlable, mirrors BreadcrumbList JSON-LD in page.tsx) */}
            <nav aria-label="مسیر صفحه" className="mb-5 text-xs font-semibold text-muted-foreground flex items-center justify-center flex-wrap gap-1.5">
              <a href={`${SITE}/`} className="hover:text-primary">خانه</a>
              <span aria-hidden="true">/</span>
              <a href={`${SITE}/taraz-estimator/`} className="hover:text-primary">ابزارهای انتخاب رشته</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-foreground/80">تخمین رشته‌محل قبولی</span>
            </nav>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5A0]/10 text-[#0EA5A0] text-xs font-bold mb-4">
              ۱۰۰٪ رایگان
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2744] leading-tight mb-4 dark:text-foreground">
              تخمین رشته‌محل قبولی کنکور ۱۴۰۵
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-5 leading-8">
              گروه آزمایشی، سهمیه و رتبه خود را وارد کنید تا فهرست رشته‌محل‌های قابل قبولی‌تان را در سه دسته
              خوش‌بینانه، منطقی و بدبینانه ببینید.
            </p>
            <ul className="text-sm text-muted-foreground max-w-2xl mx-auto space-y-1.5 mb-6 text-right inline-block">
              <li className="flex items-center gap-2"><span className="text-[#0EA5A0]">✓</span> همه رشته‌محل‌ها را یکجا ببینید و در آن‌ها جستوجو کنید.</li>
              <li className="flex items-center gap-2"><span className="text-[#0EA5A0]">✓</span> فهرستی متناسب با علاقه و شرایط خودتان بسازید.</li>
              <li className="flex items-center gap-2"><span className="text-[#0EA5A0]">✓</span> ترتیب انتخاب‌ها را خودتان تعیین کنید و فهرست را در سامانه ثبت کنید.</li>
            </ul>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Button
                onClick={() => {
                  setActivePage('estimator')
                  setTimeout(() => document.getElementById('rankInput')?.focus(), 100)
                }}
                className="bg-[#0EA5A0] hover:bg-[#0EA5A0]/90 text-white px-6 h-11"
              >
                شروع انتخاب رشته
              </Button>
              <Button
                variant="outline"
                onClick={() => setActivePage('catalog')}
                className="border-[#0EA5A0]/30 text-[#0EA5A0] hover:bg-[#0EA5A0]/5 px-6 h-11"
              >
                مشاهده رشته‌محل‌ها
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              بدون ثبت‌نام و فقط با وارد کردن رتبه خود شروع کنید.
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/40 bg-[#F3F0ED]/30 dark:bg-muted/20 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-center text-base font-bold text-[#1A2744] mb-2 dark:text-foreground">
            رشته‌محل‌های دفترچه‌های رسمی را یکجا جستوجو کنید
          </h2>
          <p className="text-center text-xs text-muted-foreground mb-6 max-w-xl mx-auto">
            سان‌جاب اطلاعات دفترچه‌های رسمی پذیرش ۱۴۰۵ را یکجا گردآوری کرده است تا بتوانید همه گزینه‌هایتان را کنار هم ببینید و با هم مقایسه کنید.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0EA5A0]">{faFmt(appData.catalogCount)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">رشته‌محل قابل جستوجو</div>
            </div>
            <div className="text-center border-x border-border/40">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0EA5A0]">{faFmt(appData.universitiesCount)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">دانشگاه و مرکز آموزش عالی</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0EA5A0]">{faFmt(appData.majorsCount)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">رشته تحصیلی</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular majors */}
      <section className="py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-center text-base font-bold text-[#1A2744] mb-2 dark:text-foreground">
            پرطرفدارترین رشته‌ها و دانشگاه‌ها در هر گروه آزمایشی
          </h2>
          <p className="text-center text-xs text-muted-foreground mb-6 max-w-xl mx-auto">
            بیشترین تقاضا برای رشته‌محل‌های هر گروه آزمایشی بر اساس داده‌های پذیرش سال‌های گذشته.
          </p>
          <div className="flex items-center justify-center gap-1 mb-6 flex-wrap">
            {groupsMeta.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveGroupTab(g.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  activeGroupTab === g.key
                    ? 'bg-[#0EA5A0] text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            {(appData.popular[activeGroupTab] ?? []).map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/40 hover:border-[#0EA5A0]/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-[#1A2744] dark:text-foreground">{item.university}</span>
                    <span className="text-muted-foreground">— {item.major}</span>
                  </div>
                </div>
                <div className="shrink-0 text-left">
                  <span className="text-sm font-bold text-[#0EA5A0]">{fa(item.percent)}٪</span>
                  <span className="text-[10px] text-muted-foreground ms-1">از متقاضیان</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Know before you choose */}
      <section className="py-10 bg-[#F3F0ED]/30 dark:bg-muted/20">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-center text-base font-bold text-[#1A2744] mb-2 dark:text-foreground">
            رشته‌ها و دانشگاه‌ها را پیش از انتخاب بشناسید
          </h2>
          <p className="text-center text-xs text-muted-foreground mb-6">
            پیش از تصمیم‌گیری، معرفی رشته‌ها، اطلاعات دانشگاه‌ها و راهنماهای انتخاب رشته را هم بخوانید.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A2744] mb-2 dark:text-foreground">رشته‌های دانشگاهی</h3>
              <p className="text-xs text-muted-foreground mb-3">معرفی {faFmt(appData.majorsCount)} رشته تحصیلی</p>
              <ul className="space-y-1.5">
                {appData.majorsTop.map((m, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setActivePage('majors')}
                      className="text-xs text-[#0EA5A0] hover:underline"
                    >
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setActivePage('majors')} className="text-xs text-[#0EA5A0] font-medium hover:underline mt-2">
                مشاهده همه رشته‌ها ←
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2744] mb-2 dark:text-foreground">دانشگاه‌ها</h3>
              <p className="text-xs text-muted-foreground mb-3">معرفی {faFmt(appData.universitiesCount)} دانشگاه و مرکز آموزشی</p>
              <ul className="space-y-1.5">
                {appData.universitiesTop.map((u, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setActivePage('universities')}
                      className="text-xs text-[#0EA5A0] hover:underline"
                    >
                      {u.name}
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setActivePage('universities')} className="text-xs text-[#0EA5A0] font-medium hover:underline mt-2">
                مشاهده همه دانشگاه‌ها ←
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A2744] mb-2 dark:text-foreground">راهنمای انتخاب رشته</h3>
              <p className="text-xs text-muted-foreground mb-3">راهنمای کامل انتخاب رشته</p>
              <ul className="space-y-1.5">
                <li><a href={`${SITE}/majors/`} className="text-xs text-[#0EA5A0] hover:underline">راهنمای رشته‌های دانشگاهی</a></li>
                <li><a href={`${SITE}/taraz-estimator/`} className="text-xs text-[#0EA5A0] hover:underline">تخمین رتبه و تراز کنکور</a></li>
                <li><a href={`${SITE}/taraz-estimator/calculator/`} className="text-xs text-[#0EA5A0] hover:underline">تبدیل تراز به رتبه</a></li>
                <li><a href={`${SITE}/articles/`} className="text-xs text-[#0EA5A0] hover:underline">مقالات راهنمای انتخاب رشته</a></li>
                <li><a href={`${SITE}/test/holland/`} className="text-xs text-[#0EA5A0] hover:underline">آزمون علاقه شغلی هولند</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-base font-bold text-[#1A2744] mb-2 dark:text-foreground">آماده‌اید فهرستتان را بسازید؟</h2>
          <p className="text-xs text-muted-foreground mb-4">رتبه خود را وارد کنید تا اولین فهرست پیشنهادی‌تان آماده شود.</p>
          <Button
            onClick={() => {
              setActivePage('estimator')
              setTimeout(() => document.getElementById('rankInput')?.focus(), 100)
            }}
            className="bg-[#0EA5A0] hover:bg-[#0EA5A0]/90 text-white px-6 h-11"
          >
            شروع انتخاب رشته
          </Button>
        </div>
      </section>

      <main id="main-content" className="container mx-auto max-w-6xl px-4 pb-24 flex-1 scroll-mt-20" tabIndex={-1}>
        {activePage === 'estimator' && (
        <>
        {/* Print-only header — shows the form context in printed/PDF output */}
        <div className="hidden print:block mb-4 pb-4 border-b-2 border-black">
          <h1 className="text-2xl font-bold">سان‌جاب — انتخاب رشته کنکور ۱۴۰۵</h1>
          <p className="text-sm mt-1">
            گروه: <strong>{groupsMeta.find((g) => g.key === group)?.label ?? group}</strong> — سهمیه:{' '}
            <strong>{quotasMeta.find((q) => q.key === quota)?.label ?? quota}</strong> — رتبه:{' '}
            <strong>{faFmt(parseInt(rankInput || '0', 10) || 0)}</strong>
          </p>
          <p className="text-xs mt-1 text-gray-600">تاریخ گزارش: {todayFa}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24 border-border/60 shadow-xl shadow-teal-500/5 backdrop-blur-sm bg-card/95 print:hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-500" />
                  مشخصات داوطلب
                </CardTitle>
                <CardDescription>
                  اطلاعات کارنامه خود را برای دریافت تخمین وارد کنید.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="groupSel" className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      رشته تحصیلی (گروه آزمایشی)
                    </Label>
                    <Select
                      key={`group-${mounted}`}
                      value={group}
                      onValueChange={(v) => { setGroup(v as GroupKey); setUserTouched(true) }}
                    >
                      <SelectTrigger id="groupSel" className="w-full">
                        <SelectValue placeholder="انتخاب گروه" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupsMeta.map((g) => (
                          <SelectItem key={g.key} value={g.key}>
                            <span className="inline-flex items-center gap-2">
                              <span>{g.emoji}</span>
                              <span>{g.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quotaSel" className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      سهمیه (منطقه)
                    </Label>
                    <Select
                      key={`quota-${mounted}`}
                      value={quota}
                      onValueChange={(v) => { setQuota(v as QuotaKey); setUserTouched(true) }}
                    >
                      <SelectTrigger id="quotaSel" className="w-full">
                        <SelectValue placeholder="انتخاب سهمیه" />
                      </SelectTrigger>
                      <SelectContent>
                        {quotasMeta.map((q) => (
                          <SelectItem key={q.key} value={q.key}>
                            <div className="flex flex-col">
                              <span className="font-medium">{q.label}</span>
                              <span className="text-xs text-muted-foreground">{q.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rankInput" className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      رتبه داوطلب در سهمیه
                    </Label>
                    <Input
                      id="rankInput"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="مثلاً ۱۲۰۰۰"
                      value={rankInput}
                      onChange={(e) => { setRankInput(e.target.value); setUserTouched(true) }}
                      className="font-mono text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      رتبه کل داوطلب در سهمیه انتخابی (کوچک‌تر بهتر است).
                    </p>
                  </div>

                  {/* Data-source disclaimer */}
                  <div className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 leading-6 text-amber-700 dark:text-amber-300">
                    {group === 'riazi' ? (
                      <>
                        <strong>داده واقعی:</strong> رتبه‌های قبولی گروه ریاضی از دفترچه پذیرش ۱۴۰۴ استخراج شده‌اند. برای سایر گروه‌ها و سهمیه‌های ویژه، دفترچه رسمی ۱۴۰۵ را بررسی کنید.
                      </>
                    ) : (
                      <>
                        <strong>تخمینی:</strong> رتبه‌های قبولی این گروه تخمینی هستند و صرفاً برای راهنمایی نمایش داده می‌شوند. پیش از انتخاب نهایی، حتماً دفترچه پذیرش ۱۴۰۴/۱۴۰۵ سازمان سنجش را ببینید.
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={loading} className="w-full h-11 text-base group">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          <Calculator className="w-5 h-5 transition-transform group-hover:rotate-12" />
                          {loading ? 'در حال محاسبه...' : 'مشاهده تخمین رشته قبولی'}
                        </span>
                      )}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        onClick={onDownloadHTML}
                        disabled={downloading}
                        variant="outline"
                        className="h-10 text-sm"
                      >
                        {downloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloading ? 'در حال آماده‌سازی...' : 'دانلود HTML'}
                      </Button>
                      <Button
                        type="button"
                        onClick={onShareLink}
                        variant="outline"
                        className="h-10 text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        اشتراک‌گذاری
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="anim-fade-in text-sm bg-destructive/10 border border-destructive/40 text-destructive rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                  {shareToast && (
                    <div className="anim-fade-in text-sm bg-teal-500/10 border border-teal-500/40 text-teal-600 dark:text-teal-400 rounded-lg px-3 py-2">
                      {shareToast}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result area */}
          <div ref={resultRef} className="lg:col-span-3 space-y-6 scroll-mt-24">
            {!result && !loading && (
              <div className="anim-fade-in">
                <EmptyState
                  onDownload={onDownloadHTML}
                  onQuickStart={(g, q, r) => {
                    setGroup(g)
                    setQuota(q)
                    setRankInput(String(r))
                    setUserTouched(true)
                    setTimeout(() => submitEstimate(g, q, r), 50)
                  }}
                />
              </div>
            )}
            {loading && <LoadingState />}
            {result && !loading && (
              <div className="anim-fade-up">
                <ResultView
                  key={`rv-${result.group}-${result.quota}-${result.rank}`}
                  result={result}
                  group={group}
                  quota={quota}
                  onToggleFav={toggleFav}
                  isFav={isFav}
                  searchInputRef={searchInputRef}
                  onPrint={onPrint}
                />
              </div>
            )}
          </div>
        </div>

        {/* Favorites panel */}
        {showFavs && (
          <section className="anim-fade-in mt-6">
            <FavsPanel favs={favs} onClear={clearFavs} onClose={() => setShowFavs(false)} />
          </section>
        )}

        {/* History panel */}
        {showHistory && (
          <section className="anim-fade-in mt-6">
            <HistoryPanel
              history={history}
              onReplay={replayHistory}
              onRemove={removeHistory}
              onClear={clearHistory}
              onClose={() => setShowHistory(false)}
            />
          </section>
        )}

        {/* Quick Access */}
        <section className="mt-12 grid md:grid-cols-3 gap-4 print:hidden">
          <Card onClick={() => setActivePage('catalog')} className="border-border/60 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-base">فهرست رشته‌محل‌ها</CardTitle>
              <CardDescription>جستجو، مقایسه و اولویت‌بندی</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                فهرست کامل رشته‌محل‌های کنکور سراسری ۱۴۰۵ را مرور کنید. با فیلتر گروه آزمایشی، سهمیه و دانشگاه رشته‌محل‌های مرتبط را ببینید و فهرست انتخاب رشته‌تان را آگاهانه بچینید.
              </p>
            </CardContent>
          </Card>
          <Card onClick={() => setActivePage('universities')} className="border-border/60 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-base">دانشگاه‌ها</CardTitle>
              <CardDescription>معرفی دانشگاه‌های سراسری</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                فهرست کامل دانشگاه‌های دولتی، آزاد، پیام نور، غیرانتفاعی، علمی کاربردی و فرهنگیان را مرور کنید. اطلاعات هر دانشگاه از جمله شهر، نوع و رشته‌های موجود را ببینید.
              </p>
            </CardContent>
          </Card>
          <Card onClick={() => setActivePage('majors')} className="border-border/60 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-base">رشته‌های دانشگاهی</CardTitle>
              <CardDescription>معرفی رشته‌های تحصیلی</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                معرفی کامل رشته‌های تحصیلی در ۵ گروه آزمایشی (ریاضی، تجربی، انسانی، هنر، زبان). برای هر رشته بازار کار، ادامه تحصیل و دانشگاه‌های دارای آن رشته را ببینید.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Guide */}
        <section className="mt-6 print:hidden">
          <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-card to-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-teal-500" />
                راهنمای انتخاب رشته
              </CardTitle>
              <CardDescription>نکات کلیدی برای انتخاب رشته آگاهانه</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs">۱</span>
                    <span>خودشناسی</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-6">
                    قبل از انتخاب رشته، علایق، استعدادها و ارزش‌های شخصی خود را بشناسید. تست‌های روان‌شناسی شغلی مانند هالند (RIASEC) می‌توانند کمک‌کننده باشند.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs">۲</span>
                    <span>آشنایی با مشاغل</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-6">
                    بازار کار، درآمد و آینده هر رشته را بررسی کنید. واقعیت‌های بازار کار ایران را در نظر بگیرید و از مشاوران متخصص کمک بگیرید.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">۳</span>
                    <span>انتخاب هوشمندانه</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-6">
                    انتخاب رشته را در سه دسته خوش‌بینانه (رویایی)، منطقی و بدبینانه (امن) قرار دهید. حداقل ۲۴ انتخاب در لیست خود داشته باشید.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Method explanation (crawlable, kept at the bottom per UX flow) */}
        <section className="mt-6 print:hidden">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">روش تخمین چگونه کار می‌کند؟</CardTitle>
              <CardDescription>خلاصه‌ای از روش تخمین رشته‌محل قبولی در سان‌جاب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground leading-8">
                <p>
                  این ابزار آخرین رتبه قبولی رشته‌محل‌های دفترچه‌های رسمی را مبنای محاسبه قرار می‌دهد. رتبه شما با
                  آخرین رتبه قبولی هر رشته‌محل (در گروه و سهمیه انتخابی شما) مقایسه می‌شود و بر اساس فاصله آن، یک
                  «درصد شانس» برآوردی ساخته می‌شود.
                </p>
                <p>
                  سپس رشته‌محل‌ها در سه دسته نمایش داده می‌شوند: «خوش‌بینانه» (انتخاب‌های رویایی با شانس پایین‌تر)،
                  «منطقی» (گزینه‌های نزدیک به شرایط شما) و «بدبینانه» (انتخاب‌های امن‌تر). نتیجه یک برآورد
                  احتمالی برای تصمیم‌گیری آگاهانه است، نه یک پیش‌بینی قطعی؛ رتبه نهایی فقط با کارنامه رسمی
                  مشخص می‌شود.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Info cards */}
        <section className="mt-6 grid md:grid-cols-3 gap-4 print:hidden">
          <Card className="border-border/60 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-teal-500" />
                ۵ گروه آزمایشی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                ریاضی، تجربی، انسانی، هنر و زبان. هر گروه شامل رشته‌محل‌های متناظر است.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500" />
                ۳ نوع سهمیه (منطقه)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                منطقه‌های ۱، ۲ و ۳ بر اساس بومی‌گزینی. سهمیه‌های ویژه (ایثارگران و…) را باید با کارنامه رسمی و دفترچه پذیرش ۱۴۰۴/۱۴۰۵ بررسی کنید.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-500" />
                ۶ نوع دانشگاه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                دولتی، آزاد، پیام نور، غیرانتفاعی، علمی کاربردی و فرهنگیان.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 print:hidden">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">سوالات متداول</CardTitle>
              <CardDescription>پاسخ به پرسش‌های رایج داوطلبان کنکور ۱۴۰۵</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="f1">
                  <AccordionTrigger className="text-right">
                    ۱) برای استفاده از نرم افزار چه اطلاعاتی لازم است؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    داوطلبان باید گروه آزمایشی، نوع سهمیه و رتبه خود در کنکور ۱۴۰۵ را وارد کنند.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="f2">
                  <AccordionTrigger className="text-right">
                    ۲) آیا تخمین ارائه شده بدون خطاست؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    تخمین بر اساس کارنامه سال گذشته طراحی شده است. نتیجه یک برآورد است، نه قطعیت نهایی؛
                    رتبه نهایی هر داوطلب فقط با کارنامه رسمی مشخص می‌شود.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="f3">
                  <AccordionTrigger className="text-right">
                    ۳) آیا فهرست رشته‌محل‌های قابل قبولی نمایش داده می‌شود؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    بله، نرم افزار شانس قبولی در رشته‌محل‌های مختلف را در سه دسته خوش‌بینانه، منطقی و بدبینانه
                    ارائه می‌کند.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="f4">
                  <AccordionTrigger className="text-right">
                    ۴) نسخه HTML قابل دانلود چیست؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    دکمه «دانلود HTML» یک فایل HTML مستقل تولید می‌کند که شامل تمام منطق و
                    داده‌ها است و پس از دانلود بدون نیاز به اینترنت و سرور، آفلاین کار می‌کند.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="f5">
                  <AccordionTrigger className="text-right">
                    ۵) آیا می‌توانم نتایج را با دیگران به اشتراک بگذارم؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    بله. دکمه «اشتراک‌گذاری» لینک نتایج شما (با وضعیت فعلی فرم) را در کلیپ‌بورد کپی می‌کند.
                    هر کس با باز کردن این لینک، همان فرم و نتایج را می‌بیند. همچنین می‌توانید با علامت قلب،
                    رشته‌محل‌های مورد علاقه را در «علاقه‌مندی‌ها» ذخیره کنید (داده‌ها در مرورگر شما نگه‌داری می‌شوند).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="f6">
                  <AccordionTrigger className="text-right">
                    ۶) چرا سهمیه ایثارگران در فرم نیست؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    در نسخه فعلی، داده واقعی قبولی ایثارگران (۵٪ و ۲۵٪) در دسترس نیست و نمایش عدد ساختگی
                    می‌توانست گمراه‌کننده باشد. بنابراین این سهمیه از فرم حذف شده است. برای سهمیه‌های ویژه،
                    کارنامه رسمی و دفترچه پذیرش ۱۴۰۴/۱۴۰۵ سازمان سنجش را ملاک قرار دهید.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="f7">
                  <AccordionTrigger className="text-right">
                    ۷) منبع داده‌ها چیست؟
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-7 text-sm">
                    رتبه‌های قبولی گروه ریاضی از دفترچه پذیرش ۱۴۰۴ استخراج شده‌اند (داده واقعی). سایر گروه‌ها
                    (تجربی، انسانی، هنر، زبان) بر اساس الگوی رقابتی کنکور تخمین زده شده‌اند و صرفاً راهنما هستند.
                    همیشه برای تصمیم نهایی به دفترچه رسمی ۱۴۰۵ مراجعه کنید.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Sunjob tools — integration with sunjob.ir tool family */}
        <section className="mt-6 print:hidden" aria-labelledby="sunjob-tools-title">
          <Card className="border-[#0EA5A0]/30 bg-gradient-to-br from-[#0EA5A0]/5 via-card to-card">
            <CardHeader>
              <CardTitle id="sunjob-tools-title" className="text-base">ابزارهای انتخاب رشته سان‌جاب</CardTitle>
              <CardDescription>در کنار این ابزار، این ابزارهای سان‌جاب هم می‌توانند کمک کنند:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                <a
                  href={`${SITE}/taraz-estimator/`}
                  className="group rounded-xl border border-border/60 bg-background/60 p-4 hover:border-[#0EA5A0]/40 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-bold group-hover:text-[#0EA5A0] transition-colors">تخمین رتبه و تراز</p>
                  <p className="text-xs text-muted-foreground leading-6 mt-1.5">
                    با نمرات سوابق تحصیلی و درصدهای کنکور، تراز و بازه احتمالی رتبه‌تان را ببینید.
                  </p>
                </a>
                <a
                  href={`${SITE}/taraz-estimator/calculator/`}
                  className="group rounded-xl border border-border/60 bg-background/60 p-4 hover:border-[#0EA5A0]/40 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-bold group-hover:text-[#0EA5A0] transition-colors">تبدیل تراز به رتبه</p>
                  <p className="text-xs text-muted-foreground leading-6 mt-1.5">
                    اگر ترازتان را دارید، از این ابزار برای برآورد بازه احتمالی رتبه استفاده کنید.
                  </p>
                </a>
                <a
                  href={`${SITE}/majors/`}
                  className="group rounded-xl border border-border/60 bg-background/60 p-4 hover:border-[#0EA5A0]/40 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-bold group-hover:text-[#0EA5A0] transition-colors">راهنمای رشته‌ها</p>
                  <p className="text-xs text-muted-foreground leading-6 mt-1.5">
                    معرفی کامل رشته‌ها، بازار کار و دانشگاه‌های هر رشته را مطالعه کنید.
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
        </>
        )}

        {activePage === 'catalog' && (
          <CatalogView />
        )}

        {activePage === 'universities' && (
          <UniversitiesView />
        )}

        {activePage === 'majors' && (
          <MajorsView />
        )}

        {activePage === 'guides' && (
          <GuidesView />
        )}
      </main>

      {/* Keyboard shortcut help dialog */}
      {showShortcutHelp && (
        <div
          className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowShortcutHelp(false)}
        >
          <div
            className="anim-scale-in bg-card border border-border/60 rounded-xl shadow-2xl max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="shortcut-help-title"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="shortcut-help-title" className="text-base font-bold flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-teal-500" />
                میانبرهای صفحه‌کلید
              </h3>
              <Button variant="ghost" size="icon" aria-label="بستن" onClick={() => setShowShortcutHelp(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">تمرکز روی جستجو</span>
                <kbd className="font-mono text-xs bg-muted/40 border border-border/60 rounded px-2 py-1">/</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">نمایش/پنهان این راهنما</span>
                <kbd className="font-mono text-xs bg-muted/40 border border-border/60 rounded px-2 py-1">?</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">بستن پنجره/بازگشت به جستجو</span>
                <kbd className="font-mono text-xs bg-muted/40 border border-border/60 rounded px-2 py-1">Esc</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">ارسال فرم تخمین</span>
                <kbd className="font-mono text-xs bg-muted/40 border border-border/60 rounded px-2 py-1">Enter</kbd>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-5">
              میانبرها فقط زمانی که در حال تایپ در یک فیلد متنی نیستید کار می‌کنند (به جز Esc که همیشه کار می‌کند).
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  onDownload,
  onQuickStart,
}: {
  onDownload: () => void
  onQuickStart: (g: GroupKey, q: QuotaKey, r: number) => void
}) {
  const examples: { g: GroupKey; q: QuotaKey; r: number; label: string; emoji: string; desc: string }[] = [
    { g: 'riazi', q: 'region1', r: 1500, label: 'ریاضی — منطقه ۱ — رتبه ۱۵۰۰', emoji: '📐', desc: 'رتبه متوسط رو به بالا' },
    { g: 'tajrobi', q: 'region3', r: 8000, label: 'تجربی — منطقه ۳ — رتبه ۸۰۰۰', emoji: '🔬', desc: 'منطقه روستایی' },
    { g: 'ensani', q: 'region2', r: 4000, label: 'انسانی — منطقه ۲ — رتبه ۴۰۰۰', emoji: '📜', desc: 'مراکز استان' },
    { g: 'honar', q: 'region1', r: 3000, label: 'هنر — منطقه ۱ — رتبه ۳۰۰۰', emoji: '🎨', desc: 'کلان‌شهرها' },
  ]
  return (
    <Card className="border-dashed border-2 border-border/60 bg-card/40">
      <CardContent className="py-14 text-center">
        <div className="anim-scale-in mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/15 to-teal-500/15 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-lg font-bold mb-2">هنوز تخمینی ساخته نشده</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-7">
          گروه آزمایشی، سهمیه و رتبه خود را وارد کنید و دکمه «مشاهده تخمین رشته قبولی» را بزنید.
          یا برای شروع سریع، یکی از نمونه‌های زیر را امتحان کنید:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 max-w-md mx-auto">
          {examples.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => onQuickStart(ex.g, ex.q, ex.r)}
              className="group flex items-center gap-2 p-3 rounded-lg border border-border/60 bg-background/50 hover:border-teal-500/40 hover:bg-teal-500/5 transition-all text-right"
              aria-label={`شروع سریع با ${ex.label}`}
            >
              <span className="text-xl shrink-0">{ex.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-5 group-hover:text-teal-500 transition-colors">
                  {ex.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{ex.desc}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground rotate-90 group-hover:text-teal-500 transition-all shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-5">
          <Button onClick={onDownload} variant="outline">
            <Download className="w-4 h-4" /> دانلود نسخه HTML
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg overflow-hidden relative bg-muted/30"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="py-4 space-y-3">
            <div className="h-6 w-44 rounded overflow-hidden relative bg-muted/30">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" style={{ animationDelay: `${i * 0.2}s` }} />
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  className="h-14 rounded-lg overflow-hidden relative bg-muted/30"
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                    style={{ animationDelay: `${(i * 3 + j) * 0.15}s` }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
