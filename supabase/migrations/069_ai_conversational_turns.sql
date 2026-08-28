-- ============================================================
-- 069_ai_conversational_turns.sql
--
-- Turnos conversacionais para o Atendimento Inteligente.
--
-- PROBLEMA
-- Até aqui, cada mensagem recebida no webhook do WhatsApp disparava uma
-- execução independente da IA. Uma pessoa que escreve seis linhas seguidas
-- — o comportamento normal no WhatsApp — recebia seis respostas, cada uma
-- raciocinando sobre um pedaço do que ela quis dizer.
--
-- A mensagem é a unidade de transporte. A unidade de conversa é o TURNO:
-- o conjunto de mensagens consecutivas que a pessoa enviou antes de parar
-- de escrever. Esta migration cria a máquina de estados do turno.
--
-- ESTADOS
--   open         acumulando mensagens; fecha por inatividade ou por teto
--   processing   reivindicado por um executor; planejamento/LLM em curso
--   publishing   direito de publicar adquirido — ponto de não-retorno
--   completed    resposta publicada
--   superseded   invalidado por entrada nova antes de publicar
--   failed       excedeu as tentativas
--
-- INVARIANTES
--   1. No máximo um turno `open` por conversa (índice único parcial).
--   2. Uma mensagem pertence a no máximo um turno (UNIQUE em message_id) —
--      é isso que torna o append idempotente contra replay de webhook.
--   3. `processing -> superseded` e `processing -> publishing` são UPDATEs
--      de linha única sobre a MESMA linha: o lock de linha do Postgres
--      serializa a corrida entre "chegou mensagem nova" e "vou enviar a
--      resposta". Quem perde, perde inteiro.
--
-- AGENDAMENTO
-- Fechar um turno exige acordar alguém alguns segundos depois da última
-- mensagem — granularidade que cron HTTP (1 min) não entrega e que uma
-- função serverless dormindo entregaria caro e sem durabilidade. O
-- despachante roda no banco: pg_cron avalia a fila a cada poucos segundos
-- e só faz a chamada HTTP (pg_net) quando existe turno vencido, no mesmo
-- padrão já usado na migration 046. O endpoint HTTP continua drenável por
-- pinger externo — rede de segurança, não caminho principal.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Parâmetros de turno e presença, por conta
--
-- Ficam em ai_service_config e não em constantes espalhadas pelo código:
-- os tempos são decisão de experiência do dono da conta, e serão
-- calibrados com dado real (ai_execution_logs.aggregation_wait_ms).
-- ------------------------------------------------------------
ALTER TABLE public.ai_service_config
  ADD COLUMN IF NOT EXISTS turn_aggregation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  -- JANELA OCIOSA (idle). Silêncio após a última mensagem que fecha o turno.
  -- Curta de propósito: uma pergunta única não pode esperar a janela de uma
  -- rajada antes de a IA sequer começar. Quando a conversa já demonstrou ser
  -- rajada (duas mensagens ou mais no mesmo turno), o executor estende esta
  -- janela por um fator declarado em `src/lib/ai-service/turn-config.ts` —
  -- é regra derivada, não um terceiro botão.
  ADD COLUMN IF NOT EXISTS turn_inactivity_ms INTEGER NOT NULL DEFAULT 2500,
  -- JANELA MÁXIMA DO TURNO. Teto absoluto contado da primeira mensagem: quem
  -- escreve sem parar não segura o turno para sempre.
  ADD COLUMN IF NOT EXISTS turn_max_wait_ms INTEGER NOT NULL DEFAULT 45000,
  -- Presença conversacional entra DESLIGADA: é efeito externo em nível de
  -- autonomia 3+ (FH-18.08). O dono da conta liga sabendo o que liga.
  ADD COLUMN IF NOT EXISTS presence_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  -- Só depois deste tempo REAL de execução o silêncio vira percebido.
  ADD COLUMN IF NOT EXISTS presence_threshold_ms INTEGER NOT NULL DEFAULT 6000,
  -- Atualização de progresso exige etapa concluída de verdade (FH-46.04).
  ADD COLUMN IF NOT EXISTS progress_updates_enabled BOOLEAN NOT NULL DEFAULT FALSE;

DO $checks$
BEGIN
  ALTER TABLE public.ai_service_config
    ADD CONSTRAINT ai_service_config_turn_windows_check CHECK (
      turn_inactivity_ms BETWEEN 500 AND 120000
      AND turn_max_wait_ms BETWEEN 5000 AND 600000
      AND turn_max_wait_ms >= turn_inactivity_ms
      AND presence_threshold_ms BETWEEN 1000 AND 120000
    );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END
$checks$;

