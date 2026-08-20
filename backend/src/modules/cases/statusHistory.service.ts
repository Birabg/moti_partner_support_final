// tx is the transaction client (prisma instance or tx inside $transaction)
export async function createStatusHistory(tx: any, payload: {
  caseReportId: string;
  changedById?: string | null;
  actorType?: string | null;
  actorId?: string | null;
  fromStatus?: any;
  toStatus?: any;
  reason?: string | null;
  note?: string | null;
  oldPriority?: any | null;
  newPriority?: any | null;
  oldAgentId?: string | null;
  newAgentId?: string | null;
  oldAgentName?: string | null;
  newAgentName?: string | null;
  resolutionSnapshot?: string | null;
}) {
  if (!tx || !payload || !payload.caseReportId) throw new Error("Invalid parameters for createStatusHistory");

  // Fetch most recent history entry for this case
  const last = await tx.caseStatusHistory.findFirst({ where: { caseReportId: payload.caseReportId }, orderBy: { createdAt: 'desc' } });

  // Simple dedupe: if last exists and all core fields match and both notes empty, skip
  if (last) {
    const fieldsMatch = (
      String(last.fromStatus || '') === String(payload.fromStatus || '') &&
      String(last.toStatus || '') === String(payload.toStatus || '') &&
      String(last.oldPriority || '') === String(payload.oldPriority || '') &&
      String(last.newPriority || '') === String(payload.newPriority || '') &&
      String(last.oldAgentId || '') === String(payload.oldAgentId || '') &&
      String(last.newAgentId || '') === String(payload.newAgentId || '') &&
      String((last.note || '').trim()) === String((payload.note || '').trim())
    );

    if (fieldsMatch) {
      // if the last record is very recent (within 5 minutes), skip creating a duplicate
      const now = Date.now();
      const lastTime = new Date(last.createdAt).getTime();
      if (isFinite(lastTime) && Math.abs(now - lastTime) < 5 * 60 * 1000) {
        return last; // skip duplicate
      }
    }
  }

  // Enrich agent names if not supplied
  let oldAgentName = payload.oldAgentName ?? null;
  let newAgentName = payload.newAgentName ?? null;

  try {
    if ((!oldAgentName || !newAgentName) && tx && typeof tx.staff !== 'undefined') {
      if (!oldAgentName && payload.oldAgentId) {
        const s = await tx.staff.findUnique({ where: { id: payload.oldAgentId }, select: { firstName: true, lastName: true } });
        if (s) oldAgentName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
      }
      if (!newAgentName && payload.newAgentId) {
        const s2 = await tx.staff.findUnique({ where: { id: payload.newAgentId }, select: { firstName: true, lastName: true } });
        if (s2) newAgentName = `${s2.firstName || ''} ${s2.lastName || ''}`.trim();
      }
    }
  } catch (e) {
    console.error('createStatusHistory: failed to enrich agent names', e);
  }

  // prefer note from payload.note, but if a resolution snapshot was provided, append it to the note so history records the resolution text
  const mergedNote = (payload.note || '').trim() || (payload.resolutionSnapshot || null);

  // Create history (include new snapshot fields)
  const created = await tx.caseStatusHistory.create({
    data: {
      caseReportId: payload.caseReportId,
      changedById: payload.changedById || null,
      actorType: payload.actorType || null,
      actorId: payload.actorId || null,
      fromStatus: payload.fromStatus as any,
      toStatus: payload.toStatus as any,
      reason: payload.reason || null,
      note: mergedNote || null,
      oldPriority: payload.oldPriority || null,
      newPriority: payload.newPriority || null,
      oldAgentId: payload.oldAgentId || null,
      newAgentId: payload.newAgentId || null,
      oldAgentName: oldAgentName || null,
      newAgentName: newAgentName || null,
      resolutionSnapshot: payload.resolutionSnapshot || null,
    },
  });

  return created;
}
