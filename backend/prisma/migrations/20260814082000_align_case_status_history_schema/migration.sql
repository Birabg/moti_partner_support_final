DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'case_report_status_histories'
      AND column_name = 'oldStatus'
  ) THEN
    ALTER TABLE "case_report_status_histories"
      ADD COLUMN IF NOT EXISTS "fromStatus" "CaseStatus",
      ADD COLUMN IF NOT EXISTS "toStatus" "CaseStatus",
      ADD COLUMN IF NOT EXISTS "reason" TEXT,
      ADD COLUMN IF NOT EXISTS "note" TEXT,
      ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

    UPDATE "case_report_status_histories"
    SET "fromStatus" = "oldStatus",
        "toStatus" = "newStatus",
        "createdAt" = COALESCE("changedAt", NOW())
    WHERE "fromStatus" IS NULL AND "oldStatus" IS NOT NULL;

    ALTER TABLE "case_report_status_histories"
      ALTER COLUMN "fromStatus" DROP NOT NULL,
      ALTER COLUMN "toStatus" DROP NOT NULL;

    ALTER TABLE "case_report_status_histories"
      DROP COLUMN IF EXISTS "oldStatus",
      DROP COLUMN IF EXISTS "newStatus",
      DROP COLUMN IF EXISTS "changedAt";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'case_report_status_histories'
      AND column_name = 'fromStatus'
  ) THEN
    ALTER TABLE "case_report_status_histories"
      ALTER COLUMN "fromStatus" SET NOT NULL,
      ALTER COLUMN "toStatus" SET NOT NULL;
  END IF;
END $$;
