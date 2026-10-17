/* ================= PlanBiz : assistant d'aide, visite guidée, vidéo ================= */
(function () {
'use strict';
const CFG = window.PLANBIZ_CONFIG || {};
const GUIDE = `Guide de l'application PlanBiz :
- Mes business : liste des business de l'utilisateur. « + Nouveau business » propose 4 départs : questionnaire express, import depuis mon IA, business vierge, modèle d'exemple (SAQYA Tech, startup fictive).
- Démarrer > Questionnaire express : 13 questions (projet, profil, statut, calendrier, offres, fondateurs, recrutements, charges, investissements, financements, délais) qui génèrent un BP chiffré.
- Démarrer > Importer depuis mon IA : copier le template PlanBiz dans ChatGPT/Claude/Gemini, recoller la réponse JSON ; ou coller ses notes dans l'IA intégrée. Aperçu avant import.
- Le projet : Identité, Équipe & personnel (salaires NETS, l'outil calcule brut, CNSS/AMO, IR, coût employeur), Cadrage & vision, Marché clients & benchmark (TAM/SAM/SOM), Offre & business model (BMC), Communication & marketing (canaux et budgets mensuels), Plan d'actions & Gantt, Analyse PESTEL, SWOT & stratégies (TOWS), Risques.
- Les chiffres : Hypothèses (statut juridique par année, dates, saisonnalité, inflation, délais clients/fournisseurs, trésorerie de sécurité, dividendes), Produits & charges variables (jusqu'à 15 offres : prix HT, volumes MENSUELS par scénario, coûts variables unitaires), Investissements (amortissement selon barème DGI), Charges fixes (mensuelles HT, périodicité), Financements (apports, subventions, prêts avec différé).
- Résultats : Tableau de bord (indicateurs, alertes, métriques startup MRR/CAC/LTV), Scénarios & stress test, États financiers (CPC, trésorerie 36 mois, bilan, affectation), Ressources : Glossaire (255 termes expliqués) et Choisir son statut (comparatif détaillé des statuts juridiques). Chaque section a aussi un « Guide de cette étape » repliable en haut. Conformité & loi de finances 2026 (mesures LF 2026 qui concernent le projet, régime fiscal et social par année, calendrier des paiements TVA/CNSS/IR/IS, comparaison des statuts juridiques, check-list des obligations légales), Business plan & exports (PDF, HTML, Excel, JSON).
- Boutons IA dans Marché, PESTEL, SWOT et Stratégie. Le bandeau du haut : scénario actif et 4 indicateurs en direct. Les cases ocre sont des hypothèses.
- Règles 2026 utilisées : IS 20 %, cotisation minimale 0,25 % (exonérée 36 mois), TVA 20 %, auto-entrepreneur IR 0,5 % ou 1 % du CA, CNSS/AMO, barème IR 2025-2026.`;

/* ---------- help chat ---------- */
let msgs = [], busy = false, ctl = null;
function context(q) {
  let c = GUIDE;
  try {
    if (typeof S !== 'undefined' && S && typeof R !== 'undefined' && R && document.body.dataset.screen === 'editor') {
      const sec = SECTIONS.find(x => x.id === view);
      c += `\n\nL'utilisateur est dans la section « ${sec ? sec.title : view} ». Business ouvert : ${S.id.nom || 'sans nom'} (${S.id.secteur || 'secteur non précisé'}), statut ${R.flags.stat.join(' → ')}, profil ${S.hyp.profil}, scénario ${S.hyp.scenario}.`
        + `\nChiffres : CA ${R.P.ca.map(v => Math.round(v)).join(' / ')} DH ; EBE ${R.P.ebe.map(v => Math.round(v)).join(' / ')} ; résultat net ${R.P.rn.map(v => Math.round(v)).join(' / ')} ; trésorerie la plus basse ${Math.round(R.C.min)} DH (mois ${R.C.minM}) ; fonds à lever ${Math.round(R.C.fonds)} DH ; point mort ${R.C.pointMort ? 'mois ' + R.C.pointMort : 'non atteint'}.`
        + `\nOffres : ${(S.offers || []).map(o => o.nom).join(', ') || 'aucune'}. Effectif fin an 3 : ${R.K.head[2]}.`
        + `\nAlertes : ${R.alerts.map(a => a[1]).join(' | ') || 'aucune'}.`;
    } else c += `\n\nL'utilisateur est sur la page « ${document.body.dataset.screen === 'hub' ? 'Mes business' : 'accueil'} ».`;
  } catch (e) { }
  try {
    if (typeof EDU !== 'undefined') {
      const g = (EDU.data.guides[view] || [])[0];
      if (g && g.intro && document.body.dataset.screen === 'editor') c += `\n\nGuide de la section (formateur) : ${g.intro.slice(0, 900)}`;
      const terms = EDU.termsFor(q || '');
      if (terms.length) c += `\n\nDéfinitions du glossaire PlanBiz à utiliser telles quelles :\n- ${terms.join('\n- ').slice(0, 5000)}`;
    }
  } catch (e) { }
  return c;
}
const SUGG = ['Par où commencer ?', 'Pourquoi ma trésorerie descend ?', 'Comment remplir mes offres ?', 'Quel statut juridique choisir ?', 'Explique-moi mon tableau de bord'];
function md(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#+\s*(.+)$/gm, '<b>$1</b>').replace(/^[-•]\s+/gm, '• ').replace(/\n/g, '<br>'); }
function panelHTML() {
  const can = window.PB && PB.hasAccount() && !PB.isDemo();
  return `<div class="hp-head"><div><b>Assistant PlanBiz</b><small>Questions sur l'outil ou sur ton business plan</small></div><button class="iconbtn" data-hp="close" title="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
  <div class="hp-body" id="hpBody">
   <div class="hp-msg bot">Bonjour 👋 Je t'aide à utiliser PlanBiz et à comprendre tes chiffres. Pose ta question, ou lance la visite guidée.</div>
   ${msgs.map(m => `<div class="hp-msg ${m.role === 'user' ? 'me' : 'bot'}">${m.role === 'user' ? esc(m.content) : md(m.content)}</div>`).join('')}
   ${!msgs.length ? `<div class="hp-sugg">${SUGG.map(q => `<button data-hp="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>` : ''}
   ${!can ? `<div class="hp-note">${PB && PB.isDemo() ? 'En démo, l\'assistant IA est désactivé. Crée ton compte gratuit pour lui poser des questions.' : 'Connecte-toi pour poser tes questions à l\'assistant.'}</div>` : ''}
  </div>
  <div class="hp-actions"><button class="btn sm" data-hp="tour">Visite guidée</button><button class="btn sm ghost" data-hp="video">▶ Vidéo</button>${msgs.length ? '<button class="btn sm ghost" data-hp="reset">Nouvelle conversation</button>' : ''}</div>
  <form class="hp-form" id="hpForm"><textarea class="in" id="hpIn" rows="2" placeholder="${can ? 'Écris ta question…' : 'Assistant réservé aux comptes'}" ${can ? '' : 'disabled'}></textarea><button class="btn pri" type="submit" ${can ? '' : 'disabled'} aria-label="Envoyer">➤</button></form>`;
}
function openPanel() { let p = document.getElementById('hpPanel'); if (!p) { p = document.createElement('aside'); p.id = 'hpPanel'; p.className = 'hp'; document.body.appendChild(p); } p.innerHTML = panelHTML(); p.hidden = false; const b = document.getElementById('hpBody'); b.scrollTop = b.scrollHeight; const i = document.getElementById('hpIn'); if (i && !i.disabled) i.focus(); }
function closePanel() { const p = document.getElementById('hpPanel'); if (p) p.hidden = true; }
async function ask(q) {
  q = (q || '').trim(); if (!q || busy) return;
  if (!(window.PB && PB.hasAccount() && !PB.isDemo())) { openPanel(); return; }
  msgs.push({ role: 'user', content: q }); msgs.push({ role: 'assistant', content: '…' }); busy = true; openPanel();
  const bubbles = document.querySelectorAll('#hpBody .hp-msg.bot'); const bub = bubbles[bubbles.length - 1];
  try {
    const t = await PB.token(); ctl = new AbortController();
    const r = await fetch(CFG.aiEndpoint || '/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t }, body: JSON.stringify({ mode: 'help', context: context(q), messages: msgs.slice(0, -1) }), signal: ctl.signal });
    if (!r.ok) throw new Error(await r.text());
    const rd = r.body.getReader(), dec = new TextDecoder(); let text = '';
    for (;;) { const { value, done } = await rd.read(); if (done) break; text += dec.decode(value, { stream: true }); bub.innerHTML = md(text); const b = document.getElementById('hpBody'); b.scrollTop = b.scrollHeight; }
    msgs[msgs.length - 1].content = text.split('[[PLANBIZ_ERROR]]')[0] || 'Je n\'ai pas pu répondre, réessaie.';
  } catch (e) { msgs[msgs.length - 1].content = 'Désolé : ' + (e.message || 'service indisponible').slice(0, 200); }
  busy = false; openPanel();
}
const fab = document.createElement('button'); fab.id = 'pbHelpBtn'; fab.className = 'fab'; fab.type = 'button'; fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M9.5 9a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1M12 14.5v.01"/></svg><span>Aide</span>'; fab.setAttribute('aria-label', 'Ouvrir l\'assistant d\'aide');
document.body.appendChild(fab);
fab.addEventListener('click', () => { const p = document.getElementById('hpPanel'); if (p && !p.hidden) closePanel(); else openPanel(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-hp]'); if (!b) return; const k = b.dataset.hp;
  if (k === 'close') closePanel(); else if (k === 'ask') ask(b.dataset.q); else if (k === 'reset') { msgs = []; openPanel(); }
  else if (k === 'tour') { closePanel(); Tour.start(); } else if (k === 'video') { closePanel(); video(); }
});
document.addEventListener('submit', e => { if (e.target.id !== 'hpForm') return; e.preventDefault(); const i = document.getElementById('hpIn'); const v = i.value; i.value = ''; ask(v); });
document.addEventListener('keydown', e => { if (e.target.id === 'hpIn' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('hpForm').requestSubmit(); } });

/* ---------- guided tour ---------- */
const STEPS = [
  { view: 'tableau', sel: '.rail', title: 'Ton parcours en 19 étapes', text: 'Le menu suit l\'ordre d\'un business plan : le projet, puis les chiffres, puis les résultats. Un point vert indique une section remplie.' },
  { sel: '.bizchip', title: 'Le business ouvert', text: 'Tu peux gérer plusieurs business. Clique ici pour revenir à « Mes business », en créer un autre ou le dupliquer.' },
  { sel: '.seg', title: 'Trois scénarios', text: 'Passe de pessimiste à optimiste : les volumes de vente changent et tout le business plan se recalcule instantanément.' },
  { sel: '.kpis', title: 'Tes indicateurs en direct', text: 'Chiffre d\'affaires, résultat, trésorerie la plus basse et fonds à lever se mettent à jour à chaque saisie.' },
  { sel: '#content .tiles', title: 'Le tableau de bord', text: 'Les chiffres-clés sur 3 ans, les alertes (trésorerie, cohérence avec le marché) et les métriques que regardent les investisseurs.' },
  { view: 'questionnaire', sel: '#content .qcard', title: 'Démarrer en 10 minutes', text: 'Le questionnaire express pose 13 questions simples et construit un premier business plan chiffré.' },
  { view: 'importia', sel: '#content .grid.g2', title: 'Ou importer depuis ton IA', text: 'Copie le template dans ChatGPT, Claude ou Gemini avec tes documents, puis recolle sa réponse : tout le BP est rempli.' },
  { view: 'offres', sel: '#content section.card .tw', title: 'Tes offres et tes prix', text: 'Pour chaque offre : prix HT, volume vendu PAR MOIS pour chaque scénario et coût variable par unité. Le CA et les marges se calculent seuls.' },
  { view: 'etats', sel: '#content .tabs', title: 'Les états financiers', text: 'Compte de produits et charges, trésorerie mois par mois sur 36 mois, bilan et affectation du résultat, selon les règles marocaines 2026.' },
  { view: 'scenarios', sel: '#content section.card', title: 'Scénarios & stress test', text: 'Compare les 3 scénarios et teste la résistance du projet : baisse des prix, retard de lancement, hausse des coûts.' },
  { view: 'bp', sel: '#content section.card, #content .card', title: 'Ton business plan prêt à présenter', text: 'Le document se rédige à partir de tes chiffres. Imprime-le en PDF ou exporte les tableaux en Excel.' },
  { sel: '#pbHelpBtn', title: 'Une question ?', text: 'L\'assistant répond à tes questions sur l\'outil et sur tes chiffres. Tu peux relancer cette visite depuis ce bouton.' }
];
let ti = 0, auto = null, layer = null;
function place() {
  const st = STEPS[ti]; if (!layer) return;
  const el = st.sel ? [...document.querySelectorAll(st.sel)].find(x => x.offsetParent !== null || x.id === 'pbHelpBtn') : null;
  const hole = layer.querySelector('.tour-hole'), card = layer.querySelector('.tour-card');
  card.innerHTML = `<p class="tour-n">Étape ${ti + 1} sur ${STEPS.length}</p><h3>${st.title}</h3><p>${st.text}</p><div class="tour-dots">${STEPS.map((_, k) => `<i class="${k === ti ? 'on' : ''}"></i>`).join('')}</div>
   <div class="row" style="justify-content:space-between;margin-top:12px"><button class="btn sm ghost" data-tour="end">Quitter</button><span class="row">${ti ? '<button class="btn sm" data-tour="prev">Précédent</button>' : ''}<button class="btn sm pri" data-tour="next">${ti === STEPS.length - 1 ? 'Terminer' : 'Suivant'}</button></span></div>`;
  const vw = window.innerWidth, vh = window.innerHeight;
  if (el) {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = el.getBoundingClientRect(), pad = 6;
    const top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad), w = Math.min(vw - left - 4, r.width + pad * 2), h = Math.min(vh - top - 4, r.height + pad * 2);
    Object.assign(hole.style, { display: 'block', top: top + 'px', left: left + 'px', width: w + 'px', height: h + 'px' });
    const cw = Math.min(340, vw - 24), ch = card.offsetHeight || 190;
    let cx, cy;
    if (left + w + cw + 16 < vw) { cx = left + w + 12; cy = Math.min(Math.max(12, top), vh - ch - 12); }
    else if (top + h + ch + 16 < vh) { cx = Math.min(Math.max(12, left), vw - cw - 12); cy = top + h + 12; }
    else if (top - ch - 16 > 0) { cx = Math.min(Math.max(12, left), vw - cw - 12); cy = top - ch - 12; }
    else { cx = (vw - cw) / 2; cy = vh - ch - 20; }
    Object.assign(card.style, { left: cx + 'px', top: cy + 'px', width: cw + 'px' });
  } else {
    hole.style.display = 'none';
    Object.assign(card.style, { left: Math.max(12, (vw - Math.min(340, vw - 24)) / 2) + 'px', top: Math.max(20, vh / 2 - 110) + 'px', width: Math.min(340, vw - 24) + 'px' });
  }
}
function showStep(k) {
  ti = Math.max(0, Math.min(STEPS.length - 1, k)); const st = STEPS[ti];
  if (st.view && typeof go === 'function' && typeof S !== 'undefined' && S && view !== st.view) { go(st.view); }
  setTimeout(place, 120);
}
const Tour = {
  start(opts = {}) {
    if (document.body.dataset.screen !== 'editor') { toast('Ouvre un business pour lancer la visite guidée.'); return; }
    if (!layer) { layer = document.createElement('div'); layer.className = 'tour'; layer.innerHTML = '<div class="tour-hole"></div><div class="tour-card" role="dialog" aria-live="polite"></div>'; document.body.appendChild(layer); }
    layer.hidden = false; showStep(0);
    if (opts.autoMs) { clearInterval(auto); auto = setInterval(() => { if (ti >= STEPS.length - 1) { clearInterval(auto); setTimeout(Tour.end, opts.autoMs); return; } showStep(ti + 1); }, opts.autoMs); }
  },
  end() { clearInterval(auto); if (layer) layer.hidden = true; },
  video
};
document.addEventListener('click', e => { const b = e.target.closest('[data-tour]'); if (!b) return; const k = b.dataset.tour; if (k === 'end') Tour.end(); else if (k === 'prev') showStep(ti - 1); else if (k === 'next') { if (ti === STEPS.length - 1) Tour.end(); else showStep(ti + 1); } });
document.addEventListener('keydown', e => { if (!layer || layer.hidden) return; if (e.key === 'Escape') Tour.end(); if (e.key === 'ArrowRight') showStep(ti + 1); if (e.key === 'ArrowLeft') showStep(ti - 1); });
window.addEventListener('resize', () => { if (layer && !layer.hidden) place(); });

/* ---------- video ---------- */
function video() {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal vmodal"><div class="row" style="margin-bottom:10px"><h3>PlanBiz en 1 minute</h3><span class="sp"></span><button class="iconbtn" data-x="no" title="Fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
   <video src="/media/planbiz-demo.mp4" poster="/media/planbiz-demo.jpg" controls autoplay muted playsinline preload="metadata"></video>
   <p class="small muted" style="margin-top:8px">Démonstration sur le modèle d'exemple SAQYA Tech (startup fictive).</p>
   <div class="row" style="margin-top:12px;justify-content:flex-end">${window.PB && !PB.hasAccount() && !PB.isDemo() ? '<button class="btn pri" data-pb="demo" data-x="go">Essayer la démo</button>' : ''}</div></div>`;
  document.body.appendChild(bg);
  bg.addEventListener('click', e => { const x = e.target.closest('[data-x]'); if (e.target === bg || (x && x.dataset.x === 'no')) bg.remove(); else if (x && x.dataset.x === 'go') bg.remove(); });
}
window.PBTour = Tour;
})();
