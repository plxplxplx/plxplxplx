import Papa from 'papaparse'
import { EventRow } from '../types/event'

function isEventRow(obj: unknown): obj is EventRow {
  if (typeof obj !== 'object' || obj === null) return false
  const row = obj as Record<string, unknown>

  return (
    typeof row.Titel === 'string' &&
    typeof row.Kategori === 'string' &&
    typeof row.Plats === 'string' &&
    typeof row.Startdatum === 'string' &&
    (typeof row.Beskrivning === 'string' || row.Beskrivning === undefined) &&
    (typeof row.Medverkande === 'string' || row.Medverkande === undefined) &&
    (typeof row['Länk alla bilder'] === 'string' || row['Länk alla bilder'] === undefined) &&
    (typeof row['Länk utvalda bilder'] === 'string' || row['Länk utvalda bilder'] === undefined) &&
    (typeof row['Länk till event'] === 'string' || row['Länk till event'] === undefined)
  )
}

export async function fetchEvents(): Promise<EventRow[]> {
  const csvUrl = process.env.SHEET_CSV_URL!
  const res = await fetch(csvUrl, { cache: 'no-store' }) // Always fetch fresh data
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`)

  const text = await res.text()

  const parsed = Papa.parse<unknown>(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    console.error('CSV parse errors', parsed.errors)
    throw new Error('CSV parse error')
  }

  const rows = parsed.data
  const validated: EventRow[] = rows.filter(isEventRow)

  if (validated.length !== rows.length) {
    console.warn(`Some rows were skipped due to invalid format. Valid: ${validated.length}, Total: ${rows.length}`)
  }

  return validated
}
