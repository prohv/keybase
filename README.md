# KeyBase: Secure Team API Vault

A high-performance, secure credential management platform designed for teams to store, encrypt, and share sensitive API keys through administrative access controls and unique join codes.

Built as a full-stack technical assignment focusing on security-first architecture, utilizing Next.js 15 (App Router), Drizzle ORM, and the Bun runtime.

---

## Features

* **Advanced Security**: API keys are encrypted using AES-256-GCM before database entry. Keys are never stored or logged in plain text.
* **Team-Based RBAC**: Admins manage team creation and generate unique, one-time join codes. Users gain access to shared vaults only after joining a team via valid code.
* **Full CRUD Lifecycle**: Secure management for API keys including creation, listing, secure reveal, update, and deletion.
* **Robust Authentication**: Secure user registration and login powered by JWT and bcrypt password hashing.
* **Type-Safe Validation**: End-to-end schema validation using Zod for API requests, server actions, and database operations.
* **Modern Performance**: Built with Bun for rapid installation, execution, and optimized development workflow.

---

## Tech Stack

* **Framework**: Next.js 15 (App Router)
* **Runtime & Package Manager**: Bun
* **Database & ORM**: PostgreSQL + Drizzle ORM
* **UI & Styling**: Tailwind CSS + shadcn/ui
* **Security**: Node.js Crypto (AES-256-GCM), JWT, bcryptjs
* **Validation**: Zod
* **Documentation**: Swagger / OpenAPI

---

## Project Structure

```text
keybase/
├── app/                # Next.js App Router (Pages, Actions & API Routes)
│   ├── api/v1/         # Versioned REST API Endpoints
│   ├── dashboard/      # Protected Team Management UI
│   └── auth/           # Secure Authentication Flow
├── lib/                # Shared Utilities (Encryption, DB Client, Auth)
├── drizzle/            # Database Schema, Relations, & Migrations
├── components/         # Shadcn/ui & Custom UI Components
├── drizzle.config.ts   # Database configuration
└── README.md           # Project documentation

```

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
`bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### 4. Database Setup

```bash
bun drizzle:push      # Sync schema changes instantly
# OR
bun drizzle:generate
bun drizzle:migrate

```

### 5. Run Development Server

```bash
bun dev

```

The application will be available at http://localhost:3000.

---

## Security Implementation

* **GCM Mode Encryption**: Provides both data confidentiality and authenticity.
* **Zero-Knowledge Architecture**: Plaintext keys are only decrypted on the server during an authorized "Reveal" request and are never persisted in the browser state.
* **Secure Key Handling**: Full API keys are displayed only once upon creation, encouraging immediate secure storage.

---

## Useful Commands

| Command | Action |
| --- | --- |
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bunx shadcn@latest add` | Add new UI components |
| `bun drizzle:push` | Push schema changes to DB |

---

## Scalability & Future Roadmap

* **Redis Integration**: Implementation of a caching layer for high-frequency credential lookups.
* **Audit Logging**: Comprehensive tracking of "Reveal" actions for enterprise security trails.
* **Secrets Management**: Integration support for HashiCorp Vault or AWS Secrets Manager.

---

**Developed by prohv**