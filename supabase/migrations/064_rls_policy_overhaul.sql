-- Migration 064: Revisão geral das políticas RLS do schema public
--
-- Esta migration resolve três problemas de uma vez, porque atingem as mesmas
-- políticas e separá-los exigiria reescrever cada uma duas vezes.
--
-- ===========================================================================
-- PROBLEMA 1 — BUG FUNCIONAL (o mais grave; não é advisor)
-- ===========================================================================
-- `public.profiles` tem DUAS colunas uuid distintas:
--   profiles.id      -> PK própria do perfil
--   profiles.user_id -> FK para auth.users(id), UNIQUE
--
-- Verificado no banco de produção: em 19 de 19 perfis, `id <> user_id`, e
-- `id` não casa com nenhuma linha de auth.users (0/19), enquanto `user_id`
-- casa com todas (19/19).
--
-- Dez políticas comparam `profiles.id = auth.uid()`. Essa condição é SEMPRE
-- FALSA. Efeito prático hoje, em produção:
--
--   account_addons               -> membros NÃO enxergam os recursos adicionais
--   account_deletion_audit_logs  -> super admin NÃO lê os logs de expurgo
--   invoices                     -> membros NÃO enxergam as próprias faturas
--   subscriptions                -> membros NÃO enxergam a própria assinatura
--   google_drive_integrations    -> membros NÃO leem nem removem a integração
--
-- Nenhuma verificação de super admin baseada nesse padrão jamais concedeu
-- acesso. As funções auxiliares do projeto (is_account_member, is_super_admin,
-- can_access_pipeline, can_access_conversation_board) sempre usaram a coluna
-- correta — a divergência está nas políticas escritas à mão.
--
-- A correção adotada não é trocar a coluna na subconsulta, e sim substituir a
-- subconsulta pelos helpers já existentes e corretos. Isso alinha estas tabelas
-- à convenção dominante do repositório e elimina o problema 3 no mesmo passo.
--
-- ===========================================================================
-- PROBLEMA 2 — POLÍTICAS "SERVICE ROLE" ABERTAS A TODOS
-- ===========================================================================
-- Três políticas nomeadas para service_role foram criadas com `TO public`:
--
--   inbound_webhooks "Service role manages webhooks" -> FOR ALL USING (true)
--   messages         "Service role can insert messages" -> WITH CHECK (true)
--   user_events      "Service role full access on user_events"
--
-- `service_role` tem BYPASSRLS (confirmado em pg_roles), logo NUNCA precisou de
-- política. O efeito real era conceder o acesso a todo mundo — qualquer sessão
-- autenticada podia ler, alterar e apagar webhooks de qualquer conta, e inserir
-- mensagens em qualquer conversa.
--
-- ===========================================================================
-- PROBLEMA 3 — ADVISORS DE PERFORMANCE
-- ===========================================================================
-- auth_rls_initplan (45): `auth.uid()` sem encapsulamento é reavaliado por
--   linha. Encapsular em `(select auth.uid())` transforma a chamada em InitPlan,
--   avaliado uma única vez por consulta.
-- multiple_permissive_policies (114 achados / 18 tabelas): políticas `FOR ALL`
--   convivendo com uma `FOR SELECT` explícita. A `FOR ALL` também vale para
--   SELECT, então o Postgres avalia as duas em toda leitura. Corrigido
--   convertendo cada `FOR ALL` em INSERT/UPDATE/DELETE explícitos.
--
-- Preservação de semântica na conversão FOR ALL -> comandos explícitos:
--   INSERT -> WITH CHECK (with_check original, ou o USING quando ausente)
--   UPDATE -> USING (qual) + WITH CHECK (with_check original, ou o USING)
--   DELETE -> USING (qual)
-- Regra do Postgres: em política FOR ALL sem WITH CHECK, o USING faz as vezes
-- de WITH CHECK. A conversão acima é, portanto, equivalente.

BEGIN;

-- ===========================================================================
-- PARTE 1 — Tabelas atingidas pelo bug `profiles.id = auth.uid()`
-- ===========================================================================

-- --- account_addons --------------------------------------------------------
DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role podem modificar recursos ad" ON public.account_addons;
DROP POLICY IF EXISTS "Membros da conta podem visualizar recursos adicionais" ON public.account_addons;

