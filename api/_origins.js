// Origines autorisées à appeler les fonctions IA du simulateur, et lecture sûre du corps JSON.
// PAIE_ORIGINS (optionnel) : liste d'origines supplémentaires séparées par des virgules (domaine personnalisé).
const EXACT = ['https://planbiz.vercel.app', 'https://new-simulateur.vercel.app'];
const PREVIEW = /^https:\/\/(planbiz|new-simulateur)(-git-[a-z0-9-]+|-[a-z0-9]{9})-la-s-projects3\.vercel\.app$/;

function allowed(origin) {
  if (!origin) return false;
  const extra = (process.env.PAIE_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return EXACT.includes(origin) || extra.includes(origin) || PREVIEW.test(origin);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body !== 'string' || !req.body) return {};
  try { const v = JSON.parse(req.body); return v && typeof v === 'object' ? v : null; } catch (e) { return null; }
}

// En-têtes des compteurs anonymes : la clé serveur si elle est réglée sur Vercel, sinon la clé publique.
function quotaHeaders(pubKey) {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return k ? { 'content-type': 'application/json', apikey: k, authorization: 'Bearer ' + k } : { 'content-type': 'application/json', apikey: pubKey };
}

// Nombre de pages d'un PDF (estimation suffisante pour refuser les gros fichiers).
function pdfPages(b64) {
  try { const t = Buffer.from(b64, 'base64').toString('latin1'); return (t.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length; } catch (e) { return 0; }
}

module.exports = { allowed, readBody, quotaHeaders, pdfPages };
