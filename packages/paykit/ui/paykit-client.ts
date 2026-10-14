/** Typsicherer PayKit-API-Client — Vertrag: packages/paykit/schema.json (Shared Registry). */
export interface CheckoutRequest {
  product_id: string; price_cents: number; currency?: string;
  buyer_email: string; name?: string; success_url?: string; cancel_url?: string;
}
export interface CheckoutResponse { session_id: string; checkout_url: string | null; live: boolean; }
export interface LicenseValidation { valid: boolean; plan: string | null; }
export interface Mrr { mrr_30d_cents: number; payments_30d: number; avg_payment_cents: number; }

export class PayKitClient {
  constructor(private baseUrl: string) {}

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PayKit HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  checkout(req: CheckoutRequest): Promise<CheckoutResponse> { return this.post('/paykit/checkout', req); }
  validate(license_key: string, product_id?: string): Promise<LicenseValidation> { return this.post('/paykit/license/validate', { license_key, product_id }); }
  mrr(): Promise<Mrr> { return fetch(`${this.baseUrl}/paykit/mrr`).then((r) => r.json() as Promise<Mrr>); }
}
