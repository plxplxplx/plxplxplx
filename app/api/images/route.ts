// app/api/images/route.ts
import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import { google, drive_v3 } from 'googleapis'
import { JWTInput } from 'google-auth-library'
import { buildImageUrl } from '../../lib/drive'

export async function GET(req: NextRequest) {
  // 1. Extract folderId from query string
  const folderId = req.nextUrl.searchParams.get('folderId')
  if (!folderId) {
    return NextResponse.json(
      { error: 'Missing folderId parameter' },
      { status: 400 }
    )
  }

  // 2. Load service account credentials
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!keyFile) {
    return NextResponse.json(
      { error: 'GOOGLE_APPLICATION_CREDENTIALS not set' },
      { status: 500 }
    )
  }

  const keyPath = path.isAbsolute(keyFile)
    ? keyFile
    : path.join(process.cwd(), keyFile)

  let keyJson: JWTInput
  try {
    keyJson = JSON.parse(fs.readFileSync(keyPath, 'utf8')) as JWTInput
  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      { error: `Failed to read service account key: ${err.message}` },
      { status: 500 }
    )
  }

  // 3. Authenticate
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const drive = google.drive({ version: 'v3', auth })

  // 4. List image files
  try {
    const driveRes = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id,name)',
      pageSize: 50,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    const files = driveRes.data.files ?? []
    const images = files
      .filter((f): f is drive_v3.Schema$File & { id: string; name: string } => Boolean(f.id && f.name))
      .map(f => ({
        id: f.id,
        name: f.name,
        url: buildImageUrl(f.id),
      }))

    return NextResponse.json({ images })
  } catch (error) {
    const err = error as Error
    return NextResponse.json(
      { error: `Drive API error: ${err.message}` },
      { status: 500 }
    )
  }
}
