'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TranscriptSkeleton from './skeletons/TranscriptSkeleton'
import { formatPhone, formatDate } from '@/lib/utils'
import type { Message, Conversation } from '@/types'

interface Props {
  conversation: Conversation | null
  messages: Message[]
  phone: string | null
  date: string
  isLoading: boolean
  error: string | null
}

const OUTCOME_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  TEST_DRIVE_BOOKED: { label: 'Test Drive Booked',  bg: '#DCFCE7', color: '#15803D' },
  CALLBACK_ARRANGED: { label: 'Callback Arranged',  bg: '#DBEAFE', color: '#1D4ED8' },
  DROPOFF:           { label: 'Drop-off',           bg: '#F3F4F6', color: '#6B7280' },
}

export default function TranscriptViewer({
  conversation, messages, phone, date, isLoading, error,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length > 0) bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages])

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!phone) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8"
        style={{ background: 'var(--c24-blue-mist)' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ background: 'rgba(56,54,212,0.08)' }}>
          <svg className="w-9 h-9" style={{ color: 'var(--c24-blue-mid)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-base font-semibold" style={{ color: 'var(--c24-secondary)' }}>
          Select a conversation
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--c24-muted)' }}>
          Pick one from the list to read the full transcript
        </p>
      </div>
    )
  }

  if (isLoading) return <TranscriptSkeleton />

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
      </div>
    )
  }

  const customerName  = conversation?.customerName ?? phone
  const initial       = customerName.charAt(0).toUpperCase()
  const displayDate   = date ? formatDate(date + 'T12:00:00+10:00') : date
  const outcomeCfg    = conversation ? (OUTCOME_CONFIG[conversation.outcome] ?? null) : null

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{
          height: 72,
          background: 'linear-gradient(135deg, #2B28A0 0%, #3836D4 60%, #4845DA 100%)',
          boxShadow: '0 4px 24px rgba(43,40,160,0.35)',
        }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
        >
          {initial}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-white text-sm leading-none">{customerName}</p>
            {outcomeCfg && (
              <span
                className="text-[10px] font-semibold rounded-full px-2 py-0.5 leading-none"
                style={{ background: outcomeCfg.bg, color: outcomeCfg.color }}
              >
                {outcomeCfg.label}
              </span>
            )}
          </div>
          <p className="text-xs mt-1.5 leading-none" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {conversation?.archetype && (
              <span className="mr-2">{conversation.archetype}</span>
            )}
            {displayDate} · {messages.length} messages
          </p>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {[
            { bg: 'var(--c24-bubble-bot)',   label: 'Pre BI Bot' },
            { bg: 'var(--c24-bubble-agent)', label: 'Agent'      },
            { bg: 'var(--c24-bubble-cx)',     label: 'Customer'   },
          ].map(({ bg, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px]"
              style={{ color: 'rgba(255,255,255,0.65)' }}>
              <span className="w-2.5 h-2.5 rounded-full border border-white/30 inline-block"
                style={{ background: bg }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-5" style={{ background: 'var(--c24-blue-mist)' }}>
        <div className="flex justify-center mb-5">
          <span className="date-chip">{displayDate}</span>
        </div>

        <div className="space-y-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.engagementId}
              message={msg}
              customerInitial={initial}
              senderLabel="Pre BI Bot"
            />
          ))}
        </div>

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  )
}
