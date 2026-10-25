/* ================= Offres, paiement et accès aux fonctions payantes ================= */
const PBPay = (() => {
  const C = () => (window.PLANBIZ_CONFIG && window.PLANBIZ_CONFIG.payments) || { enabled: false, plans: {} };
  const GATED = new Set(['printDoc', 'expXlsx', 'expHtml', 'pitchPptx', 'pitchPdf']);
  let ent = null, loading = null;
  const nf = new Intl.NumberFormat('fr-FR');
  const fmtD = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  async function load(force) {
    if (!window.PB || !PB.client() || !PB.userId()) { ent = []; return ent; }
    if (ent && !force) return ent;
    if (loading && !force) return loading;
    loading = PB.client().from('entitlements').select('plan,project_id,ends_at,source').gt('ends_at', new Date().toISOString()).then(({ data }) => { ent = data || []; loading = null; return ent; });
    return loading;
  }
  const active = () => {
    const pid = window.PB && PB.currentId();
    const list = ent || [];
    return list.find(e => e.plan === 'pro') || list.find(e => e.plan === 'pass' && e.project_id === pid) || null;
  };
  function free() { return !C().enabled || !window.PB || !PB.client() || PB.isDemo() || !PB.hasAccount(); }
  const hasAccess = () => free() || !!active();

  // ----- fenêtre des offres -----
  function close() { const m = document.getElementById('payModal'); if (m) m.remove(); }
  function planCard(k, p, cur) {
    return `<div class="pay-plan ${k === 'pass' ? 'hi' : ''}"><div><b>${esc(p.label)}</b><p class="small muted">${esc(p.detail)}</p></div>
      <p class="pay-price"><span>${nf.format(p.price)}</span> ${esc(p.unit)}</p>
      ${cur ? '<span class="pill good">Ton offre actuelle</span>' : `<div class="row">${C().card ? `<button class="btn pri" data-pay="cmi" data-plan="${k}">Payer par carte</button>` : ''}<button class="btn ${C().card ? '' : 'pri'}" data-pay="virement" data-plan="${k}">Payer par virement</button></div>`}</div>`;
  }
  async function open(reason) {
    close(); await load(true);
    const a = active(), plans = C().plans || {};
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 'payModal';
    bg.innerHTML = `<div class="modal pay" role="dialog" aria-labelledby="payT"><div class="row" style="justify-content:space-between;align-items:flex-start"><h2 id="payT">Offres PlanBiz</h2><button class="iconbtn" data-pay="close" aria-label="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      ${reason ? `<p class="small" style="margin:6px 0 0">${esc(reason)}</p>` : ''}
      ${a ? `<p class="al good" style="margin:12px 0 0"><span>${a.plan === 'pro' ? 'PlanBiz Pro' : 'Pass Dossier'} actif jusqu'au ${fmtD(a.ends_at)}.</span></p>` : ''}
      <div class="pay-plans">
        <div class="pay-plan"><div><b>Découverte</b><p class="small muted">Tous les calculs, les guides, le Radar et l'aperçu du dossier à l'écran</p></div><p class="pay-price"><span>0</span> DH</p></div>
        ${plans.pass ? planCard('pass', plans.pass, a && a.plan === 'pass') : ''}
        ${plans.pro ? planCard('pro', plans.pro, a && a.plan === 'pro') : ''}
      </div>
      <p class="small muted">Les offres payantes débloquent le rapport PDF, l'export Excel et le pitch deck PowerPoint et PDF. Le Pass Dossier s'applique au projet ouvert.</p>
      <div id="payStep"></div>
      <form id="payCode" class="pay-code"><label for="payCodeIn"><b>Tu as un code d'activation ?</b></label><div class="row"><input class="in" id="payCodeIn" placeholder="PB-XXXX-XXXX-XXXX" autocomplete="off" required><button class="btn" type="submit">Activer</button></div></form>
      <p class="small muted"><a href="/legal.html#vente" target="_blank" rel="noopener">Conditions de vente</a></p></div>`;
    document.body.appendChild(bg);
    bg.addEventListener('click', e => { if (e.target === bg) close(); });
  }

  async function startPay(method, plan) {
    const step = document.getElementById('payStep'); if (!step) return;
    const pid = PB.currentId();
    if (plan === 'pass' && !pid) { step.innerHTML = '<p class="al warn"><span>Ouvre d\'abord le projet pour lequel tu veux le Pass Dossier.</span></p>'; return; }
    step.innerHTML = '<p class="small muted">Préparation de la commande…</p>';
    try {
      const t = await PB.token();
      const r = await fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: JSON.stringify({ plan, projectId: pid, method }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Commande impossible.');
      if (d.method === 'cmi') {
        const f = document.createElement('form'); f.method = 'POST'; f.action = d.action; f.style.display = 'none';
        Object.entries(d.fields).forEach(([k, v]) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; f.appendChild(i); });
        document.body.appendChild(f); step.innerHTML = '<p class="small muted">Redirection vers la page de paiement sécurisée du CMI…</p>'; f.submit(); return;
      }
      const b = C().bank || {};
      step.innerHTML = `<div class="pay-vir"><b>Virement de ${nf.format(d.amount)} DH</b>
        <dl><dt>Bénéficiaire</dt><dd>${esc(b.titulaire || 'à compléter')}</dd><dt>Banque</dt><dd>${esc(b.banque || 'à compléter')}</dd><dt>RIB</dt><dd class="mono">${esc(b.rib || 'à compléter')}</dd><dt>Motif à indiquer</dt><dd class="mono"><b>${esc(d.ref)}</b></dd></dl>
        <p class="small">Indique bien le motif <b>${esc(d.ref)}</b>. Ton accès est activé dès réception du virement, en général sous 1 à 2 jours ouvrés${C().contact ? `. Pour aller plus vite, envoie ton justificatif à ${esc(C().contact)}` : ''}.</p></div>`;
    } catch (e) { step.innerHTML = `<p class="al warn"><span>${esc(e.message || 'Commande impossible.')}</span></p>`; }
  }

  async function redeem(code) {
    const step = document.getElementById('payStep');
    const { data, error } = await PB.client().rpc('redeem_code', { p_code: code, p_project: PB.currentId() });
    const msg = { inconnu: 'Ce code n\'existe pas. Vérifie les caractères.', deja_utilise: 'Ce code a déjà été utilisé.', projet: 'Ouvre d\'abord le projet auquel appliquer ce Pass Dossier.', auth: 'Connecte-toi pour activer un code.' };
    if (error || !data || !data.ok) { if (step) step.innerHTML = `<p class="al warn"><span>${esc(msg[data && data.error] || (error && error.message) || 'Activation impossible.')}</span></p>`; return; }
    await load(true); close(); toast(`${data.plan === 'pro' ? 'PlanBiz Pro' : 'Pass Dossier'} activé jusqu'au ${fmtD(data.ends_at)}.`);
  }

  // ----- blocage des exports payants -----
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]'); if (!b || !GATED.has(b.dataset.act) || hasAccess()) return;
    if (ent === null) { e.preventDefault(); e.stopImmediatePropagation(); await load(); if (hasAccess()) { b.click(); return; } open('Cet export fait partie du Pass Dossier et de PlanBiz Pro.'); return; }
    e.preventDefault(); e.stopImmediatePropagation(); open('Cet export fait partie du Pass Dossier et de PlanBiz Pro.');
  }, true);
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pay]'); if (!b) return;
    const k = b.dataset.pay;
    if (k === 'close') close(); else if (k === 'open') { const m = document.querySelector('.menu-pop'); if (m) m.remove(); open(); } else startPay(k, b.dataset.plan);
  });
  document.addEventListener('submit', e => { if (e.target.id !== 'payCode') return; e.preventDefault(); const v = document.getElementById('payCodeIn').value.trim(); if (v) redeem(v); });

  // retour depuis la page de paiement CMI
  const q = new URLSearchParams(location.search).get('paiement');
  if (q) { setTimeout(() => { toast(q === 'ok' ? 'Paiement reçu. Ton accès est activé dans quelques secondes.' : 'Le paiement n\'a pas abouti. Tu n\'as pas été débité.'); load(true); }, 1200); try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { } }

  return { open, load, hasAccess, active, enabled: () => !!C().enabled };
})();
