-- ============================================================
-- 038_lgpd_compliance.sql
--
-- LGPD Compliance: Opt-out, Consent Tracking, Data Anonymization,
-- and Data Export RPCs for Data Subjects (Art. 18 LGPD)
-- ============================================================

-- 1. Add Opt-Out & Consent columns to public.contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS opt_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_status TEXT DEFAULT 'opted_in' NOT NULL,
  ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint for consent_status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_contacts_consent_status'
  ) THEN
    ALTER TABLE public.contacts
      ADD CONSTRAINT chk_contacts_consent_status
      CHECK (consent_status IN ('opted_in', 'opted_out', 'revoked'));
  END IF;
END $$;

-- 2. Index for filtering opt-out contacts in broadcast dispatches
CREATE INDEX IF NOT EXISTS idx_contacts_account_opt_out
  ON public.contacts(user_id, opt_out);

-- 3. RPC: Anonymize Contact Data (Right to Erasure / Anonimization - Art. 18, VI LGPD)
CREATE OR REPLACE FUNCTION public.anonymize_lgpd_contact(
  p_contact_id UUID,
  p_account_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact RECORD;
BEGIN
  -- Verify membership/ownership in account
  IF NOT EXISTS (
    SELECT 1 FROM public.contacts
    WHERE id = p_contact_id AND user_id = p_account_id
  ) THEN
    RAISE EXCEPTION 'Contact not found or access denied.';
  END IF;

  -- Anonymize contact fields while preserving ID & relational integrity for audit/history
  UPDATE public.contacts
  SET
    name = 'Contato Anonimizado LGPD',
    email = NULL,
    company = NULL,
    avatar_url = NULL,
    opt_out = true,
    opt_out_at = NOW(),
    consent_status = 'revoked',
    consent_updated_at = NOW(),
    updated_at = NOW()
  WHERE id = p_contact_id AND user_id = p_account_id
  RETURNING * INTO v_contact;

  -- Delete custom values for this contact
  DELETE FROM public.contact_custom_values
  WHERE contact_id = p_contact_id;

  RETURN jsonb_build_object(
    'success', true,
    'contact_id', p_contact_id,
    'message', 'Contact personal data anonymized successfully under LGPD.'
  );
END;
$$;

-- 4. RPC: Export Contact Data (Right to Data Portability / Access - Art. 18, V LGPD)
CREATE OR REPLACE FUNCTION public.export_lgpd_contact_data(
  p_contact_id UUID,
  p_account_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contact_data JSONB;
  v_custom_fields JSONB;
  v_conversations JSONB;
  v_tags JSONB;
BEGIN
  -- Verify membership/ownership in account
  IF NOT EXISTS (
    SELECT 1 FROM public.contacts
    WHERE id = p_contact_id AND user_id = p_account_id
  ) THEN
    RAISE EXCEPTION 'Contact not found or access denied.';
  END IF;

  -- Contact basic profile
  SELECT to_jsonb(c) INTO v_contact_data
  FROM public.contacts c
  WHERE c.id = p_contact_id AND c.user_id = p_account_id;

  -- Custom values
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'field_name', cf.field_name,
      'field_type', cf.field_type,
      'value', ccv.value
    )
  ), '[]'::jsonb) INTO v_custom_fields
  FROM public.contact_custom_values ccv
  JOIN public.custom_fields cf ON cf.id = ccv.custom_field_id
  WHERE ccv.contact_id = p_contact_id;

  -- Tags
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'name', t.name,
      'color', t.color
    )
  ), '[]'::jsonb) INTO v_tags
  FROM public.contact_tags ct
  JOIN public.tags t ON t.id = ct.tag_id
  WHERE ct.contact_id = p_contact_id;

  -- Conversations summary
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', conv.id,
      'status', conv.status,
      'created_at', conv.created_at,
      'updated_at', conv.updated_at
    )
  ), '[]'::jsonb) INTO v_conversations
  FROM public.conversations conv
  WHERE conv.contact_id = p_contact_id;

  RETURN jsonb_build_object(
    'exported_at', NOW(),
    'profile', v_contact_data,
    'custom_fields', v_custom_fields,
    'tags', v_tags,
    'conversations', v_conversations
  );
END;
$$;
