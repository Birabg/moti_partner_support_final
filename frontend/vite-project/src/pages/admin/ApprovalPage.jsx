// src/pages/admin/ApprovalPage.jsx

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Users,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

import { ApprovalApi } from "../../api/approvalApi";
import { useAuth } from "../../context/useAuth";
import { PermissionApi } from "../../api/permissionApi";
import { UserApi } from "../../api/userApi";

import AdminPageHero from "../../components/admin/AdminPageHero";
import ApprovalStatistics from "../../components/approval/ApprovalStatistics";
import PendingCustomerTable from "../../components/approval/PendingCustomerTable";
import PendingStaffTable from "../../components/approval/PendingStaffTable";
import EmptyPendingApproval from "../../components/approval/EmptyPendingApproval";
import ApprovedUsersTable from "../../components/approval/ApprovedUsersTable";
import UserDetailsModal from "../../components/approval/UserDetailsModal";
import PermissionModal from "../../components/approval/PermissionModal";

export default function ApprovalPage() {
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);

  const { user } = useAuth();

  /* =========================================================
      INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      setRefreshing(true);

      await Promise.all([
        loadPending(),
        loadApproved(),
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =========================================================
      LOAD PENDING USERS
  ========================================================= */

  async function loadPending() {
    try {
      const response = await ApprovalApi.getPending();

      setCustomers(
        response.data?.data?.customers || []
      );

      setStaff(
        response.data?.data?.staff || []
      );
    } catch (error) {
      console.error(
        "Failed to load pending users:",
        error
      );

      setCustomers([]);
      setStaff([]);
    }
  }

  /* =========================================================
      LOAD APPROVED USERS
  ========================================================= */

  async function loadApproved() {
    try {
      const response =
        await UserApi.getAllApproved();

      setApprovedUsers(
        response.data?.data || []
      );
    } catch (error) {
      console.error(
        "Failed to load approved users:",
        error
      );

      setApprovedUsers([]);
    }
  }

  /* =========================================================
      APPROVE USER
  ========================================================= */

  async function approveUser(
    idOrPayload,
    type,
    role,
    managerType,
    departmentId,
    divisionId,
    sectionId
  ) {
    try {
      const payload =
        typeof idOrPayload === "object" &&
        idOrPayload !== null
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

      await Promise.all([
        loadPending(),
        loadApproved(),
      ]);

      alert("User approved successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to approve user."
      );
    }
  }

  /* =========================================================
      REJECT USER
  ========================================================= */

  async function rejectUser(id, type) {
    try {
      await ApprovalApi.reject(id, type);

      await loadPending();

      alert("User rejected successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to reject user."
      );
    }
  }

  /* =========================================================
      DETAILS
  ========================================================= */

  function openDetails(targetUser) {
    setSelectedUser(targetUser);
    setIsDetailsOpen(true);
  }

  function closeDetails() {
    setSelectedUser(null);
    setIsDetailsOpen(false);
  }

  /* =========================================================
      PERMISSIONS
  ========================================================= */

  function openPermission(targetUser) {
    setSelectedUser(targetUser);
    setIsPermissionOpen(true);
  }

  function closePermission() {
    setSelectedUser(null);
    setIsPermissionOpen(false);
  }

  /* =========================================================
      UPDATE USER
  ========================================================= */

  async function handleUserSave(id, data) {
    try {
      await UserApi.update(id, data);

      await loadApproved();

      closeDetails();

      alert(
        "User details updated successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to update user details."
      );
    }
  }

  /* =========================================================
      GRANT PERMISSIONS
  ========================================================= */

  async function handleGrantPermissions(
    targetStaffId,
    permissionCodes
  ) {
    try {
      if (
        !Array.isArray(permissionCodes) ||
        permissionCodes.length === 0
      ) {
        alert(
          "Please select at least one permission."
        );

        return;
      }

      await PermissionApi.grant(
        targetStaffId,
        permissionCodes
      );

      await loadApproved();

      closePermission();

      alert(
        "Permissions granted successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to grant permissions."
      );
    }
  }

  /* =========================================================
      DEACTIVATE
  ========================================================= */

  async function handleDeactivate(id, type) {
    if (
      !confirm(
        "Are you sure you want to deactivate this account?"
      )
    ) {
      return;
    }

    try {
      await ApprovalApi.deactivate(id, type);

      await loadApproved();

      alert(
        "User deactivated successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to deactivate user."
      );
    }
  }

  /* =========================================================
      REACTIVATE
  ========================================================= */

  async function handleReactivate(id, type) {
    if (
      !confirm(
        "Reactivate this account?"
      )
    ) {
      return;
    }

    try {
      await ApprovalApi.reactivate(id, type);

      await loadApproved();

      alert(
        "User reactivated successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to reactivate user."
      );
    }
  }

  /* =========================================================
      COUNTS
  ========================================================= */

  const totalPending =
    customers.length + staff.length;

  /* =========================================================
      LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">

          <div
            className="
              relative
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-[#dbe7f8]
              bg-[#edf4fd]
            "
          >
            <ShieldCheck
              className="
                h-6
                w-6
                animate-pulse
                text-[#527eb9]
              "
            />
          </div>

          <h1
            className="
              mt-5
              text-lg
              font-bold
              tracking-[-0.02em]
              text-[#101a28]
            "
          >
            Loading Approval Center
          </h1>

          <p
            className="
              mt-1.5
              text-sm
              text-slate-500
            "
          >
            Preparing registrations and user approvals...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================================
      PAGE
  ========================================================= */

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-14">

      {/* =====================================================
          HEADER
      ===================================================== */}

            <AdminPageHero
        eyebrow="Administration"
        title="Approval Center"
        description="Review registrations, approve new users, manage permissions, and maintain the organization's active user directory."
        icon={ShieldCheck}
        right={
          <>
            <div
              className="
                hidden
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.06]
                px-3.5
                py-2.5
                backdrop-blur-md
                sm:flex
              "
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-white/65">
                System operational
              </span>
            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.06]
                px-3.5
                py-2.5
                backdrop-blur-md
                md:flex
              "
            >
              <Clock3 className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-xs font-semibold text-white/65">
                {totalPending} awaiting review
              </span>
            </div>

            <button
              type="button"
              onClick={initialize}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.08]
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                backdrop-blur-md
                transition-all
                duration-200
                hover:bg-white/[0.14]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </>
        }
      />

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="mt-7">

        <div
          className="
            mb-4
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>

            <div
              className="
                mb-1
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#567fbd]
                "
              >
                Overview
              </span>

              <span className="h-1 w-1 rounded-full bg-emerald-500" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-emerald-600
                "
              >
                Live
              </span>
            </div>

            <h2
              className="
                text-lg
                font-bold
                tracking-[-0.02em]
                text-[#101a28]
              "
            >
              Approval activity
            </h2>

          </div>

          <div
            className="
              hidden
              items-center
              gap-2
              text-xs
              text-slate-400
              sm:flex
            "
          >
            <Activity className="h-3.5 w-3.5" />
            User management
          </div>
        </div>

        <ApprovalStatistics
          customers={customers}
          staff={staff}
        />

      </section>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {customers.length === 0 &&
        staff.length === 0 &&
        approvedUsers.length === 0 && (
          <section className="mt-7">
            <EmptyPendingApproval
              refresh={initialize}
            />
          </section>
        )}

      {/* =====================================================
          PENDING CUSTOMERS
      ===================================================== */}

      {customers.length > 0 && (
        <section className="mt-8">

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#dbe7f8]
                    bg-[#edf4fd]
                  "
                >
                  <UserPlus className="h-4 w-4 text-[#527eb9]" />
                </div>

                <div className="flex items-center gap-2">

                  <h2
                    className="
                      text-base
                      font-bold
                      tracking-[-0.02em]
                      text-[#101a28]
                    "
                  >
                    Pending Customers
                  </h2>

                  <span
                    className="
                      inline-flex
                      h-6
                      min-w-6
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#dbe7f8]
                      bg-[#edf4fd]
                      px-2
                      text-[11px]
                      font-bold
                      text-[#527eb9]
                    "
                  >
                    {customers.length}
                  </span>

                </div>

              </div>

              <p
                className="
                  mt-1.5
                  ml-12
                  text-xs
                  text-slate-400
                "
              >
                Review and approve newly registered customers.
              </p>

            </div>

            <div
              className="
                hidden
                items-center
                gap-1.5
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-slate-400
                md:flex
              "
            >
              Customer queue
              <ArrowUpRight className="h-3 w-3" />
            </div>

          </div>

          <div
            className="
              overflow-hidden
              rounded-[22px]
              border
              border-slate-200/80
              bg-white
              shadow-[0_8px_30px_rgba(16,32,55,0.045)]
            "
          >
            <PendingCustomerTable
              customers={customers}
              approveUser={approveUser}
              rejectUser={rejectUser}
            />
          </div>

        </section>
      )}

      {/* =====================================================
          PENDING STAFF
      ===================================================== */}

      {staff.length > 0 && (
        <section className="mt-8">

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#f5e6c8]
                    bg-[#fff7e8]
                  "
                >
                  <Users className="h-4 w-4 text-[#c58a27]" />
                </div>

                <div className="flex items-center gap-2">

                  <h2
                    className="
                      text-base
                      font-bold
                      tracking-[-0.02em]
                      text-[#101a28]
                    "
                  >
                    Pending Staff
                  </h2>

                  <span
                    className="
                      inline-flex
                      h-6
                      min-w-6
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#f5e6c8]
                      bg-[#fff7e8]
                      px-2
                      text-[11px]
                      font-bold
                      text-[#c58a27]
                    "
                  >
                    {staff.length}
                  </span>

                </div>

              </div>

              <p
                className="
                  mt-1.5
                  ml-12
                  text-xs
                  text-slate-400
                "
              >
                Review staff accounts and assign organizational access.
              </p>

            </div>

            <div
              className="
                hidden
                items-center
                gap-1.5
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-slate-400
                md:flex
              "
            >
              Staff queue
              <ArrowUpRight className="h-3 w-3" />
            </div>

          </div>

          <div
            className="
              overflow-hidden
              rounded-[22px]
              border
              border-slate-200/80
              bg-white
              shadow-[0_8px_30px_rgba(16,32,55,0.045)]
            "
          >
            <PendingStaffTable
              staff={staff}
              approveUser={approveUser}
              rejectUser={rejectUser}
            />
          </div>

        </section>
      )}

      {/* =====================================================
          APPROVED USERS
      ===================================================== */}

      <section className="mt-10">

        <div
          className="
            mb-4
            flex
            flex-col
            gap-3
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div>

            <div className="flex items-center gap-3">

<div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#d2eae2]
                    bg-[#edf7f3]
                  "
                >
                  <CheckCircle2 className="h-4 w-4 text-[#3b8d73]" />
                </div>

                <div className="flex items-center gap-2">

                  <h2
                    className="
                      text-base
                      font-bold
                      tracking-[-0.02em]
                      text-[#101a28]
                    "
                  >
                    Approved Users
                  </h2>

                  <span
                    className="
                      inline-flex
                      h-6
                      min-w-6
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#d2eae2]
                      bg-[#edf7f3]
                      px-2
                      text-[11px]
                      font-bold
                      text-[#3b8d73]
                    "
                  >
                    {approvedUsers.length}
                  </span>

                </div>

            </div>

            <p
              className="
                mt-1.5
                ml-12
                text-xs
                text-slate-400
              "
            >
              Manage approved accounts, permissions, and account status.
            </p>

          </div>

          <div
            className="
              hidden
              items-center
              gap-2
              text-xs
              text-slate-400
              md:flex
            "
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Protected administration
          </div>

        </div>

        <div
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-slate-200/80
            bg-white
            shadow-[0_8px_30px_rgba(16,32,55,0.045)]
          "
        >
          <ApprovedUsersTable
            users={approvedUsers}
            onViewDetails={openDetails}
            onAddPermission={openPermission}
            onDeactivate={handleDeactivate}
            onReactivate={handleReactivate}
            isSystemAdmin={Boolean(user?.isSAdmin)}
          />
        </div>

      </section>

      {/* =====================================================
          USER DETAILS MODAL
      ===================================================== */}

      {isDetailsOpen && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={closeDetails}
          onSave={handleUserSave}
        />
      )}

      {/* =====================================================
          PERMISSION MODAL
      ===================================================== */}

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
