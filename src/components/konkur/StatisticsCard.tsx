'use client'

/**
 * StatisticsCard — «تحلیل آماری رتبه» card of the result area.
 * Loaded lazily (next/dynamic, ssr:false) from ResultView. Calculations and
 * display strings are unchanged; entrance/collapse animations were switched
 * from framer-motion to plain conditional rendering (decorative only).
 */
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fa, faFmt } from '@/lib/konkur-shared'
import type { DetailedStats, GroupKey, QuotaKey } from '@/lib/konkur-data'

export default function StatisticsCard({
  stats,
  groupInfo,
  quotaInfo,
}: {
  stats: DetailedStats
  groupInfo: { key: GroupKey; label: string; emoji: string; color: string }
  quotaInfo: { key: QuotaKey; label: string; description: string }
}) {
  const [collapsed, setCollapsed] = useState(false)
  const tierColorMap = {
    excellent: 'text-teal-500 bg-teal-500/10 border-teal-500/30',
    good: 'text-teal-500 bg-teal-500/10 border-teal-500/30',
    fair: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    challenging: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    difficult: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
  } as const
  const tierColor = tierColorMap[stats.tier]

  // Percentile bar: 0% = best (everyone can get in), 100% = worst (no one can get in)
  // Visually we want: better percentile = more green
  const percentileForBar = stats.userPercentile
  const percentileColor =
    percentileForBar < 20
      ? 'from-teal-500 to-cyan-400'
      : percentileForBar < 50
        ? 'from-teal-500 to-amber-400'
        : percentileForBar < 80
          ? 'from-amber-500 to-orange-400'
          : 'from-orange-500 to-rose-400'

  // Stats grid data
  const statRows = [
    { label: 'میانگین رتبه قبولی', value: faFmt(stats.meanCutoff), hint: 'میانگین کل رشته‌محل‌ها' },
    { label: 'میانه رتبه قبولی', value: faFmt(stats.medianCutoff), hint: 'رتبه وسط دامنه' },
    { label: 'انحراف معیار', value: faFmt(stats.stdDevCutoff), hint: 'پراکندگی رتبه‌ها' },
    { label: 'سخت‌ترین ورود', value: faFmt(stats.bestCutoff), hint: 'کمترین رتبه قبولی' },
    { label: 'آسان‌ترین ورود', value: faFmt(stats.worstCutoff), hint: 'بیشترین رتبه قبولی' },
    { label: 'میانگین شانس شما', value: `${fa(stats.averageChance)}٪`, hint: 'در همه رشته‌محل‌ها' },
  ]

  return (
    <Card className="border-border/60 bg-gradient-to-br from-teal-500/5 via-card to-card overflow-hidden">
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-controls="stats-card-body"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setCollapsed((c) => !c)
          }
        }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                تحلیل آماری رتبه
                <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', tierColor)}>
                  {stats.tierLabel}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {groupInfo.emoji} {groupInfo.label} — {quotaInfo.label} — رتبه{' '}
                <span className="font-mono font-bold text-foreground">{faFmt(stats.userRank)}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-[11px] hidden sm:inline">
              {collapsed ? 'نمایش جزئیات' : 'بستن جزئیات'}
            </span>
            <div
              className={cn(
                'p-1 rounded-md hover:bg-foreground/5 transition-transform duration-200',
                collapsed && '-rotate-90'
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent id="stats-card-body">
          <p className="text-xs text-muted-foreground leading-6 mb-3 px-1">
            {stats.tierDescription}
          </p>

          {/* User percentile bar */}
          <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">
                جایگاه شما نسبت به سایر رشته‌محل‌ها
              </span>
              <span className="text-sm font-bold text-teal-500 tabular-nums">
                صدک: {fa(stats.userPercentile)}٪
              </span>
            </div>
            <div className="relative h-2.5 bg-muted/60 rounded-full overflow-hidden">
              <div
                className={cn('absolute inset-y-0 right-0 bg-gradient-to-l', percentileColor)}
                style={{ width: `${Math.max(2, percentileForBar)}%` }}
              />
              {/* Marker for user's position */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/70 rounded"
                style={{ right: `calc(${percentileForBar}% - 1px)` }}
                aria-hidden="true"
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
              <span>بهتر (رتبه بسیار خوب)</span>
              <span>بدتر (رتبه ضعیف‌تر)</span>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statRows.map((row) => (
              <div
                key={row.label}
                className="p-2.5 rounded-lg border border-border/60 bg-background/50 text-center"
              >
                <div className="text-xs text-muted-foreground mb-0.5">{row.label}</div>
                <div className="text-sm font-bold tabular-nums text-foreground">{row.value}</div>
                <div className="text-[10px] text-muted-foreground/80 mt-0.5">{row.hint}</div>
              </div>
            ))}
          </div>

          {/* Reach vs out-of-reach summary */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-teal-500 border-teal-500/30">
              <CheckCircle2 className="w-3 h-3 ms-1" />
              {fa(stats.reachableCount)} رشته‌محل در دسترس
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-rose-500 border-rose-500/30">
              <AlertTriangle className="w-3 h-3 ms-1" />
              {fa(stats.outOfReachCount)} رشته‌محل خارج از دسترس
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
