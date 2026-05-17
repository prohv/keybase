# KeyBase: Secure Team API Vault

A high-performance, secure credential management platform designed for teams to store, encrypt, and share sensitive API keys through administrative access controls and unique join codes.

Built as a full-stack technical assignment focusing on security-first architecture, utilizing Next.js 16.1.6 (App Router), Drizzle ORM, and the Bun runtime.

---

## Features

* **AES-256 Encryption**: Each key is encrypted with a unique Initialization Vector before hitting our database. Keys are never stored or logged in plain text.
* **Project Organization**: Keys are organized into projects within teams. Each project has its own isolated vault.
* **Access Tokens**: Generate `kb_xxx` tokens scoped to a project — used by CLI and CI/CD pipelines for programmatic access. Read-only, time-bound.
* **Team Access Control**: Admins manage team creation and generate unique 8-character hex join codes. Users access shared vaults only after joining a valid team.
* **Google OAuth**: Sign in or sign up with Google — no password needed. Profile picture shown in dashboard for OAuth users.
* **.env Export**: One-click download of all project API keys as a `.env` file.
* **Provider Detection**: Automatic detection of API providers (OpenAI, Anthropic, Google Cloud, AWS, Azure, etc.) from key names.
* **Audit Logging**: Keep track of who created, revealed, and deleted keys. Complete visibility into your team's security posture.
* **Full CRUD Lifecycle**: Secure management for API keys including creation, listing, secure reveal, and permanent deletion.
* **API Documentation**: Full Swagger/OpenAPI documentation available at `/api/docs`. Type-safe validation with Zod end-to-end.

---

## Tech Stack

* **Framework**: Next.js 16.1.6 (App Router)
* **Runtime & Package Manager**: Bun
* **Database & ORM**: PostgreSQL + Drizzle ORM
* **UI & Styling**: Tailwind CSS v4 + shadcn/ui (new-york theme)
* **Fonts**: Cabinet Grotesk (headings) + General Sans (body) — local variable fonts
* **Design System**: Custom green-toned design system with CSS custom properties, organic minimalism with editorial structure
* **State Management**: @tanstack/react-query (30s stale time, infinite queries for pagination)
* **Security**: Node.js Crypto (AES-256-CBC), JWT (jsonwebtoken), bcryptjs
* **Validation**: Zod, React Hook Form
* **Documentation**: Swagger UI / OpenAPI 3.0

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Login Form  │  │ Dashboard   │  │ API Key Management UI   │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │               │
│         ▼                ▼                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Query Hooks (Client State)            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Server Actions │  │   REST API      │  │   Middleware    │
│  (Form submits) │  │  (Bearer auth)  │  │  (Auth check)   │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   lib/jwt.ts    │  ← Verify/Sign tokens
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  lib/encryption │  ← AES-256-CBC (32-byte key)
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Drizzle ORM   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

### Data Flow

1. **Authentication Flow (Email/Password)**: User submits credentials → Server Action validates → bcrypt compares → JWT signed → httpOnly cookie set → Session retrieved via `getSession()` on subsequent requests.

2. **Authentication Flow (Google OAuth)**: User clicks "Sign in with Google" → Redirected to Google consent → Google redirects to callback → Code exchanged for id_token → User upserted in DB (linked by `oauth_id` or merged by `email`) → JWT signed with `name` + `avatarUrl` → httpOnly cookie set → Redirected to `/dashboard`.

3. **Project Organization**: Team creator creates a team → user creates projects under the team → API keys are scoped to a project. Each project has its own vault and access tokens.

4. **API Key Creation**: User submits key name + value under a project → Server action encrypts with AES-256-CBC → Stores `encrypted_key` + `iv` + `project_id` in database → Key never stored in plaintext.

5. **Key Reveal**: Authorized user requests reveal → Server verifies team membership via project → Decrypts using stored IV → Returns plaintext once (not persisted in client state).

6. **Key Export (.env)**: User clicks Export button → Server action verifies membership → Fetches all keys for the project → Decrypts each → Returns name-value pairs → Browser downloads `.env` file via File System Access API.

