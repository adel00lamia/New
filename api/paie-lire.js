// PlanBiz — lecture d'un bulletin de paie pour le simulateur PLF 2027.
// Le fichier est transmis à l'API Claude, qui renvoie seulement les rubriques et les montants.
// Rien n'est conservé : ni le fichier, ni le résultat. Seul un compteur anonyme (empreinte de l'adresse IP) limite l'usage.
// Variables d'environnement Vercel :
//   ANTHROPIC_API_KEY (obligatoire), ANTHROPIC_MODEL (optionnel)
//   PAIE_DAILY_LIMIT    lectures par appareil et par jour, défaut 3
//   PAIE_GLOBAL_LIMIT   lectures au total par jour, défaut 300
//   PAIE_SALT           sel de l'empreinte IP (optionnel)
//   PAIE_ORIGINS        autres origines autorisées, séparées par des virgules (optionnel)
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jecydmxekdorycgfwtwy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_a-ccau1Xus1RmybrNV6xBg_P59YAdfS';
const TYPES = ['prime', 'transport', 'km', 'voiture', 'deplacement', 'tournee', 'representation', 'panier', 'caisse', 'salissure', 'outillage', 'frais', 'avantage', 'autre'];
const MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function allowed(origin) {
  if (!origin) return false;
  const extra = (process.env.PAIE_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return extra.includes(origin) || /^https:\/\/(planbiz|[a-z0-9-]*simulateur[a-z0-9-]*|[a-z0-9-]*plf[a-z0-9-]*|[a-z0-9-]+-la-s-projects3)\.vercel\.app$/.test(origin);
}

const SCHEMA = {
  type: 'object',
  properties: {
    lisible: { type: 'boolean', description: "false si le document n'est pas un bulletin de paie ou est illisible" },
    mois: { type: 'string', description: 'période de paie, par exemple "septembre 2026"' },
    date_entree: { type: 'string', description: "date d'embauche au format AAAA-MM-JJ si elle figure, sinon vide" },
    salaire_base: { type: 'number', description: 'salaire de base mensuel du mois, en DH' },
    prime_anciennete: { type: 'number', description: "montant de la prime d'ancienneté, 0 si absente" },
    rubriques: {
      type: 'array',
      description: "toutes les autres lignes de gains (primes, indemnités, heures supplémentaires, avantages), sans le salaire de base ni la prime d'ancienneté",
      items: {
        type: 'object',
        properties: {
          libelle: { type: 'string', description: 'libellé tel qu’écrit sur le bulletin' },
          montant: { type: 'number' },
          type: { type: 'string', enum: TYPES, description: "prime = toute prime ou gain imposable versé (rendement, heures sup., 13e mois, congés payés, prime d'assurance voiture) ; transport = transport domicile-travail ; km = indemnité kilométrique calculée sur des kilomètres ; voiture = indemnité de voiture ou de carburant forfaitaire sans kilométrage ; deplacement = indemnité forfaitaire de déplacement ; tournee ; representation ; panier ; caisse ; salissure (ou usure de vêtements) ; outillage ; frais = remboursement de frais sur justificatifs (missions, hôtel) ; avantage = avantage en nature non versé (voiture de fonction, logement) ; autre = autre indemnité exonérée" },
          hors_ville: { type: 'boolean', description: 'pour le transport : vrai si le libellé indique hors périmètre urbain' },
          km: { type: 'number', description: 'pour une indemnité kilométrique : nombre de km indiqué en base, sinon 0' }
        },
        required: ['libelle', 'montant', 'type']
      }
    },
    personnes_charge: { type: 'integer', description: 'nombre de personnes à charge ou de déductions pour charges de famille si indiqué, sinon -1' },
    retenues_deductibles: { type: 'number', description: 'retraite complémentaire (CIMR, RCAR…) et mutuelle, part salariale, total mensuel' },
    cnss_affilie: { type: 'boolean' },
    brut_global: { type: 'number', description: '0 si absent' },
    brut_imposable: { type: 'number', description: '0 si absent' },
    ir: { type: 'number', description: "IR retenu ce mois, 0 si absent" },
    net_a_payer: { type: 'number', description: '0 si absent' }
  },
  required: ['lisible', 'salaire_base', 'rubriques', 'personnes_charge', 'retenues_deductibles', 'cnss_affilie', 'ir', 'net_a_payer']
};

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (allowed(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Méthode non autorisée.' }); return; }
  if (origin && !allowed(origin)) { res.status(403).json({ error: 'Origine non autorisée.' }); return; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(503).json({ error: 'Lecture indisponible pour le moment.' }); return; }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const mime = String(body.mime || ''), data = String(body.data || '');
  if (!MIMES.includes(mime) || !data) { res.status(400).json({ error: 'Envoie un PDF ou une photo (JPEG, PNG).' }); return; }
  if (data.length > 4.2e6) { res.status(413).json({ error: 'Fichier trop lourd : 3 Mo au maximum.' }); return; }
  if (body.consent !== true) { res.status(400).json({ error: 'Consentement requis.' }); return; }

  // quota anonyme
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'inconnu';
  const who = crypto.createHash('sha256').update((process.env.PAIE_SALT || 'planbiz-paie') + '|' + ip).digest('hex').slice(0, 32);
  try {
    const q = await fetch(`${SUPABASE_URL}/rest/v1/rpc/consume_payslip_read`, {
      method: 'POST', headers: { 'content-type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ p_who: who, p_max: parseInt(process.env.PAIE_DAILY_LIMIT || '3', 10), p_global: parseInt(process.env.PAIE_GLOBAL_LIMIT || '300', 10) })
    });
    if ((await q.json()) !== true) { res.status(429).json({ error: 'Limite de lectures atteinte pour aujourd’hui. Tu peux saisir tes rubriques à la main ou réessayer demain.' }); return; }
  } catch (e) { res.status(502).json({ error: 'Service momentanément indisponible.' }); return; }

  const block = mime === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: mime, data } }
    : { type: 'image', source: { type: 'base64', media_type: mime, data } };
  const up = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 2000,
      system: "Tu lis des bulletins de paie marocains. Tu relèves uniquement les montants du mois et la date d'embauche. "
        + "Tu ne recopies jamais le nom, le CIN, le numéro CNSS, le matricule, l'adresse, le RIB ni le nom de l'employeur, même dans un libellé. "
        + "Les montants sont en dirhams, avec la virgule comme séparateur décimal sur le bulletin. Si une valeur manque, mets 0.",
      tools: [{ name: 'bulletin', description: 'Contenu chiffré du bulletin de paie', input_schema: SCHEMA }],
      tool_choice: { type: 'auto' },
      messages: [{ role: 'user', content: [block, { type: 'text', text: "Relève le contenu de ce bulletin de paie en appelant l'outil bulletin, sans autre texte. Si ce n'est pas un bulletin de paie, appelle l'outil avec lisible = false." }] }]
    })
  }).catch(() => null);
  if (!up || !up.ok) { const t = up ? (await up.text().catch(() => '')).slice(0, 300) : 'réseau'; console.error('paie-lire', up && up.status, t); res.status(502).json({ error: 'La lecture a échoué. Essaie avec une image plus nette ou saisis tes rubriques à la main.', detail: (up ? up.status + ' ' : '') + t.replace(/sk-[A-Za-z0-9_-]+/g, '') }); return; }
  const out = await up.json().catch(() => null);
  let t = out && Array.isArray(out.content) && out.content.find(c => c.type === 'tool_use');
  if (!t && out && Array.isArray(out.content)) {   // repli : JSON écrit en texte
    const txt = out.content.filter(c => c.type === 'text').map(c => c.text).join('');
    const m = txt.match(/\{[\s\S]*\}/); if (m) { try { t = { input: JSON.parse(m[0]) }; } catch (e) { } }
  }
  if (!t || !t.input) { res.status(502).json({ error: 'La lecture a échoué.' }); return; }

  // nettoyage : nombres positifs, libellés courts, types connus
  const n = v => { const x = Number(v); return isFinite(x) && x > 0 ? Math.round(x * 100) / 100 : 0; };
  const i = t.input;
  const rub = (Array.isArray(i.rubriques) ? i.rubriques : []).slice(0, 25).map(r => ({
    l: String(r.libelle || '').replace(/\s+/g, ' ').slice(0, 60), m: n(r.montant), t: TYPES.includes(r.type) ? r.type : 'prime', hv: !!r.hors_ville, km: n(r.km)
  })).filter(r => r.m > 0);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(i.date_entree || '')) ? i.date_entree : '';
  res.status(200).json({
    lisible: i.lisible !== false, mois: String(i.mois || '').slice(0, 30), date_entree: d,
    base: n(i.salaire_base), anc: n(i.prime_anciennete), rub,
    dep: Number.isInteger(i.personnes_charge) && i.personnes_charge >= 0 ? Math.min(i.personnes_charge, 6) : -1,
    ret: n(i.retenues_deductibles), cnss: i.cnss_affilie !== false,
    brut: n(i.brut_global), sbi: n(i.brut_imposable), ir: n(i.ir), net: n(i.net_a_payer)
  });
};
