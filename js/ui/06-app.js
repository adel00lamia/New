/* ================= Accueil, questionnaire, document, IA, exports, app ================= */
const PROFILS = L.L_Profil || ['Startup tech / innovante (forte croissance)', 'TPME (commerce, services, production)', 'Coopérative / association / projet à impact'];
SECTIONS.unshift(
  { id: 'accueil', group: 'Démarrer', title: 'Accueil', lead: '', render: renderHome, done: () => 2 },
  { id: 'questionnaire', group: 'Démarrer', title: 'Questionnaire express', lead: '', render: renderQuiz, done: () => S.quiz && S.quiz.done ? 2 : S.quiz ? 1 : 0 },
  { id: 'importia', group: 'Démarrer', title: 'Importer depuis mon IA', lead: '', render: renderImportIA, done: () => S.meta && S.meta.source === 'PlanBiz IA' ? 2 : 0 });
function renderHome() {
  const st = SECTIONS.filter(s => !['accueil', 'questionnaire', 'importia'].includes(s.id));
  return `<p class="eyebrow">Business plan 3 ans · Maroc 2026</p>
  <h1 style="font-size:32px;margin:6px 0 4px">PlanBiz</h1><p style="font-family:var(--display);font-size:18px;margin-bottom:8px">Ton business plan dynamique${S.id.nom ? ` · projet en cours : <b>${esc(S.id.nom)}</b>${S.meta && S.meta.example ? ' <span class="pill warn">modèle d\'exemple</span>' : ''}` : ''}</p>
  <p class="lead">Réponds aux questions ou remplis chaque section : le compte de produits et charges, la trésorerie sur 36 mois, le bilan, les indicateurs investisseurs et le document de business plan se recalculent à chaque saisie. Fiscalité, TVA, CNSS/AMO et IR selon les règles marocaines 2026.</p>
  <div class="grid g2" style="margin-bottom:18px">
   <div class="card" style="margin:0"><h3>1. Questionnaire express</h3><p class="sub">15 questions simples pour obtenir un premier business plan chiffré en 10 minutes.</p><button class="btn pri" data-go="questionnaire">Répondre aux questions</button></div>
   <div class="card" style="margin:0;border-color:var(--primary)"><h3>2. Importer depuis mon IA</h3><p class="sub">Donne le template PlanBiz à ton IA (ChatGPT, Claude, Gemini…) ou colle tes notes dans l'IA intégrée : tout le BP est généré et relié à l'application.</p><button class="btn pri ai" data-go="importia">Relier mon IA</button></div>
   <div class="card" style="margin:0"><h3>3. Voir le modèle d'exemple</h3><p class="sub">SAQYA Tech n'est qu'un modèle : une startup agritech fictive entièrement remplie, pour voir à quoi ressemble un BP complet.</p><button class="btn" data-act="loadExample">Charger le modèle</button></div>
   <div class="card" style="margin:0"><h3>4. Projet vierge</h3><p class="sub">Toutes les sections vides, à remplir dans l'ordre du parcours. Tu peux aussi importer un projet sauvegardé.</p><div class="row"><button class="btn" data-act="newBlank">Commencer à zéro</button><label class="btn ghost" for="importFile">Importer (.json)</label><input type="file" id="importFile" accept=".json,application/json" hidden></div></div>
  </div>
  ${card('Réglages globaux', 'À choisir en premier : ils s\'appliquent à tout le business plan.', `<div class="grid g2">
   ${fSel('hyp.profil', 'Profil du projet', PROFILS, { hyp: true, help: 'Adapte les repères du tableau de bord (croissance, marges, ratios).' })}
   ${fSel('hyp.scenario', 'Scénario actif', SC, { hyp: true, help: 'Change les volumes de vente de chaque offre ; tout se recalcule.' })}</div>`)}
  ${card('Mon parcours', 'Les sections dans l\'ordre. Le point se remplit à mesure que tu avances.', `<div class="tw"><table>${st.map((s, i) => { const d = s.done(); return `<tr><td class="mono small muted" style="width:32px">${i + 1}</td><td><a href="#${s.id}" data-go="${s.id}">${s.title}</a></td><td class="small muted">${s.group}</td><td><span class="pill ${d === 2 ? 'good' : d === 1 ? 'warn' : 'mut'}">${d === 2 ? 'Rempli' : d === 1 ? 'En cours' : 'À faire'}</span></td></tr>`; }).join('')}</table></div>`)}
  <details class="help"><summary>Code couleur et méthode</summary><p style="margin-top:6px">Les champs blancs se remplissent librement (les listes proposent des choix mais acceptent ton texte). Les champs ocre sont des hypothèses. Les tableaux gris sont calculés. Les données restent dans ton navigateur : exporte ton projet (.json) pour le sauvegarder ou le transmettre. PlanBiz reprend le modèle de calcul Business Plan V4.1 (startups, TPME & coopératives).</p></details>`;
}

