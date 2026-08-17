import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  OrganizationApi,
} from "../../api/organizationApi";

export default function OrganizationDetailsPage() {
  const { id } = useParams();

  const [
    organization,
    setOrganization,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    loadOrganization();
  }, []);

  async function loadOrganization() {
    try {
      setLoading(true);

      const response =
        await OrganizationApi.getById(
          id
        );

      setOrganization(
        response.data.data
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <h1>
        Loading....
      </h1>
    );
  }

  if (!organization) {
    return (
      <h1>
        Organization Not Found
      </h1>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="
        bg-white
        rounded-lg
        shadow-sm
        p-8
        "
      >
        <h1
          className="
          text-3xl
          font-medium
          "
        >
          {organization.name}
        </h1>

        <p className="mt-5">
          Status :

          {" "}

          {organization.isActive
            ? "Active"
            : "Inactive"}
        </p>

        <p>
          Total Customers :

          {" "}

          {
            organization.customers
              ?.length
          }
        </p>
      </div>

      <div
        className="
        bg-white
        rounded-lg
        shadow-sm
        p-8
        "
      >
        <h2
          className="
          text-3xl
          font-medium
          mb-6
          "
        >
          Customers
        </h2>

        {organization.customers
          ?.length === 0 ? (
          <h3>
            No Customers Yet.
          </h3>
        ) : (
          <div
            className="
            grid
            md:grid-cols-2
            gap-8
            "
          >
            {organization.customers.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="
                  border
                  rounded-lg
                  p-5
                  "
                >
                  <h2>
                    {
                      item.firstName
                    }
                    {" "}
                    {
                      item.middleName
                    }
                    {" "}
                    {
                      item.lastName
                    }
                  </h2>

                  <p>
                    {
                      item.email
                    }
                  </p>

                  <p>
                    {
                      item.status
                    }
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}