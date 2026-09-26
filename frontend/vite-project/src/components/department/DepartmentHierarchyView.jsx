import { useMemo, useState } from "react";
import {
  Building2,
  GitBranch,
  Layers3,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Pencil,
  Power,
  RotateCcw,
} from "lucide-react";
import { isStructureActive } from "./StructureTableUtils";
import { Toolbar } from "./StructureTableKit";

function DepartmentHierarchyView({
  departments = [],
  divisions = [],
  sections = [],
  onUpdateDepartment,
  onDeactivateDepartment,
  onReactivateDepartment,
  onUpdateDivision,
  onDeactivateDivision,
  onReactivateDivision,
  onUpdateSection,
  onDeactivateSection,
  onReactivateSection,
}) {
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [expandedDivisions, setExpandedDivisions] = useState(new Set());

  const getDivisionsForDepartment = useMemo(() => {
    const map = {};
    divisions.forEach((division) => {
      if (!map[division.departmentId]) map[division.departmentId] = [];
      map[division.departmentId].push(division);
    });
    return map;
  }, [divisions]);

  const getSectionsForDivision = useMemo(() => {
    const map = {};
    sections.forEach((section) => {
      if (!map[section.divisionId]) map[section.divisionId] = [];
      map[section.divisionId].push(section);
    });
    return map;
  }, [sections]);

  const toggleDepartment = (departmentId) => {
    setExpandedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(departmentId)) next.delete(departmentId);
      else next.add(departmentId);
      return next;
    });
  };

  const toggleDivision = (divisionId) => {
    setExpandedDivisions((prev) => {
      const next = new Set(prev);
      if (next.has(divisionId)) next.delete(divisionId);
      else next.add(divisionId);
      return next;
    });
  };

  function renderSection(section, onUpdateSection, onDeactivateSection, onReactivateSection) {
    const isSectionActive = section.isActive !== false && section.status !== "INACTIVE";
    return (
      <div key={section.id} className="px-5 py-3 bg-white hover:bg-slate-50/40 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {section.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </span>
            <div className="flex items-center justify-end gap-1.5">
              {onUpdateSection && (
                <button
                  type="button"
                  onClick={() => onUpdateSection(section.id, { name: section.name, divisionId: section.divisionId })}
                  title="Edit section"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {isSectionActive && onDeactivateSection && (
                <button
                  type="button"
                  onClick={() => onDeactivateSection(section.id)}
                  title="Deactivate section"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDivision(division, onUpdateDivision, onDeactivateDivision, onReactivateDivision, onUpdateSection, onDeactivateSection, onReactivateSection) {
    const isDivisionActive = division.isActive !== false && division.status !== "INACTIVE";
    const divisionSections = getSectionsForDivision[division.id] || [];
    const isDivisionExpanded = expandedDivisions.has(division.id);

    return (
      <div key={division.id} className="group">
        <div className="px-5 py-3 bg-white hover:bg-slate-50/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleDivision(division.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
                aria-label={expandedDivisions.has(division.id) ? "Collapse" : "Expand"}
              >
                {expandedDivisions.has(division.id) ? (
                  <ChevronDown className="h-5 w-5 text-slate-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                )}
              </button>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {division.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {getSectionsForDivision[division.id]?.length || 0} section
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
              <div className="flex items-center justify-end gap-1.5">
                {onUpdateDivision && (
                  <button
                    type="button"
                    onClick={() => onUpdateDivision(division.id, { name: division.name, departmentId: division.departmentId })}
                    title="Edit division"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {isDivisionActive && onDeactivateDivision && (
                  <button
                    type="button"
                    onClick={() => onDeactivateDivision(division.id)}
                    title="Deactivate division"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                )}
                {!isDivisionActive && onReactivateDivision && (
                  <button
                    type="button"
                    onClick={() => onReactivateDivision(division.id)}
                    title="Reactivate division"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {expandedDivisions.has(division.id) && getSectionsForDivision[division.id]?.length > 0 ? (
          <div className="pl-8 border-l border-slate-200">
            {getSectionsForDivision[division.id].map((section) =>
              renderSection(section, onUpdateSection, onDeactivateSection, onReactivateSection)
            )}
          </div>
        ) : null}
      </div>
    );
  }

  function renderDepartment(department, onUpdateDepartment, onDeactivateDepartment, onReactivateDepartment,
    onUpdateDivision, onDeactivateDivision, onReactivateDivision,
    onUpdateSection, onDeactivateSection, onReactivateSection) {
    const isDepartmentActive = department.isActive !== false && department.status !== "INACTIVE";
    const departmentDivisions = getDivisionsForDepartment[department.id] || [];
    const isExpanded = expandedDepartments.has(department.id);

    return (
      <div key={department.id} className="group">
        <div className="px-5 py-4 bg-slate-50/40 hover:bg-slate-50/60 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleDepartment(department.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"
                aria-label={expandedDepartments.has(department.id) ? "Collapse" : "Expand"}
              >
                {expandedDepartments.has(department.id) ? (
                  <ChevronDown className="h-5 w-5 text-slate-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                )}
              </button>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {department.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {departmentDivisions.length} division
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
              <div className="flex items-center justify-end gap-1.5">
                {onUpdateDepartment && (
                  <button
                    type="button"
                    onClick={() => onUpdateDepartment(department.id, { name: department.name })}
                    title="Edit department"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {isDepartmentActive && onDeactivateDepartment && (
                  <button
                    type="button"
                    onClick={() => onDeactivateDepartment(department.id)}
                    title="Deactivate department"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {expandedDepartments.has(department.id) && departmentDivisions.length > 0 ? (
          <div className="pl-12 border-l border-slate-200">
            {departmentDivisions.map((division) =>
              renderDivision(
                division,
                onUpdateDivision,
                onDeactivateDivision,
                onReactivateDivision,
                onUpdateSection,
                onDeactivateSection,
                onReactivateSection
              )
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <Toolbar
        total={departments.length}
        filtered={departments.length}
        status="ALL"
        onStatusChange={() => {}}
        onClear={() => {}}
        hasExtraFilters={false}
        noun="department"
      />

      <div className="divide-y divide-slate-100">
        {departments.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px] text-slate-400">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto text-slate-300" />
              <p className="mt-3 text-slate-500">No departments found</p>
            </div>
          </div>
        ) : (
          departments.map((department) =>
            renderDepartment(
              department,
              onUpdateDepartment,
              onDeactivateDepartment,
              onReactivateDepartment,
              onUpdateDivision,
              onDeactivateDivision,
              onReactivateDivision,
              onUpdateSection,
              onDeactivateSection,
              onReactivateSection
            )
          )
        )}
      </div>
    </div>
  );
}

export default DepartmentHierarchyView;