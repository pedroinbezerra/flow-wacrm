-- ============================================================
-- Migration 034: Onboarding, User Journey & Proprietary Event Analytics
-- ============================================================

-- 1) Tabela de Progresso do Checklist de Implantação
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_key VARCHAR(64) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_progress_account_user_step_unique UNIQUE (account_id, user_id, step_key)
);

-- Index para buscas rápidas por conta e usuário
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_account_user
  ON public.onboarding_progress(account_id, user_id);

-- RLS para onboarding_progress
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view onboarding progress of their account"
  ON public.onboarding_progress
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert/update onboarding progress for themselves"
  ON public.onboarding_progress
  FOR ALL
  USING (
    user_id = auth.uid()
    AND account_id IN (
      SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );


-- 2) Tabela de Status dos Tours Guiados (Driver.js)
CREATE TABLE IF NOT EXISTS public.user_onboarding_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_key VARCHAR(64) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  last_step_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_onboarding_tours_account_user_tour_unique UNIQUE (account_id, user_id, tour_key)
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_tours_user_tour
  ON public.user_onboarding_tours(user_id, tour_key);

ALTER TABLE public.user_onboarding_tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own onboarding tours"
  ON public.user_onboarding_tours
  FOR ALL
  USING (user_id = auth.uid());


-- 3) Camada Própria de Eventos (Proprietary Event Layer)
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(64),
  event_name VARCHAR(128) NOT NULL,
  page_url TEXT,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices otimizados para relatórios de produto e inteligência de jornada
CREATE INDEX IF NOT EXISTS idx_user_events_account_event
  ON public.user_events(account_id, event_name);

CREATE INDEX IF NOT EXISTS idx_user_events_event_name_created
  ON public.user_events(event_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_created_at
  ON public.user_events(created_at DESC);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem registrar eventos da sua conta
CREATE POLICY "Authenticated users can insert events"
  ON public.user_events
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Admins e Owners da conta podem visualizar eventos para inteligência de produto
CREATE POLICY "Account members can view events for analytics"
  ON public.user_events
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Service Role possui acesso irrestrito
CREATE POLICY "Service role full access on user_events"
  ON public.user_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');


-- 4) Função RPC para Métricas de inteligência do Onboarding
CREATE OR REPLACE FUNCTION public.get_onboarding_analytics_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_users INT;
  v_started_onboarding INT;
  v_completed_onboarding INT;
  v_step_breakdown JSONB;
  v_feature_usage JSONB;
  v_res JSONB;
BEGIN
  -- Total de usuários com perfil
  SELECT COUNT(DISTINCT user_id) INTO v_total_users FROM public.profiles;

  -- Usuários que iniciaram pelo menos 1 passo do onboarding
  SELECT COUNT(DISTINCT user_id) INTO v_started_onboarding FROM public.onboarding_progress;

  -- Usuários que concluíram os 6 passos principais
  SELECT COUNT(DISTINCT user_id) INTO v_completed_onboarding
  FROM (
    SELECT user_id, COUNT(DISTINCT step_key) FILTER (WHERE completed = true) AS completed_count
    FROM public.onboarding_progress
    GROUP BY user_id
    HAVING COUNT(DISTINCT step_key) FILTER (WHERE completed = true) >= 6
  ) c;

  -- Detalhamento de progresso por etapa
  SELECT jsonb_object_agg(step_key, step_stats) INTO v_step_breakdown
  FROM (
    SELECT 
      step_key,
      jsonb_build_object(
        'total_started', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE completed = true),
        'skipped', COUNT(*) FILTER (WHERE skipped = true)
      ) AS step_stats
    FROM public.onboarding_progress
    GROUP BY step_key
  ) s;

  -- Agregação de utilização inicial de funcionalidades
  SELECT jsonb_object_agg(event_name, event_count) INTO v_feature_usage
  FROM (
    SELECT event_name, COUNT(*) AS event_count
    FROM public.user_events
    WHERE created_at >= (now() - interval '30 days')
    GROUP BY event_name
  ) f;

  v_res := jsonb_build_object(
    'total_users', COALESCE(v_total_users, 0),
    'started_onboarding', COALESCE(v_started_onboarding, 0),
    'completed_onboarding', COALESCE(v_completed_onboarding, 0),
    'completion_rate', CASE WHEN v_started_onboarding > 0 
                            THEN ROUND((v_completed_onboarding::numeric / v_started_onboarding::numeric) * 100, 1)
                            ELSE 0 END,
    'step_breakdown', COALESCE(v_step_breakdown, '{}'::jsonb),
    'feature_usage_30d', COALESCE(v_feature_usage, '{}'::jsonb)
  );

  RETURN v_res;
END;
$$;
