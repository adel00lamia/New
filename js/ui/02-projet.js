/* ================= Sections : le projet ================= */
const SECTIONS = [];
function sec(id, group, title, lead, render, done) { SECTIONS.push({ id, group, title, lead, render, done }); }
const filled = (...vals) => { const f = vals.filter(v => Array.isArray(v) ? v.length : !isB(v)).length; return f === 0 ? 0 : f === vals.length ? 2 : 1; };

sec('identite', 'Le projet', 'Identité du projet', 'La carte d\'identité de ton projet : nom, stade, activité, secteurs et coordonnées.', () => `
${card('Fiche projet', '', `<div class="grid g2">
 ${fText('id.nom', 'Nom du projet / de l\'entreprise', { ph: 'Ex. SAQYA Tech' })}
 ${fText('id.slogan', 'Slogan / accroche')}
 ${fText('id.pitch', 'Pitch en une phrase (qui, quoi, pour qui, pourquoi toi)', { area: true, cls: '', rows: 2 })}
 ${fText('id.porteurs', 'Porteur(s) du projet', { ph: 'Nom (rôle), …' })}
 ${fDate('id.date', 'Date de création ou de lancement')}
 ${fText('id.stade', 'Stade d\'avancement', { list: 'L_Stade' })}
 ${fText('id.secteur', 'Secteur principal', { list: 'L_Secteur' })}
 ${fText('id.activite', 'Activité principale', { list: 'L_Activite' })}
 ${fText('id.ville', 'Ville')} ${fText('id.region', 'Région', { list: 'L_Region' })}
 ${fText('id.email', 'E-mail')} ${fText('id.tel', 'Téléphone')}
 ${fText('id.web', 'Site web / réseaux sociaux')} ${fText('id.rc', 'RC / ICE (si déjà créée)')}
</div>`)}
${card('Types d\'activité', 'Coche tout ce qui s\'applique.', fChips('id.types', '', L.L_Activite || []))}
${card('Secteurs d\'activité', 'Plusieurs choix possibles : parcourir la liste aide aussi à trouver des idées.', fChips('id.secteurs', '', L.L_Secteur || []))}
`, () => filled(S.id.nom, S.id.pitch, S.id.secteur, S.id.activite, S.id.stade));

