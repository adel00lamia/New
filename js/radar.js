/* ================= Radar des financements : programmes marocains adaptés au projet ================= */
const RADAR = (() => {
  const TYPES = { pret: 'Prêt', garantie: 'Garantie', subvention: 'Subvention', pret_honneur: 'Prêt d\'honneur', capital: 'Investissement en capital', accompagnement: 'Accompagnement', prime_investissement: 'Prime à l\'investissement', emploi: 'Aide à l\'embauche' };
  const STATUT = { ouvert: ['Ouvert', 'good'], recurrent: ['Appels réguliers', 'info'], a_verifier: ['À vérifier', 'warn'], ferme: ['Fermé', 'mut'] };
  const TAGS = { porteur: 'Porteur de projet', 'auto-entrepreneur': 'Auto-entrepreneur', tpe: 'TPE', pme: 'PME', startup: 'Startup', cooperative: 'Coopérative', femme: 'Femme', jeune: 'Jeune', mre: 'MRE', rural: 'Milieu rural', agriculture: 'Agriculture' };
  const TOGGLES = [['femme', 'Je suis une femme porteuse de projet'], ['jeune', 'J\'ai moins de 40 ans'], ['mre', 'Je suis Marocain(e) résidant à l\'étranger'], ['rural', 'Mon projet est en milieu rural']];
  const data = () => (typeof RADAR_DATA !== 'undefined' ? RADAR_DATA : { maj: '', items: [] });
  const opts = () => { S.radar = S.radar || {}; return S.radar; };

  const SECT = { industrie: /industri|fabric|production|manufact|usine|atelier|agro/i, vert: /énergi|environnement|déchet|recycl|clean|vert|solaire|eau/i, tourisme: /touris|hôtel|hébergement|loisir|voyage|travel/i, agriculture: /agri|élevage|pêche|agro/i };
  const SECT_L = { industrie: 'Activité industrielle', vert: 'Projet vert (énergie, déchets, dépollution)', tourisme: 'Projet touristique', agriculture: 'Projet agricole' };
  const TOG_L = { femme: 'Entreprise dirigée ou détenue majoritairement par une femme', mre: 'Porteur marocain résidant à l\'étranger', jeune: 'Porteur jeune (limite d\'âge selon le programme)', rural: 'Projet en milieu rural' };

  function profile() {
    const o = opts(), t = new Set();
    const prof = (S.hyp && S.hyp.profil) || '', st0 = ((S.hyp && S.hyp.statut) || [])[0] || '';
    const stade = (S.id && S.id.stade) || '';
    if (/^(Idée|Étude|Prototype|Test pilote)/.test(stade) || !stade) t.add('porteur');
    if (/Auto/i.test(st0)) t.add('auto-entrepreneur');
    if (prof.startsWith('Startup')) t.add('startup');
    if (prof.startsWith('Coop') || /Coop/i.test(st0)) t.add('cooperative');
    const ca = R && R.P ? R.P.ca : [0, 0, 0];
    if (prof.startsWith('TPME') || (!prof.startsWith('Coop') && !/Auto/i.test(st0))) t.add(ca[2] > 10e6 ? 'pme' : 'tpe');
    const sect = [(S.id && S.id.secteur) || '', ...((S.id && S.id.secteurs) || []), (S.id && S.id.activite) || '', (S.id && S.id.pitch) || ''].join(' ');
    if (SECT.agriculture.test(sect)) t.add('agriculture');
    TOGGLES.forEach(([k]) => { if (o[k]) t.add(k); });
    const inv = R && R.inv ? R.inv.filter(i => !i.existing).reduce((a, i) => a + (i.cost || 0), 0) : 0;
    const need = R && R.C ? Math.max(0, R.C.fonds || 0) : 0;
    const fin = S.fin || [];
    const equity = fin.filter(f => /^(Capital|Compte courant)/.test(f.nature || '')).reduce((a, f) => a + N(f.montant), 0) + N(S.openCash);
    const credit = (S.loans || []).reduce((a, l) => a + N(l.montant), 0), bigLoan = Math.max(0, ...(S.loans || []).map(l => N(l.montant)));
    const jobs = (S.staff || []).filter(x => /CDI|Président|Gérant/i.test(x.contrat || '')).length;
    const created = (S.id && S.id.date) || (S.hyp && S.hyp.start) || '';
    const age = created ? (Date.now() - new Date(created + 'T00:00:00')) / (365.25 * 864e5) : null;
    return { tags: t, inv, need, ca, sect, equity, credit, bigLoan, jobs, created, age };
  }

  // Chaque critère renvoie { l: libellé, st: 'ok' | 'ko' | 'na', d: détail calculé }
  function crit(c, pf) {
    const [k, v] = c, M = x => kdh(x);
    switch (k) {
      case 'ca_max': { const a1 = pf.ca[0], a3 = pf.ca[2]; if (!a3) return { l: `Chiffre d'affaires ≤ ${M(v)}`, st: 'na', d: 'Pas encore de chiffre d\'affaires saisi' };
        return a1 > v ? { l: `Chiffre d'affaires ≤ ${M(v)}`, st: 'ko', d: `An 1 : ${M(a1)}` } : a3 > v ? { l: `Chiffre d'affaires ≤ ${M(v)}`, st: 'ok', d: `An 1 : ${M(a1)}, mais ${M(a3)} en An 3. Dépose le dossier tôt` } : { l: `Chiffre d'affaires ≤ ${M(v)}`, st: 'ok', d: `${M(a3)} en An 3` }; }
      case 'ca_min': { const a3 = pf.ca[2]; return { l: `Chiffre d'affaires ≥ ${M(v)}`, st: !a3 ? 'na' : a3 >= v ? 'ok' : 'ko', d: a3 ? `${M(a3)} en An 3` : 'Pas encore de chiffre d\'affaires saisi' }; }
      case 'inv_min': return { l: `Investissement ≥ ${M(v)}`, st: !pf.inv ? 'na' : pf.inv >= v ? 'ok' : 'ko', d: pf.inv ? `${M(pf.inv)} prévus` : 'Aucun investissement saisi' };
      case 'inv_max': return { l: `Investissement ≤ ${M(v)}`, st: !pf.inv ? 'na' : pf.inv <= v ? 'ok' : 'ko', d: pf.inv ? `${M(pf.inv)} prévus` : 'Aucun investissement saisi' };
      case 'credit_max': { const x = pf.credit || pf.need; return { l: `Crédit demandé ≤ ${M(v)}`, st: !x ? 'na' : x <= v ? 'ok' : 'ko', d: !x ? 'Aucun emprunt ni besoin de financement' : `${M(x)} ${pf.credit ? 'd\'emprunts prévus' : 'de besoin de financement'}${x > v ? '. Le programme ne couvrira qu\'une partie' : ''}` }; }
      case 'credit_min': { const x = pf.credit || pf.need; return { l: `Crédit ≥ ${M(v)}`, st: !x ? 'na' : x >= v ? 'ok' : 'ko', d: x ? `${M(x)} ${pf.credit ? 'd\'emprunts prévus' : 'de besoin de financement'}` : 'Aucun emprunt ni besoin de financement' }; }
      case 'pret_unit_max': return { l: `Chaque crédit ≤ ${M(v)}`, st: !pf.bigLoan ? 'na' : pf.bigLoan <= v ? 'ok' : 'ko', d: pf.bigLoan ? `Plus gros emprunt prévu : ${M(pf.bigLoan)}` : 'Aucun emprunt saisi' };
      case 'pret_unit_min': return { l: `Crédit de plus de ${M(v)}`, st: !pf.bigLoan ? 'na' : pf.bigLoan > v ? 'ok' : 'ko', d: pf.bigLoan ? `Plus gros emprunt prévu : ${M(pf.bigLoan)}` : 'Aucun emprunt saisi' };
      case 'apport_min': { if (!pf.inv) return { l: `Apport ≥ ${Math.round(v * 100)} % du projet`, st: 'na', d: 'Aucun investissement saisi' }; const r = pf.equity / pf.inv; return { l: `Apport ≥ ${Math.round(v * 100)} % du projet`, st: r >= v ? 'ok' : 'ko', d: `${M(pf.equity)} d'apports, soit ${pc(r, 0)} de l'investissement` }; }
      case 'emplois_par_mdh': { if (!pf.inv) return { l: `${String(v).replace('.', ',')} emploi stable par million investi`, st: 'na', d: 'Aucun investissement saisi' }; const need = Math.ceil(v * pf.inv / 1e6); return { l: `${String(v).replace('.', ',')} emploi stable par million investi`, st: pf.jobs >= need ? 'ok' : 'ko', d: `${pf.jobs} poste${pf.jobs > 1 ? 's' : ''} en CDI prévu${pf.jobs > 1 ? 's' : ''}, ${need} demandé${need > 1 ? 's' : ''}` }; }
      case 'age_max': return { l: `Entreprise de ${v} ans au plus`, st: pf.age === null ? 'na' : pf.age <= v ? 'ok' : 'ko', d: pf.age === null ? 'Date de création non renseignée' : pf.age < 0 ? 'Entreprise en création' : `Créée il y a ${fmt(pf.age, 1)} an${pf.age >= 2 ? 's' : ''}` };
      case 'age_min': return { l: `Au moins ${v} ans d'activité`, st: pf.age === null ? 'na' : pf.age >= v ? 'ok' : 'ko', d: pf.age === null ? 'Date de création non renseignée' : pf.age < 0 ? 'Entreprise en création' : `Créée il y a ${fmt(pf.age, 1)} an${pf.age >= 2 ? 's' : ''}` };
      case 'cree_avant': return { l: `Entreprise créée au plus tard le ${new Date(v + 'T00:00:00').toLocaleDateString('fr-FR')}`, st: !pf.created ? 'na' : pf.created <= v ? 'ok' : 'ko', d: pf.created ? `Création prévue le ${new Date(pf.created + 'T00:00:00').toLocaleDateString('fr-FR')}` : 'Date de création non renseignée' };
      case 'toggle': return { l: TOG_L[v] || v, st: pf.tags.has(v) ? 'ok' : 'ko', d: pf.tags.has(v) ? 'Coché dans ton profil' : 'Non coché dans ton profil' };
      case 'secteur': return { l: SECT_L[v] || v, st: SECT[v] && SECT[v].test(pf.sect) ? 'ok' : 'na', d: SECT[v] && SECT[v].test(pf.sect) ? 'D\'après le secteur et l\'activité saisis' : 'Pas reconnu dans ton secteur ou ton activité, à vérifier' };
    }
    return { l: k, st: 'na', d: '' };
  }

  function score(it, pf) {
    const pour = it.pour || [];
    const hits = pour.filter(x => pf.tags.has(x));
    const open = pour.length === 0 || hits.length > 0;
    const checks = (it.crit || []).map(c => crit(c, pf));
    const ko = checks.filter(c => c.st === 'ko').length, ok = checks.filter(c => c.st === 'ok').length, na = checks.filter(c => c.st === 'na').length;
    const sectNa = checks.some((c, i) => it.crit[i][0] === 'secteur' && c.st === 'na');
    const match = open && it.statut !== 'ferme' && ko === 0 && !sectNa;
    return { match, hits, checks, ko, ok, na, s: (match ? 100 : 0) + ok * 6 - ko * 20 - na * 2 + hits.length * 10 + (it.statut === 'ouvert' ? 5 : it.statut === 'recurrent' ? 3 : 0) };
  }

  const card_ = (it, sc) => {
    const [stL, stC] = STATUT[it.statut] || STATUT.a_verifier;
    return `<article class="rd-card ${sc.match ? 'on' : ''}">
      <header><div><h3>${esc(it.nom)}</h3><p class="small muted">${esc(it.organisme || '')}</p></div><div class="rd-pills"><span class="pill info">${esc(TYPES[it.type] || it.type)}</span><span class="pill ${stC}">${stL}</span></div></header>
      ${it.montant ? `<p class="rd-amt">${esc(it.montant)}</p>` : ''}
      ${(it.conditions || []).length ? `<ul class="rd-cond">${it.conditions.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${sc.checks.length ? `<div class="rd-checks"><p class="rd-ct">Ton projet face aux conditions${sc.ko ? ` <span class="pill crit">${sc.ko} à corriger</span>` : sc.na ? '' : ' <span class="pill good">tout est conforme</span>'}</p><ul>${sc.checks.map(c => `<li class="rc-${c.st}"><span class="rc-i" aria-hidden="true">${c.st === 'ok' ? '✓' : c.st === 'ko' ? '✕' : '?'}</span><span><b>${esc(c.l)}</b><small>${esc(c.d)}</small></span><span class="sr-only">${c.st === 'ok' ? 'conforme' : c.st === 'ko' ? 'à corriger' : 'inconnu'}</span></li>`).join('')}</ul></div>` : ''}
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
