/* BP engine — reproduces the logic of the "Business Plan V4.1" workbook (Maroc, 2026). */
(function (root) {
'use strict';
const REG = {
  IS: 0.20, IS2: 0.35, ISseuil: 100e6, CM: 0.0025, CMmin: 3000, CMexoM: 36,
  TVA: 0.20, TVAseuil: 1e6,
  AE: { Commerce: [0.005, 500000], Industrie: [0.005, 500000], Artisanat: [0.005, 500000], Services: [0.01, 200000] },
  AEgrid: [[0,125,300],[125,250,390],[250,625,570],[625,1250,720],[1250,2500,1050],[2500,6250,1500],[6250,12500,2250],[12500,1e15,3600]],
  empAll: 0.1211, empCap: 0.0936, salAll: 0.0226, salCap: 0.0467, plafond: 6000,
  IR: [[0,40000,0,0],[40000,60000,0.1,4000],[60000,80000,0.2,10000],[80000,100000,0.3,18000],[100000,180000,0.34,22000],[180000,1e15,0.37,27400]],
  FPseuil: 78000, FP1: 0.35, FP2: 0.25, FPmax: 35000, famDed: 600, famMax: 6, SMIG: 3422.72,
  RAS: 0.10,
  // contribution sociale de solidarité sur les bénéfices (LF 2026 : reconduite pour 2026, 2027 et 2028)
  CSS: { years: [2026, 2027, 2028], grid: [[1e6, 0.015], [5e6, 0.025], [10e6, 0.035], [40e6, 0.05]] },
  RES: { 'SARL': [0.05, 0.1], 'SARL-AU': [0.05, 0.1], 'SAS': [0.05, 0.1], 'SA': [0.05, 0.1],
    "Coopérative — collecte & vente en l'état": [0.1, 1], 'Coopérative — transformation': [0.1, 1], 'Coopérative de services': [0.1, 1] }
};
const RUB = ['Achats revendus de marchandises','Achats consommés de matières et fournitures','Autres charges externes','Impôts et taxes','Charges de personnel',"Autres charges d'exploitation"];
const N = v => { const x = typeof v === 'string' ? parseFloat(v.replace(/\s/g,'').replace(',', '.')) : v; return (x === null || x === undefined || x === '' || isNaN(x)) ? 0 : +x; };
const isBlank = v => v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v));
const sum = a => a.reduce((s, x) => s + x, 0);
const Z = n => new Array(n).fill(0);

/* ---- payroll: net → gross (Moroccan 2026 rules) ---- */
function irAnnual(t) { for (const [a, b, r, d] of REG.IR) if (t <= b) return Math.max(0, t * r - d); return 0; }
function grossToNet(g, dep, cnss) {
  const cs = cnss ? Math.min(g, REG.plafond) * REG.salCap + g * REG.salAll : 0;
  const fpRate = g * 12 <= REG.FPseuil ? REG.FP1 : REG.FP2;
  const fp = Math.min(g * fpRate, REG.FPmax / 12);
  const taxable = Math.max(0, g - cs - fp);
  const ir = Math.max(0, irAnnual(taxable * 12) - Math.min(dep || 0, REG.famMax) * REG.famDed) / 12;
  return { net: g - cs - ir, cs, ir };
}
function netToGross(net, dep, cnss) {
  if (net <= 0) return { gross: 0, cs: 0, ir: 0, pat: 0 };
  let lo = net, hi = net * 2 + 1000;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (grossToNet(mid, dep, cnss).net < net) lo = mid; else hi = mid; }
  const g = Math.round(((lo + hi) / 2) * 100) / 100;
  const r = grossToNet(g, dep, cnss);
  const pat = cnss ? g * REG.empAll + Math.min(g, REG.plafond) * REG.empCap : 0;
  return { gross: g, cs: r.cs, ir: r.ir, pat };
}

function build(S, lists) {
  const M = (lists && lists.maps) || {};
  return M;
}

