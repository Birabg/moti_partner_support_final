import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleOff,
    Globe2,
    Mail,
    Users,
    RefreshCw,
    Power,
} from "lucide-react";

import { OrganizationApi } from "../../api/organizationApi";

import AdminPageHero from "../../components/admin/AdminPageHero";

export default function OrganizationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadOrganization();
    }, [id]);

    async function loadOrganization() {
        try {
            setLoading(true);
            setError("");

            /*
             * We use the existing getAll() API because we already know
             * this endpoint works in your current Organization page.
             *
             * This avoids depending on an unknown getById() API method.
             */
            const response = await OrganizationApi.getAll();

            const organizations = response.data?.data || [];

            const found = organizations.find(
                (item) => String(item.id) === String(id)
            );

            if (!found) {
                setError("Organization could not be found.");
                setOrganization(null);
                return;
            }

            setOrganization(found);
        } catch (err) {
            console.log(
                "Load organization details error",
                err
            );

            setError(
                "Unable to load organization details."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleDeactivate() {
        if (!organization) return;

        try {
            setActionLoading(true);

            await OrganizationApi.deactivate(
                organization.id
            );

            await loadOrganization();
        } catch (err) {
            console.log(
                "Deactivate organization error",
                err
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReactivate() {
        if (!organization) return;

        try {
            setActionLoading(true);

            await OrganizationApi.reactivate(
                organization.id
            );

            await loadOrganization();
        } catch (err) {
            console.log(
                "Reactivate organization error",
                err
            );
        } finally {
            setActionLoading(false);
        }
    }

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="space-y-7">

                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

                <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                        />
                    ))}
                </div>

                <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error || !organization) {
        return (
            <div className="space-y-6">

                <Link
                    to="/organizations"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Organizations
                </Link>

                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <Building2 className="h-7 w-7" />
                    </div>

                    <h2 className="mt-5 text-lg font-semibold text-slate-900">
                        Organization Not Found
                    </h2>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                        {error ||
                            "The organization you are looking for does not exist or may have been removed."}
                    </p>

                    <Link
                        to="/organizations"
                        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Organizations
                    </Link>
                </div>
            </div>
        );
    }

    const customerCount =
        organization._count?.customers || 0;

    const isActive = organization.isActive;

    const createdDate = organization.createdAt
        ? new Date(
              organization.createdAt
          ).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "â€”";

    return (
        <div className="space-y-7">

            {/* =====================================================
                BREADCRUMB
            ===================================================== */}

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">

                <Link
                    to="/organizations"
                    className="text-slate-400 transition hover:text-slate-700"
                >
                    Administration
                </Link>

                <span className="text-slate-300">
                    /
                </span>

                <Link
                    to="/organizations"
                    className="text-slate-400 transition hover:text-slate-700"
                >
                    Organizations
                </Link>

                <span className="text-slate-300">
                    /
                </span>

                <span className="max-w-[220px] truncate text-slate-500">
                    {organization.name}
                </span>
            </div>

            {/* =====================================================
                BACK BUTTON
            ===================================================== */}

            <button
                type="button"
                onClick={() =>
                    navigate("/organizations")
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Organizations
            </button>

            {/* =====================================================
                ORGANIZATION HERO
            ===================================================== */}

                        <AdminPageHero
              eyebrow="Organizations"
              title={organization.name}
              description="Customer organization registered in the MOTI Partner Support Portal."
              icon={Building2}
              right={
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      isActive
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-red-400/20 bg-red-400/10 text-red-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    {isActive ? "Active" : "Inactive"}
                  </span>

                  {organization.emailDomain && (
                    <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white/70">
                      <Globe2 className="h-3.5 w-3.5 text-[#8eafd8]" />
                      {organization.emailDomain}
                    </span>
                  )}

                  <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs text-white/70">
                    <CalendarDays className="h-3.5 w-3.5 text-[#8eafd8]" />
                    Created {createdDate}
                  </span>

                  <button
                    type="button"
                    onClick={loadOrganization}
                    disabled={actionLoading}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 text-xs font-semibold text-white transition hover:bg-white/[0.14] disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>

                  {isActive ? (
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      disabled={actionLoading}
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-red-500/15 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Power className="h-3.5 w-3.5" />
                      {actionLoading
                        ? "Updating..."
                        : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReactivate}
                      disabled={actionLoading}
                      className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-400/15 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Power className="h-3.5 w-3.5" />
                      {actionLoading
                        ? "Updating..."
                        : "Reactivate"}
                    </button>
                  )}
                </div>
              }
            />

            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                    <div className="flex items-start justify-between">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Users className="h-5 w-5" />
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                            Overview
                        </span>
                    </div>

                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Total Customers
                    </p>

                    <p className="mt-2 text-3xl font-semibold tracking-tight text-blue-600">
                        {customerCount}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-400">
                        Customers registered under this organization
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                    <div className="flex items-start justify-between">

                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                            }`}
                        >
                            {isActive ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <CircleOff className="h-5 w-5" />
                            )}
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                            Status
                        </span>
                    </div>

                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Organization Status
                    </p>

                    <p
                        className={`mt-2 text-3xl font-semibold tracking-tight ${
                            isActive
                                ? "text-emerald-600"
                                : "text-red-600"
                        }`}
                    >
                        {isActive
                            ? "Active"
                            : "Inactive"}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-400">
                        Current availability of this organization
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                    <div className="flex items-start justify-between">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <CalendarDays className="h-5 w-5" />
                        </div>

                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                            Record
                        </span>
                    </div>

                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Created
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                        {createdDate}
                    </p>

                    <p className="mt-1.5 text-xs text-slate-400">
                        Organization registration date
                    </p>
                </div>
            </div>

            {/* =====================================================
                ORGANIZATION INFORMATION
            ===================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                <div className="border-b border-slate-100 px-6 py-5">

                    <h2 className="text-base font-semibold text-slate-900">
                        Organization Information
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Basic information and registration details.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-10 gap-y-6 p-6 md:grid-cols-2">

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Organization Name
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />

                            <p className="text-sm font-semibold text-slate-800">
                                {organization.name}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Official Email Domain
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />

                            <p className="text-sm font-semibold text-slate-800">
                                {organization.emailDomain ||
                                    "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Status
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            {isActive ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <CircleOff className="h-4 w-4 text-red-500" />
                            )}

                            <p className="text-sm font-semibold text-slate-800">
                                {isActive
                                    ? "Active"
                                    : "Inactive"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Customer Accounts
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />

                            <p className="text-sm font-semibold text-slate-800">
                                {customerCount}{" "}
                                {customerCount === 1
                                    ? "Customer"
                                    : "Customers"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
                CUSTOMER SECTION
            ===================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">

                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />

                            <h2 className="text-base font-semibold text-slate-900">
                                Customers
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                            Customer accounts associated with this organization.
                        </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {customerCount}{" "}
                        {customerCount === 1
                            ? "Customer"
                            : "Customers"}
                    </span>
                </div>

                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <Users className="h-6 w-6" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-800">
                        Customer Directory
                    </h3>

                    <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-400">
                        This organization currently has{" "}
                        <span className="font-semibold text-slate-600">
                            {customerCount}
                        </span>{" "}
                        registered customer
                        {customerCount === 1
                            ? ""
                            : "s"}.
                    </p>

                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                        Customer management
                    </p>
                </div>
            </section>

            {/* =====================================================
                FOOTER ACTION
            ===================================================== */}

            <div className="flex justify-start pb-4">

                <Link
                    to="/organizations"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Return to Organization Directory
                </Link>
            </div>
        </div>
    );
}
