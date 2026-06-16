# KeyBase System Architecture Guide

This document outlines the design principles and structural layout of the KeyBase refactored architecture. The target shape achieves clean separation of concerns, thin adapters, encapsulated domain logic, and modular user interface pieces.

---

## Codebase Layout

```text
src/
  db/                      # Database configuration
    index.ts
    schema.ts              # Hardened schema with cascade rules & unique indexes

shared/
  server/                  # Server-side shared responses & results
    errors.ts              # Centralized AppError and subclasses
    responses.ts           # Standardized API response formatters
    action-result.ts       # Server Actions result envelope helper

features/                  # Domain-centric modules
  auth/                    # Session tokens, guards, passwords, etc.
  teams/                   # Team actions, invites, list/join, sidebar state
  projects/                # Project creation, deletion, access checks
  api-keys/                # API secret generation, storage, reveal, export
  tokens/                  # Programmatic session tokens

app/                       # Next.js Application router
  api/                     # Thin JSON API route adapters (for external use/CLI)
  (web-routes)/            # Thin pages and forms calling Server Actions
```

---

## Architectural Principles

### 1. Thin Adapters (Routes & Actions)
API routes (`route.ts`) and Server Actions (`action.ts`) act strictly as thin adapters:
- They authenticate the user using domain guards (e.g. `requireCurrentUser()` or `requireJwtAuth()`).
- They parse inputs using Zod schemas imported from their respective features.
- They invoke feature services to perform work.
- They return uniform action envelopes or JSON responses.

### 2. Encapsulated Feature Services
All database interactions, business rules, and state modifications are strictly encapsulated inside service functions (e.g. `createApiKey()`, `listProjects()`). No database query or mutation should reside directly within pages, API routes, or server actions.

### 3. Centralized Authorization Policies
Access checks are modularized in `policy.ts` (e.g. `assertProjectMember()`). Policies must be called by services or guards to enforce data authorization before executing mutations or reads.

### 4. Decomposed UI Pieces
UI components are decomposed into smaller sub-components and custom state management hooks located under `features/*/components/` and `features/*/hooks/`. Parent layouts simply assemble these components.

### 5. Client Mutations via Server Actions
All internal UI mutations must be dispatched via Next.js Server Actions. REST API endpoints are strictly reserved for external integrations or the KeyBase CLI.
