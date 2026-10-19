/* ================= PlanBiz : passerelle IA (template, import, génération intégrée) ================= */
const PB_VERSION = '1.0';
const PB_BMC = ['segments_clients', 'proposition_valeur', 'canaux', 'relations_clients', 'sources_revenus', 'ressources_cles', 'activites_cles', 'partenaires_cles', 'structure_couts'];
const PB_PEST = { politique: 'P', economique: 'E', socioculturel: 'S', technologique: 'T', ecologique: 'En', legal: 'L' };
const PB_SWOT = { forces: 'S', faiblesses: 'W', opportunites: 'O', menaces: 'T', strategies_so: 'SO', strategies_wo: 'WO', strategies_st: 'ST', strategies_wt: 'WT' };
const IMP = { text: '', ctx: '', interview: true, parsed: null, state: null, warns: [], err: '' };

function pbSkeleton() {
  const y3 = t => [t + ' an 1', t + ' an 2', t + ' an 3'];
  return {
    planbiz_version: PB_VERSION,
    projet: { nom: 'texte', slogan: 'texte', pitch: 'une phrase : qui, quoi, pour qui, pourquoi toi', date_creation: 'AAAA-MM-JJ', stade: 'Idée | Prototype / MVP | Premiers clients | …', secteur: 'texte', activite: 'texte', ville: 'texte', region: 'texte', porteurs: 'Nom (rôle), …', email: 'texte', telephone: 'texte', site_web: 'texte' },
    vision: { vision: 'texte', mission: 'texte', impact: 'texte', objectifs_smart: { an1: 'objectif chiffré et daté', an2: 'texte', an3: 'texte', au_dela: 'texte' }, valeurs: ['texte'], odd: ['ex. 6. Eau propre et assainissement'] },
    equipe: {
      fondateurs: [{ nom: 'texte', role: 'texte', competences: 'texte', annees_experience: 0, pct_temps: 1, pct_capital: 0.5, diplome: 'texte' }],
      personnel: [{ poste: 'texte', role: 'texte', contrat: 'valeur de la liste CONTRATS', date_entree: 'AAAA-MM-JJ', date_sortie: 'AAAA-MM-JJ ou vide', net_mensuel: y3('salaire NET mensuel DH'), personnes_a_charge: 0 }]
    },
    marche: {
      tendances: 'texte', probleme: 'texte', solution: 'texte', proposition_valeur: 'texte', avantage_concurrentiel: 'texte', pourquoi_maintenant: 'texte', comment_on_gagne_de_l_argent: 'texte', segments: ['texte'],
      concurrents: [{ nom: 'texte', offre: 'texte', prix: 'texte', positionnement: 'texte', forces: 'texte', faiblesses: 'texte' }],
      grille_comparaison: { criteres: ['Prix / compétitivité', '…'], notes_mon_entreprise: [4], notes_par_concurrent: [[3]] },
      personas: [{ nom_age_lieu: 'texte', profession: 'texte', besoins: 'texte', freins: 'texte', canaux: 'texte', budget: 'texte', phrase: 'texte', offre_associee: 'texte' }],
      taille_marche: { clients_potentiels: y3('nombre'), depense_annuelle_par_client: y3('DH'), pct_accessible_sam: y3('décimal ex. 0.25'), depense_client_sam: y3('DH ou vide'), part_de_marche_som: y3('décimal ex. 0.01') }
    },
    business_model: Object.fromEntries(PB_BMC.map(k => [k, { choix: ['texte'], details: 'texte' }])),
    prix: { modele_principal: 'valeur de MODELES_REVENU', modele_complementaire: 'texte', strategie: 'texte', positionnement: 'texte', conditions_vente: 'texte', remises: 'texte' },
    partenaires: [{ nom: 'texte', role: 'texte', fournit: 'texte', conditions: 'texte' }],
    marketing: {
      positionnement: 'texte', message: 'texte', ton: 'texte', promesse: 'texte', difference: 'texte',
      produit: 'texte', prix: 'texte', distribution: 'texte', promotion: 'texte', personnes: 'texte', processus: 'texte', preuve_physique: 'texte', date_debut_campagnes: 'AAAA-MM-JJ',
      canaux: [{ canal: 'texte', objectif: 'texte', budget_mensuel_ht: y3('DH par mois'), kpi: 'texte' }],
      actions: [{ action: 'texte', canal: 'texte', date: 'AAAA-MM-JJ', budget_ht: 0, statut: 'À faire | En cours | Fait' }]
    },
    plan_actions: [{ action: 'texte', phase: 'texte', responsable: 'texte', debut: 'AAAA-MM-JJ', fin: 'AAAA-MM-JJ', statut: 'À faire | En cours | Fait' }],
    pestel: Object.fromEntries(Object.keys(PB_PEST).map(k => [k, [{ facteur: 'texte', effet: '+ | - | =' }]])),
    swot: Object.fromEntries(Object.keys(PB_SWOT).map(k => [k, ['texte']])),
    risques: [{ risque: 'texte', categorie: 'texte', probabilite: '1 à 3', impact: '1 à 3', plan_attenuation: 'texte', responsable: 'texte', echeance: 'AAAA-MM-JJ' }],
    hypotheses: { profil: 'valeur de PROFILS', statut_juridique: y3('valeur de STATUTS'), nature_activite_auto_entrepreneur: 'Commerce | Industrie | Artisanat | Services', date_debut_plan: 'AAAA-MM-01', date_debut_ventes: 'AAAA-MM-JJ', saisonnalite_12_mois: ['coefficient janvier (1 = normal)', '… 12 valeurs'], inflation: 0.02, repercuter_inflation_sur_prix: 'Oui | Non', delai_clients_jours: 30, delai_fournisseurs_jours: 30, tresorerie_securite_dh: 50000, part_benefice_distribuee: [0, 0, 0], prelevements_mensuels_auto_entrepreneur: [0, 0, 0] },
    offres: [{ nom: 'texte', modele_revenu: 'valeur de MODELES_REVENU', cible: 'texte', unite: 'texte', positionnement_prix: 'texte', tva: 0.2, recurrent: 'Oui | Non', date_lancement: 'AAAA-MM-JJ ou vide', prix_unitaire_ht: y3('DH'), volume_mensuel: { pessimiste: y3('unités/mois'), realiste: y3('unités/mois'), optimiste: y3('unités/mois') }, couts_variables_unitaires: [{ libelle: 'texte', rubrique: 'valeur de RUBRIQUES', tva: 0.2, cout_unitaire_ht: y3('DH') }] }],
    stocks_fin_annee: { marchandises: y3('DH'), matieres: y3('DH'), produits_finis: y3('DH') },
    situation_depart: { tresorerie: 0, stock: 0, immobilisations_existantes: [{ libelle: 'texte', type: 'valeur de TYPES_INVESTISSEMENT', date: 'AAAA-MM-JJ', valeur_ht: 0 }] },
    investissements: [{ libelle: 'texte', type: 'valeur de TYPES_INVESTISSEMENT', date: 'AAAA-MM-JJ', montant_ht: 0, paiement: 'En une fois | Échelonné', nb_versements: 1, date_premier_versement: 'AAAA-MM-JJ ou vide', taux_amortissement: 'vide = taux DGI du type' }],
    charges_fixes: [{ libelle: 'texte', rubrique: 'valeur de RUBRIQUES (option)', date_debut: 'AAAA-MM-JJ', date_fin: 'AAAA-MM-JJ ou vide', periodicite: 'valeur de PERIODICITES', tva: 'Oui | Non', montant_mensuel_ht: y3('DH par mois') }],
    charges_ponctuelles: [{ libelle: 'texte', rubrique: 'valeur de RUBRIQUES (option)', date: 'AAAA-MM-JJ', montant_ht: 0, tva: 'Oui | Non' }],
    financements: [{ source: 'texte', nature: 'valeur de NATURES_FINANCEMENT', montant: 0, date: 'AAAA-MM-JJ', duree_reprise_ans: 'seulement pour une subvention d\'investissement' }],
    emprunts: [{ type: 'texte', preteur: 'texte', montant: 0, taux_annuel: 0.05, duree_mois: 60, differe_mois: 0, type_differe: 'valeur de TYPES_DIFFERE', date_deblocage: 'AAAA-MM-JJ' }],
    clients: { actifs_au_depart: 0, nouveaux_par_an: [0, 0, 0], actifs_fin_annee: [0, 0, 0], churn_mensuel: [0.03, 0.03, 0.03], depenses_commerciales_hors_marketing: [0, 0, 0], expansion_revenu_clients: [0, 0, 0] },
    strategie: 'texte : positionnement, conquête, financement, priorités 12 mois',
    a_verifier: ['hypothèses que tu as dû supposer faute d\'information']
  };
}
function pbLists() {
  const l = (t, a) => `${t} :\n${a.map(x => '- ' + x).join('\n')}`;
  return [l('PROFILS', PROFILS), l('STATUTS', L.L_Statut || []), l('CONTRATS', (L.M_Contrat || []).map(r => r[0])), l('MODELES_REVENU', (L.M_PType || []).map(r => r[0])), l('RUBRIQUES', E.RUB),
    l('TYPES_INVESTISSEMENT', (L.InvTypes || []).map(r => r[0])), l('NATURES_FINANCEMENT', L.L_Nature || []), l('PERIODICITES', (L.M_Periodicite || []).map(r => r[0])), l('TYPES_DIFFERE', L.L_DiffType || [])].join('\n\n');
}
function pbPrompt(interview) {
  return `# Template PlanBiz — génération de mon business plan

Tu es un analyste financier spécialisé dans les startups, TPME et coopératives au Maroc. Ta mission : transformer les informations de mon projet en un fichier de données qui sera importé dans l'application PlanBiz. PlanBiz calcule ensuite tout seul le compte de produits et charges, la trésorerie sur 36 mois, le bilan, les indicateurs et rédige le business plan.

${interview ? `## Étape 1 — Entretien
Avant de produire le fichier, pose-moi les questions nécessaires, par petits groupes de 3 à 5 questions, en commençant par : le projet et le problème résolu, les clients, les offres (prix, volumes mensuels, coûts unitaires), l'équipe et les salaires nets, les charges fixes, les investissements, les financements, puis le marché et la concurrence. Si j'ai déjà fourni des documents, ne me demande que ce qui manque. Quand tu as assez d'éléments (ou si je te dis « génère »), passe à l'étape 2.

## Étape 2 — Fichier PlanBiz` : `## Production du fichier PlanBiz
Utilise les informations que je fournis ci-dessous ou dans les documents joints. Quand une donnée manque, propose une hypothèse prudente et réaliste pour le Maroc, et note-la dans « a_verifier ».`}
Réponds avec UN SEUL bloc de code JSON, sans texte avant ni après, qui respecte exactement la structure ci-dessous.

Règles :
- Montants en dirhams (DH), hors taxes, sans espaces ni symboles : 12000 et pas « 12 000 DH ».
- Pourcentages en décimales : 0.2 pour 20 %.
- Dates au format AAAA-MM-JJ.
- Les listes de 3 valeurs correspondent à l'année 1, l'année 2 et l'année 3 du plan. Laisse "" pour reprendre la valeur de l'année précédente.
- Volumes = unités vendues PAR MOIS en moyenne (pas par an).
- Salaires du personnel : montants NETS mensuels. PlanBiz calcule le brut, la CNSS/AMO, l'IR et le coût employeur.
- Pour les champs marqués « valeur de LISTE », reprends exactement une valeur de la liste correspondante plus bas.
- Remplis au moins : projet, hypotheses, offres, equipe, charges_fixes, investissements et financements. Les sections marché, business model, marketing, PESTEL, SWOT, risques et stratégie enrichissent le document final.
- Ne recopie pas les textes d'aide de la structure : remplace-les par mes données ou supprime l'élément.
- Liste dans « a_verifier » toutes les hypothèses que tu as inventées.

## Structure attendue
\`\`\`json
${JSON.stringify(pbSkeleton(), null, 1)}
\`\`\`

## Listes de valeurs autorisées
${pbLists()}

## Mes informations
(Colle ici ton pitch, tes notes, ton deck, tes chiffres… ou joins tes documents.)
`;
}

