// PlanBiz — assistant de questions sur le PLF 2027 (simulateur BP PLF 2027).
// Réservé aux utilisateurs connectés avec leur compte PlanBiz. 5 questions par compte (PLF_CHAT_MAX).
// Le texte des questions n'est pas conservé : seul un compteur par compte est enregistré.
// Variables d'environnement Vercel : ANTHROPIC_API_KEY (obligatoire), ANTHROPIC_MODEL, PLF_CHAT_MAX (défaut 5), PAIE_ORIGINS.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jecydmxekdorycgfwtwy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_a-ccau1Xus1RmybrNV6xBg_P59YAdfS';
const MAX = Math.max(1, Math.min(50, parseInt(process.env.PLF_CHAT_MAX || '5', 10)));

function allowed(origin) {
  if (!origin) return false;
  const extra = (process.env.PAIE_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return extra.includes(origin) || /^https:\/\/(planbiz|[a-z0-9-]*simulateur[a-z0-9-]*|[a-z0-9-]*plf[a-z0-9-]*|[a-z0-9-]+-la-s-projects3)\.vercel\.app$/.test(origin);
}

const RULES = `Règles du projet de loi de finances 2027 du Maroc (PLF, présenté le 23 octobre 2026, pas encore voté), telles qu'utilisées par le simulateur :
- Barème IR annuel 2026 : 0 % jusqu'à 40 000 DH, 10 % jusqu'à 60 000, 20 % jusqu'à 80 000, 30 % jusqu'à 100 000, 34 % jusqu'à 180 000, 37 % au-delà.
- 2027 : 0 % jusqu'à 60 000, 10 % jusqu'à 80 000, 20 % jusqu'à 100 000, 34 % jusqu'à 180 000, 37 % au-delà. Les barèmes évoluent ensuite chaque année jusqu'au barème cible de 2031 : 0 % jusqu'à 60 000, 10 % jusqu'à 150 000, 20 % jusqu'à 500 000, 30 % au-delà.
- Déduction pour frais professionnels : en 2026, 35 % si le salaire brut imposable annuel ne dépasse pas 78 000 DH, sinon 25 %, plafond 35 000 DH par an. Dès 2027 : 45 % pour tous, plafond 35 000 DH par an (2 917 DH par mois). Les avantages en nature n'entrent pas dans la base de la déduction.
- Indemnités : aujourd'hui exonérées d'IR jusqu'à leur plafond (transport domicile-travail 500 DH en ville et 750 DH hors périmètre, kilométrique 3 DH par km sur ordres de mission, panier 20 DH par jour dans la limite de 20 % du salaire, représentation 10 % du salaire de base, caisse 190 DH, salissure 210 DH, outillage 100 DH, déplacement d'un poste itinérant 5 000 DH, tournée 1 500 DH). Les remboursements de frais justifiés restent exonérés.
- À partir de 2031 (le simulateur permet aussi de tester 2027), les indemnités versées au forfait deviennent imposables comme du salaire. Seules celles qui remboursent des frais prouvés (factures, ordres de mission) restent exonérées.
- Non-cumul à partir de 2031 : la déduction de 45 % ne se cumule plus avec les indemnités exonérées. Le texte ne précise pas comment. Trois lectures sont possibles : les indemnités exonérées réduisent la déduction (lecture par défaut du simulateur), toute indemnité exonérée supprime la déduction, ou pas de non-cumul.
- Le PLF ne modifie pas la CNSS : plafonds d'exonération CNSS et coût employeur inchangés.
- Charges de famille : 500 DH par personne et par an, 6 personnes au plus.
- Cotisations salariales : CNSS 4,48 % et indemnité pour perte d'emploi 0,19 % sur le salaire plafonné à 6 000 DH, AMO 2,26 % sans plafond. Charges patronales : CNSS 8,98 % et perte d'emploi 0,38 % plafonnées, allocations familiales 6,40 %, formation professionnelle 1,60 %, AMO 4,11 %.
- Importateurs : avance de 5 % sur la valeur en douane des marchandises importées pour être revendues en l'état, à partir de juillet 2027, pendant 60 mois, imputable sur l'IS ou l'IR, l'excédent étant restituable. Les biens d'investissement et les régimes économiques en douane sont exclus.
- Le ministre a annoncé l'exonération des salaires nets de moins de 10 000 DH, mais cette mesure ne figure pas dans le barème publié.`;

const SYSTEM = `Tu es l'assistant du Simulateur BP PLF 2027 de PlanBiz, spécialiste de la paie et de la fiscalité des salaires au Maroc.
Tu réponds aux questions des salariés, des responsables RH et des employeurs sur le projet de loi de finances 2027 et sur leur simulation.
Règles :
- Réponds dans la langue de la question (français par défaut), en 4 à 10 phrases simples, fluides et naturelles, sans points-virgules. Tutoie le lecteur.
- Appuie-toi sur les règles ci-dessous et sur les résultats de la simulation fournis. N'invente aucun chiffre ni aucune règle. Si une information manque ou si le texte ne la précise pas, dis-le clairement.
- Quand tu calcules, montre le calcul en une ou deux lignes. Écris les montants avec une espace pour les milliers (exemple : 12 994 DH).
- Si la question ne porte pas sur la paie, la fiscalité des salaires, le PLF 2027 ou le simulateur, réponds poliment que tu ne traites que ces sujets.
- Termine, si la réponse touche une décision, par une phrase rappelant que le texte n'est pas encore voté et qu'il faut confirmer avec le service paie ou un expert-comptable.
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

async function rpc(name, args, auth) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, { method: 'POST', headers: { 'content-type': 'application/json', apikey: SUPABASE_KEY, authorization: auth }, body: JSON.stringify(args) });
  if (r.status === 401 || r.status === 403) return { auth: false };
  return { auth: true, v: await r.json() };
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (allowed(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Méthode non autorisée.' }); return; }
  if (origin && !allowed(origin)) { res.status(403).json({ error: 'Origine non autorisée.' }); return; }
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.length < 20) { res.status(401).json({ error: 'Connecte-toi pour poser une question.' }); return; }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  // 1) questions restantes (lecture seule)
  let left;
  try { const r = await rpc('plf_chat_left', { p_max: MAX }, auth); if (!r.auth || r.v < 0) { res.status(401).json({ error: 'Session expirée : reconnecte-toi.' }); return; } left = r.v; }
  catch (e) { res.status(502).json({ error: 'Vérification du compte impossible.' }); return; }
  if (body.check) { res.status(200).json({ left, max: MAX }); return; }
  if (left <= 0) { res.status(429).json({ error: `Tu as utilisé tes ${MAX} questions.`, left: 0, max: MAX }); return; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(503).json({ error: 'Assistant indisponible pour le moment.' }); return; }

  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-10)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, m.role === 'user' ? 1500 : 4000) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user' || !messages[messages.length - 1].content.trim()) { res.status(400).json({ error: 'Question vide.' }); return; }
  const profil = ['salarie', 'employeur', 'importateur'].includes(body.profil) ? body.profil : 'salarie';
  const ctx = JSON.stringify(clean(body.context || {})).slice(0, 10000);

  // 2) réponse de l'IA
  const up = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 2000,
      system: `${SYSTEM}\n\nProfil de l'utilisateur : ${profil}.\nRésultats de sa simulation en cours (montants en DH, mensuels sauf mention « an ») :\n${ctx}`,
      messages
    })
  }).catch(() => null);
  if (!up || !up.ok) { const t = up ? (await up.text().catch(() => '')).slice(0, 200) : 'réseau'; console.error('plf-chat', up && up.status, t); res.status(502).json({ error: 'La réponse a échoué. Ta question n’a pas été décomptée, réessaie dans un instant.', left, max: MAX }); return; }
  const out = await up.json().catch(() => null);
  const text = out && Array.isArray(out.content) ? out.content.filter(c => c.type === 'text').map(c => c.text).join('').trim() : '';
  if (!text) { res.status(502).json({ error: 'La réponse a échoué. Ta question n’a pas été décomptée.', left, max: MAX }); return; }

  // 3) la question n'est décomptée qu'une fois la réponse obtenue
  let after = left - 1;
  try { const r = await rpc('consume_plf_chat', { p_max: MAX }, auth); if (r.auth && typeof r.v === 'number' && r.v >= 0) after = r.v; else if (r.v === -1) after = 0; } catch (e) { }
  res.status(200).json({ text: text.slice(0, 6000), left: after, max: MAX });
};
