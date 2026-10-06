'use client'

/**
 * CompareView — «مقایسه رتبه‌ها» of the result area.
 * Loaded lazily (next/dynamic) from ResultView when the user opens the
 * compare view. Metric definitions and formatting are unchanged.
 */
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GitCompare, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fa, faFmt } from '@/lib/konkur-shared'
import type { DetailedStats, EstimateResult, GroupKey, QuotaKey } from '@/lib/konkur-data'
import { computeDetailedStats } from '@/lib/konkur-data'

export default function CompareView({
  result,
  compareRank,
  setCompareRank,
  runCompare,
  compareResult,
  compareLoading,
  groupInfo,
  quotaInfo,
}: {
  result: EstimateResult
  compareRank: string
  setCompareRank: (v: string) => void
  runCompare: () => void
  compareResult: EstimateResult | null
  compareLoading: boolean
  groupInfo: { key: GroupKey; label: string; emoji: string; color: string }
  quotaInfo: { key: QuotaKey; label: string; description: string }
}) {
  const baseStats = useMemo(() => computeDetailedStats(result), [result])
  const compareStats = useMemo(
    () => (compareResult ? computeDetailedStats(compareResult) : null),
    [compareResult]
  )

  const metrics = [
    { key: 'reachableCount', label: 'انتخاب در دسترس', betterIsHigher: true },
    { key: 'outOfReachCount', label: 'خارج از دسترس', betterIsHigher: false },
    { key: 'averageChance', label: 'میانگین شانس', betterIsHigher: true },
    { key: 'userPercentile', label: 'صدک شما', betterIsHigher: false },
    { key: 'meanCutoff', label: 'میانگین رتبه', betterIsHigher: false },
    { key: 'medianCutoff', label: 'میانه رتبه', betterIsHigher: false },
  ] as const

  function getVal(s: DetailedStats, key: string): number {
    return (s as unknown as Record<string, number>)[key]
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-teal-500" />
          مقایسه رتبه‌ها
        </CardTitle>
        <CardDescription>
          رتبه فعلی شما را با یک رتبه دیگر مقایسه کنید تا تأثیر آن بر گزینه‌ها را ببینید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compare input form */}
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-border/60 bg-background/50">
          <div className="flex-1 min-w-[180px] space-y-1.5">
            <Label htmlFor="compareRank" className="text-xs text-muted-foreground">
              رتبه برای مقایسه (همان گروه و سهمیه)
            </Label>
            <Input
              id="compareRank"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="مثلاً ۵۰۰۰"
              value={compareRank}
              onChange={(e) => setCompareRank(e.target.value)}
              className="font-mono h-9"
              aria-label="رتبه برای مقایسه"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  runCompare()
                }
              }}
            />
          </div>
          <Button onClick={runCompare} disabled={compareLoading} className="h-9">
            {compareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
            مقایسه
          </Button>
          {compareRank && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setCompareRank('')
                // compareResult is managed by parent; we can't clear it here directly
              }}
            >
              <X className="w-4 h-4" /> پاک
            </Button>
          )}
        </div>

        {/* Side-by-side metrics comparison */}
        {compareResult && compareStats ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">معیار</th>
                  <th className="text-center py-2 px-3 min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-muted-foreground">رتبه فعلی شما</span>
                      <span className="font-bold text-base">{faFmt(result.rank)}</span>
                    </div>
                  </th>
                  <th className="text-center py-2 px-3 min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-muted-foreground">رتبه مقایسه</span>
                      <span className="font-bold text-base">{faFmt(compareResult.rank)}</span>
                    </div>
                  </th>
                  <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">تفاوت</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => {
                  const v1 = getVal(baseStats, m.key)
                  const v2 = getVal(compareStats, m.key)
                  const diff = v2 - v1
                  const isBetter = m.betterIsHigher ? diff > 0 : diff < 0
                  const isWorse = m.betterIsHigher ? diff < 0 : diff > 0
                  const diffColor = isBetter
                    ? 'text-teal-500'
                    : isWorse
                      ? 'text-rose-500'
                      : 'text-muted-foreground'
                  const diffSign = diff > 0 ? '+' : ''
                  const fmtVal = (n: number) => m.key.includes('Chance') || m.key.includes('Percentile') ? `${fa(n)}٪` : faFmt(n)
                  return (
                    <tr key={m.key} className="border-b border-border/40 hover:bg-foreground/[0.02]">
                      <td className="py-2 px-2 text-xs text-muted-foreground">{m.label}</td>
                      <td className="text-center py-2 px-3 font-mono font-bold tabular-nums">{fmtVal(v1)}</td>
                      <td className="text-center py-2 px-3 font-mono font-bold tabular-nums">{fmtVal(v2)}</td>
                      <td className={cn('text-center py-2 px-2 font-mono text-xs font-bold tabular-nums', diffColor)}>
                        {diff === 0 ? '—' : `${diffSign}${fa(Math.abs(diff))}${m.key.includes('Chance') || m.key.includes('Percentile') ? '٪' : ''}`}
                      </td>
                    </tr>
                  )
                })}
                {/* Tier row */}
                <tr className="border-b border-border/40 hover:bg-foreground/[0.02]">
                  <td className="py-2 px-2 text-xs text-muted-foreground">طبقه‌بندی</td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">{baseStats.tierLabel}</Badge>
                  </td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">{compareStats.tierLabel}</Badge>
                  </td>
                  <td className="text-center py-2 px-2 text-xs text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <GitCompare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            یک رتبه دیگر وارد کنید و دکمه «مقایسه» را بزنید تا تأثیر آن بر شانس قبولی شما نشان داده شود.
            <p className="text-xs mt-2">
              {groupInfo.emoji} {groupInfo.label} — {quotaInfo.label}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
