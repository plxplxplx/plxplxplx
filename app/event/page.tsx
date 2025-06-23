// app/page.tsx
import { fetchEvents } from '../lib/fetchEvents'
import SheetTable from '../components/SheetTable'

export default async function Page() {
  const data = await fetchEvents()

  return (
    <main className="max-w-screen-xl mx-auto p-4">
      <SheetTable data={data} />
    </main>
  )
}
