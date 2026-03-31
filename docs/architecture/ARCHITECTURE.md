# Fibernance Architecture

## Purpose

This document defines the working architecture for the Fibernance application so product changes and UI refactors stay aligned over time.

## System Overview

Fibernance is split into two main applications:
- `backend/`: FastAPI application, business logic, scheduling, database access
- `frontend/`: React, TypeScript, Vite, Tailwind-based interface

## Frontend Architecture

### Routing Layer

Top-level routing is handled in `frontend/src/App.tsx`.

Current route groups:
- Inventory
- Cashier
- Orders
- Digiflazz
- Data Sync

### Page Layer

Each route owns one page component under `frontend/src/pages/`.

Page responsibilities:
- fetch and bind domain data
- render page-specific layouts
- manage page-local modal state
- compose reusable visual primitives

Pages should not invent local design languages. They must consume the shared visual system documented in `docs/design/UI_UX_GUIDELINES.md`.

### API Layer

API access belongs in `frontend/src/api/`.

Rules:
- networking logic stays out of presentational JSX where practical
- shared axios configuration belongs in `client.ts`
- feature-specific hooks stay close to their domain module

### State Layer

Use local React state for page-local UI behavior.

Use the shared store only for cross-page or workflow state that must survive component boundaries, such as cashier form coordination.

### Styling Layer

The styling stack is:
- Tailwind utilities
- `frontend/src/index.css` for base primitives and shared classes

The design source of truth is:
- `docs/design/UI_UX_GUIDELINES.md`

No page may override those design rules with gradients, rounded surfaces, emoji-heavy UI, or mismatched typography.

## Backend Architecture

### API

FastAPI routers live under `backend/app/routers/`.

### Services

Business logic belongs under `backend/app/services/`.

### Core

Cross-cutting concerns such as models, database, security, and background tasks live under `backend/app/core/`.

## Documentation Structure

The `docs/` directory is divided into professional categories:
- `docs/design/`: design system, UI/UX rules, visual standards
- `docs/architecture/`: application structure and engineering decisions
- `docs/development/`: work logs, implementation notes, refactor tracking
- `docs/operations/`: runtime, deployment, maintenance, and support notes

## Documentation Workflow

Every implementation task must update the documentation set.

Expected behavior:
- design changes update `docs/design/UI_UX_GUIDELINES.md`
- architectural changes update this file
- implementation steps are logged in `docs/development/WORKLOG.md`

This rule exists to prevent design drift, undocumented refactors, and architectural confusion.

## Frontend Refactor Policy

When refactoring UI:
- fix drift at the system level first
- prefer shared styles over one-off styling
- standardize language to English
- remove decorative inconsistency instead of introducing new visual exceptions
- keep public behavior stable unless product direction explicitly changes