# StudioFrame Requirements

## Sources and interpretation

1. **Primary client source:** [`docs/Photo_Studio_Requirement_Document.pdf`](./docs/Photo_Studio_Requirement_Document.pdf) (two pages). Where it is explicit, this document is the client requirement source of truth.
2. **Project constraints:** [`AGENTS.md`](./AGENTS.md). It adds mandatory Version 1 scope and the approved technology/branding boundaries. Conflicts with the PDF are documented below alongside the user's implementation authorization.

Labels used below:

- **PDF — V1/V2:** stated in the corresponding PDF section.
- **AGENTS — V1/V2:** stated in the project instructions.
- **Proposal / open:** a design interpretation, not a confirmed client requirement.

This document records the requirements basis for the Version 1 foundation. The implementation uses explicitly marked demo content and leaves unresolved business policies visible.

## Project overview

The PDF describes a modern, interactive photography-studio web platform to showcase a portfolio, estimate custom frame/album prices, and support online shoot bookings and product orders. Its Version 1 goal is a fast, zero-reload storefront for visual presentation, service discovery, and enquiry capture. Version 2 adds backend persistence, cart/checkout, and end-to-end studio management.

**Important scope discrepancy:** The PDF puts backend persistence, cart checkout, and studio management in its Version 2 goal. `AGENTS.md` explicitly requires booking persistence, enquiry persistence, and no-double-booking protection in Version 1. The user has explicitly authorized V1 booking and enquiry persistence in subsequent implementation requests. The original source discrepancy remains recorded, but it does not block the currently authorized work.

## Version 1 — public studio website

### Global interface and cross-cutting features

| Requirement | Source |
|---|---|
| Sticky header with a “Book Now” call to action. | PDF — V1 |
| Footer links for Privacy Policy and Terms. | PDF — V1; AGENTS requires Privacy Policy and Terms pages. |
| Downloadable price-catalogue PDF. | PDF — V1; AGENTS — V1 |
| Floating WhatsApp and call buttons/interfaces. | PDF — V1; AGENTS — V1 |
| Responsive/mobile-first layouts. | AGENTS — V1; PDF tech baseline |
| Premium photography presentation, consistent typography/spacing, accessible navigation/forms/buttons, smooth transitions and subtle animations. | AGENTS design standards |
| Configurable demo studio name, text logo, sample gallery/service/review content, placeholder contact details and sample address. Use no real person's phone/email; keep studio details in `src/config/studio.config.ts`. | AGENTS — V1 |

### Pages and their required functionality

| Page / view | Required functionality | Source |
|---|---|---|
| **Home** | Banner carousel; studio introduction; popular services; featured photos with lightbox; customer reviews; active-offers banner; Instagram feed. | PDF — V1 |
| **Gallery** | Category filters for Wedding, Birthday, Baby, Outdoor, and Portrait; interactive Before/After editing-comparison slider. | PDF — V1 |
| **Services** | Cards with inclusions and starting prices for Wedding, Pre-Wedding, Baby, Passport-Size, Events, Video, and Editing; each links directly to Booking. | PDF — V1 |
| **Frames** | Interactive configurator; live price calculation; sample previews; selections include Size × Material × Customization. | PDF — V1 |
| **Albums** | Interactive configurator; live price calculation; sample previews; selections include Size × Page × Finish Type. | PDF — V1 |
| **Booking** | Form fields: Name, Mobile, Shoot Type, Date/Time, Location, Requirements; validation and a confirmation screen. | PDF — V1 |
| **Contact** | General enquiry form and studio contact information. | PDF — V1 (combined with About); AGENTS — V1 |
| **About** | Studio bio, address, hours, phone/WhatsApp, and Google Maps pin. | PDF — V1 (combined with Contact); AGENTS — V1 |
| **Privacy Policy** | Page linked from the footer. The text/content is not supplied. | PDF footer; AGENTS — V1 |
| **Terms** | Page linked from the footer. The text/content is not supplied. | PDF footer; AGENTS — V1 |

The PDF combines About and Contact into one numbered item. `AGENTS.md` lists them separately as website features. The implementation could present separate routes or one combined view; confirm the desired navigation before build.

### Version 1 persistence and API scope from project instructions

These are mandatory project constraints but not described as Version 1 backend features in the PDF:

