// src/pages/admin/ApprovalPage.jsx

import { useEffect, useState } from "react";

import { ApprovalApi } from "../../api/approvalApi";
import { useAuth } from "../../context/useAuth";
import { PermissionApi } from "../../api/permissionApi";
import { UserApi } from "../../api/userApi";
import Axios from "../../api/axios";

import PendingCustomerTable from "../../components/approval/PendingCustomerTable";
import PendingStaffTable from "../../components/approval/PendingStaffTable";
import ApprovalStatistics from "../../components/approval/ApprovalStatistics";
import EmptyPendingApproval from "../../components/approval/EmptyPendingApproval";
import ApprovedUsersTable from "../../components/approval/ApprovedUsersTable";
import UserDetailsModal from "../../components/approval/UserDetailsModal";
import PermissionModal from "../../components/approval/PermissionModal";

export default function ApprovalPage() {
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
    const { user } = useAuth ? useAuth() : { user: null };

    useEffect(() => {

        initialize();

    }, []);

    const initialize =
        async () => {

            await Promise.all([

                loadPending(),
                loadApproved(),

            ]);

            setLoading(false);
        };

    async function loadPending() {

        try {

            const response = await ApprovalApi.getPending();

            setCustomers(
                response.data?.data
                    ?.customers || []
            );

            setStaff(
                response.data?.data
                    ?.staff || []
            );

        } catch (error) {

            console.log(error);

            setCustomers([]);
            setStaff([]);
        }
    }

   async function loadApproved() {
    try {
        const response =
            await UserApi.getAllApproved();

        setApprovedUsers(
            response.data?.data || []
        );
    } catch (error) {
        console.log(error);

        setApprovedUsers([]);
    }
}

    async function approveUser(
        idOrPayload,
        type,
        role,
        managerType,
        departmentId,
        divisionId,
        sectionId,
    ) {
        try {
            const payload =
                typeof idOrPayload === "object" && idOrPayload !== null
                    ? idOrPayload
                    : {
                        userId: idOrPayload,
                        userType: type,
                        role,
                        managerType,
                        departmentId,
                        divisionId,
                        sectionId,
                    };

            await ApprovalApi.approve(payload);

            await loadPending();
            await loadApproved();

            alert("User approved successfully.");

        } catch (error) {

            console.log(error);

            alert(
                error?.response?.data?.message ||
                "Failed to approve user."
            );
        }
    }

    async function rejectUser(
        id,
        type,
    ) {

        try {

            await ApprovalApi
                .reject(
                    id,
                    type
                );

            await loadPending();

            alert(
                "User rejected successfully."
            );

        } catch (error) {

            console.log(error);

            alert(
                "Failed to reject user."
            );
        }
    }

    function openDetails(user) {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    }

    function closeDetails() {
        setSelectedUser(null);
        setIsDetailsOpen(false);
    }

    function openPermission(user) {
        setSelectedUser(user);
        setIsPermissionOpen(true);
    }

    function closePermission() {
        setSelectedUser(null);
        setIsPermissionOpen(false);
    }

    async function handleUserSave(id, data) {
        try {
            await UserApi.update(id, data);
            await loadApproved();
            closeDetails();
            alert("User details updated successfully.");
        } catch (error) {
            console.log(error);
            alert(
                error?.response?.data?.message ||
                "Failed to update user details."
            );
        }
    }

    async function handleGrantPermissions(targetStaffId, permissionCodes) {
        try {
            if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
                alert("Please select at least one permission.");
                return;
            }

            await PermissionApi.grant(targetStaffId, permissionCodes);
            await loadApproved();
            closePermission();
            alert("Permissions granted successfully.");
        } catch (error) {
            console.log(error);
            alert(
                error?.response?.data?.message ||
                "Failed to grant permissions."
            );
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
                    text-3xl
                    font-bold
                    text-slate-600
                    "
                >
                    Loading Approval
                    Center...
                </h1>
            </div>
        );
    }

    return (

        <div
            className="
            space-y-10
            "
        >

            {/* HEADER */}

            <div>

                <h1
                    className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    "
                >
                    Approval Center
                </h1>

                <p
                    className="
                    text-sm
                    text-slate-500
                    mt-1
                    "
                >
                    Manage pending
                    registrations and
                    approved users.
                </p>

            </div>

            {/* STATISTICS */}

            <ApprovalStatistics
                customers={
                    customers
                }
                staff={
                    staff
                }
            />

            {/* EMPTY STATE */}

            {
                customers.length ===
                    0 &&
                    staff.length ===
                    0 &&
                    approvedUsers.length ===
                    0 && (

                        <EmptyPendingApproval
                            refresh={
                                initialize
                            }
                        />
                    )
            }

            {/* PENDING CUSTOMERS */}

            {
                customers.length >
                0 && (

                    <PendingCustomerTable
                        customers={
                            customers
                        }
                        approveUser={
                            approveUser
                        }
                        rejectUser={
                            rejectUser
                        }
                    />
                )
            }

            {/* PENDING STAFF */}

            {
                staff.length > 0 && (

                    <PendingStaffTable
                        staff={
                            staff
                        }
                        approveUser={
                            approveUser
                        }
                        rejectUser={
                            rejectUser
                        }
                    />
                )
            }

            {/* APPROVED USERS */}

            <ApprovedUsersTable
                users={approvedUsers}
                        onViewDetails={openDetails}
                        onAddPermission={openPermission}
                        onDeactivate={async (id, type) => {
                            if (!confirm("Are you sure you want to deactivate this account?")) return;
                            try {
                                await ApprovalApi.deactivate(id, type);
                                await loadApproved();
                                alert("User deactivated successfully.");
                            } catch (err) {
                                console.error(err);
                                alert(err?.response?.data?.message || "Failed to deactivate user.");
                            }
                        }}
                        onReactivate={async (id, type) => {
                            if (!confirm("Reactivate this account?")) return;
                            try {
                                await ApprovalApi.reactivate(id, type);
                                await loadApproved();
                                alert("User reactivated successfully.");
                            } catch (err) {
                                console.error(err);
                                alert(err?.response?.data?.message || "Failed to reactivate user.");
                            }
                        }}
                        isSystemAdmin={Boolean(user?.isSAdmin)}
            />

            {isDetailsOpen && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={closeDetails}
                    onSave={handleUserSave}
                />
            )}

            {isPermissionOpen && selectedUser && (
                <PermissionModal
                    user={selectedUser}
                    onClose={closePermission}
                    onSave={handleGrantPermissions}
                />
            )}

        </div>
    );
}