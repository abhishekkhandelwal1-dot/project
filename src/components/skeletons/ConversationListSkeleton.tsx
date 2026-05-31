export default function ConversationListSkeleton() {
  return (
    <div className="flex-1 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse"
          style={{ borderBottom: '1px solid var(--c24-border)' }}>
          <div className="w-11 h-11 rounded-full flex-shrink-0"
            style={{ background: 'var(--c24-blue-light)' }} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-2">
              <div className="h-3.5 rounded w-28" style={{ background: 'var(--c24-blue-light)' }} />
              <div className="h-3 rounded w-10" style={{ background: 'var(--c24-border)' }} />
            </div>
            <div className="h-3 rounded w-full" style={{ background: 'var(--c24-border)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
