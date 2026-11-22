# Pulse News

Pulse is a German-language, reader-supported news platform designed around verified reporting, editorial context, source transparency and voluntary donations.

## Stack
- Next.js App Router, React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL with Prisma
- RSS ingestion that creates unpublished drafts
- Protected editorial status API
- Stripe Checkout and signed webhook handling

## Local setup
1. Install Node.js 22+ and PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to your PostgreSQL connection string.
4. Run `npm install`.
5. Run `npx prisma generate`.
6. Run `npx prisma migrate dev --name init`.
7. Run `npm run dev`.

## News ingestion
Configure `NEWS_FEEDS` as semicolon-separated entries in this format:

```
NEWS_FEEDS="Publisher One|https://publisher.example|https://publisher.example/rss.xml;Publisher Two|https://publisher-two.example|https://publisher-two.example/feed"
```

Run `npm run news:ingest`, or call `POST /api/ingest` with `Authorization: Bearer $NEWS_INGEST_SECRET`.

Imported stories are always created as `DRAFT`. The ingestion process stores the source link and does not automatically republish full third-party articles. Editors must verify, rewrite and approve each story before publication.

## Editorial workflow
Use `PATCH /api/editor/articles/{id}` with `Authorization: Bearer $EDITOR_API_SECRET` and a JSON body such as:

```json
{ "status": "IN_REVIEW" }
```

Allowed states are `IN_REVIEW`, `PUBLISHED`, and `ARCHIVED`. Publication is blocked unless at least one source is attached. This is a protected API foundation; a full authenticated editorial dashboard and staff account management are still required before newsroom use.

## Donations
Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `NEXT_PUBLIC_SITE_URL`. Configure a Stripe webhook pointing to `/api/donations/webhook` for `checkout.session.completed` and `checkout.session.expired`. Donations use hosted Stripe Checkout; the application never handles card details.

Configure the Stripe Customer Portal in the Stripe dashboard before accepting recurring support. The confirmation page exposes a session-bound portal link at `/api/donations/portal` so supporters can manage or cancel monthly support. Test cancellation and webhook status changes in Stripe test mode first.

## Production checklist
- Provision PostgreSQL and run Prisma migrations.
- Configure and validate licensed/authorized RSS sources.
- Set strong independent ingestion and editorial secrets.
- Connect Stripe and verify payment/webhook flows in test mode.
- Add authenticated journalist/editor/admin accounts and a protected editorial UI.
- Add double-opt-in newsletter delivery and unsubscribe handling before collecting subscribers.
- Add privacy, imprint, cookie and donation/legal pages appropriate to the operating entity.
- Add monitoring, backups, retention policies, rate limiting and incident procedures.
- Replace the clearly labeled demo homepage stories with the live editorial feed.

## Editorial principles
- Distinguish verified facts, allegations, analysis and opinion.
- Preserve source links and publication timestamps.
- Do not publish AI-generated claims without editorial verification.
- Keep a correction trail for published reporting.
- Make reader support voluntary; never use guilt or fabricated urgency.

## Status
The repository now contains a working application foundation, responsive editorial homepage, database schema, draft-only RSS importer, protected publishing endpoint, article source pages and Stripe checkout/webhook integration. It is not yet a production newsroom: external services, credentials, authenticated staff tooling, legal pages and operational safeguards must be configured and tested.