- Persist booking submissions.
- Persist general enquiries.
- Prevent duplicate booking date/time slots.
- Validate booking input.

The user explicitly authorized Version 1 booking and enquiry persistence with PostgreSQL in subsequent implementation requests. Booking additionally requires a generated booking reference, validation, a confirmation screen, and exact date/time duplicate prevention. This authorizes the current V1 implementation while preserving the original PDF's scope statement and the unresolved production business-policy questions.

Static marketing content, sample photos/reviews, service cards, and frame/album price options may be configuration-driven in V1. The PDF does not require public content-management APIs.

## Version 2 — future scope; do not implement in V1

### Customer upgrades

| Feature | Required behavior | Source |
|---|---|---|
| Cart and checkout | Add configured frames/albums to cart, apply discounts, and place orders. | PDF — V2 |
| Photo upload | Customers attach photos for print/editing during ordering. Uploaded photos must remain private and must never be auto-published in the public gallery. | PDF — V2; AGENTS security rule |
| Tracking and alerts | Order/booking status lookup and automated SMS, WhatsApp, and email notifications. | PDF — V2 |

### Admin panel — 12 modules

1. **Authentication:** secure login and role-based access control.
2. **Dashboard:** totals for bookings, orders, revenue, and upcoming schedule.
3. **Gallery:** add/edit/delete photos and Before/After pairs.
4. **Services:** CRUD for photography/video packages.
5. **Frames:** manage sizes, materials, and pricing rules.
6. **Albums:** manage album types, page slabs, finishes, and pricing.
7. **Products:** add/update standalone retail items.
8. **Bookings:** check slot availability, accept/reject, and update status.
9. **Orders:** view orders, download customer photos, and update fulfillment status.
10. **Customers:** customer directory, shoot history, and order history.
11. **Enquiries:** view and respond to contact/quote requests.
12. **Settings:** studio details, hours, Maps link, offers, and price PDF.

All listed admin/customer modules are PDF Version 2. AGENTS also names the same future modules and explicitly prohibits starting Version 2 without instruction.

### Version 2 order lifecycle

The PDF specifies this strict **order** status flow:

`Pending → Accepted → Processing → Ready → Delivered`

The document does not say that this lifecycle applies to bookings. Do not apply it to bookings without client approval.

## Booking and pricing business rules

### Explicit requirements

- Booking submissions collect Name, Mobile, Shoot Type, Date/Time, Location, and Requirements, validate the form, and show a confirmation screen. (PDF — V1)
- Booking persistence, enquiry persistence, and no-double-booking protection are required by `AGENTS.md` for V1.
- The PDF's non-negotiable rule says to check calendar availability and block duplicate date/time slots.
- Frame prices are auto-calculated from user selections; the axes are Size, Material, and Customization.
- Album prices are auto-calculated from user selections; the axes are Size, Page, and Finish Type.
- Service cards show inclusions and starting prices.
- Discounts are stated for Version 2 cart/checkout, not Version 1.

### Not specified — do not invent

The PDF does not provide a price list, currency, price formula, tax/fee policy, service/package inclusions, duration per shoot type, slot granularity, booking hours, cancellation/reschedule rules, deposit/payment policy, or booking approval workflow. These need client input. Until then, any prices/content are clearly marked demo-only configuration, not client-approved commercial terms.

The current demo uses USD sample amounts because the project-start request explicitly asked for sample services and prices. USD and every displayed amount are illustrative only, not client-approved commercial pricing.

### Implementation implications (proposal)

- Price calculations should use a single authoritative set of option/price data, with the same calculation verified server-side if quotes or bookings persist priced selections. No pricing API or stored quote is required by the PDF itself.
- Availability must be checked on the server when accepting a booking, not only in the browser. The write must be atomic, with a database uniqueness/locking strategy after the slot definition is approved.
- A unique exact timestamp constraint only prevents identical timestamps; it does not prevent overlapping bookings with different starts. The actual strategy depends on shoot duration, buffers, and slot rules, all currently unknown.
- Return a clear conflict response when a slot is no longer available and let the visitor choose another slot. This response behavior is a proposal.

## Reusable UI components (proposed)

The client document identifies functionality, not component boundaries. The following are implementation proposals:

