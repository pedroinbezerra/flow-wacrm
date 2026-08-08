import { DocumentFileMeta, DocumentSourceType, SourceConfig } from '../types';

export interface DocumentSourceAdapter {
  type: DocumentSourceType;
  listPendingFiles(folderId: string, pattern: string, config: SourceConfig): Promise<DocumentFileMeta[]>;
  fetchFileBuffer(fileId: string, config: SourceConfig): Promise<Buffer>;
  markProcessed?(fileId: string, config: SourceConfig): Promise<void>;
}

import {
  listRealGoogleDriveFiles,
  downloadRealGoogleDriveFile,
} from './google-drive-client';

export class GoogleDriveAdapter implements DocumentSourceAdapter {
  type: DocumentSourceType = 'google_drive';

  async listPendingFiles(folderId: string, pattern: string, config: SourceConfig): Promise<DocumentFileMeta[]> {
    if (config.accountId) {
      const realFiles = await listRealGoogleDriveFiles(config.accountId, folderId, pattern);
      if (realFiles.length > 0) {
        return realFiles.map((f) => ({
          id: f.id,
          name: f.name,
          sizeBytes: f.sizeBytes || 100000,
          folderName: folderId,
          mimeType: f.mimeType,
        }));
      }
    }

    return [
      {
        id: `gdrive_${folderId}_doc_001`,
        name: `Holerite_12345678901_2026-08.pdf`,
        sizeBytes: 154200,
        folderName: 'Holerites_Agosto',
        mimeType: 'application/pdf',
      },
    ];
  }

  async fetchFileBuffer(fileId: string, config: SourceConfig): Promise<Buffer> {
    if (config.accountId && !fileId.startsWith('gdrive_')) {
      return await downloadRealGoogleDriveFile(config.accountId, fileId);
    }
    return Buffer.from('%PDF-1.4 Mock PDF Content with CPF 123.456.789-01');
  }

  async markProcessed(_fileId: string, _config: SourceConfig): Promise<void> {
    // Tag or move file in Google Drive after processing
  }
}

export class OneDriveAdapter implements DocumentSourceAdapter {
  type: DocumentSourceType = 'onedrive';

  async listPendingFiles(folderId: string, _pattern: string, _config: SourceConfig): Promise<DocumentFileMeta[]> {
    return [
      {
        id: `onedrive_${folderId}_doc_002`,
        name: `Fatura_98765432000199_2026.pdf`,
        sizeBytes: 210000,
        folderName: 'Faturas_Clientes',
        mimeType: 'application/pdf',
      },
    ];
  }

  async fetchFileBuffer(_fileId: string, _config: SourceConfig): Promise<Buffer> {
    return Buffer.from('%PDF-1.4 Mock PDF Content with CNPJ 98.765.432/0001-99');
  }
}

export class DropboxAdapter implements DocumentSourceAdapter {
  type: DocumentSourceType = 'dropbox';

  async listPendingFiles(folderId: string, _pattern: string, _config: SourceConfig): Promise<DocumentFileMeta[]> {
    return [];
  }

  async fetchFileBuffer(_fileId: string, _config: SourceConfig): Promise<Buffer> {
    return Buffer.from('');
  }
}

export class S3Adapter implements DocumentSourceAdapter {
  type: DocumentSourceType = 's3';

  async listPendingFiles(folderId: string, _pattern: string, _config: SourceConfig): Promise<DocumentFileMeta[]> {
    return [];
  }

  async fetchFileBuffer(_fileId: string, _config: SourceConfig): Promise<Buffer> {
    return Buffer.from('');
  }
}

export class WebhookAdapter implements DocumentSourceAdapter {
  type: DocumentSourceType = 'webhook';

  async listPendingFiles(_folderId: string, _pattern: string, _config: SourceConfig): Promise<DocumentFileMeta[]> {
    return [];
  }

  async fetchFileBuffer(_fileId: string, _config: SourceConfig): Promise<Buffer> {
    return Buffer.from('');
  }
}

export function getDocumentSourceAdapter(type: DocumentSourceType): DocumentSourceAdapter {
  switch (type) {
    case 'google_drive':
      return new GoogleDriveAdapter();
    case 'onedrive':
      return new OneDriveAdapter();
    case 'dropbox':
      return new DropboxAdapter();
    case 's3':
      return new S3Adapter();
    case 'webhook':
      return new WebhookAdapter();
    default:
      throw new Error(`Unsupported document source provider: ${type}`);
  }
}
