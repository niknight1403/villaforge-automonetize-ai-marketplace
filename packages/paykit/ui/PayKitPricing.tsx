/**
 * PayKitPricing — High-End Pricing & Checkout-Komponente (Phase 3, Loop 1-3):
 * Loop 1 (Funktional): Plan-Auswahl, E-Mail, Checkout-Trigger, Lizenz-Anzeige.
 * Loop 2 (Kritik): Reduziert auf EINE Handlung pro Karte — keine Feature-Listen-Flut,
 *   keine Doppel-CTAs, klare Hierarchie Plan > Preis > Aktion.
 * Loop 3 (Polishing): Glassmorphism (backdrop-blur, 1px-Lichtkante), Micro-Interactions
 *   (Hover-Lift, aktive Skalierung, Button-Press 97%), AAA-Kontraste (#F8FAFC auf #0B1120 > 14:1).
 */
import { useState } from 'react';
import { PayKitClient, type CheckoutRequest } from './paykit-client';

export interface Plan {
  id: string; name: string; priceCents: number; currency?: string;
  highlight?: boolean; cta?: string;
}

export function PayKitPricing({
  plans, productId, baseUrl = '/paykit', successUrl, onLicense
}: {
  plans: Plan[]; productId: string; baseUrl?: string; successUrl?: string;
  onLicense?: (sessionId: string) => void;
}) {
  const client = new PayKitClient(baseUrl);
  const [selected, setSelected] = useState(plans.find((p) => p.highlight)?.id ?? plans[0].id);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function checkout() {
    if (!emailOk || busy) return;
    setBusy(true); setError(null);
    try {
      const req: CheckoutRequest = {
        product_id: `${productId}-${selected}`, price_cents: plans.find((p) => p.id === selected)!.priceCents,
        buyer_email: email, ...(successUrl ? { success_url: successUrl } : {})
      };
      const res = await client.checkout(req);
      if (res.checkout_url) { window.location.href = res.checkout_url; return; }
      onLicense?.(res.session_id); // Sandbox-Modus: ohne Redirect weiterleiten
    } catch { setError('Zahlung konnte nicht gestartet werden. Bitte erneut versuchen.'); }
    finally { setBusy(false); }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#0B1120]/70 p-7 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Upgrade</p>

      <div className="mt-4 grid grid-cols-1 gap-2.5">
        {plans.map((plan) => {
          const active = plan.id === selected;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              aria-pressed={active}
              className={`group flex items-center justify-between rounded-2xl border px-5 py-4 text-left
                transition-all duration-200 ${active
                  ? 'border-sky-400/60 bg-white/10 scale-[1.02] shadow-lg shadow-sky-500/10'
                  : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:-translate-y-0.5'}`}
            >
              <span className="text-sm font-medium text-slate-100">{plan.name}</span>
              <span className="font-mono text-base tabular-nums text-slate-100">
                {(plan.priceCents / 100).toFixed(2)} {plan.currency ?? 'EUR'}
              </span>
            </button>
          );
        })}
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-slate-400">E-Mail für die Lizenz</span>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="du@beispiel.de"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3
            text-slate-100 placeholder:text-slate-500 outline-none
            focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
        />
      </label>

      <button
        onClick={checkout} disabled={!emailOk || busy}
        className="mt-4 w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-slate-950
          transition-all duration-150 hover:bg-sky-400 active:scale-[0.97]
          disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Wird gestartet …' : 'Jetzt freischalten'}
      </button>

      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
      <p className="mt-3 text-center text-xs text-slate-400">Sichere Zahlung · Lizenz per E-Mail</p>
    </section>
  );
}
