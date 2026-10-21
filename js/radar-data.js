/* Radar des financements : programmes vérifiés le 20 octobre 2026. Mettre à jour la date maj à chaque révision. */
const RADAR_DATA = { maj: '2026-10-20', items: [
{
"id": "intelaka",
"nom": "Intelaka (Damane Intelak et Intelak Al Moustatmir Al Qarawi)",
"organisme": "Tamwilcom et banques partenaires",
"type": "pret",
"pour": [
"porteur",
"auto-entrepreneur",
"tpe",
"startup",
"jeune",
"mre",
"rural",
"agriculture"
],
"montant": "Crédit jusqu'à 1,2 MDH garanti à 80 % (85 % pour les entreprises de femmes ou de MRE), prêts d'honneur jusqu'à 300 000 DH",
"conditions": [
"Chiffre d'affaires inférieur ou égal à 10 MDH HT",
"Entreprise créée depuis 5 ans au plus, sauf exportateurs vers l'Afrique et exploitations du volet rural",
"Tous secteurs sauf promotion immobilière et pêche hauturière",
"Taux annoncé au lancement : 2 % HT en urbain et 1,75 % HT en rural",
"Dossier déposé auprès d'une banque partenaire"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Plafond et garantie confirmés par le kit du CRI Casablanca-Settat d'août 2026. Les taux de 2 % et 1,75 % datent du lancement en 2020, confirme-les avec ta banque. Demande aussi à la banque la durée de prévisionnel attendue (souvent 5 ans).",
"crit": [
[
"ca_max",
10000000.0
],
[
"age_max",
5
],
[
"credit_max",
1200000.0
]
]
},
{
"id": "damane-express",
"nom": "Damane Express",
"organisme": "Tamwilcom",
"type": "garantie",
"pour": [
"tpe",
"pme",
"auto-entrepreneur",
"femme"
],
"montant": "Garantie de 75 % (80 % pour les entreprises de femmes) sur des crédits ou leasings jusqu'à 1 MDH, ou des prêts d'honneur jusqu'à 300 000 DH",
"conditions": [
"Crédits de trésorerie, d'exploitation ou de continuité d'activité",
"Demande déposée par la banque, la société de leasing ou l'association agréée",
"Montant garanti limité à 1 MDH par crédit"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"crit": [
[
"pret_unit_max",
1000000.0
]
]
},
{
"id": "damane-istitmar",
"nom": "Damane Istitmar",
"organisme": "Tamwilcom",
"type": "garantie",
"pour": [
"tpe",
"pme"
],
"montant": "Garantie de 60 % des crédits d'investissement supérieurs à 1 MDH, majorée de 10 points pour certaines entreprises",
"conditions": [
"Crédits ou leasings à moyen et long terme supérieurs à 1 MDH, y compris transmission et reprise",
"Bonus de 10 points pour les entreprises de moins de 3 ans ou industrielles, exportatrices ou vertes avec comptes audités sans réserve",
"Restructuration financière garantie à 50 %",
"Tous secteurs sauf promotion immobilière et pêche hauturière"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"crit": [
[
"pret_unit_min",
1000000.0
]
]
},
{
"id": "damane-atayssir",
"nom": "Damane Atayssir",
"organisme": "Tamwilcom",
"type": "garantie",
"pour": [
"pme"
],
"montant": "Garantie d'environ 60 % des crédits de fonctionnement supérieurs à 1 MDH, plafonnée à 15 MDH par opération et 30 MDH par entreprise",
"conditions": [
"Crédits de fonctionnement ou de BFR supérieurs à 1 MDH",
"Plafond porté à 40 MDH par entreprise pour les industriels, exportateurs ou entreprises vertes avec comptes audités sans réserve"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"crit": [
[
"pret_unit_min",
1000000.0
]
]
},
{
"id": "ilayki-invest",
"nom": "Ilayki Invest",
"organisme": "Tamwilcom",
"type": "pret",
"pour": [
"femme"
],
"montant": "Cofinancement de 1 à 5 MDH, dans la limite de 40 % du coût du projet, à 2 % HT par an",
"conditions": [
"Entreprise dirigée par une femme ou à capital majoritairement féminin",
"Création ou extension dans les secteurs listés (services à l'industrie, éducation, logistique, énergie, économie verte, IT, tourisme, santé, etc.)",
"Durée de 7 ans au plus, dont 2 ans de différé au maximum"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "La presse de juin 2026 confirme que l'offre Ilayki est maintenue dans le plan Jossour 2030 de Tamwilcom.",
"crit": [
[
"toggle",
"femme"
],
[
"inv_min",
2500000.0
]
]
},
{
"id": "mdm-invest",
"nom": "MDM Invest et MDM Tamwil",
"organisme": "Tamwilcom et banques partenaires",
"type": "pret",
"pour": [
"mre"
],
"montant": "MDM Invest finance 10 % du projet, plafonné à 5 MDH. MDM Tamwil finance jusqu'à 40 % du projet, entre 1 et 5 MDH",
"conditions": [
"Marocain résidant à l'étranger ou rentré définitivement depuis moins d'un an",
"MDM Invest : projet d'au moins 1 MDH avec 20 % de fonds propres",
"MDM Tamwil : projet d'au moins 2,5 MDH avec participation majoritaire du bénéficiaire"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"crit": [
[
"toggle",
"mre"
],
[
"inv_min",
1000000.0
],
[
"apport_min",
0.2
]
]
},
{
"id": "charte-tpme",
"nom": "Dispositif de soutien spécifique aux TPME (Charte de l'investissement)",
"organisme": "Ministère de l'Investissement et Centres régionaux d'investissement (CRI)",
"type": "prime_investissement",
"pour": [
"tpe",
"pme",
"startup"
],
"montant": "Prime emploi de 5 à 10 %, prime territoriale de 10 ou 15 % et prime sectorielle de 10 %, cumulables dans la limite de 30 % de l'investissement",
"conditions": [
"Investissement compris entre 1 et 50 MDH, dont au moins 10 % en fonds propres",
"Chiffre d'affaires entre 1 et 200 MDH, sauf entreprises de moins de 3 ans",
"Au moins 1,5 emploi stable par million investi (1 pour le tourisme)",
"Entreprise marocaine indépendante des grands groupes, activité sur la liste régionale éligible",
"Dossier déposé en ligne auprès du CRI de la région"
],
"calendrier": "Ouvert toute l'année depuis le BO n°7454 du 6 novembre 2025",
"statut": "ouvert",
"lien": "https://cri-accompagnement.casainvest.ma",
"source": "https://fr.le360.ma/economie/charte-de-linvestissement-le-dispositif-de-soutien-aux-tpme-desormais-operationnel_GDNGOTXTA5E5RLGHRYQJD3XFUI/",
"verifie_le": "2026-10-20",
"note": "La plateforme de dépôt dépend de la région (CRI-Accompagnement à Casablanca-Settat). La prime est versée après réalisation des engagements.",
"crit": [
[
"inv_min",
1000000.0
],
[
"inv_max",
50000000.0
],
[
"apport_min",
0.1
],
[
"emplois_par_mdh",
1.5
],
[
"ca_max",
200000000.0
]
]
},
{
"id": "pact-maroc-pme",
"nom": "Programmes PACT (Pacte TPME)",
"organisme": "Agence Maroc PME",
"type": "subvention",
"pour": [
"tpe",
"pme"
],
"montant": "Prise en charge de 50 à 90 % des prestations de conseil et d'accompagnement, avec des plafonds de 20 000 DH à 2,4 MDH selon l'offre",
"conditions": [
"PME marocaine privée avec un chiffre d'affaires inférieur ou égal à 200 MDH",
"Hors filiales majoritaires de grands groupes",
"Offres : Scale Up, Qualité, Performance, Organisation, Gestion, Transmission, Restructuration, Décarbonation et Eau"
],
"calendrier": "Pacte TPME lancé le 29 avril 2026, candidatures auprès de Maroc PME",
"statut": "ouvert",
"lien": "https://marocpme.gov.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Les anciens programmes Imtiaz et Istitmar n'apparaissent plus dans les offres de 2026.",
"crit": [
[
"ca_max",
200000000.0
]
]
},
{
"id": "tatwir-rd",
"nom": "Tatwir R&D et Innovation (Fonds de soutien de l'innovation)",
"organisme": "Ministère de l'Industrie et du Commerce",
"type": "subvention",
"pour": [
"pme",
"startup"
],
"montant": "80 % des frais de brevet jusqu'à 1 MDH, 60 % de la R&D jusqu'à 4 MDH, 30 % de l'industrialisation pilote jusqu'à 5 MDH",
"conditions": [
"Entreprise industrielle avec un chiffre d'affaires inférieur ou égal à 200 MDH HT sur les deux derniers exercices",
"Sous-programme gaming : 70 % du prototypage jusqu'à 1 MDH",
"Dépenses éligibles à partir du 1er janvier 2026"
],
"calendrier": "Appel 2026-2028. La date limite 2026 était le 15 octobre, les dates 2027 seront annoncées",
"statut": "recurrent",
"lien": "https://www.mcinet.gov.ma",
"source": "https://www.maroc.ma/fr/actualites/appel-projets-2026-2028-fonds-de-soutien-de-linnovation-programmes-dappui-linnovation-industrielle",
"verifie_le": "2026-10-20",
"note": "La fenêtre 2026 est close. Prépare ton dossier pour la fenêtre 2027.",
"crit": [
[
"ca_max",
200000000.0
],
[
"secteur",
"industrie"
]
]
},
{
"id": "green-invest",
"nom": "Green Invest",
"organisme": "Tamwilcom et banques partenaires",
"type": "pret",
"pour": [
"tpe",
"pme"
],
"montant": "Cofinancement bancaire avec une part Tamwilcom plafonnée à 10 MDH",
"conditions": [
"Projets d'énergie renouvelable, d'efficacité énergétique, de dépollution ou de valorisation des déchets",
"Bâtiments limités à 20 % du coût du projet"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Réservé aux projets verts : vérifie que ton activité entre dans le champ.",
"crit": [
[
"secteur",
"vert"
]
]
},
{
"id": "cap-access",
"nom": "Cap Access",
"organisme": "Fonds Mohammed VI pour l'Investissement et Tamwilcom",
"type": "pret",
"pour": [
"pme"
],
"montant": "Dette subordonnée de 1 à 30 MDH, soit au plus un tiers du financement",
"conditions": [
"Chiffre d'affaires entre 10 et 500 MDH et au moins 3 ans d'activité",
"Prêt bancaire d'au moins deux tiers du financement, minimum 2 MDH",
"Taux de 5,5 % HT par an pour les dossiers 2025",
"Nombreux secteurs exclus (immobilier, tabac, alcool, jeux, énergies fossiles, mines)"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.tamwilcom.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Le taux 2026 n'est pas publié, seul celui des dossiers 2025 est connu.",
"crit": [
[
"ca_min",
10000000.0
],
[
"age_min",
3
]
]
},
{
"id": "svb-bourses",
"nom": "Startup Venture Building : Bourse de vie et Bourse d'incubation",
"organisme": "Ministère de la Transition numérique, Tamwilcom et opérateurs labellisés",
"type": "subvention",
"pour": [
"startup"
],
"montant": "Bourse de vie jusqu'à 40 000 DH par mois et par fondateur pendant 12 mois au plus, bourse d'incubation jusqu'à 200 000 DH",
"conditions": [
"Startup innovante passant par un opérateur partenaire (Technopark, CEED Maroc, Flat6Labs, 500 Global, etc.)",
"Bourse de vie : fondateur marocain résidant au Maroc avec au moins 5 ans d'expérience, POC validé et premier prototype",
"Bourse d'incubation : couvre jusqu'à 90 % du programme, avec 10 % d'apport"
],
"calendrier": "Programme lancé en décembre 2025 pour 3 ans, candidatures via les opérateurs",
"statut": "ouvert",
"lien": "https://www.technopark.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Il n'existe pas de plateforme de candidature centrale, il faut passer par un opérateur.",
"crit": []
},
{
"id": "svb-prets",
"nom": "Startup Venture Building : Prêt d'honneur et Prêt d'amorçage",
"organisme": "Ministère de la Transition numérique, Tamwilcom et opérateurs labellisés",
"type": "pret_honneur",
"pour": [
"startup"
],
"montant": "Prêt d'honneur sans intérêt jusqu'à 500 000 DH, prêt d'amorçage de 500 000 DH à 2 MDH",
"conditions": [
"Prêt d'honneur : couvre jusqu'à 90 % du besoin, avec 10 % d'apport et une convention avec un opérateur",
"Prêt d'amorçage : au moins 2 ans d'activité et chiffre d'affaires en croissance",
"Prêt d'amorçage limité à 50 % des fonds propres, remboursable en 5 ans avec 1 an de différé"
],
"calendrier": "Programme lancé en décembre 2025 pour 3 ans, candidatures via les opérateurs",
"statut": "ouvert",
"lien": "https://www.technopark.ma",
"source": "https://telquel.ma/sponsors/technopark-et-tamwilcom-la-mecanique-du-startup-venture-building_1982534",
"verifie_le": "2026-10-20",
"crit": [
[
"apport_min",
0.1
]
]
},
{
"id": "tech-start-boost",
"nom": "Tech Start, Tech Boost, Innov Risk et Innov Dev",
"organisme": "Tamwilcom (ex-Fonds Innov Invest)",
"type": "pret_honneur",
"pour": [
"startup"
],
"montant": "Tech Start jusqu'à 200 000 DH (400 000 DH si brevet), Tech Boost jusqu'à 500 000 DH, Innov Risk jusqu'à 2 MDH, Innov Dev jusqu'à 3 MDH",
"conditions": [
"Tech Start et Tech Boost couvrent 80 % des coûts avec 20 % d'apport, via une structure labellisée",
"Innov Risk et Innov Dev sont plafonnés à 50 % des fonds levés auprès d'investisseurs externes"
],
"calendrier": "Disponibilité 2026 à confirmer auprès de Tamwilcom",
"statut": "a_verifier",
"lien": "https://www.tamwilcom.ma",
"source": "https://fnh.ma/article/actualite-economique/fonds-innov-invest-maroc-startups-590-mdh",
"verifie_le": "2026-10-20",
"note": "Tamwilcom a présenté le bilan final du Fonds Innov Invest le 17 septembre 2026. Les nouveaux financements startups passent désormais surtout par le Startup Venture Building.",
"crit": []
},
{
"id": "vc-digital-2030",
"nom": "Capital-risque Digital Morocco 2030",
"organisme": "Ministère de la Transition numérique",
"type": "capital",
"pour": [
"startup"
],
"montant": "Enveloppe publique de 450 MDH pour le capital-risque",
"conditions": [
"Startups numériques en phase de levée",
"Accès via les fonds de capital-risque partenaires, non encore nommés publiquement"
],
"calendrier": "Annoncé le 12 décembre 2025, calendrier non publié",
"statut": "a_verifier",
"lien": "https://fr.hespress.com/453855-maroc-digital-2030-13-mmdh-pour-developper-lecosysteme-startup-marocain.html",
"source": "https://fr.hespress.com/453855-maroc-digital-2030-13-mmdh-pour-developper-lecosysteme-startup-marocain.html",
"verifie_le": "2026-10-20",
"note": "Aucun nom de fonds ni procédure officielle trouvés à ce jour.",
"crit": []
},
{
"id": "forsa",
"nom": "Forsa",
"organisme": "Ministère du Tourisme, de l'Artisanat et de l'Économie sociale et solidaire",
"type": "pret_honneur",
"pour": [
"porteur",
"auto-entrepreneur",
"jeune"
],
"montant": "Lors des éditions 2022 et 2023 : prêt d'honneur à 0 % jusqu'à 100 000 DH, dont 10 000 DH de subvention",
"conditions": [
"Porteur de projet de 18 ans et plus",
"Candidature, incubation puis sélection en commission",
"Remboursement sur 10 ans au plus avec 2 ans de différé"
],
"calendrier": "Aucune nouvelle édition annoncée depuis 2023",
"statut": "a_verifier",
"lien": "https://forsa.ma",
"source": "https://www.leconomiste.com/report-du-remboursement-des-prets-forsa-deja-4-000-demandes/",
"verifie_le": "2026-10-20",
"note": "En 2026, la seule actualité concerne le report des remboursements. Aucun appel à candidatures 2024, 2025 ou 2026 n'a été trouvé.",
"crit": []
},
{
"id": "indh-jeunes",
"nom": "INDH Programme 3 : amélioration du revenu et inclusion économique des jeunes",
"organisme": "INDH (comités provinciaux et préfectoraux)",
"type": "subvention",
"pour": [
"jeune"
],
"montant": "Jusqu'à 100 000 DH par projet, dans la limite de 90 % du coût",
"conditions": [
"Âge de 18 à 45 ans (certaines provinces fixent 18 à 35 ans)",
"Sans emploi salarié, sans aide publique antérieure et sans entreprise de plus de 12 mois",
"Apport personnel d'environ 10 %",
"Formation et accompagnement avant et après la création"
],
"calendrier": "Appels à projets provinciaux, par exemple du 3 au 24 avril 2026 à Oujda-Angad",
"statut": "recurrent",
"lien": "https://www.indh.ma",
"source": "https://fr.hespress.com/468414-468414.html",
"verifie_le": "2026-10-20",
"note": "Les dates et critères varient selon la province. Renseigne-toi auprès de la division de l'action sociale ou de la plateforme des jeunes de ta province.",
"crit": [
[
"toggle",
"jeune"
],
[
"inv_max",
111000
],
[
"apport_min",
0.1
]
]
},
{
"id": "indh-cooperatives",
"nom": "INDH : soutien aux coopératives et à l'économie sociale et solidaire",
"organisme": "INDH (comités provinciaux et préfectoraux)",
"type": "subvention",
"pour": [
"cooperative"
],
"montant": "Jusqu'à 200 000 DH par projet, dans la limite de 90 % du coût",
"conditions": [
"Coopérative ou fédération active portant une activité génératrice de revenus",
"Apport de la coopérative d'au moins 10 %",
"Priorité aux coopératives de plus de 50 % de femmes ou incluant des jeunes"
],
"calendrier": "Appels à projets provinciaux, souvent au printemps",
"statut": "recurrent",
"lien": "https://www.indh.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"crit": [
[
"apport_min",
0.1
]
]
},
{
"id": "odco-cooperatives",
"nom": "Accompagnement des coopératives (ODCo)",
"organisme": "Office du Développement de la Coopération (ODCo)",
"type": "accompagnement",
"pour": [
"cooperative"
],
"montant": "Pas de financement direct publié",
"conditions": [
"Coopérative inscrite au registre central",
"Outils annoncés : Sijil Coop, Taawounya Academy, marketplace des coopératives"
],
"calendrier": "Feuille de route 2026-2028 en cours de déploiement",
"statut": "a_verifier",
"lien": "https://www.odco.gov.ma",
"source": "https://fr.hespress.com/480028-480028.html",
"verifie_le": "2026-10-20",
"note": "Pour un financement, les coopératives passent plutôt par l'INDH.",
"crit": []
},
{
"id": "tahfiz",
"nom": "Tahfiz",
"organisme": "ANAPEC",
"type": "emploi",
"pour": [
"tpe",
"startup",
"cooperative",
"pme"
],
"montant": "Exonération d'IR sur les salaires bruts jusqu'à 10 000 DH par mois, avec charges patronales CNSS et taxe de formation prises en charge par l'État",
"conditions": [
"Entreprise, association ou coopérative créée entre le 1er janvier 2015 et le 31 décembre 2026 et affiliée à la CNSS",
"Jusqu'à 10 salariés recrutés en CDI",
"Recrutements dans les 24 mois suivant le début d'activité"
],
"calendrier": "Pour les entreprises créées au plus tard le 31 décembre 2026",
"statut": "ouvert",
"lien": "https://www.anapec.org",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Si tu crées ta société en 2027, vérifie si le dispositif a été prolongé ou remplacé par la nouvelle prime à l'embauche annoncée.",
"crit": [
[
"cree_avant",
"2026-12-31"
]
]
},
{
"id": "idmaj",
"nom": "Idmaj (contrat d'insertion)",
"organisme": "ANAPEC",
"type": "emploi",
"pour": [
"tpe",
"pme",
"startup",
"cooperative"
],
"montant": "Exonération de charges sociales et d'IR pendant le contrat, puis 12 mois de charges sociales prises en charge en cas de CDI",
"conditions": [
"Recrutement de jeunes demandeurs d'emploi inscrits à l'ANAPEC",
"AMO prise en charge pendant le contrat",
"CDI : charges couvertes pour un salaire jusqu'à 6 000 DH et exonération d'IR prolongée de 24 mois jusqu'à 10 000 DH"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.anapec.org",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"crit": []
},
{
"id": "reseau-entreprendre",
"nom": "Prêt d'honneur Réseau Entreprendre Maroc",
"organisme": "Réseau Entreprendre Maroc",
"type": "pret_honneur",
"pour": [
"porteur",
"tpe",
"pme",
"startup"
],
"montant": "Prêt d'honneur sans intérêt, montant individuel non publié",
"conditions": [
"Projet de création ou de reprise à fort potentiel d'emplois",
"Sélection par un comité de chefs d'entreprise",
"Accompagnement par un chef d'entreprise bénévole"
],
"calendrier": "Comités d'engagement réguliers tout au long de l'année",
"statut": "recurrent",
"lien": "https://www.reseau-entreprendre.org/maroc/",
"source": "https://telquel.ma/instant-t/2026/01/30/le-reseau-entreprendre-maroc-fetera-ses-20-ans-le-6-fevrier-a-marrakech_1973271/",
"verifie_le": "2026-10-20",
"note": "Plus de 44 MDH octroyés à 450 lauréats depuis 2005.",
"crit": []
},
{
"id": "dar-al-moukawil",
"nom": "Dar Al Moukawil",
"organisme": "Attijariwafa bank",
"type": "accompagnement",
"pour": [
"porteur",
"auto-entrepreneur",
"tpe"
],
"montant": "Gratuit (formation, conseil et mise en réseau)",
"conditions": [
"Ouvert aux clients et non-clients de la banque",
"Porteurs de projet, commerçants, artisans, auto-entrepreneurs et TPE",
"25 centres au Maroc depuis novembre 2025"
],
"calendrier": "Ouvert toute l'année",
"statut": "ouvert",
"lien": "https://www.attijariwafabank.com",
"source": "https://www.attijariwafabank.com/sites/default/files/publication/2025-11/CP%20VF%20-%20Inauguration%20DAM%20Dakhla%20VRevue%201611.pdf",
"verifie_le": "2026-10-20",
"crit": []
},
{
"id": "al-moukawil-chaabi",
"nom": "Centres Al Moukawil Chaabi",
"organisme": "Groupe Banque Populaire",
"type": "accompagnement",
"pour": [
"porteur",
"auto-entrepreneur",
"tpe"
],
"montant": "Conseil, accompagnement non financier et accès au financement",
"conditions": [
"Destiné aux TPE et aux porteurs de projet",
"Accompagnement avant, pendant et après le financement"
],
"calendrier": "Premiers centres ouverts le 30 janvier 2026 à Marrakech et Tanger, 23 prévus d'ici 2027",
"statut": "ouvert",
"lien": "https://www.gbp.ma",
"source": "https://lematin.ma/economie/la-banque-populaire-ouvre-ses-premiers-centres-al-moukawil-chaabi/327197/amp",
"verifie_le": "2026-10-20",
"note": "Disponible pour l'instant dans les villes déjà équipées.",
"crit": []
},
{
"id": "boost-up-lab",
"nom": "Boost Up Lab (Technopark)",
"organisme": "Technopark, financé par le Ministère de la Transition numérique",
"type": "accompagnement",
"pour": [
"startup"
],
"montant": "Pré-incubation gratuite de 6 à 12 mois",
"conditions": [
"Projet innovant basé au Maroc",
"Entreprise de 5 ans au plus",
"Cohortes de 25 à 30 startups par région"
],
"calendrier": "Cohorte Casablanca lancée en septembre 2026, candidatures annoncées jusqu'au 30 novembre 2026",
"statut": "ouvert",
"lien": "https://www.technopark.ma",
"source": "https://menastartupdigest.com/?p=47814",
"verifie_le": "2026-10-20",
"note": "Source non officielle. Confirme les dates de ta région auprès de Technopark.",
"crit": []
},
{
"id": "ignite-morocco",
"nom": "Ignite Morocco",
"organisme": "Flat6Labs (opérateur du Startup Venture Building)",
"type": "accompagnement",
"pour": [
"startup"
],
"montant": "Programme gratuit de 6 à 18 mois, avec accès aux instruments du Startup Venture Building",
"conditions": [
"Société de droit marocain de 8 ans au plus",
"Startup numérique innovante ayant dépassé le POC, au stade prototype ou MVP",
"Secteurs ciblés : AgriTech, HealthTech, CleanTech, EdTech, Fintech, cybersécurité, industrie"
],
"calendrier": "Appels par cohorte, dates non publiées",
"statut": "a_verifier",
"lien": "https://flat6labs.com/program/ignite-morocco/",
"source": "https://flat6labs.com/program/ignite-morocco/",
"verifie_le": "2026-10-20",
"crit": []
},
{
"id": "orange-corners",
"nom": "Orange Corners Maroc",
"organisme": "Orange Corners (Ambassade des Pays-Bas) et partenaires",
"type": "accompagnement",
"pour": [
"jeune"
],
"montant": "Incubation et accélération gratuites",
"conditions": [
"Jeunes entrepreneurs",
"Cohortes thématiques, par exemple eau et assainissement en 2025"
],
"calendrier": "Dernière cohorte sélectionnée en décembre 2025, prochain appel non annoncé",
"statut": "a_verifier",
"lien": "https://www.orangecorners.com",
"source": "https://menastartupdigest.com/?p=24991",
"verifie_le": "2026-10-20",
"note": "Source non officielle. Aucun appel 2026 confirmé.",
"crit": []
},
{
"id": "um6p-launch-space",
"nom": "Launch Space (UM6P StartGate à Station F)",
"organisme": "UM6P et StartGate",
"type": "accompagnement",
"pour": [
"startup"
],
"montant": "Poste de travail à Station F pendant 3 mois renouvelables une fois, sans financement direct",
"conditions": [
"Projet tourné vers l'Afrique, de l'idéation à l'accélération",
"Secteurs : agriculture, eau, énergie, industrie, santé, éducation, numérique et IA"
],
"calendrier": "Édition 2026 ouverte du 7 septembre au 18 octobre 2026",
"statut": "ferme",
"lien": "https://startgate.ma",
"source": "https://menastartupdigest.com/?p=51153",
"verifie_le": "2026-10-20",
"note": "La fenêtre 2026 est close. Surveille l'édition 2027.",
"crit": []
},
{
"id": "go-siyaha",
"nom": "Go Siyaha",
"organisme": "Agence Maroc PME et Ministère du Tourisme",
"type": "prime_investissement",
"pour": [
"tpe",
"pme",
"porteur"
],
"montant": "Primes de 30 à 40 % pour les projets touristiques de moins de 10 MDH, assistance technique jusqu'à 90 %",
"conditions": [
"Projet d'animation touristique ou d'hébergement lié à l'animation",
"Investissement total inférieur à 10 MDH TTC"
],
"calendrier": "Feuille de route tourisme 2023-2026, prolongation après 2026 non confirmée",
"statut": "a_verifier",
"lien": "https://marocpme.gov.ma",
"source": "https://casainvest.ma/sites/default/files/Kit_ccompagnement_Entreprise_aout_2026.pdf",
"verifie_le": "2026-10-20",
"note": "Réservé aux projets touristiques.",
"crit": [
[
"secteur",
"tourisme"
],
[
"inv_max",
10000000.0
]
]
},
{
"id": "generation-green-jeunes",
"nom": "Entrepreneuriat agricole des jeunes (Génération Green)",
"organisme": "Ministère de l'Agriculture et Fonds de développement agricole",
"type": "subvention",
"pour": [
"jeune",
"agriculture"
],
"montant": "Subvention de 2 000 à 7 000 DH par hectare sur terres collectives, et prise en charge de 70 % du loyer pendant 3 à 5 ans",
"conditions": [
"Jeune porteur de projet agricole",
"Inscription sur la plateforme ChababAgri ou auprès d'un centre régional d'entrepreneuriat agricole",
"Validation par la commission régionale"
],
"calendrier": "Ouvert toute l'année",
"statut": "recurrent",
"lien": "https://www.agriculture.gov.ma",
"source": "https://medias24.com/2025/08/08/pres-de-12-000-jeunes-deja-accompagnes-dans-des-projets-agricoles/",
"verifie_le": "2026-10-20",
"note": "Les aides du FDA complètent ces montants selon la filière. Consulte la direction régionale de l'agriculture.",
"crit": [
[
"toggle",
"jeune"
],
[
"secteur",
"agriculture"
]
]
},
{
"id": "crowdfunding",
"nom": "Financement collaboratif (loi 15-18)",
"organisme": "Plateformes agréées par Bank Al-Maghrib (don, prêt) et l'AMMC (investissement)",
"type": "capital",
"pour": [
"porteur",
"startup",
"tpe",
"pme",
"cooperative"
],
"montant": "Par projet : 450 000 DH en don, 3 MDH en prêt, 5 MDH en investissement",
"conditions": [
"Campagne lancée via une plateforme agréée",
"Contribution maximale par particulier : 250 000 DH en don, 300 000 DH en prêt, 500 000 DH en investissement",
"Plafond global de 1 MDH par contributeur, hors investisseurs providentiels"
],
"calendrier": "Ouvert toute l'année, premiers agréments délivrés en 2025",
"statut": "ouvert",
"lien": "https://www.ammc.ma/fr/crowdfunding/faq",
"source": "https://www.ammc.ma/fr/crowdfunding/faq",
"verifie_le": "2026-10-20",
"note": "Consulte la liste officielle des plateformes agréées sur les sites de l'AMMC et de Bank Al-Maghrib avant de choisir.",
"crit": []
}
] };
