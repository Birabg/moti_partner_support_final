import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../../config/database";


export const getOrganizationAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgClient = (prisma as any).organization || (prisma as any).company;

    if (!orgClient) {
      return res.status(200).json({
        success: true,
        data: { totalOrganizationsCount: 0, organizations: [], note: "Organization model schema links missing." }
      });
    }

    const organizations = await orgClient.findMany({
  include: {
    emailDomains: true, 
    customers: {
      select: {
        id: true,
        cases: { 
          select: {
            id: true,
            status: true
          }
        }
      }
    }
  },
  orderBy: {
    name: "asc"
  }
});

    const orgDetails = organizations.map((org: any) => {
      const cases = (org.customers || []).flatMap((customer: any) => customer.cases || []);
      const activeCases = cases.filter((c: any) => c.status !== "CLOSED").length || 0;
      const closedCases = cases.filter((c: any) => c.status === "CLOSED").length || 0;

      return {
        id: org.id,
        name: org.name,
        code: org.code || null,
        isActive: org.isActive ?? true,
        createdAt: org.createdAt,
        metrics: {
          associatedUsersCount: org.customers?.length || 0,
          totalCasesCount: cases.length || 0,
          activeCasesCount: activeCases,
          closedCasesCount: closedCases,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalOrganizationsCount: organizations.length,
        organizations: orgDetails
      }
    });
  } catch (error) {
    next(error);
  }
};



export const getProductCatalogAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryClient = (prisma as any).productCategory || (prisma as any).category;

    if (!categoryClient) {
      return res.status(200).json({
        success: true,
        data: { totalCategoriesCount: 0, categories: [], note: "Product Category model parameters not verified." }
      });
    }

    const categories = await categoryClient.findMany({
      include: {
        subcategories: {
          include: {
            cases: {
          select: {
            id: true
          }
        }
          }
        }
      } as any,
      orderBy: { name: "asc" }
    });

    const categoryTree = categories.map((cat: any) => {
      const subcategoriesData = (cat.subcategories || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        code: sub.code || null,
        isActive: sub.isActive ?? true,
        metrics: {
          linkedCasesVolume: sub.caseReports?.length || 0
        }
      }));

      const combinedHistoricalCaseTotal = subcategoriesData.reduce(
        (acc: number, item: any) => acc + item.metrics.linkedCasesVolume, 0
      );

      return {
        id: cat.id,
        name: cat.name,
        code: cat.code || null,
        isActive: cat.isActive ?? true,
        metrics: {
          totalSubcategoriesCount: subcategoriesData.length,
          totalCategoryImpactCasesCount: combinedHistoricalCaseTotal
        },
        subcategories: subcategoriesData
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalCategoriesCount: categories.length,
        categories: categoryTree
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationListForDirector = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgClient = (prisma as any).organization || (prisma as any).company;

    if (!orgClient) {
      return res.status(200).json({ success: true, data: [] });
    }

    const organizations = await orgClient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        emailDomains: true,
        _count: {
          select: { customers: true },
        },
      },
    });

    return res.status(200).json({ success: true, data: organizations });
  } catch (error) {
    next(error);
  }
};