'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import DateFilter from './DateFilter'
import SearchBar from './SearchBar'
import ConversationList from './ConversationList'
import TranscriptViewer from './TranscriptViewer'
import Cars24Logo from './Cars24Logo'
import { getPreviousDayAEST } from '@/lib/utils'
import type {
  Conversation,
  Message,
  ConversationsApiResponse,
  ConversationApiResponse,
} from '@/types'

const PAGE_SIZE = 50

export default function ChatbotViewer() {
  const [date, setDate]                       = useState<string>(getPreviousDayAEST())
  const [search, setSearch]                   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage]                       = useState(1)
  const [conversations, setConversations]     = useState<Conversation[]>([])
  const [total, setTotal]                     = useState(0)
  const [totalPages, setTotalPages]           = useState(0)
  const [isLoadingConvs, setIsLoadingConvs]   = useState(false)
  const [convsError, setConvsError]           = useState<string | null>(null)
  const [selectedPhone, setSelectedPhone]     = useState<string | null>(null)
  const [selectedConv, setSelectedConv]       = useState<Conversation | null>(null)
  const [messages, setMessages]               = useState<Message[]>([])
  const [isLoadingMsgs, setIsLoadingMsgs]     = useState(false)
  const [msgsError, setMsgsError]             = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const fetchConversations = useCallback(async () => {
    setIsLoadingConvs(true)
    setConvsError(null)
    try {
      const params = new URLSearchParams({ date, page: String(page), limit: String(PAGE_SIZE) })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/conversations?${params}`)
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      const data: ConversationsApiResponse = await res.json()
      setConversations(data.conversations)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setConvsError(msg)
      setConversations([])
    } finally {
      setIsLoadingConvs(false)
    }
  }, [date, page, debouncedSearch])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchConversations()
  }, [date, page, debouncedSearch])

  const handleDateChange = useCallback((d: string) => {
    setDate(d); setPage(1); setSearch(''); setDebouncedSearch('')
    setSelectedPhone(null); setSelectedConv(null); setMessages([]); setMsgsError(null)
  }, [])

  const handleSelect = useCallback(async (conv: Conversation) => {
    if (selectedPhone === conv.phone && messages.length > 0) return
    setSelectedPhone(conv.phone); setSelectedConv(conv)
    setMessages([]); setMsgsError(null); setIsLoadingMsgs(true)
    try {
      const res = await fetch(`/api/conversation/${encodeURIComponent(conv.phone)}?date=${date}`)
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`)
      const data: ConversationApiResponse = await res.json()
      setMessages(data.messages)
    } catch (err) {
      setMsgsError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoadingMsgs(false)
    }
  }, [selectedPhone, messages.length, date])

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          height: 72,
          background: 'linear-gradient(135deg, #2B28A0 0%, #3836D4 60%, #4845DA 100%)',
          boxShadow: '0 4px 24px rgba(43,40,160,0.45)',
        }}
      >
        {/* ── Left: brand identity ───────────────────────────────────── */}
        <div className="flex items-center gap-4">
          {/* Cars24 logo badge */}
          <div
            className="flex items-center justify-center rounded-xl px-2 py-1.5"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <Cars24Logo height={22} />
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />

          {/* Product title */}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-extrabold leading-none tracking-tight"
                style={{ fontSize: 17 }}>
                Pre BI Bot
              </p>
              <span
                className="text-white font-bold tracking-widest leading-none"
                style={{
                  fontSize: 9,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  letterSpacing: '0.08em',
                }}
              >
                INTERNAL
              </span>
            </div>
            <p className="leading-none mt-1.5" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
              Conversation Viewer
            </p>
          </div>
        </div>

        {/* ── Right: controls ────────────────────────────────────────── */}
        <DateFilter
          date={date}
          onDateChange={handleDateChange}
          onRefresh={fetchConversations}
          total={total}
          isLoading={isLoadingConvs}
        />
      </header>

      {/* ── Two-panel body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — conversation list */}
        <div
          className="flex flex-col border-r flex-shrink-0"
          style={{ width: 380, background: 'var(--c24-panel)', borderColor: 'var(--c24-border)' }}
        >
          <div className="px-3 py-2.5" style={{ background: 'var(--c24-search-bg)', borderBottom: '1px solid var(--c24-border)' }}>
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <ConversationList
            conversations={conversations}
            selectedPhone={selectedPhone}
            isLoading={isLoadingConvs}
            error={convsError}
            page={page}
            totalPages={totalPages}
            total={total}
            onSelect={handleSelect}
            onPageChange={setPage}
          />
        </div>

        {/* Right — transcript */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--c24-blue-mist)' }}>
          <TranscriptViewer
            conversation={selectedConv}
            messages={messages}
            phone={selectedPhone}
            date={date}
            isLoading={isLoadingMsgs}
            error={msgsError}
          />
        </div>

      </div>
    </div>
  )
}
