/* ================= BP Studio — core ================= */
const DATA = window.__BPDATA__;
const L = DATA.lists;
const E = window.BPEngine;
const KEY = 'bpstudio.project.v1';
const SC = ['Pessimiste', 'Réaliste', 'Optimiste'];
const clone = o => JSON.parse(JSON.stringify(o));
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const isB = E.isBlank, N = E.N;
const fmt = (v, d = 0) => (v === null || v === undefined || isNaN(v) || !isFinite(v)) ? '—' : Number(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const dh = v => (v === null || v === undefined || isNaN(v)) ? '—' : fmt(v) + ' DH';
const kdh = v => { if (v === null || v === undefined || isNaN(v)) return '—'; const a = Math.abs(v); return a >= 1e6 ? fmt(v / 1e6, 2) + ' M DH' : a >= 1e4 ? fmt(v / 1e3, 0) + ' k DH' : fmt(v) + ' DH'; };
const pc = (v, d = 1) => (v === null || v === undefined || isNaN(v) || !isFinite(v)) ? '—' : fmt(v * 100, d) + ' %';
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MO = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];

function blankProject() {
  return {
    meta: { example: false, created: new Date().toISOString() },
    id: { nom: '', slogan: '', pitch: '', date: '', stade: '', secteur: '', activite: '', ville: '', region: '', porteurs: '', tel: '', email: '', web: '', rc: '', types: [], secteurs: [] },
    vision: { vision: '', mission: '', impact: '', smart: ['', '', '', ''], valeurs: [], odd: [] },
    founders: [], staff: [],
    market: { tendances: '', probleme: '', solution: '', valeur: '', avantage: '', pourquoi: '', revenus: '', segments: [], acteurs: ['Statu quo / informel', 'Concurrent 1', 'Concurrent 2', 'Concurrent 3'], criteres: [{ critere: 'Prix / compétitivité', notes: ['', '', '', '', ''] }, { critere: 'Innovation / différenciation', notes: ['', '', '', '', ''] }, { critere: 'Service & expérience client', notes: ['', '', '', '', ''] }], personas: [], tam: { n: ['', '', ''], dep: ['', '', ''], pctSam: ['', '', ''], depSam: ['', '', ''], pctSom: ['', '', ''] }, bench: [] },
    bmc: ['Segments de clientèle','Proposition de valeur','Canaux','Relations clients','Sources de revenus','Ressources clés','Activités clés','Partenaires clés','Structure de coûts'].map(b => ({ bloc: b, choix: [], details: '' })),
    pricing: {}, partners: [],
    mkt: { canaux: [], actions: [] },
    plan: [], pestel: { P: [], E: [], S: [], T: [], En: [], L: [] },
    swot: { S: [], W: [], O: [], T: [], SO: [], WO: [], ST: [], WT: [] }, risks: [],
    hyp: { scenario: 'Réaliste', profil: 'Startup tech / innovante (forte croissance)', statut: ['SARL', 'SARL', 'SARL'], aeNature: 'Services', debutSoc: '', reserveSarl: 'Oui', start: nextJan(), ventes: '', saison: ['', '', '', '', '', '', '', '', '', '', '', ''], inflation: 0.02, inflPrix: 'Non', delaiClient: 30, delaiFourn: 30, coussin: 50000, distrib: [0, 0, 0], prelev: [0, 0, 0] },
    offers: [], stocks: [['', '', ''], ['', '', ''], ['', '', '']], invExist: [], openCash: 0, openStock: 0, inv: [], fixRec: [], fixPon: [], fin: [], loans: [],
    kpi: { clients0: 0, nouveaux: ['', '', ''], actifs: ['', '', ''], churn: ['', '', ''], vie: ['', '', ''], commercial: ['', '', ''], expansion: ['', '', ''] },
    strategy: '', notes: ''
  };
}
function nextJan() { const d = new Date(); return (d.getFullYear() + 1) + '-01-01'; }
function exampleProject() {
  const b = blankProject(), ex = clone(DATA.example); delete ex._ref;
  const p = Object.assign(b, ex);
  p.meta = { example: true };
  p.plan = (p.plan || []).filter(x => ['À faire', 'En cours', 'Fait'].includes(x.statut));
  p.mkt.actions = (p.mkt.actions || []).filter(x => ['À faire', 'En cours', 'Fait'].includes(x.statut));
  p.market.bench = [
    { acteur: 'Solutions étrangères importées', offre: 'Capteurs + logiciel', prix: '≈ 2× plus cher', positionnement: 'Premium', forces: 'Notoriété, financement', faiblesses: 'SAV lointain, pas de darija' },
    { acteur: 'Installateurs de goutte-à-goutte', offre: 'Installation, conseil', prix: 'Au chantier', positionnement: 'Proximité', forces: 'Réseau terrain', faiblesses: 'Pas de données ni d\'IA' },
    { acteur: 'Startups agritech régionales', offre: 'Applis de suivi', prix: 'Abonnement', positionnement: 'Digital', forces: 'Agilité', faiblesses: 'Pas de matériel local' }];
  p.pestel = {
    P: [{ t: 'Priorité nationale à l\'économie d\'eau et programmes d\'irrigation localisée', s: '+' }],
    E: [{ t: 'Hausse du coût de l\'énergie de pompage', s: '+' }, { t: 'Volatilité du dollar sur les composants importés', s: '-' }],
    S: [{ t: 'Méfiance d\'une partie des agriculteurs envers la technologie', s: '-' }],
    T: [{ t: 'Baisse continue du coût des capteurs IoT et des modèles d\'IA', s: '+' }],
    En: [{ t: 'Sécheresses répétées et baisse des nappes', s: '+' }],
    L: [{ t: 'Homologation ANRT des équipements radio, loi 09-08 (CNDP) sur les données', s: '-' }]
  };
  return p;
}
function migrate(p) {
  const b = blankProject();
  for (const k in b) if (p[k] === undefined) p[k] = b[k];
  for (const k in b.hyp) if (p.hyp[k] === undefined) p.hyp[k] = b.hyp[k];
  for (const k in b.market) if (p.market[k] === undefined) p.market[k] = b.market[k];
  for (const k in b.pestel) if (!p.pestel[k]) p.pestel[k] = [];
  for (const k in b.swot) if (!p.swot[k]) p.swot[k] = [];
  return p;
}
let S = null;
let R = null;
let view = 'accueil';
const sub = {};

