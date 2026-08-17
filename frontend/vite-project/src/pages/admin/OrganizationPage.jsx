// OrganizationPage.jsx

import { useEffect, useState } from "react";

import { OrganizationApi } from "../../api/organizationApi";

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
      window.localStorage.setItem('partner_support_organizations', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('organizations:updated', { detail: list }));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization(data) {
    try {
      await OrganizationApi.create(data);

      await loadOrganizations();
    } catch (error) {
      console.log(error);
    }
  }

  async function deactivateOrganization(id) {
    try {
      await OrganizationApi.deactivate(id);

      await loadOrganizations();
    } catch (error) {
      console.log(error);
    }
  }

  async function reactivateOrganization(id) {
    try {
      await OrganizationApi.reactivate(id);

      await loadOrganizations();
    } catch (error) {
      console.log(error);
    }
  }

  const filteredOrganizations = organizations.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <h1 className="text-3xl font-bold">
          Loading Organizations...
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TITLE + SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organization Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Create, manage and monitor all customer organizations.
          </p>
        </div>

        <div className="w-full lg:w-[350px]">
          <OrganizationSearch
            search={search}
            setSearch={setSearch}
          />
        </div>
      </div>

      {/* STATISTICS */}
      <OrganizationStatistics
        organizations={organizations}
      />

      {/* CREATE FORM */}
      <OrganizationForm
        onSubmit={createOrganization}
      />

      {/* TABLE */}
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