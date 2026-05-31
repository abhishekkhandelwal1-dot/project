interface Props {
  message: string
  sub?: string
}

export default function EmptyState({ message, sub }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'var(--c24-blue-light)' }}>
        <svg className="w-6 h-6" style={{ color: 'var(--c24-blue-mid)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--c24-text)' }}>{message}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--c24-secondary)' }}>{sub}</p>}
    </div>
  )
}
