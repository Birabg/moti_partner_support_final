import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../config/database";
import { CaseStatus } from "../../../../generated/prisma/client";

export const getCustomerCaseloadAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customersData = await prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        cases: {
          select: {
            id: true,
            status: true,
            feedback: { select: { rating: true } }
          }
        }
      } as any,
      orderBy: { lastName: "asc" }
    });

    const customerProfiles = customersData.map((cust: any) => {
      const cases = cust.cases || [];
      const totalCases = cases.length;
      
      const inProgressCount = cases.filter((c: any) => c.status === CaseStatus.IN_PROGRESS).length;
      const closedCount = cases.filter((c: any) => c.status === CaseStatus.CLOSED).length;
      
      const ratedCases = cases.filter((c: any) => c.status === CaseStatus.CLOSED && typeof (c.feedback?.rating) === "number");
      const totalScoreSum = ratedCases.reduce((sum: number, c: any) => sum + (c.feedback?.rating || 0), 0);
      const averageFeedbackScore = ratedCases.length > 0 
        ? parseFloat((totalScoreSum / ratedCases.length).toFixed(2)) 
        : null; 

      return {
        customerId: cust.id,
        name: `${cust.firstName} ${cust.lastName}`,
        email: cust.email,
        metrics: {
          totalCasesCreated: totalCases,
          inProgressCasesCount: inProgressCount,
          closedCasesCount: closedCount,
          averageFeedbackScoreRating: averageFeedbackScore
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: customerProfiles
    });
  } catch (error) {
    next(error);
  }
};


export const getPSSupportPerformanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staffData = await prisma.staff.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isPSsupport: true,
        assignedCases: {
          select: {
            id: true,
            status: true,
            feedback: { select: { rating: true } }
          }
        }
      } as any,
      orderBy: { lastName: "asc" }
    });

    const supportProfiles = staffData.map((agent: any) => {
      const assignedCases = agent.assignedCases || [];
      const totalReceived = assignedCases.length;

      const inProgressCount = assignedCases.filter((c: any) => c.status === CaseStatus.IN_PROGRESS).length;
      const closedCount = assignedCases.filter((c: any) => c.status === CaseStatus.CLOSED).length;

      
      const reviewedCases = assignedCases.filter((c: any) => c.status === CaseStatus.CLOSED && typeof (c.feedback?.rating) === "number");
      const ratingScoreSum = reviewedCases.reduce((sum: number, c: any) => sum + (c.feedback?.rating || 0), 0);
      const agentAverageCsat = reviewedCases.length > 0 
        ? parseFloat((ratingScoreSum / reviewedCases.length).toFixed(2)) 
        : null;

      return {
        agentId: agent.id,
        name: `${agent.firstName} ${agent.lastName}`,
        email: agent.email,
        isPSsupport: agent.isPSsupport ?? true,
        metrics: {
          totalCasesReceived: totalReceived,
          inProgressCasesCount: inProgressCount,
          closedCasesCount: closedCount,
          averageFeedbackRatingReceived: agentAverageCsat
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: supportProfiles
    });
  } catch (error) {
    next(error);
  }
};