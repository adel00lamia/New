// PlanBiz — analyse et recommandations IA pour le simulateur PLF 2027.
// Le navigateur envoie seulement les montants calculés (aucun nom, aucun identifiant). Rien n'est conservé.
// Un compteur anonyme (empreinte de l'adresse IP) limite l'usage.
// Variables d'environnement Vercel :
//   ANTHROPIC_API_KEY (obligatoire), ANTHROPIC_MODEL (optionnel)
//   ANALYSE_DAILY_LIMIT   analyses par appareil et par jour, défaut 5
//   ANALYSE_GLOBAL_LIMIT  analyses au total par jour, défaut 500
//   PAIE_SALT, PAIE_ORIGINS  partagés avec api/paie-lire.js
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jecydmxekdorycgfwtwy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_a-ccau1Xus1RmybrNV6xBg_P59YAdfS';

function allowed(origin) {
  if (!origin) return false;
  const extra = (process.env.PAIE_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return extra.includes(origin) || /^https:\/\/(planbiz|[a-z0-9-]*simulateur[a-z0-9-]*|[a-z0-9-]*plf[a-z0-9-]*|[a-z0-9-]+-la-s-projects3)\.vercel\.app$/.test(origin);
}

const RULES = `Règles utilisées par le simulateur (projet de loi de finances 2027 du Maroc, pas encore voté) :
- Barème IR annuel 2026 : 0 % jusqu'à 40 000 DH, 10 % jusqu'à 60 000, 20 % jusqu'à 80 000, 30 % jusqu'à 100 000, 34 % jusqu'à 180 000, 37 % au-delà. 2027 : 0 % jusqu'à 60 000, 10 % jusqu'à 80 000, 20 % jusqu'à 100 000, 34 % jusqu'à 180 000, 37 % au-delà. Barème cible 2031 : 0 % jusqu'à 60 000, 10 % jusqu'à 150 000, 20 % jusqu'à 500 000, 30 % au-delà.
- Frais professionnels : 35 % (brut annuel jusqu'à 78 000 DH) ou 25 % en 2026, 45 % pour tous dès 2027, plafond 35 000 DH par an. À partir de 2031, la déduction ne se cumule plus avec les indemnités exonérées (modalités non précisées).
- Indemnités : exonérées jusqu'à leur plafond aujourd'hui. À partir de 2031, seules celles qui remboursent des frais justifiés restent exonérées d'IR. Le PLF ne change pas la CNSS.
- Charges de famille : 500 DH par personne et par an, 6 au plus.
- Cotisations salariales : CNSS 4,48 % et perte d'emploi 0,19 % plafonnées à 6 000 DH, AMO 2,26 %. Charges patronales : 8,98 % et 0,38 % plafonnées, allocations familiales 6,40 %, formation professionnelle 1,60 %, AMO 4,11 %.`;

const SYSTEM = `Tu es un conseiller en paie et en fiscalité des salaires au Maroc. Tu rédiges, en français, une courte analyse des résultats d'un simulateur de la réforme de l'IR, puis des recommandations concrètes.
Contraintes :
- Utilise uniquement les montants fournis. N'invente aucun chiffre. Si tu fais un calcul simple, il doit découler des données.
- Arrondis les montants au dirham et écris-les avec une espace pour les milliers (exemple : 11 577 DH). Les taux sont des fractions (0,03 = 3 %).
- Écris des phrases simples, fluides et naturelles, sans points-virgules et sans fragments empilés. Tutoie le lecteur.
- Structure : une ligne « ## Ce qu'il faut retenir » suivie de 2 ou 3 phrases, puis « ## Recommandations » suivie de 3 à 5 puces commençant par « - ». Chaque puce dit quoi faire et pourquoi, avec le montant concerné quand il existe.
- Pour un employeur, parle de coût, de négociation salariale, de structure des indemnités (forfait ou frais justifiés), de communication à l'équipe et de budget.
- Pour un salarié, parle de ce que la réforme change sur son net, de ses indemnités, de ce qu'il peut demander à son employeur et des points à vérifier sur sa fiche de paie.
- Rappelle en une phrase finale que le texte n'est pas encore voté et qu'un expert-comptable ou le service paie doit confirmer avant toute décision.
- 220 mots au plus.
${RULES}`;

const clean = (v, depth = 0) => {
  if (depth > 4) return null;
  if (typeof v === 'number') return isFinite(v) ? Math.round(v * 100) / 100 : 0;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.replace(/[<>]/g, '').slice(0, 80);
  if (Array.isArray(v)) return v.slice(0, 30).map(x => clean(x, depth + 1));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).slice(0, 40).map(([k, x]) => [String(k).slice(0, 40), clean(x, depth + 1)]));
  return null;
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
  if (!process.env.ANTHROPIC_API_KEY) { res.status(503).json({ error: 'Analyse indisponible pour le moment.' }); return; }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const profil = body.profil === 'employeur' ? 'employeur' : body.profil === 'salarie' ? 'salarie' : '';
  if (!profil || !body.data || typeof body.data !== 'object') { res.status(400).json({ error: 'Données manquantes.' }); return; }
  const data = clean(body.data);
  const json = JSON.stringify(data);
  if (json.length > 12000) { res.status(413).json({ error: 'Trop de données.' }); return; }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'inconnu';
  const who = crypto.createHash('sha256').update((process.env.PAIE_SALT || 'planbiz-paie') + '|' + ip).digest('hex').slice(0, 32);
  try {
    const q = await fetch(`${SUPABASE_URL}/rest/v1/rpc/consume_anon_quota`, {
      method: 'POST', headers: { 'content-type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ p_kind: 'analyse', p_who: who, p_max: parseInt(process.env.ANALYSE_DAILY_LIMIT || '5', 10), p_global: parseInt(process.env.ANALYSE_GLOBAL_LIMIT || '500', 10) })
    });
    if ((await q.json()) !== true) { res.status(429).json({ error: 'Limite d’analyses atteinte pour aujourd’hui. Réessaie demain.' }); return; }
  } catch (e) { res.status(502).json({ error: 'Service momentanément indisponible.' }); return; }

  const up = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Profil : ${profil === 'employeur' ? 'employeur qui prépare son budget de masse salariale' : 'salarié'}.\nRésultats du simulateur (montants en DH, mensuels sauf mention « an ») :\n${json}` }]
    })
  }).catch(() => null);
  if (!up || !up.ok) { const t = up ? (await up.text().catch(() => '')).slice(0, 200) : 'réseau'; console.error('plf-analyse', up && up.status, t); res.status(502).json({ error: 'L’analyse a échoué. Réessaie dans un instant.' }); return; }
  const out = await up.json().catch(() => null);
  const text = out && Array.isArray(out.content) ? out.content.filter(c => c.type === 'text').map(c => c.text).join('').trim() : '';
  if (!text) { res.status(502).json({ error: 'L’analyse a échoué.' }); return; }
  res.status(200).json({ text: text.slice(0, 4000), fin: out.stop_reason || '' });
};
