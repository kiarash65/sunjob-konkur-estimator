'use client'

/**
 * CatalogView — «فهرست رشته‌محل‌ها» tab. Loaded lazily (next/dynamic,
 * ssr:false) on first open so the catalog code + full dataset access stay out
 * of the initial bundle. Filtering, sorting and pagination are unchanged.
 */
import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListChecks, Search, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fa, faFmt } from '@/lib/konkur-shared'
import {
  GROUPS,
  UNIVERSITY_TYPE_LABEL,
  getAllCatalogRows,
  type GroupKey,
  type UniversityType,
} from '@/lib/konkur-data'

export default function CatalogView() {
  const allRows = useMemo(() => getAllCatalogRows(), [])
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<GroupKey | 'all'>('all')
  const [uniTypeFilter, setUniTypeFilter] = useState<UniversityType | 'all'>('all')
  const [competitionFilter, setCompetitionFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'major' | 'university' | 'cutoff-asc' | 'cutoff-desc'>('major')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = allRows.filter((r) => {
      if (groupFilter !== 'all' && r.group !== groupFilter) return false
      if (uniTypeFilter !== 'all' && r.universityType !== uniTypeFilter) return false
      if (competitionFilter !== 'all' && r.competition !== competitionFilter) return false
      if (q) {
        const hay = (r.major + ' ' + r.university + ' ' + (r.city || '')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    rows = [...rows]
    switch (sortBy) {
      case 'major': rows.sort((a, b) => a.major.localeCompare(b.major, 'fa')); break
      case 'university': rows.sort((a, b) => a.university.localeCompare(b.university, 'fa')); break
      case 'cutoff-asc': rows.sort((a, b) => (a.cutoffs.region1 ?? 999999) - (b.cutoffs.region1 ?? 999999)); break
      case 'cutoff-desc': rows.sort((a, b) => (b.cutoffs.region1 ?? 0) - (a.cutoffs.region1 ?? 0)); break
    }
    return rows
  }, [allRows, search, groupFilter, uniTypeFilter, competitionFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  // Clamp current page if it exceeds total after filtering
  const effectivePage = Math.min(currentPage, totalPages || 1)

  const competitionColors = {
    'very-high': 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    'high': 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    'medium': 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    'low': 'text-teal-500 bg-teal-500/10 border-teal-500/30',
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg border border-border/60 bg-card/50">
          <div className="text-xl font-bold text-teal-500">{faFmt(allRows.length)}</div>
          <div className="text-[11px] text-muted-foreground">رشته‌محل</div>
        </div>
        <div className="text-center p-3 rounded-lg border border-border/60 bg-card/50">
          <div className="text-xl font-bold text-teal-500">{faFmt(new Set(allRows.map(r => r.university)).size)}</div>
          <div className="text-[11px] text-muted-foreground">دانشگاه</div>
        </div>
        <div className="text-center p-3 rounded-lg border border-border/60 bg-card/50">
          <div className="text-xl font-bold text-amber-500">{faFmt(new Set(allRows.map(r => r.major)).size)}</div>
          <div className="text-[11px] text-muted-foreground">رشته</div>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-teal-500" />
            فهرست رشته‌محل‌ها
          </CardTitle>
          <CardDescription>
            جستجو، مقایسه و اولویت‌بندی رشته‌محل‌های کنکور سراسری ۱۴۰۵
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی رشته، دانشگاه یا شهر..."
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
            <Select value={uniTypeFilter} onValueChange={(v) => setUniTypeFilter(v as UniversityType | 'all')}>
              <SelectTrigger className="h-9 w-[130px] text-xs" aria-label="فیلتر نوع دانشگاه">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                {Object.entries(UNIVERSITY_TYPE_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
              <SelectTrigger className="h-9 w-[130px] text-xs" aria-label="فیلتر رقابت">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه سطوح رقابت</SelectItem>
                <SelectItem value="very-high">رقابت بسیار زیاد</SelectItem>
                <SelectItem value="high">رقابت زیاد</SelectItem>
                <SelectItem value="medium">رقابت متوسط</SelectItem>
                <SelectItem value="low">رقابت کم</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-9 w-[130px] text-xs" aria-label="مرتب‌سازی">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="major">نام رشته</SelectItem>
                <SelectItem value="university">نام دانشگاه</SelectItem>
                <SelectItem value="cutoff-asc">سخت‌ترین ورود</SelectItem>
                <SelectItem value="cutoff-desc">آسان‌ترین ورود</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              <strong className="text-foreground">{faFmt(filtered.length)}</strong> رشته‌محل
            </span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-[100px] text-xs" aria-label="تعداد در صفحه">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">۲۵ در صفحه</SelectItem>
                <SelectItem value="50">۵۰ در صفحه</SelectItem>
                <SelectItem value="100">۱۰۰ در صفحه</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">گروه</th>
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium">رشته</th>
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium hidden sm:table-cell">دانشگاه</th>
                  <th className="text-right py-2 px-2 text-xs text-muted-foreground font-medium hidden md:table-cell">شهر</th>
                  <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">رقابت</th>
                  <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">رتبه ۱</th>
                  <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">جزئیات</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => {
                  const rowIdx = (currentPage - 1) * pageSize + i
                  const isExpanded = expandedRow === rowIdx
                  return (
                    <React.Fragment key={rowIdx}>
                      <tr
                        className={cn('border-b border-border/40 hover:bg-foreground/[0.02] cursor-pointer', isExpanded && 'bg-foreground/[0.03]')}
                        onClick={() => setExpandedRow(isExpanded ? null : rowIdx)}
                      >
                        <td className="py-2 px-2 text-xs whitespace-nowrap">{r.groupEmoji} {r.groupLabel}</td>
                        <td className="py-2 px-2 text-xs font-medium">{r.major}</td>
                        <td className="py-2 px-2 text-xs hidden sm:table-cell">{r.university}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground hidden md:table-cell">{r.city || '—'}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full border inline-block whitespace-nowrap', competitionColors[r.competition])}>
                            {r.competitionLabel}
                          </span>
                        </td>
                        <td className="text-center py-2 px-2 text-xs font-mono tabular-nums">{r.cutoffs.region1 ? faFmt(r.cutoffs.region1) : '—'}</td>
                        <td className="text-center py-2 px-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : rowIdx) }}
                            className="text-[10px] text-teal-500 hover:text-teal-400"
                            aria-label={isExpanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                          >
                            {isExpanded ? '▲ بستن' : '▼ جزئیات'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-foreground/[0.02]">
                          <td colSpan={7} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-1">دانشگاه</div>
                                <div className="font-medium">{r.university}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">شهر</div>
                                <div className="font-medium">{r.city || '—'}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">نوع دانشگاه</div>
                                <div className="font-medium">{r.universityTypeLabel}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">مقطع</div>
                                <div className="font-medium">{r.degreeLevel} — {r.courseType}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">ظرفیت تخمینی</div>
                                <div className="font-medium">{fa(r.capacity)} نفر</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">سطح رقابت</div>
                                <div className="font-medium">{r.competitionLabel}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{r.competitionDesc}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">رتبه قبولی منطقه ۱</div>
                                <div className="font-mono font-bold">{r.cutoffs.region1 ? faFmt(r.cutoffs.region1) : '—'}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">رتبه قبولی منطقه ۲</div>
                                <div className="font-mono font-bold">{r.cutoffs.region2 ? faFmt(r.cutoffs.region2) : '—'}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">رتبه قبولی منطقه ۳</div>
                                <div className="font-mono font-bold">{r.cutoffs.region3 ? faFmt(r.cutoffs.region3) : '—'}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                اول
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, currentPage - 2)
                const pageNum = start + i
                if (pageNum > totalPages) return null
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {fa(pageNum)}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                بعدی
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                آخر
              </Button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              موردی با فیلترهای انتخاب‌شده یافت نشد.
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/40">
            <p className="text-[11px] text-muted-foreground leading-5">
              <strong>اعتبار داده‌ها:</strong> داده‌های این ابزار از دفترچه‌های رسمی پذیرش استخراج شده و ممکن است ناقص، قدیمی یا نادرست باشد. برآورد «رقابت در پذیرش» از ویژگی‌های خود رشته‌محل ساخته می‌شود و به رتبه قبولی سال‌های گذشته یا شانس قبولی شما ربطی ندارد.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
