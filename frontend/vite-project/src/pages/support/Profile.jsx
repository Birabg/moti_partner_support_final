import { useEffect, useMemo, useState } from "react";

import {
  UserRound,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  CalendarDays,
  Pencil,
  Save,
  X,
  CheckCircle2,
  BriefcaseBusiness,
  BadgeCheck,
  LockKeyhole,
  CircleUserRound,
} from "lucide-react";

import SupportHeader from "../../components/support/SupportHeader";
import SupportApi from "../../api/supportApi";
import PermissionsPanel from "../../components/profile/PermissionsPanel";
import { useAuth } from "../../context/useAuth";

export default function Profile() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    role: "",
    email: "",
    phoneNumber: "",
    department: "",
    createdAt: "",
  });

  const [savedForm, setSavedForm] = useState(null);

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const res = await SupportApi.getDashboard();

        const data = res?.data?.data || {};
        const profile = data.profile || data.user || data || {};

        const nextForm = {
          firstName:
            profile.firstName ||
            profile.name?.split(" ")?.[0] ||
            "",

          middleName:
            profile.middleName || "",

          lastName:
            profile.lastName ||
            (profile.name
              ? profile.name.split(" ").slice(1).join(" ")
              : "") ||
            "",

          role:
            profile.role || "",

          email:
            profile.email || "",

          phoneNumber:
            profile.phoneNumber ||
            profile.phone ||
            profile.mobile ||
            "",

          department:
            data.structuralAssignment?.departmentName ||
            data.structuralAssignment?.divisionName ||
            "",

          createdAt:
            profile.createdAt || "",
        };

        if (mounted) {
          setForm(nextForm);
          setSavedForm(nextForm);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);

      await SupportApi.updateProfile({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      setSavedForm(form);
      setIsEditing(false);

      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     EDIT / CANCEL
  ========================================================= */

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    if (savedForm) {
      setForm(savedForm);
    }

    setIsEditing(false);
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  const fullName = useMemo(() => {
    return [
      form.firstName,
      form.middleName,
      form.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Support User";
  }, [form]);

  const initials = useMemo(() => {
    const letters = [
      form.firstName?.[0],
      form.lastName?.[0],
    ]
      .filter(Boolean)
      .join("");

    return letters.toUpperCase() || "SU";
  }, [form]);

  const memberSince = form.createdAt
    ? new Date(form.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "—";

  const formattedRole =
    form.role
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
    "Support Staff";

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-full bg-ink-50">
        <SupportHeader />

        <main className=" space-y-6 pb-12">
          <div className="h-44 animate-pulse rounded-2xl bg-white border border-ink-300" />

          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="h-72 animate-pulse rounded-2xl bg-white border border-ink-300" />

            <div className="h-[500px] animate-pulse rounded-2xl bg-white border border-ink-300" />
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full bg-ink-50">
      <SupportHeader />

      <main className=" space-y-6 pb-12">

        {/* =====================================================
            PROFILE HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-2xl bg-[#0b1b33] shadow-[0_14px_40px_rgba(15,35,65,0.10)]">

          {/* subtle grid */}

          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">

            {/* identity */}

            <div className="flex min-w-0 items-center gap-5">

              <div className="relative shrink-0">

                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm sm:h-24 sm:w-24">

                  <span className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {initials}
                  </span>

                </div>

                <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#0b1b33] bg-emerald-500 text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>

              </div>

              <div className="min-w-0">

                <div className="mb-2 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink-400">
                    Support Account
                  </span>

                </div>

                <h1 className="truncate text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                  {fullName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-ink-300">
                    <BriefcaseBusiness className="h-3 w-3" />
                    {formattedRole}
                  </span>

                  {form.department && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-medium text-ink-300">
                      <Building2 className="h-3 w-3" />
                      {form.department}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* account status */}

            <div className="flex items-center gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-500">
                  Account Status
                </p>

                <div className="mt-1.5 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-sm font-semibold text-white">
                    Active
                  </span>

                </div>

              </div>

              <div className="hidden h-[58px] w-[58px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-ink-400 sm:flex">
                <CircleUserRound className="h-5 w-5" />
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* ===================================================
              LEFT SIDEBAR
          =================================================== */}

          <aside className="space-y-4">

            {/* Profile summary */}

            <div className="rounded-2xl border border-ink-300 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,0.04)]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-[18px] w-[18px]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-900">
                    Account Overview
                  </p>

                  <p className="mt-0.5 text-[10px] text-ink-400">
                    Your support account
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-xs font-medium text-ink-700">
                    {form.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">
                    Department
                  </p>

                  <p className="mt-1 text-xs font-medium text-ink-700">
                    {form.department || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">
                    Member Since
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-ink-700">
                    <CalendarDays className="h-3.5 w-3.5 text-ink-400" />
                    {memberSince}
                  </div>
                </div>

              </div>

            </div>

            {/* Security card */}

            <div className="rounded-2xl border border-ink-300 bg-white p-5 shadow-[0_8px_25px_rgba(15,35,65,0.04)]">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <LockKeyhole className="h-[17px] w-[17px]" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink-900">
                    Account Security
                  </p>

                  <p className="mt-0.5 text-[10px] text-ink-400">
                    Protected support account
                  </p>
                </div>

              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-emerald-50/70 p-3">

                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />

                <p className="text-[10px] leading-4 text-emerald-700">
                  Your account is active and connected to the support workspace.
                </p>

              </div>

            </div>

          </aside>

          {/* ===================================================
              PROFILE DETAILS
          =================================================== */}

          <section className="overflow-hidden rounded-2xl border border-ink-300 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.04)]">

            <form onSubmit={handleSave}>

              {/* section header */}

              <div className="border-b border-ink-100 px-6 py-5 sm:px-7">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <UserRound className="h-[18px] w-[18px]" />
                      </div>

                      <div>

                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                          Personal Information
                        </p>

                        <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink-950">
                          Profile Details
                        </h2>

                      </div>

                    </div>

                    <p className="mt-3 text-xs leading-5 text-ink-400">
                      Manage the personal information associated with your support account.
                    </p>

                  </div>

                  {/* actions */}

                  <div className="flex shrink-0 items-center gap-2">

                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={handleEdit}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0b1b33] px-3.5 text-xs font-semibold text-white transition hover:bg-[#12294a]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="inline-flex h-9 items-center gap-2 rounded-xl border border-ink-300 bg-white px-3.5 text-xs font-semibold text-ink-600 transition hover:bg-ink-100"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#0b1b33] px-3.5 text-xs font-semibold text-white transition hover:bg-[#12294a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Save className="h-3.5 w-3.5" />

                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </>
                    )}

                  </div>

                </div>

              </div>

              {/* details */}

              <div className="px-6 py-6 sm:px-7">

                <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">

                  {/* First Name */}

                  <ProfileField
                    label="First Name"
                    icon={UserRound}
                    editing={isEditing}
                    value={form.firstName}
                    onChange={(value) =>
                      updateField("firstName", value)
                    }
                  />

                  {/* Middle Name */}

                  <ProfileField
                    label="Middle Name"
                    icon={UserRound}
                    editing={isEditing}
                    value={form.middleName}
                    onChange={(value) =>
                      updateField("middleName", value)
                    }
                  />

                  {/* Last Name */}

                  <ProfileField
                    label="Last Name"
                    icon={UserRound}
                    editing={isEditing}
                    value={form.lastName}
                    onChange={(value) =>
                      updateField("lastName", value)
                    }
                  />

                  {/* Phone */}

                  <ProfileField
                    label="Phone Number"
                    icon={Phone}
                    editing={isEditing}
                    value={form.phoneNumber}
                    onChange={(value) =>
                      updateField("phoneNumber", value)
                    }
                  />

                  {/* Email */}

                  <ProfileField
                    label="Email Address"
                    icon={Mail}
                    value={form.email}
                    disabled
                    helper="Email address cannot be changed here."
                  />

                  {/* Department */}

                  <ProfileField
                    label="Department"
                    icon={Building2}
                    value={form.department}
                    disabled={!isEditing}
                    helper={
                      isEditing
                        ? "Assigned organizational unit."
                        : ""
                    }
                    onChange={(value) =>
                      updateField("department", value)
                    }
                  />

                  {/* Role */}

                  <ProfileField
                    label="Role"
                    icon={BriefcaseBusiness}
                    value={form.role}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateField("role", value)
                    }
                  />

                  {/* Member Since */}

                  <div>

                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                      <CalendarDays className="h-3 w-3" />
                      Member Since
                    </label>

                    <div className="mt-2 flex h-11 items-center rounded-xl border border-ink-300 bg-ink-50 px-3.5 text-sm font-medium text-ink-600">
                      {memberSince}
                    </div>

                  </div>

                </div>

              </div>

              {/* footer */}

              <div className="border-t border-ink-100 bg-ink-50/50 px-6 py-4 sm:px-7">

                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <BadgeCheck className="h-4 w-4" />
                  </div>

                  <div>

                    <p className="text-[11px] font-semibold text-ink-700">
                      Profile information
                    </p>

                    <p className="mt-0.5 text-[10px] text-ink-400">
                      Some account details are managed by your support administration.
                    </p>

                  </div>

                </div>

              </div>

            </form>

          </section>

          {/* ===================================================
              PERMISSIONS & ACCESS
          =================================================== */}

          <PermissionsPanel
            permissions={user?.permissions || []}
            role={user?.role}
            managerType={user?.managerType}
          />

        </div>

      </main>
    </div>
  );
}


/* =============================================================
   PROFILE FIELD
============================================================= */

function ProfileField({
  label,
  icon: Icon,
  value,
  editing = false,
  disabled = false,
  helper = "",
  onChange,
}) {
  const canEdit = editing && !disabled;

  return (
    <div>

      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
        <Icon className="h-3 w-3" />
        {label}
      </label>

      {canEdit ? (
        <input
          value={value || ""}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
          className="mt-2 h-11 w-full rounded-xl border border-ink-300 bg-white px-3.5 text-sm font-medium text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/10"
        />
      ) : (
        <div
          className={`mt-2 flex min-h-11 items-center rounded-xl border px-3.5 text-sm font-medium ${
            disabled
              ? "border-ink-300 bg-ink-50 text-ink-600"
              : "border-ink-100 bg-ink-50 text-ink-900"
          }`}
        >
          {value || "—"}
        </div>
      )}

      {helper && (
        <p className="mt-1.5 text-[10px] text-ink-400">
          {helper}
        </p>
      )}

    </div>
  );
}








