# Onboarding Developpeur

Guide rapide pour lancer le projet localement, comprendre le flux auth/session, et depanner les erreurs de demarrage.

## 1. Prerequis

- Node.js `>= 20`
- npm `>= 10`
- Acces au backend interne (URL `INTERNAL_API_URL`)

Verification rapide:

```bash
node -v
npm -v
```

## 2. Installation

Depuis le dossier `studio_app`:

```bash
npm install
```

## 3. Configuration `.env.local`

Creer un fichier `.env.local` a la racine avec au minimum:

```env
INTERNAL_API_URL=http://localhost:8000
INTERNAL_OAUTH_CLIENT_ID=your-client-id
INTERNAL_OAUTH_CLIENT_SECRET=your-client-secret

SESSION_COOKIE_NAME=session_id
SESSION_TTL_SECONDS=604800
USE_REDIS_SESSIONS=false
```

Si `USE_REDIS_SESSIONS=true`, ajouter:

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## 4. Lancement local

```bash
npm run dev
```

Application disponible sur `http://localhost:3000`.

## 5. Verifications fonctionnelles minimales

1. Ouvrir la page login.
2. Se connecter avec un compte de test.
3. Verifier l'acces a:
- `/dashboard`
- `/studios`
- `/dashboard/config`
4. Se deconnecter et verifier le retour a la page publique.

## 6. Architecture rapide a connaitre

- Frontend React/Next: `app/**`
- BFF API Next: `app/api/**`
- Session/cookie: `lib/session.ts`
- Guard auth partage: `lib/authorized-session.ts`
- Refresh token partage: `lib/session-refresh.ts`
- Template route API: `.route-template.ts`

Flux simplifie:

1. Client appelle `app/api/*`
2. BFF verifie session + cookie
3. BFF rafraichit le token si necessaire
4. BFF appelle `INTERNAL_API_URL`

## 7. Depannage: `npm run dev` echoue (Exit Code 1)

### 7.1 Erreurs de dependances

Symptomes:
- `Cannot find module ...`
- erreurs TypeScript massives apres pull

Actions:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

Sous PowerShell (Windows):

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

### 7.2 Variables d'environnement manquantes

Symptomes:
- `Missing INTERNAL_API_URL`
- `Missing OAuth client configuration`

Actions:

1. Verifier `.env.local` et la presence de `INTERNAL_OAUTH_CLIENT_ID` et `INTERNAL_OAUTH_CLIENT_SECRET`.
2. Relancer `npm run dev` apres mise a jour.

### 7.3 Backend interne indisponible

Symptomes:
- timeouts API
- erreurs `500` cote BFF sur login/signup

Actions:

1. Verifier que `INTERNAL_API_URL` est joignable.
2. Tester l'endpoint backend avec curl/postman.
3. Relancer le backend si necessaire.

### 7.4 Probleme Redis (si active)

Symptomes:
- erreurs sur `KV_REST_API_URL`/`KV_REST_API_TOKEN`
- sessions qui disparaissent

Actions:

1. Passer temporairement `USE_REDIS_SESSIONS=false`.
2. Verifier les credentials Upstash.

### 7.5 Build/lint pour isoler le probleme

```bash
npm run lint
npm run build
```

Si `build` passe mais `dev` casse, verifier les fichiers modifies recemment et les imports dynamiques.

## 8. Workflow recommande pour une nouvelle route API

1. Copier `.route-template.ts` vers `app/api/<feature>/route.ts`.
2. Adapter `path` backend et messages d'erreur.
3. Conserver le pattern `proxyToBackend(...)` du template (auth/session/refresh centralises).
4. Tester le statut HTTP en cas `200`, `401`, `500`.

## 9. Bonnes pratiques d'equipe

- Ne pas invalider la session sur erreurs non-auth (`!= 401`) sans justification.
- Garder les appels BFF en `cache: "no-store"` pour les donnees sensibles.
- Ajouter des logs techniques utiles cote serveur, sans exposer de secrets.
