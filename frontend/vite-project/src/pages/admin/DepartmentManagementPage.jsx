// src/pages/admin/DepartmentManagementPage.jsx

import { useEffect, useMemo, useState } from "react";

import { DepartmentApi } from "../../api/departmentApi";
import { DivisionApi } from "../../api/divisionApi";
import { SectionApi } from "../../api/sectionApi";

import DepartmentTabs from "../../components/department/DepartmentTabs";

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

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [divisionSearch, setDivisionSearch] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [departmentRes, divisionRes, sectionRes] = await Promise.all([
        DepartmentApi.getAll(),
        DivisionApi.getAll(),
        SectionApi.getAll(),
      ]);

      setDepartments(departmentRes.data.data || []);
      setDivisions(divisionRes.data.data || []);
      setSections(sectionRes.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
      Department
  ========================================================== */

  async function createDepartment(data) {
    try {
      await DepartmentApi.create(data);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function updateDepartment(id, data) {
    try {
      await DepartmentApi.update(id, data);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function deactivateDepartment(id) {
    try {
      await DepartmentApi.deactivate(id);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function reactivateDepartment(id) {
    try {
      await DepartmentApi.reactivate(id);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  /* ==========================================================
      Division
  ========================================================== */

  async function createDivision(data) {
    try {
      await DivisionApi.create(data);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function updateDivision(id, data) {
    try {
      await DivisionApi.update(id, data);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function deactivateDivision(id) {
    try {
      await DivisionApi.deactivate(id);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function reactivateDivision(id) {
    try {
      await DivisionApi.reactivate(id);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  /* ==========================================================
      Section
  ========================================================== */

  async function createSection(data) {
    try {
      await SectionApi.create(data);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function updateSection(id, data) {
    try {
      await SectionApi.update(id, data);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function deactivateSection(id) {
    try {
      await SectionApi.deactivate(id);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  async function reactivateSection(id) {
    try {
      await SectionApi.reactivate(id);
      await loadData();
    } catch (error) {
      console.log(error);
    }
  }

  /* ==========================================================
      FILTERS
  ========================================================== */

  const filteredDepartments = useMemo(() => {
    return departments.filter((item) =>
      item.name.toLowerCase().includes(departmentSearch.toLowerCase())
    );
  }, [departments, departmentSearch]);

  const filteredDivisions = useMemo(() => {
    return divisions.filter((item) =>
      item.name.toLowerCase().includes(divisionSearch.toLowerCase())
    );
  }, [divisions, divisionSearch]);

  const filteredSections = useMemo(() => {
    return sections.filter((item) =>
      item.name.toLowerCase().includes(sectionSearch.toLowerCase())
    );
  }, [sections, sectionSearch]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <h1 className="text-3xl font-semibold">
          Loading Department Structure...
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center flex-wrap gap-4">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Department Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage Departments, Divisions and Sections.
          </p>
        </div>

      </div>

      <DepartmentTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "department" && (
        <>
          <DepartmentStatistics
            departments={departments}
          />

          <DepartmentSearch
            search={departmentSearch}
            setSearch={setDepartmentSearch}
          />

          <DepartmentForm
            onSubmit={createDepartment}
          />

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
        </>
      )}

      {activeTab === "division" && (
        <>
          <DepartmentStatistics
            divisions={divisions}
            type="division"
          />

          <DivisionSearch
            search={divisionSearch}
            setSearch={setDivisionSearch}
          />

          <DivisionForm
            departments={departments}
            onSubmit={createDivision}
          />

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
        </>
      )}

      {activeTab === "section" && (
        <>
          <DepartmentStatistics
            sections={sections}
            type="section"
          />

          <SectionSearch
            search={sectionSearch}
            setSearch={setSectionSearch}
          />

          <SectionForm
            departments={departments}
            divisions={divisions}
            onSubmit={createSection}
          />

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
        </>
      )}

    </div>
  );
}