/* ---- Questionnaire ---- */
function quizInit() {
  if (S.quiz) return;
  S.quiz = { step: 0, nom: S.meta.example ? '' : S.id.nom, pitch: '', secteur: '', activite: '', ville: '', profil: S.hyp.profil, statut: 'SARL', start: nextJan(), ventes: '', offers: [{ nom: '', modele: '', cible: '', prix: '', cout: '', vol: ['', '', ''] }], ecart: 0.3, nbFond: 2, netFond: 8000, capital: 100000, recrues: [], loyer: '', autres: '', mkt: '', inv: [], levee: '', leveeDate: '', honneur: '', banque: '', banqueTaux: 0.06, banqueDuree: 60, subv: '', delaiClient: 30, delaiFourn: 30, saison: 'Régulière (100 % tous les mois)' };
}
const QSTEPS = [
  ['Ton projet en une phrase', 'Le nom et le pitch ouvrent ton business plan et la synthèse.', () => `<div class="grid g2">${fText('quiz.nom', 'Nom du projet', { ph: 'Ex. Atlas Ritual' })}${fText('quiz.ville', 'Ville')}</div>${fText('quiz.pitch', 'Pitch : qui, quoi, pour qui, pourquoi toi ?', { area: true, ph: 'Ex. Nous aidons les PME de Casablanca à …' })}<div class="grid g2" style="margin-top:12px">${fText('quiz.secteur', 'Secteur', { list: 'L_Secteur' })}${fText('quiz.activite', 'Activité principale', { list: 'L_Activite' })}</div>`],
  ['Quel type de projet ?', 'Le profil adapte les repères : une startup vise ×2 à ×3 par an, une TPME une croissance régulière et une marge solide.', () => `<div class="opts">${PROFILS.map(p => `<button class="opt ${S.quiz.profil === p ? 'on' : ''}" data-qset="profil" data-v="${esc(p)}"><b>${esc(p.split('(')[0])}</b><span>${esc((p.split('(')[1] || '').replace(')', ''))}</span></button>`).join('')}</div>`],
  ['Quel statut juridique ?', 'Il décide de l\'impôt, de la TVA et de la possibilité de lever des fonds. Tu pourras le changer par année.', () => {
    const rec = S.quiz.profil.startsWith('Startup') ? 'SAS' : S.quiz.profil.startsWith('Coop') ? 'Coopérative de services' : 'SARL';
    const d = { 'Auto-Entrepreneur': 'Seul, petit CA, IR 0,5-1 % du CA', 'SARL': 'TPME, simple et répandue', 'SARL-AU': 'SARL avec un seul associé', 'SAS': 'Startups qui lèvent des fonds', 'SA': 'Grands projets, capital ≥ 300 000 DH', "Coopérative — collecte & vente en l'état": 'Producteurs regroupés', 'Coopérative — transformation': 'Transformation collective', 'Coopérative de services': 'Services aux adhérents', 'Association': 'Projet non lucratif' };
    return `<div class="opts">${(L.L_Statut || []).map(s => `<button class="opt ${S.quiz.statut === s ? 'on' : ''}" data-qset="statut" data-v="${esc(s)}"><b>${esc(s)}${s === rec ? ' · conseillé' : ''}</b><span>${esc(d[s] || '')}</span></button>`).join('')}</div>`;
  }],
  ['Ton calendrier', 'Entre le début du plan et les premières ventes, tu dépenses sans encaisser : c\'est souvent là que se creuse la trésorerie.', () => `<div class="grid g2">${fDate('quiz.start', 'Début du business plan')}${fDate('quiz.ventes', 'Premières ventes', { help: 'Ex. 2 à 6 mois après le début' })}</div>`],
  ['Que vends-tu ?', 'Une ligne par offre (3 max ici, 15 dans la section détaillée). Volume = unités vendues PAR MOIS en moyenne.', () => `${(S.quiz.offers || []).map((o, i) => `<div class="card" style="margin-bottom:10px"><div class="grid g3">${fText(`quiz.offers.${i}.nom`, `Offre ${i + 1}`, { ph: 'Ex. Abonnement mensuel' })}${fSel(`quiz.offers.${i}.modele`, 'Modèle de revenu', (L.M_PType || []).map(r => r[0]), { empty: '—' })}${fText(`quiz.offers.${i}.cible`, 'Cible', { list: 'L_Cible' })}
   ${fNum(`quiz.offers.${i}.prix`, 'Prix unitaire HT', { suf: 'DH' })}${fNum(`quiz.offers.${i}.cout`, 'Coût variable unitaire HT', { suf: 'DH', help: 'Matières, marchandise, cloud, commission…' })}<span></span>
   ${fNum(`quiz.offers.${i}.vol.0`, 'Volume / mois — An 1')}${fNum(`quiz.offers.${i}.vol.1`, 'An 2')}${fNum(`quiz.offers.${i}.vol.2`, 'An 3')}</div>${i ? `<button class="btn sm ghost" data-act="del" data-arr="quiz.offers" data-i="${i}">Retirer</button>` : ''}</div>`).join('')}
   ${(S.quiz.offers || []).length < 3 ? `<button class="btn sm" data-act="add" data-arr="quiz.offers" data-new='${esc(JSON.stringify({ nom: '', modele: '', cible: '', prix: '', cout: '', vol: ['', '', ''] }))}'>+ Ajouter une offre</button>` : ''}`],
  ['Et si ça se passe moins bien… ou mieux ?', 'Les scénarios pessimiste et optimiste appliquent cet écart à tes volumes.', () => `<div class="grid g3">${fPct('quiz.ecart', 'Écart des volumes', { help: 'Ex. 30 % : pessimiste = −30 %, optimiste = +30 %' })}</div>`],
  ['Les fondateurs', 'Combien êtes-vous, combien vous payez-vous (net) et combien apportez-vous au capital ?', () => `<div class="grid g3">${fNum('quiz.nbFond', 'Nombre de fondateurs')}${fNum('quiz.netFond', 'Salaire net mensuel par fondateur', { suf: 'DH', help: '0 si vous ne vous payez pas au début' })}${fNum('quiz.capital', 'Apport total en capital', { suf: 'DH' })}</div>`],
  ['Les recrutements', 'Qui embaucher, quand, et à quel salaire net ? Recruter après les premières ventes protège la trésorerie.', () => tableEd('quiz.recrues', [{ k: 'poste', l: 'Poste', w: 180 }, { k: 'annee', l: 'Année', t: 'sel', opts: [[1, 'An 1'], [2, 'An 2'], [3, 'An 3']], t2: 'num' }, { k: 'mois', l: 'Mois d\'entrée', t: 'sel', opts: MOIS.map((m, i) => [i + 1, m]) }, { k: 'net', l: 'Net / mois', t: 'num' }, { k: 'nb', l: 'Nombre', t: 'num' }], { add: 'Ajouter un recrutement', newRow: { poste: '', annee: 1, mois: 1, net: '', nb: 1 } })],
  ['Tes charges fixes mensuelles', 'Ce que tu paies même sans vendre. Les montants sont HT et par mois.', () => `<div class="grid g3">${fNum('quiz.loyer', 'Loyer', { suf: 'DH' })}${fNum('quiz.autres', 'Autres charges (électricité, internet, comptable, logiciels, assurances…)', { suf: 'DH' })}${fNum('quiz.mkt', 'Budget marketing mensuel', { suf: 'DH' })}</div>`],
  ['Tes investissements de départ', 'Les biens durables : matériel, informatique, aménagement, véhicule, développement de la plateforme…', () => tableEd('quiz.inv', [{ k: 'label', l: 'Libellé', w: 200 }, { k: 'type', l: 'Type', t: 'sel', opts: (L.InvTypes || []).map(r => r[0]), w: 240 }, { k: 'montant', l: 'Montant HT', t: 'num' }], { add: 'Ajouter un investissement', newRow: { label: '', type: 'Matériel informatique (ordinateurs, périphériques)', montant: '' } })],
  ['Comment finances-tu le projet ?', 'Apports, levée, prêt d\'honneur, crédit bancaire, subvention. Le tableau de bord te dira s\'il manque de l\'argent.', () => `<div class="grid g3">${fNum('quiz.levee', 'Levée de fonds (business angels, VC)', { suf: 'DH' })}${fDate('quiz.leveeDate', 'Date de la levée')}${fNum('quiz.subv', 'Subvention / bourse d\'incubateur', { suf: 'DH' })}
   ${fNum('quiz.honneur', 'Prêt d\'honneur (0 %, différé 12 mois)', { suf: 'DH' })}${fNum('quiz.banque', 'Crédit bancaire', { suf: 'DH' })}${fPct('quiz.banqueTaux', 'Taux annuel du crédit')}${fNum('quiz.banqueDuree', 'Durée du crédit', { suf: 'mois' })}</div>`],
  ['Délais de paiement & saisonnalité', 'Les délais décalent l\'argent : une vente de mars payée à 60 jours rentre en mai.', () => `<div class="grid g3">${fNum('quiz.delaiClient', 'Délai clients', { suf: 'j', help: 'Comptant : 0 · B2B : 30-60 · Public : 90-120' })}${fNum('quiz.delaiFourn', 'Délai fournisseurs', { suf: 'j' })}${fSel('quiz.saison', 'Saisonnalité', Object.keys(SAISONS))}</div>`],
  ['C\'est prêt', 'Ton business plan va être généré. Tu pourras ensuite affiner chaque section (marché, SWOT, PESTEL, coûts détaillés…) et demander l\'aide de l\'IA.', () => `<p>Le projet actuel sera remplacé par celui du questionnaire. Pense à exporter le projet actuel si tu veux le garder.</p><div class="row" style="margin-top:14px"><button class="btn pri" data-act="quizBuild">Générer mon business plan</button></div>`]
];
function renderQuiz() {
  quizInit(); const q = S.quiz, i = Math.min(q.step || 0, QSTEPS.length - 1); const [t, w, f] = QSTEPS[i];
  return `<div class="qz"><div class="qstep">${QSTEPS.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
  <div class="qcard"><p class="eyebrow">Question ${i + 1} sur ${QSTEPS.length}</p><h2>${t}</h2><p class="why">${w}</p>${f()}
  <div class="row" style="margin-top:18px">${i ? '<button class="btn" data-act="qprev">← Précédent</button>' : ''}<span class="sp"></span>${i < QSTEPS.length - 1 ? '<button class="btn pri" data-act="qnext">Suivant →</button>' : ''}</div></div></div>`;
}
function quizBuild() {
  const q = S.quiz, p = blankProject();
  p.quiz = Object.assign({}, q, { done: true, step: 0 });
  Object.assign(p.id, { nom: q.nom, pitch: q.pitch, secteur: q.secteur, activite: q.activite, ville: q.ville });
  p.hyp.profil = q.profil; p.hyp.statut = [q.statut, q.statut, q.statut]; p.hyp.start = q.start || nextJan(); p.hyp.ventes = q.ventes || p.hyp.start;
  p.hyp.delaiClient = N(q.delaiClient); p.hyp.delaiFourn = N(q.delaiFourn); p.hyp.saison = (SAISONS[q.saison] || SAISONS['Régulière (100 % tous les mois)']).slice();
  const e = N(q.ecart);
  p.offers = (q.offers || []).filter(o => o.nom).map(o => {
    const v = o.vol.map(N);
    return { nom: o.nom, modele: o.modele, cible: o.cible, unite: '', gamme: '', tva: 0.2, lancement: '', prix: [N(o.prix), '', ''], vol: [v.map(x => x ? Math.round(x * (1 - e) * 100) / 100 : ''), v.map(x => x || ''), v.map(x => x ? Math.round(x * (1 + e) * 100) / 100 : '')], comps: N(o.cout) ? [{ label: 'Coût variable unitaire', rub: (L.M_PType.find(r => r[0] === o.modele) || [])[1] === 'Ventes de marchandises' ? 'Achats revendus de marchandises' : 'Achats consommés de matières et fournitures', tva: 0.2, cout: [N(o.cout), '', ''] }] : [] };
  });
  const nf = Math.max(0, Math.round(N(q.nbFond)));
  const contrat = q.statut === 'Auto-Entrepreneur' ? 'Associé·e / bénévole non rémunéré·e' : 'CDI';
  for (let k = 0; k < nf; k++) {
    p.founders.push({ nom: `Fondateur·rice ${k + 1}`, role: k ? 'Co-fondateur·rice' : 'Fondateur·rice / CEO', comp: '', exp: '', temps: 1, capital: nf ? Math.round(1000 / nf) / 1000 : 1, diplome: '' });
    if (N(q.netFond) && q.statut !== 'Auto-Entrepreneur') p.staff.push({ nom: `Fondateur·rice ${k + 1}`, role: k ? 'Co-fondateur·rice' : 'Fondateur·rice / CEO', contrat, debut: p.hyp.start, fin: '', net: [N(q.netFond), '', ''], dep: 0 });
  }
  const st = new Date(p.hyp.start + 'T00:00:00');
  (q.recrues || []).forEach(r => { for (let k = 0; k < Math.max(1, N(r.nb)); k++) { const d = new Date(st.getFullYear() + N(r.annee || 1) - 1, st.getMonth() + N(r.mois || 1) - 1, 1); const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; const y = N(r.annee || 1) - 1; const net = ['', '', '']; net[y] = N(r.net); p.staff.push({ nom: r.poste || 'Recrue', role: '', contrat: 'CDI', debut: ds, fin: '', net, dep: 0 }); } });
  if (N(q.loyer)) p.fixRec.push({ label: 'Loyer — local nu (non meublé)', debut: p.hyp.start, fin: '', per: 'Mensuelle', tva: 'Non', m: [N(q.loyer), '', ''] });
  if (N(q.autres)) p.fixRec.push({ label: 'Autres charges fixes (énergie, internet, honoraires, logiciels…)', rub: 'Autres charges externes', debut: p.hyp.start, fin: '', per: 'Mensuelle', tva: 'Oui', m: [N(q.autres), '', ''] });
  if (N(q.mkt)) p.mkt.canaux.push({ canal: 'Marketing digital', objectif: 'Génération de prospects (leads)', budget: [N(q.mkt), '', ''], kpi: 'Coût d\'acquisition client (CAC)' });
  p.inv = (q.inv || []).filter(i => N(i.montant)).map(i => ({ label: i.label || i.type, type: i.type, date: p.hyp.start, montant: N(i.montant), mode: 'En une fois', nb: '', date1: '', taux: '' }));
  const capNat = q.statut === 'Auto-Entrepreneur' ? 'Capital social / apport en capital' : 'Capital social / apport en capital';
  if (N(q.capital)) p.fin.push({ source: 'Apport des associés (capital)', nature: capNat, montant: N(q.capital), date: p.hyp.start, duree: '' });
  if (N(q.levee)) p.fin.push({ source: 'Business angel (entrée au capital)', nature: 'Capital social / apport en capital', montant: N(q.levee), date: q.leveeDate || p.hyp.start, duree: '' });
  if (N(q.subv)) p.fin.push({ source: 'Bourse d\'incubateur / accélérateur (non remboursable)', nature: 'Subvention d\'exploitation', montant: N(q.subv), date: p.hyp.start, duree: '' });
  if (N(q.honneur)) p.loans.push({ type: 'Prêt d\'honneur (sans intérêts)', preteur: 'Réseau d\'accompagnement', montant: N(q.honneur), taux: 0, duree: 60, differe: 12, typeDiff: 'Franchise totale (rien)', date: p.hyp.start });
  if (N(q.banque)) p.loans.push({ type: 'Crédit bancaire moyen terme (investissement)', preteur: 'Banque', montant: N(q.banque), taux: N(q.banqueTaux), duree: N(q.banqueDuree) || 60, differe: 0, typeDiff: 'Aucun', date: p.hyp.start });
  S = p; save(); recalc(); go('tableau'); toast('Business plan généré : affine maintenant chaque section.');
}

