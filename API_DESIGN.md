# StudioFrame API Design

## Status and scope

This documents the implemented foundation endpoints for V1 booking/enquiry persistence required by `AGENTS.md` and explicitly authorized in the current implementation requests. The PDF describes REST APIs in its technical baseline but places backend persistence in the Version 2 goal. This foundation follows the user's authorization while keeping that original source-scope difference explicit.

Use Next.js App Router Route Handlers, not a separate backend. Keep validation and database access in service modules.

## Proposed Version 1 endpoints

### `GET /api/availability`

**Purpose:** Report whether a requested date/time is available, supporting the PDF's calendar-availability requirement.

**Query:** `dateTime` as an ISO date-time with a timezone offset.

**Response:** `{ "available": boolean }` for that exact timestamp, without exposing booking details.

**Current behavior:** Checks whether a booking exists at that exact timestamp. Operating hours, studio timezone, shoot duration, buffers, and slot granularity are unspecified; an exact timestamp check does not detect overlapping bookings.

### `POST /api/bookings`

**Purpose:** Validate and persist a booking request. The unique `startsAt` database constraint rejects concurrent submissions for the same exact instant, but different overlapping start times are not currently detected.

**Request fields from PDF:** `name`, `mobile`, `shootType`, `dateTime`, `location`, `requirements`.

**Response:**

- `201 Created` with a non-sensitive generated booking reference (`SF-000001`) and start time.
- `400 Bad Request` for invalid fields.
- `409 Conflict` with a `dateTime` field error if the exact start time was booked before the insert completed.
- `500`/service failure response for unexpected server errors, without leaking internals.

The booking row and reference number are persisted together. A unique PostgreSQL constraint on `startsAt` arbitrates simultaneous submissions; the preliminary availability check is not relied on for race safety. The confirmation view says the request was received, not that the appointment was accepted or confirmed.

### `POST /api/enquiries`

**Purpose:** Validate and persist a general enquiry.

**Current demo request fields:** `name`, optional `email`, optional `mobile`, and `message`. At least one valid contact value is required. The exact production form contract still needs client approval.

**Response:** `201 Created` with the persisted enquiry's `id` and `createdAt`; no personal fields are echoed to the browser. Invalid submissions receive a `400` response.

### `GET /api/price-catalogue`

Returns an attached PDF generated from the centralized demo studio, service, and base pricing configuration. It does not access the database.

## Static/config-driven V1 content

- Home content, banners, offers, services, reviews, gallery metadata, demo branding, and contact details may be configuration/static content.
- Frame and album option/price configuration may be loaded from the server/client bundle and calculated in the configurator. The PDF does not require a pricing endpoint.
- Studio identity, contact details, services, reviews, gallery metadata, and pricing options are maintained in `src/config/studio.config.ts`; the demo catalogue is generated from this configuration to avoid duplicating prices.
- Privacy Policy and Terms are pages, not API resources.

## Validation and security behavior

- Validate all request bodies server-side; the same field rules are also used by the browser for early feedback.
- Restrict accepted values and lengths when the client supplies definitive field rules.
- Enforce the unique `startsAt` database constraint to prevent concurrent identical-instant submissions. A preliminary availability check is informational and does not replace the constraint.
- Never return other visitors' booking details from availability responses.
- Do not log request bodies containing personal data by default; do not expose database errors, credentials, or stack traces to clients.
- Add abuse controls (such as rate limiting) as an implementation recommendation, to be confirmed against deployment constraints.
- No authentication is proposed for public V1 form endpoints. Admin authentication is a V2 feature.
- No upload, cart, checkout, order, status-lookup, or notification endpoints in V1.

## Version 2 endpoint families (deferred; not V1 commitments)

The PDF's V2 features imply future APIs for authentication/roles, dashboard data, gallery/services/frame/album/product management, booking management, cart/checkout/orders, customer history, enquiry responses, studio settings, private photo uploads/downloads, tracking, and notifications. Their routes, authorization, payloads, and status transitions are intentionally not specified here.

## Open contract decisions

- Define booking slot identity, timezone, duration/overlap, hours, buffers, blackout dates, and availability query shape.
- Define booking confirmation semantics and any booking statuses.
- Define the production required/optional fields, validation rules, consent text, and response expectations for booking and enquiry forms.
- Decide whether the browser needs live pricing from an API or static/configured pricing is sufficient.
- Confirm required legal/consent messaging and data-retention behavior.