/* ---- conversion tolérante ---- */
const nrm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function pbPick(v, options, field, warns, def = '') {
  if (isB(v)) return def;
  const n = nrm(v); if (!n) return def;
  const opts = options.filter(o => nrm(o).length >= 2);
  let hit = opts.find(o => nrm(o) === n) || (n.length >= 3 ? opts.find(o => nrm(o).startsWith(n + ' ') || n.startsWith(nrm(o) + ' ')) : null);
  if (!hit) {
    const tk = n.split(' ').filter(w => w.length > 2); let best = null, sc = 0;
    opts.forEach(o => { const on = nrm(o); const s = tk.filter(w => on.includes(w)).length / Math.max(1, tk.length); if (s > sc) { sc = s; best = o; } });
    if (sc > 0.5) hit = best;
  }
  if (!hit) { warns.push(`${field} : « ${v} » ne correspond à aucune valeur connue${def ? `, remplacé par « ${def} »` : ''}.`); return def || String(v); }
  if (nrm(hit) !== n) warns.push(`${field} : « ${v} » interprété comme « ${hit} ».`);
  return hit;
}
function pbNum(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') return isFinite(v) ? v : '';
  let s = String(v).trim(); const isP = s.includes('%');
  s = s.replace(/[^\d,.\-]/g, ''); if (!s) return '';
  if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, ''); else s = s.replace(',', '.');
  const x = parseFloat(s); if (isNaN(x)) return '';
  return isP ? x / 100 : x;
}
function pbPct(v) { const x = pbNum(v); if (x === '') return ''; return Math.abs(x) > 1 ? x / 100 : x; }
function pbArr3(v, f = pbNum) {
  if (Array.isArray(v)) return [0, 1, 2].map(i => f(v[i]));
  if (v && typeof v === 'object') return [v.an1 ?? v.annee1 ?? v['1'], v.an2 ?? v.annee2 ?? v['2'], v.an3 ?? v.annee3 ?? v['3']].map(x => f(x));
  if (isB(v)) return ['', '', ''];
  return [f(v), '', ''];
}
function pbDate(v) {
  if (isB(v)) return ''; const s = String(v).trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  if ((m = s.match(/^(\d{4})-(\d{1,2})$/))) return `${m[1]}-${m[2].padStart(2, '0')}-01`;
  if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/))) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  if ((m = s.match(/^(\d{1,2})[\/.-](\d{4})$/))) return `${m[2]}-${m[1].padStart(2, '0')}-01`;
  const d = new Date(s); return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}
