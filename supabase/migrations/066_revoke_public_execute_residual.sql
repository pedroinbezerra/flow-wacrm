-- Migration 066: Remove o grant residual a PUBLIC em funções SECURITY DEFINER
--
-- CONTEXTO
-- A migration 062 revogou EXECUTE de `anon` nestas funções, mas elas também
-- carregavam um grant ao pseudo-papel PUBLIC — visível no ACL como `=X/postgres`.
-- `anon` continua alcançando a função por herança de PUBLIC, então revogar do
-- papel nominal não basta.
--
-- Verificação após a 062:
--   is_super_admin -> {=X/postgres, postgres=X, authenticated=X, service_role=X}
--   has_function_privilege('anon', 'is_super_admin()', 'execute') = true
--
-- É o espelho do problema que a 062 resolveu: lá, revogar de PUBLIC não removia o
-- grant nominal a `anon`; aqui, revogar de `anon` não remove o grant a PUBLIC.
-- Precisa dos dois lados. As funções tratadas na 062 com
-- `FROM PUBLIC, anon, authenticated` já ficaram corretas — apenas as da seção 4
-- daquela migration, revogadas somente de `anon`, precisam deste complemento.
--
-- SEGURANÇA DA OPERAÇÃO
-- Todas as 12 já possuem GRANT nominal explícito a `authenticated` e
-- `service_role` no ACL atual, portanto revogar de PUBLIC não retira acesso de
-- quem precisa. As chamadas do produto e a avaliação de policies seguem intactas.

BEGIN;

-- Helpers avaliados dentro de políticas RLS.
-- Expressão de policy roda com os privilégios do papel que consulta, por isso o
-- GRANT a `authenticated` é obrigatório e permanece.
REVOKE EXECUTE ON FUNCTION public.is_account_member(uuid, account_role_enum)                      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin()                                                FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_access_conversation_board(uuid, uuid)                       FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_access_pipeline(uuid, uuid)                                 FROM PUBLIC;

-- RPCs de usuário autenticado.
REVOKE EXECUTE ON FUNCTION public.touch_presence(text)                                            FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_usage_event(uuid, text, numeric, jsonb)                  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_account_consumption_summary(uuid, timestamptz, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_effective_account_config(uuid)                              FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_onboarding_analytics_summary()                              FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_document_delivery_stats(uuid, boolean, boolean)       FROM PUBLIC;

-- Operações LGPD.
REVOKE EXECUTE ON FUNCTION public.anonymize_lgpd_contact(uuid, uuid)                              FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.export_lgpd_contact_data(uuid, uuid)                            FROM PUBLIC;

-- peek_invitation permanece fora: tem GRANT nominal a `anon`, sem PUBLIC, e o
-- acesso anônimo é intencional (pré-visualização de convite antes do login).

COMMIT;
