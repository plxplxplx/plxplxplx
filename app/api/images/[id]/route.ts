// app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
  code?: number | string; 
  errors?: GoogleApiErrorItem[];
}


/** GET /api/images/[id] — stream a Google-Drive image */
export async function GET(
  _req: NextRequest,
  context: RouteContextWithPromiseParams 
): Promise<Response> {
  let fileId: string;

  try {
    const resolvedParams = await context.params; 
    fileId = resolvedParams.id; 
  } catch (error) {
    console.error("🔴 ERROR: Error resolving route context.params:", error);
    return NextResponse.json({ error: "Failed to resolve route parameters" }, { status: 500 });
  }

  /* ── 1) Guard ───────────────────────────────────────────── */
  if (!fileId) {
    console.warn('🟡 WARN: Missing file id after params resolution.');
    return NextResponse.json({ error: 'Missing file id after params resolution' }, { status: 400 });
  }

  /* ── 2) Read service-account JSON from environment variable content ── */
  const keyJsonString = process.env.GOOGLE_CREDENTIALS_JSON; 

  if (!keyJsonString) {
    console.error('🔴 ERROR: GOOGLE_CREDENTIALS_JSON env var not set or empty.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Google credentials' },
      { status: 500 }
    );
  }

  console.log('🔵 INFO: Attempting to parse GOOGLE_CREDENTIALS_JSON. Content received (first 200 chars):', keyJsonString.substring(0, 200));

  let keyJson: JWTInput;
  try {
    keyJson = JSON.parse(keyJsonString) as JWTInput;
    console.log('🟢 SUCCESS: Successfully parsed GOOGLE_CREDENTIALS_JSON.');

    // --- CRITICAL FIX: Convert literal "\\n" in private_key to actual newlines "\n" ---
    if (keyJson && keyJson.private_key) {
      keyJson.private_key = keyJson.private_key.replace(/\\n/g, '\n');
      console.log('🔵 INFO: Corrected private_key newlines.');
      // --- Debugging logs for the corrected private_key ---
      console.log('🔵 INFO: Corrected private_key content (first 100 chars):', keyJson.private_key.substring(0, 100));
      console.log('🔵 INFO: Does corrected private_key include literal "\\n"?', keyJson.private_key.includes('\\n')); // Should be false
      console.log('🔵 INFO: Does corrected private_key include actual newline "\\n"?', keyJson.private_key.includes('\n'));    // Should be true
      console.log('🔵 INFO: Length of corrected private_key:', keyJson.private_key.length); // Should match the 1704 length
    } else {
      console.warn('🟡 WARN: private_key field is missing or undefined after parsing JSON.');
      // If private_key is missing, auth will fail. Return an error.
      return NextResponse.json(
        { error: 'Server configuration error: private_key missing in credentials' },
        { status: 500 }
      );
    }
    // --- End of debugging logs ---

  } catch (e) {
    const err = e as Error;
    console.error(`🔴 ERROR: Failed to parse Google credentials JSON from env var: ${err.message}`);
    console.error('Problematic GOOGLE_CREDENTIALS_JSON string (first 200 chars):', keyJsonString.substring(0, 200)); 
    return NextResponse.json(
      { error: `Server configuration error: Invalid Google credentials format - ${err.message}` },
      { status: 500 }
    );
  }

  /* ── 3) Drive client ────────────────────────────────────── */
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson, // Use the corrected keyJson
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });

  /* ── 4) Fetch raw bytes & stream back ───────────────────── */
  try {
    console.log(`🔵 INFO: Attempting to fetch fileId: ${fileId} from Google Drive.`);
    const resp = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    console.log(`🟢 SUCCESS: Fetched fileId: ${fileId} from Google Drive.`);

    const responseData = resp.data as ArrayBuffer;
    if (!(responseData instanceof ArrayBuffer)) {
        console.error('🔴 ERROR: Google Drive API did not return an ArrayBuffer as expected for fileId:', fileId);
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
    
    console.error(`🔴 ERROR: Drive fetch error for fileId ${fileId}. Google API Status Code: ${err.code || 'N/A'}. Google API Error Message: ${err.message || 'N/A'}. Google API Errors Array: ${JSON.stringify(err.errors || [])}. Full Error Object:`, err);

    if (err.code === 404 || (err.errors && err.errors.some(apiErr => apiErr.reason === 'notFound'))) {
        errorMessage = 'File not found on Google Drive.';
        statusCode = 404;
    } else if (err.errors && err.errors.length > 0 && err.errors[0].message) {
      errorMessage = err.errors[0].message;
      if (typeof err.code === 'number' && err.code >= 400 && err.code < 600) {
        statusCode = err.code;
      }
    } else if (err.message) {
      errorMessage = err.message;
      if (typeof err.code === 'number' && err.code >= 400 && err.code < 600) {
        statusCode = err.code;
      }
    }
    
    if (err.code === 'ERR_OSSL_UNSUPPORTED' || (err.message && err.message.includes('ERR_OSSL_UNSUPPORTED'))) {
        errorMessage = `Cryptographic error with private key (ERR_OSSL_UNSUPPORTED). This occurred after attempting to correct private_key newlines. The key format might still be incompatible with the current Node.js crypto library. Consider regenerating the key or trying a different Node.js LTS version.`;
    }
    
    return NextResponse.json(
      { error: `Drive fetch error: ${errorMessage}` },
      { status: statusCode }
    );
  }
}
