'use client'

/**
 * ScrollSpy + HeadingAnchor client components used on doc-style detail pages
 * (field detail, university detail, guide detail). The sidebar TOC links
 * get the `.toc-link-active` class when the user scrolls to the matching
 * section, and each h2 has a clickable "#" button that copies the URL hash
 * to clipboard.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function ScrollSpyTOC({ sections }: { sections: { id: string; title: string; sub?: boolean }[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: [0, 1] }
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav className="text-sm" aria-label="فهرست مطالب صفحه">
      <p className="text-[11px] font-bold text-muted-foreground mb-2">فهرست مطالب</p>
      <ul className="space-y-1">
        {sections.map((s) => (
          <li key={s.id} className={s.sub ? 'ms-3' : ''}>
            <Link
              href={`#${s.id}`}
              className={[
                'block px-2 py-1 rounded text-xs transition-colors',
                s.sub ? 'text-muted-foreground' : 'text-foreground/80 font-medium',
                activeId === s.id ? 'toc-link-active' : 'hover:text-[var(--type-color,--primary)]',
              ].join(' ')}
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function HeadingAnchor({ id, label }: { id: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      aria-label={label ?? 'کپی لینک این بخش'}
      title={label ?? 'کپی لینک این بخش'}
      className="opacity-0 group-hover:opacity-100 ms-2 inline-flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-[var(--type-color,--primary)] hover:bg-[var(--c-panel,--secondary)] transition-all align-middle"
      onClick={async () => {
        try {
          const url = `${window.location.origin}${window.location.pathname}#${id}`
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard might be unavailable; silently ignore.
        }
      }}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  )
}
