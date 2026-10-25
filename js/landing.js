/* ================= Page d'accueil publique et FAQ ================= */
const PBLanding = (() => {
  const FAQ = [
    ['Le concept', [
      ['C\'est quoi, PlanBiz ?', 'Un outil en ligne qui t\'aide à construire le business plan de ton projet au Maroc, avec des prévisions financières sur 3 ans : compte de produits et charges, trésorerie mois par mois, bilan et indicateurs. Tu décris ton projet, PlanBiz fait les calculs selon la fiscalité marocaine et rédige un dossier prêt à présenter.'],
      ['À qui s\'adresse PlanBiz ?', 'Aux porteurs de projet, aux auto-entrepreneurs, aux TPE, aux startups et aux coopératives qui doivent présenter leur projet à une banque, à un programme de financement, à un incubateur ou à un investisseur.'],
      ['Ai-je besoin de connaissances en finance ?', 'Non. Chaque étape a un guide court avec l\'essentiel et des conseils, un glossaire explique 255 termes, et un assistant répond à tes questions. Le questionnaire express te donne un premier business plan chiffré en une dizaine de minutes.']
    ]],
    ['Les calculs et le dossier', [
      ['Les calculs suivent-ils les règles marocaines ?', 'Oui : IS, cotisation minimale, contribution sociale de solidarité 2026-2028, TVA à l\'encaissement, CNSS et AMO, IR sur salaires, prime d\'ancienneté et mesures de la loi de finances 2026. Les règles sont mises à jour à chaque loi de finances. Pour une décision fiscale importante, fais valider ton choix par un expert-comptable.'],
      ['Mon dossier sera-t-il accepté par une banque ?', 'PlanBiz produit les documents que demandent généralement les banques et les programmes : prévisions de résultat, plan de trésorerie, bilan prévisionnel, plan de financement et hypothèses détaillées. La décision reste celle de la banque, qui juge aussi le projet et l\'équipe. PlanBiz n\'a pas encore de partenariat officiel avec une banque.'],
      ['Et pour Intelaka, qui demande 5 ans ?', 'Aujourd\'hui PlanBiz projette sur 3 ans. Le passage à 5 ans est prévu, justement pour les dossiers Intelaka.'],
      ['Quels statuts sont pris en charge ?', 'Auto-entrepreneur, SARL, SARL à associé unique, SAS, SA et coopérative. Tu peux changer de statut d\'une année à l\'autre, par exemple démarrer en auto-entrepreneur puis passer en SARL. La page « Choisir son statut » compare les options.'],
      ['Comment trouver un financement adapté ?', 'Le Radar des financements, dans les ressources de l\'application, liste les programmes marocains (prêts, garanties, primes, prêts d\'honneur, accompagnement) et met en avant ceux qui correspondent à ton profil et à ton besoin. Chaque fiche indique les conditions, la date de vérification et le lien officiel. Vérifie toujours auprès de l\'organisme avant de déposer.'],
      ['Que puis-je exporter ?', 'Un rapport PDF complet avec graphiques, un fichier Excel, un pitch deck en PowerPoint ou en PDF, et une sauvegarde de ton projet que tu peux réimporter.'],
      ['Puis-je tester différents scénarios ?', 'Oui. Chaque projet a trois scénarios (pessimiste, réaliste, optimiste) et un simulateur pour tester une baisse des prix, une hausse des coûts, un retard de démarrage ou une hausse de l\'euro.']
    ]],
    ['L\'intelligence artificielle', [
      ['À quoi sert l\'IA dans PlanBiz ?', 'Elle peut remplir ton business plan à partir de tes notes, analyser chaque partie comme le ferait un financeur, rédiger la stratégie et répondre à tes questions. Elle est facultative : tout peut se faire à la main.'],
      ['Où partent mes données quand j\'utilise l\'IA ?', 'Le texte concerné est envoyé au service Claude d\'Anthropic, aux États-Unis, qui renvoie la réponse. PlanBiz te demande ton accord avant la première utilisation. Si tu refuses, le reste de l\'application fonctionne normalement.'],
      ['Y a-t-il une limite ?', 'Oui, pour maîtriser les coûts : 30 générations et 60 questions à l\'assistant par jour et par compte.'],
      ['L\'assistant parle-t-il arabe ou anglais ?', 'L\'interface est en français, mais l\'assistant répond dans la langue de ta question.']
    ]],
    ['Compte, prix et données', [
      ['PlanBiz est-il gratuit ?', 'Oui, pendant la phase de lancement. Des offres payantes viendront pour des besoins avancés. Tes projets resteront à toi et exportables.'],
      ['Où sont stockées mes données ?', 'Dans un centre de données à Paris. Toi seul accèdes à tes business plans depuis l\'application. Nous ne vendons aucune donnée et n\'affichons aucune publicité.'],
      ['Puis-je essayer sans créer de compte ?', 'Oui, avec la démo : un business plan d\'exemple complet, à explorer librement. Rien n\'y est enregistré.'],
      ['Comment supprimer mon compte ?', 'Depuis le menu de ton compte, « Supprimer mon compte ». Tes business plans sont effacés immédiatement, et le compte sous 30 jours au plus.'],
      ['Je suis un incubateur ou une fiduciaire, puis-je l\'utiliser avec mes clients ?', 'Une offre pour suivre plusieurs porteurs de projet est en préparation. Écris-nous via le contact indiqué dans les mentions légales pour faire partie des premiers.']
    ]]
  ];

  const faqHTML = (opts = {}) => FAQ.map(([g, qs]) => `<section class="faq-g"><h3>${esc(g)}</h3>${qs.map(([q, a], i) => `<details class="faq-q" ${opts.openFirst && i === 0 && g === FAQ[0][0] ? 'open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`).join('');

  const STEPS = [
    ['1', 'Décris ton projet', 'Réponds au questionnaire express, remplis les étapes une à une, ou colle tes notes et laisse l\'IA préremplir.'],
    ['2', 'PlanBiz calcule', 'Résultat, trésorerie sur 36 mois, bilan, impôts, TVA, CNSS et besoin de financement, selon les règles marocaines 2026.'],
    ['3', 'Présente ton dossier', 'Exporte un rapport PDF, un fichier Excel et un pitch deck, prêts pour la banque, un programme ou un investisseur.']
  ];
  const FEATS = [
    ['Fiscalité marocaine à jour', 'IS, cotisation minimale, CSS, TVA à l\'encaissement, CNSS, AMO, IR et loi de finances 2026.'],
    ['Trésorerie et scénarios', 'Le mois où ta trésorerie est la plus basse, le montant à financer, et l\'effet d\'un scénario pessimiste.'],
    ['Radar des financements', 'Une trentaine de programmes marocains vérifiés, triés selon ton profil : Intelaka, garanties Tamwilcom, primes TPME, prêts d\'honneur.'],
    ['Analyse comme un financeur', 'Une lecture critique de chaque partie, avec les questions qu\'un banquier te posera.'],
    ['Conformité et statuts', 'Ce qui te concerne dans la loi de finances, ton calendrier fiscal et la comparaison des statuts.'],
    ['Guides et glossaire', 'L\'essentiel de chaque étape, des conseils concrets et 255 termes expliqués simplement.']
  ];
  const WHO = [
    ['Porteur de projet', 'Tu montes ton dossier pour une banque, Intelaka, Forsa ou un incubateur.'],
    ['Auto-entrepreneur', 'Tu veux savoir quand passer en société et ce que ça change pour tes impôts.'],
    ['Startup', 'Tu prépares une levée : pitch deck, table de capitalisation et valorisation.'],
    ['Coopérative et TPE', 'Tu veux chiffrer un nouveau projet ou convaincre un partenaire.']
  ];

  function render() {
    const el = document.getElementById('landing'); if (!el) return;
    const logo = window.PB ? PB.logo() : '';
    el.innerHTML = `<header class="ld-top"><a class="auth-brand ld-brand" href="#" data-ld="top"><span class="logo-sm">${logo}</span><b>PlanBiz</b></a><nav class="ld-nav" aria-label="Sections"><a href="#ld-concept" data-ld="concept">Le concept</a><a href="#ld-faq" data-ld="faq">Questions fréquentes</a><a href="/simulateur-lf2027.html">Simulateur PLF 2027</a></nav><span class="sp"></span><button class="btn ghost sm" data-auth="login">Se connecter</button><button class="btn pri sm" data-auth="signup">Créer un compte</button></header>
    <section class="ld-hero"><div class="ld-wrap ld-hero-in">
      <div class="ld-hero-t"><p class="eyebrow">Business plan · Maroc · loi de finances 2026</p>
        <h1>Ton business plan chiffré, prêt pour la banque.</h1>
        <p class="ld-lead">Décris ton projet. PlanBiz calcule tes prévisions sur 3 ans selon la fiscalité marocaine et rédige un dossier que tu peux présenter à une banque, un programme ou un investisseur.</p>
        <div class="row ld-cta"><button class="btn pri big" data-auth="signup">Créer mon business plan gratuitement</button><button class="btn big" data-pb="demo">Essayer la démo</button></div>
        <p class="small muted">Gratuit pendant le lancement. Aucune carte bancaire. <button class="linkbtn" data-pb="video">Voir la vidéo d'une minute</button></p></div>
      <div class="ld-shot" aria-hidden="true"><div class="pv-head"><span>Aperçu · exemple</span><span class="pv-pill">Réaliste</span></div>
        <div class="pv-kpis"><div><small>CA An 3</small><b>10,59 M</b><i class="up">+96 %</i></div><div><small>EBE An 3</small><b>1,81 M</b><i class="up">17,1 %</i></div><div><small>Tréso. min.</small><b>225 k</b><i>févr. 27</i></div></div>
        <div class="pv-chart">${[22, 30, 26, 38, 34, 46, 52, 48, 60, 68, 74, 86].map((h, i) => `<span style="height:${h}%" class="${i > 8 ? 'hi' : ''}"></span>`).join('')}</div>
        <div class="pv-foot"><span>An 1</span><span>An 2</span><span>An 3</span></div></div>
    </div></section>

    <section class="ld-sec" id="ld-concept"><div class="ld-wrap">
      <p class="eyebrow">Le concept</p><h2>Un dossier bancable, sans être expert-comptable</h2>
      <p class="ld-p">La plupart des projets ne manquent pas d'argent disponible. Ils sont refusés parce que le dossier est incomplet, que les chiffres ne tiennent pas ensemble ou que la fiscalité est mal prise en compte. Faire appel à un consultant coûte de 1 000 à 25 000 DH selon qu'on passe par un freelance, un consultant ou un cabinet. PlanBiz te donne la même structure et les mêmes calculs, et t'explique chaque étape pour que tu puisses défendre ton dossier toi-même.</p>
      <ol class="ld-steps">${STEPS.map(([n, t, d]) => `<li><span class="ld-n">${n}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}</ol>
    </div></section>

    <section class="ld-sec ld-alt"><div class="ld-wrap">
      <p class="eyebrow">Ce que tu obtiens</p><h2>Tout ce qu'un financeur va regarder</h2>
      <div class="ld-grid">${FEATS.map(([t, d]) => `<div class="ld-card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
    </div></section>

    <section class="ld-sec"><div class="ld-wrap">
      <p class="eyebrow">Pour qui</p><h2>Pensé pour les projets marocains</h2>
      <div class="ld-grid ld-who">${WHO.map(([t, d]) => `<div class="ld-card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div>
      <div class="ld-next"><div><b>Bientôt : PlanBiz Suivi</b><p>Une fois l'entreprise lancée, compare chaque mois ton réel à ton plan, reçois une alerte avant un trou de trésorerie et partage un suivi clair avec ta fiduciaire ou ta banque.</p></div></div>
    </div></section>

    <section class="ld-sec ld-alt" id="ld-faq"><div class="ld-wrap ld-faq">
      <p class="eyebrow">Questions fréquentes</p><h2>Tout ce que tu te demandes</h2>
      ${faqHTML({ openFirst: true })}
    </div></section>

    <section class="ld-final"><div class="ld-wrap"><h2>Commence ton business plan aujourd'hui</h2><p>Un premier dossier chiffré en une dizaine de minutes avec le questionnaire express.</p>
      <div class="row ld-cta"><button class="btn pri big" data-auth="signup">Créer mon compte gratuit</button><button class="btn big" data-pb="demo">Explorer la démo</button></div></div></section>
    <footer class="hub-credit"><a href="/legal.html" target="_blank" rel="noopener">Mentions légales et confidentialité</a></footer>`;
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-ld]'); if (!a) return;
    e.preventDefault();
    const t = a.dataset.ld === 'top' ? document.getElementById('landing') : document.getElementById('ld-' + a.dataset.ld);
    if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  // FAQ aussi dans l'application, avec les ressources
  if (typeof sec === 'function') sec('faq', 'Ressources', 'Questions fréquentes', 'Le concept de PlanBiz, les calculs, l\'IA, ton compte et tes données.', () => `<div class="ld-faq in-app">${faqHTML()}</div>`, () => 0);

  return { render, FAQ };
})();
