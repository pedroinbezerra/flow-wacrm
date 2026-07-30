-- ============================================================
-- 039_computational_consumption_and_telemetry.sql
-- Motor de Consumo Computacional, Franquia em Créditos e Telemetria Operacional
-- ============================================================

-- 1. Adicionar franquia mensal de créditos na tabela plans
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS monthly_compute_credits BIGINT NOT NULL DEFAULT 100000;

-- Atualizar planos existentes com franquias padrão por perfil
UPDATE public.plans
SET monthly_compute_credits = CASE
  WHEN LOWER(name) LIKE '%starter%' OR LOWER(name) LIKE '%básico%' OR LOWER(name) LIKE '%padrão%' THEN 25000
  WHEN LOWER(name) LIKE '%pro%' OR LOWER(name) LIKE '%profissional%' THEN 100000
  WHEN LOWER(name) LIKE '%enterprise%' OR LOWER(name) LIKE '%avançado%' THEN 500000
  ELSE 100000
END
WHERE monthly_compute_credits = 100000 OR monthly_compute_credits IS NULL;

-- 2. Tabela de Pesos de Crédito Computacional
CREATE TABLE IF NOT EXISTS public.credit_weights (
  resource_type TEXT PRIMARY KEY,
  credit_weight NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
  description TEXT,
  unit_cost_estimate NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.credit_weights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_weights_select ON public.credit_weights;
CREATE POLICY credit_weights_select ON public.credit_weights FOR SELECT
  USING (true);

DROP POLICY IF EXISTS credit_weights_modify ON public.credit_weights;
CREATE POLICY credit_weights_modify ON public.credit_weights FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Seed inicial de pesos parametrizáveis
INSERT INTO public.credit_weights (resource_type, credit_weight, description, unit_cost_estimate, status)
VALUES
  ('whatsapp_message', 1.00, 'Envio ou recepção de mensagem no WhatsApp', 0.0050, 'active'),
  ('ai_execution', 5.00, 'Execução de modelo de IA (atendimento / copiloto)', 0.0200, 'active'),
  ('audio_transcription', 10.00, 'Transcrição de mensagens de áudio via IA', 0.0400, 'active'),
  ('automation_execution', 2.00, 'Execução de nós de automação de fluxo', 0.0020, 'active'),
  ('webhook_dispatch', 1.00, 'Disparo ou consumo de evento Webhook', 0.0010, 'active'),
  ('pdf_generation', 2.00, 'Geração de relatórios ou documentos em PDF', 0.0050, 'active'),
  ('ocr_scan', 8.00, 'Leitura e captura de dados via OCR (recurso expansível)', 0.0300, 'active')
ON CONFLICT (resource_type) DO UPDATE SET
  credit_weight = EXCLUDED.credit_weight,
  description = EXCLUDED.description,
  unit_cost_estimate = EXCLUDED.unit_cost_estimate,
  updated_at = NOW();

-- 3. Tabela de Telemetria de Eventos de Consumo (usage_events)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
  compute_credits NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  estimated_cost NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_account_date ON public.usage_events (account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_resource_type ON public.usage_events (resource_type, created_at DESC);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros da conta podem visualizar eventos de consumo" ON public.usage_events;
CREATE POLICY "Membros da conta podem visualizar eventos de consumo"
  ON public.usage_events
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "Service role ou RPC podem inserir eventos de consumo" ON public.usage_events;
CREATE POLICY "Service role ou RPC podem inserir eventos de consumo"
  ON public.usage_events
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR is_super_admin()
  );

-- 4. Tabelas de Agregação Diária e Mensal
CREATE TABLE IF NOT EXISTS public.usage_aggregates_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  resource_type TEXT NOT NULL,
  total_quantity NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  total_credits NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  total_estimated_cost NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT usage_aggregates_daily_account_date_res_key UNIQUE (account_id, usage_date, resource_type)
);

CREATE INDEX IF NOT EXISTS idx_usage_aggregates_daily_lookup ON public.usage_aggregates_daily (account_id, usage_date);

ALTER TABLE public.usage_aggregates_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros da conta podem visualizar agregados diários" ON public.usage_aggregates_daily;
CREATE POLICY "Membros da conta podem visualizar agregados diários"
  ON public.usage_aggregates_daily
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR is_super_admin()
  );

