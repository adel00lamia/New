// PlanBiz — notification serveur à serveur du CMI après un paiement par carte.
// Le CMI attend la réponse « ACTION=POSTAUTH » pour confirmer l'encaissement (à valider avec le kit d'intégration).
const { PLANS, admin, cmiHash, readBody, activate } = require('./_pay-lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).send('Méthode non autorisée'); return; }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  const b = await readBody(req);
  const got = b.HASH || b.hash;
  if (!process.env.CMI_STORE_KEY || !got || cmiHash(b, process.env.CMI_STORE_KEY) !== got) { res.status(200).send('FAILURE'); return; }
  try {
    const rows = await admin(`orders?ref=eq.${encodeURIComponent(b.oid || '')}&select=*`);
    const order = rows && rows[0];
    if (!order) { res.status(200).send('FAILURE'); return; }
    if (order.status === 'paid') { res.status(200).send('ACTION=POSTAUTH'); return; }
    const okAmount = Math.abs(parseFloat(b.amount) - PLANS[order.plan].amount) < 0.01;
    if (b.ProcReturnCode === '00' && okAmount) {
      await activate(order, b.TransId || b.AuthCode || '', 'cmi');
      res.status(200).send('ACTION=POSTAUTH');
    } else {
      await admin(`orders?id=eq.${order.id}&status=eq.pending`, { method: 'PATCH', body: JSON.stringify({ status: 'failed', provider_ref: b.ProcReturnCode || null }) });
      res.status(200).send('APPROVED');
    }
  } catch (e) { res.status(200).send('FAILURE'); }
};
