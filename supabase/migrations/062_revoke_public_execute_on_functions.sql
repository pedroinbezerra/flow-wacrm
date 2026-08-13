-- Migration 062: Revoga EXECUTE indevido em funções do schema public
--
-- CONTEXTO
-- O Supabase aplica, por padrão, `ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ON
-- FUNCTIONS TO anon, authenticated, service_role` no schema public. Como esse é um
-- GRANT explícito para os papéis, um `REVOKE ... FROM PUBLIC` — padrão usado nas
-- migrations 007, 012, 018, 019 e 022 — NÃO o remove.
--
-- Resultado observado em produção antes desta migration:
--   set_member_role  -> {postgres=X, anon=X, authenticated=X, service_role=X}
--   handle_new_user  -> {=X, postgres=X, anon=X, authenticated=X, service_role=X}
--
-- Ou seja: 30 funções SECURITY DEFINER estavam alcançáveis por `anon` via
-- /rest/v1/rpc/<fn>, incluindo funções de trigger e helpers internos que nunca
-- deveriam ser chamadas diretamente. O que impedia abuso era a validação interna de
-- cada função, não o grant — defesa única, contrariando a exigência de autorização
-- em camadas (AGENTS.md §7).
--
-- Advisors resolvidos: anon_security_definer_function_executable (30),
-- authenticated_security_definer_function_executable (parcial).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Corrige a causa-raiz para funções futuras criadas por `postgres`
--    (o papel sob o qual as migrations deste repositório executam).
--    Escopo deliberadamente restrito a `postgres`: objetos criados por
--    supabase_admin seguem a política gerenciada da plataforma.
-- ---------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- ---------------------------------------------------------------------------
-- 2. Funções de trigger e de event trigger.
--    O Postgres as invoca pelo dono do trigger; nenhum papel de API precisa de
--    EXECUTE. Expostas como RPC eram superfície de ataque pura.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.broadcast_recipient_aggregate_trigger()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_security_event_alert()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_disable_rls_function()                 FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_conversation_board_account()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_conversation_board_item_account()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_conversation_board_item_label_account()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_conversation_board_item_lane()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_conversation_board_lane_account()         FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_conversation_board_mention_account()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()                     FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Helpers internos e rotinas de manutenção.
--    Nenhum é referenciado por `.rpc()` no código da aplicação (verificado em
--    src/**). Passam a ser exclusivos de service_role / postgres.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public._bcast_bump(uuid, text, integer)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public._bcast_cols_for_status(text)                   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_broadcast_counts(uuid)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.merge_duplicate_contacts()                     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_partman_maintenance()                      FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Funções legitimamente consumidas por usuário autenticado.
--    Mantêm EXECUTE para `authenticated`; perdem para `anon`.
--
--    is_account_member / is_super_admin / can_access_* são avaliadas DENTRO de
--    políticas RLS, e expressões de policy rodam com os privilégios do papel que
--    consulta. Revogar de `authenticated` quebraria toda leitura do produto —
--    por isso apenas `anon` é revogado aqui.
--
--    Efeito colateral aceito: uma consulta anônima a tabela protegida passa a
--    retornar "permission denied for function" em vez de conjunto vazio. Ambos
--    negam acesso; o erro é mais ruidoso, porém mais honesto.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.is_account_member(uuid, account_role_enum)                          FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin()                                                    FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_conversation_board(uuid, uuid)                           FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_pipeline(uuid, uuid)                                     FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_member_role(uuid, account_role_enum)                            FROM anon;
REVOKE EXECUTE ON FUNCTION public.remove_account_member(uuid)                                         FROM anon;
REVOKE EXECUTE ON FUNCTION public.transfer_account_ownership(uuid)                                    FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_invitation(text)                                             FROM anon;
REVOKE EXECUTE ON FUNCTION public.touch_presence(text)                                                FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_usage_event(uuid, text, numeric, jsonb)                      FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_account_consumption_summary(uuid, timestamptz, timestamptz)     FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_effective_account_config(uuid)                                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_onboarding_analytics_summary()                                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_unread_conversations_count(uuid, uuid)                          FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_document_delivery_stats(uuid, boolean, boolean)           FROM anon;
REVOKE EXECUTE ON FUNCTION public.anonymize_lgpd_contact(uuid, uuid)                                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.export_lgpd_contact_data(uuid, uuid)                                FROM anon;
REVOKE EXECUTE ON FUNCTION public.account_id_from_conversation(uuid)                                  FROM anon;
REVOKE EXECUTE ON FUNCTION public.immutable_unaccent(text)                                            FROM anon;

-- ---------------------------------------------------------------------------
-- 5. Exceção registrada: peek_invitation PERMANECE acessível a `anon`.
--    A pré-visualização de convite acontece antes do login
--    (src/app/api/invitations/[token]/peek/route.ts). O advisor seguirá
--    reportando esta função — é intencional, conforme migration 019.
-- ---------------------------------------------------------------------------

COMMIT;
