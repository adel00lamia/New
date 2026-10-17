/* ================= PlanBiz : analyse IA par section + revue complète ================= */
(function () {
'use strict';
const SKIP = ['accueil', 'questionnaire', 'importia'];
const yr = a => (a || []).map(v => Math.round(v || 0));
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]));
function sectionData(id) {
  const K = R.K, P = R.P, C = R.C;
  switch (id) {
    case 'identite': return S.id;
    case 'equipe': return { fondateurs: S.founders, personnel: S.staff.map(p => ({ poste: p.nom, contrat: p.contrat, entree: p.debut, net: p.net })), coutEquipe: yr(K.teamCost), coutEquipeSurCA: K.teamRatio, effectifFinAnnee: K.head };
    case 'vision': return S.vision;
    case 'marche': return { ...S.market, tailleCalculee: { TAM: yr(K.tam), SAM: yr(K.sam), SOM: yr(K.som), caSurSom: K.caSom } };
    case 'offre': return { bmc: S.bmc, prix: S.pricing, partenaires: S.partners };
    case 'marketing': return { ...S.mkt, budgetAnnuel: yr(K.mkt), marketingSurCA: K.mktRatio, cac: yr(K.cac) };
    case 'plan': return S.plan;
    case 'pestel': return S.pestel;
    case 'swot': return S.swot;
    case 'risques': return S.risks;
    case 'hypotheses': return { ...pick(S.hyp, ['profil', 'statut', 'start', 'ventes', 'saison', 'inflation', 'inflPrix', 'delaiClient', 'delaiFourn', 'coussin', 'distrib']), regime: R.flags };
    case 'offres': return K.offerCA.map(o => ({ offre: o.nom, cible: o.cible, prix: yr(o.prix), coutVariableUnitaire: yr(o.cu), volumeAnnuel: yr(o.vol), ca: yr(o.ca), margeSurCoutVariable: o.ca.map((c, i) => c ? +((c - o.cv[i]) / c).toFixed(2) : null) }));
    case 'investissements': return { investissements: S.inv.map(i => pick(i, ['label', 'type', 'date', 'montant', 'mode', 'nb'])), dotations: yr(P.dot), immobilisationsNettes: yr(R.B.slice(1).map(b => b.actifImmo)) };
    case 'charges': return { recurrentes: S.fixRec.map(f => ({ charge: f.label, mensuel: f.m, debut: f.debut })), ponctuelles: S.fixPon, parRubrique: Object.fromEntries(E.RUB.map((r, i) => [r, yr(R.rub[i])])) };
    case 'financements': return { sources: S.fin, emprunts: S.loans, tresorerieMin: Math.round(C.min), moisTresoMin: mLong(C.minM), fondsALever: Math.round(C.fonds), coussin: S.hyp.coussin, endettement: K.gearing, autonomie: K.autonomie };
    case 'tableau': return { ca: yr(P.ca), croissance: K.growth, ebe: yr(P.ebe), tauxEbe: K.tebe, rn: yr(P.rn), seuil: yr(P.sr), bfr: yr(K.bfr), tresoFin: yr(K.cashEnd), pointMort: C.pointMort ? mLong(C.pointMort) : null, margeBrute: K.gm, ltvCac: K.ltvCac, payback: K.payback, runway: K.runway, alertes: R.alerts.map(a => a[1]) };
    case 'scenarios': return [0, 1, 2].map(i => { const r = E.run(S, L, i); return { scenario: ['Pessimiste', 'Réaliste', 'Optimiste'][i], ca: yr(r.P.ca), rn: yr(r.P.rn), tresoMin: Math.round(r.C.min), fondsALever: Math.round(r.C.fonds) }; });
    case 'etats': return { cpc: { ca: yr(P.ca), chargesExploitation: yr(P.chExp), resultatExploitation: yr(P.rex), interets: yr(P.int), impot: yr(P.impot), rn: yr(P.rn), caf: yr(P.caf) }, bilan: R.B.slice(1).map(b => ({ actifImmo: Math.round(b.actifImmo), bfr: Math.round(b.bfr), tresorerie: Math.round(b.cash), capitauxPropres: Math.round(b.cp), dettes: Math.round(b.dettesFin) })) };
    case 'bp': return { strategie: S.strategy };
    default: return {};
  }
}
const busy = {};
function scoreClass(n) { return n >= 7 ? 'good' : n >= 5 ? 'warn' : 'crit'; }
function resultHTML(a) {
  const pr = { haute: 'crit', moyenne: 'warn', basse: 'mut' };
  return `<div class="rv-head"><span class="rv-score ${scoreClass(a.note)}">${a.note}<small>/10</small></span><p class="rv-verdict">${esc(a.verdict || '')}</p></div>
   <div class="rv-grid">${(a.forces || []).length ? `<div><h4 class="pos">Points forts</h4><ul>${a.forces.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
   ${(a.faiblesses || []).length ? `<div><h4 class="neg">Points à renforcer</h4><ul>${a.faiblesses.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}</div>
   ${(a.recommandations || []).length ? `<h4>Recommandations</h4><ol class="rv-reco">${a.recommandations.map(r => `<li><span class="pill ${pr[r.priorite] || 'mut'}">${esc(r.priorite || '')}</span> <b>${esc(r.action || '')}</b>${r.pourquoi ? ` <span class="muted">— ${esc(r.pourquoi)}</span>` : ''}</li>`).join('')}</ol>` : ''}
   ${(a.questions_investisseur || []).length ? `<h4>Questions qu'un financeur posera</h4><ul>${a.questions_investisseur.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
   <p class="small muted" style="margin-top:8px">Analyse du ${new Date(a.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · à relancer après tes modifications. L'IA ne consulte pas internet : vérifie les chiffres de marché.</p>`;
}
function fullHTML(f) {
  const map = Object.fromEntries(SECTIONS.map(s => [s.id, s.title]));
  return `<div class="rv-head"><span class="rv-score big ${scoreClass(f.note_globale)}">${f.note_globale}<small>/10</small></span><div><p class="rv-verdict">${esc(f.synthese || '')}</p>${f.pret_a_presenter !== undefined ? `<p><span class="pill ${f.pret_a_presenter ? 'good' : 'warn'}">${f.pret_a_presenter ? 'Prêt à présenter' : 'À retravailler avant de présenter'}</span></p>` : ''}</div></div>
   ${(f.top_priorites || []).length ? `<h4>Les priorités</h4><ol class="rv-reco">${f.top_priorites.map(x => `<li><b>${esc(x)}</b></li>`).join('')}</ol>` : ''}
   <div class="tw" style="margin-top:10px"><table><tr><th>Partie du BP</th><th class="n">Note</th><th>Constat</th><th>Recommandation</th><th></th></tr>
   ${(f.sections || []).map(x => `<tr><td><b>${esc(map[x.id] || x.id)}</b></td><td class="n"><span class="pill ${scoreClass(x.note)}">${x.note}/10</span></td><td>${esc(x.constat || '')}</td><td>${esc(x.recommandation || '')}</td><td>${map[x.id] ? `<button class="btn sm" data-go="${x.id}">Ouvrir</button>` : ''}</td></tr>`).join('')}</table></div>
   <p class="small muted" style="margin-top:8px">Revue du ${new Date(f.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.</p>`;
}
function block(id) {
  if (SKIP.includes(id) || typeof S === 'undefined' || !S) return '';
  const ai = (S.ai || {})[id]; const demo = window.PB && PB.isDemo();
  const full = id === 'tableau' ? `<section class="card rv" id="rv-full"><div class="row"><span class="rv-ico">✦</span><div><h3>Revue IA du business plan complet</h3><p class="sub" style="margin:0">Une note sur 10 pour chaque partie, les points faibles et les priorités avant de présenter à un financeur.</p></div><span class="sp"></span><button class="btn pri ai" data-rv="full" ${demo ? 'disabled' : ''}>${S.ai && S.ai.full ? 'Relancer la revue' : 'Lancer la revue complète'}</button></div><div class="rv-body">${S.ai && S.ai.full ? fullHTML(S.ai.full) : demo ? '<p class="hp-note" style="margin-top:10px">Disponible avec un compte (gratuit).</p>' : ''}</div></section>` : '';
  const sec = SECTIONS.find(s => s.id === id);
  return full + `<section class="card rv" id="rv-${id}"><div class="row"><span class="rv-ico">✦</span><div><h3>Analyse IA : ${esc(sec ? sec.title : '')}</h3><p class="sub" style="margin:0">Une lecture critique de cette partie, avec des recommandations concrètes et les questions qu'un financeur posera.</p></div><span class="sp"></span><button class="btn ai ${ai ? '' : 'pri'}" data-rv="${id}" ${demo ? 'disabled' : ''}>${ai ? 'Relancer l\'analyse' : 'Analyser cette partie'}</button></div>
   <div class="rv-body">${ai ? resultHTML(ai) : demo ? '<p class="hp-note" style="margin-top:10px">Disponible avec un compte (gratuit).</p>' : ''}</div></section>`;
}
async function analyze(id, btn) {
  if (busy[id]) return; busy[id] = true;
  const box = document.querySelector(`#rv-${id === 'full' ? 'full' : id} .rv-body`);
  btn.disabled = true; const old = btn.textContent; btn.textContent = 'Analyse en cours…';
  if (box) box.innerHTML = '<div class="ai-out">Claude lit ton business plan… (20 à 60 secondes)</div>';
  try {
    let prompt, d;
    if (id === 'full') {
      const ids = SECTIONS.filter(s => !SKIP.includes(s.id) && !['etats', 'bp'].includes(s.id)).map(s => s.id);
      const all = Object.fromEntries(ids.map(k => [k, sectionData(k)]));
      prompt = `${AI_CTX}\n\nTu es aussi un analyste d'incubateur qui évalue des business plans avant un comité d'investissement.\n\nVoici un business plan complet, partie par partie (JSON) :\n${JSON.stringify(all).slice(0, 180000)}\n\nÉvalue chaque partie de 0 à 10 (0 = vide, 5 = correct mais incomplet, 8 = solide, 10 = excellent). Une partie vide reçoit 0 à 2. Vérifie la cohérence entre les parties (marché vs CA, équipe vs ambitions, financement vs trésorerie).\nRéponds UNIQUEMENT avec un JSON : {"note_globale":0,"synthese":"3 phrases","pret_a_presenter":false,"top_priorites":["action 1","action 2","action 3"],"sections":[{"id":"identifiant exact","note":0,"constat":"1 phrase","recommandation":"1 phrase actionnable"}]}\nIdentifiants à utiliser, dans cet ordre : ${ids.join(', ')}.`;
    } else {
      const sec = SECTIONS.find(s => s.id === id);
      prompt = `${AI_CTX}\n\nTu analyses UNE partie d'un business plan, comme le ferait un chargé d'affaires d'incubateur ou de banque.\n\nPartie analysée : « ${sec.title} » (${sec.lead})\nDonnées de cette partie (JSON) :\n${JSON.stringify(sectionData(id)).slice(0, 60000)}\n\nContexte général du projet (JSON) :\n${brief()}\n\nDonne une analyse critique, précise et chiffrée quand c'est possible. Si la partie est vide ou très incomplète, dis-le et explique quoi remplir en priorité.\nRéponds UNIQUEMENT avec un JSON : {"note":0,"verdict":"2 phrases","forces":["…"],"faiblesses":["…"],"recommandations":[{"action":"verbe + résultat attendu","pourquoi":"…","priorite":"haute|moyenne|basse"}],"questions_investisseur":["…"]}\nnote de 0 à 10 ; 2 à 4 forces ; 2 à 4 faiblesses ; 3 à 5 recommandations ; 2 à 3 questions.`;
    }
    d = await sampleFn.json(prompt, {});
    d.date = new Date().toISOString();
    S.ai = S.ai || {}; S.ai[id] = d; save();
    if (box) box.innerHTML = id === 'full' ? fullHTML(d) : resultHTML(d);
    btn.textContent = id === 'full' ? 'Relancer la revue' : 'Relancer l\'analyse'; btn.classList.remove('pri');
  } catch (e) {
    const m = (e && e.message) || 'service indisponible';
    if (box) box.innerHTML = `<div class="al warn">L'analyse n'a pas pu aboutir : ${esc(String(m).slice(0, 200))}</div>`;
    btn.textContent = old;
  } finally { btn.disabled = false; busy[id] = false; }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-rv]'); if (!b) return; if (typeof sampleFn !== 'function') { toast('IA indisponible.'); return; } analyze(b.dataset.rv, b); });
window.PBReview = { block, sectionData };
})();
