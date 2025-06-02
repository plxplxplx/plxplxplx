// File: app/api/images/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { drive_v3 } from 'googleapis'; // Only drive_v3 types might be needed here
import { getGoogleDriveService } from '../../lib/googleDriveClient'; // Adjust path as needed

// This function should ideally live in a lib/utils file if used elsewhere,
// or be consistent with how your frontend expects image URLs.
const buildImageUrl = (fileId: string) => `/api/images/${fileId}`; 

// Interface for the overall Google API error structure (can be shared too)
interface GoogleApiError extends Error {
  code?: number | string;
  errors?: { reason?: string; message?: string; domain?: string; }[];
}

export async function GET(req: NextRequest) {
  const folderId = req.nextUrl.searchParams.get('folderId');
  if (!folderId) {
    console.warn('🟡 WARN [api/images]: Missing folderId query parameter.');
    return NextResponse.json(
      { error: 'Missing folderId parameter' },
      { status: 400 }
    );
  }
  console.log(`🔵 INFO [api/images]: Received request for folderId: ${folderId}`);

  try {
    const drive = await getGoogleDriveService(); // Get cached or new service instance

    console.log(`🔵 INFO [api/images]: Listing files for folderId: ${folderId}`);
    const driveRes = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/gif' or mimeType='image/webp') and trashed = false`,
      fields: 'files(id,name)',
      pageSize: 100, // Increased pageSize, adjust as needed or implement pagination
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log(`🟢 SUCCESS [api/images]: Successfully listed files for folderId: ${folderId}. Found ${driveRes.data.files?.length || 0} files.`);

    const files = driveRes.data.files ?? [];
    const images = files
      .filter((f): f is drive_v3.Schema$File & { id: string; name: string } => Boolean(f.id && f.name))
      .map(f => ({
        id: f.id,
        name: f.name,
        url: buildImageUrl(f.id),
      }));

    return NextResponse.json({ images }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' // Cache for 10 mins
      }
    });
  } catch (error) {
    const err = error as GoogleApiError; 
    let errorMessage = `Drive API error while listing folder contents for folderId ${folderId}.`;
    const statusCode = 500; // Default to 500

    // Log the full error for better debugging
    console.error(`🔴 ERROR [api/images]: Error listing folder. Code: ${err.code || 'N/A'}. Message: ${err.message || 'N/A'}. Errors: ${JSON.stringify(err.errors || [])}. Full:`, err);
    
    if (err.message && err.message.toLowerCase().includes('server configuration error')) {
        // Propagate server config errors from getGoogleDriveService
        errorMessage = err.message;
    } else if (err.code === 'ERR_OSSL_UNSUPPORTED' || (err.message && err.message.includes('ERR_OSSL_UNSUPPORTED'))) {
        errorMessage = `Cryptographic error with private key (ERR_OSSL_UNSUPPORTED).`;
    } else if (err.message) {
        errorMessage = err.message; // Use the message from the caught error
    }
    // You might want to add specific handling for Google API error codes here too (e.g., 404 if folder not found)
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}