CREATE POLICY account_addons_select ON public.account_addons
  FOR SELECT USING (is_account_member(account_id) OR is_super_admin());
CREATE POLICY account_addons_insert ON public.account_addons
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY account_addons_update ON public.account_addons
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY account_addons_delete ON public.account_addons
  FOR DELETE USING (is_super_admin());

-- --- account_deletion_audit_logs -------------------------------------------
DROP POLICY IF EXISTS "Apenas Service Role pode inserir logs de expurgo" ON public.account_deletion_audit_logs;
DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role podem ler logs de expurgo" ON public.account_deletion_audit_logs;

CREATE POLICY account_deletion_audit_logs_select ON public.account_deletion_audit_logs
  FOR SELECT USING (is_super_admin());
CREATE POLICY account_deletion_audit_logs_insert ON public.account_deletion_audit_logs
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY account_deletion_audit_logs_update ON public.account_deletion_audit_logs
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY account_deletion_audit_logs_delete ON public.account_deletion_audit_logs
  FOR DELETE USING (is_super_admin());

-- --- invoices --------------------------------------------------------------
DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role podem alterar faturas" ON public.invoices;
DROP POLICY IF EXISTS "Membros da conta podem visualizar faturas" ON public.invoices;

CREATE POLICY invoices_select ON public.invoices
  FOR SELECT USING (is_account_member(account_id) OR is_super_admin());
CREATE POLICY invoices_insert ON public.invoices
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY invoices_update ON public.invoices
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY invoices_delete ON public.invoices
  FOR DELETE USING (is_super_admin());

-- --- subscriptions ---------------------------------------------------------
DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role podem modificar assinaturas" ON public.subscriptions;
DROP POLICY IF EXISTS "Membros da conta podem visualizar a assinatura" ON public.subscriptions;

CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT USING (is_account_member(account_id) OR is_super_admin());
CREATE POLICY subscriptions_insert ON public.subscriptions
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY subscriptions_update ON public.subscriptions
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY subscriptions_delete ON public.subscriptions
  FOR DELETE USING (is_super_admin());

-- --- google_drive_integrations ---------------------------------------------
-- Além do bug de coluna, a tabela nunca teve política de INSERT/UPDATE. O
-- callback OAuth (src/app/api/integrations/google-drive/callback/route.ts) grava
-- com o cliente de sessão do usuário, então o upsert era negado pela RLS: a
-- integração estava quebrada de ponta a ponta.
--
-- NÍVEL DE ACESSO MANTIDO FIEL AO ORIGINAL (membro da conta, viewer+). Esta
-- tabela guarda access_token e refresh_token do Google; conceder leitura e
-- escrita a viewer merece decisão explícita de produto — sinalizado na entrega,
-- não alterado aqui por conta própria.
DROP POLICY IF EXISTS "Membros da conta podem deletar integracao google drive" ON public.google_drive_integrations;
DROP POLICY IF EXISTS "Membros da conta podem ler integracao google drive" ON public.google_drive_integrations;

CREATE POLICY google_drive_integrations_select ON public.google_drive_integrations
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY google_drive_integrations_insert ON public.google_drive_integrations
  FOR INSERT WITH CHECK (is_account_member(account_id));
CREATE POLICY google_drive_integrations_update ON public.google_drive_integrations
  FOR UPDATE USING (is_account_member(account_id)) WITH CHECK (is_account_member(account_id));
CREATE POLICY google_drive_integrations_delete ON public.google_drive_integrations
  FOR DELETE USING (is_account_member(account_id));

-- ===========================================================================
-- PARTE 2 — Políticas "service role" que abriam a tabela a todos
-- ===========================================================================

-- --- inbound_webhooks ------------------------------------------------------
-- Acesso de escrita ocorre exclusivamente via supabaseAdmin() (service role),
-- que ignora RLS. A política era puro buraco.
DROP POLICY IF EXISTS "Service role manages webhooks" ON public.inbound_webhooks;

