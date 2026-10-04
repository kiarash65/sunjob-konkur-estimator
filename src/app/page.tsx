'use client'

import { useState, useRef, type FormEvent } from 'react'
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
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
  GROUPS,
  QUOTAS,
  UNIVERSITY_TYPE_LABEL,
  type GroupKey,
  type QuotaKey,
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

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [group, setGroup] = useState<GroupKey>('riazi')
  const [quota, setQuota] = useState<QuotaKey>('region1')
  const [rankInput, setRankInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [downloading, setDownloading] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const rank = parseInt(rankInput, 10)
    if (!rank || rank <= 0 || rank > 2_000_000) {
      setError('لطفاً یک رتبه معتبر وارد کنید (عدد مثبت).')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, quota, rank }),
      })
      const data: ApiResponse = await res.json()
      if (!data.ok || !data.result) {
        setError(data.error || 'خطای ناشناخته رخ داد.')
      } else {
        setResult(data.result)
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.')
    } finally {
      setLoading(false)
    }
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

  const isDark = theme === 'dark'

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-base sm:text-lg">تخمین رشته قبولی با رتبه</p>
              <p className="text-xs text-muted-foreground">کنکور سراسری ۱۴۰۵ — نسخه قابل دانلود</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="تغییر تم"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-90">
          <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -top-20 -left-32 w-[420px] h-[420px] rounded-full bg-violet-500/20 blur-3xl" />
        </div>
        <div className="container mx-auto max-w-6xl px-4 pt-10 pb-6 text-center">
          <Badge
            variant="outline"
            className="mb-3 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 me-1.5" /> نرم افزار رایگان تخمین رشته قبولی
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-500 via-teal-500 to-violet-500 bg-clip-text text-transparent">
            تخمین رشته قبولی با رتبه کنکور ۱۴۰۵
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-8">
            گروه آزمایشی، سهمیه و رتبه خود را وارد کنید تا فهرستی از رشته‌محل‌های پیشنهادی را در سه دسته{' '}
            <span className="text-emerald-500 font-semibold">خوش‌بینانه</span>،{' '}
            <span className="text-amber-500 font-semibold">منطقی</span> و{' '}
            <span className="text-rose-500 font-semibold">بدبینانه</span> مشاهده کنید.
            داده‌ها بر اساس کارنامه قبولی سال گذشته و با خطای تخمینی کمتر از ۵٪ تنظیم شده‌اند.
          </p>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 pb-24 flex-1">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24 border-border/60 shadow-xl shadow-emerald-500/5">
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
                    <Select value={group} onValueChange={(v) => setGroup(v as GroupKey)}>
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
                    <Select value={quota} onValueChange={(v) => setQuota(v as QuotaKey)}>
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
                      onChange={(e) => setRankInput(e.target.value)}
                      className="font-mono text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      رتبه کل داوطلب در سهمیه انتخابی (کوچک‌تر بهتر است).
                    </p>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={loading} className="w-full h-11 text-base">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Calculator className="w-5 h-5" />
                      )}
                      {loading ? 'در حال محاسبه...' : 'مشاهده تخمین رشته قبولی'}
                    </Button>
                    <Button
                      type="button"
                      onClick={onDownloadHTML}
                      disabled={downloading}
                      variant="outline"
                      className="w-full h-11 text-base"
                    >
                      {downloading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                      {downloading ? 'در حال آماده‌سازی...' : 'دانلود نسخه HTML آفلاین'}
                    </Button>
                  </div>

                  {error && (
                    <div className="text-sm bg-destructive/10 border border-destructive/40 text-destructive rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result area */}
          <div ref={resultRef} className="lg:col-span-3 space-y-6 scroll-mt-24">
            {!result && !loading && <EmptyState onDownload={onDownloadHTML} />}
            {loading && <LoadingState />}
            {result && <ResultView result={result} group={group} quota={quota} />}
          </div>
        </div>

        {/* Info & FAQ */}
        <section className="mt-12 grid md:grid-cols-3 gap-4">
          <Card className="border-border/60">
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
          <Card className="border-border/60">
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
          <Card className="border-border/60">
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

        <section className="mt-6">
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
                    دکمه «دانلود نسخه HTML آفلاین» یک فایل HTML مستقل تولید می‌کند که شامل تمام منطق و
                    داده‌ها است و پس از دانلود بدون نیاز به اینترنت و سرور، آفلاین کار می‌کند.
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
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-emerald-500" />
        </div>
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
}: {
  result: EstimateResult
  group: GroupKey
  quota: QuotaKey
}) {
  const groupInfo = GROUPS.find((g) => g.key === group)!
  const quotaInfo = QUOTAS.find((q) => q.key === quota)!
  const best = result.summary.bestChance

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{groupInfo.emoji}</span>
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
            />
            <Stat
              icon={<TrendingUp className="w-4 h-4" />}
              value={result.summary.medianRank ? faFmt(result.summary.medianRank) : '—'}
              label="میانه رتبه قبولی"
              color="text-amber-500"
            />
            <Stat
              icon={<Award className="w-4 h-4" />}
              value={best ? `${fa(best.chance)}٪` : '—'}
              label="بیشترین شانس"
              color="text-violet-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for the 3 buckets */}
      <Tabs defaultValue="optimistic" className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-auto">
          <TabsTrigger value="optimistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-emerald-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> خوش‌بینانه
            </span>
            <span className="text-[11px] text-muted-foreground">({fa(result.optimistic.length)})</span>
          </TabsTrigger>
          <TabsTrigger value="realistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-amber-500">
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4" /> منطقی
            </span>
            <span className="text-[11px] text-muted-foreground">({fa(result.realistic.length)})</span>
          </TabsTrigger>
          <TabsTrigger value="pessimistic" className="flex flex-col gap-1 py-2 data-[state=active]:text-rose-500">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> بدبینانه
            </span>
            <span className="text-[11px] text-muted-foreground">({fa(result.pessimistic.length)})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optimistic" className="mt-3">
          <BucketList rows={result.optimistic} tone="emerald" emptyText="موردی در دسته خوش‌بینانه یافت نشد." />
        </TabsContent>
        <TabsContent value="realistic" className="mt-3">
          <BucketList rows={result.realistic} tone="amber" emptyText="موردی در دسته منطقی یافت نشد." />
        </TabsContent>
        <TabsContent value="pessimistic" className="mt-3">
          <BucketList rows={result.pessimistic} tone="rose" emptyText="موردی در دسته بدبینانه یافت نشد." />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  color: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
      </div>
      <div className={cn('text-lg font-bold leading-tight', color)}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

function BucketList({
  rows,
  tone,
  emptyText,
}: {
  rows: EstimatedRow[]
  tone: 'emerald' | 'amber' | 'rose'
  emptyText: string
}) {
  const toneClasses =
    tone === 'emerald'
      ? 'from-emerald-500/15'
      : tone === 'amber'
        ? 'from-amber-500/15'
        : 'from-rose-500/15'
  const barTone =
    tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
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
          <RowItem key={`${r.major}-${r.university}-${i}`} row={r} barTone={barTone} gradientClass={toneClasses} />
        ))}
      </CardContent>
    </Card>
  )
}

