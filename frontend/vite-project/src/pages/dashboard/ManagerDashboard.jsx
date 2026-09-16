import { useEffect, useMemo, useState } from "react";
import {
    ArrowRightLeft,
    BriefcaseBusiness,
    Building2,
    ClipboardList,
    Loader2,
    ShieldCheck,
    Star,
    Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { managerApi } from "../../api/managerApi";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

const scopeConfig = {
    DEPARTMENT: {
        idKey: "departmentId",
        resource: "department",
        title: "Department",
    },
    DIVISION: {
        idKey: "divisionId",
        resource: "division",
        title: "Division",
    },
    SECTION: {
        idKey: "sectionId",
        resource: "section",
        title: "Section",
    },
};

const statusTone = {
    OPEN: "bg-navy-100 text-navy-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    ASSIGNED: "bg-navy-100 text-navy-700",
    CLOSED: "bg-emerald-100 text-emerald-700",
    RESOLVED: "bg-emerald-100 text-emerald-700",
};

const priorityTone = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-navy-100 text-navy-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-rose-100 text-rose-700",
};

function formatScopeLabel(value) {
    return value
        ? value
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Unit";
}

function normalizeStatusCounts(rawCounts = {}) {
    return Object.entries(rawCounts).reduce((acc, [key, value]) => {
        const normalizedKey = String(key).trim().toUpperCase().replace(/\s+/g, "_");
        acc[normalizedKey] = Number(value) || 0;
        return acc;
    }, {});
}

function flattenStaffMembers(hierarchy = {}) {
    const values = [];

    const pushList = (list) => {
        if (!Array.isArray(list)) return;
        list.forEach((member) => {
            if (!member) return;
            if (member.id || member.name || member.email) {
                values.push(member);
            }
        });
    };

    pushList(hierarchy.staffMembers);

    if (Array.isArray(hierarchy.sections)) {
        hierarchy.sections.forEach((section) => {
            pushList(section.staffMembers);
        });
    }

    if (Array.isArray(hierarchy.divisions)) {
        hierarchy.divisions.forEach((division) => {
            pushList(division.staffMembers);
            if (Array.isArray(division.sections)) {
                division.sections.forEach((section) => {
                    pushList(section.staffMembers);
                });
            }
        });
    }

    return values;
}

