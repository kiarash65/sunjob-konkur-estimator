'use client'

/**
 * GuidesView — «راهنمای انتخاب رشته» tab (۲۳ راهنما).
 * Ported verbatim from the parallel page.tsx iteration (origin/main) into a
 * lazily-loaded component so it stays out of the initial bundle. Content data
 * lives in src/lib/masir-content.ts and is untouched (DATA FREEZE).
 */
import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { fa } from '@/lib/konkur-shared'
import { GUIDES } from '@/lib/masir-content'

export default function GuidesView() {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return GUIDES
    return GUIDES.filter((g) => g.title.toLowerCase().includes(q) || g.excerpt.toLowerCase().includes(q))
  }, [search])
  const categories = useMemo(() => {
    const map = new Map<string, { label: string; guides: typeof GUIDES }>()
    for (const g of filtered) {
      if (!map.has(g.category)) map.set(g.category, { label: g.categoryLabel, guides: [] })
      map.get(g.category)!.guides.push(g)
    }
    return Array.from(map.values())
  }, [filtered])
  return (
    <div className="space-y-4 mt-6">
      <Card className="border-border/60">
        <CardHeader><CardTitle className="text-base">راهنمای انتخاب رشته</CardTitle><CardDescription className="text-sm text-muted-foreground">{fa(GUIDES.length)} راهنمای انتخاب رشته</CardDescription></CardHeader>
        <CardContent>
          <div className="relative mb-4"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" /><Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی راهنما..." aria-label="جستجو" className="pr-9 h-9" /></div>
          <div className="text-xs text-muted-foreground mb-3">{fa(filtered.length)} راهنما</div>
          {categories.map((cat, ci) => (
            <div key={ci} className="mb-6">
              <h2 className="text-sm font-bold text-[#1A2744] mb-1 dark:text-foreground">{cat.label}</h2>
              <div className="space-y-2">
                {cat.guides.map((g, gi) => (
                  <div key={gi} className="p-3 rounded-lg border border-border/60 bg-card/50 hover:border-[#0EA5A0]/30 transition-colors cursor-pointer">
                    <h3 className="text-sm font-bold text-[#1A2744] mb-1 dark:text-foreground">{g.title}</h3>
                    <p className="text-xs text-muted-foreground leading-5">{g.excerpt}</p>
                    <span className="text-[10px] text-[#0EA5A0] mt-1 inline-block">ادامه مطلب ←</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-sm text-muted-foreground">راهنمایی یافت نشد.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
