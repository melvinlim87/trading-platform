# AGENTS.md

## Purpose
This document defines working conventions for agents and contributors in `apps/api`.

## Project Scope
- Stack: NestJS + TypeScript + TypeORM
- Entry: `src/main.ts`
- Default dev command: `npm run start:dev`

## Setup
- Install deps: `npm install`
- Environment: create `.env` from `.env.example` and fill required values.

## Run
- Dev (watch): `npm run start:dev`
- Build: `npm run build`
- Production run: `npm run start:prod`

## Validation
- Lint: `npm run lint`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Coding Rules
- Keep changes minimal and scoped to the request.
- Preserve module boundaries (`src/<feature>`).
- Update DTOs/entities/services consistently when schema fields change.
- Prefer explicit types over `any` for new code.
- Do not commit generated artifacts unless required.

## Database Notes
- TypeORM entities live under `src/**/**.entity.ts`.
- Keep migrations in `src/migrations` aligned with entity changes.

## Operational Notes
- `start:dev` runs as a long-lived watch process; successful start does not exit.
- If startup fails, first run `npm run build` to surface TypeScript errors quickly.
