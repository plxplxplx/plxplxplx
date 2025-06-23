// lib/fetchUpcoming.ts
import Papa from 'papaparse'

export interface UpcomingRow {
  Titel: string
  Kategori: string
  Beskrivning: string
  Medverkande: string
  Startdatum: string
  Slutdatum: string
  Plats: string
  'Länk till event'?: string
}

const CSV_URL = process.env.UPCOMING_SHEET_CSV_URL!

function isUpcomingRow(obj: unknown): obj is UpcomingRow {
  if (typeof obj !== 'object' || obj === null) return false
  const row = obj as Record<string, unknown>

  return (
    typeof row.Titel === 'string' &&
    typeof row.Kategori === 'string' &&
    typeof row.Beskrivning === 'string' &&
    typeof row.Medverkande === 'string' &&
    typeof row.Startdatum === 'string' &&
    typeof row.Slutdatum === 'string' &&
    typeof row.Plats === 'string' &&
    (typeof row['Länk till event'] === 'string' || typeof row['Länk till event'] === 'undefined')
  )
}

export async function fetchUpcoming(): Promise<UpcomingRow[]> {
  const res = await fetch(CSV_URL, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch upcoming sheet: ${res.status}`)
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
  const validated: UpcomingRow[] = rows.filter(isUpcomingRow)

  if (validated.length !== rows.length) {
    console.warn(
      `Some upcoming rows were skipped due to invalid format. Valid: ${validated.length}, Total: ${rows.length}`
    )
  }

  return validated
}
