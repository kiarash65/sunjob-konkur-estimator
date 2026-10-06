'use client'

/**
 * ResultView — the whole post-estimate result area (summary, statistics,
 * filters, three buckets, all-rows view, charts, priority list, compare).
 *
 * Perf notes (behaviour unchanged):
 * - recharts (StatisticsCard, ResultCharts) and CompareView are loaded via
 *   next/dynamic so they never enter the initial bundle.
 * - framer-motion entrance animations were replaced with CSS animation
 *   utility classes (anim-fade-in / anim-fade-up / anim-scale-in).
 * All estimate/bucket/priority/export logic is untouched (DATA & LOGIC FREEZE).
 */
import { useMemo, useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Gauge,
  ListChecks,
  TrendingUp,
  Award,
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  PieChart as PieIcon,
  ArrowUpDown,
  Printer,
  FileSpreadsheet,
  FileJson,
  Wand2,
  Lightbulb,
  CheckCircle2,
  Scale,
  AlertTriangle,
  MapPin as MapPinIcon,
  GitCompare,
  Heart,
  Share2,
  Download,
} from 'lucide-react'
import {
  GROUPS,
  QUOTAS,
  UNIVERSITY_TYPE_LABEL,
  buildPriorityList,
  resultToCSV,
  resultToJSON,
  computeDetailedStats,
  type DetailedStats,
  type EstimateResult,
  type EstimatedRow,
  type GroupKey,
  type QuotaKey,
  type PriorityList,
  type UniversityType,
} from '@/lib/konkur-data'
import { fa, faFmt, rowKey, type ApiResponse } from '@/lib/konkur-shared'

// Heavy, results-only chunks — never part of the initial page bundle.
const StatisticsCard = dynamic(() => import('./StatisticsCard'), {
  ssr: false,
  loading: () => (
    <div className="h-[120px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />
  ),
})
const ResultCharts = dynamic(() => import('./ResultCharts'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />
  ),
})
const CompareView = dynamic(() => import('./CompareView'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />
  ),
})

const UNI_TYPES_LIST = Object.keys(UNIVERSITY_TYPE_LABEL) as UniversityType[]

