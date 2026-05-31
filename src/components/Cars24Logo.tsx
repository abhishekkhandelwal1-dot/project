// Cars24 logo mark — replace /public/cars24-logo.png with your actual file
// if you want pixel-perfect branding. This SVG approximation matches the
// blue rounded-square icon + wordmark from the brand guidelines.

export default function Cars24Logo({ height = 28 }: { height?: number }) {
  const aspect = 110 / 32
  const width  = Math.round(height * aspect)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 110 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cars24"
    >
      {/* ── Icon badge ───────────────────────────────────────────────── */}
      <rect width="32" height="32" rx="7" fill="#3836D4" />

      {/* Outer arc — stylised C / steering-wheel arc */}
      <path
        d="M24 8.5C21.4 6.3 18.0 5 14.3 5C7.5 5 2 10.5 2 17C2 23.5 7.5 29 14.3 29C18.0 29 21.4 27.7 24 25.5"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Small filled circle at arc end — Cars24 dot motif */}
      <circle cx="24" cy="8.5" r="2.4" fill="white" />

      {/* ── Wordmark ─────────────────────────────────────────────────── */}
      <text
        x="38"
        y="22"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="14.5"
        fontWeight="800"
        letterSpacing="-0.3"
        fill="white"
      >
        Cars24
      </text>
    </svg>
  )
}
