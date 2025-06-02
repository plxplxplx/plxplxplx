// File: app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleDriveService } from '../../../lib/googleDriveClient'; // Adjust path as needed

// Define the expected shape of the *resolved* params object
interface ResolvedParams {
  id: string;
}

// Define the expected shape of the context object passed to GET,
// where 'params' is a Promise that resolves to ResolvedParams.
interface RouteContextWithPromiseParams {
  params: Promise<ResolvedParams>;
}

// Interface for the overall Google API error structure (can be shared too)
interface GoogleApiError extends Error {
  code?: number | string; 
  errors?: { reason?: string; message?: string; domain?: string; }[];
}

export async function GET(
  _req: NextRequest,
  context: RouteContextWithPromiseParams 
): Promise<Response> {
  let fileId: string;

  try {
    const resolvedParams = await context.params; 
    fileId = resolvedParams.id; 
  } catch (error) {
    console.error("🔴 ERROR [api/images/[id]]: Error resolving route context.params:", error);
    return NextResponse.json({ error: "Failed to resolve route parameters" }, { status: 500 });
  }

  if (!fileId) {
    console.warn('🟡 WARN [api/images/[id]]: Missing file id after params resolution.');
    return NextResponse.json({ error: 'Missing file id after params resolution' }, { status: 400 });
  }

  try {
    const drive = await getGoogleDriveService(); // Get cached or new service instance

    console.log(`🔵 INFO [api/images/[id]]: Attempting to fetch fileId: ${fileId}`);
    const resp = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    console.log(`🟢 SUCCESS [api/images/[id]]: Fetched fileId: ${fileId}`);

    const responseData = resp.data as ArrayBuffer;
    if (!(responseData instanceof ArrayBuffer)) {
        console.error('🔴 ERROR [api/images/[id]]: Google Drive API did not return an ArrayBuffer for fileId:', fileId);
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
        'Cache-Control': 'public, max-age=604800, immutable' // Cache for 1 week on client/CDN
      },
    });
  } catch (e) {
    const err = e as GoogleApiError; 
    let errorMessage = `Unknown error during Drive fetch for fileId ${fileId}.`;
    let statusCode = 500; 
    
    console.error(`🔴 ERROR [api/images/[id]]: Drive fetch error for fileId ${fileId}. Code: ${err.code || 'N/A'}. Message: ${err.message || 'N/A'}. Errors: ${JSON.stringify(err.errors || [])}. Full:`, err);

    if (err.code === 404 || (err.errors && err.errors.some(apiErr => apiErr.reason === 'notFound'))) {
        errorMessage = 'File not found on Google Drive.';
        statusCode = 404;
    } else if (err.message) { // Simplified error message handling
      errorMessage = err.message;
      if (typeof err.code === 'number' && err.code >= 400 && err.code < 600) {
        statusCode = err.code;
      }
    }
    
    if (err.code === 'ERR_OSSL_UNSUPPORTED' || (err.message && err.message.includes('ERR_OSSL_UNSUPPORTED'))) {
        errorMessage = `Cryptographic error with private key (ERR_OSSL_UNSUPPORTED).`;
    } else if (err.message && err.message.toLowerCase().includes('server configuration error')) {
        // Propagate server config errors from getGoogleDriveService
        errorMessage = err.message; 
    }
    
    return NextResponse.json(
      { error: `Drive fetch error: ${errorMessage}` },
      { status: statusCode }
    );
  }
}