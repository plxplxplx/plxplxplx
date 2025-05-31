// app/api/drive-test/route.ts
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  const folderId = process.env.DRIVE_FOLDER_ID
  if (!folderId) {
    return NextResponse.json(
      { error: 'Missing DRIVE_FOLDER_ID' },
      { status: 500 }
    )
  }

  try {
    // Let GoogleAuth pick up your key via GOOGLE_APPLICATION_CREDENTIALS
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })
    const drive = google.drive({ version: 'v3', auth })

    // List image files in the shared folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id,name)',
      pageSize: 10,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    // Build direct-view URLs for each image
    const images = (res.data.files || []).map(f => ({
      name: f.name,
      url: `https://drive.google.com/uc?export=view&id=${f.id}`,
    }))

    return NextResponse.json({ images })
  } catch (e: any) {
    return NextResponse.json(
      { error: `Drive API error: ${e.message}` },
      { status: 500 }
    )
  }
}
