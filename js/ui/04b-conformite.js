/* ================= Conformité légale & loi de finances 2026 ================= */
const CF = (() => {
  const ysum = (arr, y) => arr.slice(y * 12 + 1, y * 12 + 13).reduce((a, b) => a + b, 0);
  const isCoop = s => (s || '').startsWith('Coopérative');
  const textOf = (...parts) => parts.flat().filter(Boolean).join(' ').toLowerCase();

  /* ---- what the plan says about the company ---- */
  function profile() {
    const F = R.flags, P = R.P, H = S.hyp;
    const segs = textOf(S.market.segments, (S.offers || []).map(o => o.cible), S.bmc && S.bmc[0] ? S.bmc[0].choix : []);
    const fixLabels = textOf((S.fixRec || []).map(f => f.label), (S.fixPon || []).map(f => f.label));
    const invLabels = textOf((S.inv || []).map(i => [i.type, i.nom || i.label]));
    return {
      F, P, H,
      soc: F.fSoc.some(Boolean), ae: F.fAE.some(Boolean), coop: F.stat.some(isCoop), assoc: F.stat.includes('Association'),
      sa: F.stat.includes('SA'),
      staff: (S.staff || []).length, head: Math.max(0, ...R.K.head),
      bigClients: /grande|administr|collectiv|public|banque|assur|b2g|état|etat|ministère|commune/.test(segs),
      rent: /loyer|location|bail/.test(fixLabels),
      foreign: /cloud|aws|azure|google|saas|licence|logiciel|étranger|import/.test(fixLabels + ' ' + textOf((S.offers || []).flatMap(o => (o.comps || []).map(c => c.label)))),
      property: /terrain|construction|bâtiment|batiment|local|fonds de commerce|immeuble/.test(invLabels),
      investors: (S.fin || []).some(f => /capital|lev/i.test(f.nature || '') && N(f.montant) > 0),
      ca: P.ca, maxCA: Math.max(...P.ca), cssY: [0, 1, 2].filter(y => P.css && P.css[y] > 0)
    };
  }

  /* ---- loi de finances 2026 : measures and their relevance ---- */
  function measures(pf) {
    const P = pf.P, yrs = [0, 1, 2];
    const cssTxt = pf.cssY.length ? `Ton plan la déclenche : ${pf.cssY.map(y => `${dh(P.css[y])} en ${yrLab(y)} (${pc(P.cssRate[y], 1)} du bénéfice)`).join(', ')}. Elle est déjà comptée dans tes impôts et ta trésorerie.` : 'Ton bénéfice fiscal reste sous 1 M DH sur la période : elle ne s\'applique pas.';
    return [
      { t: 'Contribution sociale de solidarité reconduite', when: 'Exercices 2026, 2027 et 2028', tag: 'new', ok: pf.soc || pf.coop ? !!pf.cssY.length : false,
        d: 'Elle frappe les sociétés dont le bénéfice fiscal atteint 1 M DH : 1,5 % jusqu\'à 5 M DH, 2,5 % jusqu\'à 10 M DH, 3,5 % jusqu\'à 40 M DH et 5 % au-delà. Elle se paie avec la déclaration de l\'IS, dans les 3 mois qui suivent la clôture.', impact: pf.soc || pf.coop ? cssTxt : 'Ne concerne pas un auto-entrepreneur.' },
      { t: 'Charges de famille : 600 DH par personne', when: 'Revenus à partir du 1er janvier 2026', tag: 'new', ok: pf.staff > 0,
        d: 'La réduction d\'IR passe de 500 à 600 DH par personne à charge et par an, dans la limite de 3 600 DH (6 personnes).', impact: pf.staff ? 'Déjà appliqué au calcul de tes salaires bruts : à net égal, le coût employeur baisse légèrement pour les salariés qui ont des enfants ou un conjoint à charge.' : 'Tu n\'as pas encore de salarié dans le plan.' },
      { t: 'Retenue à la source de 5 % sur les loyers', when: 'Dès le 1er juillet 2026, puis par seuils', tag: 'new', ok: pf.rent ? null : false,
        d: 'Le locataire retient 5 % du loyer hors taxes versé à une société ou à un propriétaire au régime du résultat net, et la reverse au Trésor le mois suivant. Pour les locataires, le dispositif démarre avec les entreprises de 500 M DH de CA et plus (juillet 2026), puis 350 M DH (2027) et 200 M DH (2028).', impact: pf.rent ? 'Tu paies un loyer : vérifie avec ton comptable si la retenue s\'applique à ton bail. Elle ne change pas le coût total, seulement la personne qui verse les 5 %.' : 'Aucun loyer repéré dans tes charges.' },
      { t: 'Retenue de TVA et d\'IS sur les prestations facturées aux grands comptes', when: 'Dès le 1er juillet 2026, puis par seuils', tag: 'new', ok: pf.bigClients ? null : false,
        d: 'Les banques, les assurances et les entreprises de 500 M DH de CA et plus (350 M DH en 2027, 200 M DH en 2028) retiennent 75 % de la TVA de tes factures de services, ou 100 % si tu n\'as pas d\'attestation de régularité fiscale. Elles retiennent aussi 5 % au titre de l\'IS, que tu déduis ensuite de ton impôt.', impact: pf.bigClients ? 'Tu vends à des grands comptes ou au secteur public : une partie de ta facture arrivera directement au Trésor. Demande ton attestation de régularité fiscale pour limiter la retenue à 75 %, et prévois ce décalage dans ta trésorerie.' : 'Tes clients cibles ne semblent pas concernés.' },
      { t: 'État des opérations avec les non-résidents', when: 'Déclarations de TVA à partir de 2026', tag: 'new', ok: pf.foreign && (pf.soc || pf.coop) ? null : false,
        d: 'Les clients établis au Maroc joignent à leur déclaration de TVA un état de leurs opérations avec des fournisseurs non résidents. L\'oubli est sanctionné par une amende.', impact: pf.foreign && (pf.soc || pf.coop) ? 'Tu achètes probablement des services à l\'étranger (cloud, logiciels, licences) : prépare cet état avec chaque déclaration.' : 'Pas d\'achat à l\'étranger repéré.' },
      { t: 'Droit supplémentaire de 2 % sur les paiements non traçables', when: 'Actes à partir du 1er juillet 2026', tag: 'new', ok: pf.property ? null : false,
        d: 'Une cession d\'immeuble ou de fonds de commerce au-delà de 300 000 DH payée en espèces, ou sans mode de paiement indiqué dans l\'acte, supporte 2 % de droits en plus.', impact: pf.property ? 'Tu prévois d\'acheter un local, un terrain ou un fonds de commerce : paie par virement ou chèque barré et fais-le écrire dans l\'acte.' : 'Aucun achat immobilier ni fonds de commerce dans tes investissements.' },
      { t: 'Cessions de parts et restructurations', when: 'Actes à partir du 1er janvier 2026', tag: 'new', ok: pf.investors ? null : false,
        d: 'Le droit sur les cessions de parts de sociétés à prépondérance immobilière baisse de 6 % à 5 %. Pour les autres sociétés, l\'exonération exige une attestation de non-prépondérance immobilière. Dans un groupe, l\'apport d\'actifs circulants paie un droit fixe de 1 000 DH.', impact: pf.investors ? 'Tu fais entrer des investisseurs : si certains rachètent des parts existantes plutôt que de souscrire à une augmentation de capital, demande l\'attestation de non-prépondérance immobilière.' : 'Pas de levée de fonds dans le plan.' },
      { t: 'Comptabilité électronique et adresse électronique', when: 'En vigueur', tag: 'new', ok: pf.soc || pf.coop,
        d: 'La comptabilité doit être tenue sur support électronique, avec un fichier des écritures comptables annuel. Chaque contribuable communique une adresse électronique à la DGI (plateforme SIMPL) pour recevoir les notifications.', impact: pf.soc || pf.coop ? 'Choisis un logiciel comptable qui exporte le fichier des écritures et renseigne ton adresse électronique sur SIMPL dès la création.' : 'Concerne surtout les sociétés et les coopératives.' },
      { t: 'Entreprise en difficulté : déclaration préalable', when: 'En vigueur', tag: 'new', ok: R.C.min < 0 ? null : false,
        d: 'Avant de demander une procédure de sauvegarde, de redressement ou de liquidation, l\'entreprise doit le déclarer par voie électronique à l\'administration fiscale.', impact: R.C.min < 0 ? `Ta trésorerie passe sous zéro (${dh(R.C.min)} au plus bas) : trouve le financement manquant avant le démarrage pour ne jamais en arriver là.` : 'Ta trésorerie reste positive.' },
      { t: 'Facture électronique', when: 'Annoncée : grandes entreprises en 2026, PME en 2027-2028, TPE ensuite', tag: 'annonce', ok: null,
        d: 'La DGI déploie la facture électronique par étapes : d\'abord les entreprises de plus de 200 M DH de CA et les opérations avec l\'État, puis les PME, puis les TPE. Le calendrier détaillé dépend des textes d\'application.', impact: 'Émets dès maintenant des factures numérotées avec ton ICE, celui du client et les montants HT et TTC : le passage sera simple.' },
      { t: 'Rappels : ce qui ne change pas en 2026', when: 'Règles en vigueur', tag: 'rappel', ok: true,
        d: 'IS à 20 % sous 100 M DH de bénéfice et 35 % au-delà. Cotisation minimale de 0,25 % du chiffre d\'affaires (minimum 3 000 DH), exonérée les 36 premiers mois d\'exploitation. Retenue de 10 % sur les dividendes. TVA à 20 % pour la plupart des services (électricité à 20 % depuis janvier 2026, transport à 10 %). Cotisations CNSS inchangées, plafond de 6 000 DH par mois. Auto-entrepreneur : 0,5 % ou 1 % du CA, et retenue de 30 % par le client au-delà de 80 000 DH par an.', impact: 'Ces règles sont déjà intégrées au calcul de ton business plan.' }
    ];
  }

  /* ---- regime per year ---- */
  function regimeTable(pf) {
    const P = pf.P, F = pf.F, C = R.C, yrs = [0, 1, 2];
    const tvaReg = y => !F.fTVA[y] ? 'Non assujetti' : (y === 0 || !F.fTVA[y - 1] || P.ca[y - 1] < 1e6) ? 'Trimestrielle' : 'Mensuelle';
    const rows = [
      ['Statut', yrs.map(y => esc(F.stat[y]))],
      ['Impôt sur le revenu ou les sociétés', yrs.map(y => F.fAE[y] ? `IR libératoire ${pc((E.REG.AE[S.hyp.aeNature || 'Services'] || [0.01])[0], 1)} du CA` : F.fIS[y] ? (P.is[y] > P.isTheo[y] ? 'Cotisation minimale (IS < minimum)' : 'IS 20 %') : 'Exonéré')],
      ['Cotisation minimale', yrs.map(y => !F.fIS[y] ? '—' : F.cmExo[y] ? '<span class="pill good">exonérée</span>' : dh(P.cm[y]))],
      ['IS ou IR dû', yrs.map(y => dh(P.is[y] + P.aeIr[y]))],
      ['Contribution sociale de solidarité', yrs.map(y => P.css[y] ? `${dh(P.css[y])} <span class="small muted">(${pc(P.cssRate[y], 1)})</span>` : '—')],
      ['Déclaration de TVA', yrs.map(tvaReg)],
      ['TVA nette versée', yrs.map(y => dh(ysum(C.decTva, y)))],
      ['Cotisations sociales versées', yrs.map(y => dh(ysum(C.decSoc, y)))],
      ['IR retenu sur les salaires', yrs.map(y => dh(ysum(C.decIr, y)))],
      ['Retenue sur dividendes (10 %)', yrs.map(y => R.A.ras[y] ? dh(R.A.ras[y]) : '—')]
    ];
    const tot = yrs.map(y => ysum(C.decTva, y) + ysum(C.decSoc, y) + ysum(C.decIr, y) + ysum(C.decImpot, y));
    return `<div class="tw"><table><tr><th></th>${yrs.map(y => `<th class="n">${yrLab(y)}</th>`).join('')}</tr>${rows.map(([l, v]) => `<tr><td>${l}</td>${v.map(x => `<td class="n">${x}</td>`).join('')}</tr>`).join('')}
      <tr class="tot"><td>Total versé à l'État et à la CNSS</td>${tot.map(v => `<td class="n">${dh(v)}</td>`).join('')}</tr>
      <tr><td>En % du chiffre d'affaires</td>${tot.map((v, y) => `<td class="n">${P.ca[y] ? pc(v / P.ca[y], 1) : '—'}</td>`).join('')}</tr></table></div>`;
  }

  /* ---- monthly calendar of payments ---- */
  function calendar() {
    const C = R.C, rows = [];
    for (let m = 1; m <= 36; m++) {
      const v = { tva: C.decTva[m], soc: C.decSoc[m], ir: C.decIr[m], is: C.decImpot[m] };
      const t = v.tva + v.soc + v.ir + v.is; if (t < 1) continue;
      rows.push(`<tr><td>${mLong(m)}</td>${['tva', 'soc', 'ir', 'is'].map(k => `<td class="n">${v[k] >= 1 ? fmt(v[k]) : ''}</td>`).join('')}<td class="n"><b>${fmt(t)}</b></td></tr>`);
    }
    return rows.length ? `<div class="tw" style="max-height:420px;overflow:auto"><table><tr><th>Mois de paiement</th><th class="n">TVA</th><th class="n">CNSS / AMO</th><th class="n">IR salaires</th><th class="n">IS, acomptes, CSS, IR auto-entrepreneur</th><th class="n">Total</th></tr>${rows.join('')}</table></div>` : '<p class="muted">Aucun paiement fiscal ou social prévu pour l\'instant.</p>';
  }
  const DEADLINES = [
    ['TVA (régime mensuel)', 'Avant le 20 du mois suivant', 'SIMPL-TVA'],
    ['TVA (régime trimestriel)', 'Avant le 20 du mois qui suit le trimestre (20 avril, 20 juillet, 20 octobre, 20 janvier)', 'SIMPL-TVA'],
    ['Cotisations CNSS et AMO', 'Avant le 10 du mois suivant', 'Damancom'],
    ['IR retenu sur les salaires', 'Avant la fin du mois suivant', 'SIMPL-IR'],
    ['Acomptes d\'IS', 'Avant la fin des 3e, 6e, 9e et 12e mois de l\'exercice, 25 % de l\'IS de l\'année précédente chacun', 'SIMPL-IS'],
    ['Déclaration et solde de l\'IS, contribution de solidarité', 'Dans les 3 mois après la clôture (31 mars pour un exercice civil)', 'SIMPL-IS'],
    ['Déclaration annuelle des salaires', 'Avant le 1er mars', 'SIMPL-IR'],
    ['Retenue sur dividendes', 'Dans le mois qui suit la mise en paiement', 'SIMPL'],
    ['Auto-entrepreneur : déclaration et paiement', 'Chaque trimestre : 30 avril, 31 juillet, 31 octobre, 31 janvier', 'Portail auto-entrepreneur'],
    ['Délais de paiement (CA ≥ 2 M DH)', 'Déclaration trimestrielle avant la fin du mois qui suit le trimestre', 'SIMPL'],
    ['Approbation des comptes', 'Assemblée générale dans les 6 mois après la clôture, dépôt au greffe dans les 30 jours', 'Tribunal de commerce']
  ];

  /* ---- compliance checklist ---- */
  function checklist(pf) {
    const L_ = [];
    const add = (g, k, t, d, on = true) => { if (on) L_.push({ g, k, t, d }); };
    if (pf.soc) {
      add('Création', 'negatif', 'Certificat négatif (nom de la société)', 'À l\'OMPIC, valable 1 an.');
      add('Création', 'statuts', 'Statuts signés et enregistrés', pf.sa ? 'SA : capital minimum de 300 000 DH, dont un quart libéré.' : 'SARL ou SAS : pas de capital minimum.');
      add('Création', 'banque', 'Compte bancaire professionnel et dépôt du capital', 'Le certificat de dépôt est demandé pour l\'immatriculation.');
      add('Création', 'rc', 'Registre du commerce, identifiant fiscal, ICE et taxe professionnelle', 'Guichet unique du CRI ou plateforme en ligne. Taxe professionnelle exonérée les 5 premières années.');
      add('Création', 'simpl', 'Compte SIMPL et adresse électronique déclarée à la DGI', 'Obligatoire pour recevoir les notifications fiscales (LF 2026).');
    }
    if (pf.ae) {
      add('Création', 'ae_inscr', 'Inscription au registre national de l\'auto-entrepreneur', 'Avec la CIN : tu reçois ton ICE et ton identifiant fiscal.');
      add('Création', 'ae_cnss', 'Affiliation CNSS / AMO de l\'auto-entrepreneur', 'Cotisation trimestrielle selon ta tranche de chiffre d\'affaires.');
      add('Fiscal', 'ae_plafond', 'Suivi du plafond de chiffre d\'affaires', 'Au-delà de 200 000 DH (services) ou 500 000 DH, deux années de suite, le statut est perdu.');
      add('Fiscal', 'ae_80k', 'Clients au-delà de 80 000 DH par an', 'Au-delà, le client retient 30 % de tes factures : ce n\'est pas un impôt en plus, mais une avance à récupérer.');
    }
    if (pf.coop) {
      add('Création', 'odco', 'Immatriculation au registre des coopératives (ODCO)', 'Avec les statuts et la liste des adhérents.');
      add('Gouvernance', 'coop_res', 'Réserve légale de 10 % des excédents', 'Jusqu\'à ce qu\'elle atteigne le capital.');
    }
    if (pf.staff) {
      add('Social', 'cnss', 'Affiliation à la CNSS et déclaration des salariés', 'Avant la première paie. Cotisations avant le 10 du mois suivant.');
      add('Social', 'contrats', 'Contrats de travail écrits et registre du personnel', 'CDI, CDD ou contrat ANAPEC selon les postes.');
      add('Social', 'anciennete', 'Prime d\'ancienneté', S.hyp.anciennete === 'Non' ? '⚠ Désactivée dans tes hypothèses : elle est pourtant obligatoire (5 % après 2 ans, 10 % après 5 ans).' : '5 % après 2 ans, 10 % après 5 ans, 15 % après 12 ans. Déjà comptée dans tes salaires.');
      add('Social', 'smig', 'Salaires au moins égaux au SMIG', `SMIG mensuel retenu dans le calcul : ${fmt(E.REG.SMIG, 2)} DH.`);
      add('Social', 'reglement', 'Règlement intérieur et délégués des salariés', 'Obligatoires à partir de 10 salariés.', pf.head >= 10);
      add('Social', 'medecine', 'Service médical du travail, comité d\'entreprise, comité d\'hygiène et sécurité', 'Obligatoires à partir de 50 salariés.', pf.head >= 50);
      add('Fiscal', 'decl_sal', 'Déclaration annuelle des salaires', 'Avant le 1er mars de chaque année.');
    }
    if (pf.soc || pf.coop) {
      add('Fiscal', 'factures', 'Factures conformes', 'Numérotées, avec ton ICE et celui du client, les montants HT, la TVA et le TTC.');
      add('Fiscal', 'compta', 'Comptabilité électronique tenue par un comptable agréé', 'Avec le fichier des écritures comptables annuel.');
      add('Fiscal', 'tva', 'Déclarations de TVA', R.P.ca[0] >= 1e6 ? 'Passage au régime mensuel dès l\'année qui suit un CA de 1 M DH.' : 'Trimestrielles la première année, mensuelles ensuite si le CA dépasse 1 M DH.');
      add('Fiscal', 'is', 'Déclaration d\'IS et acomptes', 'Même en perte : la cotisation minimale est due après les 36 premiers mois.');
      add('Fiscal', 'delais', 'Délais de paiement fournisseurs (loi 69-21)', `60 jours par défaut, 120 jours au maximum par contrat. Ton plan retient ${N(S.hyp.delaiFourn)} jours.`);
      add('Gouvernance', 'ag', 'Assemblée annuelle et dépôt des comptes', 'Dans les 6 mois après la clôture, dépôt au greffe dans les 30 jours.');
      add('Gouvernance', 'cac', 'Commissaire aux comptes', pf.sa ? 'Obligatoire pour une SA.' : 'Obligatoire pour une SARL au-delà de 50 M DH de CA.', pf.sa || pf.maxCA >= 5e7);
    }
    add('Données', 'cndp', 'Déclaration à la CNDP', 'Si tu collectes des données personnelles de clients ou d\'utilisateurs (loi 09-08).');
    add('Données', 'cgv', 'Conditions générales de vente et mentions légales', 'Sur ton site, ton application et tes devis.');
    return L_;
  }

  /* ---- compare legal structures ---- */
  function structures() {
    const base = S.hyp.statut.slice(0, 3);
    const opts = [['Ton plan actuel', base]];
    const same = (a, b) => a.every((v, i) => (v || 'SARL') === (b[i] || 'SARL'));
    [['SARL dès le départ', ['SARL', 'SARL', 'SARL']], ['Auto-entrepreneur la 1re année, puis SARL', ['Auto-Entrepreneur', 'SARL', 'SARL']], ['Auto-entrepreneur sur 3 ans', ['Auto-Entrepreneur', 'Auto-Entrepreneur', 'Auto-Entrepreneur']], ['Coopérative de services', ['Coopérative de services', 'Coopérative de services', 'Coopérative de services']]]
      .forEach(o => { if (!same(o[1], base)) opts.push(o); });
    const plaf = (E.REG.AE[S.hyp.aeNature || 'Services'] || [0, 200000])[1];
    return opts.map(([name, st]) => {
      const c = JSON.parse(JSON.stringify(S)); c.hyp.statut = st.slice();
      let r; try { r = E.run(c, L); } catch (e) { return null; }
      const yrs = [0, 1, 2], sumM = a => a.slice(1, 37).reduce((x, y) => x + y, 0);
      const notes = [];
      const over = yrs.filter(y => st[y] === 'Auto-Entrepreneur' && r.P.ca[y] > plaf);
      if (over.length) notes.push({ t: `CA au-dessus du plafond de ${kdh(plaf)} en ${over.map(y => 'An ' + (y + 1)).join(', ')}`, c: 'crit' });
      if (st.includes('Auto-Entrepreneur') && (S.fin || []).some(f => /capital/i.test(f.nature || '') && N(f.montant) > 0)) notes.push({ t: 'pas d\'associés ni de levée de fonds possible', c: 'crit' });
      if (st[0] === 'Coopérative de services') notes.push({ t: 'au moins 5 adhérents', c: 'warn' });
      return { name, st, impots: r.P.impot.reduce((a, b) => a + b, 0), soc: sumM(r.C.decSoc), tva: sumM(r.C.decTva), rn: r.P.rn.reduce((a, b) => a + b, 0), min: r.C.min, notes };
    }).filter(Boolean);
  }
  function structuresHTML() {
    const rows = structures(); if (!rows.length) return '';
    const blocked = r => r.notes.some(n => n.c === 'crit');
    const best = Math.max(...rows.map(r => blocked(r) ? -Infinity : r.min));
    const shortSt = st => { const m = { 'Auto-Entrepreneur': 'AE', 'Coopérative de services': 'Coop. services', 'Coopérative — transformation': 'Coop. transf.', "Coopérative — collecte & vente en l'état": 'Coop. collecte' }; return st.map(x => m[x] || x || 'SARL').join(' → '); };
    return `<div class="tw"><table class="cmp"><tr><th>Structure</th><th class="n">Impôts (3 ans)</th><th class="n">Cotisations sociales</th><th class="n">TVA versée</th><th class="n">Résultat net cumulé</th><th class="n">Trésorerie au plus bas</th></tr>
      ${rows.map((r, i) => `<tr${i === 0 ? ' class="tot"' : ''}><td><b>${esc(r.name)}</b> <span class="small muted">${esc(shortSt(r.st))}</span>${r.notes.length ? `<br>${r.notes.map(n => `<span class="pill ${n.c}">${esc(n.t)}</span>`).join(' ')}` : ''}</td><td class="n">${fmt(r.impots)}</td><td class="n">${fmt(r.soc)}</td><td class="n">${fmt(r.tva)}</td><td class="n">${fmt(r.rn)}</td><td class="n">${r.min === best && !blocked(r) ? `<span class="pill good">${fmt(r.min)}</span>` : fmt(r.min)}</td></tr>`).join('')}</table></div>
      <p class="small muted" style="margin-top:8px">Même business, mêmes prix et mêmes volumes : seule la structure change. En auto-entrepreneur, tu ne factures pas de TVA, mais tu ne la récupères pas non plus sur tes achats. Pour changer de structure, modifie le statut par année dans « Hypothèses ».</p>`;
  }

  /* ---- render ---- */
  function render() {
    if (!R) return '<p class="muted">Calcul en cours…</p>';
    const pf = profile(), ms = measures(pf), cl = checklist(pf);
    S.legal = S.legal || {};
    const done = cl.filter(c => S.legal[c.k]).length;
    const tagL = { new: ['LF 2026', 'warn'], annonce: ['Annoncé', 'mut'], rappel: ['Rappel', 'mut'] };
    const rel = m => m.ok === true ? '<span class="pill info">Concerne ton projet</span>' : m.ok === null ? '<span class="pill warn">À vérifier</span>' : '<span class="pill mut">Pas concerné</span>';
    const order = ms.slice().sort((a, b) => (b.ok === true) - (a.ok === true) || (b.ok === null) - (a.ok === null));
    const groups = [...new Set(cl.map(c => c.g))];
    return card('1. Loi de finances 2026 : ce qui change pour toi', 'Les mesures de la loi de finances n° 50-25 classées selon ton plan. Les montants viennent de tes chiffres.',
      `<div class="lf">${order.map(m => `<div class="lfi ${m.ok === true ? 'on' : ''}"><div class="row"><b>${m.t}</b><span class="sp"></span><span class="pill ${tagL[m.tag][1]}">${tagL[m.tag][0]}</span>${m.tag !== 'rappel' ? rel(m) : ''}</div><p class="small muted">${m.when}</p><p>${m.d}</p><p class="imp"><b>Pour toi :</b> ${m.impact}</p></div>`).join('')}</div>`)
      + card('2. Ton régime fiscal et social, année par année', 'Ce que ta structure paie chaque année, selon ton scénario actuel.', regimeTable(pf))
      + card('3. Calendrier des paiements', 'Les montants à verser, mois par mois, tirés de ton plan de trésorerie.',
        calendar() + `<details class="help" style="margin-top:12px" open><summary>Échéances légales</summary><div class="tw" style="margin-top:8px"><table><tr><th>Obligation</th><th>Échéance</th><th>Où</th></tr>${DEADLINES.map(d => `<tr><td>${d[0]}</td><td>${d[1]}</td><td class="small muted">${d[2]}</td></tr>`).join('')}</table></div></details>`)
      + card('4. Changer de structure : l\'impact sur tes paiements', 'Le même projet simulé avec d\'autres statuts juridiques.', structuresHTML())
      + card('5. Check-list de conformité', `${done} sur ${cl.length} obligations cochées.`,
        groups.map(g => `<h4 class="cfg">${g}</h4><div class="cl">${cl.filter(c => c.g === g).map(c => `<label class="cli"><input type="checkbox" data-legal="${c.k}" ${S.legal[c.k] ? 'checked' : ''}><span><b>${c.t}</b><br><span class="small muted">${c.d}</span></span></label>`).join('')}</div>`).join('')
        + '<p class="small muted" style="margin-top:10px">Ces informations aident à préparer ton projet. Elles ne remplacent pas l\'avis d\'un expert-comptable ou d\'un avocat, surtout pour un choix de statut ou une opération sur le capital.</p>');
  }
  function doneLevel() { if (!R) return 0; const cl = checklist(profile()); const n = cl.filter(c => (S.legal || {})[c.k]).length; return n === 0 ? 0 : n >= cl.length * 0.8 ? 2 : 1; }
  return { render, doneLevel, profile, measures, checklist, structures, regimeTable, calendar, DEADLINES, ysum };
})();
sec('conformite', 'Résultats', 'Conformité & loi de finances 2026', 'Ce que la loi de finances 2026 change pour ton projet, tes impôts et cotisations année par année, le calendrier de tes paiements, l\'effet d\'un changement de statut et la check-list de tes obligations.', () => CF.render(), () => CF.doneLevel());
document.addEventListener('change', e => {
  const el = e.target; if (!el.dataset || !el.dataset.legal) return;
  S.legal = S.legal || {}; S.legal[el.dataset.legal] = el.checked; save(); rerenderKeepFocus();
});
