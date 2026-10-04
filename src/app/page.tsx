'use client'

import { useState, useRef, useEffect, useMemo, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  Calculator,
  Download,
  Sparkles,
  GraduationCap,
  MapPin,
  Award,
  Loader2,
  ListChecks,
  Gauge,
  TrendingUp,
  CheckCircle2,
  Scale,
  AlertTriangle,
  Moon,
  Sun,
  Github,
  Share2,
  Search,
  Filter,
  Heart,
  Star,
  X,
  LayoutGrid,
  List,
  RotateCcw,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  PieChart as PieIcon,
  ArrowUpDown,
  History,
  Printer,
  Keyboard,
  Trash2,
  Clock,
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  GROUPS,
  QUOTAS,
  UNIVERSITY_TYPE_LABEL,
  type GroupKey,
  type QuotaKey,
  type UniversityType,
  type EstimateResult,
  type EstimatedRow,
  toPersianDigits,
} from '@/lib/konkur-data'

interface ApiResponse {
  ok: boolean
  result?: EstimateResult
  error?: string
}

const fa = toPersianDigits
function faFmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return fa(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
}

const STORAGE_FAV_KEY = 'konkur-favorites'
const STORAGE_HISTORY_KEY = 'konkur-history'
const MAX_HISTORY = 8

type FavItem = {
  key: string
  major: string
  university: string
  city: string
  universityType: UniversityType
  cutoff: number
  chance: number
  group: GroupKey
  quota: QuotaKey
  rank: number
  savedAt: number
}

function rowKey(r: EstimatedRow, group: GroupKey, quota: QuotaKey): string {
  return `${group}:${quota}:${r.major}::${r.university}`
}

function loadFavs(): FavItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_FAV_KEY)
    return raw ? (JSON.parse(raw) as FavItem[]) : []
  } catch {
    return []
  }
}

function saveFavs(items: FavItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(items))
  } catch {}
}

type HistoryItem = {
  id: string          // unique key: group:quota:rank
  group: GroupKey
  quota: QuotaKey
  rank: number
  totalChoices: number
  reachableCount: number
  bestChance: number
  bestMajor: string
  savedAt: number
}

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryItem[]) : []
  } catch {
    return []
  }
}

function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(items))
  } catch {}
}

const UNI_TYPES_LIST = Object.keys(UNIVERSITY_TYPE_LABEL) as UniversityType[]

