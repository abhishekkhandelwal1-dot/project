import rawData from '@/data/conversations.json'

// ─── JSON schema types ────────────────────────────────────────────────────────

export interface ConvMessage {
  speaker: string   // "BETTY" | customer name (uppercase)
  text: string
}

export interface ConvSession {
  persona_id:       string
  persona_name:     string
  archetype_label:  string
  session_id:       string
  outcome:          string
  outcome_detail:   string
  turns:            number
  timestamp:        string      // ISO — represents the start of the session
  conversation:     ConvMessage[]
  key_observations?: string[]
}

// ─── Singleton — loaded once per process ─────────────────────────────────────

const ALL_SESSIONS: ConvSession[] = rawData as ConvSession[]

export function getAllSessions(): ConvSession[] {
  return ALL_SESSIONS
}

export function getSessionById(id: string): ConvSession | undefined {
  return ALL_SESSIONS.find((s) => s.session_id === id)
}

// ─── Date helper ─────────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD in AEST for an ISO timestamp. */
export function dateFromTimestamp(ts: string): string {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })
    }
  } catch { /* ignore */ }
  return ts.slice(0, 10)
}

// ─── Archetype label map ──────────────────────────────────────────────────────

const ARCHETYPE_MAP: Record<string, string> = {
  TRADE_IN_FOCUSED:              'Trade-in',
  CASH_BUYER_URGENT:             'Cash Buyer',
  STAMP_DUTY_SHOCKED:            'Stamp Duty',
  INTERSTATE_REMOTE_BUYER:       'Remote Buyer',
  REPAYMENT_CALCULATOR:          'Repayments',
  SERVICE_HISTORY_DUE_DILIGENCE: 'Due Diligence',
  PRICE_BEFORE_TEST_DRIVE:       'Price Focus',
  C2B_SELLER:                    'Seller',
  FAMILY_UPGRADE_BUYER:          'Family',
  BYOF_PREAPPROVED:              'Pre-Approved',
}

export function formatArchetype(label: string): string {
  return ARCHETYPE_MAP[label] ?? label.replace(/_/g, ' ')
}
