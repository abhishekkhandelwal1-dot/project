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

// ─── JSON conversation helpers ────────────────────────────────────────────────

function jsonConversations(date: string, search: string): Conversation[] {
  const term = search.toLowerCase()
  return getAllSessions()
    .filter((s) => {
      if (jsonDate(s.timestamp) !== date) return false
      if (!term) return true
      return (
        s.persona_name.toLowerCase().includes(term) ||
        s.archetype_label.toLowerCase().includes(term) ||
        s.outcome.toLowerCase().includes(term)
      )
    })
    .map((s) => {
      const msgs = s.conversation
      return {
        id:              s.session_id,
        source:          'json' as const,
        phone:           s.session_id,
        customerName:    s.persona_name,
        archetype:       formatArchetype(s.archetype_label),
        outcome:         s.outcome,
        outcomeDetail:   s.outcome_detail,
        timestamp:       s.timestamp,
        messageCount:    msgs.length,
        lastMessageText: msgs[msgs.length - 1]?.text ?? '',
        firstMessageAt:  s.timestamp,
        lastMessageAt:   s.timestamp,
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