/* ---- Document de business plan ---- */
function bulletList(a) { const x = (a || []).filter(Boolean); return x.length ? `<ul>${x.map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : '<p class="muted">—</p>'; }
function para(t) { return t ? String(t).split(/\n+/).map(l => `<p>${esc(l)}</p>`).join('') : ''; }
function synthese() {
  const P = R.P, C = R.C, K = R.K, F = R.flags;
  const st = F.stat; const totInv = (S.inv || []).reduce((s, i) => s + N(i.montant), 0);
  const apports = (S.fin || []).reduce((s, f) => s + N(f.montant), 0), emp = (S.loans || []).reduce((s, l) => s + N(l.montant), 0);
  return [
    `Le projet « ${S.id.nom || '(nom du projet)'} » ${st[0] === st[2] ? `est porté sous le statut ${st[0]} pendant les 3 ans` : `démarre sous le statut ${st[0]} puis passe en ${st[2]}`}${S.id.secteur ? `, dans le secteur ${S.id.secteur}` : ''}.`,
    `Chiffre d'affaires visé (scénario ${S.hyp.scenario}) : ${dh(P.ca[0])} en année 1, ${dh(P.ca[1])} en année 2 et ${dh(P.ca[2])} en année 3.`,
    `Rentabilité : EBE de ${dh(P.ebe[0])} (année 1) et ${dh(P.ebe[2])} (année 3) ; résultat net de ${dh(P.rn[0])}, ${dh(P.rn[1])} puis ${dh(P.rn[2])}.`,
    `Seuil de rentabilité en année 1 : ${dh(P.sr[0])} de CA ; point mort opérationnel : ${C.pointMort ? mLong(C.pointMort) : 'non atteint sur 36 mois'}.`,
    `Investissements prévus sur 3 ans : ${dh(totInv)} HT, financés par ${dh(apports)} d'apports, levées, subventions et aides et ${dh(emp)} d'emprunts.`,
    `Équipe : ${K.head[0]} salarié(s) en fin d'année 1, ${K.head[2]} en fin d'année 3 ; budget marketing de ${dh(K.mkt[0])} en année 1.`,
    `Trésorerie : point le plus bas de ${dh(C.min)} (${mLong(C.minM)}) ; ${C.fonds > 0 ? `il manque ${dh(C.fonds)} pour ne jamais être à découvert.` : 'la trésorerie reste positive sur 36 mois.'}`,
    `Fin d'année 3 : trésorerie de ${dh(C.fin[36])}, capitaux propres de ${dh(R.B[3].cp)}, dettes de financement de ${dh(R.B[3].dettesFin)}.`,
    `Unit economics (année 3) : marge brute ${pc(K.gm[2])} ; CAC ${K.cac[2] ? dh(K.cac[2]) : '—'} ; LTV/CAC ${K.ltvCac[2] ? fmt(K.ltvCac[2], 1) : '—'} ; part du CA récurrent ${pc(K.recShare[2], 0)}.`
  ];
}
function docHTML() {
  if (!R) return '';
  const m = S.market, K = R.K, P = R.P;
  const persona = (m.personas || []).map(p => `<li><b>${esc(p.nom)}</b> — ${esc(p.profession || '')}. Besoins : ${esc(p.besoins || '')}. Freins : ${esc(p.freins || '')}.${p.phrase ? ` <i>${esc(p.phrase)}</i>` : ''}</li>`).join('');
  const bench = (m.bench || []).length ? `<table><tr><th>Acteur</th><th>Offre</th><th>Prix</th><th>Positionnement</th><th>Forces</th><th>Faiblesses</th></tr>${m.bench.map(b => `<tr><td>${esc(b.acteur)}</td><td>${esc(b.offre)}</td><td>${esc(b.prix)}</td><td>${esc(b.positionnement)}</td><td>${esc(b.forces)}</td><td>${esc(b.faiblesses)}</td></tr>`).join('')}</table>` : '';
  const pest = PESTEL.map(([k, t]) => (S.pestel[k] || []).length ? `<li><b>${t}</b> : ${S.pestel[k].map(x => `${esc(x.t)} (${x.s === '-' ? '−' : x.s})`).join(' ; ')}</li>` : '').join('');
  const ys = [0, 1, 2].map(yrLab);
  const offersT = `<table><tr><th>Offre</th><th>Cible</th><th class="n">Prix An 1</th>${ys.map(y => `<th class="n">CA ${y}</th>`).join('')}</tr>${K.offerCA.map(o => `<tr><td>${esc(o.nom)}</td><td>${esc(o.cible || '')}</td><td class="n">${fmt(o.prix[0])}</td>${o.ca.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr>`).join('')}<tr class="tot"><td colspan="3">Total</td>${K.ca.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr></table>`;
  const fin = `<table><tr><th>Source</th><th>Nature</th><th class="n">Montant</th><th>Date</th></tr>${(S.fin || []).map(f => `<tr><td>${esc(f.source)}</td><td>${esc(f.nature || '')}</td><td class="n">${fmt(N(f.montant))}</td><td>${esc(f.date || '')}</td></tr>`).join('')}${(S.loans || []).map(l => `<tr><td>${esc(l.type)}</td><td>Emprunt ${esc(l.preteur || '')} · ${pc(N(l.taux))} · ${N(l.duree)} mois</td><td class="n">${fmt(N(l.montant))}</td><td>${esc(l.date || '')}</td></tr>`).join('')}</table>`;
  const tows = [['S × O — Attaquer', 'SO'], ['W × O — Améliorer', 'WO'], ['S × T — Défendre', 'ST'], ['W × T — Se protéger', 'WT']];
  return `<div class="doc" id="bpdoc">
  <p class="eyebrow">Business plan · ${ys[0]} – ${ys[2]}</p><h1>${esc(S.id.nom || 'Mon projet')}</h1>${S.id.slogan ? `<p class="muted" style="font-size:16px">${esc(S.id.slogan)}</p>` : ''}
  <p class="small muted">${[S.id.porteurs, S.id.ville, S.id.email, S.id.web].filter(Boolean).map(esc).join(' · ')}</p>
  <h2>1. Synthèse exécutive</h2>${S.id.pitch ? `<p><b>${esc(S.id.pitch)}</b></p>` : ''}<ul>${synthese().map(s => `<li>${esc(s)}</li>`).join('')}</ul>
  <h2>2. Le projet et l'équipe</h2><p>Stade : ${esc(S.id.stade || '—')} · Secteur : ${esc(S.id.secteur || '—')} · Activité : ${esc(S.id.activite || '—')} · Statut : ${esc(R.flags.stat.join(' → '))}</p>
  ${(S.founders || []).length ? `<table><tr><th>Nom</th><th>Rôle</th><th>Compétences</th><th class="n">% capital</th></tr>${S.founders.map(f => `<tr><td>${esc(f.nom)}</td><td>${esc(f.role)}</td><td>${esc(f.comp || '')}</td><td class="n">${pc(N(f.capital), 0)}</td></tr>`).join('')}</table>` : ''}
  <p>Effectif salarié : ${K.head.map((h, y) => `${h} en fin d'${['année 1', 'année 2', 'année 3'][y]}`).join(', ')}. Coût total de l'équipe en année 3 : ${dh(K.teamCost[2])}.</p>
  <h2>3. Vision, mission & objectifs</h2>${S.vision.vision ? `<p><b>Vision.</b> ${esc(S.vision.vision)}</p>` : ''}${S.vision.mission ? `<p><b>Mission.</b> ${esc(S.vision.mission)}</p>` : ''}${S.vision.impact ? `<p><b>Impact.</b> ${esc(S.vision.impact)}</p>` : ''}
  ${S.vision.smart.some(Boolean) ? `<ul>${S.vision.smart.map((s, i) => s ? `<li><b>${['Année 1', 'Année 2', 'Année 3', 'Au-delà'][i]}</b> : ${esc(s)}</li>` : '').join('')}</ul>` : ''}
  ${S.vision.valeurs.length ? `<p><b>Valeurs</b> : ${S.vision.valeurs.map(esc).join(', ')}.</p>` : ''}${S.vision.odd.length ? `<p><b>ODD</b> : ${S.vision.odd.map(esc).join(', ')}.</p>` : ''}
  <h2>4. Marché, clients & concurrence</h2>${m.tendances ? `<h3>Secteur & tendances</h3>${para(m.tendances)}` : ''}${m.probleme ? `<h3>Problème</h3>${para(m.probleme)}` : ''}${m.solution ? `<h3>Solution</h3>${para(m.solution)}` : ''}${m.valeur ? `<h3>Proposition de valeur</h3>${para(m.valeur)}` : ''}${m.avantage ? `<h3>Avantage concurrentiel</h3>${para(m.avantage)}` : ''}${m.pourquoi ? `<h3>Pourquoi maintenant</h3>${para(m.pourquoi)}` : ''}
  ${m.segments.length ? `<p><b>Segments visés</b> : ${m.segments.map(esc).join(', ')}.</p>` : ''}${persona ? `<h3>Personas</h3><ul>${persona}</ul>` : ''}
  ${bench ? `<h3>Benchmark concurrentiel</h3>${bench}` : ''}
  <h3>Taille du marché</h3><table><tr><th></th>${ys.map(y => `<th class="n">${y}</th>`).join('')}</tr><tr><td>TAM</td>${K.tam.map(v => `<td class="n">${kdh(v)}</td>`).join('')}</tr><tr><td>SAM</td>${K.sam.map(v => `<td class="n">${kdh(v)}</td>`).join('')}</tr><tr><td>SOM</td>${K.som.map(v => `<td class="n">${kdh(v)}</td>`).join('')}</tr><tr><td>CA prévu / SOM</td>${K.caSom.map(v => `<td class="n">${pc(v, 0)}</td>`).join('')}</tr></table>
  <h2>5. Offre & business model</h2>${offersT}
  <table><tr><th>Bloc du Business Model Canvas</th><th>Choix</th><th>Détails</th></tr>${S.bmc.map(b => `<tr><td><b>${esc(b.bloc)}</b></td><td>${b.choix.map(esc).join(', ')}</td><td>${esc(b.details || '')}</td></tr>`).join('')}</table>
  ${S.pricing.strategie ? `<p><b>Stratégie de prix</b> : ${esc(S.pricing.strategie)}. ${esc(S.pricing.strategieTxt || '')}</p>` : ''}${S.pricing.conditions ? `<p><b>Conditions de vente</b> : ${esc(S.pricing.conditions)}</p>` : ''}
  <h2>6. Communication & marketing</h2>${S.mkt.positionnement ? `<p><b>Positionnement</b> : ${esc(S.mkt.positionnement)}</p>` : ''}${S.mkt.message ? `<p><b>Message</b> : ${esc(S.mkt.message)}</p>` : ''}
  ${['produit', 'prix', 'place', 'promotion', 'personnes', 'processus', 'preuve'].filter(k => S.mkt[k]).map(k => `<p><b>${k[0].toUpperCase() + k.slice(1)}</b> : ${esc(S.mkt[k])}</p>`).join('')}
  ${(S.mkt.canaux || []).length ? `<table><tr><th>Canal</th><th>Objectif</th><th class="n">Budget/mois An 1</th><th>KPI</th></tr>${S.mkt.canaux.map(c => `<tr><td>${esc(c.canal)}</td><td>${esc(c.objectif)}</td><td class="n">${fmt(N(c.budget[0]))}</td><td>${esc(c.kpi)}</td></tr>`).join('')}</table>` : ''}
  <h2>7. Analyse PESTEL</h2>${pest ? `<ul>${pest}</ul>` : '<p class="muted">À compléter.</p>'}
  <h2>8. SWOT & stratégies croisées</h2><table><tr><th>Forces</th><th>Faiblesses</th></tr><tr><td>${bulletList(S.swot.S)}</td><td>${bulletList(S.swot.W)}</td></tr><tr><th>Opportunités</th><th>Menaces</th></tr><tr><td>${bulletList(S.swot.O)}</td><td>${bulletList(S.swot.T)}</td></tr></table>
  ${tows.map(([t, k]) => (S.swot[k] || []).filter(Boolean).length ? `<h3>${t}</h3>${bulletList(S.swot[k])}` : '').join('')}
  <h2>9. Stratégie & recommandations</h2>${S.strategy ? para(S.strategy) : '<p class="muted">Rédige ta stratégie ou génère une proposition avec l\'IA (bouton au-dessus du document).</p>'}
  <h2>10. Plan d'actions</h2>${(S.plan || []).length ? `<table><tr><th>Action</th><th>Responsable</th><th>Début</th><th>Fin</th><th>Statut</th></tr>${S.plan.map(p => `<tr><td>${esc(p.action)}</td><td>${esc(p.resp || '')}</td><td>${esc(p.debut || '')}</td><td>${esc(p.fin || '')}</td><td>${esc(p.statut || '')}</td></tr>`).join('')}</table>` : '<p class="muted">À compléter.</p>'}
  <h2>11. Risques</h2>${(S.risks || []).length ? `<table><tr><th>Risque</th><th class="n">Criticité</th><th>Plan d'atténuation</th></tr>${S.risks.slice().sort((a, b) => N(b.p) * N(b.i) - N(a.p) * N(a.i)).map(r => `<tr><td>${esc(r.risque)}</td><td class="n">${N(r.p) * N(r.i)}</td><td>${esc(r.plan || '')}</td></tr>`).join('')}</table>` : '<p class="muted">À compléter.</p>'}
  <h2>12. Prévisions financières</h2><p>Scénario ${esc(S.hyp.scenario)} · inflation ${pc(N(S.hyp.inflation))} · délais clients ${N(S.hyp.delaiClient)} j / fournisseurs ${N(S.hyp.delaiFourn)} j · ventes dès ${mLong(R.salesStart)}.</p>
  <h3>Compte de produits et charges</h3>${tbl(['', ...ys], [tr('Chiffre d\'affaires', P.ca, 'tot'), tr('Charges variables', P.varTot), tr('Charges de personnel', R.rub[4]), tr('Autres charges externes', R.rub[2]), tr('EBE', P.ebe, 'tot'), tr('Dotations aux amortissements', P.dot), tr('Résultat d\'exploitation', P.rex), tr('Intérêts', P.int), tr('Impôts sur les résultats', P.impot), tr('Résultat net', P.rn, 'grand'), tr('Capacité d\'autofinancement', P.caf)])}
  <h3>Trésorerie</h3>${tbl(['', ...ys], [tr('Encaissements', [0, 1, 2].map(y => R.C.enc.slice(y * 12 + 1, y * 12 + 13).reduce((a, b) => a + b, 0))), tr('Décaissements', [0, 1, 2].map(y => R.C.dec.slice(y * 12 + 1, y * 12 + 13).reduce((a, b) => a + b, 0))), tr('Trésorerie fin d\'année', [12, 24, 36].map(m => R.C.fin[m]), 'tot'), tr('Trésorerie la plus basse', R.C.minY)])}
  <h3>Bilan simplifié</h3>${tbl(['', ...ys.map(y => 'Fin ' + y)], [tr('Actif immobilisé net', R.B.slice(1).map(b => b.actifImmo)), tr('BFR (stocks + clients − fournisseurs)', R.B.slice(1).map(b => b.bfr)), tr('Trésorerie', R.B.slice(1).map(b => b.cash)), tr('Capitaux propres', R.B.slice(1).map(b => b.cp), 'tot'), tr('Dettes de financement', R.B.slice(1).map(b => b.dettesFin)), tr('Total bilan', R.B.slice(1).map(b => b.totalActif), 'tot')])}
  <h3>Scénarios</h3>${(() => { const b = [0, 1, 2].map(i => E.run(S, L, i)); return tbl(['', ...SC], [tr('CA année 3', b.map(r => r.P.ca[2])), tr('Résultat net année 3', b.map(r => r.P.rn[2])), tr('Trésorerie la plus basse', b.map(r => r.C.min)), tr('Fonds à lever en plus', b.map(r => r.C.fonds))]); })()}
  <h2>13. Besoins & ressources de financement</h2>${fin}<p>Fonds à lever en plus pour ne jamais être à découvert : <b>${dh(R.C.fonds)}</b>${R.C.fonds ? '' : ' (aucun)'}.</p>
  <p class="small muted" style="margin-top:24px">Document généré avec PlanBiz (modèle de calcul Business Plan V4.1 ; règles fiscales et sociales marocaines 2026). Les projections reposent sur les hypothèses saisies.</p></div>`;
}
sec('bp', 'Résultats', 'Business plan & exports', 'Le document se rédige à partir de tes saisies et de tes chiffres. Ajoute une stratégie, puis exporte le business plan, les tableaux financiers ou ton projet.', () => `
<div class="card"><div class="row"><h3>Exporter</h3><span class="sp"></span></div><p class="sub">« Imprimer / PDF » ouvre le document mis en page : choisis « Enregistrer en PDF » dans la fenêtre d'impression.</p>
 <div class="row"><button class="btn pri" data-act="printDoc">Imprimer / PDF</button><button class="btn" data-act="expHtml">Business plan (.html)</button><button class="btn" data-act="expXlsx">Tableaux financiers (.xlsx)</button><button class="btn" data-act="expJson">Sauvegarder le projet (.json)</button><label class="btn ghost" for="importFile2">Importer un projet</label><input type="file" id="importFile2" accept=".json,application/json" hidden></div></div>
<div class="card"><div class="row"><h3>Stratégie & recommandations</h3><span class="sp"></span><button class="btn pri ai" data-ai="strategy">Rédiger la stratégie avec l'IA</button></div>
 <p class="sub">L'IA lit tout ton business plan (marché, offres, chiffres, SWOT) et propose : positionnement, go-to-market, stratégie de financement, priorités 12 mois et points à corriger avant de présenter. Le texte reste modifiable.</p>
 ${fText('strategy', '', { area: true, rows: 10, ph: 'Ta stratégie : positionnement, conquête du marché, financement, priorités…' })}</div>
${docHTML()}`, () => filled(S.strategy));

/* ---- IA (capability sample) ---- */
let sampleFn; let sampleReady = false;
function brief() {
  const K = R.K, P = R.P;
  return JSON.stringify({
    projet: { nom: S.id.nom, pitch: S.id.pitch, secteur: S.id.secteur, activite: S.id.activite, ville: S.id.ville, stade: S.id.stade, profil: S.hyp.profil, statut: R.flags.stat },
    vision: S.vision.vision, mission: S.vision.mission,
    marche: { tendances: S.market.tendances, probleme: S.market.probleme, solution: S.market.solution, valeur: S.market.valeur, segments: S.market.segments, concurrents: (S.market.bench || []).map(b => b.acteur) },
    offres: K.offerCA.map(o => ({ nom: o.nom, cible: o.cible, prixAn1: Math.round(o.prix[0]), coutVarAn1: Math.round(o.cu[0]), caAn1: Math.round(o.ca[0]), caAn3: Math.round(o.ca[2]) })),
    equipe: { fondateurs: (S.founders || []).map(f => `${f.nom} (${f.role})`), effectifFinAn3: K.head[2] },
    chiffres: { ca: P.ca.map(Math.round), ebe: P.ebe.map(Math.round), resultatNet: P.rn.map(Math.round), tresorerieMin: Math.round(R.C.min), moisTresoMin: mLong(R.C.minM), fondsALever: Math.round(R.C.fonds), pointMort: R.C.pointMort ? mLong(R.C.pointMort) : null, margeBruteAn3: +(K.gm[2] || 0).toFixed(2), ltvCacAn3: K.ltvCac[2] ? +K.ltvCac[2].toFixed(1) : null, partRecurrent: +(K.recShare[2] || 0).toFixed(2), financements: (S.fin || []).map(f => `${f.source}: ${f.montant}`), emprunts: (S.loans || []).map(l => `${l.type}: ${l.montant}`) },
    pestel: S.pestel, swot: S.swot, risques: (S.risks || []).map(r => r.risque), alertes: R.alerts.map(a => a[1])
  });
}
const AI_CTX = 'Tu es un consultant en création d\'entreprise au Maroc qui aide un incubateur à rédiger des business plans. Réponds en français, avec des éléments concrets et adaptés au contexte marocain (montants en dirhams, institutions et programmes marocains quand c\'est pertinent). Tu ne consultes pas internet : quand tu cites un chiffre de marché, présente-le comme un ordre de grandeur à vérifier.';
async function runAI(kind, btn) {
  const out = document.getElementById('ai-' + kind);
  if (!sampleFn) { toast('L\'assistant IA n\'est pas disponible dans cette vue.'); return; }
  btn.disabled = true; const old = btn.textContent; btn.textContent = 'Analyse en cours…';
  if (out) out.innerHTML = '<div class="ai-out">Claude réfléchit… (30 à 90 secondes)</div>';
  try {
    if (kind === 'strategy') {
      const ta = document.getElementById(fid('strategy'));
      const prompt = `${AI_CTX}\n\nVoici le business plan (JSON) :\n${brief()}\n\nRédige la partie « Stratégie & recommandations » du business plan, en texte simple sans markdown (pas de #, pas d'astérisques), avec ces titres sur leur propre ligne suivis de 3 à 6 lignes chacun :\nPositionnement stratégique\nStratégie de conquête (go-to-market)\nStratégie de financement\nPriorités des 12 premiers mois\nPoints à corriger avant de présenter le BP (incohérences, hypothèses fragiles dans les chiffres)\nSois précis et appuie-toi sur les chiffres fournis.`;
      const { text } = await sampleFn(prompt, { onText: ({ text }) => { ta.value = text; }, cache: false });
      S.strategy = text; save(); toast('Stratégie rédigée : relis-la et ajuste-la.');
      if (view === 'bp') render();
    } else if (kind === 'market') {
      const prompt = `${AI_CTX}\n\nProjet (JSON) :\n${brief()}\n\nPropose une analyse de marché et un benchmark. Réponds UNIQUEMENT avec un objet JSON de la forme :\n{"tendances":"…","probleme":"…","solution":"…","valeur":"…","avantage":"…","pourquoi":"…","bench":[{"acteur":"…","offre":"…","prix":"…","positionnement":"…","forces":"…","faiblesses":"…"}],"criteres":["…","…","…","…","…"],"segments":["…"],"tam":{"clients":0,"depenseAnnuelle":0,"pctSam":0.2,"pctSom":0.02,"justification":"…"}}\nbench : 4 à 6 acteurs réels ou types d'acteurs (dont le statu quo / l'informel). criteres : 5 critères d'achat importants pour les clients. pctSam et pctSom en fraction.`;
      const d = await sampleFn.json(prompt, {});
      out.innerHTML = aiPreview('market', d); window.__ai_market = d;
    } else if (kind === 'pestel') {
      const prompt = `${AI_CTX}\n\nProjet (JSON) :\n${brief()}\n\nProduis une analyse PESTEL pour ce projet au Maroc. Réponds UNIQUEMENT avec un JSON : {"P":[{"t":"…","s":"+"}],"E":[…],"S":[…],"T":[…],"En":[…],"L":[…]} — 2 à 4 facteurs par catégorie, s vaut "+" (favorable), "-" (défavorable) ou "=" (neutre). P politique, E économique, S socioculturel, T technologique, En écologique, L légal. Phrases courtes et précises.`;
      const d = await sampleFn.json(prompt, {});
      out.innerHTML = aiPreview('pestel', d); window.__ai_pestel = d;
    } else if (kind === 'swot') {
      const prompt = `${AI_CTX}\n\nProjet (JSON) :\n${brief()}\n\nProduis un SWOT précis et chiffré quand c'est possible, puis la matrice TOWS (actions concrètes : verbe + résultat attendu). Réponds UNIQUEMENT avec un JSON : {"S":["…"],"W":["…"],"O":["…"],"T":["…"],"SO":["…"],"WO":["…"],"ST":["…"],"WT":["…"]} — 4 à 6 éléments pour S, W, O, T et 2 à 3 pour chaque stratégie.`;
      const d = await sampleFn.json(prompt, {});
      out.innerHTML = aiPreview('swot', d); window.__ai_swot = d;
    }
  } catch (e) {
    const msg = { not_granted: 'Accès à Claude refusé pour cette page.', rate_limited: 'Trop de demandes : réessaie dans une minute.', invalid_json: 'Réponse illisible : relance la génération.', cancelled: 'Génération arrêtée.' }[e && e.code] || ('L\'IA n\'a pas pu répondre' + (e && e.message ? ' : ' + e.message : '.'));
    if (out) out.innerHTML = `<div class="al warn">${esc(msg)}</div>`; else toast(msg);
  } finally { btn.disabled = false; btn.textContent = old; }
}
function aiPreview(kind, d) {
  let body = '';
  if (kind === 'market') body = `${['tendances', 'probleme', 'solution', 'valeur', 'avantage', 'pourquoi'].map(k => d[k] ? `<p><b>${{ tendances: 'Tendances', probleme: 'Problème', solution: 'Solution', valeur: 'Proposition de valeur', avantage: 'Avantage', pourquoi: 'Pourquoi maintenant' }[k]}</b> : ${esc(d[k])}</p>` : '').join('')}
    ${(d.bench || []).length ? `<div class="tw" style="margin:8px 0"><table><tr><th>Acteur</th><th>Offre</th><th>Prix</th><th>Forces</th><th>Faiblesses</th></tr>${d.bench.map(b => `<tr><td>${esc(b.acteur)}</td><td>${esc(b.offre)}</td><td>${esc(b.prix)}</td><td>${esc(b.forces)}</td><td>${esc(b.faiblesses)}</td></tr>`).join('')}</table></div>` : ''}
    ${d.tam ? `<p><b>Taille du marché (ordre de grandeur à vérifier)</b> : ${fmt(d.tam.clients)} clients × ${fmt(d.tam.depenseAnnuelle)} DH/an ; SAM ${pc(d.tam.pctSam, 0)} ; part visée ${pc(d.tam.pctSom, 1)}. ${esc(d.tam.justification || '')}</p>` : ''}`;
  if (kind === 'pestel') body = PESTEL.map(([k, t]) => (d[k] || []).length ? `<p><b>${t}</b> : ${d[k].map(x => `${esc(x.t)} (${x.s})`).join(' ; ')}</p>` : '').join('');
  if (kind === 'swot') body = [['S', 'Forces'], ['W', 'Faiblesses'], ['O', 'Opportunités'], ['T', 'Menaces'], ['SO', 'S×O'], ['WO', 'W×O'], ['ST', 'S×T'], ['WT', 'W×T']].map(([k, t]) => (d[k] || []).length ? `<p><b>${t}</b> : ${d[k].map(esc).join(' · ')}</p>` : '').join('');
  return `<div class="card" style="border-color:var(--accent)"><div class="row"><h3>Proposition de l'IA</h3><span class="sp"></span><button class="btn sm" data-act="aiApply" data-k="${kind}" data-mode="fill">Compléter les champs vides</button><button class="btn sm pri" data-act="aiApply" data-k="${kind}" data-mode="replace">Remplacer</button><button class="btn sm ghost" data-act="aiClose" data-k="${kind}">Ignorer</button></div><p class="sub">Relis avant d'appliquer : l'IA ne consulte pas internet, vérifie les chiffres de marché.</p>${body}</div>`;
}
function aiApply(kind, mode) {
  const d = window['__ai_' + kind]; if (!d) return; const rep = mode === 'replace';
  if (kind === 'market') {
    ['tendances', 'probleme', 'solution', 'valeur', 'avantage', 'pourquoi'].forEach(k => { if (d[k] && (rep || isB(S.market[k]))) S.market[k] = d[k]; });
    if ((d.bench || []).length && (rep || !S.market.bench.length)) S.market.bench = d.bench.map(b => ({ acteur: b.acteur || '', offre: b.offre || '', prix: b.prix || '', positionnement: b.positionnement || '', forces: b.forces || '', faiblesses: b.faiblesses || '' }));
    if ((d.bench || []).length && (rep || !S.market.criteres.some(c => c.notes.some(n => !isB(n))))) { S.market.acteurs = d.bench.slice(0, 5).map(b => b.acteur); S.market.criteres = (d.criteres || []).map(c => ({ critere: c, notes: Array(S.market.acteurs.length + 1).fill('') })); }
    (d.segments || []).forEach(s => { if (!S.market.segments.includes(s)) S.market.segments.push(s); });
    if (d.tam && (rep || isB(S.market.tam.n[0]))) { S.market.tam.n = [d.tam.clients, '', ''].map((v, i) => i ? d.tam.clients : v); S.market.tam.dep = [d.tam.depenseAnnuelle, d.tam.depenseAnnuelle, d.tam.depenseAnnuelle]; S.market.tam.pctSam = [d.tam.pctSam, d.tam.pctSam, d.tam.pctSam]; S.market.tam.pctSom = [d.tam.pctSom, d.tam.pctSom * 2, d.tam.pctSom * 3]; }
  }
  if (kind === 'pestel') PESTEL.forEach(([k]) => { if ((d[k] || []).length) S.pestel[k] = rep ? d[k] : (S.pestel[k].length ? S.pestel[k] : d[k]); });
  if (kind === 'swot') Object.keys(S.swot).forEach(k => { if ((d[k] || []).length) S.swot[k] = rep ? d[k] : (S.swot[k].filter(Boolean).length ? S.swot[k] : d[k]); });
  window['__ai_' + kind] = null; save(); recalc(); render(); toast('Proposition appliquée.');
}

