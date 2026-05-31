import { formatTime } from '@/lib/utils'
import type { Conversation } from '@/types'

// ─── Outcome badge ────────────────────────────────────────────────────────────

const OUTCOME_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  TEST_DRIVE_BOOKED:  { label: 'Test Drive',  bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  CALLBACK_ARRANGED:  { label: 'Callback',    bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  DROPOFF:            { label: 'Drop-off',    bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const cfg = OUTCOME_CONFIG[outcome] ?? { label: outcome, bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ─── Avatar colour ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3836D4', '#5654D8', '#4F46E5', '#7C3AED',
  '#2563EB', '#0284C7', '#0D9488', '#059669',
]
function avatarColor(name: string): string {
  const n = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

export default function ConversationItem({ conversation, isSelected, onClick }: Props) {
  const { customerName, timestamp, messageCount, lastMessageText, outcome, archetype } = conversation

  const initials = customerName
    .split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

  // Show a clean one-line preview — strip leading "Hey NAME!" salutation if present
  const preview = lastMessageText
    .replace(/^Hey \w+! /, '')  // remove greeting
    .replace(/\n/g, ' ')        // flatten newlines
    .trim()

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors"
      style={{
        background:  isSelected ? 'var(--c24-blue-light)' : 'transparent',
        borderBottom: '1px solid var(--c24-border)',
        borderLeft:  isSelected ? '3px solid var(--c24-blue)' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'var(--c24-blue-mist)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected ? 'var(--c24-blue-light)' : 'transparent'
      }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white mt-0.5"
        style={{ background: isSelected ? 'var(--c24-blue)' : avatarColor(customerName) }}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + time */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-sm font-semibold truncate leading-tight"
            style={{ color: isSelected ? 'var(--c24-blue)' : 'var(--c24-text)' }}
          >
            {customerName}
          </span>
          <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: 'var(--c24-muted)' }}>
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Row 2: badges */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {/* Source tag */}
          <span
            className="text-[9px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 flex-shrink-0"
            style={
              conversation.source === 'json'
                ? { background: '#FEF3C7', color: '#92400E' }
                : { background: '#E0F2FE', color: '#0369A1' }
            }
          >
            {conversation.source === 'json' ? 'Test' : 'Live'}
          </span>

          {outcome && <OutcomeBadge outcome={outcome} />}

          {archetype && (
            <span
              className="text-[10px] font-medium rounded-full px-2 py-0.5 flex-shrink-0"
              style={{ background: 'var(--c24-blue-light)', color: 'var(--c24-blue)' }}
            >
              {archetype}
            </span>
          )}

          <span className="text-[10px] tabular-nums ml-auto flex-shrink-0" style={{ color: 'var(--c24-muted)' }}>
            {messageCount} msgs
          </span>
        </div>

        {/* Row 3: preview text */}
        <p
          className="text-xs mt-1.5 leading-relaxed line-clamp-2"
          style={{ color: 'var(--c24-secondary)' }}
        >
          {preview || '—'}
        </p>
      </div>
    </button>
  )
}
