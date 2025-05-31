// app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { JWTInput } from 'google-auth-library';

// Define the expected shape of the *resolved* params object
interface ResolvedParams {
  id: string;
}

// Define the expected shape of the context object passed to GET,
// where 'params' is a Promise that resolves to ResolvedParams.
interface RouteContextWithPromiseParams {
  params: Promise<ResolvedParams>;
}

// Interface for individual errors in the Google API error response
interface GoogleApiErrorItem {
  reason?: string;
  message?: string;
  domain?: string;
}

// Interface for the overall Google API error structure
interface GoogleApiError extends Error {
  code?: number;
  errors?: GoogleApiErrorItem[];
}


/** GET /api/images/[id] — stream a Google-Drive image */
export async function GET(
  _req: NextRequest,
  // context is an object, and context.params is the Promise
  context: RouteContextWithPromiseParams 
): Promise<Response> {
  let fileId: string;

  try {
    // Await context.params to get the resolved parameters
    const resolvedParams = await context.params; 
    fileId = resolvedParams.id; 
  } catch (error) {
    console.error("Error resolving route context.params:", error);
    return NextResponse.json({ error: "Failed to resolve route parameters" }, { status: 500 });
  }

  /* ── 1) Guard ───────────────────────────────────────────── */
  if (!fileId) {
    // This case might be less likely if context.params resolution fails first,
    // but good to keep as a sanity check.
    return NextResponse.json({ error: 'Missing file id after params resolution' }, { status: 400 });
  }

  /* ── 2) Read service-account JSON ───────────────────────── */
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set.');
    return NextResponse.json(
      { error: 'Server configuration error: GOOGLE_APPLICATION_CREDENTIALS env var not set' },
      { status: 500 }
    );
  }

  const keyPath = path.isAbsolute(keyFile)
    ? keyFile
    : path.join(process.cwd(), keyFile);

  let keyJson: JWTInput;
  try {
    const keyFileContent = fs.readFileSync(keyPath, 'utf8');
    keyJson = JSON.parse(keyFileContent) as JWTInput;
  } catch (e) {
    const err = e as Error;
    console.error(`Failed to read or parse key JSON from ${keyPath}: ${err.message}`);
    return NextResponse.json(
      { error: `Server configuration error: Failed to read key JSON - ${err.message}` },
      { status: 500 }
    );
  }

  /* ── 3) Drive client ────────────────────────────────────── */
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  /* ── 4) Fetch raw bytes & stream back ───────────────────── */
  try {
    const resp = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const responseData = resp.data as ArrayBuffer;
    if (!(responseData instanceof ArrayBuffer)) {
        console.error('Google Drive API did not return an ArrayBuffer as expected.');
        return NextResponse.json({ error: 'Invalid response data from Google Drive API' }, { status: 500 });
    }
    const buffer = Buffer.from(responseData);
    
    const contentType =
      (resp.headers['content-type'] as string | undefined) ??
      'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable'
      },
    });
  } catch (e) {
    const err = e as GoogleApiError; 
    let errorMessage = 'Unknown error during Drive fetch.';
    let statusCode = 500; 
    
    if (err.code === 404 || (err.errors && err.errors.some(apiErr => apiErr.reason === 'notFound'))) {
        errorMessage = 'File not found on Google Drive.';
        statusCode = 404;
    } else if (err.errors && err.errors.length > 0 && err.errors[0].message) {
      errorMessage = err.errors[0].message;
      if (err.code && err.code >= 400 && err.code < 600) {
        statusCode = err.code;
      }
    } else if (err.message) {
      errorMessage = err.message;
      if (err.code && err.code >= 400 && err.code < 600) {
        statusCode = err.code;
      }
    }

    console.error(`Drive fetch error for fileId ${fileId}: ${errorMessage} (Status: ${err.code || 'N/A'}, API Errors: ${JSON.stringify(err.errors || [])})`, err);
    
    return NextResponse.json(
      { error: `Drive fetch error: ${errorMessage}` },
      { status: statusCode }
    );
  }
}
