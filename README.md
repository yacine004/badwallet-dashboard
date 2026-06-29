# BadWallet Dashboard

Dashboard Angular pour BadWallet, un service de wallet mobile (XOF). Deux espaces :

- **Client** — connexion par numéro de téléphone, consultation du solde, historique des transactions, transfert d'argent, paiement de factures.
- **Agent** — liste paginée des portefeuilles, création de portefeuille, recherche d'un wallet avec opérations de dépôt/retrait.

## Stack

- Angular 21 (standalone components, signals, SSR)
- RxJS / HttpClient (`withFetch`)
- Pas de framework CSS : design system maison (`src/styles.css`) + styles par composant

## Démarrage

```bash
npm install
npm start          # ng serve --proxy-config proxy.conf.json (proxie /api vers http://localhost:8080)
```

```bash
npm run build       # build de production (dist/badwallet-dashboard)
npm test            # tests unitaires (Vitest)
```

L'API backend est attendue sur `http://localhost:8080` (voir `proxy.conf.json`).

## Structure

```
src/app/
  core/
    guards/auth.guard.ts        Protège les routes nécessitant un wallet connecté
    interceptors/error.interceptor.ts   Toast automatique sur toute erreur HTTP
    services/                   WalletApiService, BillingApiService, ToastService
    store/balance.store.ts      Etat partagé (signals) : phone, solde, transactions, factures, wallets
  shared/pipes/xof.pipe.ts      Formatage des montants en XOF
  features/
    client/dashboard            Connexion + vue d'ensemble du solde
    client/transactions         Historique filtrable
    client/transfer             Transfert entre wallets
    client/bills                Shell avec sous-routes /bills/current et /bills/history
    agent/wallet-list           Liste paginée des portefeuilles
    agent/wallet-create         Création de portefeuille
    agent/wallet-search         Recherche + dépôt/retrait
```

## Routes

| Route | Accès | Description |
|---|---|---|
| `/dashboard` | public | Connexion par téléphone + solde |
| `/transactions` | connecté | Historique des transactions |
| `/transfer` | connecté | Transfert d'argent |
| `/bills/current` | connecté | Factures en cours + paiement groupé |
| `/bills/history` | connecté | Factures déjà payées (lecture seule) |
| `/admin/wallets` | public | Liste des portefeuilles (vue agent) |
| `/admin/create` | public | Création de portefeuille |
| `/admin/search` | public | Recherche & opérations agent |

Les routes "connecté" sont protégées par `authGuard`, qui redirige vers `/dashboard` si aucun numéro n'est enregistré dans la session.

Voir [RAPPORT_TECHNIQUE.md](RAPPORT_TECHNIQUE.md) pour le détail des choix d'architecture (guards, interceptors, notifications, design system).
