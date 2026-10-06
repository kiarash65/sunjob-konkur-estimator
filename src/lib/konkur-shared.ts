/**
 * konkur-shared.ts — tiny client-safe helpers shared across the estimator UI.
 *
 * IMPORTANT (DATA & LOGIC FREEZE): this module deliberately contains NO dataset
 * and NO estimator logic. It only mirrors the presentation-side helpers that
 * used to live inside the old single-file page (digit formatting, localStorage
 * favs/history helpers and shared types) so that the light app shell does not
 * need to pull `lib/konkur-data` (and its datasets) into the initial bundle.
 *
 * The formatting implementation below is byte-for-byte the same behaviour as
 * `toPersianDigits` in konkur-data.ts.
 */
import type {
  GroupKey,
  QuotaKey,
  UniversityType,
  EstimateResult,
  EstimatedRow,
} from '@/lib/konkur-data'

export type { GroupKey, QuotaKey, UniversityType, EstimateResult, EstimatedRow }

export interface ApiResponse {
  ok: boolean
  result?: EstimateResult
  error?: string
}

/** Identical behaviour to konkur-data.toPersianDigits (kept here so light
 *  chunks don't import the dataset module). */
export function fa(input: string | number): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  return String(input).replace(/[0-9]/g, (d) => persianDigits[Number(d)])
}

export function faFmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return fa(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
}

export const STORAGE_FAV_KEY = 'konkur-favorites'
export const STORAGE_HISTORY_KEY = 'konkur-history'
export const MAX_HISTORY = 8

export type FavItem = {
  key: string
  major: string
  university: string
  city: string
  universityType: UniversityType
  cutoff: number
  chance: number
  group: GroupKey
  quota: QuotaKey
  rank: number
  savedAt: number
}

export function rowKey(r: EstimatedRow, group: GroupKey, quota: QuotaKey): string {
  return `${group}:${quota}:${r.major}::${r.university}`
}

export function loadFavs(): FavItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_FAV_KEY)
    return raw ? (JSON.parse(raw) as FavItem[]) : []
  } catch {
    return []
  }
}

export function saveFavs(items: FavItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_FAV_KEY, JSON.stringify(items))
  } catch {}
}

export type HistoryItem = {
  id: string // unique key: group:quota:rank
  group: GroupKey
  quota: QuotaKey
  rank: number
  totalChoices: number
  reachableCount: number
  bestChance: number
  bestMajor: string
  savedAt: number
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryItem[]) : []
  } catch {
    return []
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(items))
  } catch {}
}
