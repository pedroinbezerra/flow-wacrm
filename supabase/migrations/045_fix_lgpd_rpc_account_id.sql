-- ============================================================
-- 045_fix_lgpd_rpc_account_id.sql
--
-- Fix LGPD compliance RPCs to compare account_id = p_account_id
-- instead of user_id = p_account_id on contacts table.
-- ============================================================

-- 1. RPC: Anonymize Contact Data (Right to Erasure / Anonimization - Art. 18, VI LGPD)
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
    WHERE id = p_contact_id AND account_id = p_account_id
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
  WHERE id = p_contact_id AND account_id = p_account_id
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

-- 2. RPC: Export Contact Data (Right to Data Portability / Access - Art. 18, V LGPD)
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
    WHERE id = p_contact_id AND account_id = p_account_id
  ) THEN
    RAISE EXCEPTION 'Contact not found or access denied.';
  END IF;

  -- Contact basic profile
  SELECT to_jsonb(c) INTO v_contact_data
  FROM public.contacts c
  WHERE c.id = p_contact_id AND c.account_id = p_account_id;

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
