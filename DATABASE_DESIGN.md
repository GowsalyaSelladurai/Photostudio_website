# StudioFrame Database Design

## Status and scope

This describes the V1 Prisma schema in [`prisma/schema.prisma`](./prisma/schema.prisma). The PDF states backend persistence as a Version 2 goal, while [`AGENTS.md`](./AGENTS.md) requires V1 booking/enquiry persistence and duplicate-slot prevention. The user has explicitly requested the V1 booking system. The initial migration was applied and exercised against an isolated temporary PostgreSQL cluster; no project database connection is configured.

Use PostgreSQL with Prisma ORM as required by `AGENTS.md`. Maintain migrations; never reset or delete data without explicit approval.

## V1 persistence boundary

### Proposed persistent entities

#### Booking

The schema stores one submitted booking request with:

- `id`: Prisma-generated string primary key.
- `referenceNumber`: database-generated unique sequence number, displayed as `SF-000001` (minimum six digits).
- `name`, `mobile`, `shootType`: required bounded strings.
- `startsAt`: required PostgreSQL `timestamptz(3)` with a **unique exact-start constraint**.
- `location`: required bounded string.
- `requirements`: optional text.
- `createdAt`: database-generated timestamp.

The PDF does not define requiredness or field lengths. The implemented V1 form treats name/mobile/shoot type/date-time/location as required and requirements as optional; this is a foundation assumption. No booking status is stored.

#### Enquiry

The schema stores one general enquiry:

- `id`: Prisma-generated string primary key.
- `name`: required bounded string.
- `email`, `mobile`: optional bounded contact fields; API validation requires at least one.
- `message`: required text.
- `createdAt`: database-generated timestamp.

These enquiry fields are demo assumptions because the PDF does not enumerate them. Confirm the production form contract with the client.

### Data not proposed for V1 database persistence

- Studio identity, hours, public contact information, demo content, sample reviews, offers, service cards, gallery metadata, frame/album option lists and demo prices can be configuration/static assets in V1.
- Frame/album estimates need not be persisted unless the client requests quote history.
- No V1 `Order`, `Cart`, `Product`, `CustomerAccount`, `AdminUser`, upload, notification, or order-lifecycle records. These map to Version 2.
- Customer name/mobile can remain on each booking in V1. A separate Customer entity is not required by the PDF and should be introduced only if approved use cases require it.

## Relationships

There are no relationships required between the two V1 entities based on the source documents. A booking could reference a service/catalog item or customer in a later version, but that is not a V1 requirement.

**Future extension only (V2):**

- Customer to many Bookings and Orders.
- Order to one Customer and many OrderItems.
- OrderItem to Product/Frame/Album configuration snapshots.
- Gallery entries may reference Before/After pairs.
- Admin users may be assigned roles.
- Upload records must be private and linked to authorized customer/order context.

These are conceptual future relationships, not approved V1 schema requirements.

## Constraints and indexes (proposed)

- Primary key for each persistent record.
- Index Booking requested date/time for availability queries.
- Index Enquiry created timestamp for later administrative review.
- Unique database-generated booking reference number.
- `Booking.startsAt` has a unique database constraint. This atomically prevents duplicate exact instants, including concurrent submissions.
- This does **not** prevent overlapping sessions with different start times, nor define resources, duration, buffers, or time-zone interpretation. Do not claim broader double-booking protection until these rules are approved and implemented.
- Validate data before persistence; database constraints should reinforce, not replace, validation.
- Use soft-delete fields only where deletion is applicable/approved, in line with `AGENTS.md`; no deletion workflow is specified for V1 bookings/enquiries.

## Data handling and security

- Keep database credentials in environment variables; never hardcode them.
- Keep database calls in service modules and avoid exposing private fields through public API responses.
- Booking/enquiry data includes personal/contact information. Confirm privacy notice, retention, access, and deletion requirements before production use.
- Use server-side validation and ORM-safe queries.
- Do not store or expose customer-uploaded photos in V1. V2 uploads must use private storage and authorization-gated download; never auto-publish them to the gallery.
- No credentials, payment data, admin records, or customer accounts are required by V1 source requirements.

## Business rules affecting the schema

1. A booking request stores the PDF-listed name, mobile, shoot type, date/time, location, and requirements.
2. The availability API checks for exact start-time matches; the unique constraint is the final race-safe guard for identical instants.
3. The current demo form converts the visitor's local date/time into an ISO instant. Replace this behavior with an approved studio-timezone rule before production.
4. Frame/album selections drive live price estimates. The source gives the option dimensions but no values or formulas. Use approved configuration for V1; do not invent table contents or persist selection snapshots unless explicitly required.
5. The PDF's `Pending → Accepted → Processing → Ready → Delivered` lifecycle is for orders in Version 2, not V1 bookings.

## Outstanding booking-policy questions

- What exactly identifies a slot and a conflict? Are bookings of different durations/resources allowed to overlap?
- What timezone, operating hours, blackout dates, buffers, and slot granularity apply?
- Should booking requests have a status or require approval after submission?
- What are the privacy, retention, access, and deletion rules for booking and enquiry data?
- Should customer data be normalized/shared across bookings in V1?
- Are frame/album prices and options static configuration, editable/admin-managed later, or expected to be database-driven in V1?

## Film/Video services update (2026-11-23)

Film/Video services reuse the existing `booking` and `enquiry` tables. Migration `20261123100000_add_film_service_category` is additive only:

- New enum `ServiceCategory` (`PHOTOGRAPHY`, `FILM`).
- `booking.serviceCategory` — `NOT NULL DEFAULT 'PHOTOGRAPHY'` (existing rows are classified as photography). The selected service itself is still stored in `booking.shootType`.
- `enquiry.serviceType` (`VARCHAR(80)`, nullable) and `enquiry.serviceCategory` (nullable; `NULL` = general enquiry with no service chosen).
- Indexes: `booking_service_category_idx`, `enquiry_service_category_idx`.

`serviceCategory` is derived on the server from the service name (`getServiceCategory` in `src/lib/validation.ts`); it is never trusted from the client. Film/Video records can be listed with `WHERE "serviceCategory" = 'FILM'`.