sec('equipe', 'Le projet', 'Équipe & personnel', 'Les profils clés rassurent les financeurs. Le plan de personnel se saisit en salaires NETS : le brut, les cotisations CNSS/AMO, l\'IR et le coût employeur sont calculés selon les règles 2026.', () => {
  const contrats = (L.M_Contrat || []).map(r => r[0]);
  const st = R ? R.staff : [];
  const capSum = (S.founders || []).reduce((s, f) => s + N(f.capital), 0);
  const costRows = (S.staff || []).map((p, i) => { const k = st.find(x => x.nom === p.nom) || null; return k; });
  return card('1. Équipe fondatrice & profils clés', `Capital réparti : <b class="${Math.abs(capSum - 1) < .001 ? 'pos' : 'neg'}">${pc(capSum, 0)}</b> (doit faire 100 % pour une société).`,
    tableEd('founders', [{ k: 'nom', l: 'Nom', w: 130 }, { k: 'role', l: 'Rôle', list: 'L_Role', w: 150 }, { k: 'comp', l: 'Compétences & expériences', t: 'area', w: 240 }, { k: 'exp', l: 'Années d\'exp.', t: 'num', w: 70 }, { k: 'temps', l: '% temps', t: 'pct', w: 70 }, { k: 'capital', l: '% capital', t: 'pct', w: 70 }, { k: 'diplome', l: 'Diplôme', w: 130 }],
      { add: 'Ajouter une personne clé', newRow: { nom: '', role: '', comp: '', exp: '', temps: 1, capital: '', diplome: '' } }))
  + card('2. Plan de personnel (montants NETS par mois)', 'Vide en année 2 ou 3 = montant de l\'année précédente + inflation. Freelance / société : saisis la facture HT.',
    tableEd('staff', [{ k: 'nom', l: 'Nom / poste', w: 170 }, { k: 'role', l: 'Rôle', list: 'L_Role', w: 130 }, { k: 'contrat', l: 'Contrat', t: 'sel', opts: contrats, w: 180 }, { k: 'debut', l: 'Entrée', t: 'date' }, { k: 'fin', l: 'Sortie', t: 'date' },
      { k: 'net.0', l: 'Net/mois An 1', t: 'num', w: 85 }, { k: 'net.1', l: 'An 2', t: 'num', w: 80 }, { k: 'net.2', l: 'An 3', t: 'num', w: 80 }, { k: 'dep', l: 'Pers. à charge', t: 'num', w: 60 }],
      { add: 'Ajouter un poste', newRow: { nom: '', role: '', contrat: 'CDI', debut: S.hyp.start, fin: '', net: ['', '', ''], dep: 0 } }))
  + card('Coût calculé par poste', 'Brut mensuel et coût employeur annuel, selon le statut et le contrat.', staffCostTable())
  + `<details class="help"><summary>Comment le net devient-il un coût employeur ?</summary><p style="margin-top:6px">Salarié : brut = net + cotisations salariales (AMO 2,26 % + 4,67 % plafonné à 6 000 DH) + IR (barème 2026, frais professionnels 35 % ou 25 %, 600 DH/an par personne à charge). Coût = brut + charges patronales (12,11 % + 9,36 % plafonné). Stage, Idmaj : coût = indemnité nette. Le net est versé le mois même ; CNSS et IR sont reversés le mois suivant.</p></details>`;
}, () => filled(S.founders, S.staff));
function staffCostTable() {
  if (!R) return '';
  const rows = (S.staff || []).map((p, i) => { const k = R.staff[i]; if (!k) return ''; return `<tr><td>${esc(p.nom)}</td><td>${esc(p.contrat || '')}</td>${[0, 1, 2].map(y => `<td class="n">${k.calc[y] && k.calc[y].gross ? fmt(k.calc[y].gross) : '—'}</td>`).join('')}${[0, 1, 2].map(y => `<td class="n">${fmt(k.ann[y])}</td>`).join('')}<td>${k.smigWarn ? '<span class="pill crit">&lt; SMIG</span>' : ''}</td></tr>`; }).join('');
  const tot = [0, 1, 2].map(y => R.K.teamCost[y]);
  return `<div class="tw"><table><tr><th>Poste</th><th>Contrat</th><th class="n">Brut/mois An 1</th><th class="n">An 2</th><th class="n">An 3</th><th class="n">Coût annuel An 1</th><th class="n">An 2</th><th class="n">An 3</th><th></th></tr>${rows}<tr class="tot"><td colspan="5">Coût total de l'équipe</td>${tot.map(v => `<td class="n">${fmt(v)}</td>`).join('')}<td></td></tr></table></div>`;
}

sec('vision', 'Le projet', 'Cadrage & vision', 'Pourquoi ton projet existe et où il va : vision, mission, objectifs SMART, valeurs et impact.', () => `
${card('Vision, mission & raison d\'être', '', `<div class="grid g2">
 ${fText('vision.vision', 'Vision (où veux-tu aller dans 3-5 ans ?)', { area: true, help: 'Une phrase courte, inspirante, tournée vers l\'avenir.' })}
 ${fText('vision.mission', 'Mission (que fais-tu, pour qui, pourquoi ?)', { area: true })}
 ${fText('vision.impact', 'Raison d\'être & impact (social, environnemental, territorial)', { area: true, cls: '' })}
</div>`)}
${card('Objectifs SMART', 'Spécifiques, mesurables, atteignables, réalistes et datés. Ex. : « 120 exploitations abonnées et 80 000 DH de MRR au 31/12/2027 ».', `<div class="grid g2">
 ${['Année 1', 'Année 2', 'Année 3', 'Au-delà (3-5 ans)'].map((l, i) => fText(`vision.smart.${i}`, l, { area: true, rows: 2 })).join('')}</div>`)}
${card('Valeurs', '', fChips('vision.valeurs', '', L.L_Valeur || []))}
${card('Objectifs de développement durable (ODD)', '', fChips('vision.odd', '', L.L_ODD || []))}
`, () => filled(S.vision.vision, S.vision.mission, S.vision.smart[0], S.vision.valeurs));

