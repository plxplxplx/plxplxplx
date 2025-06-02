// app/api/images/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { google, drive_v3 } from 'googleapis'; // drive_v3 might be needed if you use its types
import { JWTInput } from 'google-auth-library';

// Define the expected shape of the *resolved* params object if needed by buildImageUrl
// For now, buildImageUrl just takes a string
// interface ResolvedParams {
//   id: string;
// }

// Assuming buildImageUrl constructs URLs like /api/images/[id]
// This function should ideally live in a lib/utils file if used elsewhere
const buildImageUrl = (fileId: string) => `/api/images/${fileId}`; // Used to construct URL to the dynamic streaming route

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


export async function GET(req: NextRequest) {
  // 1. Extract folderId from query string
  const folderId = req.nextUrl.searchParams.get('folderId');
  if (!folderId) {
    console.warn('🟡 WARN [api/images]: Missing folderId query parameter.');
    return NextResponse.json(
      { error: 'Missing folderId parameter' },
      { status: 400 }
    );
  }
  console.log(`🔵 INFO [api/images]: Received request for folderId: ${folderId}`);

  // 2. Load service account credentials from environment variable JSON content
  const keyJsonString = process.env.GOOGLE_CREDENTIALS_JSON; 

  if (!keyJsonString) {
    console.error('🔴 ERROR [api/images]: GOOGLE_CREDENTIALS_JSON env var not set or empty.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing Google credentials' },
      { status: 500 }
    );
  }

  console.log('🔵 INFO [api/images]: Attempting to parse GOOGLE_CREDENTIALS_JSON.');

  let keyJson: JWTInput;
  try {
    keyJson = JSON.parse(keyJsonString) as JWTInput;
    console.log('🟢 SUCCESS [api/images]: Successfully parsed GOOGLE_CREDENTIALS_JSON.');

    if (keyJson && keyJson.private_key) {
      keyJson.private_key = keyJson.private_key.replace(/\\n/g, '\n');
      console.log('🔵 INFO [api/images]: Corrected private_key newlines.');
    } else {
      console.warn('🟡 WARN [api/images]: private_key field is missing or undefined after parsing JSON.');
      return NextResponse.json(
        { error: 'Server configuration error: private_key missing in credentials' },
        { status: 500 }
      );
    }
  } catch (e) {
    const err = e as Error;
    console.error(`🔴 ERROR [api/images]: Failed to parse Google credentials JSON from env var: ${err.message}`);
    return NextResponse.json(
      { error: `Server configuration error: Invalid Google credentials format - ${err.message}` },
      { status: 500 }
    );
  }

  // 3. Authenticate
  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const drive = google.drive({ version: 'v3', auth });

  // 4. List image files
  try {
    console.log(`🔵 INFO [api/images]: Listing files for folderId: ${folderId}`);
    const driveRes = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/gif' or mimeType='image/webp') and trashed = false`,
      fields: 'files(id,name)', // Only fetch id and name
      pageSize: 50, // Adjust as needed
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(`🟢 SUCCESS [api/images]: Successfully listed files for folderId: ${folderId}`);

    const files = driveRes.data.files ?? [];
    const images = files
      .filter((f): f is drive_v3.Schema$File & { id: string; name: string } => Boolean(f.id && f.name))
      .map(f => ({
        id: f.id,
        name: f.name,
        url: buildImageUrl(f.id), // Using the buildImageUrl function here
      }));

    return NextResponse.json({ images });
  } catch (error) {
    const err = error as GoogleApiError; 
    let errorMessage = `Drive API error while listing folder contents: ${err.message || 'Unknown error'}`;
    // Changed 'let' to 'const' as statusCode is not reassigned in this block
    const statusCode = 500; 

    if (err.code === 'ERR_OSSL_UNSUPPORTED' || (err.message && err.message.includes('ERR_OSSL_UNSUPPORTED'))) {
        errorMessage = `Cryptographic error with private key (ERR_OSSL_UNSUPPORTED).`;
    }
    // Note: The original logic to set statusCode based on err.code (like 404) was removed in the
    // previous iteration for this specific catch block. If you need more specific status codes
    // from Drive API errors here (e.g., if the folder itself is not found), you'd add that logic back.
    // For now, it defaults to 500 for any drive.files.list error other than OSSL.
    
    console.error(`🔴 ERROR [api/images]: ${errorMessage}. Full Error:`, err);
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}