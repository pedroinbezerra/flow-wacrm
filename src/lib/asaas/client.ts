/**
 * Asaas API Client (v3)
 * Integration for subscription billing, customer management, webhooks, and NF-e/NFSe.
 */

export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
}

export interface AsaasCustomerResponse {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
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

function getAsaasApiKey(): string {
  const rawKey = process.env.ASAAS_API_KEY || "";
  const cleanedKey = rawKey.replace(/^['"]|['"]$/g, "").replace(/\\(?=\$)/g, "").trim();

  if (!cleanedKey) {
    console.error("[Asaas Client] ASAAS_API_KEY is empty. Available ASAAS env vars:", 
      Object.keys(process.env).filter((k) => k.startsWith("ASAAS"))
    );
  }

  return cleanedKey;
}

function getAsaasBaseUrl(): string {
  const rawUrl = process.env.ASAAS_BASE_URL || "https://api.asaas.com/v3";
  return rawUrl.replace(/^['"]|['"]$/g, "").replace(/\/$/, "").trim();
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
  const apiKey = getAsaasApiKey();

  if (!apiKey) {
    throw new AsaasError("Asaas API key is missing in environment variables (ASAAS_API_KEY).");
  }

  const baseUrl = getAsaasBaseUrl();
  const url = `${baseUrl}/${endpoint.replace(/^\//, "")}`;
  const userAgent = (process.env.ASAAS_USER_AGENT || "sgc").replace(/^['"]|['"]$/g, "").trim();

  const headers = new Headers(options.headers || {});
  headers.set("access_token", apiKey);
  headers.set("User-Agent", userAgent);
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
 * Find or Create a Customer in Asaas (and update details if existing)
 */
export async function getOrCreateAsaasCustomer(input: AsaasCustomerInput): Promise<AsaasCustomerResponse> {
  let existing: AsaasCustomerResponse | null = null;

  // 1. First, search by cpfCnpj if provided
  if (input.cpfCnpj) {
    const cleanCpfCnpj = input.cpfCnpj.replace(/\D/g, "");
    if (cleanCpfCnpj) {
      const searchRes = await asaasFetch<{ data: AsaasCustomerResponse[] }>(
        `/customers?cpfCnpj=${encodeURIComponent(cleanCpfCnpj)}`
      );
      if (searchRes.data && searchRes.data.length > 0) {
        existing = searchRes.data[0];
      }
    }
  }

  // 2. Fallback search by email
  if (!existing && input.email) {
    const searchRes = await asaasFetch<{ data: AsaasCustomerResponse[] }>(
      `/customers?email=${encodeURIComponent(input.email)}`
    );
    if (searchRes.data && searchRes.data.length > 0) {
      existing = searchRes.data[0];
    }
  }

  // If customer exists, update customer details in Asaas to keep CPF/CNPJ & address current
  if (existing) {
    try {
      const updated = await asaasFetch<AsaasCustomerResponse>(`/customers/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      });
      return updated;
    } catch (updErr) {
      console.warn(`[Asaas Client] Could not update customer ${existing.id}, returning existing:`, updErr);
      return existing;
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

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

/**
 * Fetch PIX QR Code & Copia e Cola for a specific payment
 */
export async function getAsaasPaymentPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse | null> {
  try {
    return await asaasFetch<AsaasPixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`);
  } catch (err) {
    console.error("Failed to fetch PIX QR Code:", err);
    return null;
  }
}

/**
 * Fetch the first pending payment of a subscription.
 */
export async function getAsaasSubscriptionFirstPayment(subscriptionId: string): Promise<AsaasPaymentResponse | null> {
  try {
    const res = await asaasFetch<{ data: AsaasPaymentResponse[] }>(
      `/payments?subscription=${encodeURIComponent(subscriptionId)}&status=PENDING`
    );
    if (res.data && res.data.length > 0) {
      return res.data[0];
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch subscription first payment:", err);
    return null;
  }
}

/**
 * Fetch the payment URL / invoice URL for the first pending payment of a subscription.
 */
export async function getAsaasSubscriptionFirstPaymentUrl(subscriptionId: string): Promise<string | null> {
  const firstPayment = await getAsaasSubscriptionFirstPayment(subscriptionId);
  return firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || null;
}
