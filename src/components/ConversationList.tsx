import ConversationItem from './ConversationItem'
import ConversationListSkeleton from './skeletons/ConversationListSkeleton'
import EmptyState from './EmptyState'
import type { Conversation } from '@/types'

interface Props {
  conversations: Conversation[]
  selectedPhone: string | null
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  total: number
  onSelect: (conv: Conversation) => void
  onPageChange: (page: number) => void
}

export default function ConversationList({
  conversations, selectedPhone, isLoading, error,
  page, totalPages, onSelect, onPageChange,
}: Props) {
  if (isLoading) return <ConversationListSkeleton />

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#FEE2E2' }}
          >
            <svg className="w-5 h-5" style={{ color: '#DC2626' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>Failed to load</p>
          <p className="text-xs mt-1" style={{ color: 'var(--c24-secondary)' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return <EmptyState message="No conversations" sub="Try a different date or clear the search" />
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.phone}
            conversation={conv}
            isSelected={selectedPhone === conv.phone}
            onClick={() => onSelect(conv)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t flex-shrink-0"
          style={{ borderColor: 'var(--c24-border)', background: 'var(--c24-panel)' }}
        >
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-30"
            style={{ color: 'var(--c24-blue)' }}
          >
            ← Prev
          </button>
          <span className="text-xs tabular-nums" style={{ color: 'var(--c24-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-30"
            style={{ color: 'var(--c24-blue)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
