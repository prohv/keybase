# KeyBase

A self-hosted team API key vault built with Next.js, Drizzle ORM, and PostgreSQL. Store, encrypt, and share API credentials across teams and projects without exposing raw secrets.

---

## Quick Start

### 1. Prerequisites
* [Bun](https://bun.sh) (v1.2+) or Node.js (v20+)
* PostgreSQL instance

### 2. Setup & Install

```bash
git clone https://github.com/prohv/keybase.git
cd keybase
bun install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/keybase
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_base64_key

# Optional (for Google OAuth)
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> **Generate a secure 32-byte encryption key:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```

### 4. Database Sync & Run

```bash
# Push schema to database
bunx drizzle-kit push

# Start local dev server
bun dev
```

The app will be running at [http://localhost:3000](http://localhost:3000). Interactive Swagger docs are available at [/api/docs](http://localhost:3000/api/docs).

---

## Core Features

* **AES-256-GCM Encryption**: Keys are encrypted with a dedicated Initialization Vector (IV) and authentication tag (AEAD) before database persistence, preventing data tampering. Plaintext keys are never stored on disk.
* **Team & Project Scoping**: Multi-tenant workspace model. Teams use 8-character hex codes for member invites, and keys are isolated within project vaults.
* **CLI & CI/CD Access Tokens**: Generate scoped `kb_...` Bearer tokens with configurable expiration for automated pipelines. Stored as SHA-256 hashes.
* **Single-Click `.env` Export**: Export all project keys directly into a `.env` file.
* **Provider Auto-Detection**: Recognizes standard secret patterns (OpenAI, AWS, Anthropic, GCP, etc.) to display provider badges.
* **Dual Auth Modes**: Email/password authentication or Google OAuth with unified session management (httpOnly cookies for web, Bearer tokens for API/CLI).

---

## Codebase Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                              │
│   Web Browser (Dashboard / React UI)          CLI / CI-CD Pipelines    │
└──────────────────┬─────────────────────────────────────┬───────────────┘
                   │ Server Actions                      │ HTTP (Bearer)
                   ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ADAPTER LAYER (app/)                            │
│   Web Actions (app/**/action.ts)              REST API (app/api/**)    │
└──────────────────┬─────────────────────────────────────┬───────────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DOMAIN CORE (features/)                        │
│   1. Guards & Auth       → verify session / JWT (features/auth)        │
│   2. Zod Validation      → parse incoming payloads (*/schemas.ts)      │
│   3. Security Policies   → enforce team/project access (*/policy.ts)   │
│   4. Domain Services     → execute business operations (*/service.ts)  │
└──────────────────┬─────────────────────────────────────┬───────────────┘
                   │                                     │
                   ▼                                     ▼
        ┌─────────────────────┐               ┌─────────────────────┐
        │   AES-256 Crypto    │               │     Drizzle ORM     │
        │  (lib/encryption)   │               │     (src/db/)       │
        └─────────────────────┘               └──────────┬──────────┘
                                                         ▼
                                              ┌─────────────────────┐
                                              │     PostgreSQL      │
                                              └─────────────────────┘
```

### Request Flow
1. **Entry**: Web forms call Server Actions (`action.ts`), while external clients/CLI call REST endpoints (`route.ts`).
2. **Authentication**: `requireCurrentUser()` (cookie sessions) or `requireJwtAuth()` (Bearer tokens) verifies the caller.
3. **Validation**: Payloads are validated against domain Zod schemas (`features/<domain>/schemas.ts`).
4. **Authorization**: Policies in `features/<domain>/policy.ts` (e.g., `assertProjectMember`) enforce workspace permissions.
5. **Domain Execution**: Feature services (`features/<domain>/service.ts`) perform queries, state mutations, and cryptography.
6. **Standardized Responses**: Responses/errors return via unified helpers (`handleActionError()` for Server Actions, `handleRouteError()` for API routes).

### How to Work with the Codebase (Developer Guide)
When adding or extending features, follow this workflow to maintain clean separation of concerns:
* **Step 1 - Database Schema**: Define tables, indexes, and cascades in `src/db/schema.ts`, then run `bunx drizzle-kit push`.
* **Step 2 - Validation Schemas**: Add Zod validation in `features/<domain>/schemas.ts`.
* **Step 3 - Business Logic (Service)**: Put all queries, mutations, and domain logic inside `features/<domain>/service.ts`. *Never query the database directly inside UI components or route handlers.*
* **Step 4 - Authorization Policies**: If the resource is scoped to a team or project, add an authorization check in `features/<domain>/policy.ts`.
* **Step 5 - Adapters**:
  * For internal UI: Create or update a Server Action (`app/<domain>/action.ts`) wrapped with `handleActionError()`.
  * For external / CLI APIs: Create a route handler (`app/api/<domain>/route.ts`) wrapped with `handleRouteError()`.
* **Step 6 - UI & State**: Place UI components under `features/<domain>/components/` and state logic in `features/<domain>/hooks/`. Keep page components thin.

For in-depth architecture patterns and guidelines, see [docs/architecture.md](docs/architecture.md).

---

## Useful Commands

| Task | Command |
|------|---------|
| Start development server | `bun dev` |
| Build for production | `bun run build` |
| Run test suite | `bun test` |
| Run ESLint | `bun run lint` |
| Push database schema | `bunx drizzle-kit push` |
| Generate migrations | `bunx drizzle-kit generate` |

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key used for signing JWTs | Yes |
| `ENCRYPTION_KEY` | Base64-encoded 32-byte key for AES-256-GCM | Yes |
| `OAUTH_CLIENT_ID` | Google OAuth Client ID | No (for OAuth) |
| `OAUTH_CLIENT_SECRET` | Google OAuth Client Secret | No (for OAuth) |
| `NEXT_PUBLIC_API_URL` | Canonical app URL (used in OAuth redirect URLs) | No |
