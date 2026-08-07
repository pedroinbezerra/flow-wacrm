import type { AccountRole } from "@/lib/auth/roles";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  /**
   * Legacy free-form role column from migration 001. Never read
   * by the app since 017_account_sharing.sql introduced the typed
   * `account_role` enum. Flagged for removal in a later cleanup
   * migration — kept on the type so existing destructures don't
   * break.
   */
  role: string;
  /**
   * Opted-in beta feature keys for this account. The column survives
   * for future beta gates; no current feature reads it (Flows was
   * the last user and went to soft-GA in PR #134). Defaults to `[]`
   * for every profile; toggled per-account via a direct UPDATE on
   * the `profiles` row.
   */
  beta_features?: string[];
  /**
   * Account this profile is a member of. Added by
   * `017_account_sharing.sql`; NOT NULL in the DB post-backfill.
   * Optional on the type only because older serialised payloads
   * (cached client state, test fixtures) may not have it yet.
   */
  account_id?: string;
  /**
   * Caller's role within their account. Source of truth for every
   * role-gated UI / API check — call `hasMinRole` from
   * `@/lib/auth/roles` rather than comparing this string directly.
   */
  account_role?: AccountRole;
  is_super_admin?: boolean;
  created_at: string;
}

// ============================================================
// Commercial plans entities (031_commercial_plans.sql)
// ============================================================

export type PlanStatus = 'active' | 'inactive';
export type BillingPeriod = 'monthly' | 'yearly' | 'one_time' | 'none';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended' | 'read_only';

export interface PlanFeatures {
  max_users?: number;
  max_contacts?: number;
  max_flows?: number;
  max_nodes_per_flow?: number;
  max_kanban_funnels?: number;
  max_boards?: number;
  max_broadcasts_per_campaign?: number;
  max_whatsapp_connections?: number;
  allow_scheduling?: boolean;
  allow_reports?: boolean;
  allow_webhooks?: boolean;
  allow_ai_agent?: boolean;
  allow_canvas_automations?: boolean;
  [key: string]: unknown;
}

export interface CommercialPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  price_monthly?: number;
  price_yearly?: number;
  billing_period: BillingPeriod;
  trial_days: number;
  status: PlanStatus;
  features: PlanFeatures;
  monthly_compute_credits?: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  account_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle?: 'monthly' | 'yearly';
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  canceled_at?: string | null;
  asaas_subscription_id?: string | null;
  asaas_customer_id?: string | null;
  metadata?: Record<string, unknown>;
  plan?: CommercialPlan;
  created_at: string;
  updated_at: string;
}

export interface AccountAddon {
  id: string;
  account_id: string;
  name: string;
  feature_key: string;
  quantity: number;
  unit_price: number;
  status: 'active' | 'canceled';
  asaas_subscription_item_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  account_id: string;
  subscription_id?: string | null;
  asaas_payment_id?: string | null;
  asaas_invoice_id?: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'canceled' | 'refunded' | 'overdue';
  billing_type?: string | null;
  invoice_number?: string | null;
  pdf_url?: string | null;
  xml_url?: string | null;
  bank_slip_url?: string | null;
  paid_at?: string | null;
  created_at: string;
}

// ============================================================
// Account-sharing entities (017_account_sharing.sql)
// ============================================================

