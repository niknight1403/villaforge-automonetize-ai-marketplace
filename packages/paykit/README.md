# VillaForge PayKit

Wiederverwendbares Monetarisierungs-Kernmodul (FEATURE_DISCOVERY, Markt-Analytics).
Jede Villa integriert Zahlungen in **einer** Aufgabe statt Monetarisierung neu zu bauen.

## Integration (3 Schritte)
```js
import { createPayKit, InMemoryStorage } from './packages/paykit/paykit.mjs';
import { SqliteStorage } from './packages/paykit/storage/sqlite.mjs'; // VPS
const kit = createPayKit({ storage: new SqliteStorage(db), stripeKey: process.env.STRIPE_SECRET_KEY || '', webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '' });
const co = await kit.createCheckout({ product_id: 'mein-produkt', price_cents: 1900, buyer_email, success_url: 'https://mein-app.de/ok' });
// Webhook-Route: kit.handleWebhook(rawBody, req.headers['stripe-signature'])
// Lizenz pruefen: await kit.validateLicense(key, 'mein-produkt')
// Umsatz: await kit.mrr()
```
Ohne Stripe-Keys laeuft PayKit automatisch im Sandbox-Modus (keine Live-Zahlung).
API-Vertrag: `schema.json` (Shared Registry). Tests: `node --test packages/paykit/`.
Guardrails: Live-Zahlungen nur mit Owner-Freigabe; Keys nur aus dem Hub-Secret-Store.
