import Papa from 'papaparse'
import { EventRow } from '../types/event'

export async function fetchEvents(): Promise<EventRow[]> {
  const csvUrl = process.env.SHEET_CSV_URL!
  const res = await fetch(csvUrl)
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`)
  const text = await res.text()

  const parsed = Papa.parse<EventRow>(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    console.error('CSV parse errors', parsed.errors)
    throw new Error('CSV parse error')
  }

  return parsed.data
}