-- --- messages --------------------------------------------------------------
-- `WITH CHECK (true)` permitia inserir mensagem em qualquer conversa de qualquer
-- conta. A política FOR ALL abaixo já cobre INSERT (sem WITH CHECK, o USING é
-- aplicado como check), então basta removê-la e reescrever a FOR ALL com a
-- chamada de auth encapsulada. O envio pelo Inbox
-- (src/app/api/whatsapp/send/route.ts, cliente de sessão) segue funcionando:
-- o remetente é membro da conta da conversa.
DROP POLICY IF EXISTS "Service role can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY messages_account_access ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_id = (select auth.uid()) OR is_account_member(c.account_id))
    )
  );

-- --- user_events -----------------------------------------------------------
-- "Authenticated users can insert events" exigia apenas `auth.uid() IS NOT NULL`:
-- qualquer usuário autenticado podia gravar evento em qualquer account_id.
DROP POLICY IF EXISTS "Service role full access on user_events" ON public.user_events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.user_events;
DROP POLICY IF EXISTS "Account members can view events for analytics" ON public.user_events;

CREATE POLICY user_events_select ON public.user_events
  FOR SELECT USING (is_account_member(account_id) OR is_super_admin());
CREATE POLICY user_events_insert ON public.user_events
  FOR INSERT WITH CHECK (is_account_member(account_id));

-- ===========================================================================
-- PARTE 3 — Conversão de FOR ALL em comandos explícitos
--           (elimina a sobreposição permissiva em SELECT)
-- ===========================================================================

-- --- account_invitations ---------------------------------------------------
DROP POLICY IF EXISTS account_invitations_modify ON public.account_invitations;

CREATE POLICY account_invitations_insert ON public.account_invitations
  FOR INSERT WITH CHECK (is_account_member(account_id, 'admin'::account_role_enum));
CREATE POLICY account_invitations_update ON public.account_invitations
  FOR UPDATE USING (is_account_member(account_id, 'admin'::account_role_enum))
             WITH CHECK (is_account_member(account_id, 'admin'::account_role_enum));
CREATE POLICY account_invitations_delete ON public.account_invitations
  FOR DELETE USING (is_account_member(account_id, 'admin'::account_role_enum));

-- --- automation_steps ------------------------------------------------------
DROP POLICY IF EXISTS automation_steps_modify ON public.automation_steps;

CREATE POLICY automation_steps_insert ON public.automation_steps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM automations a
            WHERE a.id = automation_steps.automation_id
              AND is_account_member(a.account_id, 'agent'::account_role_enum)));
CREATE POLICY automation_steps_update ON public.automation_steps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM automations a
            WHERE a.id = automation_steps.automation_id
              AND is_account_member(a.account_id, 'agent'::account_role_enum)))
  WITH CHECK (
    EXISTS (SELECT 1 FROM automations a
            WHERE a.id = automation_steps.automation_id
              AND is_account_member(a.account_id, 'agent'::account_role_enum)));
CREATE POLICY automation_steps_delete ON public.automation_steps
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM automations a
            WHERE a.id = automation_steps.automation_id
              AND is_account_member(a.account_id, 'agent'::account_role_enum)));

-- --- broadcast_recipients --------------------------------------------------
DROP POLICY IF EXISTS broadcast_recipients_modify ON public.broadcast_recipients;

CREATE POLICY broadcast_recipients_insert ON public.broadcast_recipients
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM broadcasts b
            WHERE b.id = broadcast_recipients.broadcast_id
              AND is_account_member(b.account_id, 'agent'::account_role_enum)));
CREATE POLICY broadcast_recipients_update ON public.broadcast_recipients
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM broadcasts b
            WHERE b.id = broadcast_recipients.broadcast_id
              AND is_account_member(b.account_id, 'agent'::account_role_enum)))
  WITH CHECK (
    EXISTS (SELECT 1 FROM broadcasts b
            WHERE b.id = broadcast_recipients.broadcast_id
              AND is_account_member(b.account_id, 'agent'::account_role_enum)));
CREATE POLICY broadcast_recipients_delete ON public.broadcast_recipients
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM broadcasts b
            WHERE b.id = broadcast_recipients.broadcast_id
              AND is_account_member(b.account_id, 'agent'::account_role_enum)));

-- --- contact_custom_values -------------------------------------------------
DROP POLICY IF EXISTS contact_custom_values_modify ON public.contact_custom_values;

