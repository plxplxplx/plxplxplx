import Papa from 'papaparse'

export interface ArticleRow {
  År: string
  Datum: string
  Titel: string
  Medium: string
  Sammanfattning: string
  Länk: string
}

const CSV_URL = process.env.ARTICLES_SHEET_CSV_URL!

function isArticleRow(obj: unknown): obj is ArticleRow {
  if (typeof obj !== 'object' || obj === null) return false
  const row = obj as Record<string, unknown>

  return (
    typeof row['År'] === 'string' &&
    typeof row['Datum'] === 'string' &&
    typeof row['Titel'] === 'string' &&
    typeof row['Medium'] === 'string' &&
    typeof row['Sammanfattning'] === 'string' &&
    typeof row['Länk'] === 'string'
  )
}

export async function fetchArticles(): Promise<ArticleRow[]> {
  const res = await fetch(CSV_URL, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch article sheet: ${res.status}`)
  }

  const csv = await res.text()

  const parsed = Papa.parse<unknown>(csv, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    console.error(parsed.errors)
    throw new Error('Error parsing CSV')
  }

  const rows = parsed.data
  const validated: ArticleRow[] = rows.filter(isArticleRow)

  if (validated.length !== rows.length) {
    console.warn(
      `Some article rows were skipped due to invalid format. Valid: ${validated.length}, Total: ${rows.length}`
    )
  }

  return validated
}
