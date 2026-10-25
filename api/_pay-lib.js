// PlanBiz — fonctions communes aux paiements (CMI, virement).
// Variables d'environnement Vercel :
//   SUPABASE_SERVICE_ROLE_KEY  (obligatoire pour les paiements) clé serveur Supabase, jamais côté navigateur
//   CMI_CLIENT_ID, CMI_STORE_KEY  identifiants marchand fournis par la banque / le CMI
//   CMI_GATEWAY_URL  URL de la page de paiement (test : https://testpayment.cmi.co.ma/fim/est3Dgate)
//   SITE_URL  adresse publique du site, par défaut https://planbiz.vercel.app
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jecydmxekdorycgfwtwy.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_a-ccau1Xus1RmybrNV6xBg_P59YAdfS';
const SITE = (process.env.SITE_URL || 'https://planbiz.vercel.app').replace(/\/$/, '');

// Prix TTC en dirhams et durée d'accès. À garder identiques à js/config.js (affichage).
const PLANS = {
  pass: { label: 'Pass Dossier', amount: 490, days: 92 },
  pro: { label: 'PlanBiz Pro (1 an)', amount: 3480, days: 366 }
};

async function userFromToken(auth) {
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, authorization: auth } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u : null;
}

async function admin(path, opts = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante');
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: key, authorization: 'Bearer ' + key, 'content-type': 'application/json', prefer: 'return=representation', ...(opts.headers || {}) }
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status} : ${txt.slice(0, 200)}`);
  return txt ? JSON.parse(txt) : null;
}

// Signature CMI « ver3 » (passerelle Nestpay) : paramètres triés sans tenir compte de la casse,
// hors « hash » et « encoding », valeurs échappées (\ et |), jointes par |, puis la clé du magasin.
// À valider avec le kit d'intégration remis par la banque.
function cmiHash(params, storeKey) {
  const esc = v => String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
  const keys = Object.keys(params).filter(k => !['hash', 'encoding'].includes(k.toLowerCase())).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const plain = keys.map(k => esc(params[k])).join('|') + '|' + esc(storeKey);
  return crypto.createHash('sha512').update(plain, 'utf8').digest('base64');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : await new Promise(res => { let d = ''; req.on('data', c => { d += c; }); req.on('end', () => res(d)); });
  try { return JSON.parse(raw); } catch (e) { return Object.fromEntries(new URLSearchParams(raw)); }
}

async function activate(order, providerRef, source) {
  const plan = PLANS[order.plan];
  const ends = new Date(Date.now() + plan.days * 864e5).toISOString();
  await admin(`orders?id=eq.${order.id}&status=eq.pending`, { method: 'PATCH', body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString(), provider_ref: providerRef || null }) });
  await admin('entitlements', { method: 'POST', body: JSON.stringify({ user_id: order.user_id, plan: order.plan, project_id: order.plan === 'pass' ? order.project_id : null, ends_at: ends, source, ref: order.ref }) });
}

module.exports = { PLANS, SITE, userFromToken, admin, cmiHash, readBody, activate };
