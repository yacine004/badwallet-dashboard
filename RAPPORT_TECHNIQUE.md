# Rapport technique — BadWallet Dashboard

## 1. Contexte

Application Angular 21 (standalone, signals, SSR) pour la gestion d'un wallet mobile en XOF, avec deux profils d'usage : **client** (solde, transactions, transfert, factures) et **agent** (gestion des portefeuilles).

## 2. Architecture

- **Routing** : routes "lazy" (`loadComponent`) déclarées dans `app.routes.ts`. Les factures utilisent des sous-routes (`/bills/current`, `/bills/history`) sous un composant parent (`BillsComponent`) qui porte les onglets et le `<router-outlet>`.
- **State** : `BalanceStore` (signal-based, `providedIn: 'root'`) centralise le numéro connecté, le solde, les transactions, les factures et la liste des wallets. Persisté en `sessionStorage` côté navigateur.
- **Services HTTP** : `WalletApiService` et `BillingApiService` encapsulent les appels REST (`/api/wallets`, `/api/external/factures`) via `HttpClient` (`withFetch`).

## 3. Guards

`core/guards/auth.guard.ts` — `CanActivateFn` fonctionnel appliqué sur `/transactions`, `/transfer` et `/bills` (donc ses sous-routes). Il vérifie `BalanceStore.phone()` : si aucun numéro n'est connecté, il redirige vers `/dashboard` et bloque l'activation. Cela remplace les anciens messages d'avertissement affichés dans chaque composant ("Veuillez vous connecter"), désormais inutiles puisque la route est inaccessible sans session active.

## 4. Interceptor

`core/interceptors/error.interceptor.ts` — `HttpInterceptorFn` global, branché dans `app.config.ts` via `provideHttpClient(withFetch(), withInterceptors([errorInterceptor]))`. Il intercepte toute réponse HTTP en erreur, extrait un message lisible (`error.error` si string, sinon `error.error.message`, sinon message générique) et déclenche un toast d'erreur. Les composants n'ont donc plus besoin de dupliquer leur propre gestion d'erreur HTTP — ils ne gèrent que leurs cas locaux (ex. validation `samePhoneError` dans le transfert, qui n'est pas une erreur serveur).

## 5. Notifications (Toasts)

`core/services/toast.service.ts` expose un signal `toasts` (liste de `{ id, type, message }`) avec `success/error/info/warning()` et auto-dismiss après 4s. Le rendu se fait dans `App` (`app.ts`), en haut à droite de l'écran, indépendamment de la route affichée. Utilisé pour :

- confirmation de connexion, transfert, dépôt, retrait, création de wallet, paiement de factures (succès explicites par les composants),
- toute erreur HTTP (automatique via l'interceptor).

Les messages de succès/erreur ponctuels qui étaient affichés en dur dans les templates ont été retirés au profit des toasts ; seules les informations structurelles (erreurs de validation de formulaire, détail JSON du wallet créé) restent affichées en ligne.

## 6. Design system

Pas de framework CSS externe. `src/styles.css` définit les tokens (couleurs, rayons, ombres, typographie Inter) et les classes utilitaires partagées (`.card`, `.btn`, `.input`, `.badge`, `.alert`, `.table-card`/`.data-table`, `.empty-state`, `.spinner`, `.pagination`). Chaque composant garde un style scoped minimal (mise en page spécifique), réutilisant les classes globales pour la cohérence visuelle. Layout général : sidebar fixe regroupant les sections Client/Agent, top bar avec solde du wallet connecté.

## 7. Sous-routage des factures

- `/bills/current` (`BillsCurrentComponent`) : factures du mois en cours, sélection multiple et paiement groupé (`payFactures`).
- `/bills/history` (`BillsHistoryComponent`) : lecture seule des factures déjà payées (filtrées côté client depuis le même flux `BalanceStore.factures()`), sans action de paiement.

## 8. Difficultés rencontrées

- **Blocage du serveur (dev et SSR) par boucle infinie de signal** : dans `BalanceStore`, un `effect()` lisait `walletsMeta()` puis lui réappliquait un `.set(...)` dans le même callback, créant une dépendance circulaire — chaque écriture redéclenchait l'effet, qui réécrivait à nouveau, indéfiniment. Comme `BalanceStore` est instancié à chaque rendu SSR, `ng serve` et `ng build` se figeaient totalement (process actif mais aucune réponse HTTP, plusieurs builds restés bloqués en arrière-plan). Corrigé en isolant les lectures/écritures dans `untracked()` pour casser la circularité.
- **Portefeuilles vides côté agent** : `BalanceStore.loadWallets()` n'appelait l'API que si un `phone()` client était défini. Or la page agent (`/admin/wallets`) ne passe jamais par l'authentification client par numéro — la liste restait donc vide en permanence, malgré un backend fonctionnel. Ce garde-fou, pertinent pour des méthodes scoped-client (`loadTransactions`, `loadFactures`), n'avait pas lieu d'être sur une ressource globale comme la liste des wallets ; il a été retiré.
- **Pagination instable** : `WalletListComponent` déclenchait deux chargements concurrents au montage (un `effect()` sur `phone()` + un appel direct dans `ngOnInit`), sans annulation des requêtes en vol. Une réponse "page 0" arrivée en retard pouvait écraser le résultat d'un clic "page suivante". Simplifié vers un seul point de déclenchement (`loadWallets()`) et un seul effet de synchronisation store → vue.
- **Ordre de pagination non déterministe (backend)** : `WalletService.getAllWallets` construisait un `PageRequest.of(page, size)` sans `Sort`, donc sans `ORDER BY` côté SQL — l'ordre des lignes, et donc la continuité entre pages, n'était pas garanti. Ajout de `Sort.by("id").ascending()`.
- **Dépendance à un service externe non démarré** : plusieurs symptômes (connexion impossible, listes vides) provenaient simplement du backend Spring Boot (`badwallet-api`, port 8080) non démarré pendant les tests du frontend — point à vérifier systématiquement avant de chercher un bug côté Angular.

## 9. Limites connues / pistes

- L'espace agent (`/admin/*`) n'a pas de garde dédiée : il n'existe pas de notion d'authentification agent distincte de la session client dans le backend actuel.
- `/bills/history` filtre les factures déjà chargées par `/current` plutôt que d'interroger un endpoint dédié à l'historique sur une période — à raccorder à `getFacturesByPeriode` si un vrai historique multi-mois est nécessaire.
