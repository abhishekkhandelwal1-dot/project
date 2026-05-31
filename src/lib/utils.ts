export function formatPhone(phone: string): string {
  if (/^61\d{9}$/.test(phone)) {
    const local = phone.slice(2)
    return `+61 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  return phone
}

export function formatTime(timestamp: string): string {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Sydney',
    })
  } catch {
    return ''
  }
}

export function formatDate(timestamp: string): string {
  if (!timestamp) return ''
  try {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Australia/Sydney',
    })
  } catch {
    return ''
  }
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export function getPreviousDayAEST(): string {
  const aest = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })
  )
  aest.setDate(aest.getDate() - 1)
  const y = aest.getFullYear()
  const m = String(aest.getMonth() + 1).padStart(2, '0')
  const d = String(aest.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
