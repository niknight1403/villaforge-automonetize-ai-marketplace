/** SQLite-Storage (node:sqlite) fuer den VPS-Betrieb. Sandbox/Tests nutzen InMemoryStorage. */
export class SqliteStorage {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
    db.exec(`CREATE TABLE IF NOT EXISTS paykit_checkouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL, buyer_email TEXT NOT NULL,
      price_cents INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      session_id TEXT NOT NULL UNIQUE, license_key TEXT, created_at INTEGER NOT NULL, paid_at INTEGER);
      CREATE TABLE IF NOT EXISTS paykit_licenses (
      license_key TEXT PRIMARY KEY, product_id TEXT NOT NULL, plan TEXT NOT NULL, issued_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS paykit_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL, cents INTEGER NOT NULL,
      currency TEXT NOT NULL, ts INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_paykit_payments_ts ON paykit_payments(ts);`);
  }
  async saveCheckout(c) {
    this.db.prepare('INSERT INTO paykit_checkouts (product_id, buyer_email, price_cents, currency, status, session_id, license_key, created_at, paid_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(c.product_id, c.buyer_email, c.price_cents, c.currency, c.status, c.session_id, c.license_key, c.created_at, c.paid_at);
    return c;
  }
  async markPaid(session_id, paid_at) {
    const r = this.db.prepare('SELECT * FROM paykit_checkouts WHERE session_id = ?').get(session_id);
    if (!r) return null;
    this.db.prepare('UPDATE paykit_checkouts SET status = ?, paid_at = ? WHERE session_id = ?').run('paid', paid_at, session_id);
    return r;
  }
  async saveLicense(l) {
    this.db.prepare('INSERT INTO paykit_licenses (license_key, product_id, plan, issued_at) VALUES (?,?,?,?)').run(l.license_key, l.product_id, l.plan, l.issued_at);
    return l;
  }
  async attachLicense(session_id, key) { this.db.prepare('UPDATE paykit_checkouts SET license_key = ? WHERE session_id = ?').run(key, session_id); }
  async getLicense(key) { return this.db.prepare('SELECT * FROM paykit_licenses WHERE license_key = ?').get(key) || null; }
  async recordPayment(p) { this.db.prepare('INSERT INTO paykit_payments (product_id, cents, currency, ts) VALUES (?,?,?,?)').run(p.product_id, p.cents, p.currency, p.ts); }
  async paymentsSince(ts) { return this.db.prepare('SELECT * FROM paykit_payments WHERE ts >= ?').all(ts).map((r) => ({ cents: r.cents, ts: r.ts })); }
}
