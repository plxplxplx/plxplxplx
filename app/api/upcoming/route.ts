// app/api/upcoming/route.ts
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

/** Shape of one row in the “Upcoming Events” sheet */
export interface UpcomingRow {
  Date        : string
  Title       : string
  Location    : string
  Link        : string
  Description : string
}

export async function GET() {
  const url = process.env.UPCOMING_SHEET_CSV_URL
  if (!url) {
    return NextResponse.json(
      { error: 'Missing UPCOMING_SHEET_CSV_URL' },
      { status: 500 },
    )
  }

  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch sheet' },
      { status: 502 },
    )
  }

  const csv = await res.text()
  const parsed = Papa.parse<UpcomingRow>(csv, {
    header: true,
    skipEmptyLines: true,
  })

  return NextResponse.json(parsed.data)
}
