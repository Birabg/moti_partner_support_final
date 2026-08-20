import 'dotenv/config';
import { prisma } from '../src/config/database';

async function main() {
  console.log('DB URL present:', !!process.env.DATABASE_URL);

  const recentFeedbacks = await prisma.feedback.findMany({
    orderBy: { submittedAt: 'desc' },
    take: 20,
    include: {
      caseReport: {
        select: {
          id: true,
          caseNumber: true,
          subject: true,
          assignedSupportId: true,
          assignedSupport: { select: { id: true, firstName: true, lastName: true } },
          closedAt: true,
          resolvedAt: true,
        },
      },
    },
  });

  if (!recentFeedbacks || recentFeedbacks.length === 0) {
    console.log('No feedback rows found.');
  } else {
    console.log(`Found ${recentFeedbacks.length} recent feedback rows:`);
    for (const f of recentFeedbacks) {
      console.log('---');
      console.log('feedbackId:', f.id);
      console.log('caseReportId:', f.caseReportId);
      console.log('caseNumber:', f.caseReport?.caseNumber);
      console.log('rating:', f.rating);
      console.log('comment:', f.comment);
      console.log('submittedAt:', f.submittedAt?.toISOString());
      console.log('assignedSupportId:', f.caseReport?.assignedSupportId);
      console.log('assignedSupportName:', f.caseReport?.assignedSupport ? `${f.caseReport.assignedSupport.firstName} ${f.caseReport.assignedSupport.lastName||''}`.trim() : '(none)');
    }

    const caseIds = recentFeedbacks.map(f => f.caseReportId).filter(Boolean);
    const uniqueCaseIds = Array.from(new Set(caseIds));

    if (uniqueCaseIds.length > 0) {
      let histories: any[] = [];
      try {
        histories = await prisma.caseStatusHistory.findMany({
          where: { caseReportId: { in: uniqueCaseIds } },
          orderBy: { createdAt: 'desc' },
          take: 200,
        });

        console.log('\nRecent status history entries for those cases (most recent first):', histories.length);
        for (const h of histories.slice(0, 100)) {
          console.log(`- case:${h.caseReportId} ${h.fromStatus}->${h.toStatus} at ${h.createdAt.toISOString()} actorType:${h.actorType} actorId:${h.actorId} changedById:${h.changedById} note:${(h.note||'').slice(0,120)}`);
        }
      } catch (err: any) {
        console.warn('Failed to read caseStatusHistory via Prisma (schema mismatch). Falling back to introspection.', err?.message || err);
        // Introspect columns present in the table
        const cols: Array<{ column_name: string } & any> = await prisma.$queryRaw`
          SELECT column_name FROM information_schema.columns WHERE table_name = 'case_report_status_histories'
          ORDER BY ordinal_position
        ` as any;
        console.log('case_report_status_histories columns:', cols.map(c => c.column_name).join(', '));

        // Build raw select list with common columns
        // Build raw select list with common columns using actual DB column names (quoted)
        const wanted = ['caseReportId','fromStatus','toStatus','note','createdAt','actorId','changedById','id'];
        const available = cols.map(x => x.column_name);
        const selected = wanted.filter(c => available.includes(c));
        if (selected.length === 0) {
          console.log('No usable columns found on case_report_status_histories to query.');
        } else {
          const selectCols = selected.map(c => `"${c}"`).join(', ');
          const rawSql = `SELECT ${selectCols} FROM case_report_status_histories WHERE "caseReportId" = ANY($1) ORDER BY "createdAt" DESC LIMIT 200`;
          const rawHistories: any[] = await prisma.$queryRawUnsafe(rawSql, uniqueCaseIds);
          console.log('Recent status history entries (raw):', rawHistories.length);
          for (const h of rawHistories.slice(0,100)) {
            const caseIdVal = h.caseReportId || h['caseReportId'] || h['case_report_id'];
            const fromVal = h.fromStatus || h['fromStatus'] || h['from_status'];
            const toVal = h.toStatus || h['toStatus'] || h['to_status'];
            const created = h.createdAt || h['createdAt'] || h['created_at'];
            const actor = h.actorId || h['actorId'] || h['actor_id'];
            const changedBy = h.changedById || h['changedById'] || h['changed_by_id'];
            const noteVal = h.note || '';
            console.log(`- case:${caseIdVal} ${fromVal}->${toVal} at ${created} actorId:${actor} changedById:${changedBy} note:${(noteVal||'').slice(0,120)}`);
          }
        }
      }

      const notifications = await prisma.notification.findMany({
        where: { caseReportId: { in: uniqueCaseIds } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });

      console.log('\nNotifications for those cases (most recent first):', notifications.length);
      for (const n of notifications.slice(0, 200)) {
        console.log(`- notif:${n.id} recipient:${n.recipientId} type:${n.type} isRead:${n.isRead} msg:${(n.message||'').slice(0,120)} createdAt:${n.createdAt?.toISOString()}`);
      }
    }
  }

  // For each assigned support id in the feedbacks, run the same query the staff analytics uses
  const staffIds = Array.from(new Set(recentFeedbacks.map(f => f.caseReport?.assignedSupportId).filter(Boolean)));
  for (const sid of staffIds) {
    console.log(`\nSimulating staff analytics for staffId=${sid}`);
    const staffResults = await prisma.caseReport.findMany({
      where: {
        assignedSupportId: sid,
        status: { in: ['CUSTOMER_CONFIRMATION','CLOSED'] },
        feedback: { isNot: null },
      },
      select: {
        id: true,
        caseNumber: true,
        subject: true,
        closedAt: true,
        feedback: { select: { id: true, rating: true, comment: true, submittedAt: true } },
      },
      orderBy: { closedAt: 'desc' },
    });

    console.log(`Staff ${sid} has ${staffResults.length} feedback-linked closed cases (staff-analytics query)`);
    for (const r of staffResults) console.log(`- case:${r.caseNumber} rating:${r.feedback?.rating} comment:${r.feedback?.comment}`);
  }

  // Also show recently closed cases without feedback to help detect missing feedback writes
  const recentClosedNoFeedback = await prisma.caseReport.findMany({
    where: { status: 'CLOSED', feedback: null },
    orderBy: { closedAt: 'desc' },
    take: 10,
    select: { id: true, caseNumber: true, subject: true, closedAt: true, assignedSupportId: true },
  });

  console.log('\nRecently closed cases with no feedback (top 10):', recentClosedNoFeedback.length);
  for (const c of recentClosedNoFeedback) console.log(`- case:${c.caseNumber} id:${c.id} closedAt:${c.closedAt?.toISOString()} assigned:${c.assignedSupportId}`);
}

main()
  .catch((e) => {
    console.error('ERROR', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
