/* ================= Résultats ================= */
const charts = [];
function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function killCharts() { while (charts.length) { try { charts.pop().destroy(); } catch (e) { } } }
function mkChart(id, cfg) {
  const el = document.getElementById(id); if (!el || !window.Chart) return;
  const ink = tok('--muted'), line = tok('--line');
  Chart.defaults.font.family = 'IBM Plex Sans, system-ui, sans-serif'; Chart.defaults.color = ink;
  cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { labels: { boxWidth: 12, color: ink } }, tooltip: { callbacks: { label: c => `${c.dataset.label ? c.dataset.label + ' : ' : ''}${fmt(c.parsed.y ?? c.parsed)} DH` } } } }, cfg.options || {});
  if (cfg.type !== 'doughnut') cfg.options.scales = Object.assign({ x: { grid: { display: false }, ticks: { color: ink } }, y: { grid: { color: line }, ticks: { color: ink, callback: v => kdh(v).replace(' DH', '') } } }, cfg.options.scales || {});
  charts.push(new Chart(el, cfg));
}
function repere(kind, v) {
  const prof = S.hyp.profil || '';
  const st = prof.startsWith('Startup');
  const R_ = {
    growth: st ? [v >= 1, v >= .5, 'Startup : ×2 à ×3 par an'] : [v >= .2, v >= .05, 'TPME : +10 à +30 %/an'],
    gm: st ? [v >= .7, v >= .5, 'SaaS : ≥ 70 % ; hardware : ≥ 40 %'] : [v >= .4, v >= .25, 'Selon le secteur, ≥ 30-40 %'],
    tebe: [v >= .15, v >= 0, '≥ 10-15 % une fois lancé'],
    ltvCac: [v >= 3, v >= 1.5, '≥ 3 (a16z, Bessemer)'],
    payback: [v <= 12, v <= 18, '≤ 12 mois (B2B : ≤ 18)'],
    churn: [v <= .02, v <= .05, 'B2B : ≤ 1-2 %/mois ; B2C : ≤ 5 %'],
    nrr: [v >= 1, v >= .9, '≥ 100 % (top : ≥ 120 %)'],
    rule40: [v >= .4, v >= .2, '≥ 40 %'],
    burnMult: [v <= 1.5, v <= 2.5, '< 1,5 excellent ; > 3 inquiétant'],
    runway: [v >= 18, v >= 12, '≥ 18 mois'],
    autonomie: [v >= .3, v >= .15, '≥ 30 %'],
    gearing: [v <= 1, v <= 2, '≤ 1 (banques)']
  }[kind];
  if (!R_ || v === null || v === undefined || isNaN(v)) return ['mut', R_ ? R_[2] : ''];
  return [R_[0] ? 'good' : R_[1] ? 'warn' : 'crit', R_[2]];
}
function kpiRow(label, arr, f, kind) { return `<tr><td>${label}</td>${arr.map(v => { const [c] = kind ? repere(kind, v) : ['']; return `<td class="n">${kind && v !== null && v !== undefined ? `<span class="pill ${c}">${f(v)}</span>` : f(v)}</td>`; }).join('')}<td class="small muted">${kind ? repere(kind, null)[1] : ''}</td></tr>`; }

