# Studio App

Application web Next.js (App Router) avec BFF intégré pour l'authentification et le proxy vers une API interne (`INTERNAL_API_URL`).

## Stack Technique

- Runtime: `Node.js`
- Framework: `Next.js 16` (`app/` router)
- Langage: `TypeScript`
- UI: composants custom + `shadcn` + `radix-ui` + `lucide-react`
- i18n: `next-intl`
- Session store:
- `in-memory` en local par defaut
- `Upstash Redis` en mode partagé (optionnel)

## Architecture

Le frontend n'appelle pas directement le backend metier. Il passe par les routes Next.js sous `app/api/**`.

Flux global:

1. Client React -> `/api/*` (BFF Next.js)
2. BFF -> API interne (`INTERNAL_API_URL`) avec bearer token
3. BFF gere la session serveur + cookie `httpOnly`
4. Le token est rafraichi automatiquement si proche expiration

### Dossiers Principaux

- `app/`: pages App Router et routes API
- `app/api/`: endpoints BFF (auth, members, organization, studio, studios)
- `contexts/AuthContext.tsx`: etat d'auth cote client
- `lib/session.ts`: gestion session/cookie
- `lib/authorized-session.ts`: guard d'autorisation partagee
- `lib/session-refresh.ts`: refresh token partage
- `.route-template.ts`: template technique pour nouvelles routes BFF

## Authentification Et Session

### Cote serveur

- Session ID stocke en cookie `httpOnly` (`SESSION_COOKIE_NAME`, defaut: `session_id`)
- Session data stockee:
- en memoire si `USE_REDIS_SESSIONS !== "true"`
- dans Redis si `USE_REDIS_SESSIONS === "true"`

Type de session (simplifie):

```ts
type SessionData = {
	data: {
		access_token: string;
		refresh_token: string;
		expires_at: number;
		user: {
			id_user: number;
			id_profile: number;
			id_organization: number | null;
			id_studio: number | null;
			code_language: string | "en";
		};
	};
};
```

### Helpers partages

- `getAuthorizedSession()`
- lit le cookie de session
- recharge la session
- valide le contrat minimal utilisateur

- `ensureSessionFresh(session)`
- rafraichit le token si expiration proche

- `refreshSessionTokens(session)`
- execute `/refresh`
- met a jour session + cookie
- invalide session/cookie si refresh impossible

## Routes API BFF

Routes actuellement exposees:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/signup`
- `POST /api/auth/verify-email`
- `GET /api/member/all`
- `GET /api/member/me`
- `GET /api/organization`
- `GET /api/studio`
- `GET /api/studios`

## Variables D'environnement

Configurer un fichier `.env.local` a la racine.

Variables requises:

- `INTERNAL_API_URL`: base URL de l'API backend
- `INTERNAL_OAUTH_CLIENT_ID`: client ID OAuth pour login/signup
- `INTERNAL_OAUTH_CLIENT_SECRET`: secret OAuth pour login/signup

Variables session:

- `SESSION_COOKIE_NAME` (optionnel, defaut `session_id`)
- `SESSION_TTL_SECONDS` (optionnel, defaut `604800`)
- `USE_REDIS_SESSIONS` (`true` pour activer Redis)

Variables Redis (si `USE_REDIS_SESSIONS=true`):

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Exemple minimal:

```env
INTERNAL_API_URL=http://localhost:8000
INTERNAL_OAUTH_CLIENT_ID=your-client-id
INTERNAL_OAUTH_CLIENT_SECRET=your-client-secret

SESSION_COOKIE_NAME=session_id
SESSION_TTL_SECONDS=604800
USE_REDIS_SESSIONS=false
```

## Lancement

Installation:

```bash
npm install
```

Developpement:

```bash
npm run dev
```

Build production:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## Conventions Pour Ajouter Une Route

Utiliser `.route-template.ts` comme base.

Checklist recommandee:

1. Verifier la session avec `getAuthorizedSession()`.
2. Appeler `ensureSessionFresh(session)` avant l'appel backend.
3. En cas d'echec backend, tenter `refreshSessionTokens(session)` puis retry.
4. Ne pas invalider la session sur erreurs non-auth (hors `401`) sans raison.
5. Retourner des messages d'erreur explicites et un status HTTP coherent.

## Points D'attention

- Les routes BFF sont en `cache: "no-store"` pour eviter les artefacts de cache sur les donnees sensibles.
- Le cookie de session est `httpOnly` et `sameSite=lax`.
- En production, `secure=true` est applique automatiquement au cookie.