CREATE POLICY contact_custom_values_insert ON public.contact_custom_values
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_custom_values.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)));
CREATE POLICY contact_custom_values_update ON public.contact_custom_values
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_custom_values.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)))
  WITH CHECK (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_custom_values.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)));
CREATE POLICY contact_custom_values_delete ON public.contact_custom_values
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_custom_values.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)));

-- --- contact_tags ----------------------------------------------------------
DROP POLICY IF EXISTS contact_tags_modify ON public.contact_tags;

CREATE POLICY contact_tags_insert ON public.contact_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)));
CREATE POLICY contact_tags_update ON public.contact_tags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)))
  WITH CHECK (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)));
CREATE POLICY contact_tags_delete ON public.contact_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM contacts c
            WHERE c.id = contact_tags.contact_id
              AND is_account_member(c.account_id, 'agent'::account_role_enum)));

-- --- credit_weights --------------------------------------------------------
DROP POLICY IF EXISTS credit_weights_modify ON public.credit_weights;

CREATE POLICY credit_weights_insert ON public.credit_weights
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY credit_weights_update ON public.credit_weights
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY credit_weights_delete ON public.credit_weights
  FOR DELETE USING (is_super_admin());

-- --- flow_nodes ------------------------------------------------------------
DROP POLICY IF EXISTS flow_nodes_modify ON public.flow_nodes;

CREATE POLICY flow_nodes_insert ON public.flow_nodes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM flows f
            WHERE f.id = flow_nodes.flow_id
              AND is_account_member(f.account_id, 'agent'::account_role_enum)));
CREATE POLICY flow_nodes_update ON public.flow_nodes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM flows f
            WHERE f.id = flow_nodes.flow_id
              AND is_account_member(f.account_id, 'agent'::account_role_enum)))
  WITH CHECK (
    EXISTS (SELECT 1 FROM flows f
            WHERE f.id = flow_nodes.flow_id
              AND is_account_member(f.account_id, 'agent'::account_role_enum)));
CREATE POLICY flow_nodes_delete ON public.flow_nodes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM flows f
            WHERE f.id = flow_nodes.flow_id
              AND is_account_member(f.account_id, 'agent'::account_role_enum)));

-- --- pipeline_stages -------------------------------------------------------
DROP POLICY IF EXISTS pipeline_stages_modify ON public.pipeline_stages;

CREATE POLICY pipeline_stages_insert ON public.pipeline_stages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_stages.pipeline_id
              AND is_account_member(p.account_id, 'admin'::account_role_enum)));
CREATE POLICY pipeline_stages_update ON public.pipeline_stages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_stages.pipeline_id
              AND is_account_member(p.account_id, 'admin'::account_role_enum)))
  WITH CHECK (
    EXISTS (SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_stages.pipeline_id
              AND is_account_member(p.account_id, 'admin'::account_role_enum)));
CREATE POLICY pipeline_stages_delete ON public.pipeline_stages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pipelines p
            WHERE p.id = pipeline_stages.pipeline_id
              AND is_account_member(p.account_id, 'admin'::account_role_enum)));

-- --- plans -----------------------------------------------------------------
DROP POLICY IF EXISTS plans_modify ON public.plans;

CREATE POLICY plans_insert ON public.plans
  FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY plans_update ON public.plans
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY plans_delete ON public.plans
  FOR DELETE USING (is_super_admin());

-- --- document_delivery_processes -------------------------------------------
DROP POLICY IF EXISTS "Account members can manage document delivery processes" ON public.document_delivery_processes;
DROP POLICY IF EXISTS "Account members can view document delivery processes" ON public.document_delivery_processes;

CREATE POLICY document_delivery_processes_select ON public.document_delivery_processes
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY document_delivery_processes_insert ON public.document_delivery_processes
  FOR INSERT WITH CHECK (is_account_member(account_id));
CREATE POLICY document_delivery_processes_update ON public.document_delivery_processes
  FOR UPDATE USING (is_account_member(account_id)) WITH CHECK (is_account_member(account_id));
CREATE POLICY document_delivery_processes_delete ON public.document_delivery_processes
  FOR DELETE USING (is_account_member(account_id));

