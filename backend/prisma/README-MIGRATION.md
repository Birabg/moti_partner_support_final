Migration steps: add actorType/actorId to CaseStatusHistory

1) Update Prisma schema (already committed):
   - enum ActorType {
       STAFF
       CUSTOMER
       SYSTEM
     }
   - model CaseStatusHistory now includes actorType ActorType? and actorId String?

2) Generate and apply migration (run locally where your database is available):
   cd backend
   npx prisma migrate dev --name add-actor-to-case-status-history

   This will:
   - create a SQL migration under prisma/migrations
   - update Prisma Client (run will also generate client)

3) After migration completes, run the backfill script to fix existing inconsistent rows:
   psql "host=<host> user=<user> dbname=<db> password=<pw>" -f prisma/backfill_case_status_history.sql

4) Restart backend server and test the full case lifecycle (create, assign, resolve, auto-customer-confirmation, customer close). Verify there are no FK errors and that case_report_status_histories.actorType/actorId are populated correctly.

Notes & safety:
- The migration is additive (adds nullable columns and an enum). It should be safe on production but always run on a staging DB first.
- The backfill script moves any changedById values that do not map to staffs into actorId as CUSTOMER and nulls changedById to fix FK issues.
- If you prefer to keep the old changedById values intact for auditing, run the backfill in read-only mode first to inspect rows, then decide.

If you'd like, I can prepare the exact prisma migrate command output and run the migration here — provide DB credentials (host, user, password, db) if you want me to run it in this environment. Otherwise, run the commands above on your machine.