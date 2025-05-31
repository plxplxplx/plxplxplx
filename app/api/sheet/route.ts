// app/api/sheet/route.ts
import { NextResponse } from 'next/server'
import { fetchEvents } from '../../lib/fetchEvents'

export async function GET() {
  try {
    const data = await fetchEvents()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
