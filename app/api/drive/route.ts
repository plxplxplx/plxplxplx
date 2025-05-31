// app/api/drive/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'
import { JWTInput } from 'google-auth-library'

export async function GET(req: NextRequest) {
  // ─── 1. Read & validate the folderId query param ──────────────────────────────
  const folderId = req.nextUrl.searchParams.get('folderId')
  if (!folderId) {
    return NextResponse.json(
      { error: 'Missing ?folderId=' },
      { status: 400 }
    )
  }

  // ─── 2. Load the service-account key JSON ─────────────────────────────────────
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!keyFile) {
    return NextResponse.json(
      { error: 'GOOGLE_APPLICATION_CREDENTIALS env var is not set' },
      { status: 500 }
    )
  }

  const keyPath = path.isAbsolute(keyFile)
    ? keyFile
    : path.join(process.cwd(), keyFile)

  let keyJson: JWTInput
  try {
    keyJson = JSON.parse(fs.readFileSync(keyPath, 'utf8')) as JWTInput
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: `Failed to read key JSON: ${e.message}` },
      { status: 500 }
    )
  }

  // ─── 3. Authenticate & create Drive client ───────────────────────────────────
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  const drive = google.drive({ version: 'v3', auth })

  // ─── 4. Query the folder for image files ─────────────────────────────────────
  try {
    const resp = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    /** Each file is of type drive_v3.Schema$File */
    const files = (resp.data.files ?? []).map((f): { id: string; name: string } => ({
      id: f.id as string,
      name: f.name ?? '',
    }))

    return NextResponse.json({ images: files })
  } catch (err) {
    const e = err as Error
    return NextResponse.json(
      { error: `Drive list error: ${e.message ?? 'unknown error'}` },
      { status: 500 }
    )
  }
}
