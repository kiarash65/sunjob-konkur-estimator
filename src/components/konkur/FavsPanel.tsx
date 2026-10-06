'use client'

/**
 * FavsPanel — «علاقه‌مندی‌ها» panel. Loaded lazily from the app shell when
 * opened. Content and behaviour are unchanged.
 */
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fa, faFmt } from '@/lib/konkur-shared'
import type { FavItem } from '@/lib/konkur-shared'
import { GROUPS, QUOTAS, UNIVERSITY_TYPE_LABEL } from '@/lib/konkur-data'

export default function FavsPanel({
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
                          ? 'text-teal-500'
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
