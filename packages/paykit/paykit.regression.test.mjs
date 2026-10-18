import test from 'node:test';
import assert from 'node:assert/strict';
import { createPayKit, InMemoryStorage, ValidationError, SignatureError } from './paykit.mjs';

const mk = (opts = {}) => createPayKit({ storage: new InMemoryStorage(), webhookSecret: 'whsec_t', ...opts });

test('Regression & Randfall: Extrem kleine Preise unter Mindestbetrag', async () => {
  const kit = mk();
  await assert.rejects(kit.createCheckout({ product_id: 'test', price_cents: 10, buyer_email: 'test@example.com', success_url: 'https://x.de' }), ValidationError);
});

test('Regression & Randfall: Ungueltige E-Mail-Adressen mit Sonderzeichen', async () => {
  const kit = mk();
  await assert.rejects(kit.createCheckout({ product_id: 'test', price_cents: 1900, buyer_email: 'invalid..email@domain.com', success_url: 'https://x.de' }), ValidationError);
  await assert.rejects(kit.createCheckout({ product_id: 'test', price_cents: 1900, buyer_email: 'user@domain', success_url: 'https://x.de' }), ValidationError);
});

test('Regression & Randfall: Webhook mit manipulierter Signatur und veraltetem Timestamp', async () => {
  const kit = mk();
  const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'sbx_fake' } } });
  const oldTime = Math.floor(Date.now() / 1000) - 600; // 10 min alt
  const sig = `t=${oldTime},v1=invalid`;
  await assert.rejects(kit.handleWebhook(payload, sig), SignatureError);
});

test('Regression & Randfall: Lizenzpruefung fuer nicht existierenden Schluessel', async () => {
  const kit = mk();
  const res = await kit.validateLicense('LICENSE-NONEXISTENT-999');
  assert.equal(res.valid, false);
});

test('Regression & Randfall: MRR Berechnung mit mehreren Kaeufen', async () => {
  const kit = mk();
  const co1 = await kit.createCheckout({ product_id: 'pro', price_cents: 1900, buyer_email: 'a@b.de', success_url: 'https://x.de' });
  await kit.handleWebhook(JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: co1.session_id } } }), `t=${Math.floor(Date.now()/1000)},v1=dummy`);
  
  const currentMrr = await kit.mrr();
  assert.equal(currentMrr, 19);
});
