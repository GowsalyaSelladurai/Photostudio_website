# StudioFrame Project Plan

## Status and scope

**Status:** Version 1 foundation, homepage, booking flow, About and Contact pages, and enquiry persistence are implemented; booking and enquiry persistence were verified against an isolated PostgreSQL test cluster; target database configuration, remaining public pages, and production policies remain pending.  
**Current scope:** Version 1 public photography-studio website.  
**Out of scope now:** Version 2 admin portal, customer accounts, cart/checkout, orders, uploads, notifications, and management modules.

The primary requirement source is [`docs/Photo_Studio_Requirement_Document.pdf`](./docs/Photo_Studio_Requirement_Document.pdf); project constraints are in [`AGENTS.md`](./AGENTS.md). Scope conflicts and client questions are captured in [`REQUIREMENTS.md`](./REQUIREMENTS.md) and [`DECISIONS.md`](./DECISIONS.md).

## Proposed architecture

Use the approved stack only:

- **Next.js App Router** for page routes, layouts, and server-side rendering where useful; client components only for interactions (carousel, gallery filters/lightbox, Before/After slider, configurators, forms).
- **React + TypeScript + Tailwind CSS** for accessible, reusable presentation components.
- **Next.js Route Handlers** for V1 booking, availability, and enquiry APIs, following the user's current direction to start the foundation. The PDF/AGENTS persistence-scope difference remains documented.
- **Service modules** for data access and booking conflict checks; UI components do not access the database directly.
- **PostgreSQL + Prisma ORM** for the initial booking/enquiry schema. The migration and persistence flows were tested against an isolated temporary PostgreSQL cluster; the target database remains unconfigured.
- **`src/config/studio.config.ts`** for configurable demo identity and sample public content/branding, in accordance with `AGENTS.md`. Never invent real client information.
- **Static/public assets** for sample images and legal pages; generate the sample price catalogue from centralized configuration. Do not introduce customer uploads in V1.

The PDF calls V1 a fast, zero-reload client-side SPA. App Router client-side navigation can support that storefront feel while retaining server components and Route Handlers. The user explicitly authorized V1 booking and enquiry persistence; the original PDF/AGENTS scope discrepancy remains documented.

## Development phases

### Phase 0 — Project foundation (current)

- Establish the App Router app, shared responsive layout, reusable UI, demo content configuration, initial Prisma schema, and V1 Route Handlers.
- Create starter routes for the V1 public pages; final client-approved content and policy behavior remain pending.
- Use a unique exact start time for the initial booking constraint; do not imply protection from overlapping sessions.
- Configure an example environment file only. Do not create/reset the target database or claim its connection is working without real PostgreSQL configuration and verification.

### Phase 1 — Resolve remaining decisions and collect approved content

- Resolve slot semantics, booking confirmation behavior, required form fields, pricing formulas, page structure, legal copy, and integrations.
- Obtain approved brand assets, sample/real copy, catalogue, and public contact/map/social details.
- Mark all remaining sample values as demo-only; do not use real people's contact details.

### Phase 2 — Public content pages

- [x] Build the Home page with responsive navigation, configured hero slides, featured services/gallery, testimonials, offer and social placeholders, and contact actions.
- [ ] Complete Gallery, Services, Frames, Albums, Privacy Policy, and Terms views.
- [x] Build separate About and Contact pages with configurable studio story, approach, sample team, contact details, opening hours, WhatsApp, and a Maps placeholder.
- [x] Add gallery category filtering, shared photo lightbox, and Before/After slider.
- [ ] Complete responsive presentation across the remaining public pages.
- Add catalogue download and call/WhatsApp actions using approved targets.
- Connect services to Booking with the selected service carried into the form where approved.

### Phase 3 — Pricing and booking experience

- [x] Implement the booking form with shared client/server validation, persisted requests, generated references, confirmation UI, and race-safe exact-start uniqueness.
- [x] Apply the initial migration to an isolated test database and verify successful persistence and concurrent duplicate-slot rejection.
- [ ] Configure the target PostgreSQL connection and apply the migration there.
- Replace sample configurator values with approved pricing rules.
- Finalize time-zone handling and any overlap/resource conflict rule with the client.

### Phase 4 — Enquiries, content polish, and verification

- [x] Implement the general enquiry form with shared client/server validation, accessible field errors, success confirmation, and PostgreSQL persistence.
- [x] Verify enquiry persistence and invalid submissions against an isolated PostgreSQL test cluster.
- Finalize the production enquiry field contract and privacy/retention policy.
- Test accessibility, responsive behavior, required form validation, price calculations, availability conflicts, success/error states, and navigation.
- Run project-appropriate type checks, lint, focused tests, and production build.
- Confirm no V2 behavior has entered the release.

### Phase 5 — Release readiness

- Review privacy/security handling, environment configuration, migrations, deployment settings, public content, legal copy, and catalogue.
- Deploy only with explicit approval and an agreed deployment plan; do not perform destructive database operations without approval.

## Architecture and delivery guardrails

- Do not reset/delete an existing database or run destructive data operations without explicit approval.
- Keep Version 2 explicitly deferred. Prepare extension points only; do not implement V2 modules.
- Keep all database operations in service modules and all APIs separate from UI.
- No admin authentication in V1 unless the client changes scope and approves it.
- Use soft deletes where persistent records need deletion, and maintain Prisma migration history.
- Do not reset/delete existing data or run destructive deployment/database actions without approval.
- Do not publish or expose customer-uploaded imagery; photo upload itself is V2.

## Release acceptance checklist

- All approved V1 pages and global components are present and responsive.
- Gallery category filters and Before/After comparison work; featured photo lightbox works.
- Service cards have clearly labeled demo inclusions/prices and link to booking; replace with approved values before release.
- Frame and album estimates exactly follow approved rules and selections.
- Booking fields, validation, exact-time availability, persistence, and confirmation match the current demo contract; overlap rules and studio time zone remain open.
- Enquiries persist and provide usable submission feedback once PostgreSQL is configured and migrated.
- Footer legal links, catalogue download, WhatsApp, and call actions point to approved destinations.
- No credentials are hardcoded; user input is validated; duplicate exact start times are rejected by the database constraint.
- No V2 admin, checkout, order, customer-upload, tracking, or notification feature is implemented.
