/* ================= Sections : les chiffres ================= */
const SAISONS = {
  'Régulière (100 % tous les mois)': ['', '', '', '', '', '', '', '', '', '', '', ''],
  'Été fort (tourisme, boissons)': [0.7, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5, 1.5, 1.1, 0.9, 0.7, 0.8],
  'Hiver fort (chauffage, rentrée)': [1.3, 1.2, 1.1, 0.9, 0.8, 0.7, 0.6, 0.6, 1.1, 1.2, 1.2, 1.3],
  'Rentrée scolaire (septembre)': [1, 0.9, 0.9, 0.9, 0.8, 0.7, 0.6, 0.8, 1.8, 1.3, 1.1, 1.2],
  'Fin d\'année & fêtes': [0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 1, 1, 0.9, 1, 1.3, 1.6],
  'Budgets publics (fin d\'année)': [0.6, 0.7, 0.8, 0.9, 1, 1, 0.9, 0.7, 1, 1.2, 1.5, 1.7]
};
sec('hypotheses', 'Les chiffres', 'Hypothèses', 'Les choix qui pilotent tout le business plan : statut par année, calendrier, saisonnalité, inflation, délais de paiement et distribution des bénéfices. Les cases ocre sont des hypothèses.', () => {
  const H = S.hyp, F = R ? R.flags : null;
  const regime = y => { if (!F) return ''; if (F.fAE[y]) return 'IR libératoire (auto-entrepreneur), hors TVA'; if (F.fIS[y]) return `TVA 20 % · IS 20 % · cotisation minimale ${F.cmExo[y] ? 'exonérée (36 premiers mois)' : 'due'}${R.P.css && R.P.css[y] ? ` · contribution de solidarité ${pc(R.P.cssRate[y], 1)}` : ''}`; return 'Exonérée (coopérative / association), hors TVA'; };
  return card('1. Statut juridique & régime fiscal par année', 'Tu peux démarrer en auto-entrepreneur puis passer en SARL. L\'outil applique la fiscalité correspondante.',
    `<div class="grid g3">${[0, 1, 2].map(y => fSel(`hyp.statut.${y}`, yrLab(y), L.L_Statut || [], { hyp: true, help: regime(y) })).join('')}</div>
     <div class="grid g3" style="margin-top:12px">${fSel('hyp.aeNature', 'Si auto-entrepreneur : nature de l\'activité', ['Commerce', 'Industrie', 'Artisanat', 'Services'], { hyp: true, help: 'Services : 1 % du CA, plafond 200 000 DH. Commerce/industrie : 0,5 %, plafond 500 000 DH.' })}
     ${fDate('hyp.debutSoc', 'Début d\'exploitation de la société', { help: 'Pour les 36 mois d\'exonération de la cotisation minimale. Vide = 1re année en société.' })}
     ${fSel('hyp.reserveSarl', 'SARL : réserve légale prévue dans les statuts ?', ['Oui', 'Non'], { hyp: true })}</div>
     <details class="help"><summary>Quel statut choisir ?</summary><div class="tw" style="margin-top:8px"><table><tr><th>Statut</th><th>Pour qui</th><th>Fiscalité</th><th>À savoir</th></tr>
     <tr><td>Auto-entrepreneur</td><td>Démarrage seul, petit CA</td><td>IR 0,5 % ou 1 % du CA encaissé, hors TVA</td><td>Plafond 200 k DH (services) / 500 k DH ; pas d'associés ni de levée</td></tr>
     <tr><td>SARL / SARL-AU</td><td>TPME, associés peu nombreux</td><td>IS 20 %, TVA 20 %, cotisation minimale 0,25 %</td><td>Capital libre ; simple et répandue</td></tr>
     <tr><td>SAS</td><td>Startups qui lèvent des fonds</td><td>Comme la SARL</td><td>Statuts flexibles (actions de préférence, BSPCE…)</td></tr>
     <tr><td>SA</td><td>Grands projets</td><td>Comme la SARL</td><td>Capital minimum 300 000 DH, gouvernance lourde</td></tr>
     <tr><td>Coopérative</td><td>Producteurs, artisans regroupés</td><td>Exonérée sauf services et transformation ≥ 10 M DH</td><td>Ristournes aux adhérents, réserve 10 %</td></tr></table></div></details>`)
  + card('2. Calendrier', '', `<div class="grid g3">${fDate('hyp.start', 'Début du business plan (mois 1)', { hyp: true })}${fDate('hyp.ventes', 'Démarrage des ventes', { hyp: true, help: 'Avant : préparation (dépenses sans ventes).' })}</div>`)
  + card('3. Saisonnalité des ventes', 'Coefficient par mois (1 = mois normal, 1,5 = +50 %). Vide = 1. L\'outil normalise la moyenne à 100 %.',
    `<div class="row" style="margin-bottom:10px"><span class="small muted">Modèle :</span>${Object.keys(SAISONS).map(k => `<button class="btn sm" data-act="saison" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
     <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(88px,1fr))">${MOIS.map((m, i) => fNum(`hyp.saison.${i}`, m, { hyp: true, ph: '1' })).join('')}</div>`)
  + card('4. Hypothèses économiques', '', `<div class="grid g3">
     ${fPct('hyp.inflation', 'Inflation annuelle', { hyp: true, help: 'S\'applique aux coûts, charges et salaires laissés vides en An 2-3.' })}
     ${fSel('hyp.inflPrix', 'Répercuter l\'inflation sur mes prix ?', ['Non', 'Oui'], { hyp: true })}
     ${fNum('hyp.coussin', 'Trésorerie de sécurité souhaitée', { hyp: true, suf: 'DH' })}
     ${fNum('hyp.delaiClient', 'Délai moyen de paiement clients', { hyp: true, suf: 'j', help: 'B2C comptant : 0. B2B : 30-60. Public : 90-120.' })}
     ${fNum('hyp.delaiFourn', 'Délai moyen de paiement fournisseurs', { hyp: true, suf: 'j' })}</div>`)
  + card('5. Distribution des bénéfices', 'Dividendes (société) ou ristournes (coopérative), versés l\'année suivante ; retenue à la source de 10 %. Prélèvements mensuels si auto-entrepreneur.',
    `<div class="tw"><table class="et"><tr><th></th>${[0, 1, 2].map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>
     <tr><td>Part du bénéfice distribuable versée</td>${[0, 1, 2].map(y => `<td>${cellIn(`hyp.distrib.${y}`, 'pct')}</td>`).join('')}</tr>
     <tr><td>Prélèvements mensuels de l'auto-entrepreneur (DH)</td>${[0, 1, 2].map(y => `<td>${cellIn(`hyp.prelev.${y}`, 'num')}</td>`).join('')}</tr></table></div>`);
}, () => filled(S.hyp.start, S.hyp.ventes, S.hyp.statut[0]));

