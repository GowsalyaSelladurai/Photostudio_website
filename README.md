# StudioFrame

A Version 1 photography-studio website foundation built with Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

> **Demo mode:** Studio identity, images, reviews, services, prices, contact details, and legal copy are placeholders. Sample prices are USD and for demonstration only. Replace them with studio-approved information before launch.

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL for booking and enquiry persistence

## Install and configure

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set `DATABASE_URL` to a PostgreSQL connection string for a database you control. Keep the actual credentials private and never commit `.env`.

Generate and check the Prisma client/schema:

```powershell
npm run db:generate
npm run db:validate
```

When PostgreSQL is configured, create and apply the initial migration:

```powershell
npm run db:migrate
```

This command requires a reachable database. It is not run automatically during setup. Do not run a database reset command against existing data.

## Run locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
```

The production build generates the Prisma client but does not connect to PostgreSQL. Booking availability, booking submission, and enquiry submission require a configured PostgreSQL database and applied migration. A successful build alone does **not** mean database integration is connected or tested.

## V1 routes

- `/` — Home and shared site layout
- `/gallery` — Demo gallery, category filters, lightbox, and editing comparison
- `/services` — Demo service packages and starting prices
- `/frames`, `/albums` — Sample live price configurators
- `/booking` — Booking request form
- `/about`, `/contact` — Demo studio information and enquiry form
- `/privacy`, `/terms` — Clearly marked sample legal drafts
- `/api/availability?dateTime=<ISO date-time>` — Checks exact start-time availability
- `POST /api/bookings` — Validates and stores a booking, returning its generated `SF-000001` reference; concurrent requests for the same exact start time receive `409 Conflict`.
- `POST /api/enquiries` — Validates and stores an enquiry
- `/api/price-catalogue` — Generates a downloadable sample PDF from the central demo configuration

The booking confirmation shows that the request was received, not that the appointment was approved. The database constraint prevents duplicate exact start times, including simultaneous submissions. It does not prevent overlapping sessions of different lengths; duration, studio timezone, operating hours, and approval policy still require client decisions.

## Configuration and project layout

Replace demo branding and content in `src/config/studio.config.ts`. This includes the studio name, contact placeholders, location, catalogue path, services, gallery entries, reviews, and sample frame/album prices.

```text
prisma/
  schema.prisma
public/
  # static assets only
src/
  app/                 App Router pages, icon, and Route Handlers
  components/          Layout, forms, gallery, pricing, and UI
  config/              Central demo studio branding and content
  lib/                 Prisma client, validation, formatting, API errors
  services/             Booking/enquiry persistence and catalogue generation
  types/                Shared content types
```

## Database status

The Prisma schema and initial migration are present. The migration was verified against an isolated temporary PostgreSQL test cluster, which was removed after testing. No target database is configured or migrated. Set `DATABASE_URL` privately and apply the migration before using persistent APIs in the target environment.

## Scope boundary

Only the public Version 1 website and starter booking/enquiry APIs are included. Admin authentication, dashboard, content management, cart/checkout, orders, customer accounts, uploads, tracking, and notifications remain Version 2 and are not implemented.
