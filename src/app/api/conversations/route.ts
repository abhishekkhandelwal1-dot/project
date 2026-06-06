import { NextRequest, NextResponse } from 'next/server'
import { getConversations } from '@/lib/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams

  const date = sp.get('date')
  const search = sp.get('search') ?? ''
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') ?? '50', 10) || 50))

  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: 'Invalid or missing date. Expected YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  try {
    const { conversations, total } = await getConversations(date, page, limit, search)

    return NextResponse.json({
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[API /conversations] error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch conversations.' },
      { status: 500 }
    )
  }
}
