/* ================= Pitch deck généré depuis le business plan ================= */
const PITCH = (() => {
  const PPTX_URL = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
  const X = s => esc(String(s ?? ''));
  const sum = a => a.reduce((x, y) => x + y, 0);
  const cut = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); if (t.length <= n) return t; const s = t.slice(0, n); const p = Math.max(s.lastIndexOf('. '), s.lastIndexOf(' ; ')); return (p > n * 0.5 ? s.slice(0, p + 1) : s.slice(0, s.lastIndexOf(' ')) + '…'); };
  const sentences = (t, n = 3, max = 260) => String(t || '').split(/(?<=[.!?;])\s+|\n+/).map(x => x.replace(/^[-•\s]+/, '').trim()).filter(x => x.length > 3).slice(0, n).map(x => cut(x, max));
  const P_ = () => S.pitch || (S.pitch = { accroche: '', ask: '', traction: '', contact: '' });

  /* ---- content model (shared by HTML and PowerPoint) ---- */
  function model() {
    const P = R.P, C = R.C, K = R.K, m = S.market || {}, pt = P_();
    const Y = [0, 1, 2].map(yrLab);
    const cap = typeof CAP !== 'undefined' ? CAP.compute() : null;
    const raise = (S.fin || []).filter(f => (f.nature || '').startsWith('Capital') && N(f.montant) > 0 && /angel|fonds|vc|seed|série|serie|levée|investisseur/i.test(f.source || '')).sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
    const ask = N(pt.ask) || (raise ? N(raise.montant) : Math.max(C.fonds, 0));
    const pre = raise && N(raise.premoney) ? N(raise.premoney) : null;
    const win = 18, sl = (a) => sum(a.slice(1, win + 1));
    const uses = [
      { label: 'Équipe', value: sl(C.decNet) + sl(C.decSoc) + sl(C.decIr) },
      { label: 'Marketing et ventes', value: sl(C.decMkt) },
      { label: 'Investissements', value: sl(C.decInv) },
      { label: 'Fonctionnement', value: sl(C.decFix) + sl(C.decPon) + sl(C.decExt) },
      { label: 'Production et achats', value: sl(C.decVar) }
    ].filter(u => u.value > 1);
    const offers = K.offerCA.filter(o => o.ca.some(Boolean)).sort((a, b) => b.ca[2] - a.ca[2]);
    const rev = (S.bmc || []).find(b => /revenus/i.test(b.bloc));
    const acteurs = ['Nous', ...(m.acteurs || [])].slice(0, 5), crit = m.criteres || [];
    const scores = acteurs.map((_, j) => sum(crit.map(c => N((c.notes || [])[j]))));
    const done = (S.plan || []).filter(p => p.statut === 'Fait').map(p => p.action);
    return {
      Y, ask, pre, uses, offers, scores, acteurs,
      cover: { nom: S.id.nom || 'Mon projet', slogan: S.id.slogan || '', accroche: pt.accroche || cut(S.id.pitch, 240), porteurs: S.id.porteurs || '', lieu: [S.id.ville, 'Maroc'].filter(Boolean).join(', ') },
      probleme: sentences(m.probleme, 3), solution: sentences(m.solution, 3), valeur: cut(m.valeur, 230), avantage: sentences(m.avantage, 3),
      marche: { zone: (typeof MENA !== 'undefined' ? MENA.current() : null), tam: K.tam[2], sam: K.sam[2], som: K.som[2], segments: (m.segments || []).slice(0, 6), tendances: cut(m.tendances, 260), pourquoi: cut(m.pourquoi, 150) },
      revenus: rev && rev.choix && rev.choix.length ? rev.choix.slice(0, 5) : offers.slice(0, 4).map(o => o.nom),
      traction: pt.traction ? sentences(pt.traction, 4, 120) : done.slice(0, 4).map(x => cut(x, 90)), next: (S.plan || []).filter(p => p.statut !== 'Fait' && p.action).sort((a, b) => String(a.debut).localeCompare(String(b.debut))).slice(0, 4).map(p => ({ a: cut(p.action, 70), d: String(p.debut || '').slice(0, 7) })),
      gtm: { pos: cut(S.mkt && S.mkt.positionnement, 160), canaux: ((S.mkt && S.mkt.canaux) || []).filter(c => c.canal).sort((a, b) => N(b.budget[0]) - N(a.budget[0])).slice(0, 5).map(c => ({ c: c.canal, b: N(c.budget[0]) * 12 })) },
      team: (S.founders || []).filter(f => f.nom).slice(0, 5).map(f => ({ nom: f.nom, role: f.role || '', comp: cut(f.comp, 95) })),
      fin: { ca: P.ca, ebe: P.ebe, rn: P.rn, min: C.min, pm: C.pointMort, marge: K.gm[2], ltvCac: K.ltvCac[2] },
      dilution: cap && cap.rounds.length ? cap.rounds[0] : null,
      contact: pt.contact || [S.id.email, S.id.tel, S.id.web].filter(Boolean).join(' · ')
    };
  }

  /* ---- HTML slides ---- */
  const CH = () => (window.PBReport && PBReport.charts) || null;
  function slides(M) {
    const ch = CH(), out = [];
    const S_ = (cls, title, body, n) => `<section class="sl ${cls}"><div class="sl-in">${title ? `<header><span class="sl-n">${String(n).padStart(2, '0')}</span><h2>${title}</h2></header>` : ''}${body}</div><footer><span>${X(M.cover.nom)}</span><span>${n}</span></footer></section>`;
    const li = a => a.length ? `<ul>${a.map(x => `<li>${X(x)}</li>`).join('')}</ul>` : '<p class="mut">À compléter dans PlanBiz.</p>';
    let n = 0;
    out.push(`<section class="sl cover"><div class="sl-in"><p class="eb">Pitch · ${X(M.Y[0])} – ${X(M.Y[2])}</p><h1>${X(M.cover.nom)}</h1>${M.cover.slogan ? `<p class="slg">${X(M.cover.slogan)}</p>` : ''}<p class="acc">${X(M.cover.accroche)}</p>
      <div class="cv-b"><div><small>Nous recherchons</small><b>${kdh(M.ask)}</b></div><div><small>CA visé en ${X(M.Y[2])}</small><b>${kdh(M.fin.ca[2])}</b></div><div><small>Équipe</small><b>${X(cut(M.cover.porteurs, 60) || '—')}</b></div></div></div></section>`); n++;
    out.push(S_('', 'Le problème', M.marche.tendances ? `<div class="two"><div class="big">${li(M.probleme)}</div><div class="hl"><small>Le contexte</small><p>${X(M.marche.tendances)}</p></div></div>` : `<div class="big">${li(M.probleme)}</div>`, ++n));
    out.push(S_('', 'Notre solution', `<div class="two"><div class="big">${li(M.solution)}</div><div class="hl"><small>Proposition de valeur</small><p>${X(M.valeur || '—')}</p></div></div>`, ++n));
    out.push(S_('', 'Le marché', `<div class="two"><div>${M.marche.tam ? `<div class="fun">${[['TAM', M.marche.tam, 'marché total', '#0A2540', 100], ['SAM', M.marche.sam, 'marché accessible', '#1652F0', 76], ['SOM', M.marche.som, 'part visée en ' + M.Y[2], '#0E8A5F', 52]].map(([k, v, t, c, w]) => `<div style="width:${w}%;background:${c}"><b>${k} · ${kdh(v)}</b><small>${X(t)}</small></div>`).join('')}</div>` : '<p class="mut">Renseigne TAM, SAM et SOM dans « Marché ».</p>'}</div><div>${M.marche.segments.length ? `<p class="lbl">Clients visés</p><p class="tags">${M.marche.segments.map(s => `<span>${X(s)}</span>`).join('')}</p>` : ''}${M.marche.pourquoi ? `<p class="lbl">Pourquoi maintenant</p><p>${X(M.marche.pourquoi)}</p>` : ''}${M.marche.zone && M.marche.zone.s ? `<p class="lbl">Repère ${X(M.marche.zone.zone === 'Maroc' ? 'Maroc' : M.marche.zone.zone)}</p><p>${X(M.marche.zone.zone === 'Maroc' ? M.marche.zone.s.ma : M.marche.zone.s.mena)} · ${X(M.marche.zone.s.g)}</p>` : ''}</div></div>`, ++n));
    out.push(S_('', 'Nos offres', `<div class="cards3">${M.offers.slice(0, 6).map(o => `<div class="oc"><b>${X(cut(o.nom, 60))}</b><span>${fmt(o.prix[0])} DH</span><small>${X(cut(o.cible, 70))}</small></div>`).join('') || '<p class="mut">Ajoute tes offres dans « Produits & charges ».</p>'}</div>`, ++n));
    out.push(S_('', 'Business model', `<div class="two"><div><p class="lbl">Sources de revenus</p>${li(M.revenus.map(x => cut(x, 80)))}<p class="lbl">Marge sur coûts variables en ${X(M.Y[2])}</p><p class="kpi">${pc(M.fin.marge, 0)}</p></div><div>${ch && M.offers.length ? ch.stacked({ labels: M.Y, series: M.offers.slice(0, 6).map(o => ({ name: o.nom, values: o.ca })), w: 560, h: 320 }) : ''}</div></div>`, ++n));
    out.push(S_('', 'Traction et prochaines étapes', `<div class="two"><div><p class="lbl">Déjà réalisé</p>${li(M.traction)}</div><div><p class="lbl">Prochains jalons</p>${M.next.length ? `<ol class="tl">${M.next.map(x => `<li><b>${X(x.d)}</b>${X(x.a)}</li>`).join('')}</ol>` : '<p class="mut">À compléter dans le plan d\'actions.</p>'}</div></div>`, ++n));
    out.push(S_('', 'Concurrence', `<div class="two"><div>${ch && M.scores.some(Boolean) ? ch.hbars({ items: M.acteurs.map((a, j) => ({ label: a, value: M.scores[j], color: j ? '#8A97AB' : '#1652F0', text: String(M.scores[j]) })), w: 560, unit: '' }) : '<p class="mut">Remplis la grille de comparaison dans « Marché ».</p>'}</div><div><p class="lbl">Notre avantage</p>${li(M.avantage)}</div></div>`, ++n));
    out.push(S_('', 'Go-to-market', `<div class="two"><div>${M.gtm.pos ? `<div class="hl"><small>Positionnement</small><p>${X(M.gtm.pos)}</p></div>` : ''}</div><div><p class="lbl">Canaux prioritaires (budget an 1)</p>${M.gtm.canaux.length ? `<table>${M.gtm.canaux.map(c => `<tr><td>${X(c.c)}</td><td class="n">${kdh(c.b)}</td></tr>`).join('')}</table>` : '<p class="mut">À compléter dans « Communication ».</p>'}</div></div>`, ++n));
    out.push(S_('', 'L\'équipe', `<div class="team">${M.team.map(t => `<div><span class="av">${X(t.nom.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span><b>${X(t.nom)}</b><small>${X(t.role)}</small><p>${X(t.comp)}</p></div>`).join('') || '<p class="mut">Présente l\'équipe dans « Équipe ».</p>'}</div>`, ++n));
    out.push(S_('', 'Prévisions financières', `<div class="two"><div>${ch ? ch.bars({ labels: M.Y, series: [{ name: 'Chiffre d\'affaires', color: '#1652F0', values: M.fin.ca }, { name: 'EBE', color: '#0A2540', values: M.fin.ebe }, { name: 'Résultat net', signColor: true, values: M.fin.rn }], w: 600, h: 330 }) : ''}</div><div class="kgrid">${[['CA ' + M.Y[2], kdh(M.fin.ca[2])], ['Résultat net ' + M.Y[2], kdh(M.fin.rn[2])], ['Point mort', M.fin.pm ? mLong(M.fin.pm) : 'non atteint'], ['Trésorerie au plus bas', kdh(M.fin.min)]].map(([a, b]) => `<div><small>${X(a)}</small><b>${X(b)}</b></div>`).join('')}</div></div>`, ++n));
    out.push(S_('', 'Notre besoin de financement', `<div class="two"><div><p class="ask">${kdh(M.ask)}</p>${M.pre ? `<p>sur une valorisation pré-money de <b>${kdh(M.pre)}</b>, soit ${pc(M.ask / (M.pre + M.ask), 0)} du capital</p>` : ''}<p class="lbl">Utilisation prévue sur 18 mois</p>${li(M.uses.map(u => `${u.label} : ${kdh(u.value)}`))}</div><div>${ch && M.uses.length ? ch.donut({ items: M.uses.map((u, k) => ({ label: u.label, value: u.value, color: ['#1652F0', '#0A2540', '#0E8A5F', '#B25E09', '#0F7C99'][k % 5] })) }) : ''}</div></div>`, ++n));
    out.push(`<section class="sl cover end"><div class="sl-in"><h1>Merci</h1><p class="acc">${X(M.cover.nom)}${M.cover.slogan ? ' · ' + X(M.cover.slogan) : ''}</p><p class="ct">${X(M.contact || '')}</p></div></section>`);
    return out;
  }
  const CSS = `*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sl{width:1280px;height:720px;position:relative;background:#fff;color:#0B1526;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;overflow:hidden}
  .sl-in{position:absolute;inset:56px 72px 64px}.sl header{display:flex;align-items:baseline;gap:16px;border-bottom:3px solid #0A2540;padding-bottom:14px;margin-bottom:30px}
  .sl h2{font-size:40px;margin:0;letter-spacing:-.01em}.sl-n{font-size:18px;font-weight:700;color:#1652F0}
  .sl footer{position:absolute;left:72px;right:72px;bottom:24px;display:flex;justify-content:space-between;font-size:13px;color:#8A97AB}
  .sl ul{margin:0;padding-left:26px}.sl li{margin:0 0 14px;font-size:22px;line-height:1.4}.big li{font-size:27px;margin-bottom:22px}
  .two{display:grid;grid-template-columns:1.05fr 1fr;gap:44px;align-items:start}.two svg{width:100%}
  .hl{background:#EEF3FE;border-left:5px solid #1652F0;border-radius:8px;padding:22px 26px}.hl small,.lbl{display:block;font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:#1652F0;font-weight:700;margin:0 0 10px}.hl p{font-size:24px;line-height:1.4;margin:0}
  .lbl{margin-top:8px}.mut{color:#8A97AB;font-size:20px}.kpi{font-size:56px;font-weight:800;color:#0A2540;margin:0}
  .tags span{display:inline-block;background:#F1F4F8;border-radius:999px;padding:6px 14px;margin:0 8px 10px 0;font-size:17px}
  .cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.oc{border:1px solid #DDE3EB;border-top:4px solid #1652F0;border-radius:10px;padding:18px}.oc b{display:block;font-size:20px;margin-bottom:8px}.oc span{display:block;font-size:26px;font-weight:800;color:#1652F0}.oc small{display:block;color:#4F5D73;font-size:15px;margin-top:6px}
  .fun div{margin:0 auto 14px;border-radius:10px;color:#fff;text-align:center;padding:18px 10px}.fun b{display:block;font-size:26px}.fun small{font-size:15px;opacity:.85}
  .tl{list-style:none;padding:0;margin:0;border-left:3px solid #1652F0}.tl li{position:relative;padding:0 0 18px 24px;font-size:20px}.tl li::before{content:"";position:absolute;left:-9px;top:6px;width:15px;height:15px;border-radius:50%;background:#1652F0}.tl b{display:block;font-size:14px;color:#1652F0}
  .team{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:22px}.team div{text-align:center}.av{display:inline-grid;place-items:center;width:84px;height:84px;border-radius:50%;background:#0A2540;color:#fff;font-size:28px;font-weight:700;margin-bottom:12px}.team b{display:block;font-size:21px}.team small{display:block;color:#1652F0;font-size:15px;margin:4px 0 8px}.team p{font-size:14.5px;color:#4F5D73;margin:0}
  .kgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.kgrid div{background:#F6F8FB;border-radius:10px;padding:18px}.kgrid small{display:block;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#4F5D73}.kgrid b{font-size:30px;color:#0A2540}
  .ask{font-size:84px;font-weight:800;color:#1652F0;margin:0 0 6px;letter-spacing:-.02em}.sl p{font-size:20px;line-height:1.45}
  .sl table{width:100%;border-collapse:collapse;font-size:20px}.sl td{padding:10px 4px;border-bottom:1px solid #E6EAF0}.sl td.n{text-align:right;font-weight:700}
  .cover{background:#0A2540 linear-gradient(150deg,#0A2540 0%,#0D2D52 60%,#123A6B 100%);color:#fff}.cover .sl-in{display:flex;flex-direction:column;justify-content:center}
  .cover .eb{text-transform:uppercase;letter-spacing:.14em;color:#8FB1FF;font-size:16px;font-weight:700;margin:0}.cover h1{font-size:88px;margin:10px 0;letter-spacing:-.02em;line-height:1}.cover .slg{font-size:30px;color:#C7D8FF;margin:0 0 18px}.cover .acc{font-size:22px;color:#B5C4D9;max-width:900px}
  .cv-b{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}.cv-b div{border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:16px 18px;background:rgba(255,255,255,.06)}.cv-b small{display:block;font-size:13px;color:#8DA1BC;text-transform:uppercase;letter-spacing:.06em}.cv-b b{font-size:24px}
  .end h1{font-size:110px}.end .ct{font-size:24px;color:#fff;margin-top:30px}`;

  function deckHTML(opts = {}) {
    const M = model(), sl = slides(M);
    const present = opts.present, grid = opts.grid;
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pitch — ${X(M.cover.nom)}</title><style>${CSS}
      @page{size:1280px 720px;margin:0}html,body{margin:0;background:#1d2633}
      .deck{display:flex;flex-direction:column;align-items:center;gap:24px;padding:24px 0}
      .pv .sl{display:none;position:absolute;left:50%;top:50%;transform-origin:center}.pv .sl.on{display:block}
      .bar{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:9;font:14px Helvetica,Arial,sans-serif}.bar button{border:0;border-radius:6px;padding:8px 14px;background:#fff;color:#0A2540;font-weight:600;cursor:pointer}.bar span{color:#fff;align-self:center;padding:0 8px}
      .gridm{background:#E9EDF2}.gridm .deck{display:flex;flex-wrap:wrap;flex-direction:row;justify-content:flex-start;gap:14px;padding:4px}.gridm .sl{zoom:.36;box-shadow:0 2px 12px rgba(0,0,0,.18);border-radius:10px}
      @media print{html,body{background:#fff}.deck{display:block;padding:0}.deck .sl{page-break-after:always;break-after:page;display:block!important;position:relative;transform:none!important;left:auto;top:auto}.bar{display:none}}</style></head>
      <body class="${present ? 'pv' : grid ? 'gridm' : ''}"><div class="deck">${sl.join('')}</div>
      ${present ? `<div class="bar"><button onclick="go(-1)">←</button><span id="pg"></span><button onclick="go(1)">→</button><button onclick="document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()">Plein écran</button><button onclick="print()">PDF</button></div>
      <script>var i=0,s=document.querySelectorAll('.sl');function fit(){var k=Math.min(innerWidth/1280,(innerHeight-60)/720);s.forEach(function(e){e.style.transform='translate(-50%,-50%) scale('+k+')'});}
      function go(d){s[i].classList.remove('on');i=Math.max(0,Math.min(s.length-1,i+d));s[i].classList.add('on');document.getElementById('pg').textContent=(i+1)+' / '+s.length;}
      s[0].classList.add('on');go(0);fit();addEventListener('resize',fit);addEventListener('keydown',function(e){if(['ArrowRight','PageDown',' '].includes(e.key))go(1);if(['ArrowLeft','PageUp'].includes(e.key))go(-1);});<\/script>` : (opts.autoprint ? '<script>addEventListener("load",function(){setTimeout(print,500)})<\/script>' : '')}</body></html>`;
  }

  /* ---- PowerPoint (native, editable) ---- */
  function loadPptx() { return new Promise((ok, ko) => { if (window.PptxGenJS) return ok(); const s = document.createElement('script'); s.src = PPTX_URL; s.onload = ok; s.onerror = () => ko(new Error('Chargement de PowerPoint impossible')); document.head.appendChild(s); }); }
  async function pptx() {
    await loadPptx();
    const M = model(), p = new PptxGenJS(); p.layout = 'LAYOUT_WIDE'; p.title = 'Pitch — ' + M.cover.nom;
    const NAVY = '0A2540', BLUE = '1652F0', GREY = '4F5D73', F = 'Arial';
    let n = 0;
    const base = (title) => { const s = p.addSlide(); s.background = { color: 'FFFFFF' }; n++; s.addText(String(n).padStart(2, '0'), { x: 0.6, y: 0.45, w: 0.7, h: 0.6, fontFace: F, fontSize: 16, bold: true, color: BLUE }); s.addText(title, { x: 1.2, y: 0.38, w: 11, h: 0.7, fontFace: F, fontSize: 30, bold: true, color: '0B1526' }); s.addShape(p.ShapeType.line, { x: 0.6, y: 1.12, w: 12.1, h: 0, line: { color: NAVY, width: 2 } }); s.addText(M.cover.nom, { x: 0.6, y: 7.0, w: 6, h: 0.3, fontFace: F, fontSize: 10, color: '8A97AB' }); return s; };
    const bullets = (s, arr, o) => s.addText(arr.length ? arr.map(t => ({ text: t, options: { bullet: true, breakLine: true } })) : [{ text: 'À compléter dans PlanBiz.', options: { color: '8A97AB' } }], { fontFace: F, fontSize: 18, color: '0B1526', paraSpaceAfter: 10, valign: 'top', ...o });
    const lbl = (s, t, o) => s.addText(t.toUpperCase(), { fontFace: F, fontSize: 11, bold: true, color: BLUE, charSpacing: 2, ...o });
    // cover
    let s = p.addSlide(); s.background = { color: NAVY }; n++;
    s.addText(`PITCH · ${M.Y[0]} – ${M.Y[2]}`, { x: 0.8, y: 1.2, w: 11, h: 0.4, fontFace: F, fontSize: 13, bold: true, color: '8FB1FF', charSpacing: 3 });
    s.addText(M.cover.nom, { x: 0.8, y: 1.7, w: 11.5, h: 1.3, fontFace: F, fontSize: 54, bold: true, color: 'FFFFFF' });
    if (M.cover.slogan) s.addText(M.cover.slogan, { x: 0.8, y: 3.0, w: 11.5, h: 0.6, fontFace: F, fontSize: 22, color: 'C7D8FF' });
    s.addText(M.cover.accroche || '', { x: 0.8, y: 3.7, w: 10.5, h: 1.1, fontFace: F, fontSize: 16, color: 'B5C4D9', valign: 'top' });
    [['NOUS RECHERCHONS', kdh(M.ask)], [`CA VISÉ EN ${M.Y[2].toUpperCase()}`, kdh(M.fin.ca[2])], ['ÉQUIPE', cut(M.cover.porteurs, 50) || '—']].forEach(([a, b], k) => { s.addShape(p.ShapeType.roundRect, { x: 0.8 + k * 3.9, y: 5.3, w: 3.7, h: 1.2, fill: { color: '163A63' }, line: { color: '2B4F7A' }, rectRadius: 0.08 }); s.addText([{ text: a, options: { fontSize: 10, color: '8DA1BC', breakLine: true } }, { text: b, options: { fontSize: 17, bold: true, color: 'FFFFFF' } }], { x: 0.95 + k * 3.9, y: 5.35, w: 3.5, h: 1.1, fontFace: F }); });
    // content slides
    s = base('Le problème'); if (M.marche.tendances) { bullets(s, M.probleme, { x: 0.8, y: 1.5, w: 6.4, h: 5, fontSize: 20 }); s.addShape(p.ShapeType.rect, { x: 7.6, y: 1.5, w: 5.1, h: 3.4, fill: { color: 'EEF3FE' }, line: { color: 'EEF3FE' } }); lbl(s, 'Le contexte', { x: 7.85, y: 1.65, w: 4.6, h: 0.35 }); s.addText(M.marche.tendances, { x: 7.85, y: 2.05, w: 4.6, h: 2.7, fontFace: F, fontSize: 16, color: '0B1526', valign: 'top' }); } else bullets(s, M.probleme, { x: 0.8, y: 1.5, w: 11.5, h: 5, fontSize: 22 });
    s = base('Notre solution'); bullets(s, M.solution, { x: 0.8, y: 1.5, w: 6.4, h: 5, fontSize: 20 }); s.addShape(p.ShapeType.rect, { x: 7.6, y: 1.5, w: 5.1, h: 3.2, fill: { color: 'EEF3FE' }, line: { color: 'EEF3FE' } }); lbl(s, 'Proposition de valeur', { x: 7.85, y: 1.65, w: 4.6, h: 0.35 }); s.addText(M.valeur || '—', { x: 7.85, y: 2.05, w: 4.6, h: 2.5, fontFace: F, fontSize: 17, color: '0B1526', valign: 'top' });
    s = base('Le marché'); if (M.marche.tam) { [['TAM', M.marche.tam, NAVY, 5.6], ['SAM', M.marche.sam, BLUE, 4.2], ['SOM', M.marche.som, '0E8A5F', 2.8]].forEach(([k, v, c, w], i) => { s.addShape(p.ShapeType.roundRect, { x: 0.8 + (5.6 - w) / 2, y: 1.6 + i * 1.3, w, h: 1.05, fill: { color: c }, line: { color: c }, rectRadius: 0.06 }); s.addText(`${k} · ${kdh(v)}`, { x: 0.8 + (5.6 - w) / 2, y: 1.6 + i * 1.3, w, h: 1.05, fontFace: F, fontSize: 17, bold: true, color: 'FFFFFF', align: 'center' }); }); }
    lbl(s, 'Clients visés', { x: 7.2, y: 1.6, w: 5.5, h: 0.35 }); bullets(s, M.marche.segments, { x: 7.2, y: 2.0, w: 5.5, h: 2.4, fontSize: 15 }); if (M.marche.pourquoi) { lbl(s, 'Pourquoi maintenant', { x: 7.2, y: 4.5, w: 5.5, h: 0.35 }); s.addText(M.marche.pourquoi, { x: 7.2, y: 4.9, w: 5.5, h: 1.7, fontFace: F, fontSize: 14, color: GREY, valign: 'top' }); }
    s = base('Nos offres'); M.offers.slice(0, 6).forEach((o, i) => { const x = 0.8 + (i % 3) * 4.0, y = 1.6 + Math.floor(i / 3) * 2.6; s.addShape(p.ShapeType.rect, { x, y, w: 3.8, h: 2.4, fill: { color: 'FFFFFF' }, line: { color: 'DDE3EB' } }); s.addShape(p.ShapeType.rect, { x, y, w: 3.8, h: 0.07, fill: { color: BLUE }, line: { color: BLUE } }); s.addText([{ text: cut(o.nom, 60), options: { bold: true, fontSize: 15, breakLine: true } }, { text: fmt(o.prix[0]) + ' DH', options: { bold: true, fontSize: 20, color: BLUE, breakLine: true } }, { text: cut(o.cible, 70), options: { fontSize: 12, color: GREY } }], { x: x + 0.15, y: y + 0.2, w: 3.5, h: 2.1, fontFace: F, valign: 'top' }); });
    s = base('Business model'); lbl(s, 'Sources de revenus', { x: 0.8, y: 1.5, w: 5.5, h: 0.35 }); bullets(s, M.revenus.map(x => cut(x, 80)), { x: 0.8, y: 1.9, w: 5.4, h: 3.2, fontSize: 16 }); lbl(s, `Marge sur coûts variables ${M.Y[2]}`, { x: 0.8, y: 5.3, w: 5.5, h: 0.35 }); s.addText(pc(M.fin.marge, 0), { x: 0.8, y: 5.65, w: 5, h: 0.9, fontFace: F, fontSize: 40, bold: true, color: NAVY });
    if (M.offers.length) s.addChart(p.ChartType.bar, M.offers.slice(0, 6).map(o => ({ name: cut(o.nom, 30), labels: M.Y, values: o.ca.map(v => Math.round(v)) })), { x: 6.6, y: 1.5, w: 6.1, h: 5.2, barGrouping: 'stacked', showLegend: true, legendPos: 'b', legendFontSize: 9, catAxisLabelFontSize: 11, valAxisLabelFontSize: 9, valAxisLabelFormatCode: '#,##0.0,," M"', chartColors: ['1652F0', '0A2540', '0E8A5F', 'B25E09', '0F7C99', '5B3FD1'] });
    s = base('Traction et prochaines étapes'); lbl(s, 'Déjà réalisé', { x: 0.8, y: 1.5, w: 5.5, h: 0.35 }); bullets(s, M.traction, { x: 0.8, y: 1.9, w: 5.6, h: 4.6, fontSize: 17 }); lbl(s, 'Prochains jalons', { x: 7.0, y: 1.5, w: 5.5, h: 0.35 }); bullets(s, M.next.map(x => `${x.d} · ${x.a}`), { x: 7.0, y: 1.9, w: 5.7, h: 4.6, fontSize: 16 });
    s = base('Concurrence'); if (M.scores.some(Boolean)) s.addChart(p.ChartType.bar, [{ name: 'Score', labels: M.acteurs.map(a => cut(a, 28)), values: M.scores }], { x: 0.8, y: 1.5, w: 6.2, h: 5.0, barDir: 'bar', chartColors: [BLUE], showValue: true, catAxisLabelFontSize: 11, valAxisHidden: true, showLegend: false });
    lbl(s, 'Notre avantage', { x: 7.4, y: 1.5, w: 5.3, h: 0.35 }); bullets(s, M.avantage, { x: 7.4, y: 1.9, w: 5.3, h: 4.6, fontSize: 16 });
    s = base('Go-to-market'); if (M.gtm.pos) { s.addShape(p.ShapeType.rect, { x: 0.8, y: 1.5, w: 5.6, h: 2.6, fill: { color: 'EEF3FE' }, line: { color: 'EEF3FE' } }); lbl(s, 'Positionnement', { x: 1.0, y: 1.65, w: 5.2, h: 0.35 }); s.addText(M.gtm.pos, { x: 1.0, y: 2.05, w: 5.2, h: 1.9, fontFace: F, fontSize: 17, valign: 'top' }); }
    lbl(s, 'Canaux prioritaires (budget an 1)', { x: 7.0, y: 1.5, w: 5.7, h: 0.35 }); if (M.gtm.canaux.length) s.addTable(M.gtm.canaux.map(c => [{ text: c.c, options: { fontSize: 14 } }, { text: kdh(c.b), options: { fontSize: 14, bold: true, align: 'right' } }]), { x: 7.0, y: 1.9, w: 5.7, colW: [4.0, 1.7], fontFace: F, border: { type: 'solid', color: 'E6EAF0', pt: 1 } });
    s = base('L\'équipe'); const tw = Math.min(2.4, 12 / Math.max(1, M.team.length)); M.team.forEach((t, i) => { const x = 0.7 + i * (12.1 / Math.max(1, M.team.length)) + ((12.1 / Math.max(1, M.team.length)) - tw) / 2; s.addShape(p.ShapeType.ellipse, { x: x + tw / 2 - 0.55, y: 1.7, w: 1.1, h: 1.1, fill: { color: NAVY }, line: { color: NAVY } }); s.addText(t.nom.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(), { x: x + tw / 2 - 0.55, y: 1.7, w: 1.1, h: 1.1, align: 'center', fontFace: F, fontSize: 22, bold: true, color: 'FFFFFF' }); s.addText([{ text: t.nom, options: { bold: true, fontSize: 15, breakLine: true } }, { text: t.role, options: { fontSize: 11, color: BLUE, breakLine: true } }, { text: t.comp, options: { fontSize: 10, color: GREY } }], { x, y: 2.95, w: tw, h: 3.4, align: 'center', valign: 'top', fontFace: F }); });
    s = base('Prévisions financières'); s.addChart(p.ChartType.bar, [{ name: 'Chiffre d\'affaires', labels: M.Y, values: M.fin.ca.map(Math.round) }, { name: 'EBE', labels: M.Y, values: M.fin.ebe.map(Math.round) }, { name: 'Résultat net', labels: M.Y, values: M.fin.rn.map(Math.round) }], { x: 0.8, y: 1.5, w: 7.0, h: 5.1, barGrouping: 'clustered', chartColors: [BLUE, NAVY, '0E8A5F'], showLegend: true, legendPos: 'b', valAxisLabelFontSize: 9, catAxisLabelFontSize: 11, valAxisLabelFormatCode: '#,##0.0,," M"' });
    [['CA ' + M.Y[2], kdh(M.fin.ca[2])], ['Résultat net ' + M.Y[2], kdh(M.fin.rn[2])], ['Point mort', M.fin.pm ? mLong(M.fin.pm) : 'non atteint'], ['Trésorerie au plus bas', kdh(M.fin.min)]].forEach(([a, b], k) => { const x = 8.2 + (k % 2) * 2.3, y = 1.6 + Math.floor(k / 2) * 1.7; s.addShape(p.ShapeType.rect, { x, y, w: 2.15, h: 1.5, fill: { color: 'F6F8FB' }, line: { color: 'F6F8FB' } }); s.addText([{ text: a.toUpperCase(), options: { fontSize: 9, color: GREY, breakLine: true } }, { text: b, options: { fontSize: 18, bold: true, color: NAVY } }], { x: x + 0.1, y: y + 0.1, w: 1.95, h: 1.3, fontFace: F, valign: 'top' }); });
    s = base('Notre besoin de financement'); s.addText(kdh(M.ask), { x: 0.8, y: 1.5, w: 6, h: 1.2, fontFace: F, fontSize: 54, bold: true, color: BLUE }); if (M.pre) s.addText(`sur une valorisation pré-money de ${kdh(M.pre)}, soit ${pc(M.ask / (M.pre + M.ask), 0)} du capital`, { x: 0.8, y: 2.7, w: 6, h: 0.6, fontFace: F, fontSize: 15, color: GREY });
    lbl(s, 'Utilisation prévue sur 18 mois', { x: 0.8, y: 3.5, w: 6, h: 0.35 }); bullets(s, M.uses.map(u => `${u.label} : ${kdh(u.value)}`), { x: 0.8, y: 3.9, w: 6, h: 2.8, fontSize: 16 });
    if (M.uses.length) s.addChart(p.ChartType.doughnut, [{ name: 'Utilisation', labels: M.uses.map(u => u.label), values: M.uses.map(u => Math.round(u.value)) }], { x: 7.2, y: 1.5, w: 5.5, h: 5.1, holeSize: 55, showLegend: true, legendPos: 'b', legendFontSize: 11, showPercent: true, dataLabelColor: 'FFFFFF', chartColors: [BLUE, NAVY, '0E8A5F', 'B25E09', '0F7C99'] });
    s = p.addSlide(); s.background = { color: NAVY }; s.addText('Merci', { x: 0.8, y: 2.3, w: 11.5, h: 1.6, fontFace: F, fontSize: 72, bold: true, color: 'FFFFFF' }); s.addText(`${M.cover.nom}${M.cover.slogan ? ' · ' + M.cover.slogan : ''}`, { x: 0.8, y: 3.9, w: 11.5, h: 0.6, fontFace: F, fontSize: 20, color: 'C7D8FF' }); s.addText(M.contact || '', { x: 0.8, y: 4.8, w: 11.5, h: 0.6, fontFace: F, fontSize: 18, color: 'FFFFFF' });
    const fname = `${(typeof slug === 'function' ? slug() : 'pitch')}-pitch-deck.pptx`;
    if (window.__PB_TEST__) return p.write({ outputType: 'base64' });
    return p.writeFile({ fileName: fname });
  }

  /* ---- section ---- */
  function render() {
    if (!R) return '';
    const M = model(), sl = slides(M), pt = P_();
    return card('Tes diapositives', `${sl.length} diapositives générées à partir de ton business plan. Elles se mettent à jour quand tu modifies tes données.`,
      `<div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:14px"><button class="btn pri" data-act="pitchShow">Présenter</button><button class="btn" data-act="pitchPdf">Enregistrer en PDF</button><button class="btn" data-act="pitchPptx">Télécharger en PowerPoint</button></div>
       <iframe class="pframe" title="Aperçu du pitch deck" srcdoc="${esc(deckHTML({ grid: true }))}" onload="try{this.style.height=(this.contentDocument.body.scrollHeight+8)+'px'}catch(e){}"></iframe>`)
      + card('Personnaliser le pitch', 'Laisse vide pour utiliser ce que PlanBiz déduit de ton business plan.',
        `<div class="grid g2">${fText('pitch.accroche', 'Accroche (couverture)', { area: true, rows: 2, ph: cut(S.id.pitch, 120) || 'Une phrase qui résume ce que tu fais et pour qui.' })}
         ${fNum('pitch.ask', 'Montant recherché (DH)', { ph: String(Math.round(M.ask)) })}
         ${fText('pitch.traction', 'Traction déjà obtenue', { area: true, rows: 3, ph: 'Ex. : 5 pilotes signés. 120 utilisateurs en liste d\'attente. Prix de l\'innovation 2026.' })}
         ${fText('pitch.contact', 'Contact (dernière diapositive)', { ph: M.contact || 'email · téléphone · site' })}</div>`);
  }
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-act^="pitch"]'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'pitchShow' || a === 'pitchPdf') { const w = window.open('', '_blank'); if (!w) { toast('Autorise les fenêtres pop-up pour ouvrir le pitch.'); return; } w.document.write(deckHTML({ present: a === 'pitchShow', autoprint: a === 'pitchPdf' })); w.document.close(); }
    if (a === 'pitchPptx') { b.disabled = true; const t = b.textContent; b.textContent = 'Préparation…'; try { await pptx(); toast('Pitch deck PowerPoint téléchargé.'); } catch (err) { toast(err.message || 'Export impossible'); } b.disabled = false; b.textContent = t; }
  });
  return { model, slides, deckHTML, pptx, render };
})();
sec('pitch', 'Résultats', 'Pitch deck', 'Une présentation investisseurs de 13 diapositives construite à partir de ton business plan : à présenter, enregistrer en PDF ou ouvrir dans PowerPoint.', () => PITCH.render(), () => (S.pitch && (S.pitch.accroche || S.pitch.traction)) ? 2 : 1);
