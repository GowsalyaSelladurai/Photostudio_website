# StudioFrame Decisions and Open Questions

## Confirmed project constraints

| ID | Decision / constraint | Source |
|---|---|---|
| C-01 | The original PDF is the primary client requirement source; do not silently change its features. | `AGENTS.md` |
| C-02 | Use Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and Next.js Route Handlers. Do not add another frontend/backend framework without approval. | `AGENTS.md` |
| C-03 | Current work is Version 1, the public studio site. Do not start Version 2 unless explicitly instructed. | `AGENTS.md` |
| C-04 | Use demo-only, configurable brand details. Do not invent client identity or use a real person's phone/email. Keep studio details in `src/config/studio.config.ts`. | `AGENTS.md` |
| C-05 | Prefer server components; use client components when interaction requires them. Keep database operations in service modules and APIs separate from UI. | `AGENTS.md` |
| C-06 | Validate user input, keep secrets in environment variables, use soft deletes where applicable, preserve migration history, and do not reset/delete data without explicit approval. | `AGENTS.md` |
| C-07 | Customer-uploaded photos must never be publicly exposed; uploads are future scope. | `AGENTS.md`; PDF V2 |
| C-08 | The user has directed us to start the Version 1 foundation, including an initial Prisma schema and demo content. Do not claim the target database is configured or connected until it is configured and tested. | Current user instruction |
| C-09 | Implement the Version 1 public booking flow with client/server validation, PostgreSQL persistence, a generated reference, a receipt confirmation, and protection against duplicate exact start instants. Do not build the Version 2 admin booking dashboard. | Current user instruction |
| C-10 | Implement separate About and Contact pages and persist general enquiries in PostgreSQL with client/server validation and submission feedback. | Current user instruction |

## Source reconciliation and current proposals

| ID | Topic | Source statements | Current treatment |
|---|---|---|---|
| R-01 | V1 persistence | PDF calls V1 a client-side, zero-reload SPA for presentation/service discovery/enquiry capture; PDF V2 goal explicitly includes backend persistence. `AGENTS.md` nevertheless requires V1 booking/enquiry persistence and no-double-booking protection. | The user explicitly authorized V1 booking persistence, exact-start conflict prevention, and enquiry persistence. The original PDF/AGENTS source discrepancy remains documented but does not block the authorized work. |
| R-02 | V1 storefront rendering | PDF says “Client-Side SPA”; project stack mandates Next.js App Router and server components by default. | **Proposal:** use App Router and client-side navigation for SPA-like UX, keeping interactive widgets as client components. Confirm if the client means a strict all-client SPA. |
| R-03 | About and Contact navigation | PDF groups “Contact & About” in one item; `AGENTS.md` lists About and Contact separately. | The user explicitly requested separate About and Contact pages; implement them as distinct routes. |
| R-04 | Booking versus order status | PDF defines an order lifecycle, while V2 booking management has accept/reject/status but no values. | Apply `Pending → Accepted → Processing → Ready → Delivered` only to V2 orders. Do not infer a V1 booking lifecycle. |
| R-05 | Public content and prices | PDF names content/price dimensions but gives no studio identity, asset set, values, currency, or calculation formulas. | **Demo-only proposal:** configuration-driven placeholders, visibly marked and never represented as approved client prices/details. |
| R-06 | V1 database entities | The sources require V1 booking/enquiry persistence only in `AGENTS.md`; no schema is provided. | Initial schema contains minimal Booking and Enquiry records. No separate Customer or V1 product/catalogue tables are created. |
| R-07 | Exact booking conflict | Slot duration/timezone/resource rules remain unspecified. | The schema and initial migration enforce uniqueness of exact `startsAt` timestamps only. The database constraint arbitrates concurrent requests; this does not protect against overlapping sessions. |
| R-08 | Demo price/currency | Original requirements provide no currency or prices; current user asks for sample services and prices. | Sample catalog uses USD amounts and explicitly labels them as demo estimates; update centrally when client pricing is approved. |

## Assumptions and demo-only choices (not client-approved)

- Any studio name, text logo, address, phone/WhatsApp target, email, map/social URL, hours, photo, service description, review, offer, or catalogue is demo/placeholder content only.
- Frame/album prices and service starting prices are sample USD amounts specifically requested for the demo only; they are not commercial facts.
- API route names and request/response shapes in `API_DESIGN.md` are implementation choices, not source-specified URLs.
- The Prisma schema and initial migration exist. The migration was applied only to an isolated temporary test cluster, which was stopped and removed; no target database has been configured or migrated.
- The source does not define legal text, privacy jurisdiction, data retention, consent, booking required-field semantics, time zone, availability policy, quote history, or cancellation policy.

## Questions requiring approval before implementation

1. Define what makes a slot unavailable: exact start-time match or overlapping durations/resources; provide service durations, buffers, timezone, operating hours, blackout dates, and slot granularity.
2. Define booking submission meaning: request received versus confirmed/accepted; approve confirmation text and any V1 booking statuses.
3. Provide frame/album option values and price formulas; service starting prices and inclusions; currency and any tax/fee treatment.
4. Confirm the production booking and enquiry fields, validation, privacy/consent copy, and contact form behavior. The current demo enquiry form has name, optional email/mobile (at least one valid contact required), and message.
5. Provide approved studio branding, address/hours, phone/WhatsApp/call target, map pin, Instagram account/integration preference, reviews, photos, offers, and catalogue PDF. Until then, use clearly identified demo content only.
6. Provide or approve Privacy Policy and Terms, jurisdiction, and personal-data retention/deletion expectations.

## Current implementation boundary

The user approved the Version 1 foundation and explicitly requested booking persistence with a generated reference, confirmation, and exact-slot conflict protection, plus About/Contact pages and PostgreSQL-backed enquiries. Booking and enquiry persistence were verified against an isolated temporary PostgreSQL cluster, which was stopped and removed. The target database remains unconfigured. Booking timezone/overlap/approval policies and the production enquiry form contract remain open. Version 2 remains deferred.
