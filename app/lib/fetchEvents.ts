import Papa from 'papaparse'
import { EventRow } from '../types/event'

function isEventRow(obj: any): obj is EventRow {
  return (
    typeof obj.Titel === 'string' &&
    typeof obj.Kategori === 'string' &&
    typeof obj.Plats === 'string' &&
    typeof obj.Startdatum === 'string' &&
    (typeof obj.Beskrivning === 'string' || obj.Beskrivning === undefined) &&
    (typeof obj.Medverkande === 'string' || obj.Medverkande === undefined) &&
    (typeof obj['Länk alla bilder'] === 'string' || obj['Länk alla bilder'] === undefined) &&
    (typeof obj['Länk utvalda bilder'] === 'string' || obj['Länk utvalda bilder'] === undefined) &&
    (typeof obj['Länk till event'] === 'string' || obj['Länk till event'] === undefined)
  )
}

export async function fetchEvents(): Promise<EventRow[]> {
  const csvUrl = process.env.SHEET_CSV_URL!
  const res = await fetch(csvUrl, { cache: 'no-store' }) // ensure fresh data
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`)
  const text = await res.text()

  const parsed = Papa.parse(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    console.error('CSV parse errors', parsed.errors)
    throw new Error('CSV parse error')
  }

  const rows = parsed.data as unknown[]

  const validated = rows.filter(isEventRow)

  if (validated.length !== rows.length) {
    console.warn(`Some rows were skipped due to invalid format. Valid: ${validated.length}, Total: ${rows.length}`)
  }

  return validated
}
