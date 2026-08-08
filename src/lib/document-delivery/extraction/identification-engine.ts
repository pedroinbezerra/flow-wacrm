import { DocumentFileMeta, ExtractionRules, ExtractedRecipient } from '../types';
import { createChatCompletion } from '@/lib/ai-service/openai-client';
import { sanitizeCpfCnpj } from '@/lib/validation/fiscal';

export { sanitizeCpfCnpj };

const CPF_REGEX = /(?:^|\D)(\d{3}\.?\d{3}\.?\d{3}-?\d{2})(?:\D|$)/;
const CNPJ_REGEX = /(?:^|[^a-zA-Z0-9])([a-zA-Z0-9]{2}\.?[a-zA-Z0-9]{3}\.?[a-zA-Z0-9]{3}\/?[a-zA-Z0-9]{4}-?\d{2})(?:[^a-zA-Z0-9]|$)/i;

export function extractDeterministic(
  file: DocumentFileMeta,
  rules: ExtractionRules
): ExtractedRecipient | null {
  // 1. CPF / CNPJ in filename
  if (rules.cpf_cnpj_in_filename !== false) {
    const cnpjMatch = file.name.match(CNPJ_REGEX);
    if (cnpjMatch) {
      const sanitized = sanitizeCpfCnpj(cnpjMatch[1]);
      if (sanitized.length === 14) {
        return {
          cpfCnpj: sanitized,
          matchedBy: 'cnpj',
          confidence: 0.98,
          rawText: file.name,
        };
      }
    }

    const cpfMatch = file.name.match(CPF_REGEX);
    if (cpfMatch) {
      const sanitized = sanitizeCpfCnpj(cpfMatch[1]);
      if (sanitized.length === 11) {
        return {
          cpfCnpj: sanitized,
          matchedBy: 'cpf',
          confidence: 0.98,
          rawText: file.name,
        };
      }
    }
  }

  // 2. Custom Filename Regex Pattern
  if (rules.filename_pattern) {
    try {
      const regex = new RegExp(rules.filename_pattern, 'i');
      const match = file.name.match(regex);
      if (match && match[1]) {
        const value = match[1].trim();
        const isCpf = value.replace(/\D/g, '').length === 11;
        const isCnpj = value.replace(/\D/g, '').length === 14;

        return {
          cpfCnpj: isCpf || isCnpj ? sanitizeCpfCnpj(value) : undefined,
          name: !isCpf && !isCnpj ? value : undefined,
          matchedBy: 'filename_pattern',
          confidence: 0.92,
          rawText: file.name,
        };
      }
    } catch {
      // Invalid user-provided regex ignored safely
    }
  }

  // 3. Folder Name Matching
  if (rules.folder_name_matching && file.folderName) {
    const cpfMatch = file.folderName.match(CPF_REGEX);
    if (cpfMatch) {
      return {
        cpfCnpj: sanitizeCpfCnpj(cpfMatch[1]),
        matchedBy: 'folder_name',
        confidence: 0.95,
        rawText: file.folderName,
      };
    }
  }

  return null;
}

export function extractOcrText(buffer?: Buffer): string {
  if (!buffer || buffer.length === 0) return '';
  // Convert buffer to text string for simple PDF / plain text parsing
  const rawText = buffer.toString('utf-8', 0, Math.min(buffer.length, 5000));
  // Clean null bytes or non-printable ASCII
  return rawText.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ').slice(0, 3000);
}

export function extractOcr(
  buffer: Buffer,
  _rules: ExtractionRules
): ExtractedRecipient | null {
  const text = extractOcrText(buffer);
  if (!text) return null;

  const cnpjMatch = text.match(CNPJ_REGEX);
  if (cnpjMatch) {
    const sanitized = sanitizeCpfCnpj(cnpjMatch[1]);
    if (sanitized.length === 14) {
      return {
        cpfCnpj: sanitized,
        matchedBy: 'ocr',
        confidence: 0.90,
        rawText: text.slice(0, 200),
      };
    }
  }

  const cpfMatch = text.match(CPF_REGEX);
  if (cpfMatch) {
    const sanitized = sanitizeCpfCnpj(cpfMatch[1]);
    if (sanitized.length === 11) {
      return {
        cpfCnpj: sanitized,
        matchedBy: 'ocr',
        confidence: 0.90,
        rawText: text.slice(0, 200),
      };
    }
  }

  return null;
}

export async function extractAiFallback(
  file: DocumentFileMeta,
  ocrText: string,
  rules: ExtractionRules,
  _accountId: string
): Promise<ExtractedRecipient | null> {
  if (!rules.enable_ai) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const payloadText = ocrText.slice(0, 1500) || file.name;
  const prompt = rules.custom_prompt || `Identifique o CPF, CNPJ ou Nome do cliente destinatário do documento a partir do trecho a seguir. Responda em formato JSON com as chaves: cpfCnpj, name, confidence (entre 0 e 1).\nNome do Arquivo: ${file.name}\nTexto: ${payloadText}`;

  try {
    const response = await createChatCompletion({
      apiKey,
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um assistente especialista em extração estruturada de dados de documentos em JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    if (response && response.content) {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const confidence = typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.70;
        return {
          cpfCnpj: parsed.cpfCnpj ? sanitizeCpfCnpj(parsed.cpfCnpj) : undefined,
          name: parsed.name,
          matchedBy: 'ai',
          confidence,
          rawText: payloadText,
          aiUsage: {
            model: 'gpt-4o-mini',
            tokensPrompt: response.usage?.prompt_tokens || 150,
            tokensCompletion: response.usage?.completion_tokens || 50,
            estimatedCost: ((response.usage?.total_tokens || 200) * 0.00000015),
            prompt,
            response: response.content,
          },
        };
      }
    }
  } catch {
    // AI failure fallback without crashing flow
  }

  return null;
}

export async function identifyRecipient(
  file: DocumentFileMeta,
  buffer: Buffer,
  rules: ExtractionRules,
  accountId: string
): Promise<ExtractedRecipient> {
  // Layer 1: Deterministic rules (Free & instant)
  const deterministic = extractDeterministic(file, rules);
  if (deterministic && deterministic.confidence >= 0.85) {
    return deterministic;
  }

  // Layer 2: Traditional OCR / PDF Text Parsing
  if (rules.enable_ocr !== false) {
    const ocrResult = extractOcr(buffer, rules);
    if (ocrResult && ocrResult.confidence >= 0.85) {
      return ocrResult;
    }
  }

  // Layer 3: Optional AI Fallback
  const ocrText = extractOcrText(buffer);
  const aiResult = await extractAiFallback(file, ocrText, rules, accountId);
  if (aiResult) {
    return aiResult;
  }

  // Fallback: Low confidence / unmatched
  return {
    matchedBy: 'ocr',
    confidence: 0.1,
    rawText: file.name,
  };
}