/* ---- Exports ---- */
let dlFn = null;
async function saveFile(filename, data) {
  if (!dlFn) { toast('Le téléchargement n\'est pas disponible dans cette vue.'); return; }
  try { await dlFn.save({ filename, data }); } catch (e) { if (e && e.code !== 'declined') toast('Téléchargement impossible : ' + (e.message || e.code)); }
}
function slug() { return (S.id.nom || 'business-plan').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'business-plan'; }
function expHtml() {
  const css = `body{font-family:Georgia,'Times New Roman',serif;color:#14242a;max-width:900px;margin:40px auto;padding:0 24px;line-height:1.5;font-size:14px}h1{font-size:30px;margin:0 0 4px}h2{color:#0E5A61;border-bottom:2px solid #0E5A61;padding-bottom:4px;margin-top:28px}h3{margin:14px 0 6px}table{border-collapse:collapse;width:100%;font-size:12.5px;margin:8px 0 14px}th,td{border:1px solid #cdd8da;padding:5px 7px;text-align:left;vertical-align:top}th{background:#eaf0f0}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}tr.tot td{font-weight:bold;background:#f3f6f6}tr.grand td{font-weight:bold;border-top:2px solid #14242a}.eyebrow{color:#C9832A;text-transform:uppercase;letter-spacing:.08em;font-size:11px;font-weight:bold}.muted{color:#56686d}.small{font-size:12px}.pos{color:#23794A}.neg{color:#B3261E}@media print{body{margin:0}h2{page-break-after:avoid}table{page-break-inside:avoid}}`;
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Business plan — ${esc(S.id.nom || '')} · PlanBiz</title><style>${css}</style></head><body>${docHTML().replace('<div class="doc" id="bpdoc">', '<div>')}</body></html>`;
  saveFile(`${slug()}-business-plan.html`, html);
}
function expXlsx() {
  if (!window.XLSX) { toast('Bibliothèque Excel indisponible.'); return; }
  const wb = XLSX.utils.book_new(); const ys = [0, 1, 2].map(yrLab);
  const P = R.P, C = R.C, B = R.B, K = R.K;
  const r = (l, a) => [l, ...a.map(v => v === null || v === undefined || isNaN(v) ? '' : Math.round(v))];
  const add = (name, rows, w) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = [{ wch: w || 48 }, ...rows[0].slice(1).map(() => ({ wch: 14 }))]; XLSX.utils.book_append_sheet(wb, ws, name); };
  add('Synthèse', [['Business plan', S.id.nom || ''], ['Scénario', S.hyp.scenario], ['Statut', R.flags.stat.join(' → ')], [], ...synthese().map(s => [s])], 120);
  add('CPC', [['Rubrique', ...ys], r('Ventes de marchandises', P.caM), r('Ventes de biens et services produits', P.caP), r('Chiffre d\'affaires', P.ca), r('Variation de stocks de produits finis', P.varPF), r('Subventions d\'exploitation', P.sexp), r('Total produits d\'exploitation', P.prodExp), ...E.RUB.map((x, i) => r(x, R.rub[i])), r('Dotations d\'exploitation', P.dot), r('Total charges d\'exploitation', P.chExp), r('Résultat d\'exploitation', P.rex), r('Charges financières', P.int), r('Résultat courant', P.rcai), r('Produits non courants', P.pnc), r('Charges non courantes', P.cnc), r('Résultat avant impôts', P.rai), r('Impôts sur les résultats', P.impot), r('Résultat net', P.rn), [], r('Valeur ajoutée', P.va), r('EBE', P.ebe), r('CAF', P.caf), r('Seuil de rentabilité', P.sr)]);
  const ml = Array.from({ length: 36 }, (_, i) => mLab(i + 1));
  const keys = [['Ventes encaissées TTC', 'encVentes'], ['Apports & comptes courants', 'encApports'], ['Subventions, dons & prix', 'encSubv'], ['Emprunts débloqués', 'encEmp'], ['Autres encaissements', 'encAutres'], ['TOTAL ENCAISSEMENTS', 'enc'], ['Achats & charges variables', 'decVar'], ['Charges fixes récurrentes', 'decFix'], ['Charges ponctuelles', 'decPon'], ['Marketing', 'decMkt'], ['Salaires nets', 'decNet'], ['Prestataires', 'decExt'], ['CNSS / AMO', 'decSoc'], ['IR sur salaires', 'decIr'], ['Investissements', 'decInv'], ['Capital remboursé', 'decCap'], ['Intérêts', 'decInt'], ['TVA reversée', 'decTva'], ['Impôt sur le résultat', 'decImpot'], ['Dividendes', 'decDiv'], ['Prélèvements AE', 'decPrel'], ['TOTAL DÉCAISSEMENTS', 'dec'], ['FLUX NET', 'flux'], ['Trésorerie fin de mois', 'fin']];
  add('Trésorerie', [['Flux', ...ml], ...keys.map(([l, k]) => [l, ...C[k].slice(1, 37).map(v => Math.round(v))])], 34);
  const bk = [['Immobilisations en non-valeurs', 'nv'], ['Immobilisations incorporelles', 'incorp'], ['Immobilisations corporelles', 'corp'], ['Immobilisations financières', 'finImmo'], ['Actif immobilisé net', 'actifImmo'], ['Stocks', 'stocks'], ['Clients', 'clients'], ['État débiteur', 'etatDeb'], ['Charges payées d\'avance', 'regulA'], ['Trésorerie actif', 'tresoA'], ['TOTAL ACTIF', 'totalActif'], ['Capital', 'capital'], ['Réserve légale', 'reserve'], ['Report à nouveau', 'ran'], ['Résultat net', 'resultat'], ['Capitaux propres', 'cp'], ['Subventions d\'investissement', 'subv'], ['Emprunts', 'emprunts'], ['Comptes courants', 'cca'], ['Fournisseurs', 'fourn'], ['Organismes sociaux', 'sociaux'], ['État créditeur', 'etatCred'], ['Fournisseurs d\'immobilisations', 'fournImmo'], ['Découvert', 'tresoP'], ['TOTAL PASSIF', 'totalPassif']];
  add('Bilan', [['Poste', 'Début', ...ys.map(y => 'Fin ' + y)], ...bk.map(([l, k]) => r(l, B.map(b => b[k])))]);
  add('Indicateurs', [['Indicateur', ...ys], r('CA', K.ca), ['Croissance', ...K.growth.map(v => v === null ? '' : +v.toFixed(3))], r('EBE', P.ebe), r('Résultat net', P.rn), r('BFR', K.bfr), r('Trésorerie fin', K.cashEnd), r('Capitaux propres', K.cp), r('Effectif', K.head), r('MRR', K.mrr), r('CAC', K.cac), r('LTV', K.ltv), ['LTV/CAC', ...K.ltvCac.map(v => v === null ? '' : +v.toFixed(2))], [], ['Trésorerie la plus basse', Math.round(C.min), mLong(C.minM)], ['Fonds à lever en plus', Math.round(C.fonds)], ['Point mort', C.pointMort ? mLong(C.pointMort) : 'Non atteint']]);
  add('Offres', [['Offre', 'Cible', ...ys.map(y => 'CA ' + y), ...ys.map(y => 'Marge ' + y)], ...K.offerCA.map(o => [o.nom, o.cible || '', ...o.ca.map(Math.round), ...o.ca.map((c, i) => Math.round(c - o.cv[i]))])], 46);
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveFile(`${slug()}-financier.xlsx`, new Uint8Array(buf));
}
function expJson() { saveFile(`${slug()}-projet.json`, JSON.stringify(S, null, 1)); }
function importFile(f) {
  const rd = new FileReader();
  rd.onload = () => { try { const p = extractJSON(rd.result); if (p.hyp && p.id) { S = migrate(p); save(); recalc(); go('tableau'); toast('Projet importé.'); } else { IMP.text = rd.result; impParse(p); go('importia'); } } catch (e) { toast('Fichier non reconnu : choisis un .json exporté depuis PlanBiz ou produit par ton IA.'); } };
  rd.readAsText(f);
}

/* ---- App shell ---- */
function confirmBox(msg, ok) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal"><h3 style="margin-bottom:8px">Confirmer</h3><p>${esc(msg)}</p><div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn" data-x="no">Annuler</button><button class="btn pri" data-x="ok">Continuer</button></div></div>`;
  bg.addEventListener('click', e => { const x = e.target.dataset.x; if (x === 'ok') { bg.remove(); ok(); } else if (x === 'no' || e.target === bg) bg.remove(); });
  document.body.appendChild(bg);
}
const ICONS = { accueil: 'M3 11l9-8 9 8M5 10v10h14V10', questionnaire: 'M4 5h16v11H8l-4 4zM9 9h6M9 12h4', importia: 'M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM19 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z',
  identite: 'M3 6h18v12H3zM7 10h4M7 14h6M15 10h3', equipe: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M16 5.5a3 3 0 0 1 0 5.5M18 15c2 .6 3 2.3 3 5', vision: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11v2', marche: 'M12 3v9h9M20.5 15A9 9 0 1 1 9 3.5',
  offre: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z', marketing: 'M3 10v4h4l7 4V6l-7 4zM18 9a4 4 0 0 1 0 6', plan: 'M4 6h9M7 12h10M11 18h9', pestel: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18',
  swot: 'M3 3h18v18H3zM12 3v18M3 12h18', risques: 'M12 3l10 18H2zM12 10v5M12 18v.01', hypotheses: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4', offres: 'M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10',
  investissements: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6', charges: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6', financements: 'M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18',
  tableau: 'M4 20V11M10 20V5M16 20v-6M3 20h18', scenarios: 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9c0 6-12 3-12 9', etats: 'M3 4h18v16H3zM3 10h18M9 4v16', bp: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6' };