- `SiteHeader` with sticky behavior and `Book Now` link.
- `SiteFooter` with legal links and price-catalogue download.
- Floating `WhatsAppButton` and `CallButton`.
- `PageSection` / `SectionHeading` and reusable responsive layout/container.
- `BannerCarousel`, `OfferBanner`, `ServiceCard`, `ReviewCard`, and `InstagramFeed`.
- `GalleryGrid`, `GalleryFilters`, `PhotoLightbox`, and `BeforeAfterSlider`.
- `PriceConfigurator`, shared selection controls, and `PriceSummary` for frames/albums.
- `BookingForm`, field/validation feedback, availability selector, and confirmation view.
- `EnquiryForm`, contact details block, and map link/embed.
- Shared accessible button, input, select, and form-status primitives.

## Validation and security requirements

### Explicitly required

- Validate the booking form. (PDF — V1)
- Validate forms and user input. (`AGENTS.md`)
- Keep secrets in environment variables; never hardcode database credentials. (`AGENTS.md`)
- Use soft deletes where applicable. (`AGENTS.md`)
- Do not expose private customer-uploaded photos publicly. (`AGENTS.md`; PDF makes photo upload V2)
- Prevent duplicate booking slots. (`AGENTS.md`; PDF calendar rule)
- Secure authentication and role-based access are required for the Version 2 admin panel, not public V1 visitor flows. (PDF — V2)
- PDF technical baseline: REST APIs, form validation, search/filter, secure auth, and soft deletes in DB. Secure auth is kept in V2 in accordance with the PDF's explicit Admin Panel section and AGENTS' V2 boundary.

### Recommended controls to confirm during implementation

These are engineering recommendations, not additional client requirements: validate all API inputs server-side; use ORM parameterization; limit public-form abuse; avoid logging unnecessary personal data; protect admin sessions/authorization in V2; use private object storage and authorization-gated access for V2 uploads; define retention/deletion policy; and use secure transport/configuration in deployment. Applicable privacy law and retention periods require client/jurisdiction guidance.

## Version 2 readiness without V2 implementation

- Keep public marketing pages/data separate from booking/enquiry persistence.
- Keep pricing inputs/rules data-driven so future admin-managed options can replace demo configuration.
- Keep the API/service boundary and data relationships extensible for orders, products, customers, and management functions.
- Plan storage references and access controls for private customer uploads, but do not build uploads in V1.
- Do not add admin login, admin pages, cart, checkout, order management, customer portal, notifications, or CRUD modules in V1.

## Client approval questions

1. **V1 persistence boundary:** The user has explicitly authorized booking and enquiry persistence for the current V1 implementation. The PDF/AGENTS source discrepancy is documented; no additional approval is needed to continue this authorized work.
2. **Booking semantics:** Exact instants are protected. What timezone applies, and what are session lengths, buffers, operating hours, blocked dates, cancellation/reschedule rules, and any overlap/resource conflict rules?
3. **Booking confirmation:** Current confirmation means “request received,” not an accepted appointment. Should the studio approval process or confirmation copy differ?
4. **Pricing:** Please supply currency, frame/album options and formulas, prices, service inclusions/starting prices, and whether taxes/fees apply. Should demo-only values be shown before these are available?
5. **Content:** Provide or approve studio bio, address, hours, contact channels, map pin, offers, gallery assets/categories, Before/After pairs, reviews, Instagram feed/embed, and price-catalogue PDF. Until supplied, use clearly labeled demo content only.
6. **Pages/navigation:** About and Contact are implemented as separate pages per the user's direction. Confirm any remaining URL/page structure and footer/legal-copy requirements.
7. **Forms:** Which booking fields are required and what validation/consent text is expected? The current demo enquiry form uses name, optional email/mobile (at least one required), and message; confirm the production form contract and response expectations.
8. **Catalogue and contact actions:** Who supplies the downloadable catalogue? What placeholder WhatsApp link and phone/call target are acceptable for a demo without using a real person's details?
9. **Privacy/legal:** Who supplies or approves Privacy Policy and Terms text, and what jurisdiction, data retention, and deletion rules apply?
10. **Instagram/maps integrations:** Is an embedded feed required or is a link acceptable? Which approved public account and map URL/pin should be used?

## Requirements intentionally not assumed

No client-specific studio identity, real contact details, real commercial prices, payment provider, currencies, user accounts, live content API, exact privacy wording, legal jurisdiction, booking time policy, upload flow, or V1 order checkout is inferred from the source documents.