function offerCard(o, i) {
  const p = `offers.${i}`; const oc = R && R.offers[i];
  const models = (L.M_PType || []).map(r => r[0]);
  const vrow = (si, lab) => `<tr><td>${lab}</td>${[0, 1, 2].map(y => `<td>${cellIn(`${p}.vol.${si}.${y}`, 'num', { ph: si === 1 ? '' : 'vide = réaliste' })}</td>`).join('')}</tr>`;
  const comps = (o.comps || []).map((c, j) => `<tr><td>${cellIn(`${p}.comps.${j}.label`, 'text', { list: 'L_ChVar' })}</td><td>${cellIn(`${p}.comps.${j}.rub`, 'sel', { opts: E.RUB.slice(0, 3).concat(['Charges de personnel']) })}</td><td>${cellIn(`${p}.comps.${j}.tva`, 'sel', { opts: [[0.2, '20 %'], [0.1, '10 %'], [0, '0 %']], t: 'num' })}</td>${[0, 1, 2].map(y => `<td>${cellIn(`${p}.comps.${j}.cout.${y}`, 'num')}</td>`).join('')}<td class="x"><button class="del" data-act="del" data-arr="${p}.comps" data-i="${j}">×</button></td></tr>`).join('');
  const res = oc ? `<div class="tw" style="margin-top:10px"><table><tr><th>Résultat calculé</th>${[0, 1, 2].map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>
    <tr><td>Volume annuel</td>${[0, 1, 2].map(y => `<td class="n">${fmt(oc.yr.vol[y])}</td>`).join('')}</tr>
    <tr><td>Chiffre d'affaires HT</td>${[0, 1, 2].map(y => `<td class="n">${fmt(oc.yr.ca[y])}</td>`).join('')}</tr>
    <tr><td>Coût variable unitaire</td>${[0, 1, 2].map(y => `<td class="n">${fmt(oc.cu[y], 2)}</td>`).join('')}</tr>
    <tr><td>Marge sur coût variable</td>${[0, 1, 2].map(y => `<td class="n">${fmt(oc.yr.ca[y] - oc.yr.cv[y])} <span class="muted">(${pc(oc.prix[y] ? (oc.prix[y] - oc.cu[y]) / oc.prix[y] : null, 0)})</span></td>`).join('')}</tr></table></div>` : '';
  return `<section class="card"><div class="row"><span class="eyebrow">Offre ${i + 1}</span><span class="sp"></span><button class="btn sm ghost" data-act="dup" data-arr="offers" data-i="${i}">Dupliquer</button><button class="btn sm ghost" data-act="del" data-arr="offers" data-i="${i}">Supprimer</button></div>
   <div class="grid g3" style="margin-top:8px">${fText(`${p}.nom`, 'Nom de l\'offre', { cls: '' })}${fSel(`${p}.modele`, 'Modèle de revenu', models, { empty: '—' })}${fText(`${p}.cible`, 'Cible principale', { list: 'L_Cible' })}
   ${fText(`${p}.unite`, 'Unité de vente', { list: 'L_Unite' })}${fText(`${p}.gamme`, 'Positionnement prix', { list: 'L_Gamme' })}${fDate(`${p}.lancement`, 'Date de lancement', { help: 'Vide = démarrage des ventes' })}
   ${fSel(`${p}.tva`, 'TVA sur la vente', [[0.2, '20 %'], [0.1, '10 %'], [0, 'Exonéré / 0 %']], { t: 'num' })}${fSel(`${p}.recurrent`, 'Revenu récurrent ?', ['Oui', 'Non'], { empty: 'Auto (selon le modèle)' })}</div>
   <div class="tw" style="margin-top:12px"><table class="et"><tr><th style="min-width:230px">Prix & volumes</th>${[0, 1, 2].map(y => `<th class="n" style="min-width:110px">${yrLab(y)}</th>`).join('')}</tr>
   <tr><td><b>Prix de vente unitaire HT</b> <span class="small muted">(vide = an précédent)</span></td>${[0, 1, 2].map(y => `<td>${cellIn(`${p}.prix.${y}`, 'num')}</td>`).join('')}</tr>
   <tr class="sec"><td colspan="4">Volume MENSUEL moyen (unités par mois de vente)</td></tr>
   ${vrow(0, 'Scénario pessimiste')}${vrow(1, '<b>Scénario réaliste</b>')}${vrow(2, 'Scénario optimiste')}</table></div>
   <h3 style="margin:14px 0 6px">Coût variable par unité vendue (HT)</h3>
   <div class="tw"><table class="et"><tr><th style="min-width:200px">Composant</th><th style="min-width:160px">Rubrique du CPC</th><th>TVA</th>${[0, 1, 2].map(y => `<th class="n" style="min-width:85px">${yrLab(y)}</th>`).join('')}<th></th></tr>${comps || '<tr><td colspan="7" class="muted small" style="padding:10px">Aucun coût variable (ex. matières, marchandises, cloud, commissions…).</td></tr>'}</table></div>
   <div class="row" style="margin-top:8px"><button class="btn sm" data-act="add" data-arr="${p}.comps" data-new='${esc(JSON.stringify({ label: '', rub: '', tva: 0.2, cout: ['', '', ''] }))}'>+ Composant de coût</button></div>
   ${res}</section>`;
}
sec('offres', 'Les chiffres', 'Produits & charges variables', 'Jusqu\'à 15 offres : prix, volumes mensuels pour les 3 scénarios et coûts variables unitaires. Le chiffre d\'affaires et les marges se calculent seuls.', () => {
  const K = R ? R.K : null;
  const sum_ = K ? `<div class="tw" style="margin-bottom:16px"><table><tr><th>Offre</th><th>Cible</th>${[0, 1, 2].map(y => `<th class="n">CA ${yrLab(y)}</th>`).join('')}<th class="n">Part An 3</th></tr>${K.offerCA.map(o => `<tr><td>${esc(o.nom)}</td><td>${esc(o.cible || '')}</td>${o.ca.map(v => `<td class="n">${fmt(v)}</td>`).join('')}<td class="n">${pc(K.ca[2] ? o.ca[2] / K.ca[2] : null, 0)}</td></tr>`).join('')}<tr class="tot"><td colspan="2">Total (${S.hyp.scenario})</td>${K.ca.map(v => `<td class="n">${fmt(v)}</td>`).join('')}<td></td></tr></table></div>` : '';
  return sum_ + (S.offers || []).map(offerCard).join('') +
    `<div class="row">${(S.offers || []).length < 15 ? `<button class="btn pri" data-act="add" data-arr="offers" data-new='${esc(JSON.stringify({ nom: 'Nouvelle offre', modele: '', cible: '', unite: '', gamme: '', tva: 0.2, lancement: '', prix: ['', '', ''], vol: [['', '', ''], ['', '', ''], ['', '', '']], comps: [] }))}'>+ Ajouter une offre</button>` : ''}</div>`
    + card('Stocks de fin d\'année (valeur d\'achat HT)', 'Marchandises revendues en l\'état, matières à transformer et produits finis non vendus. Vide = année précédente.',
      `<div class="tw"><table class="et"><tr><th></th>${[0, 1, 2].map(y => `<th class="n">Fin ${yrLab(y)}</th>`).join('')}</tr>${['Marchandises', 'Matières, composants & emballages', 'Produits finis'].map((l, k) => `<tr><td>${l}</td>${[0, 1, 2].map(y => `<td>${cellIn(`stocks.${k}.${y}`, 'num')}</td>`).join('')}</tr>`).join('')}</table></div>`);
}, () => filled(S.offers));

