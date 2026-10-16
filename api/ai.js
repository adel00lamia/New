// PlanBiz — fonction serveur Vercel : relaie les demandes IA vers l'API Claude (Anthropic).
// Variables d'environnement Vercel :
//   ANTHROPIC_API_KEY  (obligatoire)  clé API Anthropic
//   ANTHROPIC_MODEL    (optionnel)    modèle, par défaut claude-sonnet-5-5
//   AI_DAILY_LIMIT     (optionnel)    nombre de demandes IA par utilisateur et par jour, défaut 30
//   SUPABASE_URL / SUPABASE_ANON_KEY  (optionnels) par défaut ceux de js/config.js

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jecydmxekdorycgfwtwy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_a-ccau1Xus1RmybrNV6xBg_P59YAdfS';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).send('Méthode non autorisée'); return; }
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.length < 20) { res.status(401).send('Connecte-toi pour utiliser l\'assistant IA.'); return; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(503).send('Assistant IA non configuré : ajoute ANTHROPIC_API_KEY dans les variables d\'environnement Vercel.'); return; }

  // 1) vérifie la session Supabase et consomme un crédit du quota journalier
  const limit = parseInt(process.env.AI_DAILY_LIMIT || '30', 10);
  let ok = false;
  try {
    const q = await fetch(`${SUPABASE_URL}/rest/v1/rpc/consume_ai_credit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: SUPABASE_KEY, authorization: auth },
      body: JSON.stringify({ max_per_day: limit })
    });
    if (q.status === 401 || q.status === 403) { res.status(401).send('Session expirée : reconnecte-toi.'); return; }
    ok = (await q.json()) === true;
  } catch (e) { res.status(502).send('Vérification du compte impossible.'); return; }
  if (!ok) { res.status(429).send(`Limite de ${limit} demandes IA par jour atteinte. Réessaie demain.`); return; }

  // 2) appel Claude en streaming
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const prompt = String(body.prompt || '').slice(0, 250000);
  if (!prompt) { res.status(400).send('Demande vide.'); return; }
  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: body.tier === 'complex' ? 24000 : 8000,
      stream: true,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!upstream.ok || !upstream.body) { const t = await upstream.text().catch(() => ''); res.status(502).send('Erreur du service IA : ' + t.slice(0, 300)); return; }

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
  const reader = upstream.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        let ev; try { ev = JSON.parse(line.slice(5)); } catch (e) { continue; }
        if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') res.write(ev.delta.text);
        else if (ev.type === 'error') res.write('[[PLANBIZ_ERROR]]' + ((ev.error && ev.error.message) || 'Erreur IA'));
      }
    }
  } catch (e) { res.write('[[PLANBIZ_ERROR]]Connexion au service IA interrompue.'); }
  res.end();
};
