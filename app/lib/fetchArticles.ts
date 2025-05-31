// lib/fetchArticles.ts
import Papa from 'papaparse'
import { ArticleRow } from '../types/article'

const CSV_URL = process.env.ARTICLES_SHEET_CSV_URL!

export async function fetchArticles(): Promise<ArticleRow[]> {
  // 1) fetch the raw CSV text
  const res = await fetch(CSV_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet: ${res.status}`)
  }
  const csv = await res.text()

  // 2) parse it
  const parsed = Papa.parse<ArticleRow>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  if (parsed.errors.length) {
    console.error(parsed.errors)
    throw new Error('Error parsing CSV')
  }

  return parsed.data
}
