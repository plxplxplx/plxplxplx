// app/api/images/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import { google } from 'googleapis'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id?: string } }
) {
  const fileId = params.id
  if (!fileId) {
    return NextResponse.json({ error: 'Missing file id' }, { status: 400 })
  }

  // 1) Load your service‐account key JSON
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS!
  const keyPath = path.isAbsolute(keyFile)
    ? keyFile
    : path.join(process.cwd(), keyFile)

  let keyJson: any
  try {
    keyJson = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
  } catch (e: any) {
    return NextResponse.json(
      { error: `Failed to read key JSON: ${e.message}` },
      { status: 500 }
    )
  }

  // 2) Authenticate
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const drive = google.drive({ version: 'v3', auth })

  // 3) Stream the file bytes back
  try {
    const resp = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )
    const contentType = resp.headers['content-type'] || 'application/octet-stream'
    return new NextResponse(resp.data, {
      headers: { 'Content-Type': contentType },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Drive fetch error: ${err.message}` },
      { status: 500 }
    )
  }
}
