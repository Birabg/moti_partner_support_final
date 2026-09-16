import { useEffect, useMemo, useState } from "react";

import {
  Archive,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Activity,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

import SupportApi from "../../api/supportApi";
import SupportHeader from "../../components/support/SupportHeader";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =========================================================
     LOAD HISTORY
  ========================================================= */

  const loadHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await SupportApi.getHistory();

      setItems(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to load case history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const res = await SupportApi.getHistory();

        if (mounted) {
          setItems(res?.data?.data || []);
        }
      } catch (error) {
        console.error("Failed to load case history:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    const handleCasesUpdated = () => {
      load();
    };

    window.addEventListener("cases:updated", handleCasesUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("cases:updated", handleCasesUpdated);
    };
  }, []);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const total = items.length;

    const resolved = items.filter(
      (item) =>
        String(item.status || "").toUpperCase() === "RESOLVED" ||
        String(item.status || "").toUpperCase() === "CLOSED"
    ).length;

    const open = items.filter(
      (item) => String(item.status || "").toUpperCase() === "OPEN"
    ).length;

    const inProgress = items.filter(
      (item) =>
        String(item.status || "").toUpperCase() === "IN_PROGRESS"
    ).length;

    return {
      total,
      resolved,
      open,
      inProgress,
    };
  }, [items]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const status = String(item.status || "").toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        item.caseNumber,
        item.id,
        item.subject,
        item.customerName,
        item.organizationName,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, search, statusFilter]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return String(status)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClasses = (status) => {
    const normalized = String(status || "").toUpperCase();

    switch (normalized) {
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "CLOSED":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "OPEN":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-100";

      case "ESCALATED":
        return "bg-red-50 text-red-700 border-red-100";

      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const statCards = [
    {
      label: "Total Cases",
      value: statistics.total,
      description: "All historical cases",
      icon: Archive,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Resolved",
      value: statistics.resolved,
      description: "Successfully completed",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "In Progress",
      value: statistics.inProgress,
      description: "Currently being handled",
      icon: Activity,
      iconClass: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Open",
      value: statistics.open,
      description: "Waiting for action",
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-slate-50/70">
      <SupportHeader />

      <main className="ps-container space-y-7 pb-12">

        {/* =====================================================
            CLEAN HEADER
        ===================================================== */}

        <section className="rounded-[22px] border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,35,65,0.04)]">

          <div className="flex flex-col gap-6 px-6 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">

            {/* Header Content */}

            <div className="min-w-0">

              <div className="mb-3 flex items-center gap-2">

                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Support Operations
                </span>

              </div>

              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[28px]">
                Case History
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Review previously handled cases and keep track of your
                support activity.
              </p>

            </div>

            {/* Header Metric */}

            <div className="flex items-center gap-3">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Total Cases
                </p>

                <div className="mt-1 flex items-baseline gap-2">

                  <span className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    {loading ? "—" : statistics.total}
                  </span>

                  <span className="text-[11px] font-medium text-slate-400">
                    historical
                  </span>

                </div>

              </div>

              <div className="hidden h-[54px] w-[54px] items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">
                <Archive className="h-5 w-5" />
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            SECTION TITLE
        ===================================================== */}

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            History Overview
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">
            Case workload
          </h2>
        </section>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {statCards.map(
            ({
              label,
              value,
              description,
              icon: Icon,
              iconClass,
            }) => (
              <div
                key={label}
                className="group relative rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,35,65,0.07)]"
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>

                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-200 transition group-hover:text-slate-300" />

                </div>

                <div className="mt-6">

                  <p className="text-xs font-medium text-slate-500">
                    {label}
                  </p>

                  <div className="mt-1.5">

                    {loading ? (
                      <div className="h-9 w-12 animate-pulse rounded-md bg-slate-100" />
                    ) : (
                      <span className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                        {value}
                      </span>
                    )}

                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    {description}
                  </p>

                </div>

              </div>
            )
          )}

        </section>

        {/* =====================================================
            CASE MANAGEMENT
        ===================================================== */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,35,65,0.045)]">

          {/* Header */}

          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Archive className="h-[18px] w-[18px]" />
                  </div>

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                      Case Management
                    </p>

                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                      Your case history
                    </h2>

                  </div>

                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Review previously handled cases and their latest status.
                </p>

              </div>

              {/* Controls */}

              <div className="flex flex-col gap-2 sm:flex-row">

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search cases..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-56"
                  />

                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ALL">All statuses</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="OPEN">Open</option>
                  <option value="PENDING">Pending</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              STATUS BAR
          ================================================= */}

          <div className="flex min-h-[48px] items-center justify-between border-b border-slate-100 bg-slate-50/40 px-6 sm:px-7">

            <div className="flex items-center gap-2">

              <Activity className="h-3.5 w-3.5 text-slate-400" />

              <span className="text-xs font-medium text-slate-500">
                {loading
                  ? "Loading history..."
                  : `${filteredItems.length} ${
                      filteredItems.length === 1
                        ? "case"
                        : "cases"
                    }`}
              </span>

            </div>

            <div className="flex items-center gap-3">

              {!loading && (
                <span className="hidden text-[10px] text-slate-400 sm:block">
                  {filteredItems.length} of {items.length} shown
                </span>
              )}

              <div className="h-3 w-px bg-slate-200" />

              <button
                type="button"
                onClick={() => loadHistory(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 transition hover:text-blue-600 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                {refreshing ? "Refreshing" : "Refresh"}
              </button>

              {(search || statusFilter !== "ALL") && (
                <>
                  <div className="h-3 w-px bg-slate-200" />

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="text-[10px] font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Clear
                  </button>
                </>
              )}

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="divide-y divide-slate-100">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 px-6 py-5 sm:px-7"
                >

                  <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-2">

                    <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />

                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />

                  </div>

                  <div className="hidden h-7 w-20 animate-pulse rounded-full bg-slate-100 sm:block" />

                  <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 md:block" />

                </div>
              ))}

            </div>

          ) : !filteredItems.length ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">

                {items.length ? (
                  <Search className="h-6 w-6" />
                ) : (
                  <Inbox className="h-6 w-6" />
                )}

              </div>

              <h3 className="mt-5 text-sm font-semibold text-slate-900">
                {items.length
                  ? "No matching cases"
                  : "No case history yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                {items.length
                  ? "Try changing your search term or status filter."
                  : "Your historical support activity will appear here once cases have been handled."}
              </p>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-5 rounded-xl bg-[#0b1d38] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#12294a]"
                >
                  View all cases
                </button>
              )}

            </div>

          ) : (

            /* =================================================
               CASE TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] border-collapse">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/30">

                    <th className="px-6 py-3.5 text-left text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:px-7">
                      Case
                    </th>

                    <th className="px-4 py-3.5 text-left text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Subject
                    </th>

                    <th className="px-4 py-3.5 text-left text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </th>

                    <th className="px-4 py-3.5 text-left text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Created
                    </th>

                    <th className="px-6 py-3.5 text-right text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:px-7">
                      Activity
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredItems.map((item) => {

                    const status = String(
                      item.status || ""
                    ).toUpperCase();

                    const caseNumber =
                      item.caseNumber || item.id || "—";

                    const customer =
                      item.customerName ||
                      item.organizationName ||
                      "Support case";

                    return (
                      <tr
                        key={item.id || caseNumber}
                        className="group transition hover:bg-slate-50/60"
                      >

                        {/* Case */}

                        <td className="px-6 py-5 sm:px-7">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                              <Inbox className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">

                              <p className="text-sm font-semibold text-slate-900">
                                {caseNumber}
                              </p>

                              <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-slate-400">
                                {customer}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Subject */}

                        <td className="px-4 py-5">

                          <div className="max-w-[300px]">

                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.subject ||
                                "No subject provided"}
                            </p>

                            {item.description && (
                              <p className="mt-1 truncate text-[11px] text-slate-400">
                                {item.description}
                              </p>
                            )}

                          </div>

                        </td>

                        {/* Status */}

                        <td className="px-4 py-5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] ${getStatusClasses(
                              status
                            )}`}
                          >

                            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />

                            {formatStatus(status)}

                          </span>

                        </td>

                        {/* Date */}

                        <td className="px-4 py-5">

                          <div>

                            <p className="text-xs font-medium text-slate-600">
                              {formatDate(item.createdAt)}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatDateTime(item.createdAt)}
                            </p>

                          </div>

                        </td>

                        {/* Activity */}

                        <td className="px-6 py-5 text-right sm:px-7">

                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        {!loading && items.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_4px_18px_rgba(15,35,65,0.035)] sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <div>

                <p className="text-xs font-semibold text-slate-700">
                  Support history is up to date
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Historical assignments are synchronized with the
                  support workspace.
                </p>

              </div>

            </div>

            <div className="text-[10px] font-medium text-slate-400">
              {filteredItems.length} of {items.length} cases displayed
            </div>

          </div>
        )}

      </main>
    </div>
  );
}