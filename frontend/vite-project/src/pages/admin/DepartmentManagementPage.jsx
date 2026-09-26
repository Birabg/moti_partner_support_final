// src/pages/admin/DepartmentManagementPage.jsx

import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  GitBranch,
  Layers3,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { DepartmentApi } from "../../api/departmentApi";
import { DivisionApi } from "../../api/divisionApi";
import { SectionApi } from "../../api/sectionApi";

import AdminPageHero from "../../components/admin/AdminPageHero";

import DepartmentTabs from "../../components/department/DepartmentTabs";
import DepartmentHierarchyView from "../../components/department/DepartmentHierarchyView";

import DepartmentStatistics from "../../components/department/DepartmentStatistics";
import DepartmentSearch from "../../components/department/DepartmentSearch";
import DepartmentForm from "../../components/department/DepartmentForm";
import DepartmentTable from "../../components/department/DepartmentTable";

import DivisionSearch from "../../components/department/DivisionSearch";
import DivisionForm from "../../components/department/DivisionForm";
import DivisionTable from "../../components/department/DivisionTable";

import SectionSearch from "../../components/department/SectionSearch";
import SectionForm from "../../components/department/SectionForm";
import SectionTable from "../../components/department/SectionTable";

import EmptyDepartment from "../../components/department/EmptyDepartment";