function ico(id, cls = 'ico') { return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[id] || ICONS.accueil}"/></svg>`; }
function railHTML() {
  const groups = [...new Set(SECTIONS.map(s => s.group))];
  let n = 0;
  const done = SECTIONS.filter(s => !['accueil', 'questionnaire', 'importia', 'tableau', 'scenarios', 'etats'].includes(s.id));
  const pct = done.reduce((a, s) => a + s.done(), 0) / (done.length * 2);
  const P = Math.round(pct * 100), C = 2 * Math.PI * 15;
  return `<div class="brand"><div class="brand-mark">${window.PB ? PB.logo() : 'PB'}</div><div><b>PlanBiz</b><small>Business plan 3 ans · Maroc</small></div></div>
  <button class="bizchip" data-pb="hub" title="Revenir à mes business"><span class="mono-av">${esc((S.id.nom || '?').trim().slice(0, 2).toUpperCase())}</span><span class="bz"><small>Business ouvert</small><b>${esc(S.id.nom || 'Sans nom')}</b></span><svg class="ico" viewBox="0 0 24 24"><path d="M8 9l4-4 4 4M8 15l4 4 4-4"/></svg></button>
  <div class="ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" class="rb"/><circle cx="18" cy="18" r="15" class="rf" stroke-dasharray="${C * pct} ${C}"/></svg><div><b>${P} %</b><small>du business plan rempli</small></div></div>
  ${groups.map(g => `<div class="navg"><div class="navg-t">${g}</div>${SECTIONS.filter(s => s.group === g).map(s => { const d = s.done(); const ix = g === 'Démarrer' ? '' : ++n; return `<button class="nav ${view === s.id ? 'on' : ''}" data-go="${s.id}">${ico(s.id)}<span class="nt">${s.title}</span>${ix ? `<span class="ix">${ix}</span>` : ''}<span class="st ${d === 2 ? 'full' : d === 1 ? 'half' : ''}"></span></button>`; }).join('')}</div>`).join('')}
  <div class="prog"><span id="saved">${window.PB ? PB.statusText() : ''}</span></div>`;
}
function topHTML() {
  if (!R) return '';
  return `<button class="btn ghost sm backhub" data-pb="hub">← Mes business</button><select class="in mobnav" id="mobnav" aria-label="Section">${SECTIONS.map(s => `<option value="${s.id}" ${s.id === view ? 'selected' : ''}>${s.group} · ${s.title}</option>`).join('')}</select>
  <div class="seg" role="group" aria-label="Scénario">${SC.map((s, i) => `<button data-sc="${i}" class="${S.hyp.scenario === s ? 'on' : ''}">${s}</button>`).join('')}</div>
  <div class="kpis"><div class="kpi"><small>CA An 3</small><b>${kdh(R.P.ca[2])}</b></div><div class="kpi"><small>Résultat net An 3</small><b class="${R.P.rn[2] >= 0 ? 'pos' : 'neg'}">${kdh(R.P.rn[2])}</b></div><div class="kpi"><small>Tréso. la plus basse</small><b class="${R.C.min >= 0 ? '' : 'neg'}">${kdh(R.C.min)}</b></div><div class="kpi"><small>Fonds à lever</small><b class="${R.C.fonds > 0 ? 'neg' : 'pos'}">${kdh(R.C.fonds)}</b></div></div>
  ${window.PB ? PB.userMenu() : ''}`;
}
function stepNav(s) {
  const i = SECTIONS.indexOf(s); const p = SECTIONS[i - 1], n = SECTIONS[i + 1];
  if (s.id === 'accueil' || s.id === 'questionnaire') return '';
  return `<nav class="stepnav">${p ? `<button class="btn" data-go="${p.id}">← ${p.title}</button>` : '<span></span>'}${n ? `<button class="btn pri" data-go="${n.id}">${n.title} →</button>` : ''}</nav>`;
}
function render() {
  killCharts();
  const s = SECTIONS.find(x => x.id === view) || SECTIONS[0];
  $('#rail').innerHTML = railHTML();
  $('#top').innerHTML = topHTML();
  const ex = S.meta && S.meta.example && !['accueil', 'importia'].includes(view) ? `<div class="banner"><span class="sp"><b>Modèle d'exemple</b> : SAQYA Tech est une startup fictive qui montre un BP complet. Remplace ces données par celles de ton business.</span><button class="btn sm" data-go="importia">Importer depuis mon IA</button><button class="btn sm" data-go="questionnaire">Questionnaire express</button><button class="btn sm" data-act="newBlank">Repartir de zéro</button></div>` : '';
  const i = SECTIONS.indexOf(s);
  const head = s.id === 'importia' ? '' : s.id === 'accueil' ? '' : s.id === 'questionnaire' ? `<div class="head"><span class="hico">${ico(s.id)}</span><div><p class="eyebrow">Démarrer</p><h1>Questionnaire express</h1></div></div><p class="lead">Réponds à quelques questions : l'outil construit un premier business plan complet et chiffré. Tu l'affineras ensuite section par section.</p>`
    : `<div class="head"><span class="hico">${ico(s.id)}</span><div><p class="eyebrow">${s.group} · étape ${i - 2} sur ${SECTIONS.length - 3}</p><h1>${s.title}</h1></div></div><p class="lead">${s.lead}</p>`;
  $('#content').innerHTML = ex + head + s.render() + (window.PBReview ? PBReview.block(s.id) : '') + stepNav(s);
  if (view === 'tableau') drawDash();
  if (view === 'scenarios') drawScen();
}
function go(id) { view = id; try { history.replaceState(null, '', '#' + id); } catch (e) { } render(); window.scrollTo(0, 0); }
function rerenderKeepFocus() {
  const a = document.activeElement; const id = a && a.id; let ss, se; try { ss = a.selectionStart; se = a.selectionEnd; } catch (e) { }
  const y = window.scrollY; render(); window.scrollTo(0, y);
  if (id) { const el = document.getElementById(id); if (el) { el.focus({ preventScroll: true }); try { if (ss !== undefined && ss !== null) el.setSelectionRange(ss, se); } catch (e) { } } }
}
let calcT;
function schedule() { clearTimeout(calcT); calcT = setTimeout(() => { recalc(); rerenderKeepFocus(); }, 650); }

