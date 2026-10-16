# PlanBiz

Application web de business plan sur 3 ans pour les startups, TPME et coopératives au Maroc.
Chaque utilisateur crée son compte et gère autant de business qu'il veut. Pour chaque business, PlanBiz calcule le compte de produits et charges (CGNC), la trésorerie sur 36 mois, le bilan, les indicateurs investisseurs et les 3 scénarios, puis rédige le document de business plan.

Modèle de calcul : Business Plan V4.1 (fiscalité, TVA, CNSS/AMO et IR selon les règles marocaines 2026).

## Architecture

| Élément | Rôle |
|---|---|
| `index.html`, `css/`, `js/` | Application (HTML/JS sans étape de build) |
| `js/engine.js` | Moteur de calcul financier |
| `js/platform.js` | Comptes, espace « Mes business », sauvegarde automatique, IA, exports |
| `api/ai.js` | Fonction serveur Vercel qui appelle l'API Claude (clé jamais exposée au navigateur) |
| `supabase/schema.sql` | Tables `businesses` et `ai_usage` avec règles de sécurité par utilisateur |

Base de données et connexion : projet Supabase **PlanBiz** (région Paris), déjà configuré. Les clés publiques sont dans `js/config.js`.

## Déployer sur Vercel

1. Sur vercel.com : **Add New → Project**, importe le dépôt GitHub `planbiz`.
2. Framework preset : **Other**. Laisse Build Command et Output Directory vides.
3. Dans **Environment Variables**, ajoute :
   - `ANTHROPIC_API_KEY` : ta clé API (console.anthropic.com). Obligatoire pour l'assistant IA.
   - `AI_DAILY_LIMIT` (optionnel) : demandes IA par utilisateur et par jour, 30 par défaut.
   - `ANTHROPIC_MODEL` (optionnel) : `claude-sonnet-5-5` par défaut.
4. **Deploy**. Note l'adresse obtenue, par exemple `https://planbiz.vercel.app`.

## Régler la connexion dans Supabase (une seule fois)

Dans le tableau de bord Supabase, projet PlanBiz → **Authentication → URL Configuration** :
- **Site URL** : l'adresse Vercel (ex. `https://planbiz.vercel.app`).
- **Redirect URLs** : ajoute `https://planbiz.vercel.app/**` et `https://*-<ton-compte>.vercel.app/**` pour les aperçus.

Confirmation des e-mails (**Authentication → Sign In / Providers → Email**) :
- Par défaut, chaque nouvel utilisateur doit cliquer un lien reçu par e-mail. Le service e-mail intégré de Supabase est limité à quelques e-mails par heure : pour un usage réel (incubateur, cohortes), branche un SMTP (Brevo, Resend, Mailjet…) dans **Authentication → Emails → SMTP Settings**.
- Pour un atelier ou une démo, tu peux désactiver « Confirm email » : les comptes sont alors actifs immédiatement.

## Coûts et limites

- Supabase et Vercel : offres gratuites suffisantes pour démarrer (Supabase gratuit : 500 Mo de base, projets mis en pause après 7 jours sans activité).
- IA : facturée sur ton compte Anthropic. Le quota `AI_DAILY_LIMIT` limite les abus ; fixe aussi une limite de dépense dans la console Anthropic.
- La génération complète d'un BP par l'IA peut prendre 1 à 3 minutes : `vercel.json` autorise 300 s pour `api/ai.js`.

## Développement local

```bash
npm i -g vercel
vercel dev
```
Sans configuration Supabase (`js/config.js` vide), l'application passe en mode local : les business sont enregistrés dans le navigateur.
