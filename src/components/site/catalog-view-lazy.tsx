'use client'

import dynamic from 'next/dynamic'

/**
 * CatalogViewLazy — client wrapper that loads CatalogView (heavy client
 * component with full dataset access) only on the client side via
 * next/dynamic with ssr:false. Used by /catalog route to keep the heavy
 * catalog code out of the server bundle.
 */
const CatalogViewLazy = dynamic(() => import('@/components/konkur/CatalogView'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] rounded-xl border border-border/60 bg-card/50 animate-pulse" aria-hidden="true" />
  ),
})

export default function CatalogViewLazyExport() {
  return <CatalogViewLazy />
}