sec('marche', 'Le projet', 'Marché, clients & benchmark', 'Le cœur du récit : marché, problème, solution, segments, concurrence (benchmark), personas et taille du marché (TAM → SAM → SOM).', () => {
  const m = S.market; const K = R ? R.K : null;
  const acteurs = ['Mon entreprise', ...(m.acteurs || [])];
  const totals = acteurs.map((_, j) => (m.criteres || []).reduce((s, c) => s + N(c.notes[j]), 0));
  const best = Math.max(...totals.slice(1), 0);
  return `<div class="banner"><span class="sp">L'assistant IA peut proposer une analyse de marché et un benchmark de concurrents à partir de ton projet. Tu relis et tu gardes ce qui est juste.</span><button class="btn pri ai" data-ai="market">Analyser mon marché avec l'IA</button></div><div id="ai-market"></div>
  ${card('1. Secteur, problème & solution', '', `<div class="grid g2">
   ${fText('market.tendances', 'Secteur & tendances (chiffres, croissance)', { area: true })}
   ${fText('market.probleme', 'Problème que tu résous (le « pain »)', { area: true })}
   ${fText('market.solution', 'Ta solution', { area: true })}
   ${fText('market.valeur', 'Proposition de valeur (pourquoi TOI ?)', { area: true })}
   ${fText('market.avantage', 'Avantage concurrentiel (difficile à copier)', { area: true })}
   ${fText('market.pourquoi', 'Pourquoi maintenant ?', { area: true })}
   ${fText('market.revenus', 'Comment tu gagnes de l\'argent (une phrase)', { area: true })}</div>`)}
  ${card('2. Segments & clients visés', '', fChips('market.segments', '', L.L_Cible || []))}
  ${card('3. Benchmark concurrentiel', 'Décris chaque acteur (directs, indirects, et « ne rien faire »).',
    tableEd('market.bench', [{ k: 'acteur', l: 'Acteur', w: 150 }, { k: 'offre', l: 'Offre', w: 140 }, { k: 'prix', l: 'Prix', w: 100 }, { k: 'positionnement', l: 'Positionnement', w: 110 }, { k: 'forces', l: 'Forces', t: 'area', w: 160 }, { k: 'faiblesses', l: 'Faiblesses', t: 'area', w: 160 }], { add: 'Ajouter un concurrent', newRow: { acteur: '', offre: '', prix: '', positionnement: '', forces: '', faiblesses: '' } }))}
  ${card('4. Grille de comparaison (note de 1 à 5)', totals[0] && totals[0] >= best ? '<span class="pill good">Ta position est la plus forte sur ces critères</span>' : (totals[0] ? '<span class="pill warn">Un acteur te dépasse : identifie où progresser</span>' : 'Choisis les critères qui comptent pour tes clients.'),
    `<div class="tw"><table class="et"><tr><th style="min-width:180px">Critère</th>${acteurs.map((a, j) => `<th class="n" style="min-width:110px">${j === 0 ? 'Mon entreprise' : `<input class="in" id="${fid('market.acteurs.' + (j - 1))}" data-p="market.acteurs.${j - 1}" value="${esc(a)}">`}</th>`).join('')}<th></th></tr>
    ${(m.criteres || []).map((c, i) => `<tr><td>${cellIn(`market.criteres.${i}.critere`, 'text', { list: 'L_Criteres' })}</td>${acteurs.map((_, j) => `<td>${cellIn(`market.criteres.${i}.notes.${j}`, 'num')}</td>`).join('')}<td class="x"><button class="del" data-act="del" data-arr="market.criteres" data-i="${i}">×</button></td></tr>`).join('')}
    <tr class="tot"><td>Total</td>${totals.map(t => `<td class="n">${t}</td>`).join('')}<td></td></tr></table></div>
    <div class="row" style="margin-top:8px"><button class="btn sm" data-act="add" data-arr="market.criteres" data-new='${esc(JSON.stringify({ critere: '', notes: ['', '', '', '', ''] }))}'>+ Critère</button><button class="btn sm" data-act="addacteur">+ Acteur</button></div>`)}
  ${card('5. Personas', 'Un client-type incarné par une personne : décris-en au moins 3.',
    tableEd('market.personas', [{ k: 'nom', l: 'Prénom, âge & lieu', w: 140 }, { k: 'profession', l: 'Profession', t: 'area', w: 140 }, { k: 'besoins', l: 'Besoins', t: 'area', w: 150 }, { k: 'freins', l: 'Freins', t: 'area', w: 150 }, { k: 'canaux', l: 'Où le trouver', t: 'area', w: 130 }, { k: 'budget', l: 'Budget', t: 'area', w: 120 }, { k: 'phrase', l: 'Sa phrase', t: 'area', w: 140 }, { k: 'offre', l: 'Offre associée', w: 130 }], { add: 'Ajouter un persona', newRow: {} }))}
  ${typeof MENA !== 'undefined' ? MENA.render() : ''}
  ${card('6. Taille du marché : TAM → SAM → SOM', 'Clients × dépense annuelle. Le SOM est ton objectif réaliste ; ton CA prévu doit rester en dessous.',
    `<div class="tw"><table class="et"><tr><th>Étape</th>${[0, 1, 2].map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>
     <tr><td>Nombre total de clients potentiels (TAM)</td>${[0, 1, 2].map(y => `<td>${cellIn(`market.tam.n.${y}`, 'num')}</td>`).join('')}</tr>
     <tr><td>Dépense annuelle par client (DH)</td>${[0, 1, 2].map(y => `<td>${cellIn(`market.tam.dep.${y}`, 'num')}</td>`).join('')}</tr>
     <tr class="tot"><td>→ TAM (DH/an)</td>${[0, 1, 2].map(y => `<td class="n">${K ? kdh(K.tam[y]) : ''}</td>`).join('')}</tr>
     <tr><td>% du TAM accessible (SAM)</td>${[0, 1, 2].map(y => `<td>${cellIn(`market.tam.pctSam.${y}`, 'pct')}</td>`).join('')}</tr>
     <tr><td>Dépense d'un client du SAM (vide = TAM)</td>${[0, 1, 2].map(y => `<td>${cellIn(`market.tam.depSam.${y}`, 'num')}</td>`).join('')}</tr>
     <tr class="tot"><td>→ SAM (DH/an)</td>${[0, 1, 2].map(y => `<td class="n">${K ? kdh(K.sam[y]) : ''}</td>`).join('')}</tr>
     <tr><td>Part de marché visée (% du SAM)</td>${[0, 1, 2].map(y => `<td>${cellIn(`market.tam.pctSom.${y}`, 'pct')}</td>`).join('')}</tr>
     <tr class="tot"><td>→ SOM : clients</td>${[0, 1, 2].map(y => `<td class="n">${K ? fmt(K.somN[y]) : ''}</td>`).join('')}</tr>
     <tr class="tot"><td>→ SOM (DH/an)</td>${[0, 1, 2].map(y => `<td class="n">${K ? kdh(K.som[y]) : ''}</td>`).join('')}</tr>
     <tr><td>CA prévu dans le BP</td>${[0, 1, 2].map(y => `<td class="n">${K ? kdh(K.ca[y]) : ''}</td>`).join('')}</tr>
     <tr><td>CA / SOM</td>${[0, 1, 2].map(y => { const v = K && K.caSom[y]; return `<td class="n">${v === null || v === undefined ? '—' : `${pc(v, 0)} ${v > 1 ? '<span class="pill crit">trop optimiste</span>' : v < .3 ? '<span class="pill warn">prudent</span>' : '<span class="pill good">cohérent</span>'}`}</td>`; }).join('')}</tr>
    </table></div>`)}`;
}, () => filled(S.market.probleme, S.market.solution, S.market.segments, S.market.personas, S.market.tam.n[0]));

sec('offre', 'Le projet', 'Offre & business model', 'Le Business Model Canvas résume sur une page comment ton entreprise crée et gagne de l\'argent.', () => {
  const lists = ['L_BMC1', 'L_BMC2', 'L_BMC3', 'L_BMC4', 'L_BMC5', 'L_BMC6', 'L_BMC7', 'L_BMC8', 'L_BMC9'];
  return card('Business Model Canvas', 'Choisis jusqu\'à 6 éléments par bloc, puis précise en chiffres.', S.bmc.map((b, i) => `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><h3 style="margin-bottom:6px">${esc(b.bloc)}</h3>${fChips(`bmc.${i}.choix`, '', L[lists[i]] || [])}<div style="margin-top:8px">${fText(`bmc.${i}.details`, '', { area: true, rows: 2, ph: 'Détails (chiffres, explications)' })}</div></div>`).join(''))
  + card('Modèle de revenus & stratégie de prix', '', `<div class="grid g2">
   ${fText('pricing.modele', 'Modèle de revenus principal', { list: 'L_PType' })} ${fText('pricing.modeleTxt', 'Explication', {})}
   ${fText('pricing.modele2', 'Modèle complémentaire', { list: 'L_PType' })} ${fText('pricing.modele2Txt', 'Explication')}
   ${fText('pricing.strategie', 'Stratégie de prix', { list: 'L_PrixStrat' })} ${fText('pricing.strategieTxt', 'Explication')}
   ${fText('pricing.gamme', 'Positionnement prix / gamme', { list: 'L_Gamme' })} ${fText('pricing.gammeTxt', 'Explication')}
   ${fText('pricing.conditions', 'Conditions de vente & de paiement', { area: true })} ${fText('pricing.remises', 'Remises / fidélité / prix revendeurs', { area: true })}</div>`)
  + card('Fournisseurs & partenaires clés', '', tableEd('partners', [{ k: 'nom', l: 'Nom', w: 180 }, { k: 'role', l: 'Rôle', w: 120 }, { k: 'fournit', l: 'Ce qu\'il fournit', t: 'area', w: 200 }, { k: 'conditions', l: 'Conditions', t: 'area', w: 200 }], { add: 'Ajouter un partenaire' }));
}, () => filled(S.bmc[0].choix, S.bmc[1].choix, S.bmc[4].choix, S.pricing.modele));

sec('marketing', 'Le projet', 'Communication & marketing', 'Message, mix marketing (7P), canaux avec leur budget mensuel et actions de lancement. Les budgets alimentent automatiquement les charges.', () => `
${card('Positionnement & message', '', `<div class="grid g2">
 ${fText('mkt.positionnement', 'Positionnement', { area: true, help: 'Pour qui, quel bénéfice, contre quelle alternative.' })}
 ${fText('mkt.message', 'Message clé / accroche', { area: true })}
 ${fText('mkt.ton', 'Ton de marque', { list: 'L_Ton' })} ${fText('mkt.persona', 'Persona principal visé')}
 ${fText('mkt.promesse', 'Promesse & preuves', { area: true })} ${fText('mkt.difference', 'Ta différence face au concurrent principal', { area: true })}</div>`)}
${card('Mix marketing (4P + 3P)', '', `<div class="grid g2">
 ${fText('mkt.produit', 'Produit', { area: true })} ${fText('mkt.prix', 'Prix', { area: true })}
 ${fText('mkt.place', 'Place (distribution)', { area: true })} ${fText('mkt.promotion', 'Promotion', { area: true })}
 ${fText('mkt.personnes', 'Personnes', { area: true })} ${fText('mkt.processus', 'Processus', { area: true })}
 ${fText('mkt.preuve', 'Preuve physique', { area: true })}</div>`)}
${card('Canaux d\'acquisition & budget MENSUEL HT', 'Vide en année 2 ou 3 = budget précédent + inflation ; 0 pour arrêter le canal.',
  `<div class="grid g3" style="margin-bottom:10px">${fDate('mkt.debut', 'Début des campagnes récurrentes', { help: 'Vide = démarrage des ventes' })}</div>` +
  tableEd('mkt.canaux', [{ k: 'canal', l: 'Canal', list: 'L_Canal', w: 170 }, { k: 'objectif', l: 'Objectif', list: 'L_ObjMkt', w: 150 }, { k: 'budget.0', l: 'Budget/mois An 1', t: 'num', w: 90 }, { k: 'budget.1', l: 'An 2', t: 'num', w: 80 }, { k: 'budget.2', l: 'An 3', t: 'num', w: 80 }, { k: 'kpi', l: 'KPI suivi', list: 'L_KPI', w: 150 }], { add: 'Ajouter un canal', newRow: { canal: '', objectif: '', budget: ['', '', ''], kpi: '' } }))}
${card('Actions de lancement & ponctuelles', 'Chaque budget est passé en charge à sa date.',
  tableEd('mkt.actions', [{ k: 'action', l: 'Action', w: 220 }, { k: 'canal', l: 'Canal', list: 'L_Canal', w: 140 }, { k: 'date', l: 'Date', t: 'date' }, { k: 'budget', l: 'Budget HT', t: 'num', w: 90 }, { k: 'statut', l: 'Statut', t: 'sel', opts: L.L_Statut2 || ['À faire', 'En cours', 'Fait'], w: 100 }], { add: 'Ajouter une action', newRow: { action: '', canal: '', date: '', budget: '', statut: 'À faire' } }))}
${R ? card('Budget marketing calculé', '', `<div class="tw"><table><tr><th></th>${[0, 1, 2].map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr><tr><td>Budget marketing total HT</td>${R.K.mkt.map(v => `<td class="n">${fmt(v)}</td>`).join('')}</tr><tr><td>Marketing / CA</td>${R.K.mktRatio.map(v => `<td class="n">${pc(v)}</td>`).join('')}</tr></table></div>`) : ''}
`, () => filled(S.mkt.positionnement, S.mkt.message, S.mkt.canaux));

sec('plan', 'Le projet', 'Plan d\'actions & Gantt', 'Découpe ton projet en actions datées, avec un responsable. Le diagramme de Gantt se dessine tout seul sur 36 mois.', () => {
  const st = new Date((S.hyp.start || nextJan()) + 'T00:00:00');
  const mi = ds => { if (!ds) return null; const d = new Date(ds + 'T00:00:00'); return (d.getFullYear() - st.getFullYear()) * 12 + d.getMonth() - st.getMonth() + 1; };
  const rows = (S.plan || []).map(p => { const a = Math.max(1, mi(p.debut) || 1), b = Math.min(36, mi(p.fin) || a); if (a > 36 || b < 1) return ''; const cls = p.statut === 'Fait' ? 'fait' : p.statut === 'En cours' ? 'cours' : ''; return `<div class="gr"><div class="gl" title="${esc(p.action)}">${esc(p.action)}</div><div class="gb ${cls}" style="grid-column:${a + 1} / ${b + 2}"></div></div>`; }).join('');
  const hdr = `<div class="gr"><div class="gl muted">Action</div>${Array.from({ length: 36 }, (_, i) => `<div class="${i % 12 === 0 ? 'yr' : ''}">${i % 3 === 0 ? MO[(st.getMonth() + i) % 12].slice(0, 3) : ''}</div>`).join('')}</div>`;
  return card('Plan d\'actions', '', tableEd('plan', [{ k: 'action', l: 'Action', w: 240 }, { k: 'phase', l: 'Phase', list: 'L_Phase', w: 140 }, { k: 'resp', l: 'Responsable', w: 110 }, { k: 'debut', l: 'Début', t: 'date' }, { k: 'fin', l: 'Fin', t: 'date' }, { k: 'statut', l: 'Statut', t: 'sel', opts: L.L_Statut2 || ['À faire', 'En cours', 'Fait'], w: 100 }], { add: 'Ajouter une action', newRow: { action: '', phase: '', resp: '', debut: '', fin: '', statut: 'À faire' } }))
    + card('Diagramme de Gantt (36 mois)', '<span class="pill good">Fait</span> <span class="pill warn">En cours</span> <span class="pill mut">À faire</span>', `<div class="gantt">${hdr}${rows}</div>`);
}, () => filled(S.plan));

const PESTEL = [['P', 'Politique', 'Stabilité, politiques publiques, programmes d\'appui, commande publique'], ['E', 'Économique', 'Croissance, inflation, change, pouvoir d\'achat, accès au financement'], ['S', 'Socioculturel', 'Démographie, habitudes, langue, confiance, éducation'], ['T', 'Technologique', 'Innovations, digitalisation, coût des technologies, infrastructures'], ['En', 'Écologique', 'Climat, eau, énergie, déchets, attentes environnementales'], ['L', 'Légal', 'Fiscalité, droit du travail, normes, homologations, données personnelles (loi 09-08)']];
sec('pestel', 'Le projet', 'Analyse PESTEL', 'Les forces de l\'environnement qui influencent ton projet. Indique pour chaque facteur s\'il joue en ta faveur (+) ou contre toi (−). Les facteurs alimentent les opportunités et menaces du SWOT.', () =>
  `<div class="banner"><span class="sp">L'IA peut proposer une analyse PESTEL adaptée à ton secteur et au Maroc.</span><button class="btn pri ai" data-ai="pestel">Générer le PESTEL avec l'IA</button></div><div id="ai-pestel"></div>
  <div class="pestel">${PESTEL.map(([k, t, h]) => `<div class="sq ${''}" style="border-top:3px solid var(--primary)"><h4>${t}</h4><p class="small muted" style="margin-bottom:8px">${h}</p>
   <div class="list-ed">${(S.pestel[k] || []).map((x, i) => `<div class="li"><select class="in" style="width:58px;flex:none" data-p="pestel.${k}.${i}.s" id="${fid(`pestel.${k}.${i}.s`)}"><option ${x.s === '+' ? 'selected' : ''}>+</option><option value="-" ${x.s === '-' ? 'selected' : ''}>−</option><option value="=" ${x.s === '=' ? 'selected' : ''}>=</option></select><input class="in" data-p="pestel.${k}.${i}.t" id="${fid(`pestel.${k}.${i}.t`)}" value="${esc(x.t)}"><button class="del" data-act="del" data-arr="pestel.${k}" data-i="${i}">×</button></div>`).join('')}
   <div><button class="btn sm ghost" data-act="add" data-arr="pestel.${k}" data-new='{"t":"","s":"+"}'>+ Ajouter</button></div></div></div>`).join('')}</div>
  <div class="row" style="margin-top:14px"><button class="btn" data-act="pestel2swot">Reporter les facteurs + / − dans les opportunités / menaces du SWOT</button></div>`,
  () => { const n = Object.values(S.pestel).filter(a => a.length).length; return n === 0 ? 0 : n >= 5 ? 2 : 1; });

sec('swot', 'Le projet', 'SWOT & stratégies', 'Une photo honnête de ta situation, puis la matrice TOWS pour passer de l\'analyse à l\'action.', () => `
<div class="banner"><span class="sp">L'IA lit ton projet (marché, offres, équipe, chiffres, PESTEL) et propose un SWOT et des stratégies croisées.</span><button class="btn pri ai" data-ai="swot">Proposer SWOT & stratégies</button></div><div id="ai-swot"></div>
<div class="swot">
 <div class="sq s"><h4>Forces — interne, positif</h4>${listEd('swot.S', 'Ce que tu fais mieux que les autres')}</div>
 <div class="sq w"><h4>Faiblesses — interne, négatif</h4>${listEd('swot.W', 'Ce qui te manque aujourd\'hui')}</div>
 <div class="sq o"><h4>Opportunités — externe, positif</h4>${listEd('swot.O', 'Tendance, loi, programme, marché')}</div>
 <div class="sq t"><h4>Menaces — externe, négatif</h4>${listEd('swot.T', 'Concurrence, prix, réglementation…')}</div>
</div>
<h2 style="margin:22px 0 10px">Stratégies croisées (matrice TOWS)</h2>
<div class="swot">
 <div class="sq s"><h4>S × O — Attaquer</h4><p class="small muted">Utilise tes forces pour saisir les opportunités.</p>${listEd('swot.SO', 'Verbe + résultat attendu')}</div>
 <div class="sq o"><h4>W × O — Améliorer</h4><p class="small muted">Corrige tes faiblesses grâce aux opportunités.</p>${listEd('swot.WO')}</div>
 <div class="sq w"><h4>S × T — Défendre</h4><p class="small muted">Utilise tes forces pour contrer les menaces.</p>${listEd('swot.ST')}</div>
 <div class="sq t"><h4>W × T — Se protéger</h4><p class="small muted">Réduis tes faiblesses pour éviter les menaces.</p>${listEd('swot.WT')}</div>
</div>`, () => filled(S.swot.S, S.swot.W, S.swot.O, S.swot.T, S.swot.SO));

sec('risques', 'Le projet', 'Risques', 'Probabilité (1-3) × impact (1-3) = criticité. Traite d\'abord les risques notés 6 à 9.', () => card('Matrice des risques', '', tableEd('risks', [{ k: 'risque', l: 'Risque', w: 200 }, { k: 'cat', l: 'Catégorie', list: 'L_RisqueCat', w: 150 }, { k: 'p', l: 'Proba.', t: 'sel', opts: [1, 2, 3], w: 60, t2: 'num' }, { k: 'i', l: 'Impact', t: 'sel', opts: [1, 2, 3], w: 60 },
  { k: 'crit', l: 'Criticité', render: r => { const c = N(r.p) * N(r.i); return c ? `<span class="pill ${c >= 6 ? 'crit' : c >= 3 ? 'warn' : 'good'}">${c}</span>` : ''; } },
  { k: 'plan', l: 'Plan d\'atténuation', t: 'area', w: 220 }, { k: 'resp', l: 'Responsable', w: 100 }, { k: 'ech', l: 'Échéance', t: 'date' }], { add: 'Ajouter un risque', newRow: { risque: '', cat: '', p: 2, i: 2, plan: '', resp: '', ech: '' } })),
  () => filled(S.risks));
