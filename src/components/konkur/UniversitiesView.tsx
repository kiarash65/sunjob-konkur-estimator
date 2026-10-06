'use client'

/**
 * UniversitiesView — «دانشگاه‌ها» tab. Loaded lazily (next/dynamic, ssr:false)
 * on first open. Content and behaviour are unchanged.
 */
import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GraduationCap, Search } from 'lucide-react'
import { fa, faFmt } from '@/lib/konkur-shared'
import {
  GROUPS,
  UNIVERSITY_TYPE_LABEL,
  getAllUniversities,
  type UniversityType,
} from '@/lib/konkur-data'

export default function UniversitiesView() {
  const unis = useMemo(() => getAllUniversities(), [])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<UniversityType | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return unis.filter((u) => {
      if (typeFilter !== 'all' && u.type !== typeFilter) return false
      if (q) {
        const hay = (u.name + ' ' + (u.city || '')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [unis, search, typeFilter])

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-teal-500" />
            دانشگاه‌ها
          </CardTitle>
          <CardDescription>
            فهرست {fa(unis.length)} دانشگاه در دیتابیس کنکور سراسری ۱۴۰۵
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام دانشگاه یا شهر..."
                aria-label="جستجو"
                className="pr-9 h-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as UniversityType | 'all')}>
              <SelectTrigger className="h-9 w-[140px] text-xs" aria-label="فیلتر نوع">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                {Object.entries(UNIVERSITY_TYPE_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            {fa(filtered.length)} دانشگاه
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {filtered.map((u, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/60 bg-card/50 hover:border-teal-500/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-6">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.city || '—'}</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">{u.typeLabel}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {fa(u.majorCount)} رشته‌محل
                  </Badge>
                  {u.groupKeys.map((gk) => {
                    const g = GROUPS.find((g) => g.key === gk)!
                    return (
                      <Badge key={gk} variant="outline" className="text-[9px] px-1.5 py-0">
                        {g.emoji} {g.label}
                      </Badge>
                    )
                  })}
                  {u.minCutoff < Infinity && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                      رتبه: {faFmt(u.minCutoff)}–{faFmt(u.maxCutoff)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              دانشگاهی یافت نشد.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