export interface Account {
  id: string;
  name: string;
  /** auth.users.id of the immutable owner. */
  owner_user_id?: string;
  plan_id?: string | null;
  subscription_status?: SubscriptionStatus;
  scheduled_deletion_at?: string | null;
  trial_ends_at?: string | null;
  cpf_cnpj?: string | null;
  company_name?: string | null;
  phone?: string | null;
  postal_code?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  asaas_customer_id?: string | null;
  plan?: CommercialPlan;
  subscription?: Subscription;
  addons?: AccountAddon[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Hydrated member row for the Settings → Members tab. Combines
 * the profile and its account_role for a single member of the
 * caller's account. Sensitive fields (email) are populated only
 * when the caller has admin+ — agents and viewers see name +
 * avatar + role only.
 */
export interface AccountMember {
  user_id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  role: AccountRole;
  joined_at: string;
}

/**
 * Outstanding invite link row. `token_hash` is intentionally
 * absent — it lives only in the DB and on the server. The
 * plaintext token is returned once at creation time and surfaced
 * via the invite URL; never re-emitted.
 */
export interface AccountInvitation {
  id: string;
  account_id: string;
  /** Roles offered via invite — owner is never offered. */
  role: Exclude<AccountRole, "owner">;
  created_by_user_id: string | null;
  label: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
}

export interface Contact {
  id: string;
  user_id: string;
  account_id: string;
  phone: string;
  /** Digits-only form of `phone`, generated by the DB (migration 022)
   *  and unique per account. Read-only. */
  phone_normalized?: string;
  name?: string;
  email?: string;
  company?: string;
  avatar_url?: string;
  opt_out?: boolean;
  opt_out_at?: string | null;
  consent_status?: 'opted_in' | 'opted_out' | 'revoked';
  consent_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ContactTag {
  id: string;
  contact_id: string;
  tag_id: string;
}

export interface CustomField {
  id: string;
  user_id: string;
  /** Tenancy key — NOT NULL since migration 017. */
  account_id: string;
  field_name: string;
  field_type: string;
  field_options?: Record<string, unknown>;
  created_at: string;
}

export interface ContactCustomValue {
  id: string;
  contact_id: string;
  custom_field_id: string;
  value?: string;
}

export interface ContactNote {
  id: string;
  contact_id: string;
  user_id: string;
  note_text: string;
  created_at: string;
}

export type ConversationStatus = 'open' | 'pending' | 'closed';

export interface Conversation {
  id: string;
  user_id: string;
  contact_id: string;
  status: ConversationStatus;
  assigned_agent_id?: string;
  ai_handler_status?: 'ai' | 'human';
  ai_handoff_at?: string | null;
  ai_handoff_reason?: string | null;
  last_message_text?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export type SenderType = 'customer' | 'agent' | 'bot';
export type ContentType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'template'
  /** Customer tapped a reply button or list row on a message we sent. */
  | 'interactive';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MediaStatus = 'pending' | 'processing' | 'stored' | 'failed' | 'expired';
export type MediaSource = 'whatsapp_inbound' | 'whatsapp_outbound' | 'manual_upload' | 'automation';

export interface MediaHealthMetrics {
  storedCount: number;
  pendingCount: number;
  processingCount: number;
  failedCount: number;
  expiredCount: number;
  totalSizeMaxBytes?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_id?: string;
  content_type: ContentType;
  content_text?: string;
  media_url?: string;
  template_name?: string;
  message_id?: string;
  status: MessageStatus;
  created_at: string;
  reply_to_message_id?: string;
  /**
   * Only set when `content_type === 'interactive'` — the stable id of
   * the button or list row the customer tapped. The Flows engine uses
   * this to route the next node; the inbox bubble uses it as a styling
   * cue (renders with a "↩ button reply" affordance).
   */
  interactive_reply_id?: string;
  /** Media lifecycle and storage management (migration 055) */
  media_status?: MediaStatus;
  media_source?: MediaSource;
  media_storage_path?: string;
  media_storage_provider?: string;
  media_meta_id?: string;
  media_mime_type?: string;
  media_size_bytes?: number;
  media_hash?: string;
  media_retry_count?: number;
  media_next_retry_at?: string;
  locked_until?: string | null;
  media_error_message?: string;
}

export type ReactionActor = 'customer' | 'agent';

export interface MessageReaction {
  id: string;
  message_id: string;
  conversation_id: string;
  actor_type: ReactionActor;
  actor_id?: string;
  emoji: string;
  created_at: string;
}

export interface WhatsAppConfig {
  id: string;
  user_id: string;
  phone_number_id: string;
  waba_id?: string;
  access_token: string;
  verify_token?: string;
  label?: string;
  is_default?: boolean;
  status: 'connected' | 'disconnected';
  connected_at?: string;
  /**
   * Set when POST /{phone_number_id}/register last succeeded. NULL
   * means the number was saved but never actually subscribed for
   * webhooks on Meta's side — inbound events will be silently lost.
   */
  registered_at?: string;
  /** Set when POST /{waba_id}/subscribed_apps last succeeded. */
  subscribed_apps_at?: string;
  /** Last error from /register; cleared on success. */
  last_registration_error?: string;
}

// Raw Meta status enum. We persist this verbatim from Meta (sync + webhook)
// rather than collapsing to a local TitleCase set — distinctions like
// PAUSED vs DISABLED vs IN_APPEAL drive the edit/resubmit/delete flows.
// DRAFT is the local-only state before the row is submitted to Meta.
export type MessageTemplateStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | 'IN_APPEAL'
  | 'PENDING_DELETION';

export type TemplateButton =
  | { type: 'QUICK_REPLY'; text: string }
  | { type: 'URL'; text: string; url: string; example?: string }
  | { type: 'PHONE_NUMBER'; text: string; phone_number: string }
  | { type: 'COPY_CODE'; text: string; example: string };

export interface TemplateSampleValues {
  body?: string[];
  header?: string[];
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  category: 'Marketing' | 'Utility' | 'Authentication';
  language?: string;
  header_type?: 'text' | 'image' | 'video' | 'document';
  header_content?: string;
  header_handle?: string;
  header_media_url?: string;
  body_text: string;
  footer_text?: string;
  buttons?: TemplateButton[];
  sample_values?: TemplateSampleValues;
  status?: MessageTemplateStatus;
  meta_template_id?: string;
  rejection_reason?: string;
  quality_score?: 'GREEN' | 'YELLOW' | 'RED';
  submission_error?: string;
  last_submitted_at?: string;
  created_at: string;
}

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
}

export type DealStatus = 'open' | 'won' | 'lost';

export interface Deal {
  id: string;
  user_id: string;
  pipeline_id: string;
  stage_id: string;
  /**
   * Nullable after migration 004 — becomes NULL when the referenced
   * contact is deleted (ON DELETE SET NULL). History preserved.
   */
  contact_id: string | null;
  conversation_id?: string;
  assigned_to?: string;
  title: string;
  value: number;
  currency?: string;
  notes?: string;
  expected_close_date?: string;
  status?: DealStatus;
  created_at: string;
  updated_at?: string;
  contact?: Contact;
  stage?: PipelineStage;
  assignee?: Profile;
}

export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

// ============================================================
// Conversation board module (027_conversation_boards.sql)
// ============================================================

export type ConversationBoardLane =
  | 'partners'
  | 'franchisees'
  | 'jobs'
  | 'direct'
  | 'other';

export interface ConversationBoardLaneConfig {
  id: string;
  account_id: string;
  board_id: string;
  lane_key: string;
  name: string;
  color: string;
  position: number;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationBoardGroup {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PipelineMember {
  id: string;
  account_id: string;
  pipeline_id: string;
  user_id: string;
  created_at: string;
}

export interface ConversationBoardMember {
  id: string;
  account_id: string;
  board_id: string;
  user_id: string;
  created_at: string;
}

export interface ConversationBoard {
  id: string;
  account_id: string;
  group_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  is_default: boolean;
  position: number;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
  group?: ConversationBoardGroup | null;
  lanes?: ConversationBoardLaneConfig[];
  members?: ConversationBoardMember[];
}

export interface ConversationBoardItem {
  id: string;
  account_id: string;
  board_id: string;
  conversation_id: string;
  lane_id: string;
  lane: ConversationBoardLane;
  position: number;
  priority_rank: number;
  priority_reason?: string | null;
  priority_set_at?: string | null;
  priority_set_by_user_id?: string | null;
  awaiting_return: boolean;
  awaiting_return_reason?: string | null;
  awaiting_return_set_at?: string | null;
  awaiting_return_set_by_user_id?: string | null;
  awaiting_return_cleared_at?: string | null;
  awaiting_return_cleared_by_user_id?: string | null;
  mention_active: boolean;
  mention_set_at?: string | null;
  mention_set_by_user_id?: string | null;
  mention_cleared_at?: string | null;
  mention_cleared_by_user_id?: string | null;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
  conversation?: Conversation;
  lane_config?: ConversationBoardLaneConfig;
}

export interface ConversationBoardLabel {
  id: string;
  account_id: string;
  name: string;
  slug: string;
  color: string;
  description?: string | null;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationBoardItemLabel {
  id: string;
  account_id: string;
  board_item_id: string;
  label_id: string;
  created_by_user_id?: string | null;
  created_at: string;
}

export interface ConversationMention {
  id: string;
  account_id: string;
  board_item_id: string;
  conversation_id: string;
  message_id: string;
  mentioned_user_id: string;
  mention_text?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by_user_id?: string | null;
  created_at: string;
}
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'replied' | 'failed';

export interface Broadcast {
  id: string;
  user_id: string;
  name: string;
  template_name: string;
  template_language: string;
  template_variables?: Record<string, unknown>;
  audience_filter?: Record<string, unknown>;
  scheduled_at?: string;
  status: BroadcastStatus;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  replied_count: number;
  failed_count: number;
  created_at: string;
}

export interface BroadcastRecipient {
  id: string;
  broadcast_id: string;
  /**
   * Nullable after migration 004 — becomes NULL when the referenced
   * contact is deleted (ON DELETE SET NULL). History preserved; the
   * UI renders "Unknown" for orphaned rows.
   */
  contact_id: string | null;
  status: RecipientStatus;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  replied_at?: string;
  error_message?: string;
  /**
   * Meta's message id, persisted when the broadcast send succeeds so
   * the webhook can mirror status updates back onto the recipient row.
   * Added in migration 003.
   */
  whatsapp_message_id?: string;
  created_at: string;
  contact?: Contact;
}

// ============================================================
// Automations (migration 006)
// ============================================================

export type AutomationTriggerType =
  | 'new_message_received'
  | 'first_inbound_message'
  | 'keyword_match'
  | 'new_contact_created'
  | 'conversation_assigned'
  | 'tag_added'
  | 'time_based';

export type AutomationStepType =
  | 'send_message'
  | 'send_template'
  | 'add_tag'
  | 'remove_tag'
  | 'assign_conversation'
  | 'assign_board'
  | 'update_contact_field'
  | 'create_deal'
  | 'wait'
  | 'condition'
  | 'send_webhook'
  | 'close_conversation';

export type AutomationLogStatus = 'success' | 'partial' | 'failed';

export interface KeywordMatchTriggerConfig {
  keywords: string[];
  match_type: 'exact' | 'contains';
  case_sensitive?: boolean;
}

export interface TagTriggerConfig {
  tag_id: string;
}

export interface TimeBasedTriggerConfig {
  /** Cron expression or simple HH:mm string; engine can accept either. */
  schedule: string;
  timezone?: string;
}

export type AutomationTriggerConfig =
  | Record<string, never>
  | KeywordMatchTriggerConfig
  | TagTriggerConfig
  | TimeBasedTriggerConfig
  | Record<string, unknown>;

export interface SendMessageStepConfig {
  text: string;
}

export interface SendTemplateStepConfig {
  template_name: string;
  language?: string;
  variables?: Record<string, string>;
}

export interface TagStepConfig {
  tag_id: string;
}

export interface AssignConversationStepConfig {
  mode: 'specific' | 'round_robin';
  agent_id?: string;
}

export interface UpdateContactFieldStepConfig {
  /**
   * Either a built-in contact column (`name` | `email` | `company`) or a
   * custom field encoded as `custom:<custom_field_id>`. The `custom:` prefix
   * is how the engine distinguishes a `contact_custom_values` write from a
   * direct `contacts` column update. Older configs store the bare column name,
   * so this stays backward compatible.
   */
  field: string;
  /** Supports `{{ vars.* }}` / `{{ message.text }}` interpolation at runtime. */
  value: string;
}

export interface CreateDealStepConfig {
  pipeline_id: string;
  stage_id: string;
  title: string;
  value?: number;
}

export interface WaitStepConfig {
  amount: number;
  unit: 'minutes' | 'hours' | 'days';
}

export type ConditionSubject =
  | 'contact_field'
  | 'tag_presence'
  | 'message_content'
  | 'time_of_day';

export interface ConditionStepConfig {
  subject: ConditionSubject;
  /** e.g. field name, tag id, substring, or "HH:mm-HH:mm" depending on subject */
  operand?: string;
  /** For contact_field equals / message_content contains — comparison value */
  value?: string;
}

export interface SendWebhookStepConfig {
  url: string;
  headers?: Record<string, string>;
  body_template?: string;
}

export interface AssignBoardStepConfig {
  board_id: string;
  lane_id?: string;
  lane_key?: string;
}

export type AutomationStepConfig =
  | SendMessageStepConfig
  | SendTemplateStepConfig
  | TagStepConfig
  | AssignConversationStepConfig
  | AssignBoardStepConfig
  | UpdateContactFieldStepConfig
  | CreateDealStepConfig
  | WaitStepConfig
  | ConditionStepConfig
  | SendWebhookStepConfig
  | Record<string, never>
  | Record<string, unknown>;

export interface Automation {
  id: string;
  /** Account tenancy key — every automation belongs to one account
   *  (migration 017 made the column NOT NULL). The engine looks up
   *  active automations by this field on inbound webhook events. */
  account_id: string;
  /** Original author. Used for log audit + outbound message
   *  sender-of-record, never for tenancy isolation. */
  user_id: string;
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  trigger_config: AutomationTriggerConfig;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationStep {
  id: string;
  automation_id: string;
  parent_step_id?: string | null;
  branch?: 'yes' | 'no' | null;
  step_type: AutomationStepType;
  step_config: AutomationStepConfig;
  position: number;
  created_at: string;
}

export interface AutomationLogStepResult {
  step_id: string;
  step_type: AutomationStepType;
  status: 'success' | 'skipped' | 'failed';
  detail?: string;
}

export interface AutomationLog {
  id: string;
  automation_id: string;
  user_id: string;
  contact_id: string | null;
  trigger_event: string;
  steps_executed: AutomationLogStepResult[];
  status: AutomationLogStatus;
  error_message?: string | null;
  created_at: string;
  contact?: Contact;
}

// ============================================================
// Onboarding & Product Intelligence Types
// ============================================================

export type OnboardingStepKey =
  | 'connect_whatsapp'
  | 'create_first_flow'
  | 'import_contacts'
  | 'create_first_campaign'
  | 'send_first_campaign'
  | 'invite_team';

export interface OnboardingStepProgress {
  step_key: OnboardingStepKey;
  completed: boolean;
  completed_at?: string | null;
  skipped: boolean;
  action_url: string;
}

export interface OnboardingJourneySummary {
  account_id: string;
  user_id: string;
  total_steps: number;
  completed_steps: number;
  percentage: number;
  is_fully_configured: boolean;
  steps: OnboardingStepProgress[];
}

export interface UserEventPayload {
  event_name: string;
  event_data?: Record<string, unknown>;
  page_url?: string;
  session_id?: string;
}

export interface OnboardingAnalyticsSummary {
  total_users: number;
  started_onboarding: number;
  completed_onboarding: number;
  completion_rate: number;
  step_breakdown: Record<OnboardingStepKey, {
    total_started: number;
    completed: number;
    skipped: number;
  }>;
  feature_usage_30d: Record<string, number>;
}

// ============================================================
// Motor de Consumo Computacional & Telemetria (039)
// ============================================================

export type ResourceType =
  | 'whatsapp_message'
  | 'ai_execution'
  | 'audio_transcription'
  | 'automation_execution'
  | 'webhook_dispatch'
  | 'pdf_generation'
  | 'ocr_scan'
  | (string & {});

export interface CreditWeight {
  resource_type: ResourceType;
  credit_weight: number;
  description: string;
  unit_cost_estimate: number;
  status: 'active' | 'inactive';
  updated_at: string;
}

export interface UsageEvent {
  id: string;
  account_id: string;
  resource_type: ResourceType;
  quantity: number;
  compute_credits: number;
  estimated_cost: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ResourceUsageBreakdown {
  resource_type: ResourceType;
  total_quantity: number;
  total_credits: number;
  total_estimated_cost: number;
}

export interface AccountConsumptionSummary {
  account_id: string;
  plan_name: string;
  monthly_allowance_credits: number;
  total_credits_used: number;
  remaining_credits: number;
  usage_percentage: number;
  total_estimated_cost: number;
  daily_average_credits: number;
  breakdown_by_resource: ResourceUsageBreakdown[];
}

export interface FairUseAccountFlag {
  account_id: string;
  account_name: string;
  plan_name: string;
  total_credits_used: number;
  monthly_allowance_credits: number;
  plan_average_credits: number;
  z_score: number;
  status: 'normal' | 'high' | 'critical_fair_use';
}

export interface SuperAdminConsumptionIntelligence {
  total_accounts_monitored: number;
  total_credits_consumed_30d: number;
  total_estimated_cost_30d: number;
  average_cost_per_account: number;
  top_cost_resources: ResourceUsageBreakdown[];
  fair_use_flags: FairUseAccountFlag[];
}

export interface AICommercialInsight {
  title: string;
  category: 'pricing' | 'quota' | 'fair_use' | 'cost_optimization';
  severity: 'info' | 'warning' | 'critical';
  summary: string;
  recommended_action: string;
  estimated_financial_impact: string;
}

// ============================================================
// Atendimento Colaborativo & Motor de Eventos (052)
// ============================================================

export type ConversationParticipantRole = 'owner' | 'participant' | 'observer';

export interface ConversationParticipant {
  id: string;
  account_id: string;
  conversation_id: string;
  user_id: string;
  role: ConversationParticipantRole;
  joined_at: string;
  profile?: Profile;
}

export interface InternalNote {
  id: string;
  account_id: string;
  conversation_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  author_profile?: Profile;
  reactions?: InternalReaction[];
}

export type NotificationType = 'mention' | 'assignment' | 'help_request' | 'task' | 'response';

export interface Notification {
  id: string;
  account_id: string;
  user_id: string;
  actor_id?: string | null;
  conversation_id?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  actor_profile?: Profile;
}

export interface ConversationTimelineEvent {
  id: string;
  account_id: string;
  conversation_id: string;
  author_id?: string | null;
  event_type: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  author_profile?: Profile;
}

export interface InternalReaction {
  id: string;
  account_id: string;
  conversation_id: string;
  target_type: 'message' | 'note';
  target_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user_profile?: Profile;
}

export type MessageTagType = 'Importante' | 'Resolver hoje' | 'Aguardando cliente' | 'Aguardando setor' | (string & {});

export interface MessageTag {
  id: string;
  account_id: string;
  conversation_id: string;
  message_id: string;
  user_id: string;
  tag: MessageTagType;
  created_at: string;
}

export interface ResponseReservation {
  id: string;
  account_id: string;
  conversation_id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  user_profile?: Profile;
}

export type ParticipantActivityState = 'viewing' | 'typing' | 'preparing_response' | 'writing_note' | 'idle';

export interface ParticipantPresenceState {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  role?: ConversationParticipantRole;
  activity: ParticipantActivityState;
  last_active_at: string;
}

export interface ResponseReservationState {
  is_reserved: boolean;
  reserved_by_user_id?: string;
  reserved_by_name?: string;
  expires_at?: string;
}

export type CollaborativeEventType =
  | 'message_sent'
  | 'internal_note_created'
  | 'internal_note_updated'
  | 'internal_note_deleted'
  | 'collaborator_mentioned'
  | 'participant_added'
  | 'participant_removed'
  | 'owner_changed'
  | 'help_requested'
  | 'reaction_added'
  | 'reaction_removed'
  | 'message_tagged'
  | 'message_untagged'
  | 'response_reservation_created'
  | 'response_reservation_released';

export interface CollaborativeEventContext {
  account_id: string;
  conversation_id: string;
  actor_id: string;
  actor_name?: string;
}

export interface CollaborativeEventPayloadMap {
  message_sent: { message_id: string; content_text: string; sender_type: string };
  internal_note_created: { note_id?: string; content: string; mentions?: string[] };
  internal_note_updated: { note_id: string; previous_content?: string; new_content: string };
  internal_note_deleted: { note_id: string; deleted_content?: string };
  collaborator_mentioned: { mentioned_user_id: string; note_id?: string; message_id?: string; snippet: string };
  participant_added: { target_user_id: string; target_user_name?: string; role: ConversationParticipantRole };
  participant_removed: { target_user_id: string; target_user_name?: string };

  owner_changed: { old_owner_id?: string | null; new_owner_id: string };
  help_requested: { target_sector?: string; target_user_id?: string; note?: string };
  reaction_added: { target_type: 'message' | 'note'; target_id: string; emoji: string };
  reaction_removed: { target_type: 'message' | 'note'; target_id: string; emoji: string };
  message_tagged: { message_id: string; tag: MessageTagType };
  message_untagged: { message_id: string; tag: MessageTagType };
  response_reservation_created: { duration_seconds: number };
  response_reservation_released: { reason?: string };
}

export interface CollaborativeEvent<T extends CollaborativeEventType = CollaborativeEventType> {
  type: T;
  context: CollaborativeEventContext;
  payload: CollaborativeEventPayloadMap[T];
  created_at?: string;
}

export interface CollaborativeEventResult {
  success: boolean;
  event_type: CollaborativeEventType;
  persisted_ids?: {
    note_id?: string;
    participant_id?: string;
    notification_ids?: string[];
    timeline_event_id?: string;
    reaction_id?: string;
    tag_id?: string;
    reservation_id?: string;
  };
  error?: string;
}