/* ---------- path helpers ---------- */
function get(path) { return path.split('.').reduce((o, k) => (o === null || o === undefined) ? undefined : o[k], S); }
function set(path, v) {
  const ks = path.split('.'); let o = S;
  for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] === null || o[ks[i]] === undefined) o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; o = o[ks[i]]; }
  o[ks[ks.length - 1]] = v;
}
let saveT;
function save() { if (window.PB) PB.queueSave(); }
function recalc() { try { R = E.run(S, L); } catch (e) { console.error(e); } }

/* ---------- field renderers ---------- */
const fid = p => 'f_' + p.replace(/[^\w]/g, '_');
function val(p) { const v = get(p); return v === undefined || v === null ? '' : v; }
function fText(p, label, o = {}) {
  const v = val(p);
  const inp = o.area ? `<textarea class="in" id="${fid(p)}" data-p="${p}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(v)}</textarea>`
    : `<input class="in" id="${fid(p)}" data-p="${p}" value="${esc(v)}" placeholder="${esc(o.ph || '')}" ${o.list ? `list="dl_${o.list}"` : ''}>`;
  return `<div class="f ${o.cls || ''}">${label ? `<label for="${fid(p)}">${label}</label>` : ''}${inp}${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function fNum(p, label, o = {}) {
  const v = val(p);
  return `<div class="f ${o.cls || ''}">${label ? `<label for="${fid(p)}">${label}</label>` : ''}<div class="suf"><input class="in n ${o.hyp ? 'hyp' : ''}" id="${fid(p)}" data-p="${p}" data-t="num" inputmode="decimal" value="${esc(v)}" placeholder="${esc(o.ph || '')}"><span>${o.suf || ''}</span></div>${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function fPct(p, label, o = {}) {
  const v = get(p); const s = (v === '' || v === null || v === undefined) ? '' : +(N(v) * 100).toFixed(4);
  return `<div class="f ${o.cls || ''}">${label ? `<label for="${fid(p)}">${label}</label>` : ''}<div class="suf"><input class="in n ${o.hyp ? 'hyp' : ''}" id="${fid(p)}" data-p="${p}" data-t="pct" inputmode="decimal" value="${s}" placeholder="${esc(o.ph || '')}"><span>%</span></div>${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function fDate(p, label, o = {}) {
  return `<div class="f ${o.cls || ''}">${label ? `<label for="${fid(p)}">${label}</label>` : ''}<input type="date" class="in ${o.hyp ? 'hyp' : ''}" id="${fid(p)}" data-p="${p}" value="${esc(val(p))}">${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function fSel(p, label, opts, o = {}) {
  const v = val(p);
  const op = (o.empty ? `<option value="">${o.empty}</option>` : '') + opts.map(x => { const [k, t] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(k)}" ${String(k) === String(v) ? 'selected' : ''}>${esc(t)}</option>`; }).join('');
  return `<div class="f ${o.cls || ''}">${label ? `<label for="${fid(p)}">${label}</label>` : ''}<select class="in ${o.hyp ? 'hyp' : ''}" id="${fid(p)}" data-p="${p}" ${o.t ? `data-t="${o.t}"` : ''}>${op}</select>${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function fChips(p, label, options, o = {}) {
  const cur = get(p) || [];
  return `<div class="f">${label ? `<span class="lbl">${label}</span>` : ''}<div class="chips">${options.map(x => `<button type="button" class="chip ${cur.includes(x) ? 'on' : ''}" data-chip="${p}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>${o.help ? `<span class="help">${o.help}</span>` : ''}</div>`;
}
function cellIn(p, type, o = {}) {
  const v = get(p);
  if (type === 'sel') { const op = (o.empty !== false ? '<option value=""></option>' : '') + (o.opts || []).map(x => { const [k, t] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(k)}" ${String(k) === String(v ?? '') ? 'selected' : ''}>${esc(t)}</option>`; }).join(''); return `<select class="in" id="${fid(p)}" data-p="${p}" ${o.t ? `data-t="${o.t}"` : ''}>${op}</select>`; }
  if (type === 'num') return `<input class="in n" id="${fid(p)}" data-p="${p}" data-t="num" inputmode="decimal" value="${esc(v ?? '')}" placeholder="${esc(o.ph || '')}">`;
  if (type === 'pct') { const s = (v === '' || v === null || v === undefined) ? '' : +(N(v) * 100).toFixed(4); return `<input class="in n" id="${fid(p)}" data-p="${p}" data-t="pct" inputmode="decimal" value="${s}" placeholder="${esc(o.ph || '%')}">`; }
  if (type === 'date') return `<input type="date" class="in" id="${fid(p)}" data-p="${p}" value="${esc(v ?? '')}">`;
  if (type === 'area') return `<textarea class="in" rows="2" id="${fid(p)}" data-p="${p}">${esc(v ?? '')}</textarea>`;
  return `<input class="in" id="${fid(p)}" data-p="${p}" value="${esc(v ?? '')}" ${o.list ? `list="dl_${o.list}"` : ''} placeholder="${esc(o.ph || '')}">`;
}
/* editable table: arr path, columns [{k,l,t,w,opts,list}] */
function tableEd(arrPath, cols, o = {}) {
  const arr = get(arrPath) || [];
  const head = `<tr>${cols.map(c => `<th class="${/num|pct/.test(c.t) ? 'n' : ''}" style="${c.w ? `min-width:${c.w}px` : ''}">${c.l}</th>`).join('')}<th></th></tr>`;
  const rows = arr.map((r, i) => `<tr>${cols.map(c => `<td>${c.render ? c.render(r, i) : cellIn(`${arrPath}.${i}.${c.k}`, c.t, c)}</td>`).join('')}<td class="x"><button class="del" title="Supprimer la ligne" data-act="del" data-arr="${arrPath}" data-i="${i}">×</button></td></tr>`).join('');
  return `<div class="tw"><table class="et">${head}${rows || `<tr><td colspan="${cols.length + 1}" class="muted small" style="padding:12px">${o.empty || 'Aucune ligne pour l\'instant.'}</td></tr>`}</table></div>
  <div class="row" style="margin-top:8px"><button class="btn sm" data-act="add" data-arr="${arrPath}" data-new='${esc(JSON.stringify(o.newRow || {}))}'>+ ${o.add || 'Ajouter une ligne'}</button>${o.extra || ''}</div>`;
}
function listEd(arrPath, ph) {
  const arr = get(arrPath) || [];
  return `<div class="list-ed">${arr.map((x, i) => `<div class="li"><input class="in" id="${fid(arrPath + '.' + i)}" data-p="${arrPath}.${i}" value="${esc(x)}" placeholder="${esc(ph || '')}"><button class="del" data-act="del" data-arr="${arrPath}" data-i="${i}" title="Supprimer">×</button></div>`).join('')}
  <div><button class="btn sm ghost" data-act="addstr" data-arr="${arrPath}">+ Ajouter</button></div></div>`;
}
function datalists() {
  const keys = ['L_Activite','L_Secteur','L_Region','L_Stade','L_Role','L_Unite','L_PType','L_Cible','L_Gamme','L_ChVar','L_ChFix','L_ChPonct','L_Source','L_TypeEmp','L_Canal','L_ObjMkt','L_KPI','L_Ton','L_PrixStrat','L_Criteres','L_RisqueCat','L_Phase','L_Statut2'];
  return keys.map(k => `<datalist id="dl_${k}">${(L[k] || []).map(v => `<option value="${esc(v)}">`).join('')}</datalist>`).join('');
}
function card(title, sub_, body, o = {}) { return `<section class="card" ${o.id ? `id="${o.id}"` : ''}><div class="row"><h3>${title}</h3><span class="sp"></span>${o.right || ''}</div>${sub_ ? `<p class="sub">${sub_}</p>` : ''}${body}</section>`; }
function yrLab(y) { const st = new Date((S.hyp.start || nextJan()) + 'T00:00:00'); const a = st.getFullYear() + y; return st.getMonth() ? `An ${y + 1} (${a}-${a + 1})` : `An ${y + 1} (${a})`; }
function mLab(m) { const st = new Date((S.hyp.start || nextJan()) + 'T00:00:00'); const d = new Date(st.getFullYear(), st.getMonth() + m - 1, 1); return MO[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2); }
function mLong(m) { const st = new Date((S.hyp.start || nextJan()) + 'T00:00:00'); const d = new Date(st.getFullYear(), st.getMonth() + m - 1, 1); return MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
