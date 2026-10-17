/* ================= PlanBiz : rapport PDF (mise en page imprimable, graphiques SVG) ================= */
(function () {
'use strict';
const C = { navy: '#0A2540', blue: '#1652F0', blue2: '#8FB1FF', green: '#0E8A5F', red: '#C4321C', amber: '#B25E09', grey: '#8A97AB', line: '#DDE3EB', ink: '#0B1526', muted: '#4F5D73', teal: '#0F7C99', violet: '#5B3FD1' };
const PAL = [C.blue, C.navy, C.green, C.amber, C.teal, C.violet, '#C2417A', '#6B7A90', '#2F9E9E', '#8C6D1F'];
const X = s => esc(String(s ?? ''));
const sum = a => a.reduce((x, y) => x + y, 0);
const short = v => { if (v === null || v === undefined || isNaN(v)) return '—'; const a = Math.abs(v); return a >= 1e6 ? fmt(v / 1e6, a >= 1e7 ? 1 : 2) + ' M' : a >= 1e3 ? fmt(v / 1e3, 0) + ' k' : fmt(v, 0); };
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(k => n <= k)) * p; }

/* ---------- charts ---------- */
function bars({ labels, series, w = 680, h = 250, unit = '' }) {
  const all = series.flatMap(s => s.values); const mx = niceMax(Math.max(0, ...all)), mn = Math.min(0, ...all) < 0 ? -niceMax(-Math.min(...all)) : 0;
  const L = 58, R_ = 10, T = 26, B = 34, iw = w - L - R_, ih = h - T - B, y = v => T + ih * (mx - v) / (mx - mn);
  const ticks = 5, gw = iw / labels.length, bw = Math.min(46, (gw * .72) / series.length);
  let g = '';
  for (let i = 0; i <= ticks; i++) { const v = mn + (mx - mn) * i / ticks; g += `<line x1="${L}" x2="${w - R_}" y1="${y(v)}" y2="${y(v)}" stroke="${C.line}"/><text x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end" font-size="10" fill="${C.muted}">${short(v)}</text>`; }
  g += `<line x1="${L}" x2="${w - R_}" y1="${y(0)}" y2="${y(0)}" stroke="${C.ink}" stroke-width="1"/>`;
  labels.forEach((lb, i) => {
    const x0 = L + gw * i + (gw - bw * series.length) / 2;
    series.forEach((s, k) => { const v = s.values[i] || 0, yy = y(Math.max(0, v)), hh = Math.abs(y(v) - y(0)); const col = s.signColor ? (v >= 0 ? C.green : C.red) : s.color;
      g += `<rect x="${x0 + k * bw + 1}" y="${yy}" width="${bw - 2}" height="${Math.max(.5, hh)}" rx="2" fill="${col}"/>`;
      g += `<text x="${x0 + k * bw + bw / 2}" y="${v >= 0 ? yy - 4 : yy + hh + 11}" text-anchor="middle" font-size="9.5" fill="${C.ink}">${short(v)}</text>`; });
    g += `<text x="${L + gw * i + gw / 2}" y="${h - 14}" text-anchor="middle" font-size="11" fill="${C.ink}">${X(lb)}</text>`;
  });
  const lg = series.map((s, k) => `<g transform="translate(${L + k * 130},8)"><rect width="10" height="10" rx="2" fill="${s.signColor ? C.green : s.color}"/><text x="15" y="9" font-size="10.5" fill="${C.ink}">${X(s.name)}</text></g>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img">${lg}${g}</svg>`;
}
function line({ labels, series, w = 680, h = 230, refs = [] }) {
  const all = series.flatMap(s => s.values).concat(refs.map(r => r.value)); let mx = niceMax(Math.max(0, ...all)); const lo = Math.min(0, ...all); const mn = lo < 0 ? -niceMax(-lo) : 0;
  const L = 58, R_ = 10, T = 24, B = 30, iw = w - L - R_, ih = h - T - B, n = labels.length, x = i => L + iw * i / Math.max(1, n - 1), y = v => T + ih * (mx - v) / (mx - mn);
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) * i / 4; g += `<line x1="${L}" x2="${w - R_}" y1="${y(v)}" y2="${y(v)}" stroke="${C.line}"/><text x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end" font-size="10" fill="${C.muted}">${short(v)}</text>`; }
  if (mn < 0) g += `<line x1="${L}" x2="${w - R_}" y1="${y(0)}" y2="${y(0)}" stroke="${C.red}" stroke-width="1"/>`;
  labels.forEach((lb, i) => { if (i % 3 === 0) g += `<text x="${x(i)}" y="${h - 10}" text-anchor="middle" font-size="9.5" fill="${C.muted}">${X(lb)}</text>`; });
  refs.forEach(r => { g += `<line x1="${L}" x2="${w - R_}" y1="${y(r.value)}" y2="${y(r.value)}" stroke="${r.color}" stroke-dasharray="5 4"/><text x="${w - R_}" y="${y(r.value) - 4}" text-anchor="end" font-size="9.5" fill="${r.color}">${X(r.name)}</text>`; });
  series.forEach(s => {
    const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    if (s.fill) g += `<polygon points="${x(0)},${y(Math.max(mn, 0))} ${pts} ${x(n - 1)},${y(Math.max(mn, 0))}" fill="${s.color}" opacity=".10"/>`;
    g += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2}"/>`;
    const last = s.values[n - 1]; g += `<circle cx="${x(n - 1)}" cy="${y(last)}" r="3" fill="${s.color}"/>`;
  });
  const lg = series.map((s, k) => `<g transform="translate(${L + k * 120},6)"><rect width="10" height="3" y="4" fill="${s.color}"/><text x="15" y="9" font-size="10.5" fill="${C.ink}">${X(s.name)}</text></g>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img">${lg}${g}</svg>`;
}
function hbars({ items, w = 680, unit = ' DH', max }) {
  const rowH = 24, L = 210, h = items.length * rowH + 8, mx = max || niceMax(Math.max(1, ...items.map(i => i.value)));
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img">${items.map((it, i) => { const bw = (w - L - 80) * Math.max(0, it.value) / mx;
    return `<text x="${L - 8}" y="${i * rowH + 16}" text-anchor="end" font-size="10.5" fill="${C.ink}">${X(it.label.length > 34 ? it.label.slice(0, 33) + '…' : it.label)}</text><rect x="${L}" y="${i * rowH + 5}" width="${Math.max(1, bw)}" height="14" rx="2" fill="${it.color || C.blue}"/><text x="${L + bw + 6}" y="${i * rowH + 16}" font-size="10" fill="${C.muted}">${X(it.text || short(it.value) + unit)}</text>`; }).join('')}</svg>`;
}
function donut({ items, w = 330, h = 200 }) {
  const tot = sum(items.map(i => Math.max(0, i.value))) || 1, cx = 95, cy = h / 2, r = 78, ri = 48; let a = -Math.PI / 2, g = '';
  items.forEach((it, k) => { const v = Math.max(0, it.value); if (!v) return; const a2 = a + 2 * Math.PI * v / tot, lg = a2 - a > Math.PI ? 1 : 0;
    const p = (rr, ang) => `${(cx + rr * Math.cos(ang)).toFixed(2)},${(cy + rr * Math.sin(ang)).toFixed(2)}`;
    g += v >= tot ? `<circle cx="${cx}" cy="${cy}" r="${(r + ri) / 2}" fill="none" stroke="${it.color || PAL[k % 10]}" stroke-width="${r - ri}"/>` : `<path d="M${p(r, a)} A${r},${r} 0 ${lg} 1 ${p(r, a2)} L${p(ri, a2)} A${ri},${ri} 0 ${lg} 0 ${p(ri, a)} Z" fill="${it.color || PAL[k % 10]}"/>`; a = a2; });
  const lgd = items.filter(i => i.value > 0).map((it, k) => `<g transform="translate(190,${18 + k * 19})"><rect width="10" height="10" rx="2" fill="${it.color || PAL[items.indexOf(it) % 10]}"/><text x="15" y="9" font-size="10" fill="${C.ink}">${X(it.label)} · ${pc(it.value / tot, 0)}</text></g>`).join('');
  return `<svg viewBox="0 0 ${w + 70} ${Math.max(h, 30 + items.length * 19)}" width="100%" role="img">${g}<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="13" font-weight="700" fill="${C.ink}">${short(tot)}</text><text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="9.5" fill="${C.muted}">DH</text>${lgd}</svg>`;
}
function stacked({ labels, series, w = 680, h = 250 }) {
  const tots = labels.map((_, i) => sum(series.map(s => s.values[i] || 0))); const mx = niceMax(Math.max(1, ...tots));
  const L = 58, R_ = 160, T = 12, B = 30, iw = w - L - R_, ih = h - T - B, gw = iw / labels.length, bw = Math.min(70, gw * .6), y = v => T + ih * (mx - v) / mx;
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = mx * i / 4; g += `<line x1="${L}" x2="${L + iw}" y1="${y(v)}" y2="${y(v)}" stroke="${C.line}"/><text x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end" font-size="10" fill="${C.muted}">${short(v)}</text>`; }
  labels.forEach((lb, i) => { let acc = 0; const x0 = L + gw * i + (gw - bw) / 2;
    series.forEach((s, k) => { const v = s.values[i] || 0; if (v <= 0) return; g += `<rect x="${x0}" y="${y(acc + v)}" width="${bw}" height="${y(acc) - y(acc + v)}" fill="${PAL[k % 10]}"/>`; acc += v; });
    g += `<text x="${x0 + bw / 2}" y="${y(acc) - 4}" text-anchor="middle" font-size="10" font-weight="700" fill="${C.ink}">${short(acc)}</text><text x="${x0 + bw / 2}" y="${h - 10}" text-anchor="middle" font-size="11" fill="${C.ink}">${X(lb)}</text>`; });
  const lg = series.map((s, k) => `<g transform="translate(${L + iw + 14},${T + k * 17})"><rect width="9" height="9" rx="2" fill="${PAL[k % 10]}"/><text x="14" y="8.5" font-size="9.5" fill="${C.ink}">${X(s.name.length > 24 ? s.name.slice(0, 23) + '…' : s.name)}</text></g>`).join('');
  return `<svg viewBox="0 0 ${w} ${Math.max(h, T + series.length * 17 + 10)}" width="100%" role="img">${g}${lg}</svg>`;
}
function funnel(rows) {
  const mx = Math.max(1, ...rows.map(r => r.value)), w = 680;
  return `<svg viewBox="0 0 ${w} ${rows.length * 46}" width="100%" role="img">${rows.map((r, i) => { const bw = Math.max(70, (w - 260) * Math.sqrt(r.value / mx)); const x = (w - 260 - bw) / 2;
    return `<rect x="${x}" y="${i * 46 + 4}" width="${bw}" height="36" rx="4" fill="${[C.navy, C.blue, C.green][i]}"/><text x="${x + bw / 2}" y="${i * 46 + 27}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${X(r.name)}</text><text x="${w - 250}" y="${i * 46 + 20}" font-size="12" font-weight="700" fill="${C.ink}">${short(r.value)} DH / an</text><text x="${w - 250}" y="${i * 46 + 35}" font-size="10" fill="${C.muted}">${X(r.sub)}</text>`; }).join('')}</svg>`;
}
function gantt(plan) {
  const st = new Date((S.hyp.start || nextJan()) + 'T00:00:00'); const mi = ds => { if (!ds) return null; const d = new Date(ds + 'T00:00:00'); return (d.getFullYear() - st.getFullYear()) * 12 + d.getMonth() - st.getMonth() + 1; };
  const rows = plan.filter(p => p.action && p.debut).slice(0, 26), w = 680, L = 230, cw = (w - L) / 36, rh = 17, h = rows.length * rh + 26;
  let g = ''; for (let y = 0; y < 3; y++) g += `<rect x="${L + y * 12 * cw}" y="0" width="${12 * cw}" height="${h}" fill="${y % 2 ? '#F6F8FB' : '#fff'}"/><text x="${L + y * 12 * cw + 6 * cw}" y="13" text-anchor="middle" font-size="10.5" font-weight="700" fill="${C.ink}">${X(yrLab(y))}</text>`;
  rows.forEach((p, i) => { const a = Math.max(1, mi(p.debut) || 1), b = Math.min(36, mi(p.fin) || a); const col = p.statut === 'Fait' ? C.green : p.statut === 'En cours' ? C.amber : C.blue;
    g += `<text x="${L - 6}" y="${26 + i * rh + 9}" text-anchor="end" font-size="9.5" fill="${C.ink}">${X(p.action.length > 40 ? p.action.slice(0, 39) + '…' : p.action)}</text>`;
    if (a <= 36 && b >= 1) g += `<rect x="${L + (a - 1) * cw}" y="${26 + i * rh}" width="${Math.max(cw * .8, (b - a + 1) * cw)}" height="11" rx="2" fill="${col}"/>`; });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img">${g}</svg>`;
}
function riskMatrix(risks) {
  const s = 64, L = 70, T = 10, w = L + 3 * s + 230;
  let g = '';
  for (let p = 3; p >= 1; p--) for (let i = 1; i <= 3; i++) { const c = p * i; g += `<rect x="${L + (i - 1) * s}" y="${T + (3 - p) * s}" width="${s - 3}" height="${s - 3}" rx="4" fill="${c >= 6 ? '#F6D2CC' : c >= 3 ? '#FBE6C8' : '#D6EFE3'}"/>`; }
  const cells = {}; risks.forEach((r, k) => { const key = `${N(r.p) || 2}-${N(r.i) || 2}`; (cells[key] = cells[key] || []).push(k + 1); });
  Object.entries(cells).forEach(([key, ns]) => { const [p, i] = key.split('-').map(Number); g += `<text x="${L + (i - 1) * s + (s - 3) / 2}" y="${T + (3 - p) * s + (s - 3) / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${C.ink}">${ns.slice(0, 6).join(' · ')}</text>`; });
  g += `<text x="${L + 1.5 * s}" y="${T + 3 * s + 16}" text-anchor="middle" font-size="10" fill="${C.muted}">Impact →</text><text transform="translate(${L - 14},${T + 1.5 * s}) rotate(-90)" text-anchor="middle" font-size="10" fill="${C.muted}">Probabilité →</text>`;
  ['Faible', 'Moyen', 'Fort'].forEach((t, i) => { g += `<text x="${L + i * s + (s - 3) / 2}" y="${T + 3 * s + 4}" text-anchor="middle" font-size="0">${t}</text>`; });
  g += `<g transform="translate(${L + 3 * s + 20},${T + 6})"><rect width="12" height="12" rx="2" fill="#F6D2CC"/><text x="18" y="10" font-size="10.5">Prioritaire (6-9)</text><rect y="20" width="12" height="12" rx="2" fill="#FBE6C8"/><text x="18" y="30" font-size="10.5">À surveiller (3-5)</text><rect y="40" width="12" height="12" rx="2" fill="#D6EFE3"/><text x="18" y="50" font-size="10.5">Faible (1-2)</text></g>`;
  return `<svg viewBox="0 0 ${w} ${T + 3 * s + 24}" width="100%" style="max-width:520px" role="img">${g}</svg>`;
}

