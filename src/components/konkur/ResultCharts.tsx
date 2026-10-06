'use client'

/**
 * ResultCharts — the «نمای نمودار» card of the result area.
 * Extracted from the old single-file page and loaded lazily (next/dynamic,
 * ssr:false) so recharts + its d3 dependencies never ship in the initial bundle.
 * Chart data preparation and colours are unchanged (presentation-only move).
 */
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table as TableIcon } from 'lucide-react'
import { fa } from '@/lib/konkur-shared'

export default function ResultCharts({
  chartData,
  pieData,
  rowCount,
}: {
  chartData: { name: string; تعداد: number; color: string }[]
  pieData: { name: string; value: number; color: string }[]
  rowCount: number
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-teal-500" />
          تحلیل توزیع شانس قبولی
        </CardTitle>
        <CardDescription>
          توزیع شانس قبولی شما در {fa(rowCount)} رشته‌محل — کمک به درک کلی وضعیت
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
  )
}
