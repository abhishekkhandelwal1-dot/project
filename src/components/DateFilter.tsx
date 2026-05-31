'use client'

import { RefreshCw } from 'lucide-react'

interface Props {
  date: string
  onDateChange: (date: string) => void
  onRefresh: () => void
  total: number
  isLoading: boolean
}

export default function DateFilter({ date, onDateChange, onRefresh, total, isLoading }: Props) {
  return (
    <div className="flex items-center gap-3">

      {/* Conversation count pill */}
      {total > 0 && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6EE7B7' }} />
          <span className="text-xs font-semibold text-white tabular-nums">
            {total.toLocaleString()}
            <span className="font-normal ml-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              convos
            </span>
          </span>
        </div>
      )}

      {/* Date + refresh — grouped in a single pill */}
      <div
        className="flex items-center rounded-xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.22)',
        }}
      >
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="text-xs font-semibold px-3.5 py-2 border-0 outline-none cursor-pointer bg-transparent"
          style={{ color: '#ffffff', colorScheme: 'dark' }}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />

        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          className="flex items-center justify-center px-3 py-2 transition-all disabled:opacity-40"
          style={{ color: 'rgba(255,255,255,0.85)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

    </div>
  )
}