document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.what) { WHAT[el.dataset.what] = +el.value; const lab = document.getElementById('wv_' + el.dataset.what); if (lab) lab.textContent = (+el.value > 0 ? '+' : '') + el.value + ({ retard: ' mois', delai: ' j' }[el.dataset.what] || ' %'); clearTimeout(calcT); calcT = setTimeout(() => { const ws = applyWhat(S); const base = [0, 1, 2].map(i => E.run(S, L, i)); const what = [0, 1, 2].map(i => E.run(ws, L, i)); const box = document.getElementById('whatres'); if (box) { const tmp = document.createElement('div'); tmp.innerHTML = SECTIONS.find(s => s.id === 'scenarios').render(); const nb = tmp.querySelector('#whatres'); if (nb) box.innerHTML = nb.innerHTML; } }, 250); return; }
  if (!el.dataset.p || el.tagName === 'SELECT') return;
  let v = el.value; const t = el.dataset.t;
  if (t === 'num') v = v === '' ? '' : (isNaN(parseFloat(v.replace(/\s/g, '').replace(',', '.'))) ? '' : parseFloat(v.replace(/\s/g, '').replace(',', '.')));
  if (t === 'pct') v = v === '' ? '' : parseFloat(v.replace(',', '.')) / 100;
  set(el.dataset.p, v); if (S.meta) S.meta.example = S.meta.example && true; save(); schedule();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'mobnav') { go(el.value); return; }
  if (el.id === 'importFile' || el.id === 'importFile2') { if (el.files[0]) importFile(el.files[0]); return; }
  if (el.tagName === 'SELECT' && el.dataset.p) {
    let v = el.value; if (el.dataset.t === 'num') v = v === '' ? '' : parseFloat(v);
    set(el.dataset.p, v);
    // auto-fill from catalogues
    const m = el.dataset.p.match(/^offers\.(\d+)\.modele$/); if (m) { S.offers[+m[1]].recurrent = undefined; }
    save(); recalc(); rerenderKeepFocus();
  } else if (el.dataset.p && el.tagName === 'INPUT') {
    // catalogue suggestions on label choice
    const p = el.dataset.p;
    let mm;
    if ((mm = p.match(/^fixRec\.(\d+)\.label$/))) { const d = (L.M_ChFix || []).find(r => r[0] === el.value); if (d) { const f = S.fixRec[+mm[1]]; f.tva = d[2]; f.per = d[3]; f.rub = d[1]; } }
    if ((mm = p.match(/^fixPon\.(\d+)\.label$/))) { const d = (L.M_ChPonct || []).find(r => r[0] === el.value); if (d) { const f = S.fixPon[+mm[1]]; f.tva = d[2]; f.rub = d[1]; } }
    if ((mm = p.match(/^offers\.(\d+)\.comps\.(\d+)\.label$/))) { const d = (L.M_ChVar || []).find(r => r[0] === el.value); if (d) { const c = S.offers[+mm[1]].comps[+mm[2]]; c.rub = d[1]; c.tva = d[2]; } }
    if ((mm = p.match(/^fin\.(\d+)\.source$/))) { const d = (L.M_Source || []).find(r => r[0] === el.value); if (d) S.fin[+mm[1]].nature = d[1]; }
    if (mm) { save(); recalc(); rerenderKeepFocus(); }
  }
});
document.addEventListener('click', e => {
  const t = e.target.closest('button,a'); if (!t) return;
  const d = t.dataset;
  if (d.go) { e.preventDefault(); go(d.go); return; }
  if (d.sc !== undefined) { S.hyp.scenario = SC[+d.sc]; save(); recalc(); rerenderKeepFocus(); return; }
  if (d.sub) { sub[d.sub] = d.k; render(); return; }
  if (d.chip) { const arr = get(d.chip) || []; const i = arr.indexOf(d.v); if (i >= 0) arr.splice(i, 1); else arr.push(d.v); set(d.chip, arr); save(); rerenderKeepFocus(); return; }
  if (d.qset) { S.quiz[d.qset] = d.v; save(); render(); return; }
  if (d.ai) { runAI(d.ai, t); return; }
  const a = d.act; if (!a) return;
  if (a === 'add') { const arr = get(d.arr) || []; arr.push(JSON.parse(d.new || '{}')); set(d.arr, arr); }
  else if (a === 'addstr') { const arr = get(d.arr) || []; arr.push(''); set(d.arr, arr); }
  else if (a === 'del') { const arr = get(d.arr); arr.splice(+d.i, 1); }
  else if (a === 'dup') { const arr = get(d.arr); const c = clone(arr[+d.i]); c.nom = (c.nom || '') + ' (copie)'; arr.splice(+d.i + 1, 0, c); }
  else if (a === 'addacteur') { S.market.acteurs.push('Nouvel acteur'); S.market.criteres.forEach(c => c.notes.push('')); }
  else if (a === 'saison') { S.hyp.saison = SAISONS[d.k].slice(); }
  else if (a === 'pestel2swot') { PESTEL.forEach(([k]) => (S.pestel[k] || []).forEach(x => { if (!x.t) return; const tgt = x.s === '-' ? S.swot.T : x.s === '+' ? S.swot.O : null; if (tgt && !tgt.includes(x.t)) tgt.push(x.t); })); toast('Facteurs reportés dans le SWOT.'); }
  else if (a === 'qnext') { S.quiz.step = Math.min(QSTEPS.length - 1, (S.quiz.step || 0) + 1); }
  else if (a === 'qprev') { S.quiz.step = Math.max(0, (S.quiz.step || 0) - 1); }
  else if (a === 'quizBuild') { confirmBox('Le projet actuel sera remplacé par le business plan du questionnaire.', quizBuild); return; }
  else if (a === 'loadExample') { confirmBox('Charger l\'exemple SAQYA Tech ? Le projet actuel sera remplacé.', () => { S = exampleProject(); save(); recalc(); go('tableau'); }); return; }
  else if (a === 'newBlank') { confirmBox('Commencer un projet vierge ? Le projet actuel sera remplacé (exporte-le d\'abord si tu veux le garder).', () => { S = blankProject(); save(); recalc(); go('questionnaire'); }); return; }
  else if (a === 'whatreset') { Object.keys(WHAT).forEach(k => WHAT[k] = 0); }
  else if (a === 'aiApply') { aiApply(d.k, d.mode); return; }
  else if (a === 'aiClose') { const o = document.getElementById('ai-' + d.k); if (o) o.innerHTML = ''; return; }
  else if (a === 'expHtml') { expHtml(); return; }
  else if (a === 'expXlsx') { expXlsx(); return; }
  else if (a === 'expJson') { expJson(); return; }
  else return;
  save(); recalc(); rerenderKeepFocus();
});


