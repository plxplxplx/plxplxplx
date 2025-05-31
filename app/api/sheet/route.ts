import { NextResponse } from 'next/server'
import { fetchEvents } from '../../lib/fetchEvents'

export async function GET() {
  try {
    const data = await fetchEvents()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
