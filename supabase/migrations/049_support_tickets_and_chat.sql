-- ============================================================
-- 049_support_tickets_and_chat.sql
--
-- Support Tickets, Live Support Chat & Super Admin Customer Service
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT 'Usuário',
  user_email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'duvida' CHECK (category IN ('duvida', 'problema_tecnico', 'financeiro', 'sugestao', 'outro', 'chat_direto')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'super_admin')),
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL DEFAULT 'Atendente',
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read_by_user BOOLEAN NOT NULL DEFAULT FALSE,
  is_read_by_support BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_account ON public.support_tickets(account_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_msg ON public.support_tickets(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_ticket_messages(ticket_id, created_at ASC);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_tickets
DROP POLICY IF EXISTS support_tickets_user_select ON public.support_tickets;
CREATE POLICY support_tickets_user_select ON public.support_tickets
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS support_tickets_user_insert ON public.support_tickets;
CREATE POLICY support_tickets_user_insert ON public.support_tickets
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR is_super_admin()
  );

DROP POLICY IF EXISTS support_tickets_user_update ON public.support_tickets;
CREATE POLICY support_tickets_user_update ON public.support_tickets
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR is_super_admin()
  );

-- Policies for support_ticket_messages
DROP POLICY IF EXISTS support_messages_select ON public.support_ticket_messages;
CREATE POLICY support_messages_select ON public.support_ticket_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR is_super_admin())
    )
  );

DROP POLICY IF EXISTS support_messages_insert ON public.support_ticket_messages;
CREATE POLICY support_messages_insert ON public.support_ticket_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR is_super_admin())
    )
  );

DROP POLICY IF EXISTS support_messages_update ON public.support_ticket_messages;
CREATE POLICY support_messages_update ON public.support_ticket_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR is_super_admin())
    )
  );
