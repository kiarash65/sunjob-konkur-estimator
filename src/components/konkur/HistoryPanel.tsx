'use client'

/**
 * HistoryPanel — «تاریخچه جستجوها» panel. Loaded lazily from the app shell
 * when opened. Content and behaviour are unchanged.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Trash2, X } from 'lucide-react'
import { fa, faFmt } from '@/lib/konkur-shared'
import type { HistoryItem } from '@/lib/konkur-shared'
import { GROUPS, QUOTAS } from '@/lib/konkur-data'
import { MAX_HISTORY } from '@/lib/konkur-shared'

export default function HistoryPanel({
  history,
  onReplay,
  onRemove,
  onClear,
  onClose,
}: {
  history: HistoryItem[]
  onReplay: (h: HistoryItem) => void
  onRemove: (id: string) => void
  onClear: () => void
  onClose: () => void
}) {
  // Already stored newest-first; no extra sort needed
  return (
    <Card className="border-teal-500/30 bg-gradient-to-br from-teal-500/5 via-card to-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <CardTitle className="text-base">تاریخچه جستجوها ({fa(history.length)})</CardTitle>
              <CardDescription className="text-xs">
                آخرین {fa(MAX_HISTORY)} تخمین در این مرورگر
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={onClear}>
                <Trash2 className="w-3.5 h-3.5" /> پاک کردن همه
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" /> بستن
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            هنوز تخمینی ساخته نشده. بعد از ارسال فرم، نتیجه به‌صورت خودکار در اینجا ذخیره می‌شود.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scroll -mx-2 px-2 space-y-2">
            {history.map((h) => {
              const g = GROUPS.find((x) => x.key === h.group)
              const q = QUOTAS.find((x) => x.key === h.quota)
              return (
                <div
                  key={h.id}
                  className="p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-background/80 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onReplay(h)}
                      className="flex-1 min-w-0 text-right"
                      aria-label="باز اجرای این تخمین"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{g?.emoji}</span>
                        <p className="font-bold text-sm leading-6 flex-1 truncate group-hover:text-teal-500 transition-colors">
                          {g?.label} — {q?.label}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          رتبه: <span className="font-mono">{faFmt(h.rank)}</span>
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {faFmt(h.totalChoices)} رشته‌محل
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-teal-500 border-teal-500/30">
                          {faFmt(h.reachableCount)} انتخاب در دسترس
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        بهترین: {h.bestMajor} — <span className="font-mono">{fa(h.bestChance)}٪</span>
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(h.id)}
                      aria-label="حذف این مورد از تاریخچه"
                      className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
