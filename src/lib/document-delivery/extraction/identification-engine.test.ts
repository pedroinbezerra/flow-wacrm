import { describe, expect, it } from 'vitest';
import { extractDeterministic, sanitizeCpfCnpj } from './identification-engine';

describe('Document Delivery Identification Engine', () => {
  it('sanitizes CPF and CNPJ correctly', () => {
    expect(sanitizeCpfCnpj('123.456.789-01')).toBe('12345678901');
    expect(sanitizeCpfCnpj('98.765.432/0001-99')).toBe('98765432000199');
  });

  it('extracts CPF from filename deterministically with high confidence', () => {
    const file = {
      id: 'doc_1',
      name: 'Holerite_123.456.789-01_Agosto.pdf',
      sizeBytes: 1000,
    };
    const rules = { cpf_cnpj_in_filename: true };

    const result = extractDeterministic(file, rules);
    expect(result).not.toBeNull();
    expect(result?.cpfCnpj).toBe('12345678901');
    expect(result?.matchedBy).toBe('cpf');
    expect(result?.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('extracts CNPJ from filename deterministically with high confidence', () => {
    const file = {
      id: 'doc_2',
      name: 'NotaFiscal_98.765.432/0001-99_Empresa.pdf',
      sizeBytes: 2000,
    };
    const rules = { cpf_cnpj_in_filename: true };

    const result = extractDeterministic(file, rules);
    expect(result).not.toBeNull();
    expect(result?.cpfCnpj).toBe('98765432000199');
    expect(result?.matchedBy).toBe('cnpj');
    expect(result?.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('extracts new Alphanumeric CNPJ (IN RFB nº 2.229/2024) from filename', () => {
    const file = {
      id: 'doc_2_alpha',
      name: 'Fatura_12.ABC.345/0001-99_ClienteCorp.pdf',
      sizeBytes: 2500,
    };
    const rules = { cpf_cnpj_in_filename: true };

    const result = extractDeterministic(file, rules);
    expect(result).not.toBeNull();
    expect(result?.cpfCnpj).toBe('12ABC345000199');
    expect(result?.matchedBy).toBe('cnpj');
    expect(result?.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('extracts recipient using custom filename regex pattern', () => {
    const file = {
      id: 'doc_3',
      name: 'FAT_CLIENTE_12345678901_2026.pdf',
      sizeBytes: 1500,
    };
    const rules = {
      cpf_cnpj_in_filename: false,
      filename_pattern: 'FAT_CLIENTE_(\\d{11})_',
    };

    const result = extractDeterministic(file, rules);
    expect(result).not.toBeNull();
    expect(result?.cpfCnpj).toBe('12345678901');
    expect(result?.matchedBy).toBe('filename_pattern');
  });

  it('extracts CPF from folder name when enabled', () => {
    const file = {
      id: 'doc_4',
      name: 'Relatorio.pdf',
      folderName: 'Pasta_123.456.789-01_Maria',
      sizeBytes: 1500,
    };
    const rules = {
      cpf_cnpj_in_filename: false,
      folder_name_matching: true,
    };

    const result = extractDeterministic(file, rules);
    expect(result).not.toBeNull();
    expect(result?.cpfCnpj).toBe('12345678901');
    expect(result?.matchedBy).toBe('folder_name');
  });
});
