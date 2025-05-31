// app/api/drive-test/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  const folderId = process.env.DRIVE_FOLDER_ID!
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: 'files(id,name)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  const images = (res.data.files || []).map(f => ({
    id: f.id!,
    name: f.name!,
  }))

  return NextResponse.json({ images })
}
