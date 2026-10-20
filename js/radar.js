/* ================= Radar des financements : programmes marocains adaptés au projet ================= */
const RADAR = (() => {
  const TYPES = { pret: 'Prêt', garantie: 'Garantie', subvention: 'Subvention', pret_honneur: 'Prêt d\'honneur', capital: 'Investissement en capital', accompagnement: 'Accompagnement', prime_investissement: 'Prime à l\'investissement', emploi: 'Aide à l\'embauche' };
  const STATUT = { ouvert: ['Ouvert', 'good'], recurrent: ['Appels réguliers', 'info'], a_verifier: ['À vérifier', 'warn'], ferme: ['Fermé', 'mut'] };
  const TAGS = { porteur: 'Porteur de projet', 'auto-entrepreneur': 'Auto-entrepreneur', tpe: 'TPE', pme: 'PME', startup: 'Startup', cooperative: 'Coopérative', femme: 'Femme', jeune: 'Jeune', mre: 'MRE', rural: 'Milieu rural', agriculture: 'Agriculture' };
  const TOGGLES = [['femme', 'Je suis une femme porteuse de projet'], ['jeune', 'J\'ai moins de 40 ans'], ['mre', 'Je suis Marocain(e) résidant à l\'étranger'], ['rural', 'Mon projet est en milieu rural']];
  const data = () => (typeof RADAR_DATA !== 'undefined' ? RADAR_DATA : { maj: '', items: [] });
  const opts = () => { S.radar = S.radar || {}; return S.radar; };

  function profile() {
    const o = opts(), t = new Set();
    const prof = (S.hyp && S.hyp.profil) || '', st0 = ((S.hyp && S.hyp.statut) || [])[0] || '';
    const stade = (S.id && S.id.stade) || '';
    if (/^(Idée|Étude|Prototype|Test pilote)/.test(stade) || !stade) t.add('porteur');
    if (/Auto/i.test(st0)) t.add('auto-entrepreneur');
    if (prof.startsWith('Startup')) t.add('startup');
    if (prof.startsWith('Coop') || /Coop/i.test(st0)) t.add('cooperative');
    const ca3 = R && R.P ? R.P.ca[2] : 0;
    if (prof.startsWith('TPME') || (!prof.startsWith('Coop') && !/Auto/i.test(st0))) t.add(ca3 > 10e6 ? 'pme' : 'tpe');
    const sect = [(S.id && S.id.secteur) || '', ...((S.id && S.id.secteurs) || [])].join(' ');
    if (/agri|élevage|pêche|agro/i.test(sect)) t.add('agriculture');
    TOGGLES.forEach(([k]) => { if (o[k]) t.add(k); });
    const inv = R && R.inv ? R.inv.filter(i => !i.existing).reduce((a, i) => a + (i.cost || 0), 0) : 0;
    const need = R && R.C ? Math.max(0, R.C.fonds || 0) : 0;
    return { tags: t, inv, need, ca3, sect: sect + ' ' + ((S.id && S.id.activite) || '') + ' ' + ((S.id && S.id.pitch) || '') };
  }

  function score(it, pf) {
    const pour = it.pour || [];
    const hits = pour.filter(x => pf.tags.has(x));
    const open = pour.length === 0 || hits.length > 0;
    const restricted = ['femme', 'jeune', 'mre', 'rural', 'agriculture', 'cooperative'].filter(x => pour.includes(x) && pour.every(p => ['femme', 'jeune', 'mre', 'rural', 'agriculture', 'cooperative'].includes(p)));
    const needsSpecific = restricted.length > 0 && !restricted.some(x => pf.tags.has(x));
    const warn = [];
    const inv = pf.inv, need = pf.need || pf.inv;
    if (need > 0 && it.max_inv && need > it.max_inv) warn.push(`Ton besoin (${kdh(need)}) dépasse le plafond du programme : il ne couvrira qu'une partie.`);
    if (inv > 0 && it.min_inv && inv < it.min_inv) warn.push(`Ton investissement prévu (${kdh(inv)}) est sous le minimum demandé.`);
    const caOver = !!(it.ca_max && pf.ca3 > it.ca_max);
    if (caOver) warn.push('Ton chiffre d\'affaires prévu dépasse le plafond du programme.');
    const SECT = { industrie: /industri|fabric|production|manufact|usine|atelier|agro/i, vert: /énergi|environnement|déchet|recycl|clean|vert|solaire|eau/i, tourisme: /touris|hôtel|hébergement|loisir|voyage|travel/i };
    const sectOk = !it.secteur || (SECT[it.secteur] && SECT[it.secteur].test(pf.sect));
    if (!sectOk) warn.push({ vert: 'Réservé aux projets verts (énergie, déchets, dépollution).', tourisme: 'Réservé aux projets touristiques.', industrie: 'Réservé aux entreprises industrielles.' }[it.secteur]);
    const tooSmall = inv > 0 && it.min_inv && inv < it.min_inv;
    const reqOk = !(it.requiert || []).length || it.requiert.every(x => pf.tags.has(x));
    const match = open && !needsSpecific && reqOk && it.statut !== 'ferme' && !caOver && sectOk && !tooSmall;
    return { match, hits, warn, s: (match ? 100 : 0) - warn.length * 5 + hits.length * 10 + (it.statut === 'ouvert' ? 5 : it.statut === 'recurrent' ? 3 : 0) };
  }

  const card_ = (it, sc) => {
    const [stL, stC] = STATUT[it.statut] || STATUT.a_verifier;
    return `<article class="rd-card ${sc.match ? 'on' : ''}">
      <header><div><h3>${esc(it.nom)}</h3><p class="small muted">${esc(it.organisme || '')}</p></div><div class="rd-pills"><span class="pill info">${esc(TYPES[it.type] || it.type)}</span><span class="pill ${stC}">${stL}</span></div></header>
      ${it.montant ? `<p class="rd-amt">${esc(it.montant)}</p>` : ''}
      ${(it.conditions || []).length ? `<ul class="rd-cond">${it.conditions.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${sc.warn.length ? `<p class="rd-warn">${sc.warn.map(esc).join(' ')}</p>` : ''}
      <footer><span class="small muted">${esc(it.calendrier || '')}${it.pour && it.pour.length ? ` · Pour : ${it.pour.map(p => TAGS[p] || p).join(', ')}` : ''}</span><span class="sp"></span>${it.lien ? `<a class="btn sm" href="${esc(it.lien)}" target="_blank" rel="noopener">Site officiel</a>` : ''}</footer>
      ${it.note ? `<p class="small muted rd-note">${esc(it.note)}</p>` : ''}
      <p class="rd-src small muted">Vérifié le ${esc(fmtDate(it.verifie_le))}${it.source ? ` · <a href="${esc(it.source)}" target="_blank" rel="noopener">source</a>` : ''}</p>
    </article>`;
  };
  const fmtDate = d => { if (!d) return '—'; const x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); };

  function list() {
    const pf = profile();
    const rows = data().items.map(it => ({ it, sc: score(it, pf) })).sort((a, b) => b.sc.s - a.sc.s);
    return { pf, rows, matches: rows.filter(r => r.sc.match && r.it.statut !== 'a_verifier'), watch: rows.filter(r => r.sc.match && r.it.statut === 'a_verifier') };
  }

  function page() {
    const o = opts(), { pf, rows, matches, watch } = list();
    const others = rows.filter(r => !r.sc.match);
    const tagTxt = [...pf.tags].map(t => TAGS[t] || t).join(', ');
    return `<div class="card rd-prof"><div><b>Ton profil pour le radar</b><p class="small muted">${esc(tagTxt || 'Complète l\'identité du projet et les hypothèses')}${pf.inv ? ` · Investissement prévu : ${kdh(pf.inv)}` : ''}${pf.need ? ` · Fonds à trouver : ${kdh(pf.need)}` : ''}</p></div>
      <div class="rd-tg">${TOGGLES.map(([k, l]) => `<label class="chk"><input type="checkbox" data-radar="${k}" ${o[k] ? 'checked' : ''}> ${esc(l)}</label>`).join('')}</div></div>
     <h2 class="rd-h">${matches.length === 0 ? 'Aucun programme ne correspond encore à ton projet' : matches.length === 1 ? '1 programme correspond à ton projet' : `${matches.length} programmes correspondent à ton projet`}</h2>
     <div class="rd-grid">${matches.length ? matches.map(r => card_(r.it, r.sc)).join('') : '<p class="muted">Complète ton profil ou ajuste les cases ci-dessus, ou parcours la liste complète ci-dessous.</p>'}</div>
     ${watch.length ? `<h2 class="rd-h">À surveiller</h2><p class="small muted" style="margin:-6px 0 12px">Ces programmes correspondent à ton profil, mais leur ouverture en 2026 n'est pas confirmée.</p><div class="rd-grid">${watch.map(r => card_(r.it, r.sc)).join('')}</div>` : ''}
     ${others.length ? `<details class="rd-more"><summary>Voir les ${others.length} autres programmes</summary><div class="rd-grid">${others.map(r => card_(r.it, r.sc)).join('')}</div></details>` : ''}
     <p class="small muted rd-disc">Liste mise à jour le ${esc(fmtDate(data().maj))}. Les conditions changent souvent : vérifie toujours sur le site officiel ou auprès de l'organisme avant de déposer ton dossier. Ce radar est une aide pour repérer les programmes, pas une garantie d'éligibilité.</p>`;
  }

  document.addEventListener('change', e => {
    const k = e.target && e.target.dataset && e.target.dataset.radar; if (!k || !S) return;
    opts()[k] = e.target.checked;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  });

  if (typeof sec === 'function') sec('radar', 'Ressources', 'Radar des financements', 'Les programmes de financement et d\'accompagnement au Maroc qui correspondent à ton projet, avec leurs conditions et le lien officiel.', page, () => 0);

  return { list, page, profile, count: () => list().matches.length };
})();