7. **Access Token Flow**: User clicks "Generate Tokens" → Chooses name + expiry → Server generates `kb_<64hex>` token → SHA-256 hash stored in `session_tokens` → Raw token shown once → CLI uses Bearer `kb_xxx` to authenticate → Server hashes incoming token and validates against DB → Read-only access to project keys.

8. **Team Management**: Admin creates team → 8-char hex code generated (`crypto.randomBytes(4)`) → Users join via code → `team_members` junction table links users to teams.

---

## Database Schema

### Tables (Drizzle ORM)

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| email | text | UNIQUE, NOT NULL |
| password_hash | text | nullable (null for OAuth users) (bcrypt, 12 rounds) |
| oauth_id | text | UNIQUE, nullable (Google `sub`) |
| name | text | nullable (display name from OAuth) |
| avatar_url | text | nullable (profile picture from OAuth) |
| role | text | 'admin' \| 'user', default 'user' |
| created_at | timestamp | default now() |

#### `teams`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| name | text | NOT NULL |
| team_code | text | UNIQUE, NOT NULL (8-char uppercase hex) |
| created_by | integer | FK → users.id |
| created_at | timestamp | default now() |

#### `team_members` (Junction Table)
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| user_id | integer | FK → users.id |
| team_id | integer | FK → teams.id |
| joined_at | timestamp | default now() |

#### `api_keys`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| name | text | NOT NULL |
| encrypted_key | text | NOT NULL (AES-256-CBC encrypted) |
| iv | text | NOT NULL (base64 encoded, 16 bytes) |
| team_id | integer | FK → teams.id |
| project_id | integer | FK → projects.id, nullable (CASCADE delete) |
| created_by | integer | FK → users.id |
| created_at | timestamp | default now() |

#### `projects`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| name | text | NOT NULL |
| team_id | integer | NOT NULL, FK → teams.id (CASCADE delete) |
| created_by | integer | NOT NULL, FK → users.id |
| created_at | timestamp | default now() |

#### `session_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | serial | PRIMARY KEY |
| user_id | integer | NOT NULL, FK → users.id |
| project_id | integer | NOT NULL, FK → projects.id (CASCADE delete) |
| name | text | NOT NULL |
| token_hash | text | NOT NULL, UNIQUE (SHA-256 of `kb_xxx`) |
| scopes | text | DEFAULT 'read' |
| expires_at | timestamp | nullable |
| last_used_at | timestamp | nullable |
| created_at | timestamp | default now() |

---

## Project Structure

```text
keybase/
├── app/                      # Next.js App Router
│   ├── api/                  # REST API Endpoints
│   │   ├── auth/             # /api/auth/login, /api/auth/register
│   │   │   └── oauth/
│   │   │       └── google/   # /api/auth/oauth/google (redirect + callback)
│   │   ├── project/          # /api/project/{create,list,delete}
│   │   ├── token/            # /api/token/{create,list,revoke}
│   │   ├── team/             # /api/team/create, /api/team/join
│   │   ├── api-key/          # /api/api-key/{create,list,reveal,delete}
│   │   ├── docs/             # Swagger UI endpoint
│   │   └── openapi.json/     # OpenAPI specification
│   ├── auth/                 # Auth pages (login, register, logout)
│   ├── dashboard/            # Protected dashboard (project vault UI)
│   ├── team/                 # Team pages (create, join, delete action)
│   ├── api-key/              # Server actions for API keys (create, reveal, delete, export)
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Landing page
│   └── providers.tsx         # React Query provider
├── components/
│   ├── ui/                   # shadcn/ui + UserAvatar, AuthDivider, OAuthButton
│   ├── team/                 # TeamSidebar, CreateProjectForm, TokenManager, InviteButton
│   ├── api-key/              # ApiKeyForm, ApiKeyTable
│   └── landing/              # Header, HeroSection, Ticker, FeatureGrid, HowItWorks, CTASection
├── hooks/                    # React Query hooks
│   ├── use-api-keys.ts       # Infinite query + CRUD mutations + export mutation (project-scoped)
│   ├── use-auth.ts           # Login/register mutations
│   ├── use-team.ts           # Join team mutation
│   └── use-mobile.ts         # Mobile detection
├── lib/
│   ├── fonts.ts              # Cabinet Grotesk + General Sans local font config
│   ├── api/
│   │   └── fetch.ts          # Server-side fetch helpers (project-scoped)
│   ├── encryption.ts         # AES-256-CBC encrypt/decrypt
│   ├── jwt.ts                # JWT sign/verify, verifyAuth (JWT + session tokens), getSession
│   ├── oauth.ts              # Google OAuth helpers (auth URL, token exchange, id_token decode)
│   ├── providers.ts          # API provider detection (logos, names)
│   └── utils.ts              # cn() utility for class merging
├── src/db/
│   ├── schema.ts             # Drizzle schema definitions
│   └── index.ts              # Database connection
├── drizzle/
│   └── migrations/           # SQL migrations
├── public/
│   ├── fonts/
│   │   ├── CabinetGrotesk-Variable.woff2
│   │   └── GeneralSans-Variable.woff2
│   ├── hero-keys-1.png       # 3D rendered keys for hero section
│   ├── hero-keys-2.png
│   └── keybase-logo.svg
├── proxy.ts                  # Middleware (auth check - currently disabled)
├── drizzle.config.ts         # Drizzle ORM configuration
├── components.json           # shadcn/ui configuration
└── package.json              # Dependencies
```

