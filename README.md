# Pulse News

A reader-supported, German-language digital news platform focused on verified reporting, context, source transparency and a calm editorial experience.

## Stack
- Next.js App Router, React and TypeScript
- Tailwind CSS
- PostgreSQL with Prisma
- RSS ingestion foundation
- Stripe donation integration (requires account credentials)

## Getting started
1. Install Node.js 20.9+ and PostgreSQL.
2. Copy `.env.example` to `.env` and configure `DATABASE_URL`.
3. Run `npm install`.
4. Run `npx prisma generate` and `npx prisma migrate dev --name init`.
5. Run `npm run dev`.

## Editorial principles
- Distinguish verified facts, allegations, analysis and opinion.
- Preserve source links and publication timestamps.
- Do not publish AI-generated claims without editorial verification.
- Keep a correction trail for published reporting.
- Make reader support voluntary; never use guilt or fabricated urgency.

## Current implementation status
This repository is the application foundation. Live source ingestion, editorial workflows, account authentication, and payment processing require additional implementation and configuration before production use. The demo homepage must not be mistaken for live reporting.