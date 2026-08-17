"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationListForDirector = exports.getProductCatalogAnalytics = exports.getOrganizationAnalytics = void 0;
const database_1 = require("../../../../config/database");
const getOrganizationAnalytics = async (req, res, next) => {
    try {
        const orgClient = database_1.prisma.organization || database_1.prisma.company;
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
        const orgDetails = organizations.map((org) => {
            const cases = (org.customers || []).flatMap((customer) => customer.cases || []);
            const activeCases = cases.filter((c) => c.status !== "CLOSED").length || 0;
            const closedCases = cases.filter((c) => c.status === "CLOSED").length || 0;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationAnalytics = getOrganizationAnalytics;
const getProductCatalogAnalytics = async (req, res, next) => {
    try {
        const categoryClient = database_1.prisma.productCategory || database_1.prisma.category;
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
            },
            orderBy: { name: "asc" }
        });
        const categoryTree = categories.map((cat) => {
            const subcategoriesData = (cat.subcategories || []).map((sub) => ({
                id: sub.id,
                name: sub.name,
                code: sub.code || null,
                isActive: sub.isActive ?? true,
                metrics: {
                    linkedCasesVolume: sub.caseReports?.length || 0
                }
            }));
            const combinedHistoricalCaseTotal = subcategoriesData.reduce((acc, item) => acc + item.metrics.linkedCasesVolume, 0);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProductCatalogAnalytics = getProductCatalogAnalytics;
const getOrganizationListForDirector = async (req, res, next) => {
    try {
        const orgClient = database_1.prisma.organization || database_1.prisma.company;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationListForDirector = getOrganizationListForDirector;
