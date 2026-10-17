/* ================= Guides pédagogiques, glossaire et guide des statuts ================= */
const EDU = (() => {
  const D = typeof EDU_DATA !== 'undefined' ? EDU_DATA : { guides: {}, glossary: [], statut: null, metrics: [] };


  /* ---- compléments PlanBiz (parties absentes du fichier d'origine) ---- */
  const EXTRA = {
    pestel: { intro: 'Le PESTEL passe en revue ce qui, autour de toi, peut aider ou freiner ton projet : le Politique, l\'Économique, le Socioculturel, le Technologique, l\'Écologique et le Légal. Tu ne contrôles pas ces facteurs, mais tu dois montrer que tu les connais.',
      tips: ['Pour chaque facteur, écris un fait précis et indique s\'il joue pour toi (+), contre toi (−) ou les deux. « La sécheresse pousse les agriculteurs à économiser l\'eau » vaut mieux que « contexte favorable ».',
        'Cite une source ou un chiffre quand tu peux : une loi, un programme public, une statistique du HCP ou de Bank Al-Maghrib. Un jury fait davantage confiance à un PESTEL sourcé.',
        'Le bouton « Envoyer vers le SWOT » transforme tes facteurs positifs en opportunités et les négatifs en menaces. Il te reste ensuite à ajouter tes forces et tes faiblesses, qui sont internes.'] },
    hypotheses: { h: 'Compléments PlanBiz', tips: [
      'Impayés : indique la part des ventes que tu ne récupéreras jamais. Elle devient une charge, elle sort de ta trésorerie et la TVA correspondante n\'est pas due. Pour la vente aux particuliers payée comptant, mets 0 %. En B2B, compte 1 à 3 %, et 3 à 5 % avec le secteur public ou de très petits clients.',
      'Prime d\'ancienneté : le Code du travail impose 5 % du salaire après 2 ans de présence, 10 % après 5 ans et 15 % après 12 ans. PlanBiz la calcule à partir de la date d\'entrée de chaque salarié. Laisse-la activée, sauf si tes salaires saisis l\'incluent déjà.',
      'TVA : sur tes ventes, elle est due quand le client paie (régime de l\'encaissement, le régime par défaut au Maroc). Un client qui paie à 60 jours décale donc aussi ta TVA à payer.'] },
    financements: { h: 'Compléments PlanBiz', tips: [
      'Pour chaque levée de fonds, renseigne la valorisation « pré-money » : ce que vaut l\'entreprise juste avant l\'entrée de l\'investisseur. La part cédée est égale au montant levé divisé par la valorisation après la levée (pré-money + montant). Exemple : 2 M DH levés sur une pré-money de 8 M DH, soit 20 % du capital.',
      'La dilution s\'additionne d\'une levée à l\'autre : deux tours de 20 % laissent aux fondateurs 64 % du capital (80 % × 80 %). Garde une marge pour les tours suivants et pour l\'intéressement des talents clés.',
      'La valorisation indiquée en fin de plan est un ordre de grandeur par multiple du chiffre d\'affaires ou de l\'EBE. Elle sert à préparer une négociation, pas à la remplacer.'] },
    scenarios: { intro: 'Un business plan n\'est jamais juste à 100 %. Les financeurs veulent voir que ton projet tient même quand tout ne se passe pas comme prévu. Cette étape compare tes trois scénarios de volumes, puis te laisse tester des chocs sans toucher à tes données.',
      tips: ['Commence par le scénario pessimiste. Si la trésorerie devient négative, note le mois et le montant manquant : c\'est le coussin de financement à prévoir ou à négocier.',
        'Teste les chocs un par un : baisse des prix, hausse des coûts, retard de lancement, clients qui paient plus tard. Tu sauras ainsi quel risque menace le plus ton projet, et ton plan de risques pourra en tenir compte.',
        'Si tu importes du matériel ou des composants, renseigne la part de tes achats payée en devises, puis fais monter l\'euro ou le dollar avec le curseur.',
        'Un projet solide reste positif en trésorerie dans le scénario pessimiste, ou montre comment il couvrirait l\'écart (prêt d\'honneur, apport, décalage de recrutements).'] },
    conformite: { h: 'Compléments PlanBiz', tips: [
      'Les mesures de la loi de finances 2026 sont classées selon ton projet : « Concerne ton projet », « À vérifier » ou « Pas concerné ». Lis d\'abord la ligne « Pour toi », qui traduit chaque mesure en effet concret.',
      'Le calendrier des paiements montre ce que tu verses chaque mois à l\'État et à la CNSS. C\'est souvent là qu\'apparaissent les mois tendus de la trésorerie, en particulier avec les acomptes et le solde de l\'IS.',
      'Avant de changer de statut, compare les structures dans le tableau dédié : impôts, cotisations, TVA et trésorerie. Fais valider le choix final par un expert-comptable.'] },
    tableau: { h: 'Lire les métriques investisseurs', metrics: true }
  };

  /* ---- sigles → tooltip ---- */
  const SIG = D.glossary.filter(g => g.sig && g.t.length >= 2 && g.t.length <= 6 && /^[A-ZÉ0-9&/-]+$/.test(g.t));
  const SIGRE = SIG.length ? new RegExp('\\b(' + SIG.map(g => g.t.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|') + ')\\b', 'g') : null;
  const sigMap = Object.fromEntries(SIG.map(g => [g.t, g]));
  let seenSig = null;
  function glossify(escaped) {
    if (!SIGRE) return escaped;
    return escaped.replace(SIGRE, m => { if (seenSig) { if (seenSig.has(m)) return m; seenSig.add(m); } const g = sigMap[m]; return `<abbr class="gl" data-gl="${esc(m)}" title="${esc(g.full + (g.c ? ' : ' + g.c : ''))}">${m}</abbr>`; });
  }
  const para = t => String(t || '').split(/\n+/).map(l => l.replace(/^[☀-➿\u{1F300}-\u{1FAFF}️\s]+/u, '').trim()).filter(Boolean).map(l => `<p>${glossify(esc(l))}</p>`).join('');

  /* ---- guide block for a section ---- */
  function block(id) {
    const parts = (D.guides[id] || []).slice(), ex = EXTRA[id], sh = typeof EDU_SHORT !== 'undefined' ? EDU_SHORT[id] : null;
    if (!parts.length && !ex && !sh) return '';
    seenSig = new Set();
    let full = parts.map(p => `${p.h ? `<h4 class="gh">${esc(p.h)}</h4>` : ''}${p.intro ? `<div class="gi">${para(p.intro)}</div>` : ''}${p.tips.length ? `<div class="gtips">${p.tips.map(t => `<div class="gtip">${para(t)}</div>`).join('')}</div>` : ''}`).join('');
    if (ex) {
      if (ex.metrics && D.metrics.length) full += `<h4 class="gh">${esc(ex.h)}</h4><div class="tw"><table class="gmet"><tr><th>Métrique et formule</th><th>Repères</th><th>Comment l'améliorer</th></tr>${D.metrics.map(m => `<tr><td><b>${glossify(esc(m.m))}</b>${m.f ? `<br><span class="small muted mono">${esc(m.f)}</span>` : ''}</td><td>${glossify(esc(m.rep))}</td><td>${esc(m.lev || '—')}</td></tr>`).join('')}</table></div>${D.metricsSrc ? `<p class="small muted">${esc(D.metricsSrc)}</p>` : ''}`;
      else full += `${ex.h ? `<h4 class="gh">${esc(ex.h)}</h4>` : ''}${ex.intro ? `<div class="gi">${para(ex.intro)}</div>` : ''}<div class="gtips">${(ex.tips || []).map(t => `<div class="gtip">${para(t)}</div>`).join('')}</div>`;
    }
    const short = sh ? `<p class="gbref">${glossify(esc(sh.b))}</p><ul class="gkey">${sh.t.map(t => `<li>${glossify(esc(t))}</li>`).join('')}</ul>` : '';
    seenSig = null;
    const open = (() => { try { return localStorage.getItem('pb.guide.' + id) === '1'; } catch (e) { return false; } })();
    return `<details class="guide" data-guide="${id}" ${open ? 'open' : ''}><summary><span class="gico">${typeof ico === 'function' ? ico('glossaire') : ''}</span><span><b>L'essentiel de cette étape</b><small>${sh ? esc(sh.b) : 'Explications et conseils'}</small></span></summary>
      <div class="gbody">${short}${full ? `<details class="gmore"><summary>Lire le guide complet</summary>${full}</details>` : ''}<p class="gcredit"><a href="#glossaire" data-go="glossaire">Ouvrir le glossaire</a></p></div></details>`;
  }

  /* ---- glossary page ---- */
  let q = '', cat = '';
  const cats = () => [...new Set(D.glossary.map(g => g.cat))];
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function entryHTML(g, i) {
    return `<div class="ge" data-i="${i}" data-cat="${esc(g.cat)}" data-s="${esc(norm([g.t, g.full, g.c, g.ex, g.r].join(' ')))}">
      <div class="gt">${esc(g.t)}${g.full ? ` <span class="muted">· ${esc(g.full)}</span>` : ''}</div>
      <div class="gc">${glossify(esc(g.c || ''))}</div>
      ${g.ex ? `<div class="gx"><b>Exemple</b> ${esc(g.ex)}</div>` : ''}${g.r ? `<div class="gr2"><b>À retenir</b> ${esc(g.r)}</div>` : ''}</div>`;
  }
  function glossaryPage() {
    const list = D.glossary.map(entryHTML).join('');
    return card('Rechercher un mot', `${D.glossary.length} mots du business plan expliqués simplement, avec un exemple et le piège à éviter.`,
      `<div class="gsearch"><input id="glq" type="search" placeholder="Chercher un mot : EBE, BFR, pré-money, churn…" value="${esc(q)}" autocomplete="off"></div>
       <div class="row gcats"><button class="chip ${cat ? '' : 'on'}" data-glcat="">Tout</button>${cats().map(c => `<button class="chip ${cat === c ? 'on' : ''}" data-glcat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
       <p class="small muted" id="glcount"></p><div class="glist">${list}</div>`);
  }
  function applyFilter() {
    const nq = norm(q.trim()); let n = 0;
    document.querySelectorAll('.glist .ge').forEach(el => { const ok = (!cat || el.dataset.cat === cat) && (!nq || el.dataset.s.includes(nq)); el.hidden = !ok; if (ok) n++; });
    const c = document.getElementById('glcount'); if (c) c.textContent = `${n} résultat${n > 1 ? 's' : ''}`;
  }

  /* ---- statut page ---- */
  function statutPage() {
    const st = D.statut; if (!st) return '';
    const cols = st.cols || [];
    const mark = v => esc(v).replace(/^✅/, '<span class="ok">✓</span>').replace(/^❌/, '<span class="no">✕</span>');
    return card('Choisir son statut juridique', esc(st.intro || ''),
      st.groups.map(g => `<h4 class="gh">${esc(g.g.charAt(0) + g.g.slice(1).toLowerCase())}</h4><div class="tw"><table class="stt"><tr><th>Critère</th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>
        ${g.rows.map(r => `<tr><td><b>${esc(r.k)}</b>${r.h ? `<br><span class="small muted">${esc(r.h)}</span>` : ''}</td>${cols.map((_, j) => `<td>${mark(r.v[j] || '')}</td>`).join('')}</tr>`).join('')}</table></div>`).join('')
      + (st.notes || []).map(n => `<div class="gtip">${para(n)}</div>`).join('')
      + `<p class="small muted" style="margin-top:10px">Pour simuler l'effet d'un statut sur tes impôts et ta trésorerie, va dans <a href="#conformite" data-go="conformite">Conformité & loi de finances 2026</a>. Pour l'appliquer, change le statut par année dans <a href="#hypotheses" data-go="hypotheses">Hypothèses</a>.</p>`);
  }

  /* ---- help assistant context ---- */
  function termsFor(text, max = 8) {
    const t = norm(text); if (!t) return [];
    const reEsc = x => x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const keys = g => [g.t, g.full].filter(Boolean).flatMap(x => x.split(/\s[\/—–-]\s|[()\/,]/)).map(x => norm(x).trim()).flatMap(x => [x, ...x.split(/\s+/).filter(w => w.includes('-') && w.length >= 5)]).filter(x => x.length >= 3 || (g.sig && x.length >= 2));
    const seen = new Set(), out = [];
    D.glossary.forEach(g => {
      if (out.length >= max) return;
      const hit = keys(g).some(k => g.sig || k.length <= 4 ? new RegExp('(^|[^a-z0-9])' + reEsc(k) + '([^a-z0-9]|$)').test(t) : t.includes(k));
      const id = norm(g.t.split(/[\s(]/)[0]);
      if (hit && !seen.has(id)) { seen.add(id); out.push(`${g.t}${g.full ? ' (' + g.full + ')' : ''} : ${g.c}${g.ex ? ' Exemple : ' + g.ex : ''}${g.r ? ' À retenir : ' + g.r : ''}`); }
    });
    return out;
  }

  // events
  document.addEventListener('input', e => { if (e.target.id === 'glq') { q = e.target.value; applyFilter(); } });
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-glcat]'); if (c) { cat = c.dataset.glcat; document.querySelectorAll('[data-glcat]').forEach(b => b.classList.toggle('on', b === c)); applyFilter(); return; }
    const a = e.target.closest('abbr.gl'); if (a && !a.closest('.glist')) { q = a.dataset.gl; cat = ''; if (typeof go === 'function') go('glossaire'); }
  });
  document.addEventListener('toggle', e => { const d = e.target; if (d.classList && d.classList.contains('guide')) { try { localStorage.setItem('pb.guide.' + d.dataset.guide, d.open ? '1' : '0'); } catch (x) { } } }, true);

  return { block, glossaryPage, statutPage, applyFilter, termsFor, glossify, data: D };
})();
sec('glossaire', 'Ressources', 'Glossaire', 'Tous les mots du business plan, de la finance et de la fiscalité marocaine, expliqués simplement avec un exemple.', () => EDU.glossaryPage(), () => 0);
sec('statuts', 'Ressources', 'Choisir son statut', 'Auto-entrepreneur, SARL, SAS, SA, coopérative ou association : le comparatif détaillé pour choisir en connaissance de cause.', () => EDU.statutPage(), () => 0);
