-- Backfill script for case_report_status_histories after adding actorType and actorId columns
-- Run this AFTER applying Prisma migration that adds actorType and actorId fields to CaseStatusHistory.

BEGIN;

-- 1) Set actorType='STAFF' and actorId=changedById for rows where changedById references an existing staff
UPDATE case_report_status_histories h
SET actorType = 'STAFF', actorId = h.changedById
FROM staffs s
WHERE h.changedById IS NOT NULL AND s.id = h.changedById;

-- 2) For rows where changedById points to a non-existent staff (likely customer ids), treat them as CUSTOMER
UPDATE case_report_status_histories h
SET actorType = 'CUSTOMER', actorId = h.changedById, changedById = NULL
WHERE h.changedById IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM staffs s WHERE s.id = h.changedById);

-- 3) Optionally, set actorType='SYSTEM' for rows where changedById equals the known SYSTEM_BOT_ID
-- Replace the SYSTEM_BOT_ID value below if different.
UPDATE case_report_status_histories
SET actorType = 'SYSTEM', actorId = NULL
WHERE changedById = '00000000-0000-0000-0000-000000000000';

COMMIT;

-- After running, verify with:
-- SELECT id, caseReportId, changedById, actorType, actorId, fromStatus, toStatus, createdAt
-- FROM case_report_status_histories
-- WHERE caseReportId = '<CASE_ID>'
-- ORDER BY createdAt ASC;
