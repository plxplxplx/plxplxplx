// app/api/articles/route.ts
import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { ArticleRow } from '../../types/article'

export async function GET() {
  const url = process.env.ARTICLES_SHEET_CSV_URL
  if (!url) {
    return NextResponse.json({ error: 'Missing ARTICLES_SHEET_CSV_URL' }, { status: 500 })
  }

  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch sheet' }, { status: 502 })
  }

  const csv = await res.text()
  const parsed = Papa.parse<ArticleRow>(csv, {
    header: true,
    skipEmptyLines: true,
  })

  return NextResponse.json(parsed.data)
}
//end of file
