import { createClient } from '@/lib/supabase/server';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';

export interface GoogleDriveFolderItem {
  id: string;
  name: string;
  item_count?: number;
  has_subfolders?: boolean;
  updated_at?: string;
}

export interface GoogleDriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  modifiedTime?: string;
}

/**
 * Gera a URL oficial de consentimento OAuth 2.0 do Google.
 */
export function getGoogleDriveAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca o código de autorização OAuth por tokens de acesso e refresh.
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  email: string;
  scope?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('As variáveis de ambiente GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configuradas.');
  }

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Falha na troca de código OAuth do Google: ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;
  const expiresInSeconds = tokenData.expires_in || 3600;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  // Fetch user email from Google UserInfo API
  const userRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let email = 'usuario.google@empresa.com';
  if (userRes.ok) {
    const userData = await userRes.json();
    if (userData.email) email = userData.email;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    email,
    scope: tokenData.scope,
  };
}

/**
 * Obtém um access_token válido para a conta tenant.
 * Atualiza automaticamente via refresh_token se estiver expirado.
 */
export async function getValidAccessToken(accountId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: integration, error } = await supabase
    .from('google_drive_integrations')
    .select('*')
    .eq('account_id', accountId)
    .single();

  if (error || !integration) return null;

  const expiresAt = new Date(integration.expires_at).getTime();
  const now = Date.now();

  // If token is still valid for at least 3 minutes, return it
  if (expiresAt - now > 3 * 60 * 1000) {
    return integration.access_token;
  }

  // If expired and we have a refresh_token, perform OAuth refresh
  if (integration.refresh_token) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) return null;

    const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: integration.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      const newAccessToken = refreshData.access_token;
      const expiresInSeconds = refreshData.expires_in || 3600;
      const newExpiresAt = new Date(now + expiresInSeconds * 1000).toISOString();

      await supabase
        .from('google_drive_integrations')
        .update({
          access_token: newAccessToken,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId);

      return newAccessToken;
    }
  }

  return null;
}

/**
 * Lista subpastas reais diretamente via Google Drive REST API v3.
 */
export async function listRealGoogleDriveFolders(
  accountId: string,
  parentId?: string
): Promise<{
  connected: boolean;
  account_email?: string;
  current_folder?: { id: string; name: string };
  folders: GoogleDriveFolderItem[];
}> {
  const token = await getValidAccessToken(accountId);
  if (!token) {
    return { connected: false, folders: [] };
  }

  const supabase = await createClient();
  const { data: integration } = await supabase
    .from('google_drive_integrations')
    .select('account_email')
    .eq('account_id', accountId)
    .single();

  const folderId = !parentId || parentId === 'root' ? 'root' : parentId;

  // Query Google Drive API v3 for folders
  // mimeType = 'application/vnd.google-apps.folder' and 'folderId' in parents and trashed = false
  const q = `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents and trashed = false`;
  const params = new URLSearchParams({
    q,
    fields: 'files(id, name, modifiedTime)',
    pageSize: '100',
    orderBy: 'name',
  });

  const driveRes = await fetch(`${GOOGLE_DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!driveRes.ok) {
    console.error('Google Drive API error listing folders:', await driveRes.text());
    return { connected: false, folders: [] };
  }

  const driveData = await driveRes.json();
  const files = driveData.files || [];

  const folders: GoogleDriveFolderItem[] = files.map((f: any) => ({
    id: f.id,
    name: f.name,
    has_subfolders: true,
    updated_at: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : undefined,
  }));

  // Fetch current folder metadata
  let currentFolderName = folderId === 'root' ? 'Meu Google Drive' : 'Pasta';
  if (folderId !== 'root') {
    const metaRes = await fetch(`${GOOGLE_DRIVE_API}/files/${folderId}?fields=id,name`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      if (metaData.name) currentFolderName = metaData.name;
    }
  }

  return {
    connected: true,
    account_email: integration?.account_email || 'Google Drive',
    current_folder: { id: folderId, name: currentFolderName },
    folders,
  };
}

/**
 * Lista arquivos reais dentro de uma pasta no Google Drive REST API v3.
 */
export async function listRealGoogleDriveFiles(
  accountId: string,
  folderId: string,
  mimeTypePattern?: string
): Promise<GoogleDriveFileItem[]> {
  const token = await getValidAccessToken(accountId);
  if (!token) return [];

  const parentFolder = !folderId || folderId === 'root' ? 'root' : folderId;
  let q = `'${parentFolder}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;

  const params = new URLSearchParams({
    q,
    fields: 'files(id, name, mimeType, size, modifiedTime)',
    pageSize: '200',
    orderBy: 'modifiedTime desc',
  });

  const res = await fetch(`${GOOGLE_DRIVE_API}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    sizeBytes: f.size ? parseInt(f.size, 10) : undefined,
    modifiedTime: f.modifiedTime,
  }));
}

/**
 * Baixa o stream / ArrayBuffer de um arquivo real do Google Drive API v3.
 */
export async function downloadRealGoogleDriveFile(
  accountId: string,
  fileId: string
): Promise<Buffer> {
  const token = await getValidAccessToken(accountId);
  if (!token) {
    throw new Error('Conta do Google Drive não conectada ou token expirado.');
  }

  const res = await fetch(`${GOOGLE_DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Erro ao baixar arquivo do Google Drive API v3: ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
