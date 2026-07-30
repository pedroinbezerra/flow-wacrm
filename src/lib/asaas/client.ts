/**
 * Asaas API Client (v3)
 * Integration for subscription billing, customer management, webhooks, and NF-e/NFSe.
 */

const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";
const ASAAS_USER_AGENT = process.env.ASAAS_USER_AGENT || "FlowHub-CRM";

export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
}

export interface AsaasCustomerResponse {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
  deleted?: boolean;
}

export interface AsaasSubscriptionInput {
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  nextDueDate: string; // YYYY-MM-DD
  cycle: "MONTHLY" | "YEARLY" | "WEEKLY" | "QUARTERLY" | "SEMIANNUALLY";
  description?: string;
  externalReference?: string;
}

export interface AsaasSubscriptionResponse {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  billingType: string;
  description?: string;
  externalReference?: string;
}

export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  subscription?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  billingType: string;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED" | "CHARGEBACK_REQUESTED" | "CHARGEBACK_DISPUTE" | "AWAITING_CHARGEBACK_REVERSAL" | "DUNNING_REQUESTED" | "DUNNING_RECEIVED" | "AWAITING_RISK_ANALYSIS";
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
}

class AsaasError extends Error {
  public errors?: Array<{ code: string; description: string }>;
  constructor(message: string, errors?: Array<{ code: string; description: string }>) {
    super(message);
    this.name = "AsaasError";
    this.errors = errors;
  }
}

async function asaasFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!ASAAS_API_KEY) {
    throw new AsaasError("Asaas API key is missing in environment variables (ASAAS_API_KEY).");
  }

  const url = `${ASAAS_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers = new Headers(options.headers || {});
  headers.set("access_token", ASAAS_API_KEY);
  headers.set("User-Agent", ASAAS_USER_AGENT);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.errors?.[0]?.description || `Asaas API Request Failed (${response.status})`;
    throw new AsaasError(errorMsg, data?.errors);
  }

  return data as T;
}

/**
 * Find or Create a Customer in Asaas
 */
export async function getOrCreateAsaasCustomer(input: AsaasCustomerInput): Promise<AsaasCustomerResponse> {
  // First, search by externalReference or email
  if (input.email) {
    const searchRes = await asaasFetch<{ data: AsaasCustomerResponse[] }>(
      `/customers?email=${encodeURIComponent(input.email)}`
    );
    if (searchRes.data && searchRes.data.length > 0) {
      return searchRes.data[0];
    }
  }

  // Create new customer
  return asaasFetch<AsaasCustomerResponse>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Create a new Subscription in Asaas
 */
export async function createAsaasSubscription(input: AsaasSubscriptionInput): Promise<AsaasSubscriptionResponse> {
  return asaasFetch<AsaasSubscriptionResponse>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Cancel a Subscription in Asaas
 */
export async function cancelAsaasSubscription(subscriptionId: string): Promise<{ id: string; deleted: boolean }> {
  return asaasFetch<{ id: string; deleted: boolean }>(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });
}

/**
 * Fetch details of a specific Payment
 */
export async function getAsaasPayment(paymentId: string): Promise<AsaasPaymentResponse> {
  return asaasFetch<AsaasPaymentResponse>(`/payments/${paymentId}`);
}
