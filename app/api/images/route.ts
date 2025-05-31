// app/api/images/route.ts
import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { buildImageUrl } from '../../lib/drive'  // adjust the path as needed

export async function GET(req: NextRequest) {
  // 1) Extract folderId from query string
  const folderId = req.nextUrl.searchParams.get('folderId')
  if (!folderId) {
    return NextResponse.json(
      { error: 'Missing folderId parameter' },
      { status: 400 }
    )
  }

  // 2) Load your service account key JSON
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!keyFile) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_APPLICATION_CREDENTIALS env var' },
      { status: 500 }
    )
  }
  const keyPath = path.isAbsolute(keyFile)
    ? keyFile
    : path.join(process.cwd(), keyFile)
  let keyJson: any
  try {
    keyJson = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to read service account key: ${err.message}` },
      { status: 500 }
    )
  }

  // 3) Authenticate with Google Drive
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const drive = google.drive({ version: 'v3', auth })

  // 4) List up to 50 images in the folder
  try {
    const driveRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id,name)',
      pageSize: 50,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })
    const files = driveRes.data.files || []

    // 5) Build the JSON response with view URLs
    const images = files.map(f => ({
      id: f.id!,
      name: f.name!,
      url: buildImageUrl(f.id!),
    }))

    return NextResponse.json({ images })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Drive API error: ${err.message}` },
      { status: 500 }
    )
  }
}
