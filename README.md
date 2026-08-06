# Vita

Full-stack healthcare discovery platform with JWT authentication, feature-first React architecture, and a REST API. Find trusted doctors, clinics, and telehealth care.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Redux Toolkit, TanStack Query, React Router, React Hook Form, Zod, Axios, i18next, SCSS modules
- **Backend:** Express, JWT, bcrypt, in-memory seeded data

## Architecture

```
src/
  app/          # providers, router, layouts, store, styles
  features/     # auth, care, favorites, profile
  shared/       # api client, config, errors, i18n, UI primitives
server/         # REST API
```

Layer flow: UI → hooks/services → API client → backend. DTOs are mapped to domain models before reaching the UI.

## Quick start

```bash
npm install
npm run dev
```

- Web: http://localhost:5174 (or next free port)
- API: http://localhost:4001/api/health

## Demo accounts

| Role     | Email               | Password      |
|----------|---------------------|---------------|
| Provider | provider@vita.care  | Password123!  |
| Patient  | patient@vita.care   | Password123!  |

## Scripts

- `npm run dev` — API + Vite together
- `npm run dev:web` — frontend only
- `npm run dev:api` — API only
- `npm run build` — production build

## Features

- Register / login / logout with access + refresh tokens
- Protected routes and provider-only service listing
- Care catalog search, filters, pagination, detail pages
- Saved care for authenticated patients
- EN / AR localization with RTL
- Loading / empty / error states on every data screen
