-- ============================================================
-- 070_multi_workspace_memberships.sql — uma identidade, vários workspaces
--
-- Contexto completo em docs/architecture/multi-workspace-tenancy.md.
--
-- O QUE MUDA
-- ----------
-- O vínculo usuário↔conta sai de `profiles.account_id` / `profiles.account_role`
-- e passa para a tabela `account_memberships` (N:N). As duas colunas do perfil
-- permanecem, com significado novo e declarado:
--
--   profiles.account_id    -> WORKSPACE ATIVO (contexto operacional atual)
--   profiles.account_role  -> espelho do papel na participação ativa
--
-- Essa escolha é o que mantém o isolamento intacto: as ~120 políticas RLS
-- escritas em 017…064 chamam `is_account_member(account_id, min_role)`, cuja
-- assinatura e nome não mudam. Ela continua significando "este é o tenant em
-- que estou trabalhando", mas passa a derivar a resposta da participação, e
-- não mais da coluna do perfil. Nenhuma política precisa ser reescrita, e
-- nenhuma consulta passa a devolver a união dos workspaces da pessoa.
--
-- O QUE DEIXA DE EXISTIR
-- ----------------------
-- A heurística de "conta vazia" de 019_invitation_rpcs.sql, e com ela os dois
-- bugs que a acompanhavam:
--   1. conta considerada vazia podendo ter membros -> DELETE FROM accounts
--      apagava os profiles dos colegas por cascata;
--   2. a lista fixa de 11 tabelas de 2017 ignorando subscriptions, addons,
--      invoices, boards, IA e integrações -> conta com assinatura ativa era
--      classificada como vazia e destruída.
-- Aceitar convite deixa de mover perfil e deixa de apagar conta. Passa a
-- criar participação.
--
-- SEGURANÇA
-- ---------
-- Toda função nova é SECURITY DEFINER com search_path fixo (convenção de
-- 063_function_search_path_hardening.sql), REVOKE de PUBLIC/anon e GRANT
-- apenas para `authenticated` (convenção de 062/066). O workspace ativo é
-- gravado no banco por RPC que valida participação — nunca aceito do cliente.
--
-- Idempotente — seguro rodar mais de uma vez.
-- ============================================================

BEGIN;

-- ============================================================
-- TIPOS
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status_enum') THEN
    CREATE TYPE membership_status_enum AS ENUM ('active', 'revoked');
  END IF;
END $$;