-- ------------------------------------------------------------
-- 2. Turnos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversation_turns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id            UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  conversation_id       UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  contact_id            UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,

  status                TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'processing', 'publishing', 'completed', 'superseded', 'failed')),

  -- Incrementa a cada mensagem aceita. É o token de invalidação: o
  -- executor guarda a geração que reivindicou e sabe se o chão mudou.
  generation            INTEGER NOT NULL DEFAULT 0,
  message_count         INTEGER NOT NULL DEFAULT 0,

  first_message_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Momento em que o turno fecha se ninguém mais escrever.
  closes_at             TIMESTAMPTZ NOT NULL,
  -- Teto: fecha aqui mesmo que a pessoa continue escrevendo.
  hard_deadline_at      TIMESTAMPTZ NOT NULL,

  -- Lease do executor. claim_token é o que autoriza publicar.
  claim_token           UUID,
  claimed_at            TIMESTAMPTZ,
  claim_expires_at      TIMESTAMPTZ,
  claimed_generation    INTEGER,
  attempt_count         INTEGER NOT NULL DEFAULT 0,

  -- Momento em que a mensagem de presença foi enviada. É também a trava
  -- de idempotência dela: um turno recuperado depois de uma execução
  -- interrompida não repete o reconhecimento que o cliente já leu.
  presence_sent_at      TIMESTAMPTZ,

  -- Momento em que a PRIMEIRA chamada ao WhatsApp foi tentada.
  --
  -- Separa duas coisas que antes se confundiam: "a publicação foi autorizada
  -- internamente" (status = 'publishing') e "o efeito externo já foi
  -- tentado" (esta coluna preenchida). Só a segunda é irreversível — antes
  -- dela nada saiu, e um executor que morreu aqui pode ser recuperado sem
  -- risco de resposta duplicada.
  external_attempt_at   TIMESTAMPTZ,

  -- A resposta final chegou de fato ao cliente. É o que marca as mensagens
  -- deste turno como respondidas: turno encerrado sem isto deixa suas
  -- mensagens em aberto, e elas entram no contexto do turno seguinte.
  response_published    BOOLEAN NOT NULL DEFAULT FALSE,

  -- Estratégia de resposta decidida no planejamento.
  plan                  JSONB,
  -- Turno que invalidou este, quando houve.
  superseded_by         UUID REFERENCES public.ai_conversation_turns(id) ON DELETE SET NULL,

  outcome               TEXT,
  error_message         TEXT,
  closed_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invariante 1: uma conversa tem no máximo um turno aberto. Um turno em
-- `processing` NÃO bloqueia a abertura de outro — é exatamente assim que
-- "a pessoa escreveu de novo enquanto a IA pensava" vira turno novo.
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_turns_open_per_conversation
  ON public.ai_conversation_turns (conversation_id)
  WHERE status = 'open';

-- Fila do despachante: turnos vencidos, do mais antigo ao mais novo.
CREATE INDEX IF NOT EXISTS idx_ai_turns_due
  ON public.ai_conversation_turns (closes_at)
  WHERE status = 'open';

-- Recuperação de lease expirado (executor morreu no meio).
CREATE INDEX IF NOT EXISTS idx_ai_turns_stale_lease
  ON public.ai_conversation_turns (claim_expires_at)
  WHERE status IN ('processing', 'publishing');

-- Varredura do contexto ainda não respondido de uma conversa.
CREATE INDEX IF NOT EXISTS idx_ai_turns_unanswered
  ON public.ai_conversation_turns (conversation_id, created_at)
  WHERE response_published = FALSE;

