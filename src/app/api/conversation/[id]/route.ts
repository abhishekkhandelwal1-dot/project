import { NextRequest, NextResponse } from 'next/server'
import { getConversationMessages } from '@/lib/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE    = /^\d{4}-\d{2}-\d{2}$/
const SESSION_RE = /^[a-zA-Z0-9_-]+$/   // hex session IDs + plain strings

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const date   = request.nextUrl.searchParams.get('date')

  if (!id || !SESSION_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid session ID in path.' }, { status: 400 })
  }

  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: 'Invalid or missing date. Expected YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  try {
    const { messages, customerName } = await getConversationMessages(id, date)

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found for this conversation.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      messages,
      phone: id,
      customerName,
      date,
      messageCount: messages.length,
    })
  } catch (err) {
    console.error(`[GET /api/conversation/${id}]`, err)
    return NextResponse.json(
      { error: 'Failed to load conversation.' },
      { status: 500 }
    )
  }
}