-- 5. RPC para registrar evento de consumo e acumular créditos
CREATE OR REPLACE FUNCTION record_usage_event(
  p_account_id UUID,
  p_resource_type TEXT,
  p_quantity NUMERIC DEFAULT 1.00,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_weight NUMERIC(10, 2) := 1.00;
  v_unit_cost NUMERIC(10, 4) := 0.0000;
  v_credits NUMERIC(12, 2);
  v_estimated_cost NUMERIC(12, 4);
  v_event_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Buscar peso e custo unitário parametrizados
  SELECT credit_weight, unit_cost_estimate
  INTO v_weight, v_unit_cost
  FROM public.credit_weights
  WHERE resource_type = p_resource_type AND status = 'active'
  LIMIT 1;

  IF v_weight IS NULL THEN
    v_weight := 1.00;
    v_unit_cost := 0.0010;
  END IF;

  v_credits := ROUND(p_quantity * v_weight, 2);
  v_estimated_cost := ROUND(p_quantity * v_unit_cost, 4);

  -- Inserir evento de consumo na tabela principal
  INSERT INTO public.usage_events (
    account_id,
    resource_type,
    quantity,
    compute_credits,
    estimated_cost,
    metadata
  ) VALUES (
    p_account_id,
    p_resource_type,
    p_quantity,
    v_credits,
    v_estimated_cost,
    p_metadata
  )
  RETURNING id INTO v_event_id;

  -- Atualizar ou inserir agregação diária
  INSERT INTO public.usage_aggregates_daily (
    account_id,
    usage_date,
    resource_type,
    total_quantity,
    total_credits,
    total_estimated_cost
  ) VALUES (
    p_account_id,
    v_today,
    p_resource_type,
    p_quantity,
    v_credits,
    v_estimated_cost
  )
  ON CONFLICT (account_id, usage_date, resource_type)
  DO UPDATE SET
    total_quantity = public.usage_aggregates_daily.total_quantity + EXCLUDED.total_quantity,
    total_credits = public.usage_aggregates_daily.total_credits + EXCLUDED.total_credits,
    total_estimated_cost = public.usage_aggregates_daily.total_estimated_cost + EXCLUDED.total_estimated_cost,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'resource_type', p_resource_type,
    'quantity', p_quantity,
    'credits_used', v_credits,
    'estimated_cost', v_estimated_cost
  );
EXCEPTION WHEN OTHERS THEN
  -- Retornar de forma não-bloqueante em caso de qualquer exceção
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 6. RPC para buscar resumo de consumo da conta
CREATE OR REPLACE FUNCTION get_account_consumption_summary(
  p_account_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT date_trunc('month', NOW()),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly_allowance BIGINT := 100000;
  v_plan_name TEXT := 'Plano Ativo';
  v_total_credits NUMERIC(14, 2) := 0.00;
  v_total_estimated_cost NUMERIC(14, 4) := 0.0000;
  v_by_resource JSONB := '[]'::jsonb;
  v_days_in_period INT;
  v_daily_avg NUMERIC(14, 2);
BEGIN
  -- Obter franquia do plano da conta
  SELECT p.monthly_compute_credits, p.name
  INTO v_monthly_allowance, v_plan_name
  FROM public.accounts a
  LEFT JOIN public.plans p ON p.id = a.plan_id
  WHERE a.id = p_account_id;

  IF v_monthly_allowance IS NULL THEN
    v_monthly_allowance := 100000;
  END IF;

  -- Calcular total de créditos e custo estimado no período
  SELECT
    COALESCE(SUM(compute_credits), 0.00),
    COALESCE(SUM(estimated_cost), 0.0000)
  INTO v_total_credits, v_total_estimated_cost
  FROM public.usage_events
  WHERE account_id = p_account_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date;

  -- Agrupar por tipo de recurso
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'resource_type', resource_type,
      'total_quantity', total_qty,
      'total_credits', total_cred,
      'total_estimated_cost', total_cost
    )
  ), '[]'::jsonb)
  INTO v_by_resource
  FROM (
    SELECT
      resource_type,
      SUM(quantity) AS total_qty,
      SUM(compute_credits) AS total_cred,
      SUM(estimated_cost) AS total_cost
    FROM public.usage_events
    WHERE account_id = p_account_id
      AND created_at >= p_start_date
      AND created_at <= p_end_date
    GROUP BY resource_type
    ORDER BY total_cred DESC
  ) res;

  v_days_in_period := GREATEST(1, EXTRACT(DAY FROM (p_end_date - p_start_date))::INT);
  v_daily_avg := ROUND(v_total_credits / v_days_in_period, 2);

  RETURN jsonb_build_object(
    'account_id', p_account_id,
    'plan_name', v_plan_name,
    'monthly_allowance_credits', v_monthly_allowance,
    'total_credits_used', v_total_credits,
    'remaining_credits', GREATEST(0, v_monthly_allowance - v_total_credits),
    'usage_percentage', ROUND(LEAST(100.0, (v_total_credits / GREATEST(1, v_monthly_allowance)) * 100.0), 2),
    'total_estimated_cost', v_total_estimated_cost,
    'daily_average_credits', v_daily_avg,
    'breakdown_by_resource', v_by_resource
  );
END;
$$;
