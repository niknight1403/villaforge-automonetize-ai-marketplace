/**
 * VillaForge PayKit — Monetarisierungs-Kernmodul.
 * Phase 2 (BACKEND_READY): typsicher via JSDoc, Storage-injiziert (SQLite/InMemory),
 * Stripe-Anbindung via REST ohne SDK-Abhaengigkeiten, Sandbox-Modus ohne Live-Keys.
 * Guardrail: Live-Zahlungen nur mit Owner-Freigabe; Keys nur aus Hub-Secret-Store.
 */
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

/** @typedef {{ product_id: string, name: string, price_cents: number, currency: string }} Product */
/** @typedef {{ id: number, product_id: string, buyer_email: string, price_cents: number, currency: string, status: 'pending'|'paid'|'failed', session_id: string, license_key: string|null, created_at: number, paid_at: number|null }} Checkout */
/** @typedef {{ license_key: string, product_id: string, plan: string, issued_at: number }} License */
/** @typedef {{ cents: number, ts: number }} Payment */

export class ValidationError extends Error { constructor(m) { super(m); this.name = 'ValidationError'; } }
export class SignatureError extends Error { constructor(m) { super(m); this.name = 'SignatureError'; } }
export class StripeError extends Error { constructor(m) { super(m); this.name = 'StripeError'; } }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const assert = (c, m) => { if (!c) throw new ValidationError(m); };

/**
 * @param {{ storage: object, stripeKey?: string, webhookSecret?: string, fetchImpl?: typeof fetch }} opts
 * @returns {{ createCheckout: Function, handleWebhook: Function, validateLicense: Function, mrr: Function, mode: 'live'|'sandbox' }}
 */
export function createPayKit({ storage, stripeKey = '', webhookSecret = '', fetchImpl = fetch }) {
  const live = Boolean(stripeKey && webhookSecret);

  async function createCheckout({ product_id, price_cents, currency = 'eur', buyer_email, name, success_url = '', cancel_url = '' }) {
    assert(typeof product_id === 'string' && product_id.length >= 2, 'product_id ungueltig');
    assert(Number.isInteger(price_cents) && price_cents >= 100, 'price_cents muss >= 100 sein');
    assert(/^[a-z]{3}$/i.test(currency), 'currency: 3-Buchstaben-ISO');
    assert(EMAIL_RE.test(String(buyer_email || '')), 'buyer_email ungueltig');

    if (!live) {
      const session_id = `sbx_${randomBytes(12).toString('hex')}`;
      await storage.saveCheckout({ product_id, buyer_email, price_cents, currency, status: 'pending', session_id, license_key: null, created_at: Date.now(), paid_at: null });
      const checkout_url = success_url ? `${success_url}${success_url.includes('?') ? '&' : '?'}sandbox=1&session=${session_id}` : null;
      return { session_id, checkout_url, live: false };
    }
    assert(success_url.startsWith('https://'), 'success_url (https) im Live-Modus noetig');
    const body = new URLSearchParams({
      mode: 'payment',
      customer_email: buyer_email,
      success_url, cancel_url: cancel_url || success_url,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': currency,
      'line_items[0][price_data][unit_amount]': String(price_cents),
      'line_items[0][price_data][product_data][name]': name || product_id
    });
    const res = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!res.ok) throw new StripeError(`Stripe HTTP ${res.status}`);
    const session = await res.json();
    await storage.saveCheckout({ product_id, buyer_email, price_cents, currency, status: 'pending', session_id: session.id, license_key: null, created_at: Date.now(), paid_at: null });
    return { session_id: session.id, checkout_url: session.url, live: true };
  }

  function verifySignature(payload, sigHeader) {
    const parts = Object.fromEntries(String(sigHeader || '').split(',').map((kv) => kv.split('=')));
    const t = Number(parts.t); const v1 = parts.v1 || '';
    assert(Number.isInteger(t) && v1, 'Stripe-Signatur fehlt');
    if (Math.abs(Date.now() / 1000 - t) > 300) throw new SignatureError('Webhook zu alt (>5 min)');
    const expected = createHmac('sha256', webhookSecret).update(`${t}.${payload}`).digest('hex');
    const ok = Buffer.from(expected).length === Buffer.from(v1).length
      && timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
    if (!ok) throw new SignatureError('Webhook-Signatur ungueltig');
  }

  async function handleWebhook(payload, sigHeader) {
    if (live) verifySignature(String(payload), sigHeader);
    const event = JSON.parse(String(payload));
    if (event.type !== 'checkout.session.completed') return { handled: false, reason: `ignoriert: ${event.type}` };
    const sessionId = event?.data?.object?.id;
    const row = await storage.markPaid(sessionId, Date.now());
    if (!row) return { handled: false, reason: 'unbekannte Session' };
    if (row.license_key) return { handled: true, idempotent: true, license_key: row.license_key };
    const license = await storage.saveLicense({ license_key: `pk_${row.product_id}_${randomBytes(16).toString('hex')}`, product_id: row.product_id, plan: 'pro', issued_at: Date.now() });
    await storage.attachLicense(sessionId, license.license_key);
    await storage.recordPayment({ product_id: row.product_id, cents: row.price_cents, currency: row.currency, ts: Date.now() });
    return { handled: true, license_key: license.license_key };
  }

  async function validateLicense(license_key, product_id) {
    const lic = await storage.getLicense(String(license_key || ''));
    const valid = Boolean(lic && (!product_id || lic.product_id === product_id));
    return { valid, plan: valid ? lic.plan : null };
  }

  async function mrr() {
    const payments = await storage.paymentsSince(Date.now() - 30 * 24 * 3600 * 1000);
    const mrr_30d_cents = payments.reduce((a, p) => a + p.cents, 0);
    return {
      mrr_30d_cents,
      payments_30d: payments.length,
      avg_payment_cents: payments.length ? Math.round(mrr_30d_cents / payments.length) : 0
    };
  }

  return { createCheckout, handleWebhook, validateLicense, mrr, mode: live ? 'live' : 'sandbox' };
}

/** InMemory-Storage fuer Tests und Sandbox-Betrieb. */
export class InMemoryStorage {
  constructor() { this.checkouts = []; this.licenses = []; this.payments = []; }
  async saveCheckout(c) { c.id = this.checkouts.length + 1; this.checkouts.push(c); return c; }
  async markPaid(session_id, paid_at) {
    const row = this.checkouts.find((c) => c.session_id === session_id);
    if (!row) return null; row.status = 'paid'; row.paid_at = paid_at; return row;
  }
  async saveLicense(l) { this.licenses.push(l); return l; }
  async attachLicense(session_id, key) { const r = this.checkouts.find((c) => c.session_id === session_id); if (r) r.license_key = key; }
  async getLicense(key) { return this.licenses.find((l) => l.license_key === key) || null; }
  async recordPayment(p) { this.payments.push(p); }
  async paymentsSince(ts) { return this.payments.filter((p) => p.ts >= ts); }
}
