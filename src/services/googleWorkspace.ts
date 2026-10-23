/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

// Required Google Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

// Configure GoogleAuthProvider with Workspace Scopes
const workspaceProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => workspaceProvider.addScope(scope));

// In-Memory Token Cache (MUST NOT use localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear token on auth state change (Sign Out or Token Expiry)
onAuthStateChanged(auth, (user) => {
  if (!user && !isSigningIn) {
    cachedAccessToken = null;
  }
});

/**
 * Sign in with Google Workspace credentials and obtain the OAuth Access Token
 */
export async function signInWithGoogleWorkspace(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, workspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Workspace. Pastikan izin telah diberikan.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Workspace Auth Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Get the cached access token in memory
 */
export async function getGoogleWorkspaceToken(): Promise<string | null> {
  return cachedAccessToken;
}

/**
 * Check if the user is authenticated and token is available
 */
export function isWorkspaceConnected(): boolean {
  return !!cachedAccessToken && !!auth.currentUser;
}

/**
 * Disconnect Google Workspace session
 */
export function disconnectWorkspace(): void {
  cachedAccessToken = null;
}

// ==========================================
// 1. GOOGLE SHEETS API INTEGRATION
// ==========================================

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Create a new Google Spreadsheet with provided structured table data
 */
export async function createGoogleSpreadsheet(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<CreateSheetResult> {
  const token = await getGoogleWorkspaceToken();
  if (!token) {
    throw new Error('Token Google Workspace belum tersedia. Silakan hubungkan akun Google Anda terlebih dahulu.');
  }

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `${title} - PSTI Bandung (${new Date().toLocaleDateString('id-ID')})`,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = createdData.spreadsheetUrl;

  // 2. Populate Headers and Rows
  const values = [headers, ...rows];
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Gagal mengisi data ke Google Sheet, namun spreadsheet telah terbuat.');
  }

  return { spreadsheetId, spreadsheetUrl };
}

// ==========================================
// 2. GOOGLE DRIVE API INTEGRATION
// ==========================================

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
}

/**
 * Upload a JSON tournament backup file or HTML report to user's Google Drive
 */
export async function uploadFileToDrive(
  filename: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<DriveUploadResult> {
  const token = await getGoogleWorkspaceToken();
  if (!token) {
    throw new Error('Token Google Workspace belum tersedia. Silakan hubungkan akun Google Anda.');
  }

  const metadata = {
    name: filename,
    mimeType: mimeType,
    description: 'File Turnamen Sepak Takraw PSTI Bandung - Dibuat via Sistem Scoring Resmi',
  };

  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal mengunggah file ke Google Drive.');
  }

  const data = await res.json();
  return {
    fileId: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
  };
}

/**
 * List files created or accessible in Google Drive
 */
export async function listDriveFiles(): Promise<Array<{ id: string; name: string; webViewLink: string; createdTime: string }>> {
  const token = await getGoogleWorkspaceToken();
  if (!token) return [];

  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,webViewLink,createdTime)&orderBy=createdTime desc&q=trashed=false',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Drive files:', error);
    return [];
  }
}

// ==========================================
// 3. GOOGLE FORMS API INTEGRATION
// ==========================================

export interface FormCreationResult {
  formId: string;
  responderUri: string;
}

/**
 * Create an official registration Google Form for athlete/team intake
 */
export async function createGoogleRegistrationForm(tournamentTitle: string): Promise<FormCreationResult> {
  const token = await getGoogleWorkspaceToken();
  if (!token) {
    throw new Error('Token Google Workspace belum tersedia. Silakan hubungkan akun Google Anda.');
  }

  // Create form title
  const res = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: `Pendaftaran Tim & Atlet - ${tournamentTitle}`,
        documentTitle: `Formulir Pendaftaran - ${tournamentTitle}`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal membuat Google Form pendaftaran.');
  }

  const form = await res.json();
  const formId = form.formId;
  const responderUri = form.responderUri;

  // Add default questions: Nama Regu/Tim, Kontingen Asal, Nomor HP Manajer, Kategori Lomba
  try {
    await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            createItem: {
              item: {
                title: 'Nama Regu / Klub / Tim Sepak Takraw',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false },
                  },
                },
              },
              location: { index: 0 },
            },
          },
          {
            createItem: {
              item: {
                title: 'Daerah / Kontingen (contoh: Kota Bandung, Kab. Purwakarta)',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false },
                  },
                },
              },
              location: { index: 1 },
            },
          },
          {
            createItem: {
              item: {
                title: 'Nama Pelatih / Official / Kontak WhatsApp',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false },
                  },
                },
              },
              location: { index: 2 },
            },
          },
          {
            createItem: {
              item: {
                title: 'Pilihan Nomor / Kategori Pertandingan',
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: 'RADIO',
                      options: [
                        { value: 'U15 Putra' },
                        { value: 'U15 Putri' },
                        { value: 'U18 Putra' },
                        { value: 'U18 Putri' },
                      ],
                    },
                  },
                },
              },
              location: { index: 3 },
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn('Batch update form questions warning:', e);
  }

  return { formId, responderUri };
}

/**
 * Fetch responses from a connected Google Form
 */
export async function fetchGoogleFormResponses(formId: string): Promise<any[]> {
  const token = await getGoogleWorkspaceToken();
  if (!token) return [];

  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal membaca respon Google Form.');
  }

  const data = await res.json();
  return data.responses || [];
}

// ==========================================
// 4. GMAIL API INTEGRATION
// ==========================================

export interface SendEmailPayload {
  to: string;
  subject: string;
  bodyText: string;
}

/**
 * Send an email via Gmail API
 * NOTE: Workspace Skill requires an explicit user confirmation dialog before calling this!
 */
export async function sendEmailViaGmail(payload: SendEmailPayload): Promise<{ id: string }> {
  const token = await getGoogleWorkspaceToken();
  if (!token) {
    throw new Error('Token Google Workspace belum tersedia. Silakan hubungkan akun Google Anda.');
  }

  const emailLines = [
    `To: ${payload.to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
    '',
    payload.bodyText,
  ];

  const emailRaw = emailLines.join('\r\n');
  // Base64 URL encode
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64EncodedEmail,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gagal mengirim email via Gmail.');
  }

  const result = await res.json();
  return { id: result.id };
}
