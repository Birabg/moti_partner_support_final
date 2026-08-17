import { useEffect, useState } from "react";

import { OrganizationApi } from "../../api/organizationApi";

import OrganizationStatistics from "../../components/organization/OrganizationStatistics";
import OrganizationTable from "../../components/organization/OrganizationTable";
import OrganizationForm from "../../components/organization/OrganizationForm";
import EmptyOrganization from "../../components/organization/EmptyOrganization";

export default function OrganizationPage() {
  const [organizations, setOrganizations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);

      const response =
        await OrganizationApi.getAll();

      setOrganizations(
        response.data.data || []
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization(data) {
    try {
      await OrganizationApi.create(
        data
      );

      await loadOrganizations();

      alert(
        "Organization created successfully."
      );
    } catch (error) {
      console.log(error);

      alert(
        "Failed to create organization."
      );
    }
  }

  async function deactivateOrganization(
    id
  ) {
    try {
      await OrganizationApi.deactivate(
        id
      );

      await loadOrganizations();

      alert(
        "Organization deactivated successfully."
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function reactivateOrganization(
    id
  ) {
    try {
      await OrganizationApi.reactivate(
        id
      );

      await loadOrganizations();

      alert(
        "Organization reactivated successfully."
      );
    } catch (error) {
      console.log(error);
    }
  }

  if (loading) {
    return (
      <div
        className="
        min-h-[70vh]
        flex
        items-center
        justify-center
        "
      >
        <h1
          className="
          text-4xl
          font-bold
          "
        >
          Loading Organizations...
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1
          className="
          text-3xl
          font-medium
          text-slate-800
          "
        >
          Organization Management
        </h1>

        <p
          className="
          text-gray-500
          mt-2
          "
        >
          Manage all registered
          organizations.
        </p>
      </div>

      <OrganizationStatistics
        organizations={
          organizations
        }
      />

      <OrganizationForm
        onSubmit={
          createOrganization
        }
      />

      {organizations.length === 0 ? (
        <EmptyOrganization />
      ) : (
        <OrganizationTable
          organizations={
            organizations
          }
          onDeactivate={
            deactivateOrganization
          }
          onReactivate={
            reactivateOrganization
          }
        />
      )}
    </div>
  );
}