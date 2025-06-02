// File: app/lib/googleDriveClient.ts
import { google, drive_v3 } from 'googleapis';
import { JWTInput, GoogleAuth } from 'google-auth-library';

let authClientInstance: InstanceType<typeof GoogleAuth> | null = null;
let driveServiceInstance: drive_v3.Drive | null = null;

export async function getGoogleDriveService(): Promise<drive_v3.Drive> {
  // If already initialized, return the cached instance
  if (driveServiceInstance && authClientInstance) {
    console.log('🔵 INFO [GoogleDriveClient]: Reusing cached Google Drive service.');
    return driveServiceInstance;
  }

  console.log('🔵 INFO [GoogleDriveClient]: Initializing Google Drive service...');
  const keyJsonString = process.env.GOOGLE_CREDENTIALS_JSON; 

  if (!keyJsonString) {
    console.error('🔴 ERROR [GoogleDriveClient]: GOOGLE_CREDENTIALS_JSON env var not set or empty.');
    throw new Error('Server configuration error: Missing Google credentials');
  }

  let keyJson: JWTInput;
  try {
    keyJson = JSON.parse(keyJsonString) as JWTInput;
    if (keyJson && keyJson.private_key) {
      keyJson.private_key = keyJson.private_key.replace(/\\n/g, '\n');
    } else {
      console.warn('🟡 WARN [GoogleDriveClient]: private_key field is missing or undefined after parsing JSON.');
      throw new Error('Server configuration error: private_key missing in credentials');
    }
  } catch (e) {
    const err = e as Error;
    console.error(`🔴 ERROR [GoogleDriveClient]: Failed to parse Google credentials JSON: ${err.message}`);
    throw new Error(`Server configuration error: Invalid Google credentials format - ${err.message}`);
  }

  try {
    authClientInstance = new google.auth.GoogleAuth({
      credentials: keyJson,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    driveServiceInstance = google.drive({ version: 'v3', auth: authClientInstance });
    console.log('🟢 SUCCESS [GoogleDriveClient]: Google Drive service initialized.');
    return driveServiceInstance;
  } catch (authError) {
    const err = authError as Error & {code?: string};
     console.error(`🔴 ERROR [GoogleDriveClient]: Failed to initialize Google Auth or Drive service: ${err.message}`, err);
     if (err.code === 'ERR_OSSL_UNSUPPORTED' || (err.message && err.message.includes('ERR_OSSL_UNSUPPORTED'))) {
        throw new Error(`Cryptographic error with private key (ERR_OSSL_UNSUPPORTED).`);
     }
    throw new Error(`Failed to initialize Google Drive service: ${err.message}`);
  }
}