---

## API Endpoints

All API routes use **Bearer token authentication** via `Authorization: Bearer <token>` header.

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/login` | POST | No | Login, returns JWT token |
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/oauth/google` | GET | No | Redirect to Google OAuth consent screen |
| `/api/auth/oauth/google/callback` | GET | No | Google OAuth callback → upsert user → JWT cookie |
| `/api/team/create` | POST | Yes | Create team, returns team code |
| `/api/team/join` | POST | Yes | Join team via code |
| `/api/project/create` | POST | Yes (JWT) | Create project under a team |
| `/api/project/list?teamId=X` | GET | Yes | List projects for a team |
| `/api/project/delete` | POST | Yes (JWT, creator) | Delete a project and its keys |
| `/api/token/create` | POST | Yes (JWT) | Create session token (`kb_xxx`) for a project |
| `/api/token/list?projectId=X` | GET | Yes | List tokens for a project |
| `/api/token/revoke` | POST | Yes (JWT) | Revoke a token |
| `/api/api-key/create` | POST | Yes (JWT) | Create encrypted API key (requires `projectId`) |
| `/api/api-key/list?projectId=X` | GET | Yes | List keys for a project (paginated) |
| `/api/api-key/reveal` | POST | Yes | Decrypt and reveal key |
| `/api/api-key/delete` | DELETE | Yes (JWT) | Delete key permanently |
| `/api/docs` | GET | No | Swagger UI documentation |
| `/api/openapi.json` | GET | No | OpenAPI 3.0 specification |

---

## Quick Start

### 1. Prerequisites

* Bun installed (`curl -fsSL https://bun.sh/install | bash`)
* PostgreSQL instance (Local or Docker)

### 2. Installation

```bash
git clone https://github.com/prohv/keybase.git
cd keybase
bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/keybase
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_byte_base64_key
```

