# Privatização do bucket `ai-service-media`

Direcionamento para corrigir a mesma classe de exposição já resolvida na
migration `040_private_conversation_media.sql` (para `chat-media` e
`flow-media`), que não cobriu o bucket `ai-service-media`.

---

## O problema

`ai-service-media` foi criado em `036_smart_ai_service.sql` como bucket
**público**, com a policy `"AI service media is publicly readable"`
liberando `SELECT` para qualquer um, sem checagem de conta:

```sql
INSERT INTO storage.buckets (id, name, public, ...)
VALUES ('ai-service-media', 'ai-service-media', TRUE, ...);

CREATE POLICY "AI service media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-service-media');
```

Esse bucket guarda a **biblioteca de mídia da IA** (`ai_media_library`):
imagens, vídeos, PDFs e documentos que cada cliente cadastra para a IA
enviar durante o atendimento. Hoje qualquer pessoa com a URL do arquivo
acessa o conteúdo sem login e sem pertencer à conta — o mesmo problema que
motivou a migration 040, só que esse bucket ficou de fora dela.

O bucket também não está em `SIGNABLE_BUCKETS`
(`src/lib/storage/media-src.ts:12`), então o mecanismo de URL assinada já
existente no projeto não se aplica a ele ainda.

## Onde isso é usado

- **Upload**: `src/app/api/ai-assistant/media/route.ts` (POST, linhas
  ~79-97) — salva o arquivo em `ai-service-media` sob o prefixo
  `account-<accountId>/...` (mesma convenção já usada nos outros buckets) e
  grava a **URL pública completa** em `ai_media_library.media_url` via
  `getPublicUrl`.
- **Envio ao WhatsApp**: `src/lib/ai-service/engine.ts:337` — pega
  `mediaItem.media_url` direto do banco e manda como `link` para a API da
  Meta, sem nenhuma resolução de URL assinada.
- **Preview no painel**: `src/app/(dashboard)/ai-assistant/page.tsx` —
  renderiza os itens da biblioteca de mídia para o usuário logado.

## O que precisa ser feito

Mesmo padrão já aplicado e validado em `chat-media`/`flow-media`:

1. **Nova migration** — flipar o bucket para privado e trocar a policy de
   SELECT pública por uma escopada por conta, reaproveitando exatamente o
   predicado já usado nas policies de INSERT/DELETE desse mesmo bucket
   (`036_smart_ai_service.sql`, linhas 133-151):

   ```sql
   UPDATE storage.buckets SET public = false WHERE id = 'ai-service-media';

   DROP POLICY IF EXISTS "AI service media is publicly readable" ON storage.objects;
   CREATE POLICY "Members can view AI service media"
     ON storage.objects FOR SELECT
     USING (
       bucket_id = 'ai-service-media'
       AND EXISTS (
         SELECT 1 FROM public.profiles p
         WHERE p.user_id = auth.uid()
           AND ('account-' || p.account_id::text) = (storage.foldername(name))[1]
       )
     );
   ```

2. **Adicionar `'ai-service-media'` a `SIGNABLE_BUCKETS`** em
   `src/lib/storage/media-src.ts:12`. Como `parseStorageReference` já sabe
   interpretar o formato `/storage/v1/object/public/{bucket}/{path}`, as
   URLs públicas já salvas em `ai_media_library.media_url` continuam sendo
   reconhecidas e resolvidas — não precisa de backfill nos dados
   existentes.

3. **Resolver a URL antes de enviar para o WhatsApp** —
   `src/lib/ai-service/engine.ts:337`: trocar `link: mediaItem.media_url`
   por uma chamada a `resolveSendableMediaLink(mediaItem.media_url)` (mesma
   função já usada em `whatsapp/send/route.ts`, `flows/engine.ts` e
   `meta-api.ts`), garantindo que a Meta recebe uma URL assinada e
   temporária em vez de depender do bucket ser público.

4. **Preview no painel** — em
   `src/app/(dashboard)/ai-assistant/page.tsx`, trocar o uso direto de
   `media_url` na renderização por `normalizeMediaSrc(media_url)`, mesmo
   padrão já usado em `message-bubble.tsx` e `template-manager.tsx`.

5. **Opcional, mas recomendado para consistência futura**: no upload
   (`src/app/api/ai-assistant/media/route.ts`), passar a salvar o
   `proxyPath` em vez da URL pública completa, como já foi feito em
   `uploadAccountMedia` para os demais buckets. Não é bloqueante — o item 2
   já cobre a compatibilidade com o que está salvo hoje — mas evita
   depender indefinidamente do parsing de URL legado.

## Critério de aceite

- Após a migration, uma requisição não autenticada direto na URL de um
  objeto do bucket `ai-service-media` deve retornar 401/403 (hoje retorna
  200).
- A IA deve continuar conseguindo enviar itens já cadastrados na biblioteca
  de mídia para o WhatsApp sem erro.
- O preview da biblioteca de mídia no painel do assistente de IA deve
  continuar renderizando normalmente para usuários autenticados e membros
  da conta.
