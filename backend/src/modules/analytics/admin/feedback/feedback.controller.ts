import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../../config/database";
import { CaseStatus } from "../../../../../generated/prisma/client";


export const getCaseFeedbackAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eligibleStatuses = [CaseStatus.RESOLVED, CaseStatus.CUSTOMER_CONFIRMATION, CaseStatus.CLOSED];

    const [totalEligibleCases, casesWithFeedback] = await prisma.$transaction([
      prisma.caseReport.count({
        where: { status: { in: eligibleStatuses } }
      }),
      prisma.caseReport.count({
        where: {
          status: { in: eligibleStatuses },
          feedback: { isNot: null } as any
        }
      })
    ]);

    const trackingRecords = await prisma.caseReport.findMany({
      where: {
        status: { in: eligibleStatuses },
        feedback: { isNot: null } as any
      },
      select: {
        id: true,
        caseNumber: true,
        subject: true,
        resolvedAt: true,
        closedAt: true,
        feedback: {
          select: { rating: true, comment: true }
        },
        assignedSupport: {
          select: {
            id: true,
            firstName: true,
            middleName: true
          }
        }
      } as any,
      orderBy: { closedAt: "desc" }
    });

    let totalRatingSum = 0;
    let scoredReviewsCount = 0;
    
    const feedbackList = trackingRecords.map((record: any) => {
      const ratingVal = record.feedback?.rating;
      if (typeof ratingVal === "number") {
        totalRatingSum += ratingVal;
        scoredReviewsCount++;
      }

      return {
        caseId: record.id,
        caseNumber: record.caseNumber,
        subject: record.subject,
        closedAt: record.closedAt || record.resolvedAt,
        assignedAgent: record.assignedSupport 
          ? `${record.assignedSupport.firstName} ${record.assignedSupport.middleName}`
          : "Unassigned / Automated System",
        rating: ratingVal ?? "No Score Provided",
        comment: record.feedback?.comment || ""
      };
    });

    const feedbackSubmissionRate = totalEligibleCases > 0
      ? parseFloat(((casesWithFeedback / totalEligibleCases) * 100).toFixed(2))
      : 0;

    const averageCustomerScore = scoredReviewsCount > 0
      ? parseFloat((totalRatingSum / scoredReviewsCount).toFixed(2))
      : null;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalClosedCases: totalEligibleCases,
          casesWithFeedbackReceived: casesWithFeedback,
          feedbackSubmissionRatePercentage: feedbackSubmissionRate,
          averageSatisfactionScore: averageCustomerScore
        },
        reviews: feedbackList
      }
    });
  } catch (error:any) {
    // Defensive fallback for Prisma schema mismatches (e.g., missing customerFeedback/feedback fields)
    if (error?.code === 'P2022' || /Unknown argument `customerFeedback`/.test(error?.message || '')) {
      try {
        console.warn('[getCaseFeedbackAnalytics] primary query failed, returning best-effort feedback data:', error?.message || error);

        const eligibleStatuses = [CaseStatus.RESOLVED, CaseStatus.CUSTOMER_CONFIRMATION, CaseStatus.CLOSED];
        const totalClosedCases = await prisma.caseReport.count({ where: { status: { in: eligibleStatuses } } });

        const casesWithFeedback = await prisma.caseReport.count({
          where: {
            status: { in: eligibleStatuses },
            feedback: { isNot: null } as any,
          },
        });

        const trackingRecords = await prisma.caseReport.findMany({
          where: { status: { in: eligibleStatuses }, feedback: { isNot: null } as any },
          select: {
            id: true,
            caseNumber: true,
            subject: true,
            resolvedAt: true,
            closedAt: true,
            rating: true,
            assignedSupport: { select: { id: true, firstName: true, middleName: true } }
          },
          orderBy: { closedAt: 'desc' }
        });

        let totalRatingSum = 0;
        let scoredReviewsCount = 0;

        const feedbackList = trackingRecords.map((record: any) => {
          if (record.rating && typeof record.rating === 'number') {
            totalRatingSum += record.rating;
            scoredReviewsCount++;
          }

          return {
            caseId: record.id,
            caseNumber: record.caseNumber,
            subject: record.subject,
            closedAt: record.closedAt || record.resolvedAt,
            assignedAgent: record.assignedSupport ? `${record.assignedSupport.firstName} ${record.assignedSupport.middleName}` : 'Unassigned / Automated System',
            rating: record.rating || 'No Score Provided',
            comment: ''
          };
        });

        const feedbackSubmissionRate = totalClosedCases > 0 ? parseFloat(((casesWithFeedback / totalClosedCases) * 100).toFixed(2)) : 0;
        const averageCustomerScore = scoredReviewsCount > 0 ? parseFloat((totalRatingSum / scoredReviewsCount).toFixed(2)) : null;

        return res.status(200).json({
          success: true,
          data: {
            summary: {
              totalClosedCases: totalClosedCases,
              casesWithFeedbackReceived: casesWithFeedback,
              feedbackSubmissionRatePercentage: feedbackSubmissionRate,
              averageSatisfactionScore: averageCustomerScore
            },
            reviews: feedbackList,
            warning: 'Returned best-effort feedback data due to internal schema mismatch.'
          }
        });
      } catch (fallbackErr) {
        return next(fallbackErr);
      }
    }

    return next(error);
  }
};