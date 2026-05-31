const rows = [
  { w: '52%', cx: false },
  { w: '44%', cx: false },
  { w: '35%', cx: true  },
  { w: '61%', cx: false },
  { w: '28%', cx: true  },
  { w: '67%', cx: false },
  { w: '40%', cx: true  },
]

export default function TranscriptSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 flex-shrink-0 animate-pulse"
        style={{ height: 72, background: 'linear-gradient(135deg, #2B28A0 0%, #3836D4 60%, #4845DA 100%)' }}>
        <div className="w-10 h-10 rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div>
          <div className="h-3.5 rounded w-36 mb-2" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <div className="h-3 rounded w-48" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-3 overflow-hidden animate-pulse"
        style={{ background: 'var(--c24-blue-mist)' }}>
        {rows.map(({ w, cx }, i) => (
          <div key={i} className={`flex ${cx ? 'justify-end' : 'justify-start'}`}>
            <div className="h-11 rounded-2xl"
              style={{
                width: w,
                background: cx ? 'rgba(56,54,212,0.12)' : 'rgba(56,54,212,0.07)',
              }} />
          </div>
        ))}
      </div>
    </div>
  )
}