-- --- document_delivery_pendencies ------------------------------------------
DROP POLICY IF EXISTS "Account members can manage document delivery pendencies" ON public.document_delivery_pendencies;
DROP POLICY IF EXISTS "Account members can view document delivery pendencies" ON public.document_delivery_pendencies;

CREATE POLICY document_delivery_pendencies_select ON public.document_delivery_pendencies
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY document_delivery_pendencies_insert ON public.document_delivery_pendencies
  FOR INSERT WITH CHECK (is_account_member(account_id));
CREATE POLICY document_delivery_pendencies_update ON public.document_delivery_pendencies
  FOR UPDATE USING (is_account_member(account_id)) WITH CHECK (is_account_member(account_id));
CREATE POLICY document_delivery_pendencies_delete ON public.document_delivery_pendencies
  FOR DELETE USING (is_account_member(account_id));

-- --- onboarding_progress ---------------------------------------------------
DROP POLICY IF EXISTS "Users can insert/update onboarding progress for themselves" ON public.onboarding_progress;
DROP POLICY IF EXISTS "Users can view onboarding progress of their account" ON public.onboarding_progress;

CREATE POLICY onboarding_progress_select ON public.onboarding_progress
  FOR SELECT USING (is_account_member(account_id));
CREATE POLICY onboarding_progress_insert ON public.onboarding_progress
  FOR INSERT WITH CHECK (user_id = (select auth.uid()) AND is_account_member(account_id));
CREATE POLICY onboarding_progress_update ON public.onboarding_progress
  FOR UPDATE USING (user_id = (select auth.uid()) AND is_account_member(account_id))
             WITH CHECK (user_id = (select auth.uid()) AND is_account_member(account_id));
CREATE POLICY onboarding_progress_delete ON public.onboarding_progress
  FOR DELETE USING (user_id = (select auth.uid()) AND is_account_member(account_id));

-- ===========================================================================
-- PARTE 4 — Encapsulamento de auth.uid() (auth_rls_initplan)
--           Semântica preservada integralmente.
-- ===========================================================================

-- --- conversation_board_items ----------------------------------------------
DROP POLICY IF EXISTS conversation_board_items_select ON public.conversation_board_items;
CREATE POLICY conversation_board_items_select ON public.conversation_board_items
  FOR SELECT USING (
    is_account_member(account_id)
    AND can_access_conversation_board(board_id, (select auth.uid()))
  );

-- --- conversation_boards ---------------------------------------------------
DROP POLICY IF EXISTS conversation_boards_select ON public.conversation_boards;
CREATE POLICY conversation_boards_select ON public.conversation_boards
  FOR SELECT USING (
    is_account_member(account_id)
    AND can_access_conversation_board(id, (select auth.uid()))
  );

-- --- deals -----------------------------------------------------------------
DROP POLICY IF EXISTS deals_select ON public.deals;
CREATE POLICY deals_select ON public.deals
  FOR SELECT USING (
    is_account_member(account_id)
    AND can_access_pipeline(pipeline_id, (select auth.uid()))
  );

-- --- pipelines -------------------------------------------------------------
DROP POLICY IF EXISTS pipelines_select ON public.pipelines;
CREATE POLICY pipelines_select ON public.pipelines
  FOR SELECT USING (
    is_account_member(account_id)
    AND can_access_pipeline(id, (select auth.uid()))
  );

-- --- document_delivery_audit_logs ------------------------------------------
DROP POLICY IF EXISTS "Account members can view document delivery audit logs" ON public.document_delivery_audit_logs;
CREATE POLICY document_delivery_audit_logs_select ON public.document_delivery_audit_logs
  FOR SELECT USING (is_account_member(account_id));

-- --- internal_notes --------------------------------------------------------
DROP POLICY IF EXISTS internal_notes_update ON public.internal_notes;
CREATE POLICY internal_notes_update ON public.internal_notes
  FOR UPDATE USING (
    is_account_member(account_id, 'agent'::account_role_enum)
    AND author_id = (select auth.uid())
  );

