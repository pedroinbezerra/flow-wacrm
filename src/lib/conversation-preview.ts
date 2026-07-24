const LEGACY_PREVIEW_LABELS: Record<string, string> = {
  image: "Imagem",
  video: "Vídeo",
  audio: "Áudio",
  document: "Documento",
  location: "Localização",
  template: "Modelo",
  interactive: "Resposta de botão",
  message: "Mensagem",
};

function normalizePreviewToken(token: string): string {
  const normalized = token.trim().toLowerCase();
  return LEGACY_PREVIEW_LABELS[normalized] ?? token.trim();
}

export function formatConversationPreview(
  text: string | null | undefined,
  kind?: string,
): string {
  const trimmed = text?.trim();
  if (trimmed) return trimmed;
  if (!kind) return "Nenhuma mensagem ainda";

  const label = LEGACY_PREVIEW_LABELS[kind.trim().toLowerCase()] ?? kind;
  return `[${label}]`;
}

export function normalizeConversationPreview(text: string | null | undefined): string {
  const trimmed = text?.trim();
  if (!trimmed) return "";

  const match = /^\[(.+)\]$/.exec(trimmed);
  if (!match) return trimmed;

  const token = match[1];
  const normalized = normalizePreviewToken(token);
  return `[${normalized}]`;
}
