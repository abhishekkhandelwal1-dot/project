import type { Message } from '@/types'
import { formatTime } from '@/lib/utils'

interface Props {
  message: Message
  customerInitial: string
  senderLabel: string   // "Pre BI Bot" or customer name
}

// ─── Text renderer — handles URLs and preserves line breaks ──────────────────

function renderText(text: string, linkColor: string): React.ReactNode {
  // Split on URLs first, then split each non-URL segment by newline
  const urlRe = /(https?:\/\/[^\s]+)/g
  const segments = text.split(urlRe)

  return (
    <>
      {segments.map((seg, i) => {
        if (urlRe.test(seg)) {
          // Reset lastIndex after test()
          urlRe.lastIndex = 0
          return (
            <a
              key={i}
              href={seg}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all"
              style={{ color: linkColor }}
            >
              {seg}
            </a>
          )
        }
        // Split on newlines and insert <br> between them
        const lines = seg.split('\n')
        return lines.map((line, j) => (
          <span key={`${i}-${j}`}>
            {line}
            {j < lines.length - 1 && <br />}
          </span>
        ))
      })}
    </>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MessageBubble({ message, senderLabel }: Props) {
  const { direction, text, timestamp, senderOwnerId } = message
  const isCx    = direction === 'received'
  const isAgent = !isCx && senderOwnerId !== null

  const bubbleCls  = isCx ? 'bubble-cx' : isAgent ? 'bubble-agent' : 'bubble-bot'
  const bubbleBg   = isCx ? 'var(--c24-bubble-cx)' : isAgent ? 'var(--c24-bubble-agent)' : 'var(--c24-bubble-bot)'
  const border     = isCx ? '1px solid var(--c24-border)' : 'none'
  const roundClass = isCx ? 'rounded-2xl rounded-tr-none' : 'rounded-2xl rounded-tl-none'
  const linkColor  = 'var(--c24-blue)'

  const time = formatTime(timestamp)

  return (
    <div className={`flex ${isCx ? 'justify-end' : 'justify-start'} px-5 mb-1`}>
      <div className={`relative max-w-[70%] ${roundClass} ${bubbleCls} shadow-sm`}
        style={{ background: bubbleBg, border }}>

        {/* Sender label — only on first appearance of agent */}
        {isAgent && (
          <div className="px-3.5 pt-2.5 pb-0">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#92400E' }}>
              Human Agent
            </span>
          </div>
        )}

        {/* Sender for bot — subtle label */}
        {!isCx && !isAgent && (
          <div className="px-3.5 pt-2.5 pb-0">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--c24-blue)' }}>
              {senderLabel}
            </span>
          </div>
        )}

        {/* Message body */}
        <div className="px-3.5 py-2 text-sm leading-relaxed" style={{ color: 'var(--c24-text)' }}>
          {renderText(text, linkColor)}
        </div>

        {/* Timestamp */}
        <div className="flex justify-end px-3.5 pb-2">
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--c24-muted)' }}>
            {time}
          </span>
        </div>
      </div>
    </div>
  )
}
