-- ============================================================
-- 030_flows_atomic_replace.sql
--
-- Atomic flow save for editor PUT /api/flows/[id].
--
-- Replaces the old "update flow + delete nodes + insert nodes"
-- sequence with one transaction-scoped RPC so readers never observe
-- a half-written graph.
--
-- Arguments:
--   p_flow_id UUID                target flow
--   p_patch JSONB                 partial flow fields to patch
--   p_nodes JSONB | NULL          full replacement node array
--                                  null => keep existing nodes
--                                  []   => clear all nodes
-- ============================================================

CREATE OR REPLACE FUNCTION replace_flow_definition(
  p_flow_id UUID,
  p_patch JSONB DEFAULT '{}'::jsonb,
  p_nodes JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE flows
  SET
    name = CASE
      WHEN p_patch ? 'name' THEN p_patch->>'name'
      ELSE name
    END,
    description = CASE
      WHEN p_patch ? 'description' THEN p_patch->>'description'
      ELSE description
    END,
    trigger_type = CASE
      WHEN p_patch ? 'trigger_type' THEN p_patch->>'trigger_type'
      ELSE trigger_type
    END,
    trigger_config = CASE
      WHEN p_patch ? 'trigger_config' THEN COALESCE(p_patch->'trigger_config', '{}'::jsonb)
      ELSE trigger_config
    END,
    entry_node_id = CASE
      WHEN p_patch ? 'entry_node_id' THEN p_patch->>'entry_node_id'
      ELSE entry_node_id
    END,
    fallback_policy = CASE
      WHEN p_patch ? 'fallback_policy' THEN COALESCE(p_patch->'fallback_policy', '{}'::jsonb)
      ELSE fallback_policy
    END,
    updated_at = NOW()
  WHERE id = p_flow_id;

  IF p_nodes IS NOT NULL THEN
    DELETE FROM flow_nodes
    WHERE flow_id = p_flow_id;

    INSERT INTO flow_nodes (
      flow_id,
      node_key,
      node_type,
      config,
      position_x,
      position_y
    )
    SELECT
      p_flow_id,
      n->>'node_key',
      n->>'node_type',
      COALESCE(n->'config', '{}'::jsonb),
      COALESCE((n->>'position_x')::INTEGER, 0),
      COALESCE((n->>'position_y')::INTEGER, 0)
    FROM jsonb_array_elements(p_nodes) AS n;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION replace_flow_definition(UUID, JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION replace_flow_definition(UUID, JSONB, JSONB) FROM anon;
REVOKE ALL ON FUNCTION replace_flow_definition(UUID, JSONB, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION replace_flow_definition(UUID, JSONB, JSONB) TO service_role;
