import Papa from 'papaparse'
import type { Conversation, Message } from '@/types'

// ─── Raw CSV row ──────────────────────────────────────────────────────────────

interface SheetRow {
  ENGAGEMENT_ID:   string
  TIMESTAMP_AEST:  string
  DIRECTION:       string
  CUSTOMER_NAME:   string
  CUSTOMER_PHONE:  string
  MESSAGE_TEXT:    string
  SENDER_OWNER_ID: string
}

// ─── In-memory cache (5 min TTL) ─────────────────────────────────────────────

const CACHE_TTL = parseInt(process.env.GSHEET_CACHE_TTL_SECONDS ?? '300', 10) * 1_000
let _cache: { rows: SheetRow[]; fetchedAt: number } | null = null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeInt(v: string | undefined): string {
  if (!v) return ''
  const s = v.trim()
  if (/^\d+$/.test(s)) return s
  if (/^[\d.]+([eE][+\-]?\d+)?$/.test(s)) {
    const n = Number(s)
    if (isFinite(n) && n > 0) return Math.round(n).toString()
  }
  return s
}

export function dateFromTimestamp(ts: string): string {
  if (!ts) return ''
  const s = ts.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  try {
    const d = new Date(s)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })
  } catch { /* */ }
  return s.slice(0, 10)
}

const isSent     = (d: string) => d.includes('Sent')
const isReceived = (d: string) => d.includes('Received')
const isKnown    = (d: string) => isSent(d) || isReceived(d)

// ─── Test drive confirmation parsing (for Sheets) ─────────────────────────────

interface TestDriveInfo {
  confirmed: boolean
  date: string | null
  orderId: string | null
}

