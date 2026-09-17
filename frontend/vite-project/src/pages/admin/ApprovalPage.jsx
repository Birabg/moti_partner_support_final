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
              border-blue-100
              bg-blue-50
            "
          >
            <ShieldCheck
              className="
                h-6
                w-6
                animate-pulse
                text-blue-600
              "
            />
          </div>

          <h1
            className="
              mt-5
              text-lg
              font-semibold
              tracking-tight
              text-slate-900
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

      <section
        className="
          relative
          overflow-hidden
          rounded-[26px]
          border
          border-slate-200
          bg-white
          shadow-[0_18px_50px_-30px_rgba(15,23,42,0.25)]
        "
      >

        {/* Background grid */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-60
          "
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Background glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-32
            h-80
            w-80
            rounded-full
            bg-blue-100/70
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-48
            -bottom-40
            h-72
            w-72
            rounded-full
            bg-indigo-50/80
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-7
            px-6
            py-7
            md:px-8
            md:py-8
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >

          {/* LEFT */}

          <div className="flex items-start gap-4">

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-100
                bg-blue-50
              "
            >
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>

            <div>

              <div
                className="
                  mb-2
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
                    text-blue-600
                  "
                >
                  Administration
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  User Approval
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-slate-900
                  md:text-3xl
                "
              >
                Approval Center
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Review registrations, approve new users,
                manage permissions, and maintain the
                organization's active user directory.
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >

            {/* Status */}

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-xl
                border
                border-emerald-100
                bg-emerald-50
                px-3.5
                py-2.5
                sm:flex
              "
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span
                className="
                  text-xs
                  font-semibold
                  text-emerald-700
                "
              >
                System operational
              </span>
            </div>

            {/* Pending indicator */}

            <div
              className="
                hidden
                items-center
                gap-2
                rounded-xl
                border
                border-amber-100
                bg-amber-50
                px-3.5
                py-2.5
                md:flex
              "
            >
              <Clock3 className="h-3.5 w-3.5 text-amber-600" />

              <span
                className="
                  text-xs
                  font-semibold
                  text-amber-700
                "
              >
                {totalPending} awaiting review
              </span>
            </div>

            {/* Refresh */}

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
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition-all
                duration-200
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
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

          </div>

        </div>
      </section>

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
                  text-blue-600
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
                font-semibold
                tracking-tight
                text-slate-900
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
                    border-blue-100
                    bg-blue-50
                  "
                >
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>

                <div className="flex items-center gap-2">

                  <h2
                    className="
                      text-base
                      font-semibold
                      tracking-tight
                      text-slate-900
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
                      bg-blue-50
                      px-2
                      text-[11px]
                      font-bold
                      text-blue-700
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
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_30px_-20px_rgba(15,23,42,0.25)]
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
                    border-violet-100
                    bg-violet-50
                  "
                >
                  <Users className="h-4 w-4 text-violet-600" />
                </div>

                <div className="flex items-center gap-2">

                  <h2
                    className="
                      text-base
                      font-semibold
                      tracking-tight
                      text-slate-900
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
                      bg-violet-50
                      px-2
                      text-[11px]
                      font-bold
                      text-violet-700
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
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_30px_-20px_rgba(15,23,42,0.25)]
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
                  border-emerald-100
                  bg-emerald-50
                "
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>

              <div className="flex items-center gap-2">

                <h2
                  className="
                    text-base
                    font-semibold
                    tracking-tight
                    text-slate-900
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
                    bg-slate-100
                    px-2
                    text-[11px]
                    font-bold
                    text-slate-600
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
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_8px_30px_-20px_rgba(15,23,42,0.25)]
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
