import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaLayerGroup,
  FaSearch,
  FaSitemap,
  FaUsers,
} from "react-icons/fa";
import { directorApi } from "../../api/directorApi";

export default function DirectorOrganizationStructure() {
  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [activeView, setActiveView] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadStructure() {
      try {
        setLoading(true);
        setError("");

        const [deptResp, divResp, secResp] =
          await directorApi.getOrganizationStructure();

        if (!isMounted) return;

        setDepartments(
          deptResp?.data?.data?.departments ||
            deptResp?.data?.departments ||
            []
        );

        setDivisions(
          divResp?.data?.data?.divisions ||
            divResp?.data?.divisions ||
            []
        );

        setSections(
          secResp?.data?.data?.sections ||
            secResp?.data?.sections ||
            []
        );
      } catch (caughtError) {
        console.error("Director organization structure error", caughtError);

        const apiMessage =
          caughtError?.response?.data?.message ||
          caughtError?.response?.data ||
          caughtError?.message ||
          String(caughtError);

        if (isMounted) {
          setError(`Could not load organization structure: ${apiMessage}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStructure();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.isActive !== false
      ).length,
    [departments]
  );

  const activeDivisions = useMemo(
    () =>
      divisions.filter(
        (division) => division.isActive !== false
      ).length,
    [divisions]
  );

  const activeSections = useMemo(
    () =>
      sections.filter(
        (section) => section.isActive !== false
      ).length,
    [sections]
  );

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      if (activeView === "departments" || activeView === "all") {
        if (!query) return true;

        return (
          String(
            department.name ||
              department.departmentName ||
              ""
          )
            .toLowerCase()
            .includes(query)
        );
      }

      return false;
    });
  }, [departments, search, activeView]);

  const filteredDivisions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return divisions;

    return divisions.filter((division) =>
      String(
        division.name ||
          division.divisionName ||
          ""
      )
        .toLowerCase()
        .includes(query)
    );
  }, [divisions, search]);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sections;

    return sections.filter((section) =>
      String(
        section.name ||
          section.sectionName ||
          ""
      )
        .toLowerCase()
        .includes(query)
    );
  }, [sections, search]);

  function toggleDepartment(id) {
    setExpandedDepartments((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function getDepartmentDivisions(department) {
    return divisions.filter((division) => {
      const departmentId =
        division.departmentId ||
        division.department?.id ||
        division.departmentID;

      return departmentId === department.id;
    });
  }

  function getDivisionSections(division) {
    return sections.filter((section) => {
      const divisionId =
        section.divisionId ||
        section.division?.id ||
        section.divisionID;

      return divisionId === division.id;
    });
  }

  return (
    <div className="min-h-full space-y-7">

      {/* =====================================================
          HERO
      ===================================================== */}

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
                Department Management
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                View and monitor the organizational hierarchy across
                departments, divisions, and sections from one central
                workspace.
              </p>

            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex">

              <HeroStat
                label="Departments"
                value={departments.length}
              />

              <HeroStat
                label="Divisions"
                value={divisions.length}
              />

              <HeroStat
                label="Sections"
                value={sections.length}
              />

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

          <div>
            <p className="font-semibold">
              Organization structure unavailable
            </p>

            <p className="mt-1 text-xs text-red-600/80">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section>

        <div className="mb-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#567fbd]">
            Organization
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
            Structure at a glance
          </h2>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StructureMetric
            label="Departments"
            value={departments.length}
            active={activeDepartments}
            description="Top-level organizational units"
            icon={FaBuilding}
            tone="blue"
          />

          <StructureMetric
            label="Divisions"
            value={divisions.length}
            active={activeDivisions}
            description="Divisions within departments"
            icon={FaSitemap}
            tone="blue"
          />

          <StructureMetric
            label="Sections"
            value={sections.length}
            active={activeSections}
            description="Operational sections"
            icon={FaLayerGroup}
            tone="green"
          />

          <StructureMetric
            label="Active Units"
            value={
              activeDepartments +
              activeDivisions +
              activeSections
            }
            active={null}
            description="Currently active hierarchy units"
            icon={FaCheckCircle}
            tone="green"
          />

        </div>
      </section>

      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <section className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,32,55,0.045)] sm:p-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Organization directory
            </p>

            <h2 className="mt-1 text-base font-bold text-[#101a28]">
              Browse organizational units
            </h2>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative">

              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search departments..."
                className="
                  h-10 w-full rounded-xl
                  border border-slate-200
                  bg-slate-50
                  pl-9 pr-4
                  text-xs text-slate-700
                  outline-none
                  transition
                  focus:border-[#527eb9]
                  focus:bg-white
                  sm:w-[260px]
                "
              />

            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">

              <FilterButton
                active={activeView === "all"}
                onClick={() => setActiveView("all")}
              >
                All
              </FilterButton>

              <FilterButton
                active={activeView === "departments"}
                onClick={() =>
                  setActiveView("departments")
                }
              >
                Departments
              </FilterButton>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          HIERARCHY
      ===================================================== */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Organizational hierarchy
              </p>

              <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                Departments & structure
              </h2>

            </div>

            <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              {activeDepartments} active departments

            </div>

          </div>

        </div>

        <div className="p-5 sm:p-6">

          {loading ? (
            <LoadingHierarchy />
          ) : filteredDepartments.length === 0 ? (

            <EmptyState
              icon={FaBuilding}
              title="No departments found"
              description={
                search
                  ? "Try changing your search term."
                  : "No department structure is currently available."
              }
            />

          ) : (

            <div className="space-y-3">

              {filteredDepartments.map((department) => {

                const departmentId = department.id;

                const departmentName =
                  department.name ||
                  department.departmentName ||
                  "Department";

                const departmentDivisions =
                  getDepartmentDivisions(department);

                const isExpanded =
                  expandedDepartments[departmentId];

                const isActive =
                  department.isActive !== false;

                return (
                  <div
                    key={departmentId}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border border-slate-200
                      bg-white
                      transition-all
                      hover:border-slate-300
                    "
                  >

                    {/* DEPARTMENT */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleDepartment(departmentId)
                      }
                      className="
                        group flex w-full items-center
                        justify-between gap-4
                        px-4 py-4 text-left
                        transition-colors
                        hover:bg-slate-50/70
                        sm:px-5
                      "
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">
                          <FaBuilding className="text-sm" />
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="truncate text-sm font-bold text-[#101a28]">
                              {departmentName}
                            </p>

                            <StatusBadge active={isActive} />

                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-3">

                            <span className="text-[10px] text-slate-400">
                              {departmentDivisions.length}{" "}
                              {departmentDivisions.length === 1
                                ? "division"
                                : "divisions"}
                            </span>

                            {department.code && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />

                                <span className="text-[10px] text-slate-400">
                                  {department.code}
                                </span>
                              </>
                            )}

                          </div>

                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        <span className="hidden text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block">
                          {isExpanded
                            ? "Collapse"
                            : "View divisions"}
                        </span>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-[#edf4fd] group-hover:text-[#527eb9]">

                          {isExpanded ? (
                            <FaChevronDown className="text-[10px]" />
                          ) : (
                            <FaChevronRight className="text-[10px]" />
                          )}

                        </div>

                      </div>

                    </button>

                    {/* DIVISIONS */}

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">

                        {departmentDivisions.length === 0 ? (

                          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center">

                            <FaSitemap className="mx-auto text-slate-300" />

                            <p className="mt-2 text-[11px] font-semibold text-slate-500">
                              No divisions linked to this department
                            </p>

                          </div>

                        ) : (

                          <div className="space-y-2">

                            {departmentDivisions.map(
                              (division) => {

                                const divisionName =
                                  division.name ||
                                  division.divisionName ||
                                  "Division";

                                const divisionSections =
                                  getDivisionSections(
                                    division
                                  );

                                return (
                                  <div
                                    key={division.id}
                                    className="
                                      rounded-xl
                                      border border-slate-200
                                      bg-white
                                      p-4
                                    "
                                  >

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                      <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f6fa] text-[#527eb9]">

                                          <FaSitemap className="text-xs" />

                                        </div>

                                        <div>

                                          <p className="text-[11px] font-bold text-[#101a28]">
                                            {divisionName}
                                          </p>

                                          <p className="mt-0.5 text-[9px] text-slate-400">
                                            {divisionSections.length}{" "}
                                            {divisionSections.length === 1
                                              ? "section"
                                              : "sections"}
                                          </p>

                                        </div>

                                      </div>

                                      <StatusBadge
                                        active={
                                          division.isActive !==
                                          false
                                        }
                                      />

                                    </div>

                                    {/* SECTIONS */}

                                    {divisionSections.length >
                                      0 && (

                                      <div className="mt-4 border-t border-slate-100 pt-3">

                                        <div className="mb-2 flex items-center gap-2">

                                          <FaLayerGroup className="text-[9px] text-slate-400" />

                                          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                            Sections
                                          </span>

                                        </div>

                                        <div className="grid gap-2 sm:grid-cols-2">

                                          {divisionSections.map(
                                            (section) => {

                                              const sectionName =
                                                section.name ||
                                                section.sectionName ||
                                                "Section";

                                              return (
                                                <div
                                                  key={
                                                    section.id
                                                  }
                                                  className="
                                                    flex items-center
                                                    justify-between
                                                    rounded-lg
                                                    border border-slate-100
                                                    bg-slate-50/70
                                                    px-3 py-3
                                                  "
                                                >

                                                  <div className="flex min-w-0 items-center gap-2">

                                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#527eb9]" />

                                                    <span className="truncate text-[10px] font-semibold text-slate-600">
                                                      {
                                                        sectionName
                                                      }
                                                    </span>

                                                  </div>

                                                  <StatusBadge
                                                    active={
                                                      section.isActive !==
                                                      false
                                                    }
                                                    compact
                                                  />

                                                </div>
                                              );
                                            }
                                          )}

                                        </div>

                                      </div>
                                    )}

                                  </div>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          STRUCTURE OVERVIEW
      ===================================================== */}

      <section className="grid gap-5 lg:grid-cols-3">

        <OverviewCard
          icon={FaBuilding}
          title="Departments"
          value={departments.length}
          active={activeDepartments}
          description="Primary organizational units"
          tone="blue"
        />

        <OverviewCard
          icon={FaSitemap}
          title="Divisions"
          value={divisions.length}
          active={activeDivisions}
          description="Operational divisions"
          tone="blue"
        />

        <OverviewCard
          icon={FaLayerGroup}
          title="Sections"
          value={sections.length}
          active={activeSections}
          description="Operational sections"
          tone="green"
        />

      </section>

      {/* =====================================================
          ALL DIVISIONS / SECTIONS
      ===================================================== */}

      {activeView === "all" && search && (
        <section className="grid gap-5 lg:grid-cols-2">

          <SimpleDirectory
            title="Matching divisions"
            eyebrow="Search results"
            icon={FaSitemap}
            items={filteredDivisions}
            emptyText="No matching divisions."
            getName={(item) =>
              item.name ||
              item.divisionName ||
              "Division"
            }
          />

          <SimpleDirectory
            title="Matching sections"
            eyebrow="Search results"
            icon={FaLayerGroup}
            items={filteredSections}
            emptyText="No matching sections."
            getName={(item) =>
              item.name ||
              item.sectionName ||
              "Section"
            }
          />

        </section>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <FaBuilding className="text-[#567fbd]" />

          MOTI Partner Support Platform

        </div>

        <div>
          Organization management workspace
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   HERO STAT
============================================================ */

function HeroStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-3 backdrop-blur-md sm:px-4">

      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/30 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-1 font-display text-lg font-bold tracking-[-0.03em] sm:text-xl">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   STRUCTURE METRIC
============================================================ */

function StructureMetric({
  label,
  value,
  active,
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

        <FaArrowRight className="text-[10px] text-slate-300 transition-transform group-hover:translate-x-0.5" />

      </div>

      <div className="mt-6">

        <p className="text-[10px] font-medium text-slate-400">
          {label}
        </p>

        <div className="mt-1.5 flex items-end gap-2">

          <p className="font-display text-[30px] font-bold tracking-[-0.045em] text-[#101a28]">
            {value}
          </p>

          {active !== null && (
            <span className="mb-1 text-[9px] font-semibold text-emerald-600">
              {active} active
            </span>
          )}

        </div>

        <p className="mt-2 text-[10px] text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ active, compact = false }) {
  return (
    <span
      className={`
        inline-flex shrink-0 items-center gap-1.5
        rounded-full
        font-bold
        ${
          compact
            ? "px-2 py-0.5 text-[7px]"
            : "px-2.5 py-1 text-[9px]"
        }
        ${
          active
            ? "bg-[#edf8f4] text-[#37876c]"
            : "bg-slate-100 text-slate-500"
        }
      `}
    >

      <span
        className={`
          rounded-full
          ${compact ? "h-1 w-1" : "h-1.5 w-1.5"}
          ${active ? "bg-[#37876c]" : "bg-slate-400"}
        `}
      />

      {active ? "Active" : "Inactive"}

    </span>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg px-3 py-2
        text-[9px] font-bold
        transition-all
        ${
          active
            ? "bg-white text-[#527eb9] shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   OVERVIEW CARD
============================================================ */

function OverviewCard({
  icon: Icon,
  title,
  value,
  active,
  description,
  tone,
}) {
  const isGreen = tone === "green";

  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

      <div className="flex items-center gap-3">

        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl
            ${
              isGreen
                ? "bg-[#edf8f4] text-[#37876c]"
                : "bg-[#edf4fd] text-[#527eb9]"
            }
          `}
        >
          <Icon className="text-sm" />
        </div>

        <div>

          <p className="text-[10px] font-medium text-slate-400">
            {title}
          </p>

          <p className="font-display text-xl font-bold tracking-[-0.03em] text-[#101a28]">
            {value}
          </p>

        </div>

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

        <span className="text-[9px] text-slate-400">
          {description}
        </span>

        <span className="text-[9px] font-bold text-emerald-600">
          {active} active
        </span>

      </div>

    </div>
  );
}

/* ============================================================
   SIMPLE DIRECTORY
============================================================ */

function SimpleDirectory({
  title,
  eyebrow,
  icon: Icon,
  items,
  emptyText,
  getName,
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

      <div className="border-b border-slate-100 px-5 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4fd] text-[#527eb9]">

            <Icon className="text-xs" />

          </div>

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {eyebrow}
            </p>

            <h2 className="mt-0.5 text-base font-bold text-[#101a28]">
              {title}
            </h2>

          </div>

        </div>

      </div>

      <div className="p-4">

        {items.length === 0 ? (

          <p className="rounded-xl bg-slate-50 p-4 text-center text-[10px] text-slate-400">
            {emptyText}
          </p>

        ) : (

          <div className="space-y-2">

            {items.slice(0, 8).map((item) => (

              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
              >

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#527eb9]" />

                  <span className="text-[10px] font-semibold text-slate-600">
                    {getName(item)}
                  </span>

                </div>

                <StatusBadge
                  active={item.isActive !== false}
                  compact
                />

              </div>

            ))}

          </div>
        )}

      </div>

    </section>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingHierarchy() {
  return (
    <div className="space-y-3">

      {[1, 2, 3, 4].map((item) => (

        <div
          key={item}
          className="h-[76px] animate-pulse rounded-2xl bg-slate-100"
        />

      ))}

    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="px-6 py-12 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-300">

        <Icon />

      </div>

      <p className="mt-3 text-[11px] font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {description}
      </p>

    </div>
  );
}
