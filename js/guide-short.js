/* ================= Guides courts : l'essentiel de chaque étape ================= */
const EDU_SHORT = {
  identite: { b: 'La carte d\'identité de ton projet : ce que tu fais, où et à quel stade.', t: [
    'Un nom et une phrase d\'accroche clairs valent mieux qu\'une longue description.',
    'Le pitch doit tenir en deux phrases : le problème que tu résous et pour qui.',
    'Coche tous les types d\'activité et secteurs qui te concernent : ils orientent les listes proposées ensuite.'] },
  equipe: { b: 'Les financeurs investissent d\'abord dans une équipe. Présente les profils clés, puis ton plan de recrutement.', t: [
    'Saisis les salaires NETS : PlanBiz calcule le brut, la CNSS, l\'IR et le coût employeur.',
    'Coût employeur d\'un salarié ≈ brut + 21,5 % jusqu\'à 6 000 DH de brut, puis ≈ 12 % au-delà.',
    'Montre qui couvre chaque compétence clé (vente, technique, opérations) et ce qui manque encore.'] },
  vision: { b: 'Pourquoi ton projet existe et où il va : vision, mission, objectifs chiffrés.', t: [
    'Vision = la destination à 3-5 ans. Mission = ce que tu fais aujourd\'hui, pour qui.',
    'Un objectif SMART est chiffré et daté : « 120 clients et 80 000 DH de revenu mensuel au 31/12 ».',
    'Les ODD comptent pour les bailleurs et les fonds à impact : cite seulement ceux que tu sers vraiment.'] },
  marche: { b: 'Le cœur du récit : le problème, ta solution, tes clients, tes concurrents et la taille du marché.', t: [
    'Parle du bénéfice client, pas de ta technologie : « −30 % d\'eau consommée » plutôt que « capteurs IoT ».',
    'TAM → SAM → SOM : pars du marché total et rétrécis jusqu\'à la part que tu peux vraiment capter.',
    'Cite toujours tes concurrents, y compris « ne rien faire » ou l\'informel. « Aucun concurrent » inquiète un investisseur.'] },
  offre: { b: 'Le Business Model Canvas résume sur une page comment ton entreprise crée de la valeur et gagne de l\'argent.', t: [
    'Chaque bloc doit répondre à une question simple : pour qui, quoi, comment, avec qui, combien.',
    'Privilégie les revenus récurrents (abonnement, contrat) : ils valent plus aux yeux d\'un investisseur.',
    'Liste tes partenaires clés et prévois une alternative à chaque fournisseur critique.'] },
  marketing: { b: 'Comment tu te fais connaître, attires tes clients et les fidélises, avec un budget par canal.', t: [
    'Un bon positionnement tient en une phrase : pour qui, quel bénéfice, contre quelle alternative.',
    'Choisis peu de canaux, mesurés par un indicateur (KPI) : mieux vaut 3 canaux suivis que 10 dispersés.',
    'Ton budget marketing alimente automatiquement les charges et le coût d\'acquisition client (CAC).'] },
  plan: { b: 'Découpe ton projet en actions datées, avec un responsable. Le Gantt se construit tout seul.', t: [
    'Commence par les jalons qui conditionnent le reste : création de la société, MVP, premiers clients, levée.',
    'Une action = un verbe + un résultat mesurable (« Signer 15 revendeurs »).',
    'Mets à jour le statut chaque mois : c\'est ton tableau de pilotage.'] },
  pestel: { b: 'Les forces extérieures qui aident ou freinent ton projet : politique, économie, société, technologie, écologie, droit.', t: [
    'Un fait précis vaut mieux qu\'une généralité : une loi, un programme public, un chiffre du HCP.',
    'Indique si chaque facteur joue pour toi (+) ou contre toi (−).',
    'Envoie tes facteurs vers le SWOT : les positifs deviennent des opportunités, les négatifs des menaces.'] },
  swot: { b: 'Une photo honnête de ta situation, puis des stratégies concrètes pour en tirer parti.', t: [
    'Forces et faiblesses sont internes. Opportunités et menaces viennent de l\'extérieur.',
    'Une faiblesse assumée avec un plan d\'action rassure plus qu\'un SWOT trop flatteur.',
    'Chaque stratégie croisée doit devenir une action dans ton plan d\'actions.'] },
  risques: { b: 'Prévois les coups durs : chaque risque reçoit une probabilité, un impact et un plan d\'atténuation.', t: [
    'Criticité = probabilité × impact. Traite d\'abord les risques notés 6 à 9.',
    'Pense aux risques marocains classiques : retards de paiement publics, change, dépendance à un client.',
    'Chaque plan d\'atténuation a un responsable et une échéance.'] },
  hypotheses: { b: 'Les choix qui pilotent tout le plan : statut par année, calendrier, inflation, délais de paiement, impayés.', t: [
    'Le statut décide de ta fiscalité : tu peux démarrer en auto-entrepreneur puis passer en SARL.',
    'Chaque jour de délai client creuse ta trésorerie. Un client public paie souvent à 90-120 jours.',
    'Reste prudent : inflation de 2-3 %, impayés de 1 à 3 % en B2B, et un coussin de trésorerie de 1 à 3 mois de charges.'] },
  offres: { b: 'Pour chaque offre : son prix, ses volumes mensuels et ses coûts variables. Le chiffre d\'affaires se calcule seul.', t: [
    'Tous les montants sont hors taxe. La TVA est gérée automatiquement.',
    'Pour un freemium, ne compte que les utilisateurs payants dans les volumes.',
    'Vérifie ta marge sur coût variable : si elle est faible, aucun volume ne rendra le projet rentable.'] },
  investissements: { b: 'Les biens durables (plus d\'un an) nécessaires à ton activité. Ils sont amortis, pas passés en charge d\'un coup.', t: [
    'Le taux d\'amortissement suit les barèmes de la DGI : ordinateur 20-25 %, machine 10-15 %, bâtiment 4-5 %.',
    'Les biens de moins de 10 000 DH peuvent souvent passer en charges.',
    'La TVA payée sur un gros investissement crée un crédit qui pèse sur ta trésorerie au départ.'] },
  charges: { b: 'Ce que tu paies même sans rien vendre : loyer, énergie, honoraires, abonnements, assurances.', t: [
    'Choisis un libellé dans la liste : la TVA et la périodicité se proposent automatiquement.',
    'Les salaires et le marketing sont déjà comptés ailleurs : ne les ajoute pas ici.',
    'Les charges ponctuelles (constitution, dépôt de marque, salon) se saisissent avec leur date.'] },
  financements: { b: 'D\'où vient l\'argent : apports, levées, comptes courants, subventions et emprunts.', t: [
    'Capital et subventions ne se remboursent pas. Un compte courant d\'associé et un emprunt, si.',
    'Une subvention d\'investissement est étalée sur la durée du bien. Une subvention d\'exploitation compte tout de suite.',
    'Pour une levée, renseigne la valorisation pré-money : PlanBiz calcule la part cédée et la dilution.'] },
  tableau: { b: 'La photo de ton projet en chiffres clés, comparés aux repères que regardent les investisseurs.', t: [
    'Le rapport LTV / CAC doit dépasser 3 : un client doit rapporter au moins 3 fois ce qu\'il coûte à acquérir.',
    'Le payback du CAC idéal est inférieur à 12 mois.',
    'Un projet « default alive » reste positif en trésorerie sans nouvelle levée.'] },
  scenarios: { b: 'Teste la résistance de ton projet quand tout ne se passe pas comme prévu.', t: [
    'Regarde d\'abord le scénario pessimiste : sa trésorerie la plus basse est le vrai besoin de financement.',
    'Teste un choc à la fois (prix, coûts, retard, délais, change) pour trouver ton risque principal.',
    'Un projet solide reste positif en pessimiste, ou explique comment il couvrirait l\'écart.'] },
  etats: { b: 'Les états financiers officiels : compte de produits et charges, trésorerie sur 36 mois, bilan et affectation du résultat.', t: [
    'Le CPC dit si tu gagnes de l\'argent. La trésorerie dit si tu peux payer tes factures. Les deux comptent.',
    'Le bilan doit être équilibré (actif = passif). PlanBiz le vérifie à chaque calcul.',
    'L\'EBE mesure la rentabilité du métier, avant amortissements, intérêts et impôts.'] },
  conformite: { b: 'Ce que la loi de finances 2026 change pour toi, ce que tu paies à l\'État et ce que tu dois déclarer.', t: [
    'Lis d\'abord les mesures marquées « Concerne ton projet » et leur effet concret.',
    'Le calendrier des paiements montre les mois tendus : TVA, CNSS, acomptes et solde de l\'IS.',
    'Compare les statuts avant d\'en changer, puis fais valider ton choix par un expert-comptable.'] },
  bp: { b: 'Ton business plan rédigé à partir de tes saisies, prêt à exporter en PDF, Excel ou pitch deck.', t: [
    'Complète la stratégie : c\'est la partie que les jurys lisent le plus attentivement.',
    'Relis chaque chiffre clé avec le tableau de bord avant d\'envoyer le document.',
    'Exporte le PDF pour un dossier et le pitch deck pour une présentation orale.'] },
  pitch: { b: 'Une présentation de 13 diapositives générée à partir de ton business plan, à modifier puis présenter.', t: [
    'Une idée par diapositive, avec un chiffre fort plutôt qu\'un paragraphe.',
    'Le jury retient trois choses : le problème, la traction et ce que tu demandes.',
    'Entraîne-toi à tenir 5 à 7 minutes, soit environ 30 secondes par diapositive.'] }
};
