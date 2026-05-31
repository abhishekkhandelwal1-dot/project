'use client'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-3 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--c24-muted)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or phone…"
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none border focus:border-transparent focus:ring-2"
        style={{
          background: 'var(--c24-white)',
          color: 'var(--c24-text)',
          borderColor: 'var(--c24-border)',
          '--tw-ring-color': 'var(--c24-blue)',
        } as React.CSSProperties}
      />

      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 flex items-center justify-center w-4 h-4 rounded-full"
          style={{ background: 'var(--c24-muted)' }}
        >
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