export default function ManagerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [snapshot, setSnapshot] = useState(null);

    const managerType = user?.managerType || "SECTION";
    const scopeMeta = scopeConfig[managerType] || scopeConfig.SECTION;
    const scopeId = user?.[scopeMeta.idKey];

    useEffect(() => {
        if (!scopeId) {
            setLoading(false);
            setError("Manager scope is missing from your session.");
            return;
        }

        let cancelled = false;

        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");
                const response = await managerApi.getScopeOverview();
                if (!cancelled) {
                    setSnapshot(response?.data?.data || null);
                }
            } catch (caughtError) {
                console.error(caughtError);
                if (!cancelled) {
                    setError("Unable to load your scoped analytics right now.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDashboard();

        const refreshTimer = window.setInterval(() => {
            loadDashboard();
        }, 10000);

        const handleFocus = () => loadDashboard();
        const handleCasesUpdated = () => loadDashboard();
        
        window.addEventListener("focus", handleFocus);
        window.addEventListener("cases:updated", handleCasesUpdated);

        return () => {
            cancelled = true;
            window.clearInterval(refreshTimer);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("cases:updated", handleCasesUpdated);
        };
    }, [scopeId, scopeMeta.resource]);

    const summary = useMemo(() => {
        const metrics = snapshot?.caseMetrics || {};
        const hierarchy = snapshot?.hierarchyMetrics || {};
        const cases = Array.isArray(metrics.cases)
            ? metrics.cases
            : Array.isArray(metrics.recentCases)
                ? metrics.recentCases
                : [];
        const countByStatus = normalizeStatusCounts(metrics.casesByStatus || {});

        const openCases = countByStatus.OPEN || countByStatus.OPEN_CASES || 0;
        const inProgressCases = (countByStatus.IN_PROGRESS || 0) + (countByStatus.ASSIGNED || 0);
        const closedCases = (countByStatus.CLOSED || 0) + (countByStatus.RESOLVED || 0);
        const staffMembers = flattenStaffMembers(hierarchy);

        return {
            totalCases: metrics.totalAssignedCases || cases.length || 0,
            openCases,
            inProgressCases,
            closedCases,
            avgRating: "—",
            totalStaff: staffMembers.length || hierarchy.totalSectionStaffCount || hierarchy.totalDivisionStaffCount || hierarchy.totalDepartmentStaffCount || 0,
            scopeName: snapshot?.[scopeMeta.resource]?.name || "My Unit",
            scopeLabel: formatScopeLabel(scopeMeta.title),
            recentCases: cases.slice(0, 5),
            staffMembers: staffMembers.slice(0, 6),
            priorityDistribution: cases.reduce((acc, item) => {
                acc[item.priority] = (acc[item.priority] || 0) + 1;
                return acc;
            }, {}),
        };
    }, [snapshot, scopeMeta.resource]);

    const stats = [
        { label: "Total Cases", value: summary.totalCases, icon: ClipboardList },
        { label: "Open Cases", value: summary.openCases, icon: BriefcaseBusiness },
        { label: "In Progress", value: summary.inProgressCases, icon: ArrowRightLeft },
        { label: "Closed Cases", value: summary.closedCases, icon: ShieldCheck },
        { label: "Average Customer Rating", value: summary.avgRating, icon: Star },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Manager Dashboard</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{summary.scopeLabel} Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">Scoped to {summary.scopeName}</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/manager/cases")}
                    className="hidden sm:inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition"
                >
                    Open Case Tracking
                </button>
            </div>

            {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {stats.map(({ label, value, icon: Icon }) => (
                    <Card key={label} className="min-h-[150px]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold text-slate-700">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-4xl font-bold leading-none text-slate-900">
                                {loading ? <Loader2 className="h-6 w-6 animate-spin text-navy-500" /> : value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Assigned Cases</h2>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{summary.totalCases}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {summary.recentCases.length === 0 ? (
                                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No assigned cases were found in this unit.</p>
                            ) : (
                                summary.recentCases.map((item) => (
                                    <div key={item.id} className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">{item.caseNumber || item.id}</p>
                                            <p className="text-sm text-slate-500">{item.subject}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[item.status] || "bg-slate-100 text-slate-700"}`}>
                                                {item.status?.replace(/_/g, " ")}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone[item.priority] || "bg-slate-100 text-slate-700"}`}>
                                                {item.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Users className="h-5 w-5 text-navy-600" />
                            <h2 className="text-lg font-semibold">Staff in My Unit</h2>
                        </div>
                        <div className="mt-4 space-y-3">
                            {summary.staffMembers.length === 0 ? (
                                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No staff members are available for this scope.</p>
                            ) : (
                                summary.staffMembers.slice(0, 6).map((member, index) => (
                                    <div key={member.id || `${member.name}-${index}`} className="rounded-md border border-slate-200 p-3">
                                        <p className="font-semibold text-slate-900">{member.name || member.manager || member.title || "Staff Member"}</p>
                                        <p className="text-sm text-slate-500">{member.email || "No email on file"}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Star className="h-5 w-5 text-amber-500" />
                            <h2 className="text-lg font-semibold">Recent Customer Feedback</h2>
                        </div>
                        <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                            Feedback will appear here once closed cases have customer ratings and comments in the system.
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-slate-900">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-lg font-semibold">Case Priority Distribution</h2>
                        </div>
                        <div className="mt-4 space-y-3">
                            {Object.entries(summary.priorityDistribution).length === 0 ? (
                                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">No priority data available.</p>
                            ) : (
                                Object.entries(summary.priorityDistribution).map(([priority, count]) => (
                                    <div key={priority} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                                        <span className="text-sm font-medium text-slate-700">{priority}</span>
                                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