export default function DepartmentManagementPage() {
  const [activeTab, setActiveTab] = useState("department");

  const [departments, setDepartments] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [divisionSearch, setDivisionSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [departmentRes, divisionRes, sectionRes] =
        await Promise.all([
          DepartmentApi.getAll(),
          DivisionApi.getAll(),
          SectionApi.getAll(),
        ]);

      setDepartments(departmentRes.data.data || []);
      setDivisions(divisionRes.data.data || []);
      setSections(sectionRes.data.data || []);
    } catch (error) {
      console.error("Failed to load organization structure:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* ==========================================================
     DEPARTMENT
  ========================================================== */

  async function createDepartment(data) {
    try {
      await DepartmentApi.create(data);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function updateDepartment(id, data) {
    try {
      await DepartmentApi.update(id, data);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function deactivateDepartment(id) {
    try {
      await DepartmentApi.deactivate(id);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function reactivateDepartment(id) {
    try {
      await DepartmentApi.reactivate(id);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  /* ==========================================================
     DIVISION
  ========================================================== */

  async function createDivision(data) {
    try {
      await DivisionApi.create(data);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function updateDivision(id, data) {
    try {
      await DivisionApi.update(id, data);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function deactivateDivision(id) {
    try {
      await DivisionApi.deactivate(id);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function reactivateDivision(id) {
    try {
      await DivisionApi.reactivate(id);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  /* ==========================================================
     SECTION
  ========================================================== */

  async function createSection(data) {
    try {
      await SectionApi.create(data);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function updateSection(id, data) {
    try {
      await SectionApi.update(id, data);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function deactivateSection(id) {
    try {
      await SectionApi.deactivate(id);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function reactivateSection(id) {
    try {
      await SectionApi.reactivate(id);
      await loadData(true);
    } catch (error) {
      console.error(error);
    }
  }

  /* ==========================================================
     FILTERS
  ========================================================== */

  const filteredDepartments = useMemo(() => {
    const query = departmentSearch.trim().toLowerCase();

    return departments.filter((item) =>
      item.name?.toLowerCase().includes(query)
    );
  }, [departments, departmentSearch]);

  const filteredDivisions = useMemo(() => {
    const query = divisionSearch.trim().toLowerCase();

    return divisions.filter((item) =>
      item.name?.toLowerCase().includes(query)
    );
  }, [divisions, divisionSearch]);

  const filteredSections = useMemo(() => {
    const query = sectionSearch.trim().toLowerCase();

    return sections.filter((item) =>
      item.name?.toLowerCase().includes(query)
    );
  }, [sections, sectionSearch]);

  /* ==========================================================
     ACTIVE CONFIG
  ========================================================== */

  const activeConfig = {
    department: {
      label: "Departments",
      singular: "Department",
      description:
        "Manage the primary organizational departments and their operational status.",
      icon: Building2,
      count: departments.length,
    },

    division: {
      label: "Divisions",
      singular: "Division",
      description:
        "Organize divisions within departments and maintain their current status.",
      icon: GitBranch,
      count: divisions.length,
    },

    section: {
      label: "Sections",
      singular: "Section",
      description:
        "Manage operational sections and connect them to their parent divisions.",
      icon: Layers3,
      count: sections.length,
    },

    hierarchy: {
      label: "Hierarchy",
      singular: "Hierarchy",
      description:
        "View the complete organizational hierarchy across all levels.",
      icon: Layers3,
      count: departments.length + divisions.length + sections.length,
    },
  }[activeTab];

  const ActiveIcon = activeConfig.icon;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">

          <div className="relative mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>

            <div className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <h1 className="text-lg font-semibold text-slate-900">
            Loading organization structure
          </h1>

          <p className="text-sm text-slate-500 mt-1.5">
            Preparing departments, divisions and sections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12">

      {/* ======================================================
          PREMIUM LIGHT HEADER
      ====================================================== */}

            <AdminPageHero
        eyebrow="Administration"
        title="Department Management"
        description="Manage your organizational hierarchy across departments, divisions and operational sections from one centralized workspace."
        icon={Building2}
        right={
          <>
            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-white/10
                bg-white/[0.06]
                text-white/70
                backdrop-blur-md
              "
            >
              <ShieldCheck className="w-4 h-4 text-[#8eafd8]" />
              <span className="text-xs font-semibold">
                Structure Management
              </span>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-blue-600
                border border-blue-600
                text-white
                text-sm
                font-semibold
                shadow-[0_8px_20px_-8px_rgba(37,99,235,0.65)]
                transition-all
                duration-200
                hover:bg-blue-700
                hover:border-blue-700
                hover:-translate-y-0.5
                active:translate-y-0
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span>
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </>
        }
      />

      {/* ======================================================
          TABS
      ====================================================== */}

      <section className="mt-6">

        <div
          className="
            bg-white
            rounded-2xl
            border border-slate-200
            shadow-[0_8px_30px_-20px_rgba(15,23,42,0.2)]
            p-1.5
          "
        >
          <DepartmentTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

      </section>

      {/* ======================================================
          ACTIVE SECTION HEADER
      ====================================================== */}

      <section className="mt-7">

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                w-10 h-10
                rounded-xl
                bg-blue-50
                border border-blue-100
                flex items-center justify-center
              "
            >
              <ActiveIcon className="w-5 h-5 text-blue-600" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-lg font-semibold text-slate-900">
                  {activeConfig.label}
                </h2>

                <span
                  className="
                    inline-flex
                    items-center
                    justify-center
                    min-w-6
                    h-6
                    px-2
                    rounded-full
                    bg-blue-50
                    border border-blue-100
                    text-[11px]
                    font-bold
                    text-blue-600
                  "
                >
                  {activeConfig.count}
                </span>

              </div>

              <p className="text-sm text-slate-500 mt-0.5">
                {activeConfig.description}
              </p>

            </div>

          </div>

          <div
            className="
              hidden
              lg:flex
              items-center
              gap-2
              text-xs
              font-medium
              text-slate-400
            "
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live organizational data
          </div>

        </div>

      </section>

      {/* ======================================================
          HIERARCHY VIEW
      ====================================================== */}

      {activeTab === "hierarchy" && (
        <div className="mt-5">
          <DepartmentHierarchyView
            departments={departments}
            divisions={divisions}
            sections={sections}
            onUpdateDepartment={updateDepartment}
            onDeactivateDepartment={deactivateDepartment}
            onReactivateDepartment={reactivateDepartment}
            onUpdateDivision={updateDivision}
            onDeactivateDivision={deactivateDivision}
            onReactivateDivision={reactivateDivision}
            onUpdateSection={updateSection}
            onDeactivateSection={deactivateSection}
            onReactivateSection={reactivateSection}
          />
        </div>
      )}

      {/* ======================================================
          DEPARTMENT
      ====================================================== */}

      {activeTab === "department" && (
        <div className="mt-5 space-y-5">

          <DepartmentStatistics
            departments={departments}
          />

          {/* Directory + Form */}
          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_8px_35px_-25px_rgba(15,23,42,0.25)]
              overflow-hidden
            "
          >

            <div
              className="
                px-5 py-4
                border-b border-slate-100
                bg-slate-50/40
              "
            >

              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-4
                "
              >

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Department Directory
                    </h3>

                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />

                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Search and manage existing departments.
                  </p>

                </div>

                <div className="w-full lg:w-[340px]">

                  <DepartmentSearch
                    search={departmentSearch}
                    setSearch={setDepartmentSearch}
                  />

                </div>

              </div>

            </div>

            <div className="p-5">

              <DepartmentForm
                onSubmit={createDepartment}
              />

            </div>

          </div>

          {/* Table */}
          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_8px_35px_-25px_rgba(15,23,42,0.25)]
              overflow-hidden
            "
          >

            <div
              className="
                px-5 py-4
                border-b border-slate-100
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div>

                <h3 className="text-sm font-semibold text-slate-900">
                  All Departments
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {filteredDepartments.length} department
                  {filteredDepartments.length !== 1 ? "s" : ""} displayed
                </p>

              </div>

              <div
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active management
              </div>

            </div>

            <div className="p-5">

              {filteredDepartments.length === 0 ? (
                <EmptyDepartment />
              ) : (
                <DepartmentTable
                  departments={filteredDepartments}
                  onUpdate={updateDepartment}
                  onDeactivate={deactivateDepartment}
                  onReactivate={reactivateDepartment}
                />
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          DIVISION
      ====================================================== */}

      {activeTab === "division" && (
        <div className="mt-5 space-y-5">

          <DepartmentStatistics
            divisions={divisions}
            type="division"
          />

          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_8px_35px_-25px_rgba(15,23,42,0.25)]
              overflow-hidden
            "
          >

            <div
              className="
                px-5 py-4
                border-b border-slate-100
                bg-slate-50/40
              "
            >

              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-4
                "
              >

                <div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    Division Directory
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Search and create divisions within your organization.
                  </p>

                </div>

                <div className="w-full lg:w-[340px]">

                  <DivisionSearch
                    search={divisionSearch}
                    setSearch={setDivisionSearch}
                  />

                </div>

              </div>

            </div>

            <div className="p-5">

              <DivisionForm
                departments={departments}
                onSubmit={createDivision}
              />

            </div>

          </div>

          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_8px_35px_-25px_rgba(15,23,42,0.25)]
              overflow-hidden
            "
          >

            <div className="px-5 py-4 border-b border-slate-100">

              <h3 className="text-sm font-semibold text-slate-900">
                All Divisions
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {filteredDivisions.length} division
                {filteredDivisions.length !== 1 ? "s" : ""} displayed
              </p>

            </div>

            <div className="p-5">

              {filteredDivisions.length === 0 ? (
                <EmptyDepartment />
              ) : (
                <DivisionTable
                  divisions={filteredDivisions}
                  departments={departments}
                  onUpdate={updateDivision}
                  onDeactivate={deactivateDivision}
                  onReactivate={reactivateDivision}
                />
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          SECTION
      ====================================================== */}

      {activeTab === "section" && (
        <div className="mt-5 space-y-5">

          <DepartmentStatistics
            sections={sections}
            type="section"
          />

          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_8px_35px_-25px_rgba(15,23,42,0.25)]
              overflow-hidden
            "
          >

            <div
              className="
                px-5 py-4
                border-b border-slate-100
                bg-slate-50/40
              "
            >

              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-4
                "
              >

                <div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    Section Directory
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Search and create operational sections.
                  </p>

                </div>

                <div className="w-full lg:w-[340px]">

                  <SectionSearch
                    search={sectionSearch}
                    setSearch={setSectionSearch}
                  />

                </div>

              </div>

            </div>

            <div className="p-5">

              <SectionForm
                departments={departments}
                divisions={divisions}
                onSubmit={createSection}
              />

            </div>

          </div>

          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              shadow-[0_8px_35px_-25px_rgba(15,23,42,0.25)]
              overflow-hidden
            "
          >

            <div className="px-5 py-4 border-b border-slate-100">

              <h3 className="text-sm font-semibold text-slate-900">
                All Sections
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {filteredSections.length} section
                {filteredSections.length !== 1 ? "s" : ""} displayed
              </p>

            </div>

            <div className="p-5">

              {filteredSections.length === 0 ? (
                <EmptyDepartment />
              ) : (
                <SectionTable
                  sections={filteredSections}
                  departments={departments}
                  divisions={divisions}
                  onUpdate={updateSection}
                  onDeactivate={deactivateSection}
                  onReactivate={reactivateSection}
                />
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