const pbStr = v => isB(v) ? '' : Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
const pbList = v => Array.isArray(v) ? v.map(pbStr).filter(Boolean) : isB(v) ? [] : String(v).split(/\n|;/).map(s => s.trim()).filter(Boolean);
const pbYN = v => (v === true || nrm(v) === 'oui' || nrm(v) === 'yes' || nrm(v) === 'true') ? 'Oui' : (v === false || ['non', 'no', 'false'].includes(nrm(v))) ? 'Non' : '';

function planbizToState(j) {
  const w = []; const p = blankProject(); p.meta = { example: false, imported: new Date().toISOString(), source: 'PlanBiz IA' };
  const g = (o, k) => (o && o[k] !== undefined) ? o[k] : undefined;
  const pr = j.projet || {};
  Object.assign(p.id, { nom: pbStr(pr.nom), slogan: pbStr(pr.slogan), pitch: pbStr(pr.pitch), date: pbDate(pr.date_creation), stade: pbStr(pr.stade), secteur: pbStr(pr.secteur), activite: pbStr(pr.activite), ville: pbStr(pr.ville), region: pbStr(pr.region), porteurs: pbStr(pr.porteurs), email: pbStr(pr.email), tel: pbStr(pr.telephone), web: pbStr(pr.site_web) });
  const vi = j.vision || {}; const sm = vi.objectifs_smart || {};
  Object.assign(p.vision, { vision: pbStr(vi.vision), mission: pbStr(vi.mission), impact: pbStr(vi.impact), smart: Array.isArray(sm) ? [0, 1, 2, 3].map(i => pbStr(sm[i])) : [sm.an1, sm.an2, sm.an3, sm.au_dela].map(pbStr), valeurs: pbList(vi.valeurs), odd: pbList(vi.odd) });
  const H = j.hypotheses || {};
  p.hyp.profil = pbPick(H.profil, PROFILS, 'Profil', w, PROFILS[0]);
  const stt = pbArr3(H.statut_juridique, x => x); const st0 = pbPick(stt[0] || 'SARL', L.L_Statut, 'Statut An 1', w, 'SARL');
  p.hyp.statut = [st0, stt[1] ? pbPick(stt[1], L.L_Statut, 'Statut An 2', w, st0) : st0, ''];
  p.hyp.statut[2] = stt[2] ? pbPick(stt[2], L.L_Statut, 'Statut An 3', w, p.hyp.statut[1]) : p.hyp.statut[1];
  if (H.nature_activite_auto_entrepreneur) p.hyp.aeNature = pbPick(H.nature_activite_auto_entrepreneur, ['Commerce', 'Industrie', 'Artisanat', 'Services'], 'Nature AE', w, 'Services');
  p.hyp.start = (pbDate(H.date_debut_plan) || nextJan()).slice(0, 8) + '01';
  p.hyp.ventes = pbDate(H.date_debut_ventes);
  if (Array.isArray(H.saisonnalite_12_mois)) p.hyp.saison = Array.from({ length: 12 }, (_, i) => pbNum(H.saisonnalite_12_mois[i]));
  if (!isB(H.inflation)) p.hyp.inflation = pbPct(H.inflation);
  if (H.repercuter_inflation_sur_prix) p.hyp.inflPrix = pbYN(H.repercuter_inflation_sur_prix) || 'Non';
  if (!isB(H.delai_clients_jours)) p.hyp.delaiClient = pbNum(H.delai_clients_jours);
  if (!isB(H.delai_fournisseurs_jours)) p.hyp.delaiFourn = pbNum(H.delai_fournisseurs_jours);
  if (!isB(H.tresorerie_securite_dh)) p.hyp.coussin = pbNum(H.tresorerie_securite_dh);
  if (H.part_benefice_distribuee) p.hyp.distrib = pbArr3(H.part_benefice_distribuee, pbPct).map(x => x === '' ? 0 : x);
  if (H.prelevements_mensuels_auto_entrepreneur) p.hyp.prelev = pbArr3(H.prelevements_mensuels_auto_entrepreneur).map(x => x === '' ? 0 : x);
  const eq = j.equipe || {};
  p.founders = (eq.fondateurs || []).map(f => ({ nom: pbStr(f.nom), role: pbStr(f.role), comp: pbStr(f.competences), exp: pbNum(f.annees_experience), temps: isB(f.pct_temps) ? 1 : pbPct(f.pct_temps), capital: pbPct(f.pct_capital), diplome: pbStr(f.diplome) }));
  const contrats = (L.M_Contrat || []).map(r => r[0]);
  p.staff = (eq.personnel || []).map((s, i) => ({ nom: pbStr(s.poste || s.nom), role: pbStr(s.role), contrat: (() => { const c = pbPick(s.contrat || 'CDI', contrats, `Personnel « ${pbStr(s.poste)} » — contrat`, [], ''); if (c && contrats.includes(c)) { if (nrm(c) !== nrm(s.contrat || 'CDI')) w.push(`Personnel « ${pbStr(s.poste)} » : contrat « ${s.contrat} » interprété comme « ${c} ».`); return c; } w.push(`Personnel « ${pbStr(s.poste)} » : contrat « ${s.contrat} » non listé, traité comme un salarié.`); return pbStr(s.contrat); })(), debut: pbDate(s.date_entree) || p.hyp.start, fin: pbDate(s.date_sortie), net: pbArr3(s.net_mensuel), dep: pbNum(s.personnes_a_charge) || 0 }));
  const M = j.marche || {};
  Object.assign(p.market, { tendances: pbStr(M.tendances), probleme: pbStr(M.probleme), solution: pbStr(M.solution), valeur: pbStr(M.proposition_valeur), avantage: pbStr(M.avantage_concurrentiel), pourquoi: pbStr(M.pourquoi_maintenant), revenus: pbStr(M.comment_on_gagne_de_l_argent), segments: pbList(M.segments) });
  p.market.bench = (M.concurrents || []).map(c => ({ acteur: pbStr(c.nom), offre: pbStr(c.offre), prix: pbStr(c.prix), positionnement: pbStr(c.positionnement), forces: pbStr(c.forces), faiblesses: pbStr(c.faiblesses) }));
  const gc = M.grille_comparaison || {};
  if ((gc.criteres || []).length && p.market.bench.length) {
    p.market.acteurs = p.market.bench.map(b => b.acteur);
    p.market.criteres = gc.criteres.map((c, i) => ({ critere: pbStr(c), notes: [pbNum((gc.notes_mon_entreprise || [])[i]), ...p.market.bench.map((_, k) => pbNum(((gc.notes_par_concurrent || [])[k] || [])[i]))] }));
  } else if (p.market.bench.length) { p.market.acteurs = p.market.bench.map(b => b.acteur); p.market.criteres.forEach(c => c.notes = Array(p.market.acteurs.length + 1).fill('')); }
  p.market.personas = (M.personas || []).map(x => ({ nom: pbStr(x.nom_age_lieu || x.nom), profession: pbStr(x.profession), besoins: pbStr(x.besoins), freins: pbStr(x.freins), canaux: pbStr(x.canaux), budget: pbStr(x.budget), phrase: pbStr(x.phrase), offre: pbStr(x.offre_associee) }));
  const tm = M.taille_marche || {};
  p.market.tam = { n: pbArr3(tm.clients_potentiels), dep: pbArr3(tm.depense_annuelle_par_client), pctSam: pbArr3(tm.pct_accessible_sam, pbPct), depSam: pbArr3(tm.depense_client_sam), pctSom: pbArr3(tm.part_de_marche_som, pbPct) };
  ['n', 'dep', 'pctSam', 'pctSom'].forEach(k => { const a = p.market.tam[k]; for (let y = 1; y < 3; y++) if (a[y] === '' && a[y - 1] !== '') a[y] = a[y - 1]; });
  const bm = j.business_model || {};
  PB_BMC.forEach((k, i) => { const b = bm[k]; if (!b) return; p.bmc[i].choix = pbList(Array.isArray(b) ? b : b.choix).slice(0, 6); p.bmc[i].details = Array.isArray(b) ? '' : pbStr(b.details); });
  const px = j.prix || {};
  p.pricing = { modele: pbStr(px.modele_principal), modele2: pbStr(px.modele_complementaire), strategie: pbStr(px.strategie), gamme: pbStr(px.positionnement), conditions: pbStr(px.conditions_vente), remises: pbStr(px.remises) };
  p.partners = (j.partenaires || []).map(x => ({ nom: pbStr(x.nom), role: pbStr(x.role), fournit: pbStr(x.fournit), conditions: pbStr(x.conditions) }));
  const mk = j.marketing || {};
  Object.assign(p.mkt, { positionnement: pbStr(mk.positionnement), message: pbStr(mk.message), ton: pbStr(mk.ton), promesse: pbStr(mk.promesse), difference: pbStr(mk.difference), produit: pbStr(mk.produit), prix: pbStr(mk.prix), place: pbStr(mk.distribution), promotion: pbStr(mk.promotion), personnes: pbStr(mk.personnes), processus: pbStr(mk.processus), preuve: pbStr(mk.preuve_physique), debut: pbDate(mk.date_debut_campagnes) });
  p.mkt.canaux = (mk.canaux || []).map(c => ({ canal: pbStr(c.canal), objectif: pbStr(c.objectif), budget: pbArr3(c.budget_mensuel_ht), kpi: pbStr(c.kpi) }));
  const stl = ['À faire', 'En cours', 'Fait'];
  p.mkt.actions = (mk.actions || []).map(a => ({ action: pbStr(a.action), canal: pbStr(a.canal), date: pbDate(a.date), budget: pbNum(a.budget_ht), statut: pbPick(a.statut || 'À faire', stl, 'Statut action', w, 'À faire') }));
  p.plan = (j.plan_actions || []).map(a => ({ action: pbStr(a.action), phase: pbStr(a.phase), resp: pbStr(a.responsable), debut: pbDate(a.debut), fin: pbDate(a.fin), statut: pbPick(a.statut || 'À faire', stl, 'Statut action', w, 'À faire') }));
  const pe = j.pestel || {};
  Object.entries(PB_PEST).forEach(([k, s]) => { p.pestel[s] = (pe[k] || []).map(x => typeof x === 'string' ? { t: x, s: '=' } : { t: pbStr(x.facteur || x.t), s: /-|−|defav|neg/.test(String(x.effet ?? x.s ?? '')) ? '-' : /\+|fav|pos/.test(String(x.effet ?? x.s ?? '')) ? '+' : '=' }); });
  const sw = j.swot || {};
  Object.entries(PB_SWOT).forEach(([k, s]) => { p.swot[s] = pbList(sw[k] ?? sw[s] ?? sw[s.toLowerCase()]); });
  p.risks = (j.risques || []).map(r => ({ risque: pbStr(r.risque), cat: pbStr(r.categorie), p: Math.min(3, Math.max(1, Math.round(pbNum(r.probabilite) || 2))), i: Math.min(3, Math.max(1, Math.round(pbNum(r.impact) || 2))), plan: pbStr(r.plan_attenuation), resp: pbStr(r.responsable), ech: pbDate(r.echeance) }));
  const models = (L.M_PType || []).map(r => r[0]);
  p.offers = (j.offres || []).slice(0, 15).map((o, i) => {
    const vm = o.volume_mensuel || {};
    const real = pbArr3(vm.realiste ?? vm.réaliste ?? (Array.isArray(vm) ? vm : undefined));
    return {
      nom: pbStr(o.nom) || `Offre ${i + 1}`, modele: pbPick(o.modele_revenu, models, `Offre « ${pbStr(o.nom)} » — modèle`, w, ''), cible: pbStr(o.cible), unite: pbStr(o.unite), gamme: pbStr(o.positionnement_prix),
      tva: isB(o.tva) ? 0.2 : pbPct(o.tva), recurrent: pbYN(o.recurrent) || undefined, lancement: pbDate(o.date_lancement), prix: pbArr3(o.prix_unitaire_ht),
      vol: [pbArr3(vm.pessimiste), real, pbArr3(vm.optimiste)],
      comps: (o.couts_variables_unitaires || []).map(c => ({ label: pbStr(c.libelle), rub: pbPick(c.rubrique || 'Achats consommés de matières et fournitures', E.RUB, `Coût « ${pbStr(c.libelle)} » — rubrique`, w, 'Achats consommés de matières et fournitures'), tva: isB(c.tva) ? 0.2 : pbPct(c.tva), cout: pbArr3(c.cout_unitaire_ht) }))
    };
  });
  p.offers.forEach(o => { if (o.recurrent === undefined) delete o.recurrent; });
  const sk = j.stocks_fin_annee || {};
  p.stocks = [pbArr3(sk.marchandises), pbArr3(sk.matieres), pbArr3(sk.produits_finis)];
  const invT = (L.InvTypes || []).map(r => r[0]);
  const sd = j.situation_depart || {};
  p.openCash = pbNum(sd.tresorerie) || 0; p.openStock = pbNum(sd.stock) || 0;
  p.invExist = (sd.immobilisations_existantes || []).map(x => ({ label: pbStr(x.libelle), type: pbPick(x.type, invT, `Immobilisation « ${pbStr(x.libelle)} » — type`, w, 'Autre – à préciser'), date: pbDate(x.date), montant: pbNum(x.valeur_ht), taux: '' }));
  p.inv = (j.investissements || []).map(x => ({ label: pbStr(x.libelle), type: pbPick(x.type, invT, `Investissement « ${pbStr(x.libelle)} » — type`, w, 'Autre – à préciser'), date: pbDate(x.date) || p.hyp.start, montant: pbNum(x.montant_ht), mode: /chel|credit|crédit|plusieurs/i.test(String(x.paiement || '')) || pbNum(x.nb_versements) > 1 ? 'Échelonné / à crédit (plusieurs versements)' : 'En une fois', nb: pbNum(x.nb_versements), date1: pbDate(x.date_premier_versement), taux: isB(x.taux_amortissement) || /vide|taux/i.test(String(x.taux_amortissement)) ? '' : pbPct(x.taux_amortissement) }));
  const pers = (L.M_Periodicite || []).map(r => r[0]);
  p.fixRec = (j.charges_fixes || []).map(c => { const d = (L.M_ChFix || []).find(r => nrm(r[0]) === nrm(c.libelle)); return { label: pbStr(c.libelle), rub: !isB(c.rubrique) && !/valeur/.test(c.rubrique) ? pbPick(c.rubrique, E.RUB, `Charge « ${pbStr(c.libelle)} » — rubrique`, w, 'Autres charges externes') : d ? d[1] : 'Autres charges externes', debut: pbDate(c.date_debut) || p.hyp.start, fin: pbDate(c.date_fin), per: pbPick(c.periodicite || (d ? d[3] : 'Mensuelle'), pers, `Charge « ${pbStr(c.libelle)} » — périodicité`, w, 'Mensuelle'), tva: pbYN(c.tva) || (d ? d[2] : 'Oui'), m: pbArr3(c.montant_mensuel_ht) }; });
  p.fixPon = (j.charges_ponctuelles || []).map(c => { const d = (L.M_ChPonct || []).find(r => nrm(r[0]) === nrm(c.libelle)); return { label: pbStr(c.libelle), rub: !isB(c.rubrique) && !/valeur/.test(c.rubrique) ? pbPick(c.rubrique, E.RUB, `Charge « ${pbStr(c.libelle)} » — rubrique`, w, 'Autres charges externes') : d ? d[1] : 'Autres charges externes', date: pbDate(c.date), montant: pbNum(c.montant_ht), tva: pbYN(c.tva) || (d ? d[2] : 'Oui') }; });
  p.fin = (j.financements || []).map(f => { const src = (L.M_Source || []).find(r => nrm(r[0]) === nrm(f.source)); return { source: pbStr(f.source), nature: pbPick(f.nature || (src ? src[1] : ''), L.L_Nature, `Financement « ${pbStr(f.source)} » — nature`, w, 'Capital social / apport en capital'), montant: pbNum(f.montant), date: pbDate(f.date) || p.hyp.start, duree: pbNum(f.duree_reprise_ans) }; });
  p.loans = (j.emprunts || []).map(l => ({ type: pbStr(l.type), preteur: pbStr(l.preteur), montant: pbNum(l.montant), taux: pbPct(l.taux_annuel) || 0, duree: pbNum(l.duree_mois) || 60, differe: pbNum(l.differe_mois) || 0, typeDiff: pbPick(l.type_differe || (pbNum(l.differe_mois) ? 'Intérêts seuls (franchise partielle)' : 'Aucun'), L.L_DiffType, `Emprunt « ${pbStr(l.type)} » — différé`, w, 'Aucun'), date: pbDate(l.date_deblocage) || p.hyp.start }));
  const cl = j.clients || {};
  p.kpi = { clients0: pbNum(cl.actifs_au_depart) || 0, nouveaux: pbArr3(cl.nouveaux_par_an), actifs: pbArr3(cl.actifs_fin_annee), churn: pbArr3(cl.churn_mensuel, pbPct), vie: ['', '', ''], commercial: pbArr3(cl.depenses_commerciales_hors_marketing), expansion: pbArr3(cl.expansion_revenu_clients, pbPct) };
  p.strategy = pbStr(j.strategie);
  p.aVerifier = pbList(j.a_verifier);
  // contrôles
  if (!p.offers.length) w.push('Aucune offre : le chiffre d\'affaires sera nul.');
  p.offers.forEach(o => { if (o.prix[0] === '') w.push(`Offre « ${o.nom} » : prix de l'année 1 manquant.`); if (o.vol[1].every(v => v === '')) w.push(`Offre « ${o.nom} » : volumes réalistes manquants.`); });
  if (!p.fin.length && !p.loans.length) w.push('Aucun financement indiqué : vérifie la trésorerie.');
  return { state: p, warns: w };
}
function stateToPlanbiz(s) {
  const st = s || S;
  return {
    planbiz_version: PB_VERSION,
    projet: { nom: st.id.nom, slogan: st.id.slogan, pitch: st.id.pitch, date_creation: st.id.date, stade: st.id.stade, secteur: st.id.secteur, activite: st.id.activite, ville: st.id.ville, region: st.id.region, porteurs: st.id.porteurs, email: st.id.email, telephone: st.id.tel, site_web: st.id.web },
    vision: { vision: st.vision.vision, mission: st.vision.mission, impact: st.vision.impact, objectifs_smart: { an1: st.vision.smart[0], an2: st.vision.smart[1], an3: st.vision.smart[2], au_dela: st.vision.smart[3] }, valeurs: st.vision.valeurs, odd: st.vision.odd },
    equipe: { fondateurs: st.founders.map(f => ({ nom: f.nom, role: f.role, competences: f.comp, annees_experience: f.exp, pct_temps: f.temps, pct_capital: f.capital, diplome: f.diplome })), personnel: st.staff.map(x => ({ poste: x.nom, role: x.role, contrat: x.contrat, date_entree: x.debut, date_sortie: x.fin, net_mensuel: x.net, personnes_a_charge: x.dep })) },
    marche: { tendances: st.market.tendances, probleme: st.market.probleme, solution: st.market.solution, proposition_valeur: st.market.valeur, avantage_concurrentiel: st.market.avantage, pourquoi_maintenant: st.market.pourquoi, comment_on_gagne_de_l_argent: st.market.revenus, segments: st.market.segments,
      concurrents: (st.market.bench || []).map(b => ({ nom: b.acteur, offre: b.offre, prix: b.prix, positionnement: b.positionnement, forces: b.forces, faiblesses: b.faiblesses })),
      grille_comparaison: { acteurs: st.market.acteurs, criteres: st.market.criteres.map(c => c.critere), notes_mon_entreprise: st.market.criteres.map(c => c.notes[0]), notes_par_concurrent: st.market.acteurs.map((_, k) => st.market.criteres.map(c => c.notes[k + 1])) },
      personas: st.market.personas.map(x => ({ nom_age_lieu: x.nom, profession: x.profession, besoins: x.besoins, freins: x.freins, canaux: x.canaux, budget: x.budget, phrase: x.phrase, offre_associee: x.offre })),
      taille_marche: { clients_potentiels: st.market.tam.n, depense_annuelle_par_client: st.market.tam.dep, pct_accessible_sam: st.market.tam.pctSam, depense_client_sam: st.market.tam.depSam, part_de_marche_som: st.market.tam.pctSom } },
    business_model: Object.fromEntries(PB_BMC.map((k, i) => [k, { choix: st.bmc[i].choix, details: st.bmc[i].details }])),
    prix: { modele_principal: st.pricing.modele, modele_complementaire: st.pricing.modele2, strategie: st.pricing.strategie, positionnement: st.pricing.gamme, conditions_vente: st.pricing.conditions, remises: st.pricing.remises },
    partenaires: st.partners.map(x => ({ nom: x.nom, role: x.role, fournit: x.fournit, conditions: x.conditions })),
    marketing: { positionnement: st.mkt.positionnement, message: st.mkt.message, ton: st.mkt.ton, promesse: st.mkt.promesse, difference: st.mkt.difference, produit: st.mkt.produit, prix: st.mkt.prix, distribution: st.mkt.place, promotion: st.mkt.promotion, personnes: st.mkt.personnes, processus: st.mkt.processus, preuve_physique: st.mkt.preuve, date_debut_campagnes: st.mkt.debut,
      canaux: st.mkt.canaux.map(c => ({ canal: c.canal, objectif: c.objectif, budget_mensuel_ht: c.budget, kpi: c.kpi })), actions: st.mkt.actions.map(a => ({ action: a.action, canal: a.canal, date: a.date, budget_ht: a.budget, statut: a.statut })) },
    plan_actions: st.plan.map(a => ({ action: a.action, phase: a.phase, responsable: a.resp, debut: a.debut, fin: a.fin, statut: a.statut })),
    pestel: Object.fromEntries(Object.entries(PB_PEST).map(([k, s_]) => [k, (st.pestel[s_] || []).map(x => ({ facteur: x.t, effet: x.s }))])),
    swot: Object.fromEntries(Object.entries(PB_SWOT).map(([k, s_]) => [k, st.swot[s_] || []])),
    risques: st.risks.map(r => ({ risque: r.risque, categorie: r.cat, probabilite: r.p, impact: r.i, plan_attenuation: r.plan, responsable: r.resp, echeance: r.ech })),
    hypotheses: { profil: st.hyp.profil, statut_juridique: st.hyp.statut, nature_activite_auto_entrepreneur: st.hyp.aeNature, date_debut_plan: st.hyp.start, date_debut_ventes: st.hyp.ventes, saisonnalite_12_mois: st.hyp.saison, inflation: st.hyp.inflation, repercuter_inflation_sur_prix: st.hyp.inflPrix, delai_clients_jours: st.hyp.delaiClient, delai_fournisseurs_jours: st.hyp.delaiFourn, tresorerie_securite_dh: st.hyp.coussin, part_benefice_distribuee: st.hyp.distrib, prelevements_mensuels_auto_entrepreneur: st.hyp.prelev },
    offres: st.offers.map(o => ({ nom: o.nom, modele_revenu: o.modele, cible: o.cible, unite: o.unite, positionnement_prix: o.gamme, tva: o.tva, recurrent: o.recurrent || '', date_lancement: o.lancement, prix_unitaire_ht: o.prix, volume_mensuel: { pessimiste: o.vol[0], realiste: o.vol[1], optimiste: o.vol[2] }, couts_variables_unitaires: (o.comps || []).map(c => ({ libelle: c.label, rubrique: c.rub, tva: c.tva, cout_unitaire_ht: c.cout })) })),
    stocks_fin_annee: { marchandises: st.stocks[0], matieres: st.stocks[1], produits_finis: st.stocks[2] },
    situation_depart: { tresorerie: st.openCash, stock: st.openStock, immobilisations_existantes: st.invExist.map(x => ({ libelle: x.label, type: x.type, date: x.date, valeur_ht: x.montant })) },
    investissements: st.inv.map(x => ({ libelle: x.label, type: x.type, date: x.date, montant_ht: x.montant, paiement: /chel/.test(x.mode || '') ? 'Échelonné' : 'En une fois', nb_versements: x.nb, date_premier_versement: x.date1, taux_amortissement: x.taux })),
    charges_fixes: st.fixRec.map(c => ({ libelle: c.label, rubrique: c.rub, date_debut: c.debut, date_fin: c.fin, periodicite: c.per, tva: c.tva, montant_mensuel_ht: c.m })),
    charges_ponctuelles: st.fixPon.map(c => ({ libelle: c.label, rubrique: c.rub, date: c.date, montant_ht: c.montant, tva: c.tva })),
    financements: st.fin.map(f => ({ source: f.source, nature: f.nature, montant: f.montant, date: f.date, duree_reprise_ans: f.duree })),
    emprunts: st.loans.map(l => ({ type: l.type, preteur: l.preteur, montant: l.montant, taux_annuel: l.taux, duree_mois: l.duree, differe_mois: l.differe, type_differe: l.typeDiff, date_deblocage: l.date })),
    clients: { actifs_au_depart: st.kpi.clients0, nouveaux_par_an: st.kpi.nouveaux, actifs_fin_annee: st.kpi.actifs, churn_mensuel: st.kpi.churn, depenses_commerciales_hors_marketing: st.kpi.commercial, expansion_revenu_clients: st.kpi.expansion },
    strategie: st.strategy, a_verifier: st.aVerifier || []
  };
}
function extractJSON(text) {
  let s = String(text || '').trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i); if (fence) s = fence[1];
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0 || b <= a) throw new Error('Aucun objet JSON trouvé dans le texte collé.');
  s = s.slice(a, b + 1).replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(s);
}
function impParse(text) {
  IMP.err = ''; IMP.parsed = null; IMP.state = null; IMP.warns = [];
  try {
    const j = typeof text === 'string' ? extractJSON(text) : text;
    if (j.hyp && j.id) { IMP.state = migrate(j); IMP.warns = []; }
    else { const r = planbizToState(j); IMP.state = r.state; IMP.warns = r.warns; }
    IMP.parsed = true;
  } catch (e) { IMP.err = 'Impossible de lire ce fichier : ' + e.message + ' Vérifie que tu as copié la réponse complète de ton IA (du premier « { » au dernier « } »).'; }
}

