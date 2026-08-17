-- Verification queries to run before and after the backfill/migration
-- Replace schema and table names if different in your DB.

-- 1) Count total history rows
SELECT COUNT(*) AS total_history_rows FROM case_report_status_histories;

-- 2) Find rows where changedById is not null but does not reference an existing staff
SELECT h.id, h.case_report_id, h.status, h.changed_by_id
FROM case_report_status_histories h
LEFT JOIN staff s ON h.changed_by_id = s.id
WHERE h.changed_by_id IS NOT NULL AND s.id IS NULL;

-- 3) Rows that look like system bot
SELECT COUNT(*) AS system_bot_rows
FROM case_report_status_histories
WHERE changed_by_id = '00000000-0000-0000-0000-000000000000';

-- 4) Count rows already having actorType/actorId populated (after migration/backfill)
SELECT actorType, COUNT(*) FROM case_report_status_histories GROUP BY actorType;

-- 5) For a specific case, examine the status history ordered
-- Replace :CASE_ID with the target case id
-- e.g. '\\x' mode in psql for expanded output may help
SELECT id, case_report_id, status, changed_at, changed_by_id, actor_type, actor_id
FROM case_report_status_histories
WHERE case_report_id = ':CASE_ID'
ORDER BY changed_at ASC;

-- 6) Find any rows where actorType = 'STAFF' but actor_id not equal to changedById
SELECT id, changed_by_id, actor_type, actor_id
FROM case_report_status_histories
WHERE actor_type = 'STAFF' AND (actor_id IS DISTINCT FROM changed_by_id);

-- 7) Quick sanity: rows where actorType is null (should be zero after backfill)
SELECT COUNT(*) FROM case_report_status_histories WHERE actor_type IS NULL;

-- 8) List distinct statuses for a given case
SELECT DISTINCT status FROM case_report_status_histories WHERE case_report_id = ':CASE_ID' ORDER BY 1;

-- End of verification queries
