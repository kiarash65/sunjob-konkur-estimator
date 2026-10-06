'use client'

/**
 * MajorsView — «رشته‌های دانشگاهی» tab. Loaded lazily (next/dynamic, ssr:false)
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
import { Search } from 'lucide-react'
import { MapPin as MapPinIcon } from 'lucide-react'
import { fa, faFmt } from '@/lib/konkur-shared'
import { GROUPS, getAllMajors, type GroupKey } from '@/lib/konkur-data'

export default function MajorsView() {
  const majors = useMemo(() => getAllMajors(), [])
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<GroupKey | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return majors.filter((m) => {
      if (groupFilter !== 'all' && m.group !== groupFilter) return false
      if (q && !m.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [majors, search, groupFilter])

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-amber-500" />
            رشته‌های دانشگاهی
          </CardTitle>
          <CardDescription>
            کاتالوگ {fa(majors.length)} رشته دانشگاهی کنکور سراسری ۱۴۰۵
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
                placeholder="جستجوی نام رشته..."
                aria-label="جستجو"
                className="pr-9 h-9"
              />
            </div>
            <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v as GroupKey | 'all')}>
              <SelectTrigger className="h-9 w-[120px] text-xs" aria-label="فیلتر گروه">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه گروه‌ها</SelectItem>
                {GROUPS.map((g) => (
                  <SelectItem key={g.key} value={g.key}>{g.emoji} {g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            {fa(filtered.length)} رشته
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {filtered.map((m, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/60 bg-card/50 hover:border-amber-500/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-6">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.groupEmoji} {m.groupLabel}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {fa(m.universityCount)} دانشگاه
                  </Badge>
                  {m.cities.length > 0 && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                      {fa(m.cities.length)} شهر
                    </Badge>
                  )}
                  {m.minCutoff < Infinity && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">
                      رتبه: {faFmt(m.minCutoff)}–{faFmt(m.maxCutoff)}
                    </Badge>
                  )}
                </div>
                {m.cities.length > 0 && m.cities.length <= 5 && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    شهرها: {m.cities.join('، ')}
                  </p>
                )}
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              رشته‌ای یافت نشد.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
