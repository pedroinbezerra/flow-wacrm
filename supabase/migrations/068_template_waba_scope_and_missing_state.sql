-- ============================================================
-- 068_template_waba_scope_and_missing_state.sql
--
-- Modelos precisam dizer a verdade sobre onde existem.
--
-- Problema corrigido:
--   Um modelo do WhatsApp existe DENTRO de uma WhatsApp Business
--   Account (WABA). Localmente, message_templates so era escopado por
--   account_id — nao havia registro de qual WABA originou a linha.
--   Consequencia observada em producao: ao desconectar um numero e
--   conectar outro (WABA diferente), o catalogo antigo permanecia
--   marcado APPROVED. A sincronizacao trazia zero modelos da nova WABA
--   e reportava sucesso, porque so fazia upsert do que a Meta devolvia
--   e nunca reconciliava ausencias. O envio entao falhava na Meta com
--   (#132001) Template name does not exist in the translation.
--
--   Ou seja: a tela afirmava "Aprovado" para um modelo que nao existia
--   mais em lugar nenhum. Estado exibido != estado real.
--
-- O que esta migracao adiciona:
--   1. waba_id — a WABA que efetivamente hospeda o modelo na Meta.
--      Preenchido pela sincronizacao e pelo submit. NULL significa
--      "origem ainda nao verificada" (linhas anteriores a esta
--      migracao), nao "pertence a WABA atual".
--   2. status 'MISSING' — estado local, nunca vindo da Meta: o modelo
--      tinha contrapartida remota e a Meta nao o lista mais na WABA de
--      origem. Substitui o APPROVED mentiroso.
--   3. missing_since — quando a reconciliacao detectou a ausencia,
--      para a interface poder datar o que afirma.
--
-- Por que NAO ha backfill de waba_id:
--   Nao da para provar de qual WABA veio uma linha antiga. Carimbar
--   todas com a WABA conectada hoje transformaria exatamente os orfaos
--   que queremos achar em linhas de aparencia legitima. NULL e a
--   afirmacao honesta; a proxima sincronizacao resolve cada linha —
--   presente na Meta vira carimbada, ausente vira MISSING.
--
-- Idempotente — seguro reexecutar.
-- ============================================================

-- 1. Coluna de origem.
ALTER TABLE message_templates
  ADD COLUMN IF NOT EXISTS waba_id TEXT,
  ADD COLUMN IF NOT EXISTS missing_since TIMESTAMPTZ;

-- 2. status: acrescenta 'MISSING' ao enum bruto da Meta.
--    'MISSING' e escrito somente pela reconciliacao local (sincronizacao,
--    desconexao de numero, auto-correcao no envio). A Meta nunca o envia,
--    entao o mapeamento 1:1 dos webhooks continua valendo.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'message_templates_status_meta_check'
      AND conrelid = 'message_templates'::regclass
  ) THEN
    ALTER TABLE message_templates
      DROP CONSTRAINT message_templates_status_meta_check;
  END IF;

  ALTER TABLE message_templates
    ADD CONSTRAINT message_templates_status_meta_check
    CHECK (status IN (
      'DRAFT',
      'PENDING',
      'APPROVED',
      'REJECTED',
      'PAUSED',
      'DISABLED',
      'IN_APPEAL',
      'PENDING_DELETION',
      'MISSING'
    ));
END $$;

-- 3. Indice de reconciliacao. A sincronizacao varre "linhas desta conta
--    que dizem existir na Meta" para decidir o que sobrou de fora do
--    retorno; o envio consulta (account_id, name, language) e compara
--    waba_id.
CREATE INDEX IF NOT EXISTS idx_message_templates_account_waba
  ON message_templates (account_id, waba_id);

COMMENT ON COLUMN message_templates.waba_id IS
  'WABA que hospeda este modelo na Meta. NULL = origem nao verificada (linha anterior a 068 ou criada localmente sem envio). Nunca assumir que NULL pertence a conexao ativa.';

COMMENT ON COLUMN message_templates.missing_since IS
  'Momento em que a reconciliacao constatou que a Meta nao lista mais este modelo. NULL enquanto status <> MISSING.';