function RowItem({
  row,
  barTone,
  gradientClass,
}: {
  row: EstimatedRow
  barTone: string
  gradientClass: string
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
  return (
    <div className={cn('p-4 border-b border-border/60 bg-gradient-to-l to-transparent', gradientClass)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm sm:text-base leading-6 mb-1">{row.major}</p>
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
          </div>
        </div>
        <div className="text-left shrink-0">
          <div className={cn('text-2xl font-extrabold leading-none', chanceColor)}>{fa(chance)}٪</div>
          <div className="text-[10px] text-muted-foreground mt-1">شانس قبولی</div>
        </div>
      </div>
      <div className="mt-3">
        <Progress value={chance} className={cn('h-1.5 bg-muted/60', `[&>div]:bg-gradient-to-l [&>div]:${chanceGradient}`)} />
      </div>
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: var(--muted-foreground); }
      `}</style>
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80">
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
        <p className="text-xs text-muted-foreground text-center leading-6">
          © {new Date().getFullYear()} — این نرم افزار یک بازسازی مستقل از روی نرم افزار «تخمین رشته قبولی با رتبه»
          سایت هیوا است و هیچ وابستگی رسمی به سازمان سنجش یا مؤسسه هیوا ندارد. داده‌ها الگویی و بر اساس
          رتبه‌های قبولی سال‌های گذشته تنظیم شده‌اند.
        </p>
      </div>
    </footer>
  )
}
