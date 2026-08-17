import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { OrganizationApi } from "../../api/organizationApi";
import OrganizationEditModal from "../../components/organization/OrganizationEditModal";

export default function OrganizationDetailsPage() {
    const { id } = useParams();

    const [organization, setOrganization] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadOrganization();
    }, [id]);

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

            setOrganization(null);
        } finally {
            setLoading(false);
        }
    }

    async function updateOrganization(
        organizationId,
        data
    ) {
        try {
            await OrganizationApi.update(
                organizationId,
                data
            );

            await loadOrganization();

            alert(
                "Organization updated successfully."
            );
        } catch (error) {
            console.log(error);

            alert(
                "Failed to update organization."
            );
        }
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <h1 className="text-3xl font-bold">
                    Loading Organization...
                </h1>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <h1 className="text-3xl font-bold">
                    Organization Not Found
                </h1>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Organization Details */}

            <div
                className="
                bg-white
                rounded-lg
                border border-navy-100
                shadow-sm
                p-6
                "
            >
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">Organization</p>
                <h1
                    className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    mt-1
                    "
                >
                    {organization.name}
                </h1>

                <div className="mt-6 space-y-3">

                    <p className="text-lg">
                        <span className="font-semibold">
                            Status:
                        </span>{" "}
                        {organization.isActive
                            ? "Active"
                            : "Inactive"}
                    </p>

                    <p className="text-lg">
                        <span className="font-semibold">
                            Total Customers:
                        </span>{" "}
                        {
                            organization
                                .customers
                                ?.length
                        }
                    </p>

                </div>
            </div>

            <OrganizationEditModal
                organization={organization}
                onUpdate={updateOrganization}
            />

           
            {/* Customer Table */}

            <div
                className="
                bg-white
                rounded-lg
                border border-navy-100
                shadow-sm
                p-6
                "
            >
                <h2
                    className="
                    text-lg
                    font-semibold
                    text-slate-900
                    mb-4
                    "
                >
                    Organization Customers
                </h2>

                <div className="overflow-x-auto">

                    <Table className="w-full">

                        <TableHeader>

                            <TableRow
                                className="
                                border-b
                                h-14
                                text-left
                                "
                            >
                                <TableHead>Name</TableHead>

                                <TableHead>Email</TableHead>

                                <TableHead>Status</TableHead>

                                <TableHead>Created Date</TableHead>
                            </TableRow>

                        </TableHeader>

                        <TableBody>

                            {organization
                                .customers
                                ?.length > 0 ? (

                                organization.customers.map(
                                    (
                                        customer
                                    ) => (
                                        <TableRow
                                            key={
                                                customer.id
                                            }
                                            className="
                                            border-b
                                            h-16
                                            "
                                        >
                                            <TableCell>
                                                {
                                                    customer.firstName
                                                }{" "}
                                                {
                                                    customer.middleName
                                                }{" "}
                                                {
                                                    customer.lastName
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    customer.email
                                                }
                                            </TableCell>

                                            <TableCell>

                                                <span
                                                    className={`
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    text-sm
                                                    ${
                                                        customer.status ===
                                                        "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }
                                                    `}
                                                >
                                                    {
                                                        customer.status
                                                    }
                                                </span>

                                            </TableCell>

                                            <TableCell>
                                                {new Date(
                                                    customer.createdAt
                                                ).toLocaleDateString()}
                                            </TableCell>

                                        </TableRow>
                                    )
                                )

                            ) : (

                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="
                                        text-center
                                        py-8
                                        text-slate-500
                                        "
                                    >
                                        No Customers Found.
                                    </TableCell>
                                </TableRow>

                            )}

                        </TableBody>

                    </Table>

                </div>

            </div>

         

        </div>
    );
}