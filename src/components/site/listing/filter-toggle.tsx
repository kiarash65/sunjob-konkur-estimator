'use client'

/**
 * FilterToggle — client-side "نمایش بیشتر" toggle for filter-pills that are
 * hidden by default (e.g. categories with few items). Click the button to
 * reveal the hidden pills inline.
 */
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { fa } from '@/lib/konkur-shared'

interface Pill {
  label: string
  href: string
  hidden?: boolean
}

export function FilterToggle({ pills }: { pills: Pill[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open &&
        pills.map((p, i) => (
          <Link
            key={i}
            href={p.href}
            className="inline-block text-xs px-2.5 py-1 rounded-full border border-[var(--c-border,--border)] bg-[var(--c-wash,--background)] text-[var(--c-dark,--foreground)] hover:bg-[var(--c-chip,--secondary)] hover:border-[var(--type-color,--primary)] transition-colors"
          >
            {p.label}
          </Link>
        ))}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-[var(--type-color,--primary)] hover:bg-[var(--c-panel,--secondary)] transition-colors"
      >
        {open ? 'نمایش کمتر' : `نمایش بیشتر (${fa(pills.length)})`}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
    </>
  )
}
