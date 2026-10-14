import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createPayKit, InMemoryStorage, ValidationError, SignatureError } from './paykit.mjs';

const mk = (opts = {}) => createPayKit({ storage: new InMemoryStorage(), webhookSecret: 'whsec_t', ...opts });

test('Sandbox-Checkout ohne Live-Keys erzeugt Session', async () => {
  const kit = mk();
  assert.equal(kit.mode, 'sandbox');
  const out = await kit.createCheckout({ product_id: 'push-pro', price_cents: 1900, buyer_email: 'a@b.de', success_url: 'https://x.de/ok' });
  assert.match(out.session_id, /^sbx_/);
  assert.ok(out.checkout_url.includes('sandbox=1'));
});

test('Ungueltige Eingaben werden abgewiesen (Edge Cases)', async () => {
  const kit = mk();
  await assert.rejects(kit.createCheckout({ product_id: 'xx', price_cents: 50, buyer_email: 'a@b.de' }), ValidationError);
  await assert.rejects(kit.createCheckout({ product_id: 'xx', price_cents: 1900, buyer_email: 'ungueltig' }), ValidationError);
  await assert.rejects(kit.createCheckout({ product_id: 'xx', price_cents: 1900, buyer_email: 'a@b.de', currency: 'euros' }), ValidationError);
});

test('Live-Modus: Stripe-Aufruf, signierter Webhook, Lizenz, MRR', async () => {
  const fetchMock = async () => ({ ok: true, json: async () => ({ id: 'cs_live_1', url: 'https://pay.stripe.com/1' }) });
  const kit = createPayKit({ storage: new InMemoryStorage(), stripeKey: 'sk_test_x', webhookSecret: 'whsec_t', fetchImpl: fetchMock });
  assert.equal(kit.mode, 'live');
  const co = await kit.createCheckout({ product_id: 'pp', price_cents: 900, buyer_email: 'a@b.de', success_url: 'https://x.de/ok' });
  assert.equal(co.live, true);
  const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: co.session_id } } });
  const t = Math.floor(Date.now() / 1000);
  const sig = `t=${t},v1=${createHmac('sha256', 'whsec_t').update(`${t}.${payload}`).digest('hex')}`;
  const res = await kit.handleWebhook(payload, sig);
  assert.equal(res.handled, true);
  assert.match(res.license_key, /^pk_pp_/);
  const v = await kit.validateLicense(res.license_key, 'pp');
  assert.deepEqual(v, { valid: true, plan: 'pro' });
  const m = await kit.mrr();
  assert.equal(m.mrr_30d_cents, 900);
  assert.equal(m.payments_30d, 1);
});

test('Webhook-Signaturfaelschung wird abgewiesen', async () => {
  const kit = createPayKit({ storage: new InMemoryStorage(), stripeKey: 'sk', webhookSecret: 'whsec_t' });
  const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_x' } } });
  await assert.rejects(kit.handleWebhook(payload, 't=1,v1=deadbeef'), SignatureError);
});

test('Doppelter Webhook bleibt idempotent (kein Doppel-Umsatz)', async () => {
  const kit = mk();
  const co = await kit.createCheckout({ product_id: 'dd', price_cents: 500, buyer_email: 'a@b.de' });
  const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: co.session_id } } });
  const r1 = await kit.handleWebhook(payload, null);
  const r2 = await kit.handleWebhook(payload, null);
  assert.equal(r1.handled, true);
  assert.equal(r2.idempotent, true);
  assert.equal((await kit.mrr()).payments_30d, 1);
});

test('Fremde Events und unbekannte Sessions werden ignoriert', async () => {
  const kit = mk();
  const ign = await kit.handleWebhook(JSON.stringify({ type: 'customer.created' }), null);
  assert.equal(ign.handled, false);
  const unk = await kit.handleWebhook(JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_gibtsnicht' } } }), null);
  assert.equal(unk.handled, false);
  assert.equal(unk.reason, 'unbekannte Session');
});

test('Lizenz-Validierung mit Produktbindung', async () => {
  const kit = mk();
  const co = await kit.createCheckout({ product_id: 'aa', price_cents: 700, buyer_email: 'a@b.de' });
  const res = await kit.handleWebhook(JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: co.session_id } } }), null);
  assert.equal((await kit.validateLicense(res.license_key, 'aa')).valid, true);
  assert.equal((await kit.validateLicense(res.license_key, 'anderes')).valid, false);
  assert.equal((await kit.validateLicense('pk_falsch', 'aa')).valid, false);
});