/* ---------- tables ---------- */
const ys = () => [0, 1, 2].map(yrLab);
function tb(head, rows, cls = '') { return `<table class="${cls}"><thead><tr>${head.map((h, i) => `<th class="${i ? 'n' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`; }
function rw(l, a, c = '', f = fmt) { return `<tr class="${c}"><td>${l}</td>${a.map(v => `<td class="n">${f(v)}</td>`).join('')}</tr>`; }
function kpi(label, value, sub, tone) { return `<div class="kp ${tone || ''}"><small>${label}</small><b>${value}</b>${sub ? `<span>${sub}</span>` : ''}</div>`; }
function sec(n, t, body, opts = {}) { return `<section class="sec ${opts.brk ? 'brk' : ''}"><h2><span>${n}</span>${t}</h2>${body}</section>`; }
const lst = a => { const x = (a || []).filter(Boolean); return x.length ? `<ul>${x.map(v => `<li>${X(v)}</li>`).join('')}</ul>` : '<p class="mut">—</p>'; };
const pp = t => t ? String(t).split(/\n+/).map(l => `<p>${X(l)}</p>`).join('') : '';

function build() {
  const P = R.P, Cc = R.C, K = R.K, B = R.B, A = R.A, m = S.market, Y = ys();
  const scen = [0, 1, 2].map(i => E.run(S, L, i));
  const months = Array.from({ length: 36 }, (_, i) => mLab(i + 1));
  const totInv = sum((S.inv || []).map(i => N(i.montant)));
  const resources = { cap: 0, cca: 0, sub: 0, emp: sum((S.loans || []).map(l => N(l.montant))) };
  (S.fin || []).forEach(f => { const n = f.nature || ''; if (n.startsWith('Capital')) resources.cap += N(f.montant); else if (n.startsWith('Compte')) resources.cca += N(f.montant); else resources.sub += N(f.montant); });
  const totRes = resources.cap + resources.cca + resources.sub + resources.emp;
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const cover = `<section class="cover"><div class="cv-top"><span class="cv-logo"><svg viewBox="0 0 32 32"><rect x="6" y="17" width="5" height="9" rx="1" fill="#8FB1FF"/><rect x="13.5" y="11" width="5" height="15" rx="1" fill="#C7D8FF"/><rect x="21" y="5" width="5" height="21" rx="1" fill="#fff"/></svg></span>PlanBiz</div>
   <div class="cv-mid"><p class="cv-eb">Business plan · ${X(Y[0])} – ${X(Y[2])}</p><h1>${X(S.id.nom || 'Mon projet')}</h1>${S.id.slogan ? `<p class="cv-sl">${X(S.id.slogan)}</p>` : ''}${S.id.pitch ? `<p class="cv-pitch">${X(S.id.pitch)}</p>` : ''}</div>
   <div class="cv-kpis">${kpi('CA année 3', kdh(P.ca[2]))}${kpi('Résultat net année 3', kdh(P.rn[2]))}${kpi('Trésorerie la plus basse', kdh(Cc.min))}${kpi('Point mort', Cc.pointMort ? mLong(Cc.pointMort) : 'non atteint')}</div>
   <div class="cv-meta"><div><small>Porteur(s)</small><b>${X(S.id.porteurs || '—')}</b></div><div><small>Secteur</small><b>${X(S.id.secteur || '—')}</b></div><div><small>Statut juridique</small><b>${X(R.flags.stat.filter((v, i, a) => a.indexOf(v) === i).join(' → '))}</b></div><div><small>Localisation</small><b>${X(S.id.ville || '—')}</b></div><div><small>Scénario présenté</small><b>${X(S.hyp.scenario)}</b></div><div><small>Édition</small><b>${today}</b></div></div></section>`;

  const toc = `<section class="sec brk"><h2 class="toc-h">Sommaire</h2><ol class="toc">${['Synthèse exécutive', 'Le projet et l\'équipe', 'Vision, mission et objectifs', 'Marché, clients et concurrence', 'Offre et business model', 'Communication et marketing', 'Analyse PESTEL', 'SWOT et stratégies', 'Stratégie et recommandations', 'Plan d\'actions', 'Risques', 'Prévisions financières', 'Scénarios et sensibilité', 'Conformité et loi de finances 2026', 'Besoins et ressources de financement'].map(t => `<li>${t}</li>`).join('')}</ol>
   <div class="note">Les montants sont en dirhams (DH) hors taxes, sauf mention contraire. Les prévisions reposent sur les hypothèses du porteur de projet et les règles fiscales et sociales marocaines 2026 (IS, TVA, CNSS/AMO, IR).</div></section>`;

  const s1 = sec('01', 'Synthèse exécutive', `${S.id.pitch ? `<p class="lead">${X(S.id.pitch)}</p>` : ''}
   <div class="kgrid">${kpi('Chiffre d\'affaires', kdh(P.ca[2]), `année 3 · ${K.growth[2] !== null ? 'croissance ' + pc(K.growth[2], 0) : ''}`)}${kpi('EBE', kdh(P.ebe[2]), `année 3 · ${pc(K.tebe[2])} du CA`, P.ebe[2] >= 0 ? 'pos' : 'neg')}${kpi('Résultat net', kdh(P.rn[2]), `année 3 · an 1 : ${kdh(P.rn[0])}`, P.rn[2] >= 0 ? 'pos' : 'neg')}${kpi('Trésorerie la plus basse', kdh(Cc.min), mLong(Cc.minM), Cc.min < 0 ? 'neg' : '')}${kpi('Fonds à lever en plus', kdh(Cc.fonds), Cc.fonds ? 'pour rester positif' : 'aucun', Cc.fonds ? 'neg' : 'pos')}${kpi('Investissements', kdh(totInv), 'sur 3 ans, HT')}</div>
   <div class="fig"><h4>Chiffre d'affaires, EBE et résultat net</h4>${bars({ labels: Y, series: [{ name: 'Chiffre d\'affaires', color: C.blue, values: P.ca }, { name: 'EBE', color: C.navy, values: P.ebe }, { name: 'Résultat net', signColor: true, values: P.rn }] })}</div>
   <h3>À retenir</h3><ul>${synthese().map(s => `<li>${X(s)}</li>`).join('')}</ul>`, { brk: true });

  const s2 = sec('02', 'Le projet et l\'équipe', `<div class="facts">${[['Stade', S.id.stade], ['Activité', S.id.activite], ['Secteur', S.id.secteur], ['Ville / région', [S.id.ville, S.id.region].filter(Boolean).join(' · ')], ['Création', S.id.date], ['Contact', [S.id.email, S.id.web].filter(Boolean).join(' · ')]].map(([k, v]) => `<div><small>${k}</small><b>${X(v || '—')}</b></div>`).join('')}</div>
   ${(S.founders || []).length ? `<h3>Équipe fondatrice</h3>${tb(['Nom', 'Rôle', 'Compétences', '% capital'], S.founders.map(f => `<tr><td><b>${X(f.nom)}</b></td><td>${X(f.role)}</td><td>${X(f.comp || '')}</td><td class="n">${pc(N(f.capital), 0)}</td></tr>`))}` : ''}
   <h3>Plan de personnel</h3>${tb(['', ...Y], [rw('Effectif salarié en fin d\'année', K.head), rw('Coût total de l\'équipe (DH)', K.teamCost), rw('Coût de l\'équipe / CA', K.teamRatio, '', v => pc(v))])}
   ${(S.staff || []).length ? `<p class="mut small">${S.staff.length} postes prévus : ${X(S.staff.map(s => s.nom).slice(0, 14).join(', '))}${S.staff.length > 14 ? '…' : ''}.</p>` : ''}`, { brk: true });

  const s3 = sec('03', 'Vision, mission et objectifs', `${S.vision.vision ? `<div class="quote"><small>Vision</small>${X(S.vision.vision)}</div>` : ''}${S.vision.mission ? `<div class="quote"><small>Mission</small>${X(S.vision.mission)}</div>` : ''}${S.vision.impact ? `<div class="quote"><small>Impact</small>${X(S.vision.impact)}</div>` : ''}
   ${S.vision.smart.some(Boolean) ? `<h3>Objectifs SMART</h3>${tb(['Horizon', 'Objectif'], S.vision.smart.map((s, i) => s ? `<tr><td><b>${['Année 1', 'Année 2', 'Année 3', 'Au-delà'][i]}</b></td><td>${X(s)}</td></tr>` : ''))}` : ''}
   ${S.vision.valeurs.length ? `<p><b>Valeurs :</b> ${S.vision.valeurs.map(X).join(' · ')}</p>` : ''}${S.vision.odd.length ? `<p><b>Objectifs de développement durable :</b> ${S.vision.odd.map(X).join(' · ')}</p>` : ''}`);

  const acteurs = ['Mon entreprise', ...(m.acteurs || [])], tots = acteurs.map((_, j) => sum((m.criteres || []).map(c => N(c.notes[j]))));
  const s4 = sec('04', 'Marché, clients et concurrence', `${[['Secteur et tendances', m.tendances], ['Problème', m.probleme], ['Solution', m.solution], ['Proposition de valeur', m.valeur], ['Avantage concurrentiel', m.avantage], ['Pourquoi maintenant', m.pourquoi]].filter(x => x[1]).map(([t, v]) => `<h3>${t}</h3>${pp(v)}`).join('')}
   ${m.segments.length ? `<p><b>Segments visés :</b> ${m.segments.map(X).join(' · ')}</p>` : ''}
   ${K.tam[0] ? `<div class="fig"><h4>Taille du marché (année 3)</h4>${funnel([{ name: 'TAM', value: K.tam[2], sub: `${fmt(N(m.tam.n[2]))} clients potentiels` }, { name: 'SAM', value: K.sam[2], sub: `${fmt(K.samN[2])} clients accessibles` }, { name: 'SOM', value: K.som[2], sub: `${fmt(K.somN[2])} clients visés · CA prévu = ${pc(K.caSom[2], 0)} du SOM` }])}</div>` : ''}
   ${(m.bench || []).length ? `<h3>Benchmark concurrentiel</h3>${tb(['Acteur', 'Offre', 'Prix', 'Forces', 'Faiblesses'], m.bench.map(b => `<tr><td><b>${X(b.acteur)}</b></td><td>${X(b.offre)}</td><td>${X(b.prix)}</td><td>${X(b.forces)}</td><td>${X(b.faiblesses)}</td></tr>`), 'tsmall')}` : ''}
   ${tots.some(Boolean) ? `<div class="fig"><h4>Grille de comparaison (total des notes sur ${(m.criteres || []).length * 5})</h4>${hbars({ items: acteurs.map((a, j) => ({ label: a, value: tots[j], color: j ? C.grey : C.blue, text: String(tots[j]) })), unit: '' })}</div>` : ''}
   ${(m.personas || []).length ? `<h3>Personas</h3><div class="cards">${m.personas.map(p => `<div class="pcard"><b>${X(p.nom)}</b><small>${X(p.profession || '')}</small><p><i>Besoins :</i> ${X(p.besoins || '')}</p><p><i>Freins :</i> ${X(p.freins || '')}</p>${p.phrase ? `<p class="q">${X(p.phrase)}</p>` : ''}</div>`).join('')}</div>` : ''}`, { brk: true });

  const offers = K.offerCA.filter(o => o.ca.some(Boolean));
  const s5 = sec('05', 'Offre et business model', `${offers.length ? `<div class="fig"><h4>Chiffre d'affaires par offre</h4>${stacked({ labels: Y, series: offers.map(o => ({ name: o.nom, values: o.ca })) })}</div>` : ''}
   ${tb(['Offre', 'Prix An 1', 'Marge', 'CA An 1', 'CA An 2', 'CA An 3'], K.offerCA.map(o => `<tr><td><b>${X(o.nom)}</b><br><span class="mut small">${X((o.cible || '').slice(0, 70))}${(o.cible || '').length > 70 ? '…' : ''}</span></td><td class="n">${fmt(o.prix[0])}</td><td class="n">${pc(o.prix[0] ? (o.prix[0] - o.cu[0]) / o.prix[0] : null, 0)}</td>${o.ca.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr>`).concat([rw('<b>Total</b>', ['', '', ...K.ca], 'tot', v => v === '' ? '' : fmt(v))]), 'tsmall toff')}
   <h3>Business Model Canvas</h3><div class="bmc">${S.bmc.map((b, i) => `<div class="bk b${i}"><h5>${X(b.bloc)}</h5>${b.choix.length ? `<ul>${b.choix.map(c => `<li>${X(c)}</li>`).join('')}</ul>` : ''}${b.details ? `<p>${X(b.details)}</p>` : ''}</div>`).join('')}</div>
   ${S.pricing.strategie ? `<p><b>Stratégie de prix :</b> ${X(S.pricing.strategie)}. ${X(S.pricing.strategieTxt || '')}</p>` : ''}${S.pricing.conditions ? `<p><b>Conditions de vente :</b> ${X(S.pricing.conditions)}</p>` : ''}`, { brk: true });

  const ch = (S.mkt.canaux || []).filter(c => c.canal);
  const s6 = sec('06', 'Communication et marketing', `${S.mkt.positionnement ? `<div class="quote"><small>Positionnement</small>${X(S.mkt.positionnement)}</div>` : ''}${S.mkt.message ? `<p><b>Message clé :</b> ${X(S.mkt.message)}</p>` : ''}
   ${['produit', 'prix', 'place', 'promotion', 'personnes', 'processus', 'preuve'].some(k => S.mkt[k]) ? tb(['Mix marketing', ''], [['Produit', 'produit'], ['Prix', 'prix'], ['Distribution', 'place'], ['Promotion', 'promotion'], ['Personnes', 'personnes'], ['Processus', 'processus'], ['Preuve physique', 'preuve']].filter(x => S.mkt[x[1]]).map(([l, k]) => `<tr><td><b>${l}</b></td><td>${X(S.mkt[k])}</td></tr>`), 'tsmall') : ''}
   ${ch.length ? `<div class="fig"><h4>Budget mensuel par canal (année 1)</h4>${hbars({ items: ch.map(c => ({ label: c.canal, value: N(c.budget[0]) })).sort((a, b) => b.value - a.value) })}</div>` : ''}
   ${tb(['', ...Y], [rw('Budget marketing total (DH)', K.mkt), rw('Marketing / CA', K.mktRatio, '', v => pc(v)), rw('Coût d\'acquisition client (CAC)', K.cac)])}`);

  const PEST = [['P', 'Politique'], ['E', 'Économique'], ['S', 'Socioculturel'], ['T', 'Technologique'], ['En', 'Écologique'], ['L', 'Légal']];
  const s7 = sec('07', 'Analyse PESTEL', `<div class="pestel">${PEST.map(([k, t]) => `<div class="pb"><h5>${t}</h5>${(S.pestel[k] || []).length ? `<ul>${S.pestel[k].map(x => `<li><span class="sg ${x.s === '-' ? 'neg' : x.s === '+' ? 'pos' : ''}">${x.s === '-' ? '−' : x.s}</span>${X(x.t)}</li>`).join('')}</ul>` : '<p class="mut">—</p>'}</div>`).join('')}</div>`, { brk: true });
  const s8 = sec('08', 'SWOT et stratégies', `<div class="swot"><div class="sw s"><h5>Forces</h5>${lst(S.swot.S)}</div><div class="sw w"><h5>Faiblesses</h5>${lst(S.swot.W)}</div><div class="sw o"><h5>Opportunités</h5>${lst(S.swot.O)}</div><div class="sw t"><h5>Menaces</h5>${lst(S.swot.T)}</div></div>
   ${['SO', 'WO', 'ST', 'WT'].some(k => (S.swot[k] || []).filter(Boolean).length) ? `<h3>Stratégies croisées</h3>${tb(['Stratégie', 'Actions'], [['S × O — Attaquer', 'SO'], ['W × O — Améliorer', 'WO'], ['S × T — Défendre', 'ST'], ['W × T — Se protéger', 'WT']].map(([t, k]) => `<tr><td><b>${t}</b></td><td>${lst(S.swot[k])}</td></tr>`), 'tsmall')}` : ''}`);
  const s9 = sec('09', 'Stratégie et recommandations', S.strategy ? pp(S.strategy) : '<p class="mut">À compléter dans la section « Business plan & exports ».</p>');
  const s10 = sec('10', 'Plan d\'actions', (S.plan || []).length ? `<div class="fig">${gantt(S.plan)}<p class="legend"><i style="background:${C.green}"></i>Fait <i style="background:${C.amber}"></i>En cours <i style="background:${C.blue}"></i>À faire</p></div>` : '<p class="mut">À compléter.</p>', { brk: true });
  const rk = (S.risks || []).filter(r => r.risque);
  const s11 = sec('11', 'Risques', rk.length ? `<div class="fig">${riskMatrix(rk)}</div>${tb(['N°', 'Risque', 'Criticité', 'Plan d\'atténuation'], rk.map((r, k) => { const c = N(r.p) * N(r.i); return `<tr><td>${k + 1}</td><td><b>${X(r.risque)}</b><br><span class="mut small">${X(r.cat || '')}</span></td><td class="n"><span class="crit c${c >= 6 ? 3 : c >= 3 ? 2 : 1}">${c}</span></td><td>${X(r.plan || '')}</td></tr>`; }), 'tsmall')}` : '<p class="mut">À compléter.</p>');

  const rubLabels = ['Achats revendus', 'Achats consommés', 'Charges externes', 'Impôts et taxes', 'Personnel', 'Autres'];
  const s12 = sec('12', 'Prévisions financières', `<h3>Principales hypothèses</h3><div class="facts">${[['Démarrage du plan', mLong(1)], ['Premières ventes', mLong(R.salesStart)], ['Inflation', pc(N(S.hyp.inflation))], ['Délai clients', N(S.hyp.delaiClient) + ' jours'], ['Délai fournisseurs', N(S.hyp.delaiFourn) + ' jours'], ['Régime fiscal An 1', R.flags.fAE[0] ? 'IR libératoire' : R.flags.fIS[0] ? 'IS + TVA' : 'Exonéré'], ['Impayés clients', pc(N(S.hyp.impayes), 1) + ' des ventes'], ['Prime d\'ancienneté', S.hyp.anciennete === 'Non' ? 'Non appliquée' : 'Appliquée (Code du travail)'], ['TVA sur les ventes', 'Exigible à l\'encaissement']].map(([k, v]) => `<div><small>${k}</small><b>${X(v)}</b></div>`).join('')}</div>
   <h3>Compte de produits et charges</h3>${tb(['Rubrique (CGNC)', ...Y], [rw('Chiffre d\'affaires', P.ca, 'tot'), rw('Subventions d\'exploitation', P.sexp), ...E.RUB.map((r, i) => rw(r, R.rub[i])), rw('Dotations aux amortissements', P.dot), rw('Résultat d\'exploitation', P.rex, 'tot'), rw('Charges financières', P.int), rw('Résultat non courant', P.rnc), rw('Impôts sur les résultats', P.impot), rw('Résultat net', P.rn, 'grand'), rw('Excédent brut d\'exploitation', P.ebe), rw('Capacité d\'autofinancement', P.caf), rw('Seuil de rentabilité (CA)', P.sr)], 'tfin')}
   <div class="two"><div class="fig"><h4>Structure des charges — ${X(Y[0])}</h4>${donut({ items: [...R.rub.map((r, i) => ({ label: rubLabels[i], value: r[0], color: PAL[i] })), { label: 'Amortissements', value: P.dot[0], color: C.grey }] })}</div><div class="fig"><h4>Structure des charges — ${X(Y[2])}</h4>${donut({ items: [...R.rub.map((r, i) => ({ label: rubLabels[i], value: r[2], color: PAL[i] })), { label: 'Amortissements', value: P.dot[2], color: C.grey }] })}</div></div>
   <div class="fig brk-before"><h4>Trésorerie en fin de mois sur 36 mois</h4>${line({ labels: months, series: [{ name: 'Trésorerie', color: C.blue, values: Cc.fin.slice(1, 37), fill: true }], refs: N(S.hyp.coussin) ? [{ name: 'Coussin de sécurité', value: N(S.hyp.coussin), color: C.amber }] : [] })}</div>
   <h3>Plan de trésorerie (synthèse annuelle)</h3>${tb(['Flux (TTC)', ...Y], [rw('Encaissements des ventes', [0, 1, 2].map(y => sum(Cc.encVentes.slice(y * 12 + 1, y * 12 + 13)))), rw('Apports, subventions et emprunts', [0, 1, 2].map(y => sum(Cc.encApports.slice(y * 12 + 1, y * 12 + 13)) + sum(Cc.encSubv.slice(y * 12 + 1, y * 12 + 13)) + sum(Cc.encEmp.slice(y * 12 + 1, y * 12 + 13)))), rw('Décaissements d\'exploitation', [0, 1, 2].map(y => sum(['decVar', 'decFix', 'decPon', 'decMkt', 'decNet', 'decExt', 'decSoc', 'decIr', 'decTva', 'decImpot'].map(k => sum(Cc[k].slice(y * 12 + 1, y * 12 + 13)))))), rw('Investissements', [0, 1, 2].map(y => sum(Cc.decInv.slice(y * 12 + 1, y * 12 + 13)))), rw('Remboursements et intérêts', [0, 1, 2].map(y => sum(Cc.decCap.slice(y * 12 + 1, y * 12 + 13)) + sum(Cc.decInt.slice(y * 12 + 1, y * 12 + 13)))), rw('Trésorerie en fin d\'année', [12, 24, 36].map(k => Cc.fin[k]), 'grand'), rw('Trésorerie la plus basse', Cc.minY)], 'tfin')}
   <h3>Bilan prévisionnel</h3>${tb(['', 'Début', ...Y.map(y => 'Fin ' + y)], [rw('Actif immobilisé net', B.map(b => b.actifImmo)), rw('Stocks', B.map(b => b.stocks)), rw('Créances clients', B.map(b => b.clients)), rw('Autres actifs circulants', B.map(b => b.etatDeb + b.regulA)), rw('Trésorerie', B.map(b => b.tresoA)), rw('Total actif', B.map(b => b.totalActif), 'tot'), rw('Capitaux propres', B.map(b => b.cp)), rw('Subventions d\'investissement', B.map(b => b.subv)), rw('Dettes de financement', B.map(b => b.dettesFin)), rw('Dettes fournisseurs, sociales et fiscales', B.map(b => b.passifCirc)), rw('Découvert', B.map(b => b.tresoP)), rw('Total passif', B.map(b => b.totalPassif), 'tot')], 'tfin')}
   <h3>Ratios clés</h3>${tb(['Indicateur', ...Y], [rw('Croissance du CA', K.growth, '', v => pc(v, 0)), rw('Taux de marge sur coûts variables', K.gm, '', v => pc(v)), rw('Taux d\'EBE', K.tebe, '', v => pc(v)), rw('Marge nette', K.marge, '', v => pc(v)), rw('BFR (DH)', K.bfr), rw('Autonomie financière', K.autonomie, '', v => pc(v, 0)), rw('Endettement (dettes / capitaux propres)', K.gearing, '', v => fmt(v, 2)), rw('MRR en fin d\'année (DH)', K.mrr), rw('LTV / CAC', K.ltvCac, '', v => fmt(v, 1))], 'tfin')}`, { brk: true });

  const s13 = sec('13', 'Scénarios et sensibilité', `<div class="fig"><h4>Trésorerie selon le scénario</h4>${line({ labels: months, series: scen.map((r, i) => ({ name: SC[i], color: [C.red, C.blue, C.green][i], values: r.C.fin.slice(1, 37), width: i === 1 ? 2.6 : 1.6 })) })}</div>
   ${tb(['Indicateur', ...SC], [rw('CA année 1', scen.map(r => r.P.ca[0])), rw('CA année 3', scen.map(r => r.P.ca[2])), rw('EBE année 3', scen.map(r => r.P.ebe[2])), rw('Résultat net année 3', scen.map(r => r.P.rn[2])), rw('Résultat net cumulé', scen.map(r => r.P.rn[0] + r.P.rn[1] + r.P.rn[2])), rw('Trésorerie la plus basse', scen.map(r => r.C.min)), rw('Fonds à lever en plus', scen.map(r => r.C.fonds)), `<tr><td>Point mort opérationnel</td>${scen.map(r => `<td class="n">${r.C.pointMort ? mLong(r.C.pointMort) : 'non atteint'}</td>`).join('')}</tr>`], 'tfin')}`, { brk: true });


  let s14 = '';
  if (typeof CF !== 'undefined') {
    const pf = CF.profile(), ms = CF.measures(pf).filter(m => m.tag !== 'rappel' && m.ok !== false), cl = CF.checklist(pf), lg = S.legal || {};
    const pay = k => [0, 1, 2].map(y => CF.ysum(Cc[k], y));
    const st = CF.structures();
    s14 = sec('14', 'Conformité et loi de finances 2026', `<h3>Régime fiscal et social</h3>${tb(['', ...Y], [`<tr><td>Statut</td>${R.flags.stat.map(v => `<td class="n">${X(v)}</td>`).join('')}</tr>`, rw('Impôt sur le résultat (IS ou IR)', [0, 1, 2].map(y => P.is[y] + P.aeIr[y])), rw('Contribution sociale de solidarité', P.css), rw('TVA nette versée', pay('decTva')), rw('Cotisations CNSS et AMO', pay('decSoc')), rw('IR retenu sur les salaires', pay('decIr')), rw('Total versé à l\'État et à la CNSS', [0, 1, 2].map(y => ['decTva', 'decSoc', 'decIr', 'decImpot'].reduce((a, k) => a + CF.ysum(Cc[k], y), 0)), 'grand')], 'tfin')}
     <div class="fig"><h4>Paiements fiscaux et sociaux par année</h4>${stacked({ labels: Y, series: [{ name: 'TVA', values: pay('decTva') }, { name: 'CNSS et AMO', values: pay('decSoc') }, { name: 'IR salaires', values: pay('decIr') }, { name: 'IS, CSS, IR auto-entrepreneur', values: pay('decImpot') }] })}</div>
     ${ms.length ? `<h3>Mesures de la loi de finances 2026 qui concernent le projet</h3>${tb(['Mesure', 'Ce que cela change pour le projet'], ms.map(m => `<tr><td><b>${X(m.t)}</b><br><span class="mut small">${X(m.when)}</span></td><td>${X(m.impact)}</td></tr>`), 'tsmall')}` : ''}
     ${st.length > 1 ? `<h3>Impact d'un changement de structure</h3>${tb(['Structure', 'Impôts 3 ans', 'Cotisations', 'TVA versée', 'Résultat net cumulé', 'Tréso. au plus bas'], st.map((r, i) => `<tr class="${i === 0 ? 'tot' : ''}"><td><b>${X(r.name)}</b>${r.notes.length ? `<br><span class="mut small">${X(r.notes.map(n => n.t).join(' · '))}</span>` : ''}</td><td class="n">${fmt(r.impots)}</td><td class="n">${fmt(r.soc)}</td><td class="n">${fmt(r.tva)}</td><td class="n">${fmt(r.rn)}</td><td class="n">${fmt(r.min)}</td></tr>`), 'tsmall tst')}` : ''}
     <h3>Échéances légales</h3>${tb(['Obligation', 'Échéance'], CF.DEADLINES.map(d => `<tr><td>${X(d[0])}</td><td>${X(d[1])}</td></tr>`), 'tsmall')}
     <h3>Check-list de conformité (${cl.filter(c => lg[c.k]).length} sur ${cl.length})</h3><div class="cl2">${cl.map(c => `<div class="${lg[c.k] ? 'on' : ''}"><span>${lg[c.k] ? '✓' : '○'}</span>${X(c.t)}</div>`).join('')}</div>
     <p class="mut small">Synthèse établie à partir de la loi de finances n° 50-25 pour 2026 et des règles en vigueur. Elle ne remplace pas l'avis d'un expert-comptable.</p>`, { brk: true });
  }
  const s15 = sec('15', 'Besoins et ressources de financement', `<div class="two"><div>${tb(['Besoins (3 ans)', 'DH'], [`<tr><td>Investissements (HT)</td><td class="n">${fmt(totInv)}</td></tr>`, `<tr><td>Besoin en fonds de roulement (an 3)</td><td class="n">${fmt(Math.max(0, K.bfr[2]))}</td></tr>`, `<tr><td>Pertes d'exploitation à couvrir</td><td class="n">${fmt(Math.max(0, -sum(P.rn.map(v => Math.min(0, v)))))}</td></tr>`, `<tr class="tot"><td>Point bas de trésorerie</td><td class="n">${fmt(Cc.min)}</td></tr>`])}</div>
   <div class="fig">${totRes ? donut({ items: [{ label: 'Capital et levées', value: resources.cap, color: C.navy }, { label: 'Comptes courants', value: resources.cca, color: C.teal }, { label: 'Subventions et dons', value: resources.sub, color: C.green }, { label: 'Emprunts', value: resources.emp, color: C.blue }] }) : '<p class="mut">Aucune ressource saisie.</p>'}</div></div>
   ${tb(['Source', 'Nature', 'Date', 'Montant (DH)'], (S.fin || []).map(f => `<tr><td><b>${X(f.source)}</b></td><td>${X(f.nature || '')}</td><td>${X(f.date || '')}</td><td class="n">${fmt(N(f.montant))}</td></tr>`).concat((S.loans || []).map(l => `<tr><td><b>${X(l.type)}</b></td><td>Emprunt ${X(l.preteur || '')} · ${pc(N(l.taux))} · ${N(l.duree)} mois${N(l.differe) ? ' · différé ' + N(l.differe) + ' mois' : ''}</td><td>${X(l.date || '')}</td><td class="n">${fmt(N(l.montant))}</td></tr>`)).concat([`<tr class="grand"><td colspan="3">Total des ressources</td><td class="n">${fmt(totRes)}</td></tr>`]), 'tsmall')}
   ${typeof CAP !== 'undefined' ? (() => { const c = CAP.compute(); if (!c.rounds.length) return ''; return `<h3>Levées de fonds et dilution</h3>${tb(['Levée', 'Date', 'Montant', 'Pré-money', 'Post-money', 'Part cédée', 'Fondateurs'], c.rounds.map(r => `<tr><td><b>${X(r.nom)}</b></td><td>${X(r.date || '')}</td><td class="n">${fmt(r.amt)}</td><td class="n">${fmt(r.pre)}</td><td class="n">${fmt(r.post)}</td><td class="n">${pc(r.share, 1)}</td><td class="n">${pc(r.fAfter, 1)}</td></tr>`), 'tsmall tst')}
     <div class="two"><div class="fig"><h4>Répartition du capital à la fin du plan</h4>${donut({ items: c.holders.map((h, k) => ({ label: h.nom.length > 26 ? h.nom.slice(0, 25) + '…' : h.nom, value: h.pct * 1000, color: PAL[k % 10] })) }).replace(/>[\d\s,]+ ?[kM]?<\/text><text[^>]*>DH<\/text>/, '>100 %</text>')}</div>
     <div>${tb(['Indicateur', 'Valeur'], [`<tr><td>Multiple de CA retenu</td><td class="n">×${fmt(c.mCA, 1)}</td></tr>`, `<tr><td>Valeur d'entreprise (CA ${X(Y[2])} × multiple)</td><td class="n">${fmt(c.vCA)}</td></tr>`, `<tr><td>Valeur des titres (− dettes + trésorerie)</td><td class="n">${fmt(c.eqCA)}</td></tr>`].concat(c.holders.filter(h => h.kind === 'i').map(h => `<tr><td>${X(h.nom)} : multiple et rendement annuel</td><td class="n">×${fmt(h.moic, 1)} · ${pc(h.irr, 0)}</td></tr>`)), 'tsmall')}</div></div>
     <p class="mut small">Valorisation indicative par multiple, utile pour préparer une négociation. Elle ne remplace pas une évaluation professionnelle.</p>`; })() : ''}
   <div class="note ${Cc.fonds ? 'warn' : 'ok'}">${Cc.fonds ? `Avec ces ressources, la trésorerie devient négative en ${mLong(Cc.minM)} : il manque <b>${dh(Cc.fonds)}</b> pour couvrir le besoin.` : `Avec ces ressources, la trésorerie reste positive sur les 36 mois (point bas de ${dh(Cc.min)} en ${mLong(Cc.minM)}).`}</div>`);

  return [cover, toc, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15].join('');
}

const CSS = `@page{size:A4;margin:16mm 14mm 18mm}
@page{@bottom-left{content:"${'PlanBiz'}";font:9px Helvetica,Arial,sans-serif;color:#8A97AB}@bottom-right{content:counter(page) " / " counter(pages);font:9px Helvetica,Arial,sans-serif;color:#8A97AB}}
@page :first{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#0B1526;font-size:10.5pt;line-height:1.45;background:#E9EDF2}
.page{max-width:210mm;margin:0 auto;background:#fff}
.bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;align-items:center;justify-content:center;padding:10px;background:#0A2540;color:#fff;font-size:13px}
.bar button{font:inherit;padding:8px 16px;border-radius:6px;border:0;background:#1652F0;color:#fff;font-weight:600;cursor:pointer}.bar button.g{background:transparent;border:1px solid #47607F}
.cover{height:297mm;background:#0A2540 linear-gradient(160deg,#0A2540 0%,#0D2D52 55%,#123A6B 100%);color:#fff;padding:22mm 18mm 18mm;display:flex;flex-direction:column;page-break-after:always}
.cv-top{display:flex;align-items:center;gap:10px;font-weight:700;font-size:15pt}.cv-logo{width:34px;height:34px;padding:5px;border-radius:7px;background:rgba(255,255,255,.12)}.cv-logo svg{width:100%;height:100%}
.cv-mid{margin-top:auto}.cv-eb{text-transform:uppercase;letter-spacing:.12em;font-size:9.5pt;color:#8FB1FF;font-weight:700;margin:0}
.cover h1{font-size:40pt;line-height:1.05;margin:8px 0 10px;letter-spacing:-.02em}.cv-sl{font-size:15pt;color:#C7D8FF;margin:0 0 14px}.cv-pitch{font-size:11.5pt;color:#B5C4D9;max-width:150mm;margin:0}
.cv-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18mm 0 10mm}.cv-kpis .kp{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#fff}.cv-kpis .kp small{color:#8DA1BC}.cv-kpis .kp b{color:#fff}
.cv-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 18px;border-top:1px solid rgba(255,255,255,.18);padding-top:8mm}.cv-meta small{display:block;color:#8DA1BC;font-size:8.5pt;text-transform:uppercase;letter-spacing:.06em}.cv-meta b{font-size:10.5pt}
.sec{padding:0 14mm 4mm}.sec.brk{page-break-before:always;break-before:page}.brk-before{break-before:page;page-break-before:always}
h2{font-size:18pt;margin:10mm 0 5mm;padding-bottom:3mm;border-bottom:2px solid #0A2540;display:flex;gap:10px;align-items:baseline;break-after:avoid}h2 span{font-size:11pt;color:#1652F0;font-weight:700}
.toc-h{border:0}.toc{columns:2;font-size:12pt;line-height:2.1;padding-left:22px}.toc li::marker{color:#1652F0;font-weight:700}
h3{font-size:12pt;margin:6mm 0 2mm;color:#0A2540;break-after:avoid}h4{font-size:10pt;margin:0 0 2mm;color:#4F5D73;text-transform:uppercase;letter-spacing:.05em}h5{margin:0 0 4px;font-size:10.5pt;color:#0A2540}
p{margin:0 0 2.5mm}.lead{font-size:12pt;color:#0A2540;font-weight:600}.mut{color:#6B7A90}.small{font-size:8.5pt}
ul,ol{margin:0 0 3mm;padding-left:18px}li{margin-bottom:1mm}
.kgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:4mm 0}.kp{border:1px solid #DDE3EB;border-radius:6px;padding:3mm 3.5mm;break-inside:avoid}.kp small{display:block;font-size:7.8pt;text-transform:uppercase;letter-spacing:.06em;color:#4F5D73}.kp b{display:block;font-size:15pt;margin:1mm 0;font-variant-numeric:tabular-nums}.kp span{font-size:8.5pt;color:#6B7A90}.kp.pos b{color:#0E8A5F}.kp.neg b{color:#C4321C}
.fig{border:1px solid #DDE3EB;border-radius:6px;padding:3.5mm;margin:4mm 0;break-inside:avoid}.fig svg{display:block;font-family:Helvetica,Arial,sans-serif}
.two{display:grid;grid-template-columns:1fr 1fr;gap:4mm}.two .fig{margin:2mm 0}
table{width:100%;border-collapse:collapse;margin:2mm 0 4mm;font-size:9pt;break-inside:auto}thead{display:table-header-group}tr{break-inside:avoid}
th{background:#0A2540;color:#fff;text-align:left;padding:2mm 2.2mm;font-size:8pt;text-transform:uppercase;letter-spacing:.04em;font-weight:600}td{padding:1.7mm 2.2mm;border-bottom:1px solid #E6EAF0;vertical-align:top}
tbody tr:nth-child(even) td{background:#F6F8FB}.n{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}th.n{text-align:right}
tr.tot td{font-weight:700;background:#EAF0FA!important}tr.grand td{font-weight:700;border-top:1.5px solid #0A2540;background:#DCE7FB!important}
.tsmall{font-size:8.5pt}.toff,.tst{table-layout:fixed}.tst th:first-child{width:30%}.tst th.n{white-space:normal}.toff th:first-child{width:44%}.toff td,.toff th{padding-left:1.6mm;padding-right:1.6mm}.tfin td:first-child{width:42%}
.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm;margin:2mm 0 3mm}.facts div{background:#F6F8FB;border-radius:5px;padding:2.5mm 3mm}.facts small{display:block;font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#6B7A90}.facts b{font-size:9.5pt}
.quote{border-left:3px solid #1652F0;background:#F3F6FD;padding:3mm 4mm;margin:2.5mm 0;font-size:10.5pt}.quote small{display:block;font-size:7.8pt;text-transform:uppercase;letter-spacing:.08em;color:#1652F0;font-weight:700;margin-bottom:1mm}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:3mm}.pcard{border:1px solid #DDE3EB;border-radius:6px;padding:3mm;font-size:9pt;break-inside:avoid}.pcard b{display:block;font-size:10.5pt}.pcard small{color:#6B7A90}.pcard p{margin:1.5mm 0 0}.pcard .q{font-style:italic;color:#0A2540}
.bmc{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5mm;font-size:8.5pt}.bk{border:1px solid #DDE3EB;border-radius:5px;padding:2.5mm;break-inside:avoid}.bk h5{font-size:9pt;color:#1652F0}.bk ul{padding-left:14px;margin:0 0 1.5mm}.bk p{color:#4F5D73;margin:0}
.pestel{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.pb{border:1px solid #DDE3EB;border-top:3px solid #0A2540;border-radius:5px;padding:3mm;font-size:9pt;break-inside:avoid}.pb ul{list-style:none;padding:0}.sg{display:inline-block;width:14px;font-weight:700;color:#6B7A90}.sg.pos{color:#0E8A5F}.sg.neg{color:#C4321C}
.swot{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.sw{border-radius:6px;padding:3.5mm;font-size:9.5pt;break-inside:avoid}.sw.s{background:#E3F5EE}.sw.w{background:#FDF1E2}.sw.o{background:#E7EEFF}.sw.t{background:#FCE8E5}
.crit{display:inline-block;min-width:22px;text-align:center;border-radius:10px;padding:0 6px;font-weight:700}.c3{background:#F6D2CC;color:#8A1F10}.c2{background:#FBE6C8;color:#7A4306}.c1{background:#D6EFE3;color:#0B5E40}
.legend{font-size:8.5pt;color:#4F5D73;margin:2mm 0 0}.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 12px;vertical-align:-1px}
.note{border-radius:6px;padding:3mm 4mm;background:#F3F6FD;font-size:9.5pt;margin:4mm 0}.note.warn{background:#FCE8E5;color:#8A1F10}.note.ok{background:#E3F5EE;color:#0B5E40}
.cl2{display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 5mm;font-size:9pt}.cl2 div{display:flex;gap:2mm;break-inside:avoid}.cl2 span{color:#8A97AB;font-weight:700}.cl2 .on span{color:#0E8A5F}
.foot{padding:8mm 14mm;font-size:8.5pt;color:#6B7A90}
@media screen{.page{box-shadow:0 4px 30px rgba(0,0,0,.12);margin:20px auto}.cover{height:auto;min-height:297mm}.sec.brk{border-top:10px solid #E9EDF2;padding-top:2mm}}
@media print{body{background:#fff}.bar{display:none}.page{max-width:none;margin:0;box-shadow:none}}`;

function html(opts = {}) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Business plan — ${X(S.id.nom || '')}</title><style>${CSS}</style></head><body>
  <div class="bar"><span>Aperçu du rapport · choisis « Enregistrer au format PDF » dans la fenêtre d'impression</span><button onclick="print()">Imprimer / PDF</button><button class="g" onclick="window.close()">Fermer</button></div>
  <div class="page">${build()}<p class="foot">Document généré avec PlanBiz le ${new Date().toLocaleDateString('fr-FR')} · modèle de calcul Business Plan V4.1 · règles fiscales et sociales marocaines 2026. Les prévisions reposent sur les hypothèses saisies par le porteur de projet.</p></div>
  ${opts.autoprint ? '<script>window.addEventListener("load",()=>setTimeout(()=>print(),500))<\/script>' : ''}</body></html>`;
}
window.PBReport = { html, build };
// rich report for the .html download too
expHtml = function () { saveFile(`${slug()}-business-plan.html`, html()); };
})();