DROP POLICY IF EXISTS internal_notes_delete ON public.internal_notes;
CREATE POLICY internal_notes_delete ON public.internal_notes
  FOR DELETE USING (
    is_account_member(account_id, 'agent'::account_role_enum)
    AND author_id = (select auth.uid())
  );

-- --- internal_reactions ----------------------------------------------------
DROP POLICY IF EXISTS internal_reactions_delete ON public.internal_reactions;
CREATE POLICY internal_reactions_delete ON public.internal_reactions
  FOR DELETE USING (
    user_id = (select auth.uid())
    AND is_account_member(account_id, 'agent'::account_role_enum)
  );

-- --- notifications ---------------------------------------------------------
DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (user_id = (select auth.uid()) AND is_account_member(account_id));

DROP POLICY IF EXISTS notifications_update ON public.notifications;
CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (user_id = (select auth.uid()) AND is_account_member(account_id));

DROP POLICY IF EXISTS notifications_delete ON public.notifications;
CREATE POLICY notifications_delete ON public.notifications
  FOR DELETE USING (user_id = (select auth.uid()) AND is_account_member(account_id));

-- --- profiles --------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING ((select auth.uid()) = user_id OR is_account_member(account_id));

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = user_id)
             WITH CHECK ((select auth.uid()) = user_id);

-- --- support_tickets -------------------------------------------------------
DROP POLICY IF EXISTS support_tickets_user_select ON public.support_tickets;
CREATE POLICY support_tickets_user_select ON public.support_tickets
  FOR SELECT USING (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS support_tickets_user_insert ON public.support_tickets;
CREATE POLICY support_tickets_user_insert ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = (select auth.uid()) OR is_super_admin());

DROP POLICY IF EXISTS support_tickets_user_update ON public.support_tickets;
CREATE POLICY support_tickets_user_update ON public.support_tickets
  FOR UPDATE USING (user_id = (select auth.uid()) OR is_super_admin());

-- --- support_ticket_messages -----------------------------------------------
DROP POLICY IF EXISTS support_messages_select ON public.support_ticket_messages;
CREATE POLICY support_messages_select ON public.support_ticket_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets t
            WHERE t.id = support_ticket_messages.ticket_id
              AND (t.user_id = (select auth.uid()) OR is_super_admin())));

DROP POLICY IF EXISTS support_messages_insert ON public.support_ticket_messages;
CREATE POLICY support_messages_insert ON public.support_ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM support_tickets t
            WHERE t.id = support_ticket_messages.ticket_id
              AND (t.user_id = (select auth.uid()) OR is_super_admin())));

DROP POLICY IF EXISTS support_messages_update ON public.support_ticket_messages;
CREATE POLICY support_messages_update ON public.support_ticket_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM support_tickets t
            WHERE t.id = support_ticket_messages.ticket_id
              AND (t.user_id = (select auth.uid()) OR is_super_admin())));

-- --- system_config ---------------------------------------------------------
DROP POLICY IF EXISTS "Apenas Super Admins ou Service Role para system_config" ON public.system_config;
CREATE POLICY system_config_all ON public.system_config
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- --- usage_aggregates_daily ------------------------------------------------
DROP POLICY IF EXISTS "Membros da conta podem visualizar agregados diários" ON public.usage_aggregates_daily;
CREATE POLICY usage_aggregates_daily_select ON public.usage_aggregates_daily
  FOR SELECT USING (is_account_member(account_id) OR is_super_admin());

-- --- usage_events ----------------------------------------------------------
DROP POLICY IF EXISTS "Membros da conta podem visualizar eventos de consumo" ON public.usage_events;
CREATE POLICY usage_events_select ON public.usage_events
  FOR SELECT USING (is_account_member(account_id) OR is_super_admin());

DROP POLICY IF EXISTS "Service role ou RPC podem inserir eventos de consumo" ON public.usage_events;
CREATE POLICY usage_events_insert ON public.usage_events
  FOR INSERT WITH CHECK (is_account_member(account_id) OR is_super_admin());

-- --- user_onboarding_tours -------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own onboarding tours" ON public.user_onboarding_tours;
CREATE POLICY user_onboarding_tours_all ON public.user_onboarding_tours
  FOR ALL USING (user_id = (select auth.uid()))
          WITH CHECK (user_id = (select auth.uid()));

COMMIT;
