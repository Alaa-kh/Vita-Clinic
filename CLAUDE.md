# CLAUDE.md

<!--
Golden Test before adding any rule:
"Would removing this rule cause Claude to make mistakes?"
If not — cut it. Only override defaults or encode project-specific decisions.
-->

---

# Section A — General Engineering Rules

## 1) Architecture
- Strict layer boundaries: UI → Application → Domain → Infrastructure.
- UI contains rendering and user interaction only.
- Business rules belong in the domain layer.
- Infrastructure handles APIs, storage, authentication, analytics, and third-party services.
- Feature-first architecture only. Avoid unnecessary abstractions.

## 2) Shared Code
- Anything reused in 2+ places belongs in shared/.
- Always check shared/ before creating new utilities, hooks, components, or services.

## 3) Error Handling
- Catch external errors at the infrastructure boundary.
- Never swallow exceptions silently.
- Use typed error objects across layers.
- Every screen explicitly handles loading, empty, success, and error states.

## 4) Dependencies
- Only add actively maintained production-ready packages.
- Every new dependency must have a clear justification.

## 5) Testing
- Test business logic and critical UI behavior.
- Every bug fix includes a regression test.
- Tests must be deterministic.
- One behavior per test.

---

# Section B — React / TypeScript Rules

## 1) Language
- Use TypeScript only.
- Enable strict mode.
- Avoid any.
- Prefer unknown until properly narrowed.

## 2) Project Structure
src/
  app/
  features/
  shared/
  assets/

Each feature contains:

features/
    auth/
        api/
        components/
        hooks/
        pages/
        services/
        types/
        utils/

## 3) State Management
- Use Redux Toolkit for global business state.
- Use Context only for simple app-wide concerns (theme, locale).
- Use component state (useState) only for local UI state.
- Never store server state manually.

## 4) Server State
- Use TanStack Query (React Query).
- Never duplicate cached server data into Redux.
- Use mutations for writes.
- Configure proper cache invalidation.

## 5) Components
- Components should have a single responsibility.
- Prefer composition over inheritance.
- Keep components small.
- Extract repeated UI into shared components.

## 6) Hooks
- Business logic belongs in custom hooks.
- Never call hooks conditionally.
- Custom hooks should encapsulate reusable logic, not UI.

## 7) API Layer
- All HTTP requests go through one configured API client.
- Centralize:
  - base URL
  - authentication
  - interceptors
  - headers
  - timeout
  - logging
- Never call fetch or axios directly inside components.

## 8) Error Contract
- Infrastructure maps API errors into typed application errors.
- UI never depends on raw backend responses.
- Show user-friendly messages.

## 9) Domain Models
- Keep API DTOs separate from application models.
- Never expose backend response models directly to UI.

## 10) Forms
- Use React Hook Form.
- Validate with Zod.
- Keep validation schemas separate from UI.

## 11) Routing
- Use React Router.
- Route definitions belong in one routing module.
- Lazy load feature pages when appropriate.

## 12) Styling
- Use one styling solution consistently.
- Never mix multiple styling approaches.
- Do not hardcode:
  - colors
  - spacing
  - radius
  - typography
- Use the design system or theme.

## 13) Naming
- Components:
UserCard.tsx

- Hooks:
useAuth.ts

- Services:
authService.ts

- API:
authApi.ts

- Types:
user.ts

## 14) Performance
- Memoize only when profiling justifies it.
- Avoid unnecessary renders.
- Lazy load large pages.
- Virtualize long lists.
- Keep bundle size small.

## 15) Accessibility
- Use semantic HTML first.
- Every interactive element must be keyboard accessible.
- Images require alt text.
- Forms require labels.
- Respect reduced-motion preferences.

## 16) Constants
Shared constants belong in:

shared/constants/

Examples:
- routes
- query keys
- sizes
- animation durations
- regex
- storage keys

## 17) Environment Variables
- Access environment variables through one configuration module.
- Never read process.env or import.meta.env directly throughout the application.

## 18) Localization
- No hardcoded user-facing strings.
- All visible text must use localization keys.

## 19) Comments
- Only add comments when explaining:
  - complex business logic
  - architectural decisions
  - workarounds
- Never comment obvious code.

## 20) File Size
- Components should generally stay under 200–300 lines.
- Split large files by responsibility rather than regions.

## 21) Imports
- Prefer absolute imports using path aliases.
- Avoid deep relative paths like:

../../../../../

## 22) Code Quality
- Prefer early returns.
- Avoid deeply nested conditionals.
- Prefer pure functions.
- Avoid duplicated logic.
- Keep functions focused on one responsibility.

## 23) Security
- Never store secrets in the frontend.
- Sanitize user-generated content before rendering.
- Validate all external input.
- Never trust client-side validation alone.

## 24) Package Recommendations
Preferred stack:

- React 19+
- TypeScript
- Vite
- Redux Toolkit
- TanStack Query
- React Router
- React Hook Form
- Zod
- Axios
- ESLint
- Prettier

Avoid introducing additional libraries unless they solve a clear problem.
