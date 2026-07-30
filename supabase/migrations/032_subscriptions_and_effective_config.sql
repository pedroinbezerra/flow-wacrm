-- Migration: 032_subscriptions_and_effective_config.sql
-- Description: Módulo de Assinaturas, Ciclo de Vida, Recursos Adicionais (Add-ons) e Configuração Efetiva.

-- 1. Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'suspended')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  asaas_subscription_id TEXT,
  asaas_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT subscriptions_account_id_key UNIQUE (account_id)
);

-- Índices para buscas rápidas por integração Asaas e por conta
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON public.subscriptions(account_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas_sub_id ON public.subscriptions(asaas_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas_cust_id ON public.subscriptions(asaas_customer_id);

-- 2. Tabela de Recursos Adicionais (Add-ons)
CREATE TABLE IF NOT EXISTS public.account_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled')),
  asaas_subscription_item_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_addons_account_id ON public.account_addons(account_id);

-- 3. Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_addons ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Subscriptions
CREATE POLICY "Membros da conta podem visualizar a assinatura"
  ON public.subscriptions
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Apenas Super Admins ou Service Role podem modificar assinaturas"
  ON public.subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Políticas RLS para Account Addons
CREATE POLICY "Membros da conta podem visualizar recursos adicionais"
  ON public.account_addons
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Apenas Super Admins ou Service Role podem modificar recursos adicionais"
  ON public.account_addons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- 4. Função RPC para calcular a Configuração Efetiva da Conta
CREATE OR REPLACE FUNCTION get_effective_account_config(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_features JSONB := '{}'::jsonb;
  v_plan_id UUID;
  v_addon RECORD;
  v_result JSONB;
  v_key TEXT;
  v_base_val NUMERIC;
  v_addon_qty NUMERIC;
BEGIN
  -- Buscar o plano da assinatura da conta ou fallback na tabela accounts
  SELECT sub.plan_id INTO v_plan_id
  FROM public.subscriptions sub
  WHERE sub.account_id = p_account_id AND sub.status IN ('active', 'trialing')
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    SELECT plan_id INTO v_plan_id FROM public.accounts WHERE id = p_account_id;
  END IF;

  -- Se encontrou plano, pega as features
  IF v_plan_id IS NOT NULL THEN
    SELECT features INTO v_plan_features FROM public.plans WHERE id = v_plan_id;
  ELSE
    -- Fallback para o primeiro plano ativo do sistema
    SELECT features INTO v_plan_features FROM public.plans WHERE status = 'active' ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_plan_features IS NULL THEN
    v_plan_features := '{}'::jsonb;
  END IF;

  v_result := v_plan_features;

  -- Somar/acumular com add-ons ativos
  FOR v_addon IN
    SELECT feature_key, quantity
    FROM public.account_addons
    WHERE account_id = p_account_id AND status = 'active'
  LOOP
    v_key := v_addon.feature_key;
    
    -- Se a feature for um limite numérico
    IF v_result ? v_key AND jsonb_typeof(v_result->v_key) = 'number' THEN
      v_base_val := (v_result->>v_key)::NUMERIC;
      v_addon_qty := v_addon.quantity;
      v_result := jsonb_set(v_result, ARRAY[v_key], to_jsonb(v_base_val + v_addon_qty));
    -- Se for uma permissão booleana
    ELSIF v_result ? v_key AND jsonb_typeof(v_result->v_key) = 'boolean' THEN
      IF v_addon.quantity > 0 THEN
        v_result := jsonb_set(v_result, ARRAY[v_key], 'true'::jsonb);
      END IF;
    -- Se for um novo limite que não estava no plano base
    ELSE
      v_result := jsonb_set(v_result, ARRAY[v_key], to_jsonb(v_addon.quantity));
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;
