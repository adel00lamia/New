// PlanBiz — retour du navigateur après la page de paiement CMI (qui revient en POST).
module.exports = function handler(req, res) {
  const ok = String((req.query && req.query.r) || '') === 'ok';
  res.statusCode = 303;
  res.setHeader('Location', `/?paiement=${ok ? 'ok' : 'echec'}`);
  res.end();
};
