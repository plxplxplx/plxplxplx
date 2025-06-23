// app/api/upcoming/route.ts
import { NextResponse } from 'next/server'
import { fetchUpcoming } from '../../lib/fetchUpcoming'

export async function GET() {
  try {
    const data = await fetchUpcoming()
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
