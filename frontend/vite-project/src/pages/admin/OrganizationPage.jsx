import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    LayoutGrid,
    Search,
} from "lucide-react";

import { OrganizationApi } from "../../api/organizationApi";

import AdminPageHero from "../../components/admin/AdminPageHero";

import OrganizationStatistics from "../../components/organization/OrganizationStatistics";
import OrganizationForm from "../../components/organization/OrganizationForm";
import OrganizationTable from "../../components/organization/OrganizationTable";
import OrganizationSearch from "../../components/organization/OrganizationSearch";
import EmptyOrganization from "../../components/organization/EmptyOrganization";

export default function OrganizationPage() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadOrganizations();
    }, []);

    async function loadOrganizations() {
        try {
            setLoading(true);

            const response = await OrganizationApi.getAll();
            const list = response.data.data || [];

            setOrganizations(list);

            window.localStorage.setItem(
                "partner_support_organizations",
                JSON.stringify(list)
            );

            window.dispatchEvent(
                new CustomEvent("organizations:updated", {
                    detail: list,
                })
            );
        } catch (error) {
            console.log("Load organizations error", error);
        } finally {
            setLoading(false);
        }
    }

    async function createOrganization(data) {
        try {
            await OrganizationApi.create(data);
            await loadOrganizations();
        } catch (error) {
            console.log("Create organization error", error);
            throw error;
        }
    }

    async function deactivateOrganization(id) {
        try {
            await OrganizationApi.deactivate(id);
            await loadOrganizations();
        } catch (error) {
            console.log("Deactivate organization error", error);
        }
    }

    async function reactivateOrganization(id) {
        try {
            await OrganizationApi.reactivate(id);
            await loadOrganizations();
        } catch (error) {
            console.log("Reactivate organization error", error);
        }
    }

    const filteredOrganizations = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return organizations;
        }

        return organizations.filter((item) =>
            item.name?.toLowerCase().includes(query)
        );
    }, [organizations, search]);

    /* =========================================================
       LOADING
    ========================================================= */
    if (loading) {
        return (
            <div className="space-y-7">
                <div className="relative overflow-hidden rounded-[24px] border border-[#dce4ee] bg-[#0b1b33] px-6 py-8 sm:px-8">
                    <div className="space-y-4">
                        <div className="h-2.5 w-24 rounded bg-white/10" />
                        <div className="h-9 w-80 max-w-full rounded bg-white/15" />
                        <div className="h-4 w-[420px] max-w-full rounded bg-white/10" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>

                <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-7">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}
                        <AdminPageHero
              eyebrow="Administration"
              title="Organization Management"
              description="Create, manage, and monitor customer organizations from one centralized workspace."
              icon={Building2}
              right={
                <div className="w-full sm:w-[350px]">
                  <OrganizationSearch search={search} setSearch={setSearch} />
                </div>
              }
            />

            {/* =====================================================
                STATISTICS
            ===================================================== */}
            <OrganizationStatistics
                organizations={organizations}
            />

            {/* =====================================================
                CREATE ORGANIZATION
            ===================================================== */}
            <OrganizationForm
                onSubmit={createOrganization}
            />

            {/* =====================================================
                ORGANIZATION DIRECTORY HEADER
            ===================================================== */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-slate-500" />

                        <h2 className="text-base font-semibold text-slate-900">
                            Organization Directory
                        </h2>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                        {search ? (
                            <>
                                Showing{" "}
                                <span className="font-semibold text-slate-600">
                                    {filteredOrganizations.length}
                                </span>{" "}
                                matching organization
                                {filteredOrganizations.length === 1
                                    ? ""
                                    : "s"}
                            </>
                        ) : (
                            <>
                                {organizations.length} organization
                                {organizations.length === 1
                                    ? ""
                                    : "s"}{" "}
                                registered in the system
                            </>
                        )}
                    </p>
                </div>

                {search && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Search className="h-3.5 w-3.5" />

                        <span>
                            Search results for{" "}
                            <span className="font-semibold text-slate-600">
                                "{search}"
                            </span>
                        </span>
                    </div>
                )}
            </div>

            {/* =====================================================
                ORGANIZATIONS
            ===================================================== */}
            {filteredOrganizations.length === 0 ? (
                <EmptyOrganization />
            ) : (
                <OrganizationTable
                    organizations={filteredOrganizations}
                    onDeactivate={deactivateOrganization}
                    onReactivate={reactivateOrganization}
                />
            )}
        </div>
    );
}