export default function ResultView({
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
  const [cityFilter, setCityFilter] = useState<string>('') // '' = all cities
  const [view, setView] = useState<'tabs' | 'all' | 'chart' | 'priority' | 'compare'>('tabs')
  const [sortBy, setSortBy] = useState<'chance' | 'cutoff-asc' | 'cutoff-desc' | 'major' | 'university'>('chance')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [compareRank, setCompareRank] = useState<string>('')
  const [compareResult, setCompareResult] = useState<EstimateResult | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)

  // Combined filtered list (must be declared before availableCities which depends on it)
  const allRows = useMemo(() => {
    return [...result.optimistic, ...result.realistic, ...result.pessimistic]
  }, [result])

  // Compute list of unique cities for the city filter dropdown (only cities present in this result)
  const availableCities = useMemo(() => {
    const set = new Set<string>()
    allRows.forEach((r) => {
      if (r.city) set.add(r.city)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fa'))
  }, [allRows])

  // Recommended priority list (memoized on result change)
  const priorityList = useMemo(() => buildPriorityList(result), [result])

  // Detailed statistics (memoized on result change)
  const detailedStats = useMemo(() => computeDetailedStats(result), [result])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = allRows.filter((r) => {
      if (uniTypeFilter.size > 0 && !uniTypeFilter.has(r.universityType)) return false
      if (r.chance < minChance) return false
      if (cityFilter && r.city !== cityFilter) return false
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
  }, [allRows, search, uniTypeFilter, minChance, cityFilter, sortBy])

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

  function downloadBlob(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.remove()
    }, 1000)
  }

  function onExportCSV() {
    try {
      const csv = resultToCSV(result)
      const fname = `taghmin-${result.group}-${result.quota}-${result.rank}.csv`
      downloadBlob(csv, fname, 'text/csv;charset=utf-8')
      toast.success('فایل CSV دانلود شد', { description: fname, duration: 3000 })
    } catch {
      toast.error('دانلود CSV ناموفق بود')
    }
  }

  function onExportJSON() {
    try {
      const json = resultToJSON(result)
      const fname = `taghmin-${result.group}-${result.quota}-${result.rank}.json`
      downloadBlob(json, fname, 'application/json;charset=utf-8')
      toast.success('فایل JSON دانلود شد', { description: fname, duration: 3000 })
    } catch {
      toast.error('دانلود JSON ناموفق بود')
    }
  }

  function onCopyPriorityList() {
    try {
      const lines = priorityList.items.map(
        (p) =>
          `${p.priority}. ${p.major} — ${p.university} (${p.chance}٪ — ${
            p.strategy === 'safe' ? 'امن' : p.strategy === 'logical' ? 'منطقی' : 'شانس'
          })`
      )
      const text = `لیست پیشنهادی اولویت انتخاب رشته — ${groupInfo.label} / ${quotaInfo.label} / رتبه ${faFmt(result.rank)}\n\n${lines.join('\n')}`
      navigator.clipboard.writeText(text)
      toast.success('لیست اولویت در کلیپ‌بورد کپی شد', {
        description: `${fa(priorityList.items.length)} رشته‌محل`,
        duration: 3000,
      })
    } catch {
      toast.error('کپی ناموفق بود')
    }
  }

  function resetFilters() {
    setSearch('')
    setUniTypeFilter(new Set())
    setMinChance(0)
    setCityFilter('')
  }

  async function runCompare() {
    const r = parseInt(compareRank, 10)
    if (!r || r <= 0) {
      toast.error('رتبه مقایسه نامعتبر است')
      return
    }
    setCompareLoading(true)
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, quota, rank: r }),
      })
      const data: ApiResponse = await res.json()
      if (!data.ok || !data.result) {
        toast.error(data.error || 'خطا در مقایسه')
        setCompareResult(null)
      } else {
        setCompareResult(data.result)
        toast.success(`مقایسه با رتبه ${faFmt(r)} انجام شد`)
      }
    } catch {
      toast.error('ارتباط با سرور برقرار نشد')
      setCompareResult(null)
    } finally {
      setCompareLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-card to-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="anim-scale-in text-2xl">{groupInfo.emoji}</span>
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
              value={result.summary.reachableCount > 0 ? <CountUp target={result.summary.reachableCount} /> : '—'}
              label="انتخاب در دسترس"
              color="text-teal-500"
              delay={0}
            />
            <Stat
              icon={<TrendingUp className="w-4 h-4" />}
              value={result.summary.medianRank ? <CountUp target={result.summary.medianRank} /> : '—'}
              label="میانه رتبه قبولی"
              color="text-amber-500"
              delay={0.05}
            />
            <Stat
              icon={<Award className="w-4 h-4" />}
              value={best ? <><CountUp target={best.chance} />٪</> : '—'}
              label="بیشترین شانس"
              color="text-teal-500"
              delay={0.1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed statistics card */}
      <StatisticsCard stats={detailedStats} groupInfo={groupInfo} quotaInfo={quotaInfo} />

      {/* Filter bar */}
      <Card className="border-border/60 print:hidden">
        <CardContent className="p-4">
          {/* Mobile: collapsed filter trigger + actions row */}
          <div className="flex md:hidden items-center gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(true)}
              className="h-9 flex-1"
              aria-label="نمایش فیلترها"
            >
              <Filter className="w-4 h-4" />
              فیلترها
              {(search || uniTypeFilter.size > 0 || minChance > 0 || cityFilter) && (
                <Badge variant="secondary" className="me-1 ms-1 text-[10px] px-1.5 py-0">
                  {fa(
                    (search ? 1 : 0) + uniTypeFilter.size + (minChance > 0 ? 1 : 0) + (cityFilter ? 1 : 0)
                  )}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-2" aria-label="صدور خروجی">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">صدور خروجی نتایج</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportCSV} className="text-sm cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 ms-2" />
                  دانلود CSV (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON} className="text-sm cursor-pointer">
                  <FileJson className="w-4 h-4 ms-2" />
                  دانلود JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCopyPriorityList} className="text-sm cursor-pointer">
                  <Wand2 className="w-4 h-4 ms-2" />
                  کپی لیست اولویت پیشنهادی
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrint} className="text-sm cursor-pointer">
                  <Printer className="w-4 h-4 ms-2" />
                  چاپ / PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop: full filter bar */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
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

            {availableCities.length > 1 && (
              <Select value={cityFilter} onValueChange={(v) => setCityFilter(v === '__all__' ? '' : v)}>
                <SelectTrigger
                  aria-label="فیلتر بر اساس شهر"
                  className="h-9 w-[120px] sm:w-[140px] text-xs"
                >
                  <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground ms-1" />
                  <SelectValue placeholder="همه شهرها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">همه شهرها ({fa(allRows.length)})</SelectItem>
                  {availableCities.map((c) => {
                    const count = allRows.filter((r) => r.city === c).length
                    return (
                      <SelectItem key={c} value={c}>
                        {c} ({fa(count)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}

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
                className="w-20 accent-teal-500"
              />
              <span className="text-xs font-mono font-bold w-7 text-center text-teal-500">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
                  aria-label="صدور خروجی"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden lg:inline ms-1">خروجی</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">صدور خروجی نتایج</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportCSV} className="text-sm cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 ms-2" />
                  دانلود CSV (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON} className="text-sm cursor-pointer">
                  <FileJson className="w-4 h-4 ms-2" />
                  دانلود JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCopyPriorityList} className="text-sm cursor-pointer">
                  <Wand2 className="w-4 h-4 ms-2" />
                  کپی لیست اولویت پیشنهادی
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrint} className="text-sm cursor-pointer">
                  <Printer className="w-4 h-4 ms-2" />
                  چاپ / PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
              <Button
                variant={view === 'priority' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('priority')}
                className="h-9 px-2"
                aria-label="لیست اولویت پیشنهادی"
              >
                <Wand2 className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'compare' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('compare')}
                className="h-9 px-2"
                aria-label="مقایسه رتبه‌ها"
                title="مقایسه رتبه‌ها"
              >
                <GitCompare className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile: view switcher */}
          <div className="flex md:hidden items-center gap-1 mt-2">
            <Button
              variant={view === 'tabs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('tabs')}
              className="h-9 px-2 flex-1"
              aria-label="نمای تب"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('all')}
              className="h-9 px-2 flex-1"
              aria-label="نمای لیست"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('chart')}
              className="h-9 px-2 flex-1"
              aria-label="نمای نمودار"
            >
              <PieIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('priority')}
              className="h-9 px-2 flex-1"
              aria-label="لیست اولویت پیشنهادی"
            >
              <Wand2 className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'compare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('compare')}
              className="h-9 px-2 flex-1"
              aria-label="مقایسه رتبه‌ها"
            >
              <GitCompare className="w-4 h-4" />
            </Button>
          </div>

          {(search || uniTypeFilter.size > 0 || minChance > 0 || cityFilter) && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <span>
                نمایش <span className="font-bold text-foreground">{fa(filteredRows.length)}</span> مورد از{' '}
                <span className="font-bold">{fa(allRows.length)}</span> رشته‌محل
              </span>
              <button
                onClick={resetFilters}
                className="text-teal-500 hover:text-teal-400 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> پاک کردن همه
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile filter sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-right">فیلترها و مرتب‌سازی</SheetTitle>
            <SheetDescription className="text-right">
              جستجو، فیلتر نوع دانشگاه و مرتب‌سازی نتایج
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="m-search">جستجو</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="m-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="رشته، دانشگاه یا شهر..."
                  aria-label="جستجوی رشته، دانشگاه یا شهر"
                  className="pr-9 h-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>حداقل شانس: {fa(minChance)}٪</Label>
              <input
                type="range"
                min={0}
                max={99}
                step={1}
                value={minChance}
                onChange={(e) => setMinChance(Number(e.target.value))}
                aria-label="حداقل درصد شانس قبولی"
                className="w-full accent-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع دانشگاه</Label>
              <div className="grid grid-cols-2 gap-2">
                {UNI_TYPES_LIST.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleUniType(t)}
                    className={cn(
                      'text-xs px-3 py-2 rounded-md border transition-colors text-right',
                      uniTypeFilter.has(t)
                        ? 'bg-teal-500/15 border-teal-500/50 text-foreground'
                        : 'bg-background/50 border-border/60 text-muted-foreground'
                    )}
                  >
                    {UNIVERSITY_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            {availableCities.length > 1 && (
              <div className="space-y-2">
                <Label>شهر</Label>
                <Select value={cityFilter || '__all__'} onValueChange={(v) => setCityFilter(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-full" aria-label="فیلتر بر اساس شهر">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">همه شهرها ({fa(allRows.length)})</SelectItem>
                    {availableCities.map((c) => {
                      const count = allRows.filter((r) => r.city === c).length
                      return (
                        <SelectItem key={c} value={c}>
                          {c} ({fa(count)})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>مرتب‌سازی</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full" aria-label="مرتب‌سازی نتایج">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chance">بیشترین شانس قبولی</SelectItem>
                  <SelectItem value="cutoff-asc">سخت‌ترین ورود (رتبه کمتر)</SelectItem>
                  <SelectItem value="cutoff-desc">آسان‌ترین ورود (رتبه بیشتر)</SelectItem>
                  <SelectItem value="major">نام رشته (الفبا)</SelectItem>
                  <SelectItem value="university">نام دانشگاه (الفبا)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setMobileFiltersOpen(false)} className="flex-1">
                اعمال فیلترها
              </Button>
              {(search || uniTypeFilter.size > 0 || minChance > 0 || cityFilter) && (
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4" /> پاک کردن
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* View content */}
      {view === 'tabs' && (
        <Tabs defaultValue="optimistic" className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-auto">
            <TabsTrigger value="optimistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-teal-500">
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
              tone="teal"
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
          tone="teal"
          emptyText="موردی با فیلتر فعلی یافت نشد."
          onToggleFav={(r) => onToggleFav(r, group, quota, result.rank)}
          isFav={(r) => isFav(rowKey(r, group, quota))}
          showBucketBadge
        />
      )}

      {view === 'chart' && (
        <ResultCharts chartData={chartData} pieData={pieData} rowCount={allRows.length} />
      )}

      {view === 'priority' && (
        <PriorityListView
          priorityList={priorityList}
          groupInfo={groupInfo}
          quotaInfo={quotaInfo}
          rank={result.rank}
          onToggleFav={onToggleFav}
          isFav={isFav}
          group={group}
          quota={quota}
          onCopy={onCopyPriorityList}
        />
      )}

      {view === 'compare' && (
        <CompareView
          result={result}
          compareRank={compareRank}
          setCompareRank={setCompareRank}
          runCompare={runCompare}
          compareResult={compareResult}
          compareLoading={compareLoading}
          groupInfo={groupInfo}
          quotaInfo={quotaInfo}
        />
      )}
    </div>
  )
}

function PriorityListView({
  priorityList,
  groupInfo,
  quotaInfo,
  rank,
  onToggleFav,
  isFav,
  group,
  quota,
  onCopy,
}: {
  priorityList: PriorityList
  groupInfo: { key: GroupKey; label: string; emoji: string; color: string }
  quotaInfo: { key: QuotaKey; label: string; description: string }
  rank: number
  onToggleFav: (row: EstimatedRow, g: GroupKey, q: QuotaKey, rank: number) => void
  isFav: (key: string) => boolean
  group: GroupKey
  quota: QuotaKey
  onCopy: () => void
}) {
  const strategyMeta = {
    safe: {
      label: 'خوش‌بینانه (رویایی)',
      tone: 'teal',
      desc: '۸ انتخاب رویایی با شانس پایین — امیدوارانه در ابتدای لیست',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    logical: {
      label: 'منطقی',
      tone: 'amber',
      desc: '۸ رشته‌محل نزدیک به آخرین رتبه قبولی — قلب لیست انتخاب رشته',
      icon: <Scale className="w-4 h-4" />,
    },
    reach: {
      label: 'بدبینانه (امن)',
      tone: 'rose',
      desc: '۸ انتخاب امن با شانس بالا — قطعاً قبول می‌شوید، در انتهای لیست',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  } as const

  return (
    <div className="space-y-4">
      <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-card to-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">لیست پیشنهادی اولویت انتخاب رشته</CardTitle>
                <CardDescription className="text-xs">
                  {groupInfo.emoji} {groupInfo.label} — {quotaInfo.label} — رتبه{' '}
                  <span className="font-mono font-bold">{faFmt(rank)}</span>
                </CardDescription>
              </div>
            </div>
            <Button onClick={onCopy} variant="outline" size="sm">
              <Share2 className="w-3.5 h-3.5" />
              کپی لیست
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
            <Lightbulb className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-6">
              این لیست بر اساس استراتژی استاندارد <strong className="text-foreground">۳ دسته ۸ تایی</strong> پیشنهاد می‌شود:
              ۸ انتخاب امن، ۸ انتخاب منطقی و ۸ انتخاب شانس. مجموعاً{' '}
              <strong className="text-foreground">{fa(priorityList.items.length)} رشته‌محل</strong> — کافی برای
              پر کردن فرم انتخاب رشته. توجه: این یک پیشنهاد الگوریتمی است؛ ترجیحات شخصی خود را نیز لحاظ کنید.
            </p>
          </div>
        </CardContent>
      </Card>

      {(['safe', 'logical', 'reach'] as const).map((strategy) => {
        const meta = strategyMeta[strategy]
        const items = priorityList[strategy]
        if (items.length === 0) return null
        const toneClass =
          meta.tone === 'teal'
            ? 'border-teal-500/30 from-teal-500/5'
            : meta.tone === 'amber'
              ? 'border-amber-500/30 from-amber-500/5'
              : 'border-rose-500/30 from-rose-500/5'
        const textTone =
          meta.tone === 'teal'
            ? 'text-teal-500'
            : meta.tone === 'amber'
              ? 'text-amber-500'
              : 'text-rose-500'
        return (
          <Card key={strategy} className={cn('border bg-gradient-to-br to-card', toneClass)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={cn('p-1.5 rounded-lg bg-foreground/5', textTone)}>
                    {meta.icon}
                  </span>
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {meta.label}
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', textTone)}>
                        {fa(items.length)} مورد
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-[11px]">{meta.desc}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ol className="divide-y divide-border/60">
                {items.map((p) => (
                  <PriorityRow
                    key={`${p.major}-${p.university}-${p.priority}`}
                    item={p}
                    onToggleFav={(r) => onToggleFav(r, group, quota, rank)}
                    isFav={(r) => isFav(rowKey(r, group, quota))}
                    strategyTone={meta.tone}
                  />
                ))}
              </ol>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function PriorityRow({
  item,
  onToggleFav,
  isFav,
  strategyTone,
}: {
  item: PriorityList['items'][number]
  onToggleFav: (r: EstimatedRow) => void
  isFav: (r: EstimatedRow) => boolean
  strategyTone: 'teal' | 'amber' | 'rose'
}) {
  const chanceColor =
    item.chance >= 70 ? 'text-teal-500' : item.chance >= 40 ? 'text-amber-500' : 'text-rose-500'
  const chanceBg =
    strategyTone === 'teal'
      ? 'bg-teal-500/10 border-teal-500/30 text-teal-500'
      : strategyTone === 'amber'
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
        : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
  const fav = isFav(item)
  return (
    <li
      className="anim-fade-up flex items-start gap-3 p-3 hover:bg-foreground/[0.03] transition-colors"
      style={{ animationDelay: `${Math.min(item.priority * 0.02, 0.3)}s` }}
    >
      <div
        className={cn(
          'shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center font-mono font-bold tabular-nums text-sm',
          chanceBg
        )}
      >
        {fa(item.priority)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-6 mb-0.5 truncate">{item.major}</p>
            <p className="text-xs text-muted-foreground leading-5 truncate">
              {item.university}
              {item.city ? ` — ${item.city}` : ''}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {UNIVERSITY_TYPE_LABEL[item.universityType]}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                آخرین رتبه: <span className="font-mono">{faFmt(item.cutoff)}</span>
              </Badge>
            </div>
          </div>
          <div className="text-left shrink-0 flex flex-col items-end gap-1">
            <div className={cn('text-lg font-extrabold tabular-nums leading-none', chanceColor)}>
              {fa(item.chance)}٪
            </div>
            <button
              type="button"
              onClick={() => onToggleFav(item)}
              aria-label={fav ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              className={cn(
                'p-1 rounded-md transition-colors',
                fav
                  ? 'text-rose-500 hover:bg-rose-500/10'
                  : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5'
              )}
            >
              <Heart className={cn('w-3.5 h-3.5', fav && 'fill-rose-500')} />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

function CountUp({
  target,
  duration = 800,
  className,
}: {
  target: number
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const start = performance.now()
    const startVal = 0
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (target - startVal) * eased)
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])
  return <span className={className}>{faFmt(display)}</span>
}

function Stat({
  icon,
  value,
  label,
  color,
  delay = 0,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  color: string
  delay?: number
}) {
  return (
    <div
      className="anim-fade-up rounded-lg border border-border/60 bg-background/60 p-3 text-center"
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
      </div>
      <div className={cn('text-lg font-bold leading-tight tabular-nums', color)}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
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
  tone: 'teal' | 'amber' | 'rose'
  emptyText: string
  onToggleFav: (r: EstimatedRow) => void
  isFav: (r: EstimatedRow) => boolean
  showBucketBadge?: boolean
}) {
  const [expandAll, setExpandAll] = useState<boolean | null>(null)
  const toneClasses =
    tone === 'teal'
      ? 'from-teal-500/15'
      : tone === 'amber'
        ? 'from-orange-500/15'
        : 'from-red-500/15'
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
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-foreground/[0.02]">
        <span className="text-[11px] text-muted-foreground">
          {fa(rows.length)} رشته‌محل
        </span>
        <button
          type="button"
          onClick={() => setExpandAll((v) => (v === true ? false : true))}
          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-foreground/5 transition-colors"
          aria-label={expandAll === true ? 'جمع کردن همه' : 'باز کردن همه'}
        >
          {expandAll === true ? (
            <>
              <ChevronUp className="w-3 h-3" />
              جمع کردن همه
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              باز کردن همه
            </>
          )}
        </button>
      </div>
      <CardContent className="p-0 max-h-[640px] overflow-y-auto custom-scroll">
        {rows.map((r, i) => (
          <RowItem
            key={`${r.major}-${r.university}-${i}`}
            row={r}
            gradientClass={toneClasses}
            onToggleFav={onToggleFav}
            isFav={isFav}
            showBucketBadge={showBucketBadge}
            expandAll={expandAll}
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
  expandAll,
}: {
  row: EstimatedRow
  gradientClass: string
  onToggleFav: (r: EstimatedRow) => void
  isFav: (r: EstimatedRow) => boolean
  showBucketBadge?: boolean
  expandAll?: boolean | null
}) {
  const [userExpanded, setUserExpanded] = useState(false)
  // expandAll prop overrides user's individual toggle when it's non-null
  const expanded = expandAll !== null && expandAll !== undefined ? expandAll : userExpanded
  const setExpanded = (v: boolean | ((prev: boolean) => boolean)) => {
    // When expandAll is active, individual toggle temporarily overrides by
    // resetting expandAll to null (so the user regains per-row control)
    if (expandAll !== null && expandAll !== undefined) {
      // We can't setExpandAll here (it lives in BucketList), so we just
      // set the user state to the opposite of the current expandAll
      setUserExpanded(expandAll ? false : true)
    } else {
      setUserExpanded(v)
    }
  }
  const chance = row.chance
  const chanceColor =
    chance >= 70 ? 'text-teal-500' : chance >= 40 ? 'text-amber-500' : 'text-rose-500'
  const chanceGradient =
    chance >= 70
      ? 'from-teal-500 to-cyan-400'
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
      ? 'text-teal-500 border-teal-500/30'
      : row.bucket === 'realistic'
        ? 'text-amber-500 border-amber-500/30'
        : 'text-rose-500 border-rose-500/30'

  // Generate advice text based on chance and bucket
  const adviceText = useMemo(() => {
    if (row.bucket === 'optimistic') {
      // خوش‌بینانه = dream/reach choices (rank worse than cutoff)
      if (chance >= 30) return 'انتخاب خوش‌بینانه — شانس قبولی پایین اما امیدوارانه در لیست قرار دهید.'
      return 'انتخاب رویایی — شانس قبولی بسیار پایین است. به‌عنوان انتخاب آخر لیست استفاده کنید.'
    }
    if (row.bucket === 'realistic') {
      return 'انتخاب منطقی — رتبه شما نزدیک به آخرین رتبه قبولی است. حتماً در لیست اولویت‌ها قرار دهید.'
    }
    // بدبینانه = safe choices (rank better than cutoff)
    if (chance >= 90) return 'انتخاب بسیار امن (بدبینانه) — قطعاً قبول می‌شوید. در انتهای لیست برای اطمینان قرار دهید.'
    return 'انتخاب امن (بدبینانه) — شانس قبولی بالاست. به‌عنوان گزینه پشتیبان استفاده کنید.'
  }, [row.bucket, chance])

  // Compute rank ratio relative to cutoff
  const rankRatio = row.cutoff > 0 ? (row.rankDistance / row.cutoff) * 100 : 0
  const rankRatioText =
    rankRatio > 0
      ? `رتبه شما ${fa(Math.round(Math.abs(rankRatio)))}٪ بهتر از آخرین رتبه قبولی است`
      : rankRatio < 0
        ? `رتبه شما ${fa(Math.round(Math.abs(rankRatio)))}٪ بدتر از آخرین رتبه قبولی است`
        : 'رتبه شما دقیقاً برابر با آخرین رتبه قبولی است'

  return (
    <div
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
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-teal-500 border-teal-500/30">
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
        <div className="text-left shrink-0 flex flex-col items-end gap-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn('text-2xl font-extrabold leading-none tabular-nums cursor-help', chanceColor)}>
                  {fa(chance)}٪
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[220px] text-xs">
                <p className="leading-5">
                  شانس قبولی بر اساس فاصله رتبه شما تا آخرین رتبه قبولی سال گذشته محاسبه می‌شود.
                  {chance >= 70 ? ' شانس بالا.' : chance >= 40 ? ' شانس متوسط.' : ' شانس پایین.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="text-[10px] text-muted-foreground">شانس قبولی</div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'بستن جزئیات' : 'نمایش جزئیات'}
            aria-expanded={expanded}
            className="mt-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <div className={cn('transition-transform duration-200', expanded && 'rotate-180')}>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Progress
          value={chance}
          className={cn('h-1.5 bg-muted/60', `[&>div]:bg-gradient-to-l [&>div]:${chanceGradient}`)}
        />
      </div>
      {expanded && (
        <div className="anim-fade-in mt-3 pt-3 border-t border-border/40 space-y-2.5">
          {/* Advice */}
          <div className="flex items-start gap-2 p-2 rounded-md bg-foreground/[0.03]">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-5">{adviceText}</p>
          </div>
          {/* Rank ratio bar */}
          <div className="p-2 rounded-md bg-foreground/[0.03]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">مقایسه با آخرین رتبه قبولی</span>
              <span className={cn('text-[11px] font-bold tabular-nums', rankRatio > 0 ? 'text-teal-500' : rankRatio < 0 ? 'text-rose-500' : 'text-muted-foreground')}>
                {rankRatio > 0 ? '+' : ''}{fa(Math.round(Math.abs(rankRatio)))}٪
              </span>
            </div>
            <div className="relative h-1.5 bg-muted/60 rounded-full overflow-hidden">
              {/* Center line = cutoff */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-foreground/40" />
              {/* User position */}
              <div
                className={cn(
                  'absolute top-0 bottom-0 rounded-full',
                  rankRatio > 0 ? 'bg-teal-500' : 'bg-rose-500'
                )}
                style={{
                  // Bar fills from center towards right (better) or left (worse)
                  right: rankRatio >= 0 ? `${50 - Math.min(50, Math.abs(rankRatio) / 2)}%` : '50%',
                  left: rankRatio >= 0 ? '50%' : `${50 - Math.min(50, Math.abs(rankRatio) / 2)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{rankRatioText}</p>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-md bg-foreground/[0.03]">
              <div className="text-muted-foreground">آخرین رتبه قبولی</div>
              <div className="font-mono font-bold tabular-nums">{faFmt(row.cutoff)}</div>
            </div>
            <div className="p-2 rounded-md bg-foreground/[0.03]">
              <div className="text-muted-foreground">نوع دانشگاه</div>
              <div className="font-bold">{UNIVERSITY_TYPE_LABEL[row.universityType]}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
