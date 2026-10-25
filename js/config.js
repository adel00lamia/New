/* Configuration publique de PlanBiz.
   La clé "publishable" Supabase est faite pour être visible côté navigateur :
   la sécurité des données repose sur les règles RLS de la table businesses. */
window.PLANBIZ_CONFIG = {
  supabaseUrl: 'https://jecydmxekdorycgfwtwy.supabase.co',
  supabaseKey: 'sb_publishable_a-ccau1Xus1RmybrNV6xBg_P59YAdfS',
  aiEndpoint: '/api/ai',
  // Paiements : laisse enabled à false tant que la SARL, le RIB et le contrat CMI ne sont pas prêts.
  payments: {
    enabled: false,          // true = les exports payants sont réservés aux offres Pass et Pro
    card: false,             // true quand CMI_CLIENT_ID, CMI_STORE_KEY et CMI_GATEWAY_URL sont réglés sur Vercel
    plans: {
      pass: { label: 'Pass Dossier', price: 49, unit: 'DH TTC, paiement unique (prix de lancement)', detail: '3 mois d\'accès complet à 1 projet' },
      pro: { label: 'PlanBiz Pro', price: 199, unit: 'DH TTC par an (prix de lancement)', detail: 'Projets illimités pendant 1 an, pour consultants, fiduciaires et coachs' }
    },
    bank: { titulaire: '', banque: '', rib: '' },   // coordonnées du compte de la SARL pour les virements
    contact: ''                                      // e-mail auquel le client envoie son justificatif de virement
  }
};