export default function Home() {
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
  const resultRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
    try {
      const params = new URLSearchParams(window.location.search)
      const g = params.get('g') as GroupKey | null
      const q = params.get('q') as QuotaKey | null
      const r = params.get('r')
      const auto = params.get('auto') === '1'
      if (g && GROUPS.some((x) => x.key === g)) setGroup(g)
      if (q && QUOTAS.some((x) => x.key === q)) setQuota(q)
      if (r && /^\d+$/.test(r)) setRankInput(r)
      if (auto && r) {
        // auto-submit if requested by URL
        setTimeout(() => submitEstimate(g || 'riazi', q || 'region1', parseInt(r, 10)), 300)
      }
    } catch {}
  }, [submitEstimate])

  // Keyboard shortcuts: "/" focuses search, "Esc" clears search
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
        if (e.key === 'Escape' && searchInputRef.current) {
          searchInputRef.current.focus()
          searchInputRef.current.select()
        }
        return
      }
      if (e.key === '/' && searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current.focus()
        searchInputRef.current.select()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
      setError('لطفاً یک رتبه معتبار وارد کنید (عدد مثبت).')
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

  const isDark = theme === 'dark'

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute top-32 -left-40 w-[480px] h-[480px] rounded-full bg-violet-500/15 dark:bg-violet-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-20 right-1/3 w-[360px] h-[360px] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '0.7s' }} />
      </div>

      <style>{`
        @keyframes pulseSlow {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.9; }
          50% { transform: scale(1.15) translate(20px, -10px); opacity: 1; }
        }
        .animate-pulse-slow { animation: pulseSlow 12s ease-in-out infinite; }
      `}</style>

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50 print:hidden">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-md opacity-60 animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-base sm:text-lg">تخمین رشته قبولی با رتبه</p>
              <p className="text-xs text-muted-foreground">کنکور سراسری ۱۴۰۵ — نسخه قابل دانلود</p>
            </div>
          </motion.div>
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
                <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 text-[10px] font-bold bg-emerald-500 text-white rounded-full flex items-center justify-center">
                  {fa(history.length)}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="تغییر تم"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              suppressHydrationWarning
            >
              {mounted ? (
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto max-w-6xl px-4 pt-10 pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-3 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
            >
              <Sparkles className="w-3.5 h-3.5 me-1.5" /> نرم افزار رایگان تخمین رشته قبولی
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-500 via-teal-500 to-violet-500 bg-clip-text text-transparent leading-tight">
              تخمین رشته قبولی با رتبه کنکور ۱۴۰۵
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-8">
              گروه آزمایشی، سهمیه و رتبه خود را وارد کنید تا فهرستی از رشته‌محل‌های پیشنهادی را در سه دسته{' '}
              <span className="text-emerald-500 font-semibold">خوش‌بینانه</span>،{' '}
              <span className="text-amber-500 font-semibold">منطقی</span> و{' '}
              <span className="text-rose-500 font-semibold">بدبینانه</span> مشاهده کنید.
              داده‌ها بر اساس کارنامه قبولی سال گذشته و با خطای تخمینی کمتر از ۵٪ تنظیم شده‌اند.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 pb-24 flex-1">
        {/* Print-only header — shows the form context in printed/PDF output */}
        <div className="hidden print:block mb-4 pb-4 border-b-2 border-black">
          <h1 className="text-2xl font-bold">تخمین رشته قبولی با رتبه کنکور ۱۴۰۵</h1>
          <p className="text-sm mt-1">
            گروه: <strong>{GROUPS.find((g) => g.key === group)?.label ?? group}</strong> — سهمیه:{' '}
            <strong>{QUOTAS.find((q) => q.key === quota)?.label ?? quota}</strong> — رتبه:{' '}
            <strong>{faFmt(parseInt(rankInput || '0', 10) || 0)}</strong>
          </p>
          <p className="text-xs mt-1 text-gray-600">تاریخ گزارش: {new Date().toLocaleDateString('fa-IR')}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24 border-border/60 shadow-xl shadow-emerald-500/5 backdrop-blur-sm bg-card/95 print:hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-500" />
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
                        {GROUPS.map((g) => (
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
                        {QUOTAS.map((q) => (
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

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={loading} className="w-full h-11 text-base group">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2"
                        >
                          <Calculator className="w-5 h-5 transition-transform group-hover:rotate-12" />
                          {loading ? 'در حال محاسبه...' : 'مشاهده تخمین رشته قبولی'}
                        </motion.span>
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
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm bg-destructive/10 border border-destructive/40 text-destructive rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.div>
                  )}
                  {shareToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-lg px-3 py-2"
                    >
                      {shareToast}
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result area */}
          <div ref={resultRef} className="lg:col-span-3 space-y-6 scroll-mt-24">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState onDownload={onDownloadHTML} />
                </motion.div>
              )}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingState />
                </motion.div>
              )}
              {result && !loading && (
                <motion.div
                  key={result ? `r-${result.group}-${result.quota}-${result.rank}` : 'r'}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                >
                  <ResultView
                    key={result ? `rv-${result.group}-${result.quota}-${result.rank}` : 'rv'}
                    result={result}
                    group={group}
                    quota={quota}
                    onToggleFav={toggleFav}
                    isFav={isFav}
                    searchInputRef={searchInputRef}
                    onPrint={onPrint}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Favorites panel */}
        <AnimatePresence>
          {showFavs && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <FavsPanel favs={favs} onClear={clearFavs} onClose={() => setShowFavs(false)} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* History panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <HistoryPanel
                history={history}
                onReplay={replayHistory}
                onRemove={removeHistory}
                onClear={clearHistory}
                onClose={() => setShowHistory(false)}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Info & FAQ */}
        <section className="mt-12 grid md:grid-cols-3 gap-4 print:hidden">
          <Card className="border-border/60 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                ۵ گروه آزمایشی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                ریاضی، تجربی، انسانی، هنر و زبان. هر گروه شامل رشته‌محل‌های متناظر است.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                ۵ نوع سهمیه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-7">
                منطقه‌های ۱، ۲ و ۳ و همچنین سهمیه‌های ایثارگران ۵٪ و ۲۵٪.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-500" />
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
                    تخمین بر اساس کارنامه سال گذشته طراحی شده و خطای نرم افزار تقریباً کمتر از ۵٪ است.
                    این عدد یک تخمین است نه قطعیت نهایی.
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
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function EmptyState({ onDownload }: { onDownload: () => void }) {
  return (
    <Card className="border-dashed border-2 border-border/60 bg-card/40">
      <CardContent className="py-14 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center mb-4"
        >
          <Sparkles className="w-8 h-8 text-emerald-500" />
        </motion.div>
        <h3 className="text-lg font-bold mb-2">هنوز تخمینی ساخته نشده</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-7">
          گروه آزمایشی، سهمیه و رتبه خود را وارد کنید و دکمه «مشاهده تخمین رشته قبولی» را بزنید.
          همچنین می‌توانید همین نرم افزار را به‌صورت یک فایل HTML مستقل دانلود کنید.
        </p>
        <Button onClick={onDownload} variant="outline" className="mt-5">
          <Download className="w-4 h-4" /> دانلود نسخه HTML
        </Button>
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
              <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="py-4 space-y-3">
            <div className="h-6 w-44 bg-muted/40 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-14 bg-muted/30 animate-pulse rounded-lg" />
              <div className="h-14 bg-muted/30 animate-pulse rounded-lg" />
              <div className="h-14 bg-muted/30 animate-pulse rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ResultView({
  result,
  group,
  quota,
  onToggleFav,
  isFav,
  searchInputRef,
  onPrint,
}: {
  result: EstimateResult
  group: GroupKey
  quota: QuotaKey
  onToggleFav: (row: EstimatedRow, g: GroupKey, q: QuotaKey, rank: number) => void
  isFav: (key: string) => boolean
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onPrint: () => void
}) {
  const groupInfo = GROUPS.find((g) => g.key === group) ?? GROUPS[0]
  const quotaInfo = QUOTAS.find((q) => q.key === quota) ?? QUOTAS[0]
  const best = result.summary.bestChance

  // Filter/search state
  const [search, setSearch] = useState('')
  const [uniTypeFilter, setUniTypeFilter] = useState<Set<UniversityType>>(new Set())
  const [minChance, setMinChance] = useState(0)
  const [view, setView] = useState<'tabs' | 'all' | 'chart'>('tabs')
  const [sortBy, setSortBy] = useState<'chance' | 'cutoff-asc' | 'cutoff-desc' | 'major' | 'university'>('chance')

  // Combined filtered list
  const allRows = useMemo(() => {
    return [...result.optimistic, ...result.realistic, ...result.pessimistic]
  }, [result])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = allRows.filter((r) => {
      if (uniTypeFilter.size > 0 && !uniTypeFilter.has(r.universityType)) return false
      if (r.chance < minChance) return false
      if (q) {
        const hay = (r.major + ' ' + r.university + ' ' + (r.city || '')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    // Apply sort
    const sorted = [...filtered]
    switch (sortBy) {
      case 'chance':
        sorted.sort((a, b) => b.chance - a.chance)
        break
      case 'cutoff-asc':
        sorted.sort((a, b) => a.cutoff - b.cutoff) // smaller cutoff = harder to get in
        break
      case 'cutoff-desc':
        sorted.sort((a, b) => b.cutoff - a.cutoff)
        break
      case 'major':
        sorted.sort((a, b) => a.major.localeCompare(b.major, 'fa'))
        break
      case 'university':
        sorted.sort((a, b) => a.university.localeCompare(b.university, 'fa'))
        break
    }
    return sorted
  }, [allRows, search, uniTypeFilter, minChance, sortBy])

  const bucketCount = (rows: EstimatedRow[], bucket: 'optimistic' | 'realistic' | 'pessimistic') =>
    rows.filter((r) => r.bucket === bucket).length

  // Chart data
  const chartData = useMemo(() => {
    const bins = [
      { name: '۹۰-۹۹٪', min: 90, max: 100, color: '#10b981' },
      { name: '۷۰-۸۹٪', min: 70, max: 89, color: '#22c55e' },
      { name: '۵۰-۶۹٪', min: 50, max: 69, color: '#eab308' },
      { name: '۳۰-۴۹٪', min: 30, max: 49, color: '#f97316' },
      { name: '۱۰-۲۹٪', min: 10, max: 29, color: '#ef4444' },
      { name: '۰-۹٪', min: 0, max: 9, color: '#dc2626' },
    ]
    return bins.map((b) => ({
      name: b.name,
      تعداد: allRows.filter((r) => r.chance >= b.min && r.chance <= b.max).length,
      color: b.color,
    }))
  }, [allRows])

  const pieData = [
    { name: 'خوش‌بینانه', value: result.optimistic.length, color: '#10b981' },
    { name: 'منطقی', value: result.realistic.length, color: '#f59e0b' },
    { name: 'بدبینانه', value: result.pessimistic.length, color: '#ef4444' },
  ]

  const toggleUniType = (t: UniversityType) => {
    setUniTypeFilter((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <motion.span
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-2xl"
              >
                {groupInfo.emoji}
              </motion.span>
              <div>
                <CardTitle className="text-base">
                  {groupInfo.label} — {quotaInfo.label}
                </CardTitle>
                <CardDescription className="text-xs">
                  رتبه شما: <span className="font-mono font-bold text-foreground">{faFmt(result.rank)}</span>
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono">
              <Gauge className="w-3.5 h-3.5 me-1.5" />
              {faFmt(result.totalChoices)} رشته‌محل
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Stat
              icon={<ListChecks className="w-4 h-4" />}
              value={faFmt(result.summary.reachableCount)}
              label="انتخاب در دسترس"
              color="text-emerald-500"
              delay={0}
            />
            <Stat
              icon={<TrendingUp className="w-4 h-4" />}
              value={result.summary.medianRank ? faFmt(result.summary.medianRank) : '—'}
              label="میانه رتبه قبولی"
              color="text-amber-500"
              delay={0.05}
            />
            <Stat
              icon={<Award className="w-4 h-4" />}
              value={best ? `${fa(best.chance)}٪` : '—'}
              label="بیشترین شانس"
              color="text-violet-500"
              delay={0.1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter bar */}
      <Card className="border-border/60 print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی رشته، دانشگاه یا شهر..."
                aria-label="جستجوی رشته، دانشگاه یا شهر"
                className="pr-9 pl-9 h-9"
              />
              {!search && (
                <kbd
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 pointer-events-none select-none bg-background/40"
                  aria-hidden="true"
                >
                  /
                </kbd>
              )}
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="پاک کردن جستجو"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9" aria-label="فیلتر بر اساس نوع دانشگاه">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">نوع دانشگاه</span>
                  {uniTypeFilter.size > 0 && (
                    <Badge variant="secondary" className="me-1 ms-1 text-[10px] px-1.5 py-0">
                      {fa(uniTypeFilter.size)}
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">نوع دانشگاه</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {UNI_TYPES_LIST.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t}
                    checked={uniTypeFilter.has(t)}
                    onCheckedChange={() => toggleUniType(t)}
                    className="text-sm"
                  >
                    {UNIVERSITY_TYPE_LABEL[t]}
                  </DropdownMenuCheckboxItem>
                ))}
                {uniTypeFilter.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <button
                      onClick={() => setUniTypeFilter(new Set())}
                      className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 text-right"
                    >
                      پاک کردن فیلتر
                    </button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 px-2 h-9 border border-border/60 rounded-md bg-background/50">
              <span className="text-xs text-muted-foreground whitespace-nowrap">حداقل شانس:</span>
              <input
                type="range"
                min={0}
                max={99}
                step={1}
                value={minChance}
                onChange={(e) => setMinChance(Number(e.target.value))}
                aria-label="حداقل درصد شانس قبولی"
                aria-valuetext={`حداقل شانس: ${fa(minChance)} درصد`}
                className="w-20 accent-emerald-500"
              />
              <span className="text-xs font-mono font-bold w-7 text-center text-emerald-500">
                {fa(minChance)}
              </span>
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger
                aria-label="مرتب‌سازی نتایج"
                className="h-9 w-[140px] sm:w-[160px] text-xs"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground ms-1" />
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chance">بیشترین شانس قبولی</SelectItem>
                <SelectItem value="cutoff-asc">سخت‌ترین ورود (رتبه کمتر)</SelectItem>
                <SelectItem value="cutoff-desc">آسان‌ترین ورود (رتبه بیشتر)</SelectItem>
                <SelectItem value="major">نام رشته (الفبا)</SelectItem>
                <SelectItem value="university">نام دانشگاه (الفبا)</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="h-9 px-2"
              aria-label="چاپ / ذخیره PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline ms-1">چاپ</span>
            </Button>

            <div className="flex items-center gap-1 ms-auto print:hidden">
              <Button
                variant={view === 'tabs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('tabs')}
                className="h-9 px-2"
                aria-label="نمای تب"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('all')}
                className="h-9 px-2"
                aria-label="نمای لیست"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('chart')}
                className="h-9 px-2"
                aria-label="نمای نمودار"
              >
                <PieIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {(search || uniTypeFilter.size > 0 || minChance > 0) && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <span>
                نمایش <span className="font-bold text-foreground">{fa(filteredRows.length)}</span> مورد از{' '}
                <span className="font-bold">{fa(allRows.length)}</span> رشته‌محل
              </span>
              <button
                onClick={() => {
                  setSearch('')
                  setUniTypeFilter(new Set())
                  setMinChance(0)
                }}
                className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> پاک کردن همه
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View content */}
      {view === 'tabs' && (
        <Tabs defaultValue="optimistic" className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-auto">
            <TabsTrigger value="optimistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-emerald-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> خوش‌بینانه
              </span>
              <span className="text-[11px] text-muted-foreground">({fa(bucketCount(filteredRows, 'optimistic'))})</span>
            </TabsTrigger>
            <TabsTrigger value="realistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-amber-500">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> منطقی
              </span>
              <span className="text-[11px] text-muted-foreground">({fa(bucketCount(filteredRows, 'realistic'))})</span>
            </TabsTrigger>
            <TabsTrigger value="pessimistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-rose-500">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> بدبینانه
              </span>
              <span className="text-[11px] text-muted-foreground">({fa(bucketCount(filteredRows, 'pessimistic'))})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimistic" className="mt-3">
            <BucketList
              rows={filteredRows.filter((r) => r.bucket === 'optimistic')}
              tone="emerald"
              emptyText="موردی در دسته خوش‌بینانه یافت نشد."
              onToggleFav={(r) => onToggleFav(r, group, quota, result.rank)}
              isFav={(r) => isFav(rowKey(r, group, quota))}
            />
          </TabsContent>
          <TabsContent value="realistic" className="mt-3">
            <BucketList
              rows={filteredRows.filter((r) => r.bucket === 'realistic')}
              tone="amber"
              emptyText="موردی در دسته منطقی یافت نشد."
              onToggleFav={(r) => onToggleFav(r, group, quota, result.rank)}
              isFav={(r) => isFav(rowKey(r, group, quota))}
            />
          </TabsContent>
          <TabsContent value="pessimistic" className="mt-3">
            <BucketList
              rows={filteredRows.filter((r) => r.bucket === 'pessimistic')}
              tone="rose"
              emptyText="موردی در دسته بدبینانه یافت نشد."
              onToggleFav={(r) => onToggleFav(r, group, quota, result.rank)}
              isFav={(r) => isFav(rowKey(r, group, quota))}
            />
          </TabsContent>
        </Tabs>
      )}

      {view === 'all' && (
        <BucketList
          rows={filteredRows}
          tone="emerald"
          emptyText="موردی با فیلتر فعلی یافت نشد."
          onToggleFav={(r) => onToggleFav(r, group, quota, result.rank)}
          isFav={(r) => isFav(rowKey(r, group, quota))}
          showBucketBadge
        />
      )}

      {view === 'chart' && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-500" />
              تحلیل توزیع شانس قبولی
            </CardTitle>
            <CardDescription>
              توزیع شانس قبولی شما در {fa(allRows.length)} رشته‌محل — کمک به درک کلی وضعیت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-2 text-center">توزیع درصد شانس قبولی</p>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fontFamily: 'inherit' }}
                        stroke="currentColor"
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="currentColor"
                        className="text-muted-foreground"
                        allowDecimals={false}
                      />
                      <RTooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          background: 'rgba(20,30,55,0.95)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          color: 'var(--foreground)',
                          fontSize: 12,
                          fontFamily: 'inherit',
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                      <Bar dataKey="تعداد" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 text-center">سهم هر دسته</p>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} stroke="var(--background)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RTooltip
                        contentStyle={{
                          background: 'rgba(20,30,55,0.95)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          color: 'var(--foreground)',
                          fontSize: 12,
                          fontFamily: 'inherit',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  {pieData.map((p) => (
                    <div key={p.name} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded" style={{ background: p.color }} />
                      <span className="flex-1">{p.name}</span>
                      <span className="font-mono font-bold">{fa(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
  color,
  delay = 0,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-lg border border-border/60 bg-background/60 p-3 text-center"
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
      </div>
      <div className={cn('text-lg font-bold leading-tight', color)}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  )
}

function BucketList({
  rows,
  tone,
  emptyText,
  onToggleFav,
  isFav,
  showBucketBadge = false,
}: {
  rows: EstimatedRow[]
  tone: 'emerald' | 'amber' | 'rose'
  emptyText: string
  onToggleFav: (r: EstimatedRow) => void
  isFav: (r: EstimatedRow) => boolean
  showBucketBadge?: boolean
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'from-emerald-500/15'
      : tone === 'amber'
        ? 'from-amber-500/15'
        : 'from-rose-500/15'
  if (rows.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border/60 bg-card/40">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border-border/60">
      <CardContent className="p-0 max-h-[640px] overflow-y-auto custom-scroll">
        {rows.map((r, i) => (
          <RowItem
            key={`${r.major}-${r.university}-${i}`}
            row={r}
            gradientClass={toneClasses}
            onToggleFav={onToggleFav}
            isFav={isFav}
            showBucketBadge={showBucketBadge}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function RowItem({
  row,
  gradientClass,
  onToggleFav,
  isFav,
  showBucketBadge,
}: {
  row: EstimatedRow
  gradientClass: string
  onToggleFav: (r: EstimatedRow) => void
  isFav: (r: EstimatedRow) => boolean
  showBucketBadge?: boolean
}) {
  const chance = row.chance
  const chanceColor =
    chance >= 70 ? 'text-emerald-500' : chance >= 40 ? 'text-amber-500' : 'text-rose-500'
  const chanceGradient =
    chance >= 70
      ? 'from-emerald-500 to-teal-400'
      : chance >= 40
        ? 'from-amber-500 to-amber-400'
        : 'from-rose-500 to-rose-400'
  const fav = isFav(row)
  const bucketLabel =
    row.bucket === 'optimistic'
      ? 'خوش‌بینانه'
      : row.bucket === 'realistic'
        ? 'منطقی'
        : 'بدبینانه'
  const bucketTone =
    row.bucket === 'optimistic'
      ? 'text-emerald-500 border-emerald-500/30'
      : row.bucket === 'realistic'
        ? 'text-amber-500 border-amber-500/30'
        : 'text-rose-500 border-rose-500/30'

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative p-4 border-b border-border/60 bg-gradient-to-l to-transparent hover:from-foreground/5 transition-colors',
        gradientClass
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <p className="font-bold text-sm sm:text-base leading-6 flex-1">{row.major}</p>
            <button
              type="button"
              onClick={() => onToggleFav(row)}
              aria-label={fav ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              className={cn(
                'shrink-0 p-1 rounded-md transition-colors',
                fav
                  ? 'text-rose-500 hover:bg-rose-500/10'
                  : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('w-4 h-4', fav && 'fill-rose-500')} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-6 mb-2">
            <span className="font-medium text-foreground/90">{row.university}</span>
            {row.city ? ` — ${row.city}` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              {UNIVERSITY_TYPE_LABEL[row.universityType]}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              آخرین رتبه قبولی: <span className="font-mono me-0.5">{faFmt(row.cutoff)}</span>
            </Badge>
            {row.rankDistance > 0 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-emerald-500 border-emerald-500/30">
                اختلاف شما با آخرین رتبه: {faFmt(Math.abs(row.rankDistance))} بهتر
              </Badge>
            )}
            {row.rankDistance < 0 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-rose-500 border-rose-500/30">
                اختلاف شما با آخرین رتبه: {faFmt(Math.abs(row.rankDistance))} بدتر
              </Badge>
            )}
            {showBucketBadge && (
              <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', bucketTone)}>
                {bucketLabel}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-left shrink-0">
          <div className={cn('text-2xl font-extrabold leading-none tabular-nums', chanceColor)}>
            {fa(chance)}٪
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">شانس قبولی</div>
        </div>
      </div>
      <div className="mt-3">
        <Progress
          value={chance}
          className={cn('h-1.5 bg-muted/60', `[&>div]:bg-gradient-to-l [&>div]:${chanceGradient}`)}
        />
      </div>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
      `}</style>
    </motion.div>
  )
}

function FavsPanel({
  favs,
  onClear,
  onClose,
}: {
  favs: FavItem[]
  onClear: () => void
  onClose: () => void
}) {
  const sorted = useMemo(() => [...favs].sort((a, b) => b.savedAt - a.savedAt), [favs])
  return (
    <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-card to-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <CardTitle className="text-base">علاقه‌مندی‌ها ({fa(favs.length)})</CardTitle>
              <CardDescription className="text-xs">
                رشته‌محل‌های ذخیره‌شده در این مرورگر
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {favs.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClear}>
                <RotateCcw className="w-3.5 h-3.5" /> پاک کردن همه
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" /> بستن
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            هنوز موردی به علاقه‌مندی‌ها اضافه نشده. با زدن قلب کنار هر رشته‌محل، آن را اینجا ذخیره کنید.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scroll -mx-2 px-2 space-y-2">
            {sorted.map((f) => (
              <div
                key={f.key}
                className="p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-6 mb-0.5">{f.major}</p>
                    <p className="text-xs text-muted-foreground leading-5 mb-1.5">
                      {f.university}{f.city ? ` — ${f.city}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {UNIVERSITY_TYPE_LABEL[f.universityType]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {GROUPS.find((g) => g.key === f.group)?.label} —{' '}
                        {QUOTAS.find((q) => q.key === f.quota)?.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        رتبه: <span className="font-mono">{faFmt(f.rank)}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div
                      className={cn(
                        'text-xl font-extrabold tabular-nums',
                        f.chance >= 70
                          ? 'text-emerald-500'
                          : f.chance >= 40
                            ? 'text-amber-500'
                            : 'text-rose-500'
                      )}
                    >
                      {fa(f.chance)}٪
                    </div>
                    <div className="text-[10px] text-muted-foreground">شانس</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function HistoryPanel({
  history,
  onReplay,
  onRemove,
  onClear,
  onClose,
}: {
  history: HistoryItem[]
  onReplay: (h: HistoryItem) => void
  onRemove: (id: string) => void
  onClear: () => void
  onClose: () => void
}) {
  // Already stored newest-first; no extra sort needed
  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-base">تاریخچه جستجوها ({fa(history.length)})</CardTitle>
              <CardDescription className="text-xs">
                آخرین {fa(MAX_HISTORY)} تخمین در این مرورگر
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClear}>
                <Trash2 className="w-3.5 h-3.5" /> پاک کردن همه
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" /> بستن
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            هنوز تخمینی ساخته نشده. بعد از ارسال فرم، نتیجه به‌صورت خودکار در اینجا ذخیره می‌شود.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scroll -mx-2 px-2 space-y-2">
            {history.map((h) => {
              const g = GROUPS.find((x) => x.key === h.group)
              const q = QUOTAS.find((x) => x.key === h.quota)
              return (
                <div
                  key={h.id}
                  className="p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-background/80 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onReplay(h)}
                      className="flex-1 min-w-0 text-right"
                      aria-label="باز اجرای این تخمین"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{g?.emoji}</span>
                        <p className="font-bold text-sm leading-6 flex-1 truncate group-hover:text-emerald-500 transition-colors">
                          {g?.label} — {q?.label}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          رتبه: <span className="font-mono">{faFmt(h.rank)}</span>
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {faFmt(h.totalChoices)} رشته‌محل
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-emerald-500 border-emerald-500/30">
                          {faFmt(h.reachableCount)} انتخاب در دسترس
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        بهترین: {h.bestMajor} — <span className="font-mono">{fa(h.bestChance)}٪</span>
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(h.id)}
                      aria-label="حذف این مورد از تاریخچه"
                      className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80 print:hidden">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <p className="text-sm font-semibold mb-1">تخمین رشته قبولی با رتبه کنکور ۱۴۰۵</p>
            <p className="text-xs text-muted-foreground leading-6">
              نرم افزار رایگان بر اساس کارنامه سال گذشته — خطای تخمینی کمتر از ۵٪.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://www.heyvagroup.com/shownews/5535/" target="_blank" rel="noopener noreferrer">
                <Share2 className="w-4 h-4 me-1.5" /> منبع اصلی
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <Github className="w-4 h-4 me-1.5" /> پروژه
            </Button>
          </div>
        </div>
        <Separator className="my-4" />
        <p className="text-xs text-muted-foreground text-center leading-6" suppressHydrationWarning>
          © {new Date().getFullYear()} — این نرم افزار یک بازسازی مستقل از روی نرم افزار «تخمین رشته قبولی با رتبه»
          سایت هیوا است و هیچ وابستگی رسمی به سازمان سنجش یا مؤسسه هیوا ندارد. داده‌ها الگویی و بر اساس
          رتبه‌های قبولی سال‌های گذشته تنظیم شده‌اند.
        </p>
      </div>
    </footer>
  )
}
