// PlanBiz — création d'une commande et préparation du paiement.
// POST { plan: 'pass' | 'pro', projectId, method: 'cmi' | 'virement' } avec l'en-tête Authorization: Bearer <jeton Supabase>
const crypto = require('crypto');
const { PLANS, SITE, userFromToken, admin, cmiHash, readBody } = require('./_pay-lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).send('Méthode non autorisée'); return; }
  const user = await userFromToken(req.headers.authorization || '');
  if (!user) { res.status(401).json({ error: 'Connecte-toi pour acheter une offre.' }); return; }
  const body = await readBody(req);
  const plan = PLANS[body.plan];
  const method = body.method === 'cmi' ? 'cmi' : 'virement';
  if (!plan) { res.status(400).json({ error: 'Offre inconnue.' }); return; }
  if (body.plan === 'pass' && !/^[0-9a-f-]{36}$/i.test(String(body.projectId || ''))) { res.status(400).json({ error: 'Ouvre le projet concerné avant d\'acheter un Pass Dossier.' }); return; }
  if (method === 'cmi' && !(process.env.CMI_CLIENT_ID && process.env.CMI_STORE_KEY && process.env.CMI_GATEWAY_URL)) { res.status(503).json({ error: 'Le paiement par carte n\'est pas encore ouvert. Choisis le virement.' }); return; }

  let order;
  try {
    // le projet doit appartenir à l'utilisateur
    if (body.plan === 'pass') {
      const own = await admin(`businesses?id=eq.${body.projectId}&owner=eq.${user.id}&select=id`);
      if (!own || !own.length) { res.status(403).json({ error: 'Projet introuvable.' }); return; }
    }
    [order] = await admin('orders', { method: 'POST', body: JSON.stringify({ user_id: user.id, plan: body.plan, project_id: body.plan === 'pass' ? body.projectId : null, amount_mad: plan.amount, method }) });
  } catch (e) { res.status(500).json({ error: 'Création de la commande impossible.' }); return; }

  if (method === 'virement') { res.status(200).json({ method, ref: order.ref, amount: plan.amount, label: plan.label }); return; }

  const p = {
    clientid: process.env.CMI_CLIENT_ID,
    amount: plan.amount.toFixed(2),
    currency: '504',
    oid: order.ref,
    okUrl: `${SITE}/api/pay-return?r=ok`,
    failUrl: `${SITE}/api/pay-return?r=fail`,
    callbackUrl: `${SITE}/api/pay-callback`,
    shopurl: SITE,
    TranType: 'PreAuth',
    storetype: '3D_PAY_HOSTING',
    hashAlgorithm: 'ver3',
    lang: 'fr',
    refreshtime: '5',
    rnd: crypto.randomBytes(10).toString('hex'),
    email: user.email || '',
    BillToName: (user.email || 'Client PlanBiz').split('@')[0],
    encoding: 'UTF-8',
    AutoRedirect: 'true'
  };
  p.hash = cmiHash(p, process.env.CMI_STORE_KEY);
  res.status(200).json({ method, ref: order.ref, action: process.env.CMI_GATEWAY_URL, fields: p });
};