sec('investissements', 'Les chiffres', 'Investissements', 'Les biens durables nécessaires pour produire et vendre. Le taux d\'amortissement et la rubrique du bilan viennent du barème DGI selon le type.', () => {
  const types = (L.InvTypes || []).map(r => [r[0], `${r[0]} (${fmt(r[1] * 100)} %)`]);
  return card('Situation de départ', 'Activité existante seulement : immobilisations déjà acquises, trésorerie et stock au démarrage.',
    `<div class="grid g3" style="margin-bottom:10px">${fNum('openCash', 'Trésorerie disponible au démarrage', { suf: 'DH' })}${fNum('openStock', 'Stock déjà en place', { suf: 'DH' })}</div>` +
    tableEd('invExist', [{ k: 'label', l: 'Libellé', w: 180 }, { k: 'type', l: 'Type', t: 'sel', opts: types, w: 220 }, { k: 'date', l: 'Date d\'acquisition', t: 'date' }, { k: 'montant', l: 'Valeur d\'achat HT', t: 'num', w: 100 }, { k: 'taux', l: 'Taux (option)', t: 'pct', w: 70 }], { add: 'Ajouter un bien existant' }))
  + card('Investissements prévus', 'Paiement en une fois ou échelonné (nombre de mensualités).',
    tableEd('inv', [{ k: 'label', l: 'Libellé', w: 200 }, { k: 'type', l: 'Type', t: 'sel', opts: types, w: 220 }, { k: 'date', l: 'Date', t: 'date' }, { k: 'montant', l: 'Montant HT', t: 'num', w: 95 }, { k: 'mode', l: 'Paiement', t: 'sel', opts: L.L_ModePaie || ['En une fois', 'Échelonné / à crédit (plusieurs versements)'], w: 150 }, { k: 'nb', l: 'Nb versements', t: 'num', w: 60 }, { k: 'date1', l: '1er versement', t: 'date' }, { k: 'taux', l: 'Taux amort.', t: 'pct', w: 65 }],
      { add: 'Ajouter un investissement', newRow: { label: '', type: 'Matériel informatique (ordinateurs, périphériques)', date: S.hyp.start, montant: '', mode: 'En une fois', nb: '', date1: '', taux: '' } }))
  + (R ? card('Synthèse', '', `<div class="tw"><table><tr><th></th>${[0, 1, 2].map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>
    <tr><td>Dotations aux amortissements</td>${R.P.dot.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr>
    <tr><td>Investissements payés (TTC)</td>${[0, 1, 2].map(y => `<td class="n">${fmt(R.C.decInv.slice(y * 12 + 1, y * 12 + 13).reduce((a, b) => a + b, 0))}</td>`).join('')}</tr>
    <tr><td>Valeur nette des immobilisations (fin)</td>${[1, 2, 3].map(y => `<td class="n">${fmt(R.B[y].actifImmo)}</td>`).join('')}</tr></table></div>`) : '');
}, () => filled(S.inv));