sec('tableau', 'Résultats', 'Tableau de bord', 'La photo de ton projet en chiffres-clés sur 3 ans, puis les métriques que regardent les investisseurs.', () => {
  if (!R) return '';
  const K = R.K, P = R.P, C = R.C;
  const tiles = [
    ['CA ' + yrLab(2), kdh(K.ca[2]), K.growth[2] !== null ? `${pc(K.growth[2], 0)} vs an 2` : '', ''],
    ['EBE ' + yrLab(2), kdh(P.ebe[2]), pc(K.tebe[2]) + ' du CA', P.ebe[2] >= 0 ? 'k-good' : 'k-crit'],
    ['Résultat net An 3', kdh(P.rn[2]), `An 1 : ${kdh(P.rn[0])}`, P.rn[2] >= 0 ? 'k-good' : 'k-crit'],
    ['Trésorerie la plus basse', kdh(C.min), mLong(C.minM), C.min < 0 ? 'k-crit' : C.min < N(S.hyp.coussin) ? 'k-warn' : 'k-good'],
    ['Fonds à lever en plus', kdh(C.fonds), 'pour ne jamais être à découvert', C.fonds > 0 ? 'k-crit' : 'k-good'],
    ['Point mort opérationnel', C.pointMort ? mLong(C.pointMort) : 'Non atteint', '1er mois d\'EBE positif', C.pointMort ? 'k-good' : 'k-warn']];
  const al = R.alerts.length ? R.alerts.map(([t, m]) => `<div class="al ${t}">${t === 'crit' ? '⚠' : t === 'warn' ? '!' : 'i'} <span>${esc(m)}</span></div>`).join('') : '<div class="al good">✓ <span>Aucune alerte : trésorerie positive et hypothèses cohérentes.</span></div>';
  const y3 = [0, 1, 2];
  const ind = `<div class="tw"><table><tr><th>Indicateur</th>${y3.map(y => `<th class="n">${yrLab(y)}</th>`).join('')}<th>Repère</th></tr>
   ${kpiRow('Chiffre d\'affaires HT', K.ca, fmt)}${kpiRow('Croissance du CA', K.growth, v => pc(v, 0), 'growth')}
   ${kpiRow('EBE (≈ EBITDA)', P.ebe, fmt)}${kpiRow('Taux d\'EBE', K.tebe, pc, 'tebe')}
   ${kpiRow('Résultat net', P.rn, fmt)}${kpiRow('Marge nette', K.marge, pc)}
   ${kpiRow('Capacité d\'autofinancement', P.caf, fmt)}${kpiRow('Seuil de rentabilité (CA)', P.sr, fmt)}${kpiRow('CA / seuil', K.srRatio, v => pc(v, 0))}
   ${kpiRow('Besoin en fonds de roulement', K.bfr, fmt)}${kpiRow('Trésorerie fin d\'année', K.cashEnd, fmt)}${kpiRow('Trésorerie la plus basse', C.minY, fmt)}
   ${kpiRow('Capitaux propres', K.cp, fmt)}${kpiRow('Dettes de financement', K.dettes, fmt)}${kpiRow('Endettement (dettes / CP)', K.gearing, v => fmt(v, 2), 'gearing')}${kpiRow('Autonomie financière', K.autonomie, pc, 'autonomie')}
   ${kpiRow('Effectif salarié (fin d\'année)', K.head, fmt)}${kpiRow('Coût de l\'équipe / CA', K.teamRatio, pc)}${kpiRow('Marketing / CA', K.mktRatio, pc)}
   ${kpiRow('Dividendes nets (au titre de l\'année)', R.A.net, fmt)}</table></div>`;
  const kp = S.kpi;
  const cust = card('Données clients (pour les métriques startup)', '', `<div class="tw"><table class="et"><tr><th></th>${y3.map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>
    <tr><td>Clients actifs au démarrage</td><td>${cellIn('kpi.clients0', 'num')}</td><td></td><td></td></tr>
    <tr><td>Nouveaux clients acquis dans l'année</td>${y3.map(y => `<td>${cellIn(`kpi.nouveaux.${y}`, 'num')}</td>`).join('')}</tr>
    <tr><td>Clients actifs en fin d'année</td>${y3.map(y => `<td>${cellIn(`kpi.actifs.${y}`, 'num')}</td>`).join('')}</tr>
    <tr><td>Churn mensuel moyen</td>${y3.map(y => `<td>${cellIn(`kpi.churn.${y}`, 'pct')}</td>`).join('')}</tr>
    <tr><td>Durée de vie client (mois) si pas de churn</td>${y3.map(y => `<td>${cellIn(`kpi.vie.${y}`, 'num')}</td>`).join('')}</tr>
    <tr><td>Dépenses commerciales hors marketing (DH)</td>${y3.map(y => `<td>${cellIn(`kpi.commercial.${y}`, 'num')}</td>`).join('')}</tr>
    <tr><td>Expansion annuelle du revenu des clients</td>${y3.map(y => `<td>${cellIn(`kpi.expansion.${y}`, 'pct')}</td>`).join('')}</tr></table></div>`);
  const st = `<div class="tw"><table><tr><th>Métrique</th>${y3.map(y => `<th class="n">${yrLab(y)}</th>`).join('')}<th>Repère</th></tr>
   ${kpiRow('MRR — revenu mensuel récurrent (fin d\'année)', K.mrr, fmt)}${kpiRow('ARR — récurrent annualisé', K.arr, fmt)}${kpiRow('Part du CA récurrent', K.recShare, v => pc(v, 0))}
   ${kpiRow('Croissance mensuelle équivalente (CMGR)', K.cmgr, pc)}${kpiRow('Marge brute (sur coûts variables)', K.gm, pc, 'gm')}
   ${kpiRow('ARPU — revenu moyen / client / mois', K.arpu, fmt)}${kpiRow('CAC — coût d\'acquisition client', K.cac, fmt)}${kpiRow('LTV — valeur vie client', K.ltv, fmt)}
   ${kpiRow('LTV / CAC', K.ltvCac, v => fmt(v, 1), 'ltvCac')}${kpiRow('Payback du CAC (mois)', K.payback, v => fmt(v, 1), 'payback')}
   ${kpiRow('Churn annuel équivalent', K.churnA, pc)}${kpiRow('NRR — rétention nette du revenu', K.nrr, v => pc(v, 0), 'nrr')}
   ${kpiRow('Burn net mensuel (3 derniers mois)', K.burnNet, fmt)}${kpiRow('Runway (mois)', K.runway, v => fmt(v, 1), 'runway')}
   ${kpiRow('Rule of 40', K.rule40, v => pc(v, 0), 'rule40')}${kpiRow('Burn multiple', K.burnMult, v => fmt(v, 2), 'burnMult')}${kpiRow('Magic number (efficacité commerciale)', K.magic, v => fmt(v, 2))}
   </table></div><p class="small muted" style="margin-top:6px">Repères : Andreessen Horowitz, Y Combinator, Bessemer, Craft Ventures. Default alive (Paul Graham) : ${C.min >= 0 ? '<b class="pos">oui</b>, la trésorerie tient sur 36 mois' : '<b class="neg">non</b>, il faut lever ' + kdh(C.fonds)}.</p>`;
  const cib = `<div class="tw"><table><tr><th>Cible / nature</th>${y3.map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>${Object.entries(K.byCible).map(([k, v]) => `<tr><td>${esc(k)}</td>${v.map(x => `<td class="n">${fmt(x)}</td>`).join('')}</tr>`).join('')}<tr><td class="muted">dont marchandises revendues</td>${K.caMarch.map(x => `<td class="n">${fmt(x)}</td>`).join('')}</tr><tr><td class="muted">dont revenu récurrent</td>${K.caRec.map(x => `<td class="n">${fmt(x)}</td>`).join('')}</tr></table></div>`;
  return `<div class="tiles">${tiles.map(t => `<div class="tile ${t[3]}"><small>${t[0]}</small><b>${t[1]}</b><span>${t[2]}</span></div>`).join('')}</div>
  <div class="alerts">${al}</div>${(S.aVerifier || []).length ? card('Hypothèses à vérifier (posées par l\'IA à l\'import)', 'Confirme ou corrige chacune dans la section concernée.', `<ul class="small">${S.aVerifier.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`) : ''}
  <div class="charts"><div class="chart"><h3>CA, EBE et résultat net</h3><div class="cv"><canvas id="ch1"></canvas></div></div>
  <div class="chart"><h3>Trésorerie fin de mois (36 mois)</h3><div class="cv"><canvas id="ch2"></canvas></div></div>
  <div class="chart"><h3>Contribution des offres au CA — ${yrLab(2)}</h3><div class="cv"><canvas id="ch3"></canvas></div></div>
  <div class="chart"><h3>Structure des charges — ${yrLab(0)}</h3><div class="cv"><canvas id="ch4"></canvas></div></div></div>
  ${card('1. Indicateurs clés', `Scénario ${S.hyp.scenario} · profil ${esc(S.hyp.profil)} · ventes dès ${mLong(R.salesStart)}`, ind)}
  ${card('2. D\'où vient mon chiffre d\'affaires ?', '', cib)}
  ${cust}${card('3. Métriques startup & investisseurs (unit economics)', '', st)}`;
}, () => 2);
function drawDash() {
  if (!R) return;
  const K = R.K, P = R.P, C = R.C;
  const pri = tok('--primary'), acc = tok('--accent'), good = tok('--good'), crit = tok('--crit'), mut = tok('--muted');
  const yl = [0, 1, 2].map(yrLab);
  mkChart('ch1', { type: 'bar', data: { labels: yl, datasets: [{ label: 'CA', data: K.ca, backgroundColor: pri }, { label: 'EBE', data: P.ebe, backgroundColor: acc }, { label: 'Résultat net', data: P.rn, backgroundColor: P.rn.map(v => v >= 0 ? good : crit) }] } });
  const ml = Array.from({ length: 36 }, (_, i) => mLab(i + 1));
  mkChart('ch2', { type: 'line', data: { labels: ml, datasets: [{ label: 'Trésorerie', data: C.fin.slice(1), borderColor: pri, backgroundColor: pri + '22', fill: true, pointRadius: 0, tension: .25 }, { label: 'Coussin', data: ml.map(() => N(S.hyp.coussin)), borderColor: acc, borderDash: [5, 4], pointRadius: 0 }, { label: 'Zéro', data: ml.map(() => 0), borderColor: crit, borderWidth: 1, pointRadius: 0 }] }, options: { scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 12, color: mut } } } } });
  const offs = K.offerCA.filter(o => o.ca[2] > 0).sort((a, b) => b.ca[2] - a.ca[2]);
  mkChart('ch3', { type: 'bar', data: { labels: offs.map(o => o.nom.length > 34 ? o.nom.slice(0, 33) + '…' : o.nom), datasets: [{ label: 'CA', data: offs.map(o => o.ca[2]), backgroundColor: offs.map(o => o.rec ? pri : acc) }] }, options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.parsed.x) + ' DH' } } }, scales: { x: { grid: { color: tok('--line') }, ticks: { color: mut, callback: v => kdh(v).replace(' DH', '') } }, y: { grid: { display: false }, ticks: { color: mut, font: { size: 11 } } } } } });
  const labs = ['Achats revendus', 'Achats consommés', 'Charges externes', 'Impôts et taxes', 'Personnel', 'Autres', 'Amortissements'];
  const vals = [...R.rub.map(r => r[0]), P.dot[0]];
  const cols = [acc, tok('--warn'), pri, mut, tok('--good'), tok('--line'), tok('--crit')];
  const keep = vals.map((v, i) => i).filter(i => vals[i] > 0);
  mkChart('ch4', { type: 'doughnut', data: { labels: keep.map(i => labs[i]), datasets: [{ data: keep.map(i => vals[i]), backgroundColor: keep.map(i => cols[i]), borderColor: tok('--surface'), borderWidth: 2 }] }, options: { cutout: '58%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, color: mut } }, tooltip: { callbacks: { label: c => `${c.label} : ${fmt(c.parsed)} DH` } } } } });
}

/* ---- Scénarios & stress test ---- */
const WHAT = { prix: 0, vol: 0, cout: 0, sal: 0, retard: 0, delai: 0, fx: 0 };
function applyWhat(src) {
  const s = clone(src);
  const f = (v, k) => isB(v) ? v : N(v) * (1 + k);
  s.offers.forEach(o => { o.prix = o.prix.map(v => f(v, WHAT.prix / 100)); o.vol = o.vol.map(r => r.map(v => f(v, WHAT.vol / 100))); const fxK = (1 + WHAT.cout / 100) * (1 + WHAT.fx / 100 * Math.min(1, N(s.hyp.partImport))) - 1; o.comps.forEach(c => c.cout = c.cout.map(v => f(v, fxK))); });
  s.staff.forEach(p => p.net = p.net.map(v => f(v, WHAT.sal / 100)));
  if (WHAT.retard) {
    const sh = d => { if (!d) return d; const x = new Date(d + 'T00:00:00'); x.setMonth(x.getMonth() + WHAT.retard); return x.toISOString().slice(0, 10); };
    s.hyp.ventes = sh(s.hyp.ventes || s.hyp.start); s.offers.forEach(o => o.lancement = sh(o.lancement));
  }
  s.hyp.delaiClient = N(s.hyp.delaiClient) + WHAT.delai;
  return s;
}
sec('scenarios', 'Résultats', 'Scénarios & stress test', 'Compare les 3 scénarios de volumes côte à côte, puis teste la résistance du projet : baisse des prix, hausse des coûts, retard de lancement…', () => {
  const base = [0, 1, 2].map(i => E.run(S, L, i));
  const ws = applyWhat(S); const what = [0, 1, 2].map(i => E.run(ws, L, i));
  const row = (lab, f, fm = kdh) => `<tr><td>${lab}</td>${base.map(r => `<td class="n">${fm(f(r))}</td>`).join('')}</tr>`;
  const t = `<div class="tw"><table><tr><th>Indicateur</th>${SC.map((s, i) => `<th class="n">${s}${SC[i] === S.hyp.scenario ? ' (actif)' : ''}</th>`).join('')}</tr>
   ${[0, 1, 2].map(y => row(`CA ${yrLab(y)}`, r => r.P.ca[y])).join('')}
   ${row('EBE An 3', r => r.P.ebe[2])}${row('Résultat net An 1', r => r.P.rn[0])}${row('Résultat net An 3', r => r.P.rn[2])}
   ${row('Résultat net cumulé 3 ans', r => r.P.rn[0] + r.P.rn[1] + r.P.rn[2])}
   ${row('Trésorerie la plus basse', r => r.C.min)}${row('Trésorerie fin An 3', r => r.C.fin[36])}
   ${row('Fonds à lever en plus', r => r.C.fonds)}${row('Point mort opérationnel', r => r.C.pointMort, v => v ? mLong(v) : 'Non atteint')}
   ${row('Seuil de rentabilité An 1', r => r.P.sr[0])}</table></div>`;
  const sl = (k, lab, min, max, step, suf) => `<div class="f"><label for="w_${k}">${lab} : <b class="mono" id="wv_${k}">${WHAT[k] > 0 ? '+' : ''}${WHAT[k]}${suf}</b></label><input type="range" id="w_${k}" data-what="${k}" min="${min}" max="${max}" step="${step}" value="${WHAT[k]}"></div>`;
  const wt = `<div class="tw" style="margin-top:12px"><table><tr><th>Avec le stress test</th>${SC.map(s => `<th class="n">${s}</th>`).join('')}</tr>
   ${[['Résultat net An 3', r => r.P.rn[2]], ['Résultat net cumulé', r => r.P.rn[0] + r.P.rn[1] + r.P.rn[2]], ['Trésorerie la plus basse', r => r.C.min], ['Fonds à lever en plus', r => r.C.fonds]].map(([l, f]) => `<tr><td>${l}</td>${what.map((r, i) => { const d = f(r) - f(base[i]); return `<td class="n">${kdh(f(r))} <span class="small ${d >= 0 ? 'pos' : 'neg'}">${d ? (d > 0 ? '+' : '') + kdh(d) : ''}</span></td>`; }).join('')}</tr>`).join('')}
   <tr><td>Point mort</td>${what.map(r => `<td class="n">${r.C.pointMort ? mLong(r.C.pointMort) : 'Non atteint'}</td>`).join('')}</tr></table></div>`;
  return `${card('Comparaison des 3 scénarios', 'Les volumes de chaque offre changent selon le scénario ; tout le reste est identique.', t)}
  <div class="charts" style="grid-template-columns:minmax(0,1fr)"><div class="chart"><h3>Trésorerie selon le scénario</h3><div class="cv"><canvas id="ch5"></canvas></div></div></div>
  ${card('Stress test (sans modifier tes données)', 'Fais varier les hypothèses clés et vois si le projet tient. Rien n\'est enregistré.', `<div class="grid g3">${sl('prix', 'Prix de vente', -40, 40, 5, ' %')}${sl('vol', 'Volumes', -50, 50, 5, ' %')}${sl('cout', 'Coûts variables', -30, 50, 5, ' %')}${sl('sal', 'Salaires', -20, 40, 5, ' %')}${sl('retard', 'Retard de lancement', 0, 12, 1, ' mois')}${sl('delai', 'Délai clients en plus', 0, 120, 15, ' j')}${sl('fx', 'Hausse de l\'euro ou du dollar', -20, 40, 5, ' %')}${fPct('hyp.partImport', 'Part des achats variables payée en devises', { hyp: true, help: N(S.hyp.partImport) ? 'Le curseur de change s\'applique à cette part de tes coûts variables.' : 'Renseigne-la pour que le curseur de change ait un effet (ex. 60 % si tu importes tes composants).' })}</div>
  <div class="row" style="margin-top:10px"><button class="btn sm" data-act="whatreset">Remettre à zéro</button></div><div id="whatres">${wt}</div>`)}`;
}, () => 2);
function drawScen() {
  const base = [0, 1, 2].map(i => E.run(S, L, i));
  const ml = Array.from({ length: 36 }, (_, i) => mLab(i + 1));
  mkChart('ch5', { type: 'line', data: { labels: ml, datasets: base.map((r, i) => ({ label: SC[i], data: r.C.fin.slice(1), borderColor: [tok('--crit'), tok('--primary'), tok('--good')][i], pointRadius: 0, tension: .25, borderWidth: i === 1 ? 2.5 : 1.5 })) }, options: { scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } } } } });
}

