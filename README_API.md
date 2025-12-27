# Minimal Property API (scaffold)

This repo includes a simple API scaffold and prefers Supabase for production property storage and syncing with on-chain events.

## Quick start (Supabase)

1. Copy `.env.example` to `.env.local` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_API_KEY`.
2. Start dev server:

   npm run dev

3. Use the admin endpoint to upsert a property (protected by `ADMIN_API_KEY` header):

   POST /api/properties
   Headers: x-api-key: <ADMIN_API_KEY>
   Body: JSON with at least: { slug, title, city, latLng, status, render }

Supabase workflow (recommended):

- Create the `properties` table in Supabase using the SQL in `migrations/001_create_properties_table.sql` (if you want hosted persistence).
- Seed initial data from local file (TypeScript scripts):

   # install dev deps if you don't have them
   npm i -D ts-node typescript @types/node

   # run the importer (uses the service role key in your `.env.local`)
   npx ts-node-esm ./scripts/importToSupabase.ts

- Run the sync script to verify images and update on-chain prices:

   # run the sync (reads SUPABASE_* and ETH_RPC from `.env.local`)
   npx ts-node-esm ./scripts/syncSupabase.ts

Notes: You may also run these scripts from a scheduled runner (Supabase Scheduled Functions, Cron, or GitHub Actions). If you prefer not to install ts-node, you can port the scripts to JS or run them from a serverless function. The Supabase SQL in `migrations/001_create_properties_table.sql` can be executed directly in the Supabase SQL editor if you prefer a UI-based migration.

Notes:
- The `app/api/sb/properties` endpoints provide a Supabase backed CRUD API (protected admin POST/DELETE via `x-api-key`).
- Use Supabase scheduled functions or a cron job to run `syncSupabase.ts` periodically for fresh prices and image verification.

## Notes
- This is a minimal scaffold for prototyping. For production:
  - Use The Graph or a robust event listener for on-chain data.
  - Add validation, tests, RBAC, rate limits, and monitoring.
  - Consider using a hosted DB and queued workers for reconciliation.