*Note: To generate a secure encryption key, run:*
```bash
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Setup

```bash
bun drizzle:push      # Sync schema changes instantly
# OR
bun drizzle:generate  # Generate migration files
bun drizzle:migrate   # Apply migrations
```

### 5. Run Development Server

```bash
bun dev
```

The application will be available at http://localhost:3000.

API documentation available at http://localhost:3000/api/docs.

---

## Security Implementation

### Encryption Details

* **Algorithm**: AES-256-CBC
* **Key Length**: 32 bytes (derived from `ENCRYPTION_KEY` env var, base64 decoded)
* **IV**: 16 bytes, randomly generated per encryption (`crypto.randomBytes(16)`)
* **Storage**: Both `encrypted_key` and `iv` stored separately in database (base64 encoded)

### Security Features

1. **Zero-Knowledge Architecture**: Plaintext keys are only decrypted on the server during an authorized "Reveal" request and are never persisted in browser state or React Query cache.

2. **Team-Based Access Control**: Membership verification on every operation. Users can only access keys from teams they belong to.

3. **Project Isolation**: Keys are scoped to projects within teams. Operations filter by `project_id` — users can only access keys in projects under teams they belong to.

4. **Session Token Auth**: API tokens (`kb_xxx`) are stored as SHA-256 hashes in the database. Raw tokens are shown once and never logged. Tokens are read-only and can be time-bound with configurable expiry.

5. **Cookie & Bearer Auth**: The app supports both httpOnly cookies (browser) and Bearer tokens (CLI/API). The `verifyAuth()` function checks headers first, then falls back to cookies — enabling both browser and programmatic access through a single code path.

6. **Secure Cookie Handling**: JWT stored in httpOnly cookie with `secure` flag (production), `sameSite=lax`, 7-day expiry.

7. **Password Security**: bcryptjs with 12 salt rounds for password hashing.

8. **Input Validation**: All inputs validated with Zod schemas before processing.

9. **One-Time Reveal**: Keys displayed only when explicitly requested, encouraging immediate secure storage by users.

---

## State Management

### React Query Configuration

* **Stale Time**: 30 seconds
* **Retry**: 1 attempt
* **Refetch on Window Focus**: Disabled
* **Infinite Queries**: Used for paginated API key lists (4 keys per page)

### Key Hooks

| Hook | Purpose |
|------|---------|
| `useApiKeys(projectId)` | Infinite query for paginated keys scoped to a project |
| `useUserTeams()` | Fetch user's teams |
| `useCreateApiKeyMutation(projectId)` | Create key under a project |
| `useDeleteApiKeyMutation(projectId)` | Delete key (invalidates project query) |
| `useExportKeysMutation()` | Export all keys for a project as .env |
| `useLoginMutation()`, `useRegisterMutation()` | Auth mutations |
| `useJoinTeamMutation()` | Join team mutation |

---

## Server Actions

The app uses **Next.js Server Actions** for form submissions:

| Action | Location | Purpose |
|--------|----------|---------|
| `loginAction` | `app/auth/login/action.ts` | Form-based login |
| `registerAction` | `app/auth/register/action.ts` | Form-based registration |
| `logoutAction` | `app/auth/logout/action.ts` | Clear session cookie |
| `createApiKeyAction` | `app/api-key/create/action.ts` | Create encrypted key (requires `projectId`) |
| `revealApiKeyAction` | `app/api-key/reveal/action.ts` | Decrypt and reveal key |
| `deleteApiKeyAction` | `app/api-key/delete/action.ts` | Delete key permanently |
| `exportKeysAction` | `app/api-key/export/action.ts` | Bulk decrypt and return all keys for a project |
| `deleteTeamsAction` | `app/team/delete/action.ts` | Delete team with cascade (creator only) |
| `createTeamAction` | `app/team/create/action.ts` | Create team |
| `joinTeamAction` | `app/team/join/action.ts` | Join team via code |

---

## Useful Commands

| Command | Action |
|---------|--------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bunx shadcn@latest add` | Add new UI components |
| `bun drizzle:push` | Push schema changes to DB |
| `bun drizzle:generate` | Generate migration files |
| `bun drizzle:migrate` | Apply migrations |
| `bunx eslint .` | Run ESLint |

---

## Scalability & Future Roadmap

* **Redis Integration**: Implementation of a caching layer for high-frequency credential lookups.
* **Audit Logging**: Comprehensive tracking of "Reveal" actions for enterprise security trails.
* **Secrets Management**: Integration support for HashiCorp Vault or AWS Secrets Manager.
* **Middleware Activation**: Enable `proxy.ts` for route-level authentication.
* **Key Rotation**: Automated key rotation reminders and versioning.
* **Multi-Factor Authentication**: TOTP-based 2FA for enhanced security.

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ENCRYPTION_KEY` | 32-byte base64 key for AES encryption | Yes |
| `OAUTH_CLIENT_ID` | Google OAuth client ID | Yes (for OAuth) |
| `OAUTH_CLIENT_SECRET` | Google OAuth client secret | Yes (for OAuth) |
| `NEXT_PUBLIC_API_URL` | Public URL of the app (used for OAuth redirects) | Yes |

---

**Developed by prohv**