function parseTestDriveConfirmationSheets(rows: SheetRow[]): TestDriveInfo {
  // Look for "Sent" messages (from bot) containing test drive confirmation
  const confirmText = rows
    .filter((r) => isSent(r.DIRECTION))
    .map((r) => r.MESSAGE_TEXT.toLowerCase())
    .join(' ')

  const hasTestDrive = confirmText.includes('test drive')
  const hasConfirm = confirmText.includes('confirm') || confirmText.includes('book')

  if (!hasTestDrive || !hasConfirm) {
    return { confirmed: false, date: null, orderId: null }
  }

  // Extract date (e.g., "Monday 3pm", "Fri 15 Jun", "2026-06-15")
  const dateMatch = confirmText.match(
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)[\s\d:]+|(\d{1,2})\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\d{4}-\d{2}-\d{2}/i
  )
  const date = dateMatch ? dateMatch[0] : null

  // Extract order ID (e.g., "Order #12345" or "Order #ABC123")
  const orderMatch = confirmText.match(/order\s*[#]?\s*(\w+)/)
  const orderId = orderMatch ? orderMatch[1] : null

  return {
    confirmed: !!(date || orderId),
    date,
    orderId,
  }
}

// ─── Fetch + parse ────────────────────────────────────────────────────────────

async function getRows(): Promise<SheetRow[]> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL) return _cache.rows

  const url = process.env.GSHEET_CSV_URL
  if (!url) return []   // no URL configured — silently return empty

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Google Sheets fetch failed — HTTP ${res.status}`)

  const { data, errors } = Papa.parse<Record<string, string>>(await res.text(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toUpperCase(),
  })

  if (errors.length) console.warn('[sheets] parse warnings:', errors.slice(0, 3))

  const rows: SheetRow[] = data
    .map((r) => ({
      ENGAGEMENT_ID:   normalizeInt(r.ENGAGEMENT_ID),
      TIMESTAMP_AEST:  r.TIMESTAMP_AEST?.trim() ?? '',
      DIRECTION:       r.DIRECTION?.trim() ?? '',
      CUSTOMER_NAME:   r.CUSTOMER_NAME?.trim() ?? '',
      CUSTOMER_PHONE:  normalizeInt(r.CUSTOMER_PHONE),
      MESSAGE_TEXT:    r.MESSAGE_TEXT?.trim() ?? '',
      SENDER_OWNER_ID: normalizeInt(r.SENDER_OWNER_ID),
    }))
    .filter((r) => r.CUSTOMER_PHONE !== '')

  _cache = { rows, fetchedAt: Date.now() }
  return rows
}

// ─── Conversations from Google Sheets ────────────────────────────────────────

export async function getSheetConversations(
  date: string,
  search = ''
): Promise<Conversation[]> {
  const rows = await getRows()

  const dayRows = rows.filter(
    (r) => r.CUSTOMER_PHONE && isKnown(r.DIRECTION) && dateFromTimestamp(r.TIMESTAMP_AEST) === date
  )

  const map = new Map<string, {
    phone: string; firstAt: string; lastAt: string; firstDirection: string
    count: number; name: string; lastText: string; rows: SheetRow[]
  }>()

  for (const r of dayRows) {
    const p = r.CUSTOMER_PHONE
    const e = map.get(p)
    if (!e) {
      map.set(p, {
        phone: p, firstAt: r.TIMESTAMP_AEST, lastAt: r.TIMESTAMP_AEST, firstDirection: r.DIRECTION,
        count: 1,
        name: isReceived(r.DIRECTION) && r.CUSTOMER_NAME ? r.CUSTOMER_NAME : '',
        lastText: r.MESSAGE_TEXT ?? '',
        rows: [r],
      })
    } else {
      e.count++
      e.rows.push(r)
      if (r.TIMESTAMP_AEST < e.firstAt) e.firstAt = r.TIMESTAMP_AEST
      if (r.TIMESTAMP_AEST > e.lastAt) { e.lastAt = r.TIMESTAMP_AEST; e.lastText = r.MESSAGE_TEXT ?? '' }
      if (!e.name && isReceived(r.DIRECTION) && r.CUSTOMER_NAME) e.name = r.CUSTOMER_NAME
    }
  }

  const term = search.toLowerCase()

  return Array.from(map.values())
    .filter((c) => {
      if (!term) return true
      const name = (c.name || c.phone).toLowerCase()
      return name.includes(term) || c.phone.includes(term)
    })
    .map((c) => {
      const direction = isReceived(c.firstDirection) ? 'inbound' : 'outbound'
      const tdInfo = parseTestDriveConfirmationSheets(c.rows)
      return {
        id:                    c.phone,
        source:                'sheets' as const,
        phone:                 c.phone,
        customerName:          c.name || c.phone,
        archetypeKey:          '',
        archetype:             '',
        outcome:               '',
        outcomeDetail:         '',
        keyObservations:       [],
        direction,
        testDriveConfirmed:    tdInfo.confirmed,
        testDriveDate:         tdInfo.date,
        testDriveOrderId:      tdInfo.orderId,
        timestamp:             c.lastAt,
        messageCount:          c.count,
        lastMessageText:       c.lastText,
        firstMessageAt:        c.firstAt,
        lastMessageAt:         c.lastAt,
      }
    })
}

// ─── Messages from Google Sheets ─────────────────────────────────────────────

export async function getSheetMessages(
  phone: string,
  date: string
): Promise<{ messages: Message[]; customerName: string }> {
  const rows = await getRows()

  const filtered = rows
    .filter((r) => r.CUSTOMER_PHONE === phone && isKnown(r.DIRECTION) && dateFromTimestamp(r.TIMESTAMP_AEST) === date)
    .sort((a, b) => a.TIMESTAMP_AEST.localeCompare(b.TIMESTAMP_AEST))

  const customerName =
    filtered.find((r) => isReceived(r.DIRECTION) && r.CUSTOMER_NAME)?.CUSTOMER_NAME ?? phone

  return {
    messages: filtered.map((r) => ({
      engagementId:  r.ENGAGEMENT_ID,
      timestamp:     r.TIMESTAMP_AEST,
      direction:     isSent(r.DIRECTION) ? 'sent' : 'received',
      customerName:  r.CUSTOMER_NAME || null,
      phone:         r.CUSTOMER_PHONE,
      text:          r.MESSAGE_TEXT ?? '',
      senderOwnerId: r.SENDER_OWNER_ID || null,
    })),
    customerName,
  }
}