/* ---- États financiers ---- */
function tbl(head, rows) { return `<div class="tw"><table><tr>${head.map((h, i) => `<th class="${i ? 'n' : ''}">${h}</th>`).join('')}</tr>${rows.join('')}</table></div>`; }
function tr(lab, arr, cls = '', f = fmt) { return `<tr class="${cls}"><td>${lab}</td>${arr.map(v => `<td class="n">${f(v)}</td>`).join('')}</tr>`; }
function cpcHTML(P, Rr) {
  const h = ['Rubrique (CGNC)', ...[0, 1, 2].map(yrLab)];
  return tbl(h, [`<tr class="sec"><td colspan="4">I. Produits d'exploitation</td></tr>`, tr('Ventes de marchandises', P.caM), tr('Ventes de biens et services produits', P.caP), tr('→ Chiffre d\'affaires', P.ca, 'tot'), tr('Variation de stocks de produits finis', P.varPF), tr('Subventions d\'exploitation', P.sexp), tr('Autres produits d\'exploitation', P.autresProd), tr('TOTAL I', P.prodExp, 'tot'),
    `<tr class="sec"><td colspan="4">II. Charges d'exploitation</td></tr>`, ...E.RUB.map((r, i) => tr(r, Rr.rub[i])), tr('Dotations d\'exploitation', P.dot), tr('TOTAL II', P.chExp, 'tot'),
    tr('III. RÉSULTAT D\'EXPLOITATION', P.rex, 'grand'), tr('IV. Produits financiers', P.prodFin), tr('V. Charges financières (intérêts)', P.int), tr('VI. Résultat financier', P.rfin, 'tot'), tr('VII. RÉSULTAT COURANT', P.rcai, 'grand'),
    tr('Reprises sur subventions d\'investissement', P.rep), tr('Dons, prix & concours reçus', P.don), tr('Charges non courantes', P.cnc), tr('X. Résultat non courant', P.rnc, 'tot'),
    tr('XI. RÉSULTAT AVANT IMPÔTS', P.rai, 'grand'), tr('XII. Impôts sur les résultats', P.impot), tr('XIII. RÉSULTAT NET', P.rn, 'grand'),
    `<tr class="sec"><td colspan="4">Calcul de l'impôt</td></tr>`, tr('IS théorique (20 %)', P.isTheo), tr('Cotisation minimale', P.cm), tr('IS retenu', P.is), tr('IR libératoire auto-entrepreneur', P.aeIr), tr('Déficit reportable fin d\'année', P.deficit),
    `<tr class="sec"><td colspan="4">Soldes intermédiaires de gestion</td></tr>`, tr('Marge brute sur ventes en l\'état', P.margeMarch), tr('Production de l\'exercice', P.production), tr('Consommation de l\'exercice', P.conso), tr('Valeur ajoutée', P.va, 'tot'), tr('Excédent brut d\'exploitation (EBE)', P.ebe, 'tot'), tr('Capacité d\'autofinancement', P.caf, 'tot'), tr('Taux de marge sur coût variable', P.tmcv, '', pc), tr('Seuil de rentabilité', P.sr)]);
}
function bilanHTML(B) {
  const h = ['Actif', 'Début', ...[0, 1, 2].map(y => 'Fin ' + yrLab(y))]; const c = k => B.map(b => b[k]);
  const a = tbl(h, [tr('Immobilisations en non-valeurs', c('nv')), tr('Immobilisations incorporelles', c('incorp')), tr('Immobilisations corporelles', c('corp')), tr('Immobilisations financières', c('finImmo')), tr('Avances sur immobilisations', c('avances')), tr('ACTIF IMMOBILISÉ (net)', c('actifImmo'), 'tot'),
    tr('Stocks', c('stocks')), tr('Clients (TTC)', c('clients')), tr('État débiteur (crédit TVA, IS d\'avance)', c('etatDeb')), tr('Charges payées d\'avance', c('regulA')), tr('ACTIF CIRCULANT', c('actifCirc'), 'tot'), tr('Trésorerie actif', c('tresoA'), 'tot'), tr('TOTAL ACTIF', c('totalActif'), 'grand')]);
  const p = tbl(['Passif', 'Début', ...[0, 1, 2].map(y => 'Fin ' + yrLab(y))], [tr('Capital social ou personnel', c('capital')), tr('Compte de l\'exploitant (AE)', c('exploitant')), tr('Réserve légale', c('reserve')), tr('Report à nouveau', c('ran')), tr('Résultat net de l\'exercice', c('resultat')), tr('Capitaux propres', c('cp'), 'tot'),
    tr('Subventions d\'investissement nettes', c('subv')), tr('Emprunts (capital restant dû)', c('emprunts')), tr('Comptes courants d\'associés', c('cca')), tr('FINANCEMENT PERMANENT', c('finPerm'), 'tot'),
    tr('Fournisseurs (TTC)', c('fourn')), tr('Organismes sociaux', c('sociaux')), tr('État créditeur (TVA, impôts, IR)', c('etatCred')), tr('Fournisseurs d\'immobilisations', c('fournImmo')), tr('Charges à payer', c('regulP')), tr('PASSIF CIRCULANT', c('passifCirc'), 'tot'), tr('Découvert bancaire', c('tresoP'), 'tot'), tr('TOTAL PASSIF', c('totalPassif'), 'grand'), tr('Contrôle actif − passif', c('ecart'))]);
  return a + '<div style="height:12px"></div>' + p;
}
function tresoHTML(C) {
  const yrs = [0, 1, 2]; const ys = a => yrs.map(y => a.slice(y * 12 + 1, y * 12 + 13).reduce((s, x) => s + x, 0));
  const lines = [['Ventes encaissées (TTC)', 'encVentes'], ['Apports en capital & comptes courants', 'encApports'], ['Subventions, aides, dons & prix', 'encSubv'], ['Emprunts débloqués', 'encEmp'], ['Autres encaissements', 'encAutres'], ['TOTAL ENCAISSEMENTS', 'enc', 'tot'],
    ['Achats & charges variables (TTC, stocks compris)', 'decVar'], ['Charges fixes récurrentes', 'decFix'], ['Charges ponctuelles', 'decPon'], ['Marketing', 'decMkt'], ['Salaires nets', 'decNet'], ['Prestataires & freelances', 'decExt'], ['Cotisations CNSS / AMO', 'decSoc'], ['IR sur salaires', 'decIr'], ['Investissements (TTC)', 'decInv'], ['Remboursement du capital des emprunts', 'decCap'], ['Intérêts', 'decInt'], ['TVA reversée', 'decTva'], ['Impôt sur le résultat', 'decImpot'], ['Dividendes', 'decDiv'], ['Prélèvements de l\'auto-entrepreneur', 'decPrel'], ['TOTAL DÉCAISSEMENTS', 'dec', 'tot'], ['FLUX NET', 'flux', 'grand']];
  const annual = tbl(['Flux', ...yrs.map(yrLab)], [...lines.map(([l, k, c]) => tr(l, ys(C[k]), c || '')), tr('Trésorerie fin d\'année', yrs.map(y => C.fin[(y + 1) * 12]), 'grand')]);
  const months = Array.from({ length: 36 }, (_, i) => i + 1);
  const monthly = `<div class="tw"><table><tr><th style="position:sticky;left:0;background:var(--surface2);min-width:220px">Mois</th>${months.map(m => `<th class="n">${mLab(m)}</th>`).join('')}</tr>${lines.map(([l, k, c]) => `<tr class="${c || ''}"><td style="position:sticky;left:0;background:var(--surface)">${l}</td>${months.map(m => `<td class="n">${C[k][m] ? fmt(C[k][m]) : ''}</td>`).join('')}</tr>`).join('')}<tr class="grand"><td style="position:sticky;left:0;background:var(--surface)">Trésorerie fin de mois</td>${months.map(m => `<td class="n ${C.fin[m] < 0 ? 'neg' : ''}">${fmt(C.fin[m])}</td>`).join('')}</tr></table></div>`;
  return `<h3 style="margin-bottom:8px">Synthèse annuelle</h3>${annual}<h3 style="margin:16px 0 8px">Plan mensuel (36 mois)</h3>${monthly}`;
}
function affHTML(A, P) {
  return tbl(['Affectation', ...[0, 1, 2].map(yrLab)], [tr('Résultat net', P.rn), tr('+ Report à nouveau antérieur', A.ran0), tr('− Réserve légale', A.res), tr('→ Bénéfice distribuable', A.distribuable, 'tot'), tr('Dividendes / ristournes bruts', A.div), tr('− Retenue à la source (10 %)', A.ras), tr('→ Net versé aux associés', A.net, 'tot'), tr('→ Report à nouveau après affectation', A.ranEnd)]);
}
sec('etats', 'Résultats', 'États financiers', 'Compte de produits et charges (CGNC), plan de trésorerie sur 36 mois, bilan et affectation du résultat. Tout est calculé : rien à saisir ici.', () => {
  if (!R) return '';
  const t = sub.etats || 'cpc';
  const tabs = [['cpc', 'CPC'], ['treso', 'Trésorerie'], ['bilan', 'Bilan'], ['aff', 'Affectation du résultat']];
  const body = t === 'cpc' ? cpcHTML(R.P, R) : t === 'treso' ? tresoHTML(R.C) : t === 'bilan' ? bilanHTML(R.B) : affHTML(R.A, R.P);
  return `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${t === k ? 'on' : ''}" data-sub="etats" data-k="${k}">${l}</button>`).join('')}</div>${body}`;
}, () => 2);
