
# AGENTS.md – StudioFrame

## Project Identity
Project Name: StudioFrame
Project Type: Photography Studio Website
Current Phase: Version 1
Future Phase: Version 2 – Admin Portal and E-Commerce

## Primary Requirement Source
The original client requirement document is:

docs/Photo_Studio_Requirement_Document.pdf

IMPORTANT:
- Always refer to the original requirement document before implementing features.
- Treat the client requirement document as the primary source of truth.
- Do not silently remove or change any specified feature.
- If requirements are unclear, ask before making major assumptions.
- Maintain a REQ­UIREMENTS.md file with extracted requirements.

## Technology Stack
- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Next.js Route Handlers for APIs

Do not introduce another frontend framework or separate backend framework without approval.

## Development Scope

### Version 1 – Current Scope
Build the public photography studio website.

Features:
1. Home
2. Gallery
3. Services
4. Frames and Albums
5. Booking
6. About
7. Contact

Also implement:
- Responsive layouts
- Dynamic frame pricing
- Dynamic album pricing
- Booking form validation
- Booking persistence
- Enquiry persistence
- No double-booking protection
- WhatsApp and call interface
- Downloadable price catalogue
- Privacy Policy and Terms pages
- Demo studio branding and sample content

### Version 2 – Future Scope
Do not implement now.

Future modules:
- Admin authentication
- Admin dashboard
- Gallery management
- Service management
- Frame management
- Album management
- Product management
- Booking management
- Order management
- Customer management
- Enquiry management
- Studio settings
- Cart and checkout
- Customer photo uploads
- Notifications

Keep Version 1 architecture extensible for these modules.

## Branding Rules
Actual client details are not available yet.

Use configurable demo details:
- Demo studio name
- Text-based dummy logo
- Sample gallery images
- Sample services
- Sample reviews
- Clearly marked placeholder contact details
- Sample studio address

Do not invent real client information.
Do not use an actual person's phone number or email.
Keep all studio information in:
src/config/studio.config.ts

## Coding Standards
- Use TypeScript.
- Use reusable React components.
- Follow clean folder organization.
- Use server components by default.
- Use client components only when interaction requires them.
- Keep database operations in service modules.
- Keep API routes separate from UI components.
- Validate all user input.
- Use environment variables for secrets.
- Never hardcode database credentials.
- Use soft deletes where applicable.
- Never expose private customer-uploaded images publicly.

## Database Rules
- PostgreSQL is the primary database.
- Prisma manages database models and migrations.
- Never delete or reset existing data without explicit approval.
- Maintain database migration history.
- Add suitable unique constraints and indexes.
- Prevent duplicate booking slots.

## Design Standards
- Professional photography studio appearance.
- Modern, elegant, premium visual style.
- Mobile-first responsive design.
- High-quality photography presentation.
- Smooth transitions and subtle animations.
- Consistent typography and spacing.
- Accessible buttons, forms and navigation.

## Codex Working Rules
1. Read this file before starting work.
2. Read the original client PDF and REQU­IREMENTS.md.
3. Inspect existing code before modifying it.
4. Do not overwrite existing working functionality unnecessarily.
5. Work feature by feature.
6. Explain the files you create or modify.
7. Run appropriate tests and build checks.
8. Fix errors introduced by your changes.
9. Update README.md when setup instructions change.
10. Update PROJECT_PLAN.md and DECISIONS.md when significant decisions change.
11. Do not start Version 2 unless explicitly instructed.
12. Ask for approval before destructive database or deployment operations.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
