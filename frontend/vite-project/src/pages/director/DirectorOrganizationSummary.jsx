import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaBuilding,
  FaCheckCircle,
  FaUsers,
  FaTimesCircle,
  FaCalendarAlt,
  FaLayerGroup,
  FaExclamationTriangle,
} from "react-icons/fa";
import { directorApi } from "../../api/directorApi";

export default function DirectorOrganizationSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const response = await directorApi.getOrganizationListAdmin();

        if (!isMounted) return;

        const organizations = response?.data?.data || [];

        setSummary({
          organizations,
        });
      } catch (caughtError) {
        console.error(
          "Director organization summary load error",
          caughtError
        );

        const apiMessage =
          caughtError?.response?.data?.message ||
          caughtError?.response?.data ||
          caughtError?.message ||
          String(caughtError);

        if (isMounted) {
          setError(`Could not load organization summary: ${apiMessage}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const organizations = summary?.organizations || [];

  /*
  ============================================================
  ORGANIZATION METRICS
  ============================================================
  */

  const metrics = useMemo(() => {
    const total = organizations.length;

    const active = organizations.filter(
      (organization) => organization.isActive !== false
    ).length;

    const inactive = total - active;

    const customers = organizations.reduce(
      (totalCustomers, organization) =>
        totalCustomers + Number(organization._count?.customers || 0),
      0
    );

    return {
      total,
      active,
      inactive,
      customers,
    };
  }, [organizations]);

  /*
  ============================================================
  ORGANIZATION ROWS
  ============================================================
  */

  const rows = useMemo(() => {
    return organizations.slice(0, 12).map((organization) => {
      const customers = Number(
        organization._count?.customers || 0
      );

      const customerShare =
        metrics.customers > 0
          ? Math.round((customers / metrics.customers) * 100)
          : 0;

      return {
        ...organization,
        customers,
        customerShare,
      };
    });
  }, [organizations, metrics.customers]);

  /*
  ============================================================
  LOADING STATE
  ============================================================
  */

  if (loading && !summary) {
    return (
      <div className="min-h-full space-y-7">

        <div className="h-[220px] animate-pulse rounded-[24px] bg-[#0b1b33]" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[145px] animate-pulse rounded-[20px] border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-[500px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />

      </div>
    );
  }

  return (
    <div className="min-h-full space-y-7">

      {/* ======================================================
          EXECUTIVE HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[24px] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.14)]">

        <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full bg-[#416da8]/20 blur-[95px]" />

        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[380px] w-[380px] rounded-full bg-[#658abd]/10 blur-[100px]" />

        <div
          className="
            pointer-events-none absolute inset-0 opacity-[0.045]
            [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
            [background-size:36px_36px]
          "
        />

        <div className="relative z-10 px-6 py-8 sm:px-9 sm:py-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-5 flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                  Organization Management
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
                Organization Overview
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                Monitor the organizations connected to the MOTI
                Partner Support Platform, including activity,
                customer coverage, and account status.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">

              <HeroMetric
                label="Organizations"
                value={metrics.total}
              />

              <HeroMetric
                label="Customers"
                value={metrics.customers}
              />

            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

          <FaExclamationTriangle className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Organization data unavailable
            </p>

            <p className="mt-1 text-xs text-red-600/80">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* ======================================================
          KPI SECTION
      ====================================================== */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
              Organization
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
              Organization at a glance
            </h2>
          </div>

          <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Current overview
          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <ExecutiveMetric
            label="Total Organizations"
            value={metrics.total}
            description="Organizations registered"
            icon={FaBuilding}
            tone="blue"
          />

          <ExecutiveMetric
            label="Active Organizations"
            value={metrics.active}
            description="Currently active"
            icon={FaCheckCircle}
            tone="green"
          />

          <ExecutiveMetric
            label="Inactive Organizations"
            value={metrics.inactive}
            description="Currently inactive"
            icon={FaTimesCircle}
            tone="amber"
          />

          <ExecutiveMetric
            label="Total Customers"
            value={metrics.customers}
            description="Customers across organizations"
            icon={FaUsers}
            tone="blue"
          />

        </div>

      </section>

      {/* ======================================================
          ORGANIZATION HEALTH
      ====================================================== */}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

        {/* ORGANIZATION STATUS */}

        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                <FaLayerGroup className="text-sm" />
              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Account status
                </p>

                <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                  Organization health
                </h2>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="space-y-5">

              <StatusProgress
                label="Active organizations"
                value={metrics.active}
                total={metrics.total}
                description="Organizations currently available"
                color="bg-[#37876c]"
                icon={FaCheckCircle}
                iconBox="bg-[#edf8f4] text-[#37876c]"
              />

              <StatusProgress
                label="Inactive organizations"
                value={metrics.inactive}
                total={metrics.total}
                description="Organizations currently disabled"
                color="bg-[#c58a27]"
                icon={FaTimesCircle}
                iconBox="bg-[#fff7e8] text-[#c58a27]"
              />

            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">

              <MiniMetric
                label="Active"
                value={metrics.active}
              />

              <MiniMetric
                label="Inactive"
                value={metrics.inactive}
              />

            </div>

          </div>

        </section>

        {/* CUSTOMER COVERAGE */}

        <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                <FaUsers className="text-sm" />
              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Customer coverage
                </p>

                <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
                  Customer distribution
                </h2>

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="rounded-2xl bg-slate-50/80 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Total customers
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#101a28]">
                    {metrics.customers}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">
                  <FaUsers />
                </div>

              </div>

              <p className="mt-4 text-[10px] leading-5 text-slate-400">
                Customers currently distributed across all
                registered organizations.
              </p>

            </div>

            <div className="mt-4 rounded-2xl border border-[#dce7f5] bg-[#f7faff] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">
                  <FaBuilding className="text-xs" />
                </div>

                <div>

                  <p className="text-[11px] font-bold text-[#101a28]">
                    Organization coverage
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    {metrics.total} organizations are currently
                    represented in the organization workspace.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* ======================================================
          ORGANIZATION TABLE
      ====================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Directory
            </p>

            <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
              Organization directory
            </h2>

          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">

            <FaBuilding />

            Showing {Math.min(rows.length, 12)} of {metrics.total}

          </div>

        </div>

        {rows.length === 0 ? (

          <div className="px-6 py-14 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300">
              <FaBuilding />
            </div>

            <p className="mt-4 text-[11px] font-semibold text-slate-500">
              No organizations found
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Organization information will appear here once
              organizations are available.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/50">

                  <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Organization
                  </th>

                  <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Customers
                  </th>

                  <th className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Created
                  </th>

                  <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Customer Share
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {rows.map((organization) => {

                  const isActive =
                    organization.isActive !== false;

                  return (

                    <tr
                      key={organization.id}
                      className="group transition-colors hover:bg-slate-50/60"
                    >

                      {/* ORGANIZATION */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">

                            <FaBuilding className="text-xs" />

                          </div>

                          <div>

                            <p className="text-[11px] font-bold text-[#101a28]">
                              {organization.name ||
                                organization.code ||
                                "Organization"}
                            </p>

                            {organization.code &&
                              organization.name && (
                                <p className="mt-0.5 text-[9px] text-slate-400">
                                  {organization.code}
                                </p>
                              )}

                          </div>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex items-center gap-1.5
                            rounded-full px-2.5 py-1
                            text-[9px] font-bold
                            ${
                              isActive
                                ? "bg-[#edf8f4] text-[#37876c]"
                                : "bg-slate-100 text-slate-500"
                            }
                          `}
                        >

                          <span
                            className={`
                              h-1.5 w-1.5 rounded-full
                              ${
                                isActive
                                  ? "bg-[#37876c]"
                                  : "bg-slate-400"
                              }
                            `}
                          />

                          {isActive ? "Active" : "Inactive"}

                        </span>

                      </td>

                      {/* CUSTOMERS */}

                      <td className="px-6 py-4 text-right">

                        <div className="inline-flex items-center gap-2">

                          <FaUsers className="text-[10px] text-slate-300" />

                          <span className="text-sm font-bold text-[#101a28]">
                            {organization.customers}
                          </span>

                        </div>

                      </td>

                      {/* CREATED */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <FaCalendarAlt className="text-[10px] text-slate-300" />

                          <span className="text-[10px] text-slate-500">
                            {organization.createdAt
                              ? new Date(
                                  organization.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </span>

                        </div>

                      </td>

                      {/* CUSTOMER SHARE */}

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-3">

                          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:block">

                            <div
                              className="h-full rounded-full bg-[#527eb9] transition-all duration-700"
                              style={{
                                width: `${Math.min(
                                  organization.customerShare,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                          <span className="w-9 text-right text-[9px] font-semibold text-slate-400">
                            {organization.customerShare}%
                          </span>

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <FaBuilding className="text-[#567fbd]" />

          MOTI Partner Support Platform

        </div>

        <div>
          Executive organization workspace
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   HERO METRIC
============================================================ */

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold tracking-[-0.03em]">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   EXECUTIVE METRIC
============================================================ */

function ExecutiveMetric({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const tones = {
    blue: {
      icon: "bg-[#edf4fd] text-[#527eb9]",
      line: "bg-[#527eb9]",
    },

    green: {
      icon: "bg-[#edf8f4] text-[#37876c]",
      line: "bg-[#37876c]",
    },

    amber: {
      icon: "bg-[#fff7e8] text-[#c58a27]",
      line: "bg-[#c58a27]",
    },
  };

  const currentTone = tones[tone] || tones.blue;

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-[20px]
        border border-slate-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(16,32,55,0.045)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-[0_16px_38px_rgba(16,32,55,0.075)]
      "
    >

      <div
        className={`
          absolute left-0 top-0
          h-[3px] w-0
          ${currentTone.line}
          transition-all duration-300
          group-hover:w-full
        `}
      />

      <div className="flex items-start justify-between">

        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl
            ${currentTone.icon}
          `}
        >
          <Icon className="text-sm" />
        </div>

        <FaArrowUp className="rotate-45 text-[10px] text-slate-300" />

      </div>

      <div className="mt-6">

        <p className="text-[10px] font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1.5 text-[30px] font-bold tracking-[-0.045em] text-[#101a28]">
          {value}
        </p>

        <p className="mt-2 text-[10px] text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   STATUS PROGRESS
============================================================ */

function StatusProgress({
  label,
  value,
  total,
  description,
  color,
  icon: Icon,
  iconBox,
}) {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2.5">

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBox}`}
          >
            <Icon className="text-xs" />
          </div>

          <div>

            <p className="text-[11px] font-semibold text-slate-600">
              {label}
            </p>

            <p className="text-[9px] text-slate-400">
              {description}
            </p>

          </div>

        </div>

        <div className="text-right">

          <span className="text-sm font-bold text-[#101a28]">
            {value}
          </span>

          <span className="ml-1 text-[9px] text-slate-400">
            ({percentage}%)
          </span>

        </div>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* ============================================================
   MINI METRIC
============================================================ */

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">

      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-[#101a28]">
        {value}
      </p>

    </div>
  );
}