sec('charges', 'Les chiffres', 'Charges fixes', 'Ce que tu paies même sans vendre. Les salaires, le marketing et les amortissements viennent déjà des autres sections.', () => {
  const per = (L.M_Periodicite || []).map(r => r[0]);
  const rec = card('Charges récurrentes — montants MENSUELS HT', 'Choisis un libellé (la TVA et la périodicité se proposent seules). Vide en An 2-3 = an précédent + inflation.',
    tableEd('fixRec', [{ k: 'label', l: 'Charge', list: 'L_ChFix', w: 220 }, { k: 'debut', l: 'Début', t: 'date' }, { k: 'fin', l: 'Fin', t: 'date' }, { k: 'per', l: 'Paiement', t: 'sel', opts: per, w: 110 }, { k: 'tva', l: 'TVA ?', t: 'sel', opts: ['Oui', 'Non'], w: 70 }, { k: 'm.0', l: 'Mensuel An 1', t: 'num', w: 85 }, { k: 'm.1', l: 'An 2', t: 'num', w: 80 }, { k: 'm.2', l: 'An 3', t: 'num', w: 80 }],
      { add: 'Ajouter une charge', newRow: { label: '', debut: S.hyp.start, fin: '', per: 'Mensuelle', tva: 'Oui', m: ['', '', ''] } }));
  const pon = card('Charges ponctuelles (HT)', 'Une seule fois, à une date précise : étude de marché, logo, salon, certification…',
    tableEd('fixPon', [{ k: 'label', l: 'Charge', list: 'L_ChPonct', w: 240 }, { k: 'date', l: 'Date', t: 'date' }, { k: 'montant', l: 'Montant HT', t: 'num', w: 100 }, { k: 'tva', l: 'TVA ?', t: 'sel', opts: ['Oui', 'Non'], w: 70 }], { add: 'Ajouter une charge ponctuelle', newRow: { label: '', date: '', montant: '', tva: 'Oui' } }));
  const recap = R ? card('Récapitulatif par rubrique du CPC (charges d\'exploitation)', 'Charges variables + fixes + personnel + marketing.', `<div class="tw"><table><tr><th>Rubrique</th>${[0, 1, 2].map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>${E.RUB.map((r, i) => `<tr><td>${r}</td>${R.rub[i].map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr>`).join('')}<tr><td>Dotations aux amortissements</td>${R.P.dot.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr><tr class="tot"><td>Total charges d'exploitation</td>${R.P.chExp.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr></table></div>`) : '';
  return rec + pon + recap;
}, () => filled(S.fixRec));

sec('financements', 'Les chiffres', 'Financements', 'D\'où vient l\'argent : apports et levées (capital), comptes courants, subventions, prix, et emprunts avec leur tableau d\'amortissement.', () => {
  const nat = L.L_Nature || [];
  const loanSum = R ? `<div class="tw" style="margin-top:10px"><table><tr><th>Emprunt</th><th class="n">Montant</th><th class="n">Différé</th><th class="n">Mensualités</th><th class="n">Mensualité</th><th class="n">Coût des intérêts</th></tr>${R.loans.map(l => `<tr><td>${esc(l.label || '')}</td><td class="n">${fmt(l.D)}</td><td class="n">${l.Lr} mois</td><td class="n">${l.Mn}</td><td class="n">${fmt(l.pmt)}</td><td class="n">${fmt(l.totInt)}</td></tr>`).join('')}</table></div>` : '';
  const need = R ? `<div class="tiles" style="margin-top:4px"><div class="tile ${R.C.min < 0 ? 'k-crit' : 'k-good'}"><small>Trésorerie la plus basse</small><b class="${R.C.min < 0 ? 'neg' : ''}">${kdh(R.C.min)}</b><span>${mLong(R.C.minM)}</span></div><div class="tile ${R.C.fonds > 0 ? 'k-crit' : 'k-good'}"><small>Fonds à lever en plus</small><b>${kdh(R.C.fonds)}</b><span>pour ne jamais être à découvert</span></div><div class="tile"><small>Avec ton coussin</small><b>${kdh(Math.max(0, N(S.hyp.coussin) - R.C.min))}</b><span>pour garder ${kdh(N(S.hyp.coussin))}</span></div></div>` : '';
  return need + card('Apports, levées, subventions, aides & dons', 'La nature comptable se propose selon la source : une subvention d\'exploitation améliore le résultat tout de suite, une subvention d\'investissement est étalée.',
    tableEd('fin', [{ k: 'source', l: 'Source', list: 'L_Source', w: 260 }, { k: 'nature', l: 'Nature comptable', t: 'sel', opts: nat, w: 220 }, { k: 'montant', l: 'Montant (DH)', t: 'num', w: 110 }, { k: 'date', l: 'Date de versement', t: 'date' }, { k: 'duree', l: 'Reprise (ans) — subv. invest.', t: 'num', w: 80 }],
      { add: 'Ajouter un financement', newRow: { source: '', nature: '', montant: '', date: S.hyp.start, duree: '' } }))
  + card('Emprunts (prêt d\'honneur, crédit bancaire, Intelaka…)', 'Mensualité et échéancier calculés automatiquement. Différé « intérêts seuls » : tu ne paies que les intérêts ; « franchise totale » : rien.',
    tableEd('loans', [{ k: 'type', l: 'Type', list: 'L_TypeEmp', w: 200 }, { k: 'preteur', l: 'Prêteur', w: 130 }, { k: 'montant', l: 'Montant', t: 'num', w: 100 }, { k: 'taux', l: 'Taux annuel', t: 'pct', w: 70 }, { k: 'duree', l: 'Durée (mois)', t: 'num', w: 70 }, { k: 'differe', l: 'Différé (mois)', t: 'num', w: 70 }, { k: 'typeDiff', l: 'Type de différé', t: 'sel', opts: L.L_DiffType || [], w: 170 }, { k: 'date', l: 'Déblocage', t: 'date' }],
      { add: 'Ajouter un emprunt', newRow: { type: '', preteur: '', montant: '', taux: 0.05, duree: 60, differe: 0, typeDiff: 'Aucun', date: S.hyp.start } }) + loanSum);
}, () => filled(S.fin));
