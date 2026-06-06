export function formatPhone(phone: string): string {
  if (/^61\d{9}$/.test(phone)) {
    const local = phone.slice(2)
    return `+61 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  return phone
}

export function formatTime(timestamp: string): string {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Sydney',
    })
  } catch { return '' }
}

export function formatDate(timestamp: string): string {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Australia/Sydney',
    })
  } catch { return '' }
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export function getPreviousDayAEST(): string {
  const aest = new Date(new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' }))
  aest.setDate(aest.getDate() - 1)
  const y = aest.getFullYear()
  const m = String(aest.getMonth() + 1).padStart(2, '0')
  const d = String(aest.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Customer tag system ──────────────────────────────────────────────────────

export interface CustomerTag {
  label:  string
  bg:     string
  color:  string
  border?: string
}

// Lead temperature derived from outcome
const LEAD_TEMP: Record<string, CustomerTag> = {
  TEST_DRIVE_BOOKED: { label: '🔥 Hot Lead',  bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  CALLBACK_ARRANGED: { label: '🌡 Warm Lead', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  DROPOFF:           { label: '🧊 Cold',      bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
}

// Buyer type from archetype key
const ARCHETYPE_TAG: Record<string, CustomerTag> = {
  TRADE_IN_FOCUSED:              { label: 'Trade-in',       bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  CASH_BUYER_URGENT:             { label: 'Cash Buyer',     bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  STAMP_DUTY_SHOCKED:            { label: 'Price Sensitive', bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  INTERSTATE_REMOTE_BUYER:       { label: 'Remote Buyer',   bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  REPAYMENT_CALCULATOR:          { label: 'Finance',        bg: '#FEFCE8', color: '#A16207', border: '#FEF08A' },
  SERVICE_HISTORY_DUE_DILIGENCE: { label: 'Due Diligence',  bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  PRICE_BEFORE_TEST_DRIVE:       { label: 'Price Focus',    bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  C2B_SELLER:                    { label: 'Seller',         bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' },
  FAMILY_UPGRADE_BUYER:          { label: 'Family',         bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
  BYOF_PREAPPROVED:              { label: 'Pre-Approved',   bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
}

// Extra context tags derived from archetype
const EXTRA_TAGS: Record<string, CustomerTag[]> = {
  CASH_BUYER_URGENT: [
    { label: '⚡ Urgent',      bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3' },
    { label: 'Same-day pickup', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  ],
  INTERSTATE_REMOTE_BUYER: [
    { label: 'Virtual TD',  bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
    { label: 'Home delivery', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  ],
  BYOF_PREAPPROVED: [
    { label: 'Same-day Invoice', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  ],
  FAMILY_UPGRADE_BUYER: [
    { label: '7-seater', bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF' },
  ],
  TRADE_IN_FOCUSED: [
    { label: 'Needs valuation', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  ],
  SERVICE_HISTORY_DUE_DILIGENCE: [
    { label: 'Wants PPSR', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  ],
}

export function getCustomerTags(archetypeKey: string, outcome: string): CustomerTag[] {
  const tags: CustomerTag[] = []
  if (LEAD_TEMP[outcome])        tags.push(LEAD_TEMP[outcome])
  if (ARCHETYPE_TAG[archetypeKey]) tags.push(ARCHETYPE_TAG[archetypeKey])
  if (EXTRA_TAGS[archetypeKey])  tags.push(...EXTRA_TAGS[archetypeKey])
  return tags
}
