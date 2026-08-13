-- Migration 065: Índices de cobertura para chaves estrangeiras
--
-- CONTEXTO
-- O Postgres cria índice automaticamente para PRIMARY KEY e UNIQUE, nunca para
-- FOREIGN KEY. Sem índice do lado filho, dois caminhos degradam:
--   1. JOIN pela FK vira sequential scan.
--   2. UPDATE/DELETE na tabela pai varre a filha inteira para validar a
--      integridade referencial — inclusive em ON DELETE CASCADE.
--
-- As 62 FKs abaixo foram levantadas diretamente do catálogo (pg_constraint sem
-- pg_index correspondente com prefixo compatível), não da lista do advisor, e
-- conferem com ela. Todas são de coluna única.
--
-- Nenhuma tabela do schema tem mais de 500 linhas hoje (pg_stat_user_tables), o
-- que torna a criação instantânea e dispensa CONCURRENTLY. Se esta migration for
-- reaplicada a um ambiente já populado, converter para
-- `CREATE INDEX CONCURRENTLY` e executar fora de transação.
--
-- Advisor resolvido: unindexed_foreign_keys (62).

BEGIN;

-- account_invitations
CREATE INDEX IF NOT EXISTS idx_account_invitations_accepted_by_user_id ON public.account_invitations (accepted_by_user_id);
CREATE INDEX IF NOT EXISTS idx_account_invitations_created_by_user_id ON public.account_invitations (created_by_user_id);

-- ai_security_events
CREATE INDEX IF NOT EXISTS idx_ai_security_events_conversation_id ON public.ai_security_events (conversation_id);

-- automation_logs
CREATE INDEX IF NOT EXISTS idx_automation_logs_contact_id ON public.automation_logs (contact_id);

-- automation_pending_executions
CREATE INDEX IF NOT EXISTS idx_automation_pending_executions_automation_id ON public.automation_pending_executions (automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_pending_executions_contact_id ON public.automation_pending_executions (contact_id);
CREATE INDEX IF NOT EXISTS idx_automation_pending_executions_log_id ON public.automation_pending_executions (log_id);
CREATE INDEX IF NOT EXISTS idx_automation_pending_executions_parent_step_id ON public.automation_pending_executions (parent_step_id);
CREATE INDEX IF NOT EXISTS idx_automation_pending_executions_user_id ON public.automation_pending_executions (user_id);

-- broadcasts / broadcast_recipients
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_contact_id ON public.broadcast_recipients (contact_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_user_id ON public.broadcasts (user_id);

-- contatos
CREATE INDEX IF NOT EXISTS idx_contact_custom_values_custom_field_id ON public.contact_custom_values (custom_field_id);
CREATE INDEX IF NOT EXISTS idx_contact_notes_contact_id ON public.contact_notes (contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_notes_user_id ON public.contact_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_user_id ON public.custom_fields (user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags (user_id);

-- quadros de conversa
CREATE INDEX IF NOT EXISTS idx_conversation_boards_created_by_user_id ON public.conversation_boards (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_groups_created_by_user_id ON public.conversation_board_groups (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_labels_created_by_user_id ON public.conversation_board_labels (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_lanes_created_by_user_id ON public.conversation_board_lanes (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_item_labels_created_by_user_id ON public.conversation_board_item_labels (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_conversation_id ON public.conversation_board_items (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_lane_id ON public.conversation_board_items (lane_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_created_by_user_id ON public.conversation_board_items (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_awaiting_return_set_by_user_id ON public.conversation_board_items (awaiting_return_set_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_awaiting_return_cleared_by_user_id ON public.conversation_board_items (awaiting_return_cleared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_mention_set_by_user_id ON public.conversation_board_items (mention_set_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_mention_cleared_by_user_id ON public.conversation_board_items (mention_cleared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_board_items_priority_set_by_user_id ON public.conversation_board_items (priority_set_by_user_id);

-- menções e linha do tempo
CREATE INDEX IF NOT EXISTS idx_conversation_mentions_conversation_id ON public.conversation_mentions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_mentions_mentioned_user_id ON public.conversation_mentions (mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_mentions_acknowledged_by_user_id ON public.conversation_mentions (acknowledged_by_user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_timeline_events_author_id ON public.conversation_timeline_events (author_id);

-- pipelines e negócios
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON public.deals (contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_conversation_id ON public.deals (conversation_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals (user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON public.pipelines (user_id);

-- entrega de documentos
CREATE INDEX IF NOT EXISTS idx_document_delivery_audit_logs_identified_recipient_id ON public.document_delivery_audit_logs (identified_recipient_id);
CREATE INDEX IF NOT EXISTS idx_document_delivery_pendencies_resolved_by ON public.document_delivery_pendencies (resolved_by);
CREATE INDEX IF NOT EXISTS idx_document_delivery_pendencies_suggested_contact_id ON public.document_delivery_pendencies (suggested_contact_id);
CREATE INDEX IF NOT EXISTS idx_document_delivery_processes_user_id ON public.document_delivery_processes (user_id);
CREATE INDEX IF NOT EXISTS idx_document_delivery_processes_whatsapp_template_id ON public.document_delivery_processes (whatsapp_template_id);

-- fluxos
CREATE INDEX IF NOT EXISTS idx_flow_runs_contact_id ON public.flow_runs (contact_id);
CREATE INDEX IF NOT EXISTS idx_flow_runs_conversation_id ON public.flow_runs (conversation_id);
CREATE INDEX IF NOT EXISTS idx_flow_runs_user_id ON public.flow_runs (user_id);

-- integrações e webhooks
CREATE INDEX IF NOT EXISTS idx_google_drive_integrations_user_id ON public.google_drive_integrations (user_id);
CREATE INDEX IF NOT EXISTS idx_inbound_webhooks_account_id ON public.inbound_webhooks (account_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_user_id ON public.whatsapp_config (user_id);

-- colaboração interna
CREATE INDEX IF NOT EXISTS idx_internal_reactions_conversation_id ON public.internal_reactions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_internal_reactions_user_id ON public.internal_reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_message_tags_conversation_id ON public.message_tags (conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_tags_user_id ON public.message_tags (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications (actor_id);

-- faturamento e consumo
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices (subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions (plan_id);
CREATE INDEX IF NOT EXISTS idx_response_reservations_account_id ON public.response_reservations (account_id);
CREATE INDEX IF NOT EXISTS idx_response_reservations_user_id ON public.response_reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events (user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress (user_id);

-- administração e suporte
CREATE INDEX IF NOT EXISTS idx_super_admin_audit_logs_performed_by_user_id ON public.super_admin_audit_logs (performed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_sender_user_id ON public.support_ticket_messages (sender_user_id);

COMMIT;
