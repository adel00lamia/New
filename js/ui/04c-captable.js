/* ================= Table de capitalisation, dilution et valorisation ================= */
const CAP = (() => {
  const OUTSIDE = /angel|fonds|vc|seed|série|serie|levée|levee|investisseur|crowdfunding|equity|capital-risque/i;
  const isCap = f => (f.nature || '').startsWith('Capital') && N(f.montant) > 0;
  const defMult = () => { const p = S.hyp.profil || ''; return p.startsWith('Startup') ? { ca: 3, ebe: 8 } : p.startsWith('Coop') ? { ca: 0.5, ebe: 4 } : { ca: 1, ebe: 5 }; };

  function compute() {
    const rows = (S.fin || []).map((f, i) => ({ ...f, i })).filter(isCap).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    let founders = (S.founders || []).filter(f => f.nom && N(f.capital) > 0).map(f => ({ nom: f.nom, w: N(f.capital) }));
    const wt = founders.reduce((a, f) => a + f.w, 0);
    if (!founders.length || wt <= 0) founders = [{ nom: 'Fondateurs', w: 1 }];
    else founders = founders.map(f => ({ ...f, w: f.w / wt }));
    // holders: founders share a pool; each outside round is its own holder
    const holders = founders.map(f => ({ nom: f.nom, kind: 'f', pct: f.w, inv: 0 }));
    const rounds = [], missing = [];
    let paidIn = N(S.openCash) > 0 ? 0 : 0, post = null;
    rows.forEach(r => {
      const amt = N(r.montant), pre = N(r.premoney);
      const outside = OUTSIDE.test(r.source || '') || pre > 0;
      if (!outside) { holders.filter(h => h.kind === 'f').forEach(h => { h.inv += amt * (founders.find(f => f.nom === h.nom) || { w: 0 }).w; }); paidIn += amt; return; }
      if (!pre) { missing.push(r.source || 'Levée'); return; }
      const share = amt / (pre + amt);
      holders.forEach(h => { h.pct *= 1 - share; });
      holders.push({ nom: r.source, kind: 'i', pct: share, inv: amt, date: r.date, pre, post: pre + amt });
      post = pre + amt; paidIn += amt;
      rounds.push({ nom: r.source, date: r.date, amt, pre, post, share, fAfter: holders.filter(h => h.kind === 'f').reduce((a, h) => a + h.pct, 0) });
    });
    const m = defMult(), mCA = isBlankV(S.hyp.multCA) ? m.ca : N(S.hyp.multCA), mEBE = isBlankV(S.hyp.multEBE) ? m.ebe : N(S.hyp.multEBE);
    const ca3 = R.P.ca[2], ebe3 = R.P.ebe[2];
    const debt = Math.max(0, R.B[3].dettesFin || 0), cash = Math.max(0, R.B[3].tresoA || 0);
    const vCA = ca3 * mCA, vEBE = ebe3 > 0 ? ebe3 * mEBE : null;
    const eqCA = Math.max(0, vCA - debt + cash), eqEBE = vEBE === null ? null : Math.max(0, vEBE - debt + cash);
    const endDate = new Date(R.sY, R.sM + 36, 1);
    const yearsFrom = d => { const x = d ? new Date(d + 'T00:00:00') : new Date(R.sY, R.sM, 1); return Math.max(0.25, (endDate - x) / (365.25 * 864e5)); };
    holders.forEach(h => {
      h.valCA = eqCA * h.pct; h.valEBE = eqEBE === null ? null : eqEBE * h.pct;
      if (h.kind === 'i' && h.inv) { h.moic = h.valCA / h.inv; h.irr = Math.pow(Math.max(h.moic, 0.0001), 1 / yearsFrom(h.date)) - 1; }
    });
    return { holders, rounds, missing, mCA, mEBE, vCA, vEBE, eqCA, eqEBE, debt, cash, post, fPct: holders.filter(h => h.kind === 'f').reduce((a, h) => a + h.pct, 0) };
  }
  const isBlankV = v => v === '' || v === null || v === undefined;

  function card_() {
    if (!R) return '';
    const c = compute(), m = defMult();
    const hasRounds = c.rounds.length || c.missing.length;
    const table = `<div class="tw"><table class="cmp"><tr><th>Associé</th><th class="n">Détention</th><th class="n">Investi</th><th class="n">Valeur (× CA)</th>${c.eqEBE !== null ? '<th class="n">Valeur (× EBE)</th>' : ''}<th class="n">Multiple</th><th class="n">Rendement / an</th></tr>
      ${c.holders.map(h => `<tr><td>${h.kind === 'f' ? '<span class="pill mut">Fondateur</span> ' : '<span class="pill info">Investisseur</span> '}${esc(h.nom)}</td><td class="n"><b>${pc(h.pct, 1)}</b></td><td class="n">${h.inv ? fmt(h.inv) : '—'}</td><td class="n">${fmt(h.valCA)}</td>${c.eqEBE !== null ? `<td class="n">${fmt(h.valEBE)}</td>` : ''}<td class="n">${h.moic !== undefined ? `<span class="pill ${h.moic >= 3 ? 'good' : h.moic >= 1 ? 'warn' : 'crit'}">×${fmt(h.moic, 1)}</span>` : '—'}</td><td class="n">${h.irr !== undefined ? pc(h.irr, 0) : '—'}</td></tr>`).join('')}</table></div>`;
    const roundsT = c.rounds.length ? `<div class="tw" style="margin-top:12px"><table><tr><th>Levée</th><th>Date</th><th class="n">Montant</th><th class="n">Pré-money</th><th class="n">Post-money</th><th class="n">Part cédée</th><th class="n">Fondateurs après</th></tr>${c.rounds.map(r => `<tr><td>${esc(r.nom)}</td><td>${esc(r.date || '')}</td><td class="n">${fmt(r.amt)}</td><td class="n">${fmt(r.pre)}</td><td class="n">${fmt(r.post)}</td><td class="n">${pc(r.share, 1)}</td><td class="n"><b>${pc(r.fAfter, 1)}</b></td></tr>`).join('')}</table></div>` : '';
    const warn = c.missing.length ? `<p class="pill warn" style="white-space:normal;margin:8px 0">Renseigne la valorisation pré-money de : ${esc(c.missing.join(', '))}. Sans elle, la dilution ne peut pas être calculée.</p>` : '';
    return card('Table de capitalisation et valorisation', hasRounds ? 'Qui détient quoi après chaque levée, et ce que vaudrait l\'entreprise à la fin du plan.' : 'Ajoute une levée de fonds (nature « Capital ») avec sa valorisation pré-money pour voir la dilution.',
      `${warn}${roundsT}<div style="margin-top:12px">${table}</div>
      <div class="grid g3" style="margin-top:12px">${fNum('hyp.multCA', 'Multiple du chiffre d\'affaires', { hyp: true, ph: String(m.ca), help: 'Valeur ≈ CA de l\'année 3 × multiple. Startup SaaS : 3 à 6. TPME : 0,5 à 1,5.' })}${fNum('hyp.multEBE', 'Multiple de l\'EBE', { hyp: true, ph: String(m.ebe), help: 'Utilisé quand l\'EBE de l\'année 3 est positif. PME : 4 à 8.' })}
      <div class="tile"><small>Valeur des titres (multiple de CA)</small><b>${kdh(c.eqCA)}</b><span>${kdh(c.vCA)} − dettes ${kdh(c.debt)} + trésorerie ${kdh(c.cash)}</span></div></div>
      <p class="small muted" style="margin-top:8px">Ordre de grandeur pour préparer une discussion avec des investisseurs, pas une évaluation. Repères : un SaaS non coté se valorise autour de 5,7 fois son chiffre d'affaires (médiane 2025, surtout États-Unis et Europe, <a href="https://aventis-advisors.com/?p=5430" target="_blank" rel="noopener">Aventis</a>). Pour une PME marocaine non cotée, applique une décote prudente sur ces multiples. Le rendement annuel compte de la date de la levée à la fin du plan.</p>`);
  }
  return { compute, card: card_ };
})();
