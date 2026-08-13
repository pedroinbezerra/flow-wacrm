-- Migration 063: Fixa search_path nas funções do projeto que ainda o tinham mutável
--
-- CONTEXTO
-- Função sem `search_path` fixo resolve nomes pelo search_path de quem a chama. Em
-- função SECURITY DEFINER isso é sequestro de resolução de nome: um chamador cria
-- `meu_schema.profiles`, põe o schema à frente no search_path e a função — rodando
-- com privilégio do dono — passa a operar sobre a tabela do atacante.
--
-- Este repositório já aplica `SET search_path` em 29 pontos; esta migration apenas
-- completa a cobertura das 15 funções que ficaram de fora.
--
-- ESCOPO: apenas funções deste projeto. As demais funções sem search_path no schema
-- public pertencem às extensões pg_partman, pg_trgm e unaccent (ver migration 065,
-- seção de dívida registrada) e não devem ser alteradas.
--
-- `public, pg_temp` — e não apenas `public` — porque pg_temp precede implicitamente
-- o search_path quando omitido, permitindo shadowing por objeto temporário.
--
-- Advisor resolvido: function_search_path_mutable (15).

BEGIN;

-- SECURITY DEFINER — risco direto de escalonamento
ALTER FUNCTION public.anonymize_lgpd_contact(uuid, uuid)                              SET search_path = public, pg_temp;
ALTER FUNCTION public.export_lgpd_contact_data(uuid, uuid)                            SET search_path = public, pg_temp;
ALTER FUNCTION public.get_account_consumption_summary(uuid, timestamptz, timestamptz) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_effective_account_config(uuid)                              SET search_path = public, pg_temp;
ALTER FUNCTION public.get_onboarding_analytics_summary()                              SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_document_delivery_stats(uuid, boolean, boolean)       SET search_path = public, pg_temp;
ALTER FUNCTION public.record_usage_event(uuid, text, numeric, jsonb)                  SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_security_event_alert()                                   SET search_path = public, pg_temp;
ALTER FUNCTION public.prevent_disable_rls_function()                                  SET search_path = public, pg_temp;

-- SECURITY INVOKER — risco menor, mas o linter exige e o custo é nulo
ALTER FUNCTION public._bcast_cols_for_status(text)                                    SET search_path = public, pg_temp;
ALTER FUNCTION public.account_id_from_conversation(uuid)                              SET search_path = public, pg_temp;
ALTER FUNCTION public.get_unread_conversations_count(uuid, uuid)                      SET search_path = public, pg_temp;
ALTER FUNCTION public.run_partman_maintenance()                                       SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column()                                      SET search_path = public, pg_temp;

-- immutable_unaccent é usada em expressão de índice. O corpo já qualifica o schema
-- (`SELECT public.unaccent($1)`), portanto fixar o search_path não altera o
-- resultado e não invalida os índices existentes.
ALTER FUNCTION public.immutable_unaccent(text)                                        SET search_path = public, pg_temp;

COMMIT;
