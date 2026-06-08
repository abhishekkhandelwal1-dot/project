import {
  getAllSessions,
  getSessionById,
  dateFromTimestamp as jsonDate,
  formatArchetype,
} from './data'
import { getSheetConversations, getSheetMessages } from './sheets'
import type { Conversation, Message } from '@/types'

const BOT = 'BETTY'

// ─── Source detection ─────────────────────────────────────────────────────────
// JSON session IDs are 24-char hex (MongoDB ObjectID format).
// Google Sheets IDs are numeric phone numbers.

const isJsonId = (id: string) => /^[a-f0-9]{24}$/.test(id)

// ─── Direction detection ──────────────────────────────────────────────────────

function detectDirection(firstMessage: string): 'inbound' | 'outbound' {
  // If first message is from bot (BETTY), it's outbound (we initiated)
  // Otherwise, it's inbound (customer initiated)
  return firstMessage === BOT ? 'outbound' : 'inbound'
}

// ─── Test drive confirmation parsing ───────────────────────────────────────

interface TestDriveInfo {
  confirmed: boolean
  date: string | null
  orderId: string | null
}

function parseTestDriveConfirmation(messages: Array<{ speaker: string; text: string }>): TestDriveInfo {
  // Look for BETTY's message confirming test drive with date and order ID
  const confirmText = messages
    .filter((m) => m.speaker === BOT)
    .map((m) => m.text.toLowerCase())
    .join(' ')

  // Pattern: "test drive" + "confirm" + (date pattern OR order pattern)
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

// ─── JSON conversation helpers ────────────────────────────────────────────────

function jsonConversations(date: string, search: string): Conversation[] {
  const allSessions = getAllSessions()
  const term = search.toLowerCase()

  const filtered = allSessions.filter((s) => {
    const sessionDate = jsonDate(s.timestamp)
    if (sessionDate !== date) return false
    if (!term) return true
    return (
      s.persona_name.toLowerCase().includes(term) ||
      s.archetype_label.toLowerCase().includes(term) ||
      s.outcome.toLowerCase().includes(term)
    )
  })

  return filtered.map((s) => {
    const msgs = s.conversation
    const direction = detectDirection(msgs[0]?.speaker ?? '')
    const tdInfo = parseTestDriveConfirmation(msgs)

    return {
      id:                    s.session_id,
      source:                'json' as const,
      phone:                 s.session_id,
      customerName:          s.persona_name,
      archetypeKey:          s.archetype_label,
      archetype:             formatArchetype(s.archetype_label),
      outcome:               s.outcome,
      outcomeDetail:         s.outcome_detail,
      keyObservations:       s.key_observations ?? [],
      direction,
      testDriveConfirmed:    tdInfo.confirmed,
      testDriveDate:         tdInfo.date,
      testDriveOrderId:      tdInfo.orderId,
      timestamp:             s.timestamp,
      messageCount:          msgs.length,
      lastMessageText:       msgs[msgs.length - 1]?.text ?? '',
      firstMessageAt:        s.timestamp,
      lastMessageAt:         s.timestamp,
    }
  })
}

// ─── Unified conversation list (JSON + Sheets merged) ────────────────────────

export async function getConversations(
  date: string,
  page: number,
  limit: number,
  search = ''
): Promise<{ conversations: Conversation[]; total: number }> {
  // Fetch both sources concurrently; if Sheets fails (e.g. no URL set) degrade gracefully
  const [sheetResult] = await Promise.allSettled([
    getSheetConversations(date, search),
  ])

  const fromSheets = sheetResult.status === 'fulfilled' ? sheetResult.value : []
  const fromJson   = jsonConversations(date, search)

  // Merge and sort newest-first
  const all = [...fromJson, ...fromSheets].sort(
    (a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)
  )

  const total  = all.length
  const offset = (page - 1) * limit

  return { conversations: all.slice(offset, offset + limit), total }
}

// ─── Unified transcript (routes to correct source by ID shape) ───────────────

export async function getConversationMessages(
  id: string,
  date: string
): Promise<{ messages: Message[]; customerName: string }> {
  if (isJsonId(id)) {
    return getJsonMessages(id)
  }
  return getSheetMessages(id, date)
}

function getJsonMessages(sessionId: string): { messages: Message[]; customerName: string } {
  const session = getSessionById(sessionId)
  if (!session) return { messages: [], customerName: sessionId }

  return {
    customerName: session.persona_name,
    messages: session.conversation.map((msg, i) => ({
      engagementId:  `${sessionId}-${i}`,
      timestamp:     session.timestamp,
      direction:     msg.speaker === BOT ? 'sent' : 'received',
      customerName:  msg.speaker !== BOT ? session.persona_name : null,
      phone:         sessionId,
      text:          msg.text,
      senderOwnerId: null,
    })),
  }
}