CREATE INDEX IF NOT EXISTS idx_ai_turns_account_created
  ON public.ai_conversation_turns (account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_turns_conversation_created
  ON public.ai_conversation_turns (conversation_id, created_at DESC);

ALTER TABLE public.ai_conversation_turns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view account ai turns" ON public.ai_conversation_turns;
CREATE POLICY "Members can view account ai turns"
  ON public.ai_conversation_turns FOR SELECT
  USING (is_account_member(account_id));

-- ------------------------------------------------------------
-- 3. Mensagens de um turno
--
-- Sem FK para `messages`: a tabela é particionada por RANGE(created_at) e
-- sua PK é composta (id, created_at) — a referência sairia mais cara e
-- mais frágil do que o que protegeria. Guardamos as duas colunas para
-- localizar a partição na leitura.
--
-- A granularidade original é preservada: o turno é uma camada lógica
-- sobre `messages`, nunca um substituto dela.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_turn_messages (
  turn_id            UUID NOT NULL REFERENCES public.ai_conversation_turns(id) ON DELETE CASCADE,
  message_id         UUID NOT NULL,
  message_created_at TIMESTAMPTZ NOT NULL,
  seq                INTEGER NOT NULL,
  PRIMARY KEY (turn_id, message_id),
  -- Invariante 2: uma mensagem pertence a um único turno. É esta linha
  -- que torna o append idempotente contra replay de webhook.
  CONSTRAINT uq_ai_turn_messages_message UNIQUE (message_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_turn_messages_turn_seq
  ON public.ai_turn_messages (turn_id, seq);

ALTER TABLE public.ai_turn_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view account ai turn messages" ON public.ai_turn_messages;
CREATE POLICY "Members can view account ai turn messages"
  ON public.ai_turn_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversation_turns t
      WHERE t.id = ai_turn_messages.turn_id
        AND is_account_member(t.account_id)
    )
  );

-- ------------------------------------------------------------
-- 4. Observabilidade: o log de execução passa a falar de turno
--
-- `stage` distingue as manifestações da mesma estratégia de resposta.
-- `aggregation_wait_ms` e `perceived_latency_ms` são os dados que vão
-- calibrar as janelas com conversa real em vez de palpite.
-- ------------------------------------------------------------
ALTER TABLE public.ai_execution_logs
  ADD COLUMN IF NOT EXISTS turn_id UUID REFERENCES public.ai_conversation_turns(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'final',
  ADD COLUMN IF NOT EXISTS turn_message_count INTEGER,
  ADD COLUMN IF NOT EXISTS plan JSONB,
  -- Silêncio entre a primeira mensagem do turno e o início da execução.
  ADD COLUMN IF NOT EXISTS aggregation_wait_ms INTEGER,
  -- As duas inferências, medidas em separado. `planning_ms` é o custo de
  -- latência que o planejamento acrescentou; `generation_ms` é o que a
  -- resposta em si levou. Sem essa separação não dá para saber se o
  -- planejamento virou uma segunda inferência serial cara.
  ADD COLUMN IF NOT EXISTS planning_ms INTEGER,
  ADD COLUMN IF NOT EXISTS generation_ms INTEGER,
  -- Mensagens herdadas de turnos anteriores que ficaram sem resposta.
  ADD COLUMN IF NOT EXISTS carried_over_message_count INTEGER,
  -- Da última mensagem do cliente até a resposta sair. É o número que
  -- a pessoa do outro lado efetivamente sente.
  ADD COLUMN IF NOT EXISTS perceived_latency_ms INTEGER,
  ADD COLUMN IF NOT EXISTS superseded BOOLEAN NOT NULL DEFAULT FALSE;

DO $checks$
BEGIN
  ALTER TABLE public.ai_execution_logs
    ADD CONSTRAINT ai_execution_logs_stage_check
    CHECK (stage IN ('plan', 'presence', 'partial', 'progress', 'final', 'superseded'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END
$checks$;

CREATE INDEX IF NOT EXISTS idx_ai_execution_logs_turn
  ON public.ai_execution_logs (turn_id)
  WHERE turn_id IS NOT NULL;

-- ------------------------------------------------------------
-- 5. RPC — anexar mensagem ao turno
--
-- Chamada uma vez por mensagem recebida, já depois de a mensagem estar
-- persistida. Abre o turno se não houver, ou estende a janela do turno
-- aberto. Invalida turno em `processing` da mesma conversa: a pessoa
-- falou de novo antes de a resposta sair.
--
-- Retorna a linha do turno. Em replay, retorna o turno existente sem
-- mexer em contador nenhum.
-- ------------------------------------------------------------
-- Assinaturas anteriores desta migration, caso ela ja tenha sido aplicada
-- em um ambiente antes destes ajustes: sem o DROP, a mudanca de aridade
-- criaria uma sobrecarga e o PostgREST nao saberia qual chamar.
DROP FUNCTION IF EXISTS public.ai_turn_append_message(UUID, UUID, UUID, UUID, TIMESTAMPTZ, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.ai_turn_append_message(
  p_account_id        UUID,
  p_conversation_id   UUID,
  p_contact_id        UUID,
  p_message_id        UUID,
  p_message_created_at TIMESTAMPTZ,
  p_inactivity_ms     INTEGER,
  p_max_wait_ms       INTEGER,
  -- Janela ociosa aplicada depois que o turno deixou de ser uma mensagem
  -- só. Quem já mandou duas linhas está no meio de uma rajada e merece
  -- mais folga; quem mandou uma pergunta e parou, não.
  p_burst_inactivity_ms INTEGER DEFAULT NULL
)
RETURNS TABLE (
  turn_id       UUID,
  status        TEXT,
  generation    INTEGER,
  message_count INTEGER,
  closes_at     TIMESTAMPTZ,
  was_created   BOOLEAN,
  was_duplicate BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- Os parametros OUT desta funcao (`status`, `generation`, `message_count`,
-- `closes_at`) tem o mesmo nome de colunas da tabela. Sem esta diretiva, todo
-- `WHERE status = 'open'` sairia como "column reference is ambiguous" em tempo
-- de execucao. `use_column` fixa a resolucao no lado da tabela, que e o que
-- todas as consultas abaixo querem dizer.
#variable_conflict use_column
DECLARE
  v_turn          public.ai_conversation_turns%ROWTYPE;
  v_created       BOOLEAN := FALSE;
  v_bound_turn    UUID;
  v_inactivity    INTERVAL := make_interval(secs => GREATEST(p_inactivity_ms, 0) / 1000.0);
  v_burst         INTERVAL := make_interval(
                                secs => GREATEST(COALESCE(p_burst_inactivity_ms, p_inactivity_ms), 0) / 1000.0
                              );
  v_max_wait      INTERVAL := make_interval(secs => GREATEST(p_max_wait_ms, 0) / 1000.0);
  v_next_seq      INTEGER;
  v_attempt       INTEGER;
BEGIN
  -- Idempotência primeiro: se a mensagem já pertence a um turno, este é
  -- um replay do webhook. Devolve o turno e não toca em nada.
  SELECT m.turn_id INTO v_bound_turn
  FROM public.ai_turn_messages m
  WHERE m.message_id = p_message_id;

  IF v_bound_turn IS NOT NULL THEN
    SELECT * INTO v_turn FROM public.ai_conversation_turns WHERE id = v_bound_turn;
    RETURN QUERY SELECT v_turn.id, v_turn.status, v_turn.generation,
                        v_turn.message_count, v_turn.closes_at, FALSE, TRUE;
    RETURN;
  END IF;

  -- Turno aberto da conversa, travado para esta transação. O índice
  -- único parcial garante que existe no máximo um.
  --
  -- Duas voltas, e não uma: a Meta entrega webhooks em paralelo, e duas
  -- mensagens da mesma conversa chegando juntas encontram ambas "nenhum
  -- turno aberto". A segunda perde o INSERT para o índice único — e a
  -- volta seguinte a encontra já criada, em vez de derrubar a RPC e
  -- deixar a mensagem fora do turno.
  FOR v_attempt IN 1..2 LOOP
    SELECT * INTO v_turn
    FROM public.ai_conversation_turns
    WHERE conversation_id = p_conversation_id
      AND status = 'open'
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.ai_conversation_turns
      SET generation      = generation + 1,
          last_message_at = GREATEST(last_message_at, p_message_created_at),
          -- A janela ociosa reinicia, mas nunca ultrapassa o teto. A partir
          -- da segunda mensagem vale a janela de rajada: a conversa já
          -- mostrou que é uma fala sendo construída aos poucos.
          closes_at       = LEAST(NOW() + v_burst, hard_deadline_at),
          updated_at      = NOW()
      WHERE id = v_turn.id
      RETURNING * INTO v_turn;
      EXIT;
    END IF;

    BEGIN
      INSERT INTO public.ai_conversation_turns (
        account_id, conversation_id, contact_id, status,
        generation, message_count,
        first_message_at, last_message_at,
        closes_at, hard_deadline_at
      ) VALUES (
        p_account_id, p_conversation_id, p_contact_id, 'open',
        1, 0,
        p_message_created_at, p_message_created_at,
        NOW() + v_inactivity, NOW() + v_max_wait
      )
      RETURNING * INTO v_turn;
      v_created := TRUE;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- Outro webhook abriu o turno neste instante. READ COMMITTED dá
      -- um snapshot novo à próxima consulta, então a volta seguinte o vê.
      v_turn := NULL;
    END;
  END LOOP;

  IF v_turn.id IS NULL THEN
    RAISE EXCEPTION 'ai_turn_append_message: não foi possível abrir ou localizar o turno da conversa %', p_conversation_id;
  END IF;

  SELECT COALESCE(MAX(seq), 0) + 1 INTO v_next_seq
  FROM public.ai_turn_messages WHERE ai_turn_messages.turn_id = v_turn.id;

  INSERT INTO public.ai_turn_messages (turn_id, message_id, message_created_at, seq)
  VALUES (v_turn.id, p_message_id, p_message_created_at, v_next_seq)
  ON CONFLICT (message_id) DO NOTHING;

  UPDATE public.ai_conversation_turns t
  SET message_count = (
        SELECT COUNT(*) FROM public.ai_turn_messages m WHERE m.turn_id = t.id
      ),
      updated_at = NOW()
  WHERE t.id = v_turn.id
  RETURNING * INTO v_turn;

  -- Invalidação. O ponto de não-retorno NÃO é a autorização interna de
  -- publicar (`publishing`), e sim a primeira tentativa de chamada ao
  -- WhatsApp (`external_attempt_at`). Um turno autorizado que ainda não
  -- tentou nada continua invalidável — nada saiu, e o que a pessoa acabou
  -- de escrever vale mais.
  UPDATE public.ai_conversation_turns
  SET status        = 'superseded',
      superseded_by = v_turn.id,
      outcome       = 'superseded_by_new_message',
      closed_at     = NOW(),
      updated_at    = NOW()
  WHERE conversation_id = p_conversation_id
    AND id <> v_turn.id
    AND external_attempt_at IS NULL
    AND status IN ('processing', 'publishing');

  RETURN QUERY SELECT v_turn.id, v_turn.status, v_turn.generation,
                      v_turn.message_count, v_turn.closes_at, v_created, FALSE;
END;
$$;

-- ------------------------------------------------------------
-- 6. RPC — reivindicar turnos vencidos
--
-- `FOR UPDATE SKIP LOCKED` deixa executores concorrentes dividirem a fila
-- sem pisarem um no outro. Também recupera lease expirado: executor que
-- morreu no meio devolve o turno para a fila até o limite de tentativas.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_claim_due(
  p_limit         INTEGER DEFAULT 10,
  p_lease_ms      INTEGER DEFAULT 120000,
  p_max_attempts  INTEGER DEFAULT 3
)
RETURNS TABLE (
  turn_id            UUID,
  account_id         UUID,
  conversation_id    UUID,
  contact_id         UUID,
  claim_token        UUID,
  claimed_generation INTEGER,
  message_count      INTEGER,
  first_message_at   TIMESTAMPTZ,
  last_message_at    TIMESTAMPTZ,
  attempt_count      INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- `attempt_count` e parametro OUT e tambem coluna; sem esta diretiva o
-- `WHERE ... attempt_count >= p_max_attempts` seria ambiguo.
#variable_conflict use_column
DECLARE
  v_lease INTERVAL := make_interval(secs => GREATEST(p_lease_ms, 1000) / 1000.0);
BEGIN
  -- Lease morto DEPOIS de a chamada ao WhatsApp ter sido tentada. Não se
  -- sabe se a Meta recebeu: reenviar arriscaria uma segunda resposta à
  -- mesma fala, e resposta duplicada é pior que resposta ausente. Estado
  -- explícito de resultado desconhecido, sem reenvio automático — quem
  -- decide o que fazer é o operador, olhando a auditoria.
  UPDATE public.ai_conversation_turns
  SET status        = 'failed',
      outcome       = 'external_result_unknown',
      error_message = 'Execução interrompida após a tentativa de envio; resultado no WhatsApp indeterminado, não reenviado',
      closed_at     = NOW(),
      updated_at    = NOW()
  WHERE status = 'publishing'
    AND external_attempt_at IS NOT NULL
    AND claim_expires_at < NOW();

  -- Lease morto sem nada ter saído — em `processing`, ou em `publishing`
  -- antes da primeira tentativa externa — com as tentativas esgotadas.
  UPDATE public.ai_conversation_turns
  SET status        = 'failed',
      outcome       = 'lease_expired_max_attempts',
      error_message = 'Execução não concluída após o número máximo de tentativas',
      closed_at     = NOW(),
      updated_at    = NOW()
  WHERE status IN ('processing', 'publishing')
    AND external_attempt_at IS NULL
    AND claim_expires_at < NOW()
    AND attempt_count >= p_max_attempts;

  RETURN QUERY
  WITH due AS (
    SELECT t.id
    FROM public.ai_conversation_turns t
    WHERE (
            (t.status = 'open' AND (t.closes_at <= NOW() OR t.hard_deadline_at <= NOW()))
            -- Lease morto sem efeito externo tentado, com tentativa
            -- sobrando: volta para a fila. Vale também para `publishing`
            -- pré-tentativa — a autorização interna de publicar não custou
            -- nada ao cliente, e perder a resposta ali seria perda pura.
            OR (t.status IN ('processing', 'publishing')
                AND t.external_attempt_at IS NULL
                AND t.claim_expires_at < NOW()
                AND t.attempt_count < p_max_attempts)
          )
    ORDER BY t.closes_at ASC
    LIMIT GREATEST(p_limit, 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.ai_conversation_turns t
  SET status             = 'processing',
      claim_token        = gen_random_uuid(),
      claimed_at         = NOW(),
      claim_expires_at   = NOW() + v_lease,
      claimed_generation = t.generation,
      attempt_count      = t.attempt_count + 1,
      updated_at         = NOW()
  FROM due
  WHERE t.id = due.id
  RETURNING t.id, t.account_id, t.conversation_id, t.contact_id,
            t.claim_token, t.claimed_generation, t.message_count,
            t.first_message_at, t.last_message_at, t.attempt_count;
END;
$$;

-- ------------------------------------------------------------
-- 6b. RPC — reivindicar um turno específico, agora
--
-- Usado quando a conta desliga a agregação (`turn_aggregation_enabled`
-- = false): o turno fecha na mesma invocação do webhook e volta ao
-- comportamento de uma resposta por mensagem. Existe para que o
-- desligamento não crie um segundo caminho de execução — quem responde
-- continua sendo o mesmo runner.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_claim_one(
  p_turn_id  UUID,
  p_lease_ms INTEGER DEFAULT 120000
)
RETURNS TABLE (
  turn_id            UUID,
  account_id         UUID,
  conversation_id    UUID,
  contact_id         UUID,
  claim_token        UUID,
  claimed_generation INTEGER,
  message_count      INTEGER,
  first_message_at   TIMESTAMPTZ,
  last_message_at    TIMESTAMPTZ,
  attempt_count      INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_lease INTERVAL := make_interval(secs => GREATEST(p_lease_ms, 1000) / 1000.0);
BEGIN
  RETURN QUERY
  UPDATE public.ai_conversation_turns t
  SET status             = 'processing',
      claim_token        = gen_random_uuid(),
      claimed_at         = NOW(),
      claim_expires_at   = NOW() + v_lease,
      claimed_generation = t.generation,
      attempt_count      = t.attempt_count + 1,
      updated_at         = NOW()
  WHERE t.id = p_turn_id
    AND t.status = 'open'
  RETURNING t.id, t.account_id, t.conversation_id, t.contact_id,
            t.claim_token, t.claimed_generation, t.message_count,
            t.first_message_at, t.last_message_at, t.attempt_count;
END;
$$;

-- ------------------------------------------------------------
-- 6c. RPC — reivindicar um turno se ele ainda for aquele que eu esperava
--
-- É o caminho rápido. O webhook conhece, no instante do append, exatamente
-- quando aquele turno deveria fechar — e agenda um despertador para esse
-- momento. Ao acordar, o despertador chama isto.
--
-- Numa rajada, cada mensagem deixa um despertador para trás:
--
--   M1 → espera até 10:00:02.5   (geração 1)
--   M2 → espera até 10:00:03.1   (geração 2)
--   ...
--   M6 → espera até 10:00:05.7   (geração 6)
--
-- Quando o de M1 acorda, o turno já está na geração 6: ele nasceu obsoleto
-- e esta função devolve zero linhas. Ele morre ali — sem HTTP, sem runner,
-- sem acordar ninguém. Só o despertador cuja geração ainda casa com a do
-- turno ganha o direito de disparar a execução.
--
-- É um debounce distribuído otimista, e a autoridade continua sendo o
-- banco: a decisão é um UPDATE de linha única, não uma comparação em
-- TypeScript.
--
-- `p_expected_closes_at` é redundante com a geração (todo append mexe nos
-- dois) e está aqui como segunda barreira, exatamente como pedido. Ele
-- exige que o chamador devolva a string de `closes_at` sem passar por
-- Date: um round-trip por `new Date()` truncaria os microssegundos e
-- nenhuma reivindicação casaria — falha silenciosa que pareceria
-- funcionar, porque o cron de recuperação cobriria tudo depois.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_claim_if_due(
  p_turn_id            UUID,
  p_expected_generation INTEGER,
  p_expected_closes_at  TIMESTAMPTZ,
  p_lease_ms           INTEGER DEFAULT 120000
)
RETURNS TABLE (
  turn_id            UUID,
  account_id         UUID,
  conversation_id    UUID,
  contact_id         UUID,
  claim_token        UUID,
  claimed_generation INTEGER,
  message_count      INTEGER,
  first_message_at   TIMESTAMPTZ,
  last_message_at    TIMESTAMPTZ,
  attempt_count      INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_lease INTERVAL := make_interval(secs => GREATEST(p_lease_ms, 1000) / 1000.0);
BEGIN
  RETURN QUERY
  UPDATE public.ai_conversation_turns t
  SET status             = 'processing',
      claim_token        = gen_random_uuid(),
      claimed_at         = NOW(),
      claim_expires_at   = NOW() + v_lease,
      claimed_generation = t.generation,
      attempt_count      = t.attempt_count + 1,
      updated_at         = NOW()
  WHERE t.id = p_turn_id
    AND t.status = 'open'
    -- O turno ainda é aquele para o qual este despertador foi criado.
    AND t.generation = p_expected_generation
    AND t.closes_at = p_expected_closes_at
    -- E já venceu de fato. Sem isto, um despertador que acordasse cedo
    -- por imprecisão de timer fecharia o turno antes da hora.
    AND t.closes_at <= NOW()
  RETURNING t.id, t.account_id, t.conversation_id, t.contact_id,
            t.claim_token, t.claimed_generation, t.message_count,
            t.first_message_at, t.last_message_at, t.attempt_count;
END;
$$;

-- ------------------------------------------------------------
-- 7. RPC — adquirir o direito de publicar
--
-- Chamado imediatamente antes de qualquer envio ao WhatsApp. É o único
-- ponto que autoriza falar. Se o turno foi invalidado por mensagem nova,
-- ou se o lease venceu, o UPDATE não casa e o executor cala a boca.
--
-- A transição é atômica por lock de linha: `ai_turn_append_message`
-- (que marca `superseded`) e esta função disputam a MESMA linha.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_begin_publish(
  p_turn_id     UUID,
  p_claim_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  UPDATE public.ai_conversation_turns
  SET status     = 'publishing',
      updated_at = NOW()
  WHERE id = p_turn_id
    AND claim_token = p_claim_token
    AND status = 'processing'
    AND claim_expires_at > NOW()
  RETURNING TRUE INTO v_ok;

  RETURN COALESCE(v_ok, FALSE);
END;
$$;

-- ------------------------------------------------------------
-- 8. RPC — encerrar o turno
--
-- `p_status` aceita apenas os estados terminais. Um turno já invalidado
-- não é reescrito: o desfecho real dele é `superseded`.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.ai_turn_finish(UUID, UUID, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.ai_turn_finish(
  p_turn_id     UUID,
  p_claim_token UUID,
  p_status      TEXT,
  p_outcome     TEXT DEFAULT NULL,
  p_error       TEXT DEFAULT NULL,
  p_plan        JSONB DEFAULT NULL,
  -- A resposta final chegou de fato ao cliente. Falso aqui deixa as
  -- mensagens do turno em aberto para o turno seguinte.
  p_response_published BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  IF p_status NOT IN ('completed', 'failed') THEN
    RAISE EXCEPTION 'ai_turn_finish: status terminal inválido (%)', p_status;
  END IF;

  UPDATE public.ai_conversation_turns
  SET status             = p_status,
      outcome            = COALESCE(p_outcome, outcome),
      error_message      = p_error,
      plan               = COALESCE(p_plan, plan),
      response_published = COALESCE(p_response_published, FALSE),
      closed_at          = NOW(),
      updated_at         = NOW()
  WHERE id = p_turn_id
    AND claim_token = p_claim_token
    AND status IN ('processing', 'publishing')
  RETURNING TRUE INTO v_ok;

  RETURN COALESCE(v_ok, FALSE);
END;
$$;

-- ------------------------------------------------------------
-- 9. RPC — registrar o plano decidido
--
-- Gravado antes da execução para que o plano exista no rastro mesmo se a
-- execução falhar depois (FH-53.10). Só escreve se o lease ainda vale.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_record_plan(
  p_turn_id     UUID,
  p_claim_token UUID,
  p_plan        JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  UPDATE public.ai_conversation_turns
  SET plan = p_plan, updated_at = NOW()
  WHERE id = p_turn_id
    AND claim_token = p_claim_token
    AND status = 'processing'
  RETURNING TRUE INTO v_ok;

  RETURN COALESCE(v_ok, FALSE);
END;
$$;

-- ------------------------------------------------------------
-- 9b. RPC — marcar a primeira tentativa de efeito externo
--
-- Chamado imediatamente antes da PRIMEIRA chamada ao WhatsApp, e só dela.
-- É este o verdadeiro ponto de não-retorno: `publishing` é decisão
-- interna, esta coluna é consequência no mundo.
--
-- Retorna FALSE quando o turno foi invalidado entre a autorização e a
-- chamada — nesse caso nada deve ser enviado.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_mark_external_attempt(
  p_turn_id     UUID,
  p_claim_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  UPDATE public.ai_conversation_turns
  SET external_attempt_at = NOW(),
      updated_at          = NOW()
  WHERE id = p_turn_id
    AND claim_token = p_claim_token
    AND status = 'publishing'
    AND external_attempt_at IS NULL
  RETURNING TRUE INTO v_ok;

  RETURN COALESCE(v_ok, FALSE);
END;
$$;

-- ------------------------------------------------------------
-- 9b2. RPC — autorizar a mensagem de presença
--
-- Substitui uma leitura solta de status por uma transição atômica. Faz
-- duas coisas de uma vez:
--
--   1. confere que o turno ainda vale (não foi invalidado nem perdeu o
--      lease) — quem já não manda na conversa não fala;
--   2. torna a presença no-máximo-uma-vez, inclusive entre tentativas:
--      `presence_sent_at IS NULL` falha na reexecução de um turno
--      recuperado, e o cliente não lê duas vezes o mesmo reconhecimento.
--
-- Diferente de `ai_turn_mark_external_attempt`, isto NÃO congela o turno:
-- mandar um reconhecimento não dá a ninguém o direito de publicar depois
-- uma resposta que já ficou velha.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_mark_presence_sent(
  p_turn_id     UUID,
  p_claim_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  UPDATE public.ai_conversation_turns
  SET presence_sent_at = NOW(),
      updated_at       = NOW()
  WHERE id = p_turn_id
    AND claim_token = p_claim_token
    AND status = 'processing'
    AND presence_sent_at IS NULL
  RETURNING TRUE INTO v_ok;

  RETURN COALESCE(v_ok, FALSE);
END;
$$;

-- ------------------------------------------------------------
-- 9c. RPC — contexto efetivo de um turno
--
-- Um turno invalidado não some da conversa: as mensagens dele nunca
-- receberam resposta. O cenário canônico:
--
--   Cliente: Quanto custa?          → turno A fecha, entra em processing
--   Cliente: Na verdade preciso de 30 unidades.
--                                   → A é invalidado, B é criado
--
-- Se B recebesse apenas a segunda linha, a IA responderia "30 unidades de
-- quê?". O contexto efetivo de B é A + B.
--
-- A regra: as mensagens do próprio turno, mais as de todo turno anterior
-- da mesma conversa encerrado SEM resposta publicada, até a última
-- resposta que de fato saiu.
--
-- `superseded` e `failed` entram. `completed` sem resposta NÃO entra: são
-- os desfechos deliberados — handoff para humano, limite horário, serviço
-- desligado — em que ressuscitar a fala do cliente na próxima execução da
-- IA seria contrariar a decisão que acabou de ser tomada.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_effective_messages(p_turn_id UUID)
RETURNS TABLE (
  message_id         UUID,
  message_created_at TIMESTAMPTZ,
  seq                INTEGER,
  source_turn_id     UUID,
  carried_over       BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_turn      public.ai_conversation_turns%ROWTYPE;
  v_watermark TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_turn FROM public.ai_conversation_turns WHERE id = p_turn_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Marca d'água: o turno mais recente desta conversa, anterior a este,
  -- cuja resposta chegou ao cliente. Tudo antes dele já foi respondido.
  SELECT MAX(t.created_at) INTO v_watermark
  FROM public.ai_conversation_turns t
  WHERE t.conversation_id = v_turn.conversation_id
    AND t.id <> v_turn.id
    AND t.created_at <= v_turn.created_at
    AND t.response_published = TRUE;

  RETURN QUERY
  SELECT m.message_id,
         m.message_created_at,
         m.seq,
         t.id,
         (t.id <> v_turn.id) AS carried_over
  FROM public.ai_turn_messages m
  JOIN public.ai_conversation_turns t ON t.id = m.turn_id
  WHERE t.conversation_id = v_turn.conversation_id
    AND (
      t.id = v_turn.id
      OR (
        t.created_at <= v_turn.created_at
        AND t.status IN ('superseded', 'failed')
        AND t.response_published = FALSE
        AND (v_watermark IS NULL OR t.created_at > v_watermark)
      )
    )
  ORDER BY m.message_created_at ASC, t.created_at ASC, m.seq ASC;
END;
$$;

-- ------------------------------------------------------------
-- 10. RPC — cancelar o turno aberto de uma conversa
--
-- Usado quando a conversa passa para atendimento humano (handoff, injeção
-- de prompt, operador assumiu). O que estava acumulado deixa de ser
-- assunto da IA na hora.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_cancel_open(
  p_conversation_id UUID,
  p_reason          TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.ai_conversation_turns
  SET status     = 'superseded',
      outcome    = COALESCE(p_reason, 'cancelled'),
      closed_at  = NOW(),
      updated_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND status IN ('open', 'processing');

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ------------------------------------------------------------
-- 10b. Segredo interno — resolução em ordem de segurança
--
-- A migration 046 guardou o segredo que autentica as chamadas internas do
-- banco em `public.system_config`, uma tabela comum: texto claro em
-- repouso, presente em dump e em backup, e legível por qualquer papel com
-- SELECT na tabela. Para uma credencial que abre rota interna, isso é
-- armazenamento inadequado.
--
-- O Supabase Vault existe exatamente para isto: cifra em repouso com
-- chave gerenciada, e a leitura em claro é privilégio de quem consegue
-- ler `vault.decrypted_secrets`. Esta função passa a ser o único ponto de
-- resolução do segredo, com degradação explícita:
--
--   1. Vault  — `flowhub_internal_cron_secret`   (preferido)
--   2. system_config                              (legado, migra e apaga)
--   3. GUC `app.settings.internal_alerts_secret`  (self-hosted)
--
-- Passo do operador, uma vez:
--   SELECT vault.create_secret('<segredo>', 'flowhub_internal_cron_secret',
--                              'Segredo das chamadas internas do FlowHub');
--   DELETE FROM public.system_config WHERE key = 'internal_alerts_secret';
--
-- Enquanto o passo não for dado, o comportamento é o de antes — nada
-- quebra, e o aviso abaixo aparece no log a cada leitura.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.flowhub_internal_secret()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_secret TEXT;
BEGIN
  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'flowhub_internal_cron_secret'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    -- Vault ausente (self-hosted sem a extensão) ou sem permissão.
    v_secret := NULL;
  END;

  IF v_secret IS NOT NULL AND v_secret <> '' THEN
    RETURN v_secret;
  END IF;

  SELECT value INTO v_secret FROM public.system_config WHERE key = 'internal_alerts_secret';
  IF v_secret IS NOT NULL AND v_secret <> '' THEN
    RAISE WARNING 'flowhub_internal_secret: segredo lido de system_config (texto claro). Mova-o para o Vault — ver migration 069, secao 10b.';
    RETURN v_secret;
  END IF;

  RETURN current_setting('app.settings.internal_alerts_secret', true);
END;
$$;

-- A migration 046 lia o segredo direto de `system_config`. Repontamos a
-- funcao de alerta para o mesmo resolvedor: nao faria sentido proteger o
-- segredo em um caminho e deixa-lo exposto no outro, ja que e o mesmo
-- segredo. Unica mudanca no corpo; o resto e identico a 046.
CREATE OR REPLACE FUNCTION public.notify_security_event_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_app_url TEXT;
  v_secret TEXT;
  v_source TEXT;
  v_summary TEXT;
  v_details JSONB;
  v_should_fire BOOLEAN := TRUE;
BEGIN
  SELECT value INTO v_app_url FROM public.system_config WHERE key = 'app_url';
  IF v_app_url IS NULL OR v_app_url = '' THEN
    v_app_url := current_setting('app.settings.app_url', true);
  END IF;

  v_secret := public.flowhub_internal_secret();

  IF v_app_url IS NULL OR v_app_url = '' THEN
    RETURN NEW;
  END IF;

  v_app_url := rtrim(v_app_url, '/');

  IF TG_TABLE_NAME = 'ai_security_events' THEN
    IF NEW.severity <> 'critical' THEN
      v_should_fire := FALSE;
    ELSE
      v_source := 'ai_security_events';
      v_summary := 'Evento crítico de segurança IA (' || COALESCE(NEW.event_type, 'desconhecido') || ')';
      v_details := to_jsonb(NEW);
    END IF;

  ELSIF TG_TABLE_NAME = 'super_admin_audit_logs' THEN
    v_source := 'super_admin_audit_logs';
    v_summary := 'Alteração de Super Admin: ' || COALESCE(NEW.action, '') || ' para ' || COALESCE(NEW.target_email, '') || ' (por ' || COALESCE(NEW.performed_by_email, '') || ')';
    v_details := to_jsonb(NEW);

  ELSIF TG_TABLE_NAME = 'account_deletion_audit_logs' THEN
    v_source := 'account_deletion_audit_logs';
    v_summary := 'Conta expurgada definitivamente: ' || COALESCE(NEW.account_name, '') || ' (Dono: ' || COALESCE(NEW.owner_email, 'N/A') || ')';
    v_details := to_jsonb(NEW);
  END IF;

  IF v_should_fire THEN
    PERFORM net.http_post(
      url := v_app_url || '/api/internal/alerts/security-event',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', COALESCE(v_secret, '')
      ),
      body := jsonb_build_object(
        'source', v_source,
        'summary', v_summary,
        'details', v_details
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_security_event_alert failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_security_event_alert() FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------
-- 11. Despachante de RECUPERAÇÃO
--
-- Não é o caminho normal. Quem fecha o turno no fluxo saudável é o
-- despertador que o próprio webhook agendou: ele conhece `closes_at` no
-- instante do append e acorda exatamente ali, sem varredura e sem jitter.
--
-- Este despachante cobre o que escapa dele — ciclo pós-resposta que não
-- rodou, deploy no meio, lease vencido, espera longa demais para o
-- caminho rápido. Por isso 5 segundos bastam: a granularidade dele deixou
-- de estar na rota crítica.
--
-- Só faz HTTP quando existe trabalho. Em conta parada o custo é uma
-- varredura de índice parcial — nenhuma invocação serverless.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_turn_dispatch_due()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_due     INTEGER;
  v_app_url TEXT;
  v_secret  TEXT;
BEGIN
  SELECT COUNT(*) INTO v_due
  FROM public.ai_conversation_turns
  WHERE (status = 'open' AND (closes_at <= NOW() OR hard_deadline_at <= NOW()))
     OR (status IN ('processing', 'publishing') AND claim_expires_at < NOW());

  IF v_due = 0 THEN
    RETURN 0;
  END IF;

  SELECT value INTO v_app_url FROM public.system_config WHERE key = 'app_url';
  IF v_app_url IS NULL OR v_app_url = '' THEN
    v_app_url := current_setting('app.settings.app_url', true);
  END IF;
  IF v_app_url IS NULL OR v_app_url = '' THEN
    RAISE WARNING 'ai_turn_dispatch_due: app_url não configurada; % turnos aguardando o cron HTTP', v_due;
    RETURN 0;
  END IF;

  v_secret := public.flowhub_internal_secret();

  PERFORM net.http_post(
    url     := rtrim(v_app_url, '/') || '/api/ai-service/turns/drain',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', COALESCE(v_secret, '')
    ),
    body    := jsonb_build_object('source', 'pg_cron', 'due', v_due)
  );

  RETURN v_due;
EXCEPTION WHEN OTHERS THEN
  -- Degradação graciosa: o cron HTTP continua drenando a fila.
  RAISE WARNING 'ai_turn_dispatch_due falhou: %', SQLERRM;
  RETURN 0;
END;
$$;

-- Agendamento a cada 5 segundos. Requer pg_cron >= 1.5 (sintaxe de
-- intervalo). Ambiente sem a extensão apenas registra o aviso — a fila
-- continua sendo drenada pelo cron HTTP de 1 minuto.
--
-- 5s e não 1s de propósito: com o despertador do webhook cobrindo o
-- caminho normal, encurtar este intervalo não compraria latência
-- nenhuma — só transformaria uma verificação que importa quando chega
-- mensagem em 86.400 varreduras por dia, por ambiente, mesmo sem
-- tráfego, com o `cron.job_run_details` crescendo junto.
DO $sched$
BEGIN
  PERFORM cron.unschedule('flowhub-ai-turn-dispatch');
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$sched$;

DO $sched$
BEGIN
  PERFORM cron.schedule(
    'flowhub-ai-turn-dispatch',
    '5 seconds',
    $job$SELECT public.ai_turn_dispatch_due();$job$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cron.schedule para ai_turn_dispatch_due ignorado: %', SQLERRM;
END
$sched$;

-- ------------------------------------------------------------
-- 12. Superfície de execução
--
-- Nenhuma destas funções é chamável pela API pública: o motor de turnos
-- roda com service role. Segue a política das migrations 062 e 066.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.ai_turn_append_message(UUID, UUID, UUID, UUID, TIMESTAMPTZ, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_mark_external_attempt(UUID, UUID)                                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_mark_presence_sent(UUID, UUID)                                        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_effective_messages(UUID)                                              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.flowhub_internal_secret()                                                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_claim_due(INTEGER, INTEGER, INTEGER)                                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_claim_one(UUID, INTEGER)                                              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_claim_if_due(UUID, INTEGER, TIMESTAMPTZ, INTEGER)                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_begin_publish(UUID, UUID)                                             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_finish(UUID, UUID, TEXT, TEXT, TEXT, JSONB, BOOLEAN)                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_record_plan(UUID, UUID, JSONB)                                        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_cancel_open(UUID, TEXT)                                               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ai_turn_dispatch_due()                                                        FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.ai_turn_append_message(UUID, UUID, UUID, UUID, TIMESTAMPTZ, INTEGER, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_mark_external_attempt(UUID, UUID)                                     TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_mark_presence_sent(UUID, UUID)                                        TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_effective_messages(UUID)                                              TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_claim_due(INTEGER, INTEGER, INTEGER)                                  TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_claim_one(UUID, INTEGER)                                              TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_claim_if_due(UUID, INTEGER, TIMESTAMPTZ, INTEGER)                     TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_begin_publish(UUID, UUID)                                             TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_finish(UUID, UUID, TEXT, TEXT, TEXT, JSONB, BOOLEAN)                  TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_record_plan(UUID, UUID, JSONB)                                        TO service_role;
GRANT EXECUTE ON FUNCTION public.ai_turn_cancel_open(UUID, TEXT)                                               TO service_role;

COMMIT;