/* ---------------- main engine ---------------- */
function run(S, L, scenIdx) {
  const H = S.hyp;
  const T = 36;
  const st = H.start ? new Date(H.start + 'T00:00:00') : new Date(2027, 0, 1);
  const sY = st.getFullYear(), sM = st.getMonth();
  const mIdx = (ds, def) => { if (!ds) return def; const d = new Date(ds + 'T00:00:00'); if (isNaN(d)) return def; return (d.getFullYear() - sY) * 12 + d.getMonth() - sM + 1; };
  const yOf = m => Math.min(3, Math.ceil(m / 12)) - 1;
  const cal = m => (sM + m - 1) % 12;
  const infl = N(H.inflation);
  const si = scenIdx === undefined ? (['Pessimiste','Réaliste','Optimiste'].indexOf(H.scenario) < 0 ? 1 : ['Pessimiste','Réaliste','Optimiste'].indexOf(H.scenario)) : scenIdx;

  // status flags per year
  const stat = [0,1,2].map(y => H.statut[y] || 'SARL');
  const fSoc = stat.map(s => ['SARL','SARL-AU','SAS','SA'].includes(s) ? 1 : 0);
  const fAE = stat.map(s => s === 'Auto-Entrepreneur' ? 1 : 0);
  const salesStart = Math.min(37, Math.max(1, mIdx(H.ventes, 1)));
  // seasonality
  const sv = (H.saison || []).slice(0, 12); while (sv.length < 12) sv.push('');
  const sAvg = (sum(sv.map(v => isBlank(v) ? 1 : N(v)))) / 12 || 1;
  const coefCal = sv.map(v => (isBlank(v) ? 1 : N(v)) / sAvg);
  const coef = Z(T + 1).map((_, m) => m >= 1 && m >= salesStart ? coefCal[cal(m)] : 0);

  const PType = {}; (L.M_PType || []).forEach(r => PType[r[0]] = r);
  const ChVar = {}; (L.M_ChVar || []).forEach(r => ChVar[r[0]] = r);
  const ChFix = {}; (L.M_ChFix || []).forEach(r => ChFix[r[0]] = r);
  const ChPon = {}; (L.M_ChPonct || []).forEach(r => ChPon[r[0]] = r);
  const Per = {}; (L.M_Periodicite || []).forEach(r => Per[r[0]] = r[1]);
  const Contr = {}; (L.M_Contrat || []).forEach(r => Contr[r[0]] = r);
  const InvT = {}; (L.InvTypes || []).forEach(r => InvT[r[0]] = r);
  const SrcN = {}; (L.M_Source || []).forEach(r => SrcN[r[0]] = r[1]);

  // ---- offers: revenue & variable costs (monthly) ----
  const rev = Z(T + 1), revM = Z(T + 1), tvaColl = Z(T + 1), revRec = Z(T + 1);
  const varRub = RUB.map(() => Z(T + 1)), varTva = Z(T + 1);
  const offersOut = [];
  // TVA flag per year determined after CA (coops); first pass CA for fIS
  const offerCalc = (S.offers || []).map(o => {
    const prix = [], vol = [], cu = [];
    for (let y = 0; y < 3; y++) {
      prix[y] = y === 0 ? N(o.prix[0]) : (isBlank(o.prix[y]) ? prix[y - 1] * (1 + (H.inflPrix === 'Oui' ? infl : 0)) : N(o.prix[y]));
      const vs = o.vol[si] ? o.vol[si][y] : '';
      vol[y] = !isBlank(vs) ? N(vs) : (!isBlank(o.vol[1][y]) ? N(o.vol[1][y]) : (y > 0 ? vol[y - 1] : 0));
    }
    const comps = (o.comps || []).map(c => {
      const cc = [];
      for (let y = 0; y < 3; y++) cc[y] = y === 0 ? N(c.cout[0]) : (isBlank(c.cout[y]) ? cc[y - 1] * (1 + infl) : N(c.cout[y]));
      const def = ChVar[c.label];
      const rub = c.rub || (def ? def[1] : RUB[1]);
      const tva = isBlank(c.tva) ? (def ? N(def[2]) : REG.TVA) : N(c.tva);
      return { cc, rub, tva };
    });
    for (let y = 0; y < 3; y++) cu[y] = sum(comps.map(c => c.cc[y]));
    const launch = Math.max(1, mIdx(o.lancement, 1));
    const pt = PType[o.modele];
    const isM = pt && pt[1] === 'Ventes de marchandises' ? 1 : 0;
    const rec = (o.recurrent === 'Oui' || (o.recurrent === undefined && pt && pt[2] === 'Oui')) ? 1 : 0;
    const tvaR = isBlank(o.tva) ? REG.TVA : N(o.tva);
    const yr = { ca: Z(3), cv: Z(3), vol: Z(3), mrr: Z(3) };
    const mon = Z(T + 1);
    for (let m = 1; m <= T; m++) {
      if (!o.nom || m < launch) continue;
      const y = yOf(m), q = vol[y] * coef[m];
      const r = prix[y] * q;
      mon[m] = r; rev[m] += r; if (isM) revM[m] += r; if (rec) revRec[m] += r;
      yr.ca[y] += r; yr.vol[y] += q; yr.cv[y] += cu[y] * q;
      comps.forEach(c => { varRub[RUB.indexOf(c.rub) < 0 ? 1 : RUB.indexOf(c.rub)][m] += c.cc[y] * q; varTva[m] += c.cc[y] * q * c.tva; });
    }
    for (let y = 0; y < 3; y++) yr.mrr[y] = rec && launch <= 12 * (y + 1) && salesStart <= 12 * (y + 1) ? prix[y] * vol[y] : 0;
    return { nom: o.nom, cible: o.cible, isM, rec, prix, vol, cu, yr, tvaR, mon, launch };
  });
  offerCalc.forEach(o => offersOut.push(o));
  const CA = [0,1,2].map(y => sum(rev.slice(y * 12 + 1, y * 12 + 13)));
  const fIS = stat.map((s, y) => (fSoc[y] || s === 'Coopérative de services' || (s === 'Coopérative — transformation' && CA[y] >= 1e7)) ? 1 : 0);
  const fTVA = fIS.slice();
  const fDiv = stat.map((s, y) => (fSoc[y] || s.startsWith('Coopérative')) ? 1 : 0);
  // TVA on sales per offer
  offerCalc.forEach(o => { for (let m = 1; m <= T; m++) if (o.mon[m]) tvaColl[m] += fTVA[yOf(m)] ? o.mon[m] * o.tvaR : 0; });

  // ---- stocks ----
  const stk = (S.stocks || [[0,0,0],[0,0,0],[0,0,0]]).map(r => { const out = []; for (let y = 0; y < 3; y++) out[y] = isBlank(r[y]) ? (y ? out[y - 1] : 0) : N(r[y]); return out; });
  const openStock = N(S.openStock);
  const stkTot = [0,1,2].map(y => stk[0][y] + stk[1][y] + stk[2][y]);
  const stkPrev = y => y === 0 ? openStock : stkTot[y - 1];
  const varPF = [0,1,2].map(y => stk[2][y] - (y ? stk[2][y - 1] : 0));

  // ---- payroll ----
  const pers = { gross: Z(T + 1), pat: Z(T + 1), net: Z(T + 1), cs: Z(T + 1), ir: Z(T + 1), ext: Z(T + 1), extTva: Z(T + 1), head: Z(T + 1) };
  const staffOut = [];
  (S.staff || []).forEach(p => {
    const c = Contr[p.contrat] || ['', 'Charges de personnel', 'Oui', 'Non', 'SAL'];
    const code = p.contrat ? c[4] : 'SAL';
    if (code === 'NONE') return;
    const nets = [];
    for (let y = 0; y < 3; y++) {
      const v = p.net[y];
      nets[y] = y === 0 ? N(v) : (isBlank(v) ? (nets[y - 1] ? nets[y - 1] * (1 + infl) : 0) : N(v));
    }
    const a = Math.max(1, mIdx(p.debut, 1)), b = p.fin ? mIdx(p.fin, 999) : 999;
    const calc = nets.map(n => code === 'SAL' ? netToGross(n, N(p.dep), true) : code === 'TNS' ? netToGross(n, N(p.dep), false) : { gross: n, cs: 0, ir: 0, pat: 0 });
    const ann = Z(3);
    for (let m = Math.max(1, a); m <= Math.min(T, b); m++) {
      const y = yOf(m), k = calc[y]; if (!nets[y]) continue;
      if (code === 'EXT' || code === 'EXTTVA') { pers.ext[m] += nets[y]; if (code === 'EXTTVA') pers.extTva[m] += nets[y] * REG.TVA; ann[y] += nets[y]; continue; }
      pers.gross[m] += k.gross; pers.pat[m] += k.pat; pers.net[m] += nets[y]; pers.cs[m] += k.cs; pers.ir[m] += k.ir; pers.head[m] += 1;
      ann[y] += k.gross + k.pat;
    }
    staffOut.push({ nom: p.nom, code, calc, ann, smigWarn: code === 'SAL' && calc.some(k => k.gross > 0 && k.gross < REG.SMIG) && !/partiel|Saisonnier/.test(p.contrat || '') });
  });
  // AE: CNSS forfait handled with taxes below

  // ---- marketing ----
  const mk = S.mkt || {};
  const mkStart = Math.max(1, mIdx(mk.debut, salesStart));
  const mkM = Z(T + 1), mkA = Z(T + 1);
  (mk.canaux || []).forEach(c => {
    const b = []; for (let y = 0; y < 3; y++) b[y] = y === 0 ? N(c.budget[0]) : (isBlank(c.budget[y]) ? b[y - 1] * (1 + infl) : N(c.budget[y]));
    for (let m = mkStart; m <= T; m++) mkM[m] += b[yOf(m)];
  });
  (mk.actions || []).forEach(a => { const m = mIdx(a.date, 0); if (m >= 1 && m <= T) mkA[m] += N(a.budget); });

  // ---- fixed recurring & ponctual ----
  const fixRub = RUB.map(() => Z(T + 1)), fixTvaOnCharge = Z(T + 1);
  const fixPaidTTC = Z(T + 1), fixPaidTva = Z(T + 1), fixPaidHT = Z(T + 1);
  (S.fixRec || []).forEach(f => {
    if (!f.label) return;
    const def = ChFix[f.label];
    const rub = f.rub && RUB.includes(f.rub) ? f.rub : (def ? def[1] : 'Autres charges externes');
    const tvaYes = (f.tva || (def ? def[2] : 'Oui')) === 'Oui';
    const per = Per[f.per || (def ? def[3] : 'Mensuelle')] || 1;
    const amt = []; for (let y = 0; y < 3; y++) amt[y] = y === 0 ? N(f.m[0]) : (isBlank(f.m[y]) ? amt[y - 1] * (1 + infl) : N(f.m[y]));
    const a = Math.max(1, mIdx(f.debut, 1)), b = f.fin ? mIdx(f.fin, 999) : 999;
    const ri = RUB.indexOf(rub);
    for (let m = a; m <= Math.min(T, b); m++) { fixRub[ri][m] += amt[yOf(m)]; fixTvaOnCharge[m] += tvaYes ? amt[yOf(m)] * REG.TVA : 0; }
    for (let m = a; m <= Math.min(T, b); m++) {
      if ((m - a) % per !== 0) continue;
      const ht = amt[yOf(m)] * Math.min(per, b - m + 1);
      fixPaidHT[m] += ht; fixPaidTva[m] += tvaYes ? ht * REG.TVA : 0;
    }
  });
  const ponRub = RUB.map(() => Z(T + 1)), ponTva = Z(T + 1);
  (S.fixPon || []).forEach(f => {
    const m = mIdx(f.date, 0); if (m < 1 || m > T || !f.label) return;
    const def = ChPon[f.label];
    const rub = f.rub && RUB.includes(f.rub) ? f.rub : (def ? def[1] : 'Autres charges externes');
    const tvaYes = (f.tva || (def ? def[2] : 'Oui')) === 'Oui';
    ponRub[RUB.indexOf(rub)][m] += N(f.montant); ponTva[m] += tvaYes ? N(f.montant) * REG.TVA : 0;
  });

  // ---- investments ----
  const invList = [];
  const dot = Z(T + 1), invPaid = Z(T + 1), invTvaAcq = Z(T + 1), invTvaPaid = Z(T + 1);
  const rubAssets = { 'Immobilisations en non-valeurs': 0, 'Immobilisations incorporelles': 0, 'Immobilisations corporelles': 0, 'Immobilisations financières': 0 };
  (S.invExist || []).forEach(e => {
    if (!e.label && !N(e.montant)) return;
    const t = InvT[e.type] || [e.type, 0.1, 'Immobilisations corporelles'];
    const rate = isBlank(e.taux) ? N(t[1]) : N(e.taux);
    const v = N(e.montant); const d0 = mIdx(e.date, 1);
    const elapsed = Math.max(0, 1 - d0);
    const cum0 = Math.min(v, v * rate / 12 * elapsed);
    invList.push({ label: e.label, rub: t[2], cost: v, acqM: 0, rate, cum0, existing: true, sched: [], ttc: 0 });
  });
  (S.inv || []).forEach(i => {
    if (!i.label && !N(i.montant)) return;
    const t = InvT[i.type] || [i.type, 0.1, 'Immobilisations corporelles'];
    const rate = isBlank(i.taux) ? N(t[1]) : N(i.taux);
    const acq = Math.max(1, mIdx(i.date, 1));
    const y = yOf(Math.min(acq, T));
    const hasTva = t[2] !== 'Immobilisations financières' && i.tva !== 'Non';
    const ht = N(i.montant), tva = hasTva ? ht * REG.TVA : 0;
    const assuj = acq <= T ? fTVA[y] : 1;
    const cost = ht + (assuj ? 0 : tva);
    const ttc = ht + tva;
    const nb = /chelonn/.test(i.mode || '') ? Math.max(1, N(i.nb) || 1) : 1;
    const p1 = i.date1 ? Math.max(1, mIdx(i.date1, acq)) : acq;
    const sched = Z(T + 1); for (let k = 0; k < nb; k++) if (p1 + k <= T) sched[p1 + k] += ttc / nb;
    for (let m = 1; m <= T; m++) { invPaid[m] += sched[m]; if (assuj && ttc) invTvaPaid[m] += sched[m] * tva / ttc; }
    if (acq <= T && assuj) invTvaAcq[acq] += tva;
    invList.push({ label: i.label, rub: t[2], cost, acqM: acq, rate, cum0: 0, existing: false, sched, ttc, tvaRec: assuj ? tva : 0, nb, unpaidAfter: ttc - sum(sched) });
  });
  invList.forEach(it => {
    it.dotM = Z(T + 1);
    if (!it.rate) return;
    const per = it.cost * it.rate / 12;
    let cum = it.cum0;
    for (let m = Math.max(1, it.acqM); m <= T; m++) { const d = Math.min(per, it.cost - cum); if (d <= 1e-9) break; it.dotM[m] = d; cum += d; dot[m] += d; }
  });

  // ---- financing ----
  const fin = { cap: Z(T + 1), cca: Z(T + 1), sinv: Z(T + 1), sexp: Z(T + 1), don: Z(T + 1), rep: Z(T + 1) };
  (S.fin || []).forEach(f => {
    const m = Math.max(1, mIdx(f.date, 1)); if (m > T || !N(f.montant)) return;
    const nat = f.nature || SrcN[f.source] || 'Capital social / apport en capital';
    const a = N(f.montant);
    if (nat.startsWith('Capital')) fin.cap[m] += a;
    else if (nat.startsWith('Compte courant')) fin.cca[m] += a;
    else if (nat.includes("d'investissement")) { fin.sinv[m] += a; const d = Math.max(1, N(f.duree) || 5); for (let k = m; k <= T && k < m + d * 12; k++) fin.rep[k] += a / d / 12; }
    else if (nat.includes("d'exploitation")) fin.sexp[m] += a;
    else fin.don[m] += a;
  });
  const loans = { disb: Z(T + 1), int: Z(T + 1), cap: Z(T + 1), crd: Z(T + 1) };
  const loanOut = [];
  (S.loans || []).forEach(l => {
    const D = N(l.montant); if (!D) return;
    const J = Math.max(1, mIdx(l.date, 1)), k = N(l.taux) / 12;
    const Lr = (l.typeDiff === 'Aucun' || !l.typeDiff || !N(l.duree)) ? 0 : Math.min(N(l.differe), N(l.duree) - 1);
    const Mn = Math.max(0, N(l.duree) - Lr);
    const pmt = !Mn ? 0 : (k === 0 ? D / Mn : D * k / (1 - Math.pow(1 + k, -Mn)));
    let crd = 0; const row = { int: Z(T + 1), cap: Z(T + 1), crd: Z(T + 1) };
    for (let m = 1; m <= T; m++) {
      if (m === J) { crd += D; loans.disb[m] += D; }
      const t = m - J; let i = 0, c = 0;
      if ((t >= 1 && t <= Lr && l.typeDiff === 'Intérêts seuls (franchise partielle)') || (t > Lr && t <= Lr + Mn)) i = (row.crd[m - 1] || 0) * k;
      if (t > Lr && t <= Lr + Mn) c = Math.min(row.crd[m - 1] || 0, k === 0 ? D / Mn : pmt - i);
      crd -= c; row.int[m] = i; row.cap[m] = c; row.crd[m] = crd;
      loans.int[m] += i; loans.cap[m] += c; loans.crd[m] += crd;
    }
    loanOut.push({ label: l.type, preteur: l.preteur, D, pmt, Lr, Mn, totInt: Mn ? pmt * Mn - D : 0, row });
  });

  // ---- yearly P&L ----
  const Ysum = (arr, y) => sum(arr.slice(y * 12 + 1, y * 12 + 13));
  const yrs = [0, 1, 2];
  const nonRecVar = yrs.map(y => (1 - fTVA[y]) * Ysum(varTva, y));
  const P = {};
  P.caM = yrs.map(y => Ysum(revM, y));
  P.ca = CA;
  P.caP = yrs.map(y => CA[y] - P.caM[y]);
  P.varPF = varPF;
  P.sexp = yrs.map(y => Ysum(fin.sexp, y));
  P.autresProd = yrs.map(y => N((S.cpcExtra || {}).autresProd?.[y]));
  P.prodExp = yrs.map(y => CA[y] + varPF[y] + P.sexp[y] + P.autresProd[y]);
  // rubrics: variable + fixed + personnel + marketing + ext + nonrec TVA
  const rubY = RUB.map(() => Z(3));
  yrs.forEach(y => {
    RUB.forEach((r, i) => { rubY[i][y] += Ysum(varRub[i], y) + Ysum(fixRub[i], y) + Ysum(ponRub[i], y); });
    // non-recoverable TVA when not assujetti: allocate var TVA proportionally to var rubrics (approx: to its own rubric via share)
    if (!fTVA[y]) {
      const vt = Ysum(varTva, y), vtot = sum(RUB.map((_, i) => Ysum(varRub[i], y))) || 1;
      RUB.forEach((_, i) => rubY[i][y] += vt * Ysum(varRub[i], y) / vtot);
      rubY[2][y] += Ysum(fixTvaOnCharge, y) + Ysum(ponTva, y) + Ysum(pers.extTva, y) + (Ysum(mkM, y) + Ysum(mkA, y)) * REG.TVA;
    }
    rubY[2][y] += Ysum(mkM, y) + Ysum(mkA, y) + Ysum(pers.ext, y);
    rubY[4][y] += Ysum(pers.gross, y) + Ysum(pers.pat, y);
  });
  // AE taxes (IR libératoire + CNSS forfait), quarterly on cash collected — computed after cash; placeholder
  rubY[1].forEach((_, y) => rubY[1][y] += varPF[y]);
  P.rub = rubY;
  P.dot = yrs.map(y => Ysum(dot, y));
  P.varTot = yrs.map(y => sum(RUB.map((_, i) => Ysum(varRub[i], y))) + nonRecVar[y]);

  // ---- monthly cash & accounts ----
  const tvaRateSales = m => fTVA[yOf(m)];
  const billedTTC = Z(T + 1), collTva = Z(T + 1);
  for (let m = 1; m <= T; m++) { billedTTC[m] = rev[m] + tvaColl[m]; }
  const dC = Math.min(180, N(H.delaiClient)) / 30, dF = Math.min(180, N(H.delaiFourn)) / 30;
  const shift = (arr, d) => { const out = Z(T + 3), i0 = Math.floor(d), f = d - i0; for (let m = 1; m <= T; m++) { if (m + i0 <= T) out[m + i0] += arr[m] * (1 - f); if (m + i0 + 1 <= T) out[m + i0 + 1] += arr[m] * f; } return out; };
  const cashIn = shift(billedTTC, dC);
  const cashInTva = shift(tvaColl, dC);
  // variable purchases
  const varHT = Z(T + 1), varDed = Z(T + 1), varBilled = Z(T + 1);
  for (let m = 1; m <= T; m++) { varHT[m] = sum(RUB.map((_, i) => varRub[i][m])); const y = yOf(m); varDed[m] = fTVA[y] ? varTva[m] : 0; varBilled[m] = varHT[m] + varTva[m]; }
  // stock build (smoothed over the year, paid with supplier delay)
  const stkBuy = Z(T + 1), stkTva = Z(T + 1);
  for (let m = 1; m <= T; m++) { const y = yOf(m); const d = (stkTot[y] - stkPrev(y)) / 12; stkBuy[m] = d * (1 + (fTVA[y] ? REG.TVA : 0)); stkTva[m] = fTVA[y] ? d * REG.TVA : 0; varBilled[m] += stkBuy[m]; varDed[m] += stkTva[m]; }
  const varPaid = shift(varBilled, dF), varPaidDed = shift(varDed, dF);
  // fixed / ponctual / marketing / ext TVA deductible
  const mkTot = Z(T + 1); for (let m = 1; m <= T; m++) mkTot[m] = mkM[m] + mkA[m];
  const ded = Z(T + 1);
  for (let m = 1; m <= T; m++) {
    const a = fTVA[yOf(m)];
    ded[m] = a ? (varPaidDed[m] + fixPaidTva[m] + ponTva[m] + mkTot[m] * REG.TVA + pers.extTva[m] + invTvaPaid[m]) : 0;
  }
  // TVA declarations
  const tvaPay = Z(T + 2); let tvaBal = 0; const tvaPosEnd = Z(T + 1);
  let accTvaBilledNet = 0;
  for (let m = 1; m <= T; m++) {
    const y = yOf(m);
    tvaBal += (fTVA[y] ? cashInTva[m] : 0) - ded[m];
    const monthly = y > 0 && fTVA[y] && CA[y - 1] >= REG.TVAseuil;
    const isDecl = monthly ? true : (m % 3 === 0);
    if (isDecl && tvaBal > 0) { if (m + 1 <= T) tvaPay[m + 1] += tvaBal; else tvaPay[T + 1] += tvaBal; tvaBal = 0; }
  }
  // payroll social & IR paid next month
  const socPay = Z(T + 2), irPay = Z(T + 2);
  for (let m = 1; m <= T; m++) { socPay[m + 1] += pers.cs[m] + pers.pat[m]; irPay[m + 1] += pers.ir[m]; }

  // AE taxes quarterly on cash collected
  const aeIr = Z(T + 1), aeCnss = Z(T + 1), aePay = Z(T + 2);
  const aeNat = REG.AE[H.aeNature] || REG.AE.Services;
  for (let q = 0; q < 12; q++) {
    const y = Math.floor(q / 4); if (!fAE[y]) continue;
    const m3 = q * 3 + 3; const cash = sum(cashIn.slice(q * 3 + 1, q * 3 + 4));
    const ir = cash * aeNat[0];
    const g = REG.AEgrid.find(r => ir <= r[1]) || REG.AEgrid[REG.AEgrid.length - 1];
    aeIr[m3] += ir; aeCnss[m3] += g[2]; aePay[m3 + 1] += ir + g[2];
  }
  yrs.forEach(y => { rubY[4][y] += Ysum(aeCnss, y); });

  // P&L totals before tax
  P.chExp = yrs.map(y => sum(RUB.map((_, i) => rubY[i][y])) + P.dot[y]);
  P.rex = yrs.map(y => P.prodExp[y] - P.chExp[y]);
  P.prodFin = yrs.map(y => N((S.cpcExtra || {}).prodFin?.[y]));
  P.int = yrs.map(y => Ysum(loans.int, y));
  P.rfin = yrs.map(y => P.prodFin[y] - P.int[y]);
  P.rcai = yrs.map(y => P.rex[y] + P.rfin[y]);
  P.rep = yrs.map(y => Ysum(fin.rep, y));
  P.don = yrs.map(y => Ysum(fin.don, y));
  P.autresPNC = yrs.map(y => N((S.cpcExtra || {}).autresPNC?.[y]));
  P.pnc = yrs.map(y => P.rep[y] + P.don[y] + P.autresPNC[y]);
  P.cnc = yrs.map(y => N((S.cpcExtra || {}).cnc?.[y]));
  P.rnc = yrs.map(y => P.pnc[y] - P.cnc[y]);
  P.rai = yrs.map(y => P.rcai[y] + P.rnc[y]);
  // tax
  const socStart = H.debutSoc ? mIdx(H.debutSoc, 1) : (() => { for (let y = 0; y < 3; y++) if (fSoc[y]) return y * 12 + 1; return null; })();
  const cmExo = yrs.map(y => fSoc[y] && socStart !== null && (socStart + REG.CMexoM - 1) >= (y + 1) * 12 ? 1 : 0);
  P.is = Z(3); P.deficit = Z(3); P.cm = Z(3); P.isTheo = Z(3); P.aeIr = Z(3); P.css = Z(3); P.cssRate = Z(3); P.isBase = Z(3); P.cmExo = cmExo;
  let defPrev = 0;
  yrs.forEach(y => {
    if (fIS[y]) {
      const base = Math.max(0, P.rai[y] - defPrev);
      P.isTheo[y] = base >= REG.ISseuil ? base * REG.IS2 : base * REG.IS;
      const cmBase = CA[y] + P.sexp[y] + P.autresProd[y] + P.prodFin[y] + P.don[y];
      P.cm[y] = !cmExo[y] ? Math.max(REG.CM * cmBase, REG.CMmin) : 0;
      P.is[y] = Math.max(P.isTheo[y], P.cm[y]);
      P.isBase[y] = base;
      if (REG.CSS.years.includes(sY + y)) { let r = 0; REG.CSS.grid.forEach(([th, rt]) => { if (base >= th) r = rt; }); P.cssRate[y] = r; P.css[y] = base * r; }
      P.deficit[y] = Math.max(0, defPrev - Math.max(0, P.rai[y])) + Math.max(0, -P.rai[y]);
      defPrev = P.deficit[y];
    } else defPrev = 0;
    P.aeIr[y] = fAE[y] ? Ysum(aeIr, y) : 0;
  });
  P.impot = yrs.map(y => P.is[y] + P.css[y] + P.aeIr[y]);
  P.rn = yrs.map(y => P.rai[y] - P.impot[y]);
  // SIG
  P.margeMarch = yrs.map(y => P.caM[y] - rubY[0][y]);
  P.production = yrs.map(y => P.caP[y] + varPF[y]);
  P.conso = yrs.map(y => rubY[1][y] + rubY[2][y]);
  P.va = yrs.map(y => P.margeMarch[y] + P.production[y] - P.conso[y]);
  P.ebe = yrs.map(y => P.va[y] + P.sexp[y] - rubY[3][y] - rubY[4][y]);
  P.caf = yrs.map(y => P.rn[y] + P.dot[y] - P.rep[y]);
  P.tmcv = yrs.map(y => CA[y] ? (CA[y] - P.varTot[y]) / CA[y] : 0);
  P.sr = yrs.map(y => P.tmcv[y] > 0 ? (P.chExp[y] - P.varTot[y] + P.int[y]) / P.tmcv[y] : 0);

  // ---- affectation ----
  const A = { ran0: Z(3), res: Z(3), distribuable: Z(3), div: Z(3), ras: Z(3), net: Z(3), ranEnd: Z(3) };
  const capSoc = y => openCapital() + Ysum2(fin.cap, (y + 1) * 12);
  function Ysum2(arr, upto) { return sum(arr.slice(1, upto + 1)); }
  function openCapital() { return N(S.openCash) + openStock + sum(invList.filter(i => i.existing).map(i => i.cost - i.cum0)); }
  let resCum = 0;
  yrs.forEach(y => {
    A.ran0[y] = y === 0 ? 0 : (fAE[y - 1] ? 0 : A.ranEnd[y - 1]);
    const st_ = stat[y]; let rt = (REG.RES[st_] || [0, 0]);
    if ((st_ === 'SARL' || st_ === 'SARL-AU') && H.reserveSarl === 'Non') rt = [0, rt[1]];
    A.res[y] = rt[0] > 0 ? Math.min(rt[0] * Math.max(0, P.rn[y] + Math.min(0, A.ran0[y])), Math.max(0, rt[1] * capSoc(y) - resCum)) : 0;
    resCum += A.res[y];
    A.distribuable[y] = fAE[y] ? 0 : P.rn[y] + A.ran0[y] - A.res[y];
    const rate = fDiv[y] ? N(H.distrib[y]) : 0;
    A.div[y] = A.distribuable[y] > 0 ? A.distribuable[y] * rate : 0;
    A.ras[y] = fSoc[y] ? A.div[y] * REG.RAS : 0;
    A.net[y] = A.div[y] - A.ras[y];
    A.ranEnd[y] = A.distribuable[y] - A.div[y];
  });
  const divPay = Z(T + 2); yrs.forEach(y => { const m = (y + 1) * 12 + 6; if (m <= T) divPay[m] += A.div[y]; });
  const prel = Z(T + 1); for (let m = 1; m <= T; m++) if (fAE[yOf(m)]) prel[m] = N(H.prelev[yOf(m)]);

  // IS payments
  const isPay = Z(T + 2);
  yrs.forEach(y => {
    if (!fIS[y]) return;
    // acomptes during year y+1 based on IS_y ; solde of year y at month 3 of y+1
    const acPrev = y > 0 && fIS[y - 1] ? P.is[y - 1] : 0; // acomptes paid during year y
    const solde = P.is[y] - acPrev;
    const m3 = (y + 1) * 12 + 3;
    if (m3 <= T) isPay[m3] += Math.max(0, solde) + P.css[y];
    if (y + 1 < 3 && fIS[y + 1]) [3, 6, 9, 12].forEach(k => { const m = (y + 1) * 12 + k; if (m <= T) isPay[m] += P.is[y] * 0.25; });
  });

  // ---- cash plan ----
  const C = {
    encVentes: cashIn.slice(0, T + 1), encApports: Z(T + 1), encSubv: Z(T + 1), encEmp: loans.disb, encAutres: Z(T + 1),
    decVar: Z(T + 1), decFix: Z(T + 1), decPon: Z(T + 1), decMkt: Z(T + 1), decNet: pers.net, decExt: Z(T + 1), decSoc: Z(T + 1), decIr: Z(T + 1),
    decInv: invPaid, decCap: loans.cap, decInt: loans.int, decTva: Z(T + 1), decImpot: Z(T + 1), decDiv: Z(T + 1), decPrel: prel, decAutres: Z(T + 1)
  };
  const autresYear = m => m % 12 === 0;
  for (let m = 1; m <= T; m++) {
    const y = yOf(m);
    C.encApports[m] = fin.cap[m] + fin.cca[m];
    C.encSubv[m] = fin.sinv[m] + fin.sexp[m] + fin.don[m];
    C.encAutres[m] = autresYear(m) ? P.autresProd[y] + P.prodFin[y] + P.autresPNC[y] : 0;
    C.decVar[m] = varPaid[m];
    C.decFix[m] = fixPaidHT[m] + fixPaidTva[m];
    C.decPon[m] = sum(RUB.map((_, i) => ponRub[i][m])) + ponTva[m];
    C.decMkt[m] = mkTot[m] * (1 + REG.TVA);
    C.decExt[m] = pers.ext[m] + pers.extTva[m];
    C.decSoc[m] = socPay[m] + (aePay[m] ? aeCnssPaid(m) : 0);
    C.decIr[m] = irPay[m];
    C.decTva[m] = tvaPay[m];
    C.decImpot[m] = isPay[m] + (aePay[m] ? aePay[m] - aeCnssPaid(m) : 0);
    C.decDiv[m] = divPay[m];
    C.decAutres[m] = autresYear(m) ? P.cnc[y] : 0;
  }
  function aeCnssPaid(m) { return aeCnss[m - 1] || 0; }
  const encKeys = ['encVentes','encApports','encSubv','encEmp','encAutres'];
  const decKeys = ['decVar','decFix','decPon','decMkt','decNet','decExt','decSoc','decIr','decInv','decCap','decInt','decTva','decImpot','decDiv','decPrel','decAutres'];
  C.enc = Z(T + 1); C.dec = Z(T + 1); C.flux = Z(T + 1); C.debut = Z(T + 1); C.fin = Z(T + 1);
  let cash = N(S.openCash);
  for (let m = 1; m <= T; m++) {
    C.enc[m] = sum(encKeys.map(k => C[k][m])); C.dec[m] = sum(decKeys.map(k => C[k][m]));
    C.flux[m] = C.enc[m] - C.dec[m]; C.debut[m] = cash; cash += C.flux[m]; C.fin[m] = cash;
  }
  let minV = Infinity, minM = 1; for (let m = 1; m <= T; m++) if (C.fin[m] < minV) { minV = C.fin[m]; minM = m; }
  C.min = minV; C.minM = minM; C.fonds = Math.max(0, -minV);
  C.minY = yrs.map(y => Math.min(...C.fin.slice(y * 12 + 1, y * 12 + 13)));
  // monthly EBE (point mort)
  const ebeM = Z(T + 1);
  for (let m = 1; m <= T; m++) {
    ebeM[m] = rev[m] - varHT[m] - sum(RUB.map((_, i) => fixRub[i][m] + ponRub[i][m])) - mkTot[m] - pers.gross[m] - pers.pat[m] - pers.ext[m];
  }
  let pm = null; for (let m = 1; m <= T; m++) { if (ebeM[m] > 0) { pm = m; break; } }
  C.ebeM = ebeM; C.pointMort = pm;

  // ---- balance sheet ----
  const B = [];
  const cumAt = (arr, M) => sum(arr.slice(1, M + 1));
  for (let y = -1; y < 3; y++) {
    const Mend = (y + 1) * 12; const b = {};
    const assets = { 'Immobilisations en non-valeurs': 0, 'Immobilisations incorporelles': 0, 'Immobilisations corporelles': 0, 'Immobilisations financières': 0 };
    let brut = 0, amort = 0, invDebt = 0, invAdv = 0;
    invList.forEach(it => {
      const owned = it.existing || it.acqM <= Mend;
      const paid = it.existing ? 0 : cumAt(it.sched, Mend);
      if (owned) { const cd = it.cum0 + cumAt(it.dotM, Mend); assets[it.rub] = (assets[it.rub] || 0) + it.cost - cd; brut += it.cost; amort += cd; }
      if (!it.existing) { const due = (it.acqM <= Mend ? it.ttc : 0) - paid; if (due >= 0) invDebt += due; else invAdv += -due; }
    });
    b.nv = assets['Immobilisations en non-valeurs']; b.incorp = assets['Immobilisations incorporelles']; b.corp = assets['Immobilisations corporelles']; b.finImmo = assets['Immobilisations financières'];
    b.avances = invAdv; b.brut = brut; b.amort = amort;
    b.actifImmo = b.nv + b.incorp + b.corp + b.finImmo + b.avances;
    b.stkM = y < 0 ? openStock : stk[0][y]; b.stkMat = y < 0 ? 0 : stk[1][y]; b.stkPF = y < 0 ? 0 : stk[2][y];
    b.stocks = b.stkM + b.stkMat + b.stkPF;
    b.clients = cumAt(billedTTC, Mend) - cumAt(cashIn, Mend);
    // TVA position (accrual): collected billed − deductible billed − paid
    let coll = 0, dedAcc = 0;
    for (let m = 1; m <= Mend; m++) { const a = fTVA[yOf(m)]; coll += a ? tvaColl[m] : 0; dedAcc += a ? (varTva[m] + stkTva[m] + fixPaidTva[m] + ponTva[m] + mkTot[m] * REG.TVA + pers.extTva[m] + invTvaAcq[m]) : 0; }
    const tvaPos = coll - dedAcc - cumAt(tvaPay, Mend);
    // tax position
    let taxDue = 0; for (let k = 0; k <= y; k++) taxDue += P.impot[k];
    const taxPos = taxDue - cumAt(isPay, Mend) - cumAt(aePay, Mend) + cumAt(aeCnss, Mend) - 0; // aePay includes cnss
    // prepaid fixed charges
    let prepaid = 0; for (let m = 1; m <= Mend; m++) prepaid += fixPaidHT[m] - sum(RUB.map((_, i) => fixRub[i][m]));
    // non-recoverable TVA on fixed when not assujetti: paid TVA expensed when charged (approx: same timing) – adjust prepaid by tva diff
    let prepaidTva = 0; for (let m = 1; m <= Mend; m++) if (!fTVA[yOf(m)]) prepaidTva += fixPaidTva[m] - fixTvaOnCharge[m];
    prepaid += prepaidTva;
    b.etatDeb = Math.max(0, -tvaPos) + Math.max(0, -taxPos);
    b.regulA = Math.max(0, prepaid);
    b.actifCirc = b.stocks + b.clients + b.etatDeb + b.regulA;
    const cashEnd = y < 0 ? N(S.openCash) : C.fin[Mend];
    b.tresoA = Math.max(0, cashEnd);
    b.totalActif = b.actifImmo + b.actifCirc + b.tresoA;
    // passif
    b.capital = openCapital() + cumAt(fin.cap, Mend);
    b.exploitant = y < 0 ? 0 : (() => { let s = 0; for (let k = 0; k <= y; k++) if (fAE[k]) s += (k < y ? P.rn[k] : 0); return s - cumAt(prel, Mend); })();
    b.reserve = y < 0 ? 0 : sum(A.res.slice(0, y));
    // report à nouveau = past results not in reserve, minus dividends paid (paid/decided)
    let ran = 0; for (let k = 0; k < y; k++) { if (!fAE[k]) ran += P.rn[k] - A.res[k]; }
    ran -= cumAt(divPay, Mend);
    // dividends decided but not yet paid (decided month 6 of next year: treat paid at same time) – fine
    b.ran = y < 0 ? 0 : ran;
    b.resultat = y < 0 ? 0 : P.rn[y];
    if (y >= 0 && fAE[y]) { b.exploitant += P.rn[y]; b.resultat = 0; }
    b.cp = b.capital + b.exploitant + b.reserve + b.ran + b.resultat;
    b.subv = cumAt(fin.sinv, Mend) - cumAt(fin.rep, Mend);
    b.emprunts = y < 0 ? 0 : loans.crd[Mend];
    b.cca = cumAt(fin.cca, Mend);
    b.dettesFin = b.emprunts + b.cca;
    b.finPerm = b.cp + b.subv + b.dettesFin;
    b.fourn = cumAt(varBilled, Mend) - cumAt(varPaid, Mend);
    b.sociaux = cumAt(pers.cs, Mend) + cumAt(pers.pat, Mend) - cumAt(socPay, Mend);
    b.etatCred = Math.max(0, tvaPos) + Math.max(0, taxPos) + cumAt(pers.ir, Mend) - cumAt(irPay, Mend);
    b.fournImmo = invDebt;
    b.regulP = Math.max(0, -prepaid);
    b.passifCirc = b.fourn + b.sociaux + b.etatCred + b.fournImmo + b.regulP;
    b.tresoP = Math.max(0, -cashEnd);
    b.totalPassif = b.finPerm + b.passifCirc + b.tresoP;
    b.ecart = b.totalActif - b.totalPassif;
    b.bfr = b.stocks + b.clients - b.fourn;
    b.cash = cashEnd;
    B.push(b);
  }

  // ---- KPIs ----
  const K = {};
  K.ca = CA; K.rn = P.rn; K.ebe = P.ebe;
  K.growth = yrs.map(y => y && CA[y - 1] ? CA[y] / CA[y - 1] - 1 : null);
  K.marge = yrs.map(y => CA[y] ? P.rn[y] / CA[y] : null);
  K.tebe = yrs.map(y => CA[y] ? P.ebe[y] / CA[y] : null);
  K.srRatio = yrs.map(y => P.sr[y] ? CA[y] / P.sr[y] : null);
  K.bfr = yrs.map(y => B[y + 1].bfr);
  K.cashEnd = yrs.map(y => C.fin[(y + 1) * 12]);
  K.cp = yrs.map(y => B[y + 1].cp);
  K.dettes = yrs.map(y => B[y + 1].dettesFin);
  K.gearing = yrs.map(y => B[y + 1].cp > 0 ? B[y + 1].dettesFin / B[y + 1].cp : null);
  K.autonomie = yrs.map(y => B[y + 1].totalPassif ? B[y + 1].cp / B[y + 1].totalPassif : null);
  K.head = yrs.map(y => pers.head[(y + 1) * 12]);
  K.teamCost = yrs.map(y => Ysum(pers.gross, y) + Ysum(pers.pat, y) + Ysum(pers.ext, y));
  K.teamRatio = yrs.map(y => CA[y] ? K.teamCost[y] / CA[y] : null);
  K.mkt = yrs.map(y => Ysum(mkTot, y));
  K.mktRatio = yrs.map(y => CA[y] ? K.mkt[y] / CA[y] : null);
  // startup metrics
  const kp = S.kpi || {};
  K.mrr = yrs.map(y => sum(offerCalc.map(o => o.yr.mrr[y])));
  K.arr = K.mrr.map(v => v * 12);
  K.recShare = yrs.map(y => CA[y] ? Ysum(revRec, y) / CA[y] : null);
  K.cmgr = yrs.map(y => y && CA[y - 1] > 0 && CA[y] > 0 ? Math.pow(CA[y] / CA[y - 1], 1 / 12) - 1 : null);
  K.gm = P.tmcv;
  const act = yrs.map(y => N(kp.actifs?.[y])), nouv = yrs.map(y => N(kp.nouveaux?.[y]));
  K.avgClients = yrs.map(y => ((y ? act[y - 1] : N(kp.clients0)) + act[y]) / 2);
  K.arpu = yrs.map(y => K.avgClients[y] ? CA[y] / K.avgClients[y] / 12 : null);
  K.acqSpend = yrs.map(y => K.mkt[y] + N(kp.commercial?.[y]));
  K.cac = yrs.map(y => nouv[y] ? K.acqSpend[y] / nouv[y] : null);
  K.life = yrs.map(y => N(kp.churn?.[y]) > 0 ? 1 / N(kp.churn[y]) : (N(kp.vie?.[y]) || null));
  K.ltv = yrs.map(y => K.arpu[y] && K.life[y] ? K.arpu[y] * K.gm[y] * K.life[y] : null);
  K.ltvCac = yrs.map(y => K.ltv[y] && K.cac[y] ? K.ltv[y] / K.cac[y] : null);
  K.payback = yrs.map(y => K.cac[y] && K.arpu[y] && K.gm[y] > 0 ? K.cac[y] / (K.arpu[y] * K.gm[y]) : null);
  K.churnA = yrs.map(y => N(kp.churn?.[y]) > 0 ? 1 - Math.pow(1 - N(kp.churn[y]), 12) : null);
  K.nrr = yrs.map(y => K.churnA[y] !== null ? (1 - K.churnA[y]) * (1 + N(kp.expansion?.[y])) : null);
  K.burnGross = yrs.map(y => sum(C.dec.slice((y + 1) * 12 - 2, (y + 1) * 12 + 1)) / 3);
  K.burnNet = yrs.map(y => { const v = -sum(yrs.map(() => 0)) - sum(C.flux.slice((y + 1) * 12 - 2, (y + 1) * 12 + 1).map((f, i) => f - (C.encApports[(y + 1) * 12 - 2 + i] + C.encSubv[(y + 1) * 12 - 2 + i] + C.encEmp[(y + 1) * 12 - 2 + i]))) / 3; return v; });
  K.runway = yrs.map(y => K.burnNet[y] > 0 ? K.cashEnd[y] / K.burnNet[y] : null);
  K.rule40 = yrs.map(y => K.growth[y] !== null && K.tebe[y] !== null ? K.growth[y] + K.tebe[y] : null);
  K.burnMult = yrs.map(y => { const nn = y ? K.arr[y] - K.arr[y - 1] : K.arr[0]; const burn = -sum(C.flux.slice(y * 12 + 1, y * 12 + 13).map((f, i) => f - C.encApports[y * 12 + 1 + i] - C.encSubv[y * 12 + 1 + i] - C.encEmp[y * 12 + 1 + i])); return nn > 0 && burn > 0 ? burn / nn : null; });
  K.magic = yrs.map(y => { const nn = y ? K.arr[y] - K.arr[y - 1] : K.arr[0]; return K.acqSpend[y] ? nn / K.acqSpend[y] : null; });
  K.defaultAlive = K.runway[2] === null ? true : (C.min >= 0);
  K.offerCA = offerCalc.map(o => ({ nom: o.nom, cible: o.cible, ca: o.yr.ca, cv: o.yr.cv, vol: o.yr.vol, isM: o.isM, rec: o.rec, prix: o.prix, cu: o.cu }));
  // by target
  K.byCible = {};
  offerCalc.forEach(o => { const k = o.cible || '(cible non renseignée)'; K.byCible[k] = K.byCible[k] || Z(3); yrs.forEach(y => K.byCible[k][y] += o.yr.ca[y]); });
  K.caRec = yrs.map(y => Ysum(revRec, y)); K.caMarch = P.caM;
  // market
  const tam = (S.market || {}).tam || {};
  K.tam = yrs.map(y => N(tam.n?.[y]) * N(tam.dep?.[y]));
  K.samN = yrs.map(y => N(tam.n?.[y]) * N(tam.pctSam?.[y]));
  K.sam = yrs.map(y => K.samN[y] * (isBlank(tam.depSam?.[y]) ? N(tam.dep?.[y]) : N(tam.depSam[y])));
  K.somN = yrs.map(y => K.samN[y] * N(tam.pctSom?.[y]));
  K.som = yrs.map(y => K.somN[y] * (isBlank(tam.depSam?.[y]) ? N(tam.dep?.[y]) : N(tam.depSam[y])));
  K.caSom = yrs.map(y => K.som[y] ? CA[y] / K.som[y] : null);

  // alerts
  const alerts = [];
  const capSum = sum((S.founders || []).map(f => N(f.capital)));
  if (fSoc.some(Boolean) && (S.founders || []).length && Math.abs(capSum - 1) > 0.001) alerts.push(['warn', `Le capital réparti entre les associés fait ${(capSum * 100).toFixed(0)} % au lieu de 100 %.`]);
  yrs.forEach(y => { if (fAE[y] && CA[y] > aeNat[1]) alerts.push(['crit', `Année ${y + 1} : le CA (${Math.round(CA[y]).toLocaleString('fr-FR')} DH) dépasse le plafond auto-entrepreneur (${aeNat[1].toLocaleString('fr-FR')} DH).`]); });
  staffOut.filter(s => s.smigWarn).forEach(s => alerts.push(['warn', `${s.nom} : salaire brut inférieur au SMIG (${REG.SMIG} DH).`]));
  yrs.forEach(y => { if (K.caSom[y] !== null && K.caSom[y] > 1) alerts.push(['warn', `Année ${y + 1} : le CA prévu dépasse le SOM (marché captable). Hypothèses trop optimistes ?`]); });
  if (C.min < 0) alerts.push(['crit', `La trésorerie devient négative (${Math.round(C.min).toLocaleString('fr-FR')} DH au mois ${C.minM}) : il manque ${Math.round(C.fonds).toLocaleString('fr-FR')} DH de financement.`]);
  else if (C.min < N(H.coussin)) alerts.push(['warn', `La trésorerie descend à ${Math.round(C.min).toLocaleString('fr-FR')} DH, sous le coussin de sécurité de ${N(H.coussin).toLocaleString('fr-FR')} DH.`]);
  if (P.rn[2] < 0) alerts.push(['warn', 'Résultat net négatif en année 3 : revois les prix, les volumes ou les charges.']);
  yrs.forEach(y => { if (K.ltvCac[y] !== null && K.ltvCac[y] < 3 && y === 2) alerts.push(['info', `LTV/CAC de ${K.ltvCac[y].toFixed(1)} en année 3 : les investisseurs attendent au moins 3.`]); });
  if (B.some(b => Math.abs(b.ecart) > 1)) alerts.push(['info', `Écart de bilan détecté (${Math.round(Math.max(...B.map(b => Math.abs(b.ecart))))} DH).`]);

  return { P, C, B, K, A, rub: rubY, RUB, offers: offerCalc, staff: staffOut, loans: loanOut, inv: invList, alerts, flags: { stat, fSoc, fAE, fIS, fTVA, fDiv, cmExo }, monthLabel: m => { const d = new Date(sY, sM + m - 1, 1); return d; }, salesStart, sY, sM, T, pers, mkTot, rev, coef };
}
const api = { run, netToGross, grossToNet, REG, RUB, N, isBlank };
if (typeof module !== 'undefined') module.exports = api; else root.BPEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