/* ---- page ---- */
function impPreview() {
  if (IMP.err) return `<div class="al crit">⚠ <span>${esc(IMP.err)}</span></div>`;
  if (!IMP.state) return '';
  const p = IMP.state; let r = null; try { r = E.run(p, L); } catch (e) { }
  const cnt = [['Offres', p.offers.length], ['Personnes (équipe + personnel)', p.founders.length + p.staff.length], ['Investissements', p.inv.length], ['Charges fixes', p.fixRec.length + p.fixPon.length], ['Financements & emprunts', p.fin.length + p.loans.length], ['Concurrents', p.market.bench.length], ['Facteurs PESTEL', Object.values(p.pestel).flat().length], ['Éléments SWOT', Object.values(p.swot).flat().length], ['Risques', p.risks.length]];
  return `<section class="card" style="border-color:var(--primary)"><div class="row"><h3>Aperçu avant import : ${esc(p.id.nom || 'projet sans nom')}</h3><span class="sp"></span><button class="btn pri" data-imp="apply">Importer dans PlanBiz</button><button class="btn ghost" data-imp="clear">Annuler</button></div>
   <p class="sub">${esc(p.id.pitch || '')}</p>
   ${r ? `<div class="tiles"><div class="tile"><small>CA An 1 → An 3</small><b>${kdh(r.P.ca[0])}</b><span>→ ${kdh(r.P.ca[2])}</span></div><div class="tile ${r.P.rn[2] >= 0 ? 'k-good' : 'k-crit'}"><small>Résultat net An 3</small><b>${kdh(r.P.rn[2])}</b><span>An 1 : ${kdh(r.P.rn[0])}</span></div><div class="tile ${r.C.fonds > 0 ? 'k-crit' : 'k-good'}"><small>Trésorerie la plus basse</small><b>${kdh(r.C.min)}</b><span>${r.C.fonds > 0 ? 'manque ' + kdh(r.C.fonds) : 'reste positive'}</span></div></div>` : ''}
   <div class="tw"><table>${cnt.map(([l, n]) => `<tr><td>${l}</td><td class="n">${n}</td></tr>`).join('')}</table></div>
   ${(p.aVerifier || []).length ? `<h3 style="margin:14px 0 6px">Hypothèses à vérifier (indiquées par l'IA)</h3><ul class="small">${p.aVerifier.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
   ${IMP.warns.length ? `<h3 style="margin:14px 0 6px">Points de contrôle</h3><div class="alerts">${IMP.warns.slice(0, 25).map(x => `<div class="al warn">! <span>${esc(x)}</span></div>`).join('')}</div>` : '<div class="al good" style="margin-top:12px">✓ <span>Toutes les valeurs ont été reconnues.</span></div>'}
   <p class="small muted" style="margin-top:8px">L'import remplace le projet actuel. Exporte-le d'abord (section Business plan & exports) si tu veux le garder.</p></section>`;
}
function renderImportIA() {
  return `<div class="head"><div><p class="eyebrow">Démarrer</p><h1>Importer depuis mon IA</h1></div></div>
  <p class="lead">Ton IA (ChatGPT, Claude, Gemini, Copilot…) connaît déjà ton projet ou peut lire tes documents. Donne-lui le template PlanBiz : elle sort toutes tes données dans un format que PlanBiz importe en un clic, puis l'application calcule et rédige tout le business plan.</p>
  <div class="grid g2" style="margin-bottom:16px">
   <section class="card" style="margin:0"><p class="eyebrow">Option A · Avec ton IA</p><h3 style="margin:4px 0 10px">1. Copie le template et donne-le à ton IA</h3>
    <label class="row small" style="gap:6px;margin-bottom:10px"><input type="checkbox" id="impInterview" ${IMP.interview ? 'checked' : ''}> L'IA me pose d'abord les questions manquantes (mode entretien)</label>
    <div class="row"><button class="btn pri" data-imp="copy">Copier le template</button><button class="btn" data-imp="dlmd">Télécharger (.md)</button><button class="btn ghost" data-imp="show">Voir le template</button></div>
    <p class="small muted" style="margin-top:10px">Colle-le dans une nouvelle conversation avec ton IA, ajoute ton pitch, tes notes ou ton deck, puis réponds à ses questions. À la fin, elle donne un bloc de code JSON.</p>
    <div id="tplbox"></div></section>
   <section class="card" style="margin:0"><p class="eyebrow">Option A · Retour dans PlanBiz</p><h3 style="margin:4px 0 10px">2. Colle la réponse de ton IA</h3>
    <textarea class="in" id="impText" rows="7" placeholder='Colle ici la réponse de ton IA (le bloc qui commence par { "planbiz_version": … )'>${esc(IMP.text)}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn pri" data-imp="parse">Vérifier et prévisualiser</button><label class="btn ghost" for="impFile">ou importer un fichier .json</label><input type="file" id="impFile" accept=".json,.txt,application/json,text/plain" hidden></div></section>
  </div>
  <section class="card"><div class="row"><div><p class="eyebrow">Option B · Tout relier dans PlanBiz</p><h3 style="margin-top:4px">Générer directement avec l'IA intégrée</h3></div><span class="sp"></span></div>
   <p class="sub">Colle tout ce que tu as sur ton projet : pitch, notes, extrait de deck, chiffres, devis, offres de prêt… L'IA intégrée applique le même template et prépare l'import. Elle complète ce qui manque avec des hypothèses prudentes qu'elle te liste.</p>
   <textarea class="in" id="impCtx" rows="8" placeholder="Ex. Café-librairie à Rabat, ouverture mars 2027. Ticket moyen 45 DH, 120 clients/jour visés. Loyer 9 000 DH/mois. 2 associés, apport 250 000 DH, prêt Intelaka 300 000 DH…">${esc(IMP.ctx)}</textarea>
   <div class="row" style="margin-top:8px"><button class="btn pri ai" data-imp="gen">Générer mon business plan</button><span class="small muted" id="genStatus"></span></div></section>
  <div id="impPrev">${impPreview()}</div>
  <section class="card"><h3>Mettre à jour un plan existant avec ton IA</h3><p class="sub">Exporte ton plan actuel au format PlanBiz, donne-le à ton IA avec le template (« améliore mes hypothèses », « ajoute une offre », « traduis mon marché »…), puis recolle sa réponse ci-dessus.</p>
   <div class="row"><button class="btn" data-imp="copyCur">Copier mon plan (format PlanBiz)</button><button class="btn" data-imp="dlCur">Télécharger mon plan (.json PlanBiz)</button></div></section>`;
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('Copié dans le presse-papiers.'); return true; }
  catch (e) { showTpl(t); toast('Copie automatique impossible : sélectionne le texte affiché et copie-le.'); return false; }
}
function showTpl(t) { const b = document.getElementById('tplbox'); if (b) { b.innerHTML = `<textarea class="in mono" readonly rows="12" style="margin-top:10px;font-size:11.5px">${esc(t)}</textarea>`; const ta = b.querySelector('textarea'); ta.focus(); ta.select(); } }
async function impGen(btn) {
  const ctx = (document.getElementById('impCtx') || {}).value || ''; IMP.ctx = ctx;
  if (ctx.trim().length < 40) { toast('Décris ton projet en quelques lignes au moins.'); return; }
  if (!sampleFn) { toast('L\'IA intégrée n\'est pas disponible ici : utilise l\'option A avec ton IA.'); return; }
  const stEl = document.getElementById('genStatus'); btn.disabled = true;
  stEl.textContent = 'Claude prépare ton business plan… (1 à 3 minutes)';
  try {
    const prompt = pbPrompt(false).replace('(Colle ici ton pitch, tes notes, ton deck, tes chiffres… ou joins tes documents.)', ctx) + `\n\nRéponds uniquement avec le JSON complet. Date du jour : ${new Date().toISOString().slice(0, 10)} ; si aucune date n'est donnée, démarre le plan le 1er janvier de l'année prochaine.`;
    const { text } = await sampleFn(prompt, { modelTier: 'complex', cache: false, onText: ({ text }) => { stEl.textContent = `Rédaction en cours… ${Math.round(text.length / 100) / 10} k caractères`; } });
    IMP.text = text; impParse(text);
    stEl.textContent = IMP.err ? '' : 'Prêt : vérifie l\'aperçu ci-dessous.';
    const pv = document.getElementById('impPrev'); if (pv) { pv.innerHTML = impPreview(); pv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  } catch (e) {
    stEl.textContent = { consent_refused: 'Envoi à l\'IA refusé : tu peux remplir cette partie sans l\'IA.', not_granted: 'Session expirée : reconnecte-toi pour utiliser l\'IA.', rate_limited: 'Trop de demandes : réessaie dans une minute.' }[e && e.code] || ('Génération impossible' + (e && e.message ? ' : ' + e.message : '.'));
  } finally { btn.disabled = false; }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-imp]'); if (!b) return;
  const k = b.dataset.imp;
  if (k === 'copy') copyText(pbPrompt(IMP.interview));
  else if (k === 'show') showTpl(pbPrompt(IMP.interview));
  else if (k === 'dlmd') saveFile('template-planbiz.md', pbPrompt(IMP.interview));
  else if (k === 'copyCur') copyText(JSON.stringify(stateToPlanbiz(), null, 1));
  else if (k === 'dlCur') saveFile(`${slug()}-planbiz.json`, JSON.stringify(stateToPlanbiz(), null, 1));
  else if (k === 'parse') { IMP.text = document.getElementById('impText').value; impParse(IMP.text); document.getElementById('impPrev').innerHTML = impPreview(); }
  else if (k === 'clear') { IMP.state = null; IMP.err = ''; document.getElementById('impPrev').innerHTML = ''; }
  else if (k === 'gen') impGen(b);
  else if (k === 'apply') confirmBox('Remplacer le projet actuel par le business plan importé ?', () => { S = IMP.state; IMP.state = null; IMP.text = ''; save(); recalc(); go('tableau'); toast('Business plan importé : vérifie chaque section et les hypothèses à vérifier.'); });
});
document.addEventListener('change', e => {
  if (e.target.id === 'impInterview') IMP.interview = e.target.checked;
  if (e.target.id === 'impFile' && e.target.files[0]) { const rd = new FileReader(); rd.onload = () => { IMP.text = rd.result; const ta = document.getElementById('impText'); if (ta) ta.value = rd.result; impParse(rd.result); document.getElementById('impPrev').innerHTML = impPreview(); }; rd.readAsText(e.target.files[0]); }
});
document.addEventListener('input', e => { if (e.target.id === 'impText') IMP.text = e.target.value; if (e.target.id === 'impCtx') IMP.ctx = e.target.value; });