-- ============================================================
-- ACCOUNT_MEMBERSHIPS — a participação de uma identidade em um workspace
--
-- Chave natural (account_id, user_id): uma linha por par. Rejunção reativa a
-- linha existente em vez de duplicar histórico, e `revoked_at` /
-- `revoked_by_user_id` preservam por que a participação anterior terminou.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.account_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role account_role_enum NOT NULL,
  status membership_status_enum NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES public.account_invitations(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT account_memberships_account_user_key UNIQUE (account_id, user_id),
  -- Estado declarado, nunca implícito: participação ativa não carrega marca de
  -- revogação, e participação revogada sempre diz quando terminou.
  CONSTRAINT account_memberships_status_shape CHECK (
    (status = 'active'  AND revoked_at IS NULL) OR
    (status = 'revoked' AND revoked_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.account_memberships IS
  'Participação de uma identidade em um workspace. Fonte da verdade do vínculo usuário↔conta e do papel contextual. Ver docs/architecture/multi-workspace-tenancy.md.';

-- Hot path de autorização: "quais workspaces ativos deste usuário?" e
-- "quem participa deste workspace?".
CREATE INDEX IF NOT EXISTS idx_account_memberships_user_active
  ON public.account_memberships(user_id, account_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_account_memberships_account_active
  ON public.account_memberships(account_id, role) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_account_memberships_invitation
  ON public.account_memberships(invitation_id) WHERE invitation_id IS NOT NULL;

DROP TRIGGER IF EXISTS set_updated_at ON public.account_memberships;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.account_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.account_memberships ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BACKFILL — não destrutivo, preserva ownership e papéis existentes
--
-- Roda antes de qualquer troca de predicado: enquanto as funções antigas ainda
-- estão no ar, a tabela nova já reflete exatamente o vínculo vigente.
-- ============================================================
INSERT INTO public.account_memberships (account_id, user_id, role, status, joined_at, created_at)
SELECT p.account_id, p.user_id, p.account_role, 'active', p.created_at, p.created_at
FROM public.profiles p
WHERE p.account_id IS NOT NULL
  AND p.account_role IS NOT NULL
ON CONFLICT (account_id, user_id) DO NOTHING;

-- Rede de segurança: se algum `accounts.owner_user_id` não tiver perfil
-- apontando para a conta (estado possível em bases que passaram pelo
-- redeem_invitation antigo), o dono ainda assim recebe sua participação.
INSERT INTO public.account_memberships (account_id, user_id, role, status, joined_at, created_at)
SELECT a.id, a.owner_user_id, 'owner', 'active', a.created_at, a.created_at
FROM public.accounts a
WHERE NOT EXISTS (
  SELECT 1 FROM public.account_memberships m
  WHERE m.account_id = a.id AND m.role = 'owner' AND m.status = 'active'
)
ON CONFLICT (account_id, user_id) DO UPDATE
  SET role = 'owner', status = 'active', revoked_at = NULL, revoked_by_user_id = NULL;

-- Saneamento antes de declarar a invariante: se alguma base carregar mais de
-- um perfil com account_role = 'owner' na mesma conta, o dono declarado em
-- `accounts.owner_user_id` prevalece e os demais viram 'admin'. Ninguém perde
-- participação — só o papel excedente é corrigido.
UPDATE public.account_memberships m
SET role = 'admin'
FROM public.accounts a
WHERE m.account_id = a.id
  AND m.role = 'owner'
  AND m.status = 'active'
  AND m.user_id <> a.owner_user_id;

-- Reflete no espelho do perfil o que o saneamento acima corrigiu (o gatilho
-- que faria isso automaticamente só é criado adiante, de propósito: o backfill
-- não deve disparar repontamento).
UPDATE public.profiles p
SET account_role = m.role
FROM public.account_memberships m
WHERE m.user_id = p.user_id
  AND m.account_id = p.account_id
  AND m.status = 'active'
  AND p.account_role IS DISTINCT FROM m.role;

-- INVARIANTE: todo workspace tem exatamente um dono ativo. É aqui que a
-- unicidade de titularidade passa a morar — `idx_accounts_one_per_owner`
-- garantia a coisa errada (um workspace por pessoa) e é removido abaixo.
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_memberships_single_owner
  ON public.account_memberships(account_id)
  WHERE role = 'owner' AND status = 'active';

-- ============================================================
-- ACCOUNTS — deixa de proibir a premissa nova
--
-- `idx_accounts_one_per_owner` era UNIQUE(owner_user_id): literalmente "uma
-- conta por pessoa". A unicidade que importa (um dono por conta) mudou de
-- lugar para o índice parcial em account_memberships, acima.
-- ============================================================
DROP INDEX IF EXISTS idx_accounts_one_per_owner;
CREATE INDEX IF NOT EXISTS idx_accounts_owner_user ON public.accounts(owner_user_id);

-- ============================================================
-- PROFILES — as duas colunas mudam de significado
--
-- account_id deixa de ser "a conta do usuário" e passa a ser "o workspace
-- ativo". Duas consequências de integridade:
--
--   FK ON DELETE CASCADE -> ON DELETE SET NULL
--     Este era o caminho exato do bug 1: apagar uma conta apagava o profile de
--     quem estivesse apontando para ela. Nunca mais (FH-10.01).
--
--   NOT NULL -> nullable
--     "sem workspace ativo" passa a ser um estado real e representável,
--     reparado sob demanda por ensure_active_workspace().
-- ============================================================
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT con.conname INTO v_conname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = con.conkey[1]
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'profiles'
    AND con.contype = 'f'
    AND array_length(con.conkey, 1) = 1
    AND att.attname = 'account_id'
  LIMIT 1;

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

ALTER TABLE public.profiles ALTER COLUMN account_id   DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN account_role DROP NOT NULL;

COMMENT ON COLUMN public.profiles.account_id IS
  'WORKSPACE ATIVO desta identidade — não é mais "a conta do usuário". O vínculo mora em account_memberships. Só grave via switch_active_workspace()/ensure_active_workspace().';
COMMENT ON COLUMN public.profiles.account_role IS
  'Espelho do papel na participação do workspace ativo, mantido por gatilho. Leitura de conveniência; a autoridade é account_memberships.role.';

-- ============================================================
-- PREDICADOS DE AUTORIZAÇÃO
--
-- Três perguntas distintas, três funções — misturá-las é o que produziria
-- vazamento entre tenants ou roster incompleto.
-- ============================================================

-- Ordinal do papel. Espelha roleRank() em src/lib/auth/roles.ts.
CREATE OR REPLACE FUNCTION public.account_role_rank(r account_role_enum)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE r
           WHEN 'owner'  THEN 4
           WHEN 'admin'  THEN 3
           WHEN 'agent'  THEN 2
           WHEN 'viewer' THEN 1
         END;
$$;

-- "Participo deste workspace, com pelo menos este papel?"
-- Independe do workspace ativo — é a pergunta do seletor de workspace, da
-- troca de contexto e da leitura de `accounts`.
CREATE OR REPLACE FUNCTION public.has_account_membership(
  target_account_id UUID,
  min_role account_role_enum DEFAULT 'viewer'
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM account_memberships m
    WHERE m.user_id = (SELECT auth.uid())
      AND m.account_id = target_account_id
      AND m.status = 'active'
      AND account_role_rank(m.role) >= account_role_rank(min_role)
  );
$$;

-- "Qual é o meu workspace ativo?"
CREATE OR REPLACE FUNCTION public.active_account_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.account_id FROM profiles p WHERE p.user_id = (SELECT auth.uid());
$$;

-- "Participo E este é o workspace em que estou trabalhando agora?"
--
-- Assinatura e nome preservados de propósito: é o predicado de todas as
-- políticas RLS de dado operacional escritas em 017…064. O contrato para elas
-- não mudou — continua entregando exatamente um tenant por vez (FH-10.06).
CREATE OR REPLACE FUNCTION public.is_account_member(
  target_account_id UUID,
  min_role account_role_enum DEFAULT 'viewer'
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT target_account_id IS NOT NULL
     AND target_account_id = active_account_id()
     AND has_account_membership(target_account_id, min_role);
$$;

-- "Esta pessoa participa do meu workspace ativo?"
--
-- Substitui a comparação `profiles.account_id = <minha conta>` que sustentava
-- profiles_select. Aquela comparação passou a ser inválida: a coluna agora
-- aponta para o workspace ativo de CADA pessoa, então um colega trabalhando em
-- outro workspace sumiria do roster, das menções, da barra de participantes e
-- do seletor de responsável do negócio.
CREATE OR REPLACE FUNCTION public.shares_active_account_with(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM account_memberships m
    WHERE m.user_id = target_user_id
      AND m.status = 'active'
      AND m.account_id = active_account_id()
  );
$$;

ALTER FUNCTION public.account_role_rank(account_role_enum) OWNER TO postgres;
ALTER FUNCTION public.has_account_membership(UUID, account_role_enum) OWNER TO postgres;
ALTER FUNCTION public.active_account_id() OWNER TO postgres;
ALTER FUNCTION public.shares_active_account_with(UUID) OWNER TO postgres;

REVOKE ALL ON FUNCTION public.has_account_membership(UUID, account_role_enum) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.active_account_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.shares_active_account_with(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.account_role_rank(account_role_enum) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_account_membership(UUID, account_role_enum) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.active_account_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.shares_active_account_with(UUID) TO authenticated, service_role;

-- ============================================================
-- ESPELHO DO PAPEL + REPARO DO CONTEXTO
-- ============================================================

-- Escolhe um workspace ativo válido para p_user_id.
--
-- Mantém o atual se ele ainda corresponder a uma participação ativa; senão
-- prefere um workspace que a pessoa possui (o pessoal, tipicamente) e desempata
-- pela participação mais antiga — o ambiente mais estabelecido, não o último
-- convite aceito. Espelhado por `pickFallbackWorkspace` em
-- src/lib/auth/workspaces.ts. Devolve NULL quando não sobrou nenhuma — estado
-- válido, tratado pela aplicação.
CREATE OR REPLACE FUNCTION public.repoint_active_workspace(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current UUID;
  v_next_account UUID;
  v_next_role account_role_enum;
BEGIN
  SELECT account_id INTO v_current FROM profiles WHERE user_id = p_user_id;

  IF v_current IS NOT NULL AND EXISTS (
    SELECT 1 FROM account_memberships
    WHERE user_id = p_user_id AND account_id = v_current AND status = 'active'
  ) THEN
    RETURN v_current;
  END IF;

  SELECT m.account_id, m.role
  INTO v_next_account, v_next_role
  FROM account_memberships m
  WHERE m.user_id = p_user_id AND m.status = 'active'
  ORDER BY account_role_rank(m.role) DESC, m.joined_at ASC
  LIMIT 1;

  UPDATE profiles
  SET account_id = v_next_account,
      account_role = v_next_role
  WHERE user_id = p_user_id;

  RETURN v_next_account;
END;
$$;

-- Mantém profiles.account_role coerente com a participação ativa e repara o
-- contexto de quem perdeu a participação que estava usando. Vale para qualquer
-- caminho de escrita, não só para as RPCs abaixo.
CREATE OR REPLACE FUNCTION public.sync_profile_from_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE profiles
    SET account_role = NEW.role
    WHERE user_id = NEW.user_id
      AND account_id = NEW.account_id
      AND account_role IS DISTINCT FROM NEW.role;
  ELSE
    -- Participação encerrada: se era o workspace em uso, o contexto é
    -- repontado para outro workspace da própria pessoa. Nenhum outro
    -- workspace dela é tocado (FH-10.01).
    PERFORM repoint_active_workspace(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_from_membership ON public.account_memberships;
CREATE TRIGGER sync_profile_from_membership
  AFTER INSERT OR UPDATE OF role, status ON public.account_memberships
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_membership();

ALTER FUNCTION public.repoint_active_workspace(UUID) OWNER TO postgres;
ALTER FUNCTION public.sync_profile_from_membership() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.repoint_active_workspace(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_profile_from_membership() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.repoint_active_workspace(UUID) TO service_role;

-- ============================================================
-- RLS — account_memberships
--
-- Leitura: a própria pessoa vê suas participações (o seletor de workspace
-- depende disso e precisa enxergar ALÉM do workspace ativo); os demais veem o
-- roster do workspace ativo.
--
-- Escrita: nenhuma política. Toda mutação passa pelas RPCs SECURITY DEFINER
-- abaixo, que validam papel e invariantes. Cliente não escreve participação.
-- ============================================================
DROP POLICY IF EXISTS account_memberships_select ON public.account_memberships;
CREATE POLICY account_memberships_select ON public.account_memberships
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR is_account_member(account_id)
    OR is_super_admin()
  );

-- ============================================================
-- RLS — accounts / profiles
-- ============================================================

-- Ler o nome e o estado de um workspace do qual participo, mesmo sem ele estar
-- ativo — é o mínimo que o seletor precisa. Escrita continua exigindo admin+
-- NO workspace ativo.
DROP POLICY IF EXISTS accounts_select ON public.accounts;
CREATE POLICY accounts_select ON public.accounts
  FOR SELECT USING (has_account_membership(id) OR is_super_admin());

-- Ver o perfil de quem participa do meu workspace ativo.
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id
    OR shares_active_account_with(user_id)
  );

-- ============================================================
-- can_access_pipeline / can_access_conversation_board
--
-- Ambas derivavam o papel de `profiles WHERE account_id = <conta do recurso>`,
-- que era um teste de participação disfarçado. Passam a perguntar à
-- participação. O escopo de tenant continua sendo aplicado pela política que
-- as acompanha (`is_account_member(account_id) AND can_access_*`).
-- ============================================================
-- Assinatura idêntica à de 050, `DEFAULT auth.uid()` incluído: CREATE OR
-- REPLACE não remove default de parâmetro existente (42P13), e a volatilidade
-- também fica como estava. Só o corpo muda.
CREATE OR REPLACE FUNCTION public.can_access_conversation_board(
  p_board_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_role account_role_enum;
BEGIN
  SELECT account_id INTO v_account_id
  FROM conversation_boards
  WHERE id = p_board_id;

  IF v_account_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT m.role INTO v_role
  FROM account_memberships m
  WHERE m.account_id = v_account_id AND m.user_id = p_user_id AND m.status = 'active';

  IF v_role IN ('owner', 'admin') THEN
    RETURN TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM conversation_board_members WHERE board_id = p_board_id) THEN
    RETURN v_role IS NOT NULL;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM conversation_board_members
    WHERE board_id = p_board_id AND user_id = p_user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_pipeline(
  p_pipeline_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_role account_role_enum;
BEGIN
  SELECT account_id INTO v_account_id
  FROM pipelines
  WHERE id = p_pipeline_id;

  IF v_account_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT m.role INTO v_role
  FROM account_memberships m
  WHERE m.account_id = v_account_id AND m.user_id = p_user_id AND m.status = 'active';

  IF v_role IN ('owner', 'admin') THEN
    RETURN TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pipeline_members WHERE pipeline_id = p_pipeline_id) THEN
    RETURN v_role IS NOT NULL;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM pipeline_members
    WHERE pipeline_id = p_pipeline_id AND user_id = p_user_id
  );
END;
$$;

ALTER FUNCTION public.can_access_conversation_board(UUID, UUID) OWNER TO postgres;
ALTER FUNCTION public.can_access_pipeline(UUID, UUID) OWNER TO postgres;

-- ============================================================
-- sync_conversation_board_mention_account (de 027)
--
-- A trava "o mencionado pertence à mesma conta do item" comparava
-- `profiles.account_id` do mencionado com a conta do quadro. Com a coluna
-- significando workspace ATIVO, mencionar um colega que estivesse trabalhando
-- em outro ambiente passaria a falhar com 23514 — ele pertence à equipe, só
-- não estava com ela aberta. A trava continua existindo; passa a perguntar à
-- participação, que é o que ela sempre quis saber.
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_conversation_board_mention_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_conversation_id UUID;
BEGIN
  SELECT account_id, conversation_id
  INTO v_account_id, v_conversation_id
  FROM conversation_board_items
  WHERE id = NEW.board_item_id;

  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Unknown board item %', NEW.board_item_id
      USING ERRCODE = '23503';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = NEW.mentioned_user_id
  ) THEN
    RAISE EXCEPTION 'Unknown mentioned user %', NEW.mentioned_user_id
      USING ERRCODE = '23503';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM account_memberships m
    WHERE m.user_id = NEW.mentioned_user_id
      AND m.account_id = v_account_id
      AND m.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Mentioned user must belong to the same account as the board item'
      USING ERRCODE = '23514';
  END IF;

  NEW.account_id := v_account_id;
  NEW.conversation_id := v_conversation_id;

  UPDATE conversation_board_items
  SET mention_active = TRUE,
      mention_set_at = NEW.created_at,
      mention_set_by_user_id = NEW.mentioned_user_id,
      mention_cleared_at = NULL,
      mention_cleared_by_user_id = NULL,
      updated_at = NOW()
  WHERE id = NEW.board_item_id;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.sync_conversation_board_mention_account() OWNER TO postgres;

-- ============================================================
-- SIGNUP — o workspace pessoal continua existindo
--
-- Ele deixa de ser "a conta do usuário" e passa a ser o primeiro workspace
-- dele, do qual é dono, e que não impede participação em nenhum outro.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'), NEW.id)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, full_name, email, account_id, account_role)
  VALUES (NEW.id, v_full_name, NEW.email, v_account_id, 'owner');

  INSERT INTO public.account_memberships (account_id, user_id, role, status)
  VALUES (v_account_id, NEW.id, 'owner', 'active')
  ON CONFLICT (account_id, user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- redeem_invitation — cria participação; nunca move, nunca apaga
--
-- Contrato de recusa preservado para a rota HTTP existente:
--   42501 -> 401  (não autenticado / sem perfil)
--   22023 -> 400  (convite inexistente / usado / expirado)
--   23505 -> 409  (já participa deste workspace)
--
-- O 409 antigo — "sua conta já contém dados, cadastre-se com outro e-mail" —
-- deixa de ser alcançável: ter conta própria com dados não é mais obstáculo
-- para entrar numa equipe.
-- ============================================================
CREATE OR REPLACE FUNCTION public.redeem_invitation(
  p_token_hash TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_inv account_invitations%ROWTYPE;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_inv
  FROM account_invitations
  WHERE token_hash = p_token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = '22023';
  END IF;
  IF v_inv.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invitation has already been redeemed' USING ERRCODE = '22023';
  END IF;
  IF v_inv.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Invitation has expired' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = v_caller_id) THEN
    RAISE EXCEPTION 'Caller has no profile' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1 FROM account_memberships
    WHERE account_id = v_inv.account_id AND user_id = v_caller_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'You are already a member of this account' USING ERRCODE = '23505';
  END IF;

  -- Participação nova, ou reativação de uma encerrada anteriormente. O papel
  -- vem sempre do convite atual.
  INSERT INTO account_memberships (
    account_id, user_id, role, status, joined_at, invited_by_user_id, invitation_id
  )
  VALUES (
    v_inv.account_id, v_caller_id, v_inv.role, 'active', NOW(),
    v_inv.created_by_user_id, v_inv.id
  )
  ON CONFLICT (account_id, user_id) DO UPDATE
    SET role = EXCLUDED.role,
        status = 'active',
        joined_at = NOW(),
        invited_by_user_id = EXCLUDED.invited_by_user_id,
        invitation_id = EXCLUDED.invitation_id,
        revoked_at = NULL,
        revoked_by_user_id = NULL;

  -- O convite é o contexto pelo qual a pessoa acabou de entrar: é razoável que
  -- o workspace convidante assuma como ativo. Os demais seguem intactos.
  UPDATE profiles
  SET account_id = v_inv.account_id,
      account_role = v_inv.role
  WHERE user_id = v_caller_id;

  UPDATE account_invitations
  SET accepted_at = NOW(),
      accepted_by_user_id = v_caller_id
  WHERE id = v_inv.id;

  RETURN v_inv.account_id;
END;
$$;

ALTER FUNCTION public.redeem_invitation(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.redeem_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_invitation(TEXT) TO authenticated;

-- ============================================================
-- set_member_role — papel é contextual ao workspace
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_member_role(
  p_user_id UUID,
  p_new_role account_role_enum
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_caller_role account_role_enum;
  v_target_role account_role_enum;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  v_account_id := active_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Caller has no active workspace' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_caller_role
  FROM account_memberships
  WHERE account_id = v_account_id AND user_id = auth.uid() AND status = 'active';

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'This action requires the admin role or higher'
      USING ERRCODE = '42501';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role' USING ERRCODE = '22023';
  END IF;

  SELECT role INTO v_target_role
  FROM account_memberships
  WHERE account_id = v_account_id AND user_id = p_user_id AND status = 'active';

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Target user is not a member of your account'
      USING ERRCODE = '22023';
  END IF;

  IF p_new_role = 'owner' OR v_target_role = 'owner' THEN
    RAISE EXCEPTION 'Ownership changes go through transfer_account_ownership'
      USING ERRCODE = '22023';
  END IF;

  UPDATE account_memberships
  SET role = p_new_role
  WHERE account_id = v_account_id AND user_id = p_user_id;
END;
$$;

ALTER FUNCTION public.set_member_role(UUID, account_role_enum) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.set_member_role(UUID, account_role_enum) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_member_role(UUID, account_role_enum) TO authenticated;

-- ============================================================
-- remove_account_member — encerra UMA participação
--
-- Nada de conta pessoal artificial: quem sai continua tendo os workspaces que
-- já tinha. Devolve o workspace ativo do removido depois do repontamento
-- (NULL se não sobrou nenhum), preservando a assinatura RETURNS UUID.
-- ============================================================
CREATE OR REPLACE FUNCTION public.remove_account_member(
  p_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_caller_role account_role_enum;
  v_target_role account_role_enum;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  v_account_id := active_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Caller has no active workspace' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_caller_role
  FROM account_memberships
  WHERE account_id = v_account_id AND user_id = auth.uid() AND status = 'active';

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'This action requires the admin role or higher'
      USING ERRCODE = '42501';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove yourself; leave the workspace instead'
      USING ERRCODE = '22023';
  END IF;

  SELECT role INTO v_target_role
  FROM account_memberships
  WHERE account_id = v_account_id AND user_id = p_user_id AND status = 'active';

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Target user is not a member of your account'
      USING ERRCODE = '22023';
  END IF;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'Cannot remove the account owner; transfer ownership first'
      USING ERRCODE = '22023';
  END IF;

  UPDATE account_memberships
  SET status = 'revoked',
      revoked_at = NOW(),
      revoked_by_user_id = auth.uid()
  WHERE account_id = v_account_id AND user_id = p_user_id;

  -- O gatilho já repontou o contexto do removido, se necessário.
  RETURN (SELECT account_id FROM profiles WHERE user_id = p_user_id);
END;
$$;

ALTER FUNCTION public.remove_account_member(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.remove_account_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_account_member(UUID) TO authenticated;

-- ============================================================
-- leave_account — saída voluntária
--
-- Sair é encerrar a própria participação. Nenhum outro workspace da pessoa é
-- afetado, e o workspace do qual ela saiu continua existindo com todos os seus
-- dados — sair e excluir são operações diferentes (FH-19.03).
-- ============================================================
CREATE OR REPLACE FUNCTION public.leave_account(
  p_account_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role account_role_enum;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_role
  FROM account_memberships
  WHERE account_id = p_account_id AND user_id = auth.uid() AND status = 'active';

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'You are not a member of this workspace' USING ERRCODE = '22023';
  END IF;

  IF v_role = 'owner' THEN
    RAISE EXCEPTION 'Transfer ownership before leaving this workspace'
      USING ERRCODE = '22023';
  END IF;

  UPDATE account_memberships
  SET status = 'revoked',
      revoked_at = NOW(),
      revoked_by_user_id = auth.uid()
  WHERE account_id = p_account_id AND user_id = auth.uid();

  RETURN (SELECT account_id FROM profiles WHERE user_id = auth.uid());
END;
$$;

ALTER FUNCTION public.leave_account(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.leave_account(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leave_account(UUID) TO authenticated;

-- ============================================================
-- transfer_account_ownership — troca de papel nas duas participações
-- ============================================================
CREATE OR REPLACE FUNCTION public.transfer_account_ownership(
  p_new_owner_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id UUID;
  v_caller_role account_role_enum;
  v_target_role account_role_enum;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  v_account_id := active_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Caller has no active workspace' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_caller_role
  FROM account_memberships
  WHERE account_id = v_account_id AND user_id = auth.uid() AND status = 'active';

  IF v_caller_role IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'Only the account owner can transfer ownership'
      USING ERRCODE = '42501';
  END IF;

  IF p_new_owner_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You are already the owner' USING ERRCODE = '22023';
  END IF;

  SELECT role INTO v_target_role
  FROM account_memberships
  WHERE account_id = v_account_id AND user_id = p_new_owner_user_id AND status = 'active';

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Target user is not a member of your account'
      USING ERRCODE = '42501';
  END IF;

  -- Rebaixa primeiro: o índice parcial `idx_account_memberships_single_owner`
  -- não tolera dois donos ativos nem por um instante dentro da transação.
  UPDATE account_memberships SET role = 'admin'
  WHERE account_id = v_account_id AND user_id = auth.uid();

  UPDATE account_memberships SET role = 'owner'
  WHERE account_id = v_account_id AND user_id = p_new_owner_user_id;

  UPDATE accounts SET owner_user_id = p_new_owner_user_id
  WHERE id = v_account_id;
END;
$$;

ALTER FUNCTION public.transfer_account_ownership(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.transfer_account_ownership(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_account_ownership(UUID) TO authenticated;

-- ============================================================
-- switch_active_workspace — o ÚNICO caminho de troca de contexto
--
-- É aqui que mora a garantia de que o workspace ativo não é palavra do
-- cliente: o identificador chega da requisição, mas só vira contexto depois de
-- a participação ativa ser confirmada no banco (FH-10.06).
-- ============================================================
CREATE OR REPLACE FUNCTION public.switch_active_workspace(
  p_account_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role account_role_enum;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT role INTO v_role
  FROM account_memberships
  WHERE account_id = p_account_id AND user_id = auth.uid() AND status = 'active';

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'You do not have access to this workspace'
      USING ERRCODE = '42501';
  END IF;

  UPDATE profiles
  SET account_id = p_account_id,
      account_role = v_role
  WHERE user_id = auth.uid();

  RETURN p_account_id;
END;
$$;

ALTER FUNCTION public.switch_active_workspace(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.switch_active_workspace(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.switch_active_workspace(UUID) TO authenticated;

-- ============================================================
-- ensure_active_workspace — reparo do contexto ausente/obsoleto
-- ============================================================
CREATE OR REPLACE FUNCTION public.ensure_active_workspace()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  RETURN repoint_active_workspace(auth.uid());
END;
$$;

ALTER FUNCTION public.ensure_active_workspace() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.ensure_active_workspace() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_active_workspace() TO authenticated;

-- ============================================================
-- list_my_workspaces — o que alimenta o seletor
-- ============================================================
-- Nomes de saída deliberadamente distintos das colunas das tabelas do corpo
-- (workspace_id/workspace_name/member_role): em função LANGUAGE sql, parâmetro
-- de saída homônimo de coluna é fonte clássica de ambiguidade.
CREATE OR REPLACE FUNCTION public.list_my_workspaces()
RETURNS TABLE (
  workspace_id UUID,
  workspace_name TEXT,
  member_role account_role_enum,
  is_active BOOLEAN,
  subscription_status TEXT,
  member_count BIGINT,
  joined_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.name,
    m.role,
    a.id = active_account_id(),
    COALESCE(a.subscription_status, 'active'),
    (SELECT COUNT(*) FROM account_memberships m2
      WHERE m2.account_id = a.id AND m2.status = 'active'),
    m.joined_at
  FROM account_memberships m
  JOIN accounts a ON a.id = m.account_id
  WHERE m.user_id = (SELECT auth.uid())
    AND m.status = 'active'
  ORDER BY account_role_rank(m.role) DESC, a.name ASC;
$$;

ALTER FUNCTION public.list_my_workspaces() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.list_my_workspaces() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_workspaces() TO authenticated;

-- ============================================================
-- REPARO DE CONTEXTO PENDENTE
--
-- Perfis cujo workspace ativo não corresponde a nenhuma participação (base que
-- passou pelo redeem_invitation antigo em algum estado intermediário) recebem
-- um contexto válido agora, em vez de descobrirem o problema no próximo login.
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.user_id
    FROM profiles p
    WHERE p.account_id IS NULL
       OR NOT EXISTS (
         SELECT 1 FROM account_memberships m
         WHERE m.user_id = p.user_id AND m.account_id = p.account_id AND m.status = 'active'
       )
  LOOP
    PERFORM repoint_active_workspace(r.user_id);
  END LOOP;
END $$;

COMMIT;
