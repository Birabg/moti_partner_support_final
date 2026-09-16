import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaBriefcase,
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaSave,
  FaShieldAlt,
  FaUserCircle,
  FaUserTie,
} from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import Button from "../../components/ui/button";

export default function DirectorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [savedForm, setSavedForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await directorApi.getProfile();

        if (!isMounted) return;

        const payload = response?.data?.data || {};
        const profileData = payload.profile || payload;

        const nameParts = profileData.name
          ? profileData.name.trim().split(/\s+/)
          : [];

        const nextForm = {
          firstName:
            profileData.firstName ||
            nameParts[0] ||
            "",

          lastName:
            profileData.lastName ||
            nameParts.slice(1).join(" ") ||
            "",

          email: profileData.email || "",

          phoneNumber:
            profileData.phoneNumber ||
            profileData.phone ||
            "",
        };

        setProfile(profileData);
        setForm(nextForm);
        setSavedForm(nextForm);
      } catch (caughtError) {
        console.error("Director profile load error:", caughtError);

        if (isMounted) {
          setError(
            caughtError?.response?.data?.message ||
              "Could not load your profile."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  }

  function handleEdit() {
    setSuccess("");
    setError("");
    setIsEditing(true);
  }

  function handleCancel() {
    setForm(
      savedForm || {
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        email: profile?.email || "",
        phoneNumber:
          profile?.phoneNumber ||
          profile?.phone ||
          "",
      }
    );

    setError("");
    setSuccess("");
    setIsEditing(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await directorApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });

      const updatedProfile = {
        ...profile,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        phone: form.phoneNumber,
      };

      setProfile(updatedProfile);
      setSavedForm({ ...form });
      setIsEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (caughtError) {
      console.error("Director profile save error:", caughtError);

      setError(
        caughtError?.response?.data?.message ||
          "Failed to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  const fullName = useMemo(() => {
    const name = `${profile?.firstName || ""} ${
      profile?.lastName || ""
    }`.trim();

    return name || profile?.name || "Director";
  }, [profile]);

  const initials = useMemo(() => {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return parts[0]?.[0]?.toUpperCase() || "D";
  }, [fullName]);

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  if (loading) {
    return (
      <div className="min-h-full space-y-7">
        <DirectorHeader
          eyebrow="Director"
          title="Profile"
          subtitle="Manage your director account"
          showActions={false}
        />

        <div className="h-[250px] animate-pulse rounded-[24px] bg-[#0b1b33]" />

        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="h-[300px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />
          <div className="h-[300px] animate-pulse rounded-[22px] border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-7">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <DirectorHeader
        eyebrow="Director"
        title="Profile"
        subtitle="Manage your director account and personal information"
        showActions={false}
      />

      {/* =====================================================
          ERROR / SUCCESS
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          <FaShieldAlt className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 text-xs text-red-600/80">
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
          <FaCheckCircle className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Profile updated
            </p>

            <p className="mt-1 text-xs text-emerald-600/80">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[24px] bg-[#0b1b33] text-white shadow-[0_18px_50px_rgba(11,27,51,0.14)]">

        <div className="pointer-events-none absolute -right-32 -top-40 h-[430px] w-[430px] rounded-full bg-[#416da8]/20 blur-[95px]" />

        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[380px] w-[380px] rounded-full bg-[#658abd]/10 blur-[100px]" />

        <div
          className="
            pointer-events-none absolute inset-0 opacity-[0.045]
            [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)]
            [background-size:36px_36px]
          "
        />

        <div className="relative z-10 px-6 py-8 sm:px-9 sm:py-9">

          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              {/* AVATAR */}

              <div className="relative">

                <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.08] shadow-xl backdrop-blur-md sm:h-24 sm:w-24 sm:rounded-[26px]">

                  <span className="font-display text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                    {initials}
                  </span>

                </div>

                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#0b1b33] bg-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>

              </div>

              {/* NAME */}

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Active account
                  </span>

                </div>

                <h1 className="font-display text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
                  {fullName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold text-white/60">
                    <FaUserTie className="text-[8px]" />
                    Director
                  </span>

                  {profile?.email && (
                    <span className="text-[10px] text-white/35">
                      {profile.email}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-2">

              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl
                    bg-white
                    px-4 py-2.5
                    text-xs font-bold
                    text-[#0b1b33]
                    shadow-sm
                    transition-all
                    hover:bg-slate-100
                    hover:-translate-y-0.5
                  "
                >
                  <FaEdit className="text-[10px]" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      border border-white/10
                      bg-white/[0.06]
                      px-4 py-2.5
                      text-xs font-semibold
                      text-white/70
                      backdrop-blur-md
                      transition
                      hover:bg-white/[0.1]
                    "
                  >
                    <FaArrowLeft className="text-[9px]" />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="
                      inline-flex items-center gap-2
                      rounded-xl
                      bg-white
                      px-4 py-2.5
                      text-xs font-bold
                      text-[#0b1b33]
                      shadow-sm
                      transition-all
                      hover:bg-slate-100
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <FaSave className="text-[10px]" />

                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}

            </div>

          </div>

          {/* HERO META */}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">

            <ProfileHeroStat
              icon={FaBriefcase}
              label="Account type"
              value="Director"
            />

            <ProfileHeroStat
              icon={FaEnvelope}
              label="Email"
              value={profile?.email || "Not available"}
            />

            <ProfileHeroStat
              icon={FaCheckCircle}
              label="Account status"
              value="Active"
              green
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          MAIN PROFILE AREA
      ===================================================== */}

      <form onSubmit={handleSubmit}>

        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">

          {/* =================================================
              ACCOUNT OVERVIEW
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

            <div className="border-b border-slate-100 px-5 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">
                  <FaUserCircle className="text-sm" />
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Account
                  </p>

                  <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                    Account overview
                  </h2>

                </div>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              <div className="flex flex-col items-center text-center">

                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#edf4fd] text-[#527eb9]">
                  <span className="font-display text-3xl font-bold tracking-[-0.04em]">
                    {initials}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold tracking-[-0.025em] text-[#101a28]">
                  {fullName}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Director
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#edf8f4] px-3 py-1.5 text-[9px] font-bold text-[#37876c]">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#37876c]" />

                  Active account

                </div>

              </div>

              <div className="mt-7 space-y-3">

                <InfoRow
                  icon={FaBriefcase}
                  label="Role"
                  value="Director"
                />

                <InfoRow
                  icon={FaEnvelope}
                  label="Email"
                  value={profile?.email || "Not available"}
                />

                <InfoRow
                  icon={FaCheckCircle}
                  label="Status"
                  value="Active"
                  green
                />

                <InfoRow
                  icon={FaUserCircle}
                  label="Member since"
                  value={memberSince}
                />

              </div>

            </div>

          </section>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4fd] text-[#527eb9]">
                    <FaUserTie className="text-sm" />
                  </div>

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Personal information
                    </p>

                    <h2 className="mt-0.5 text-base font-bold tracking-[-0.02em] text-[#101a28]">
                      Profile details
                    </h2>

                  </div>

                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="hidden items-center gap-1.5 text-[10px] font-bold text-[#527eb9] transition hover:text-[#1a345b] sm:flex"
                  >
                    <FaEdit className="text-[9px]" />
                    Edit
                  </button>
                )}

              </div>

              <p className="mt-3 text-[10px] leading-5 text-slate-400">
                Keep your personal and contact information up to date.
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <div className="grid gap-5 sm:grid-cols-2">

                {/* FIRST NAME */}

                <ProfileField
                  label="First name"
                  icon={FaUserCircle}
                  editing={isEditing}
                >
                  {isEditing ? (
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="profile-input"
                    />
                  ) : (
                    <p className="profile-value">
                      {profile?.firstName || "—"}
                    </p>
                  )}
                </ProfileField>

                {/* LAST NAME */}

                <ProfileField
                  label="Last name"
                  icon={FaUserCircle}
                  editing={isEditing}
                >
                  {isEditing ? (
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="profile-input"
                    />
                  ) : (
                    <p className="profile-value">
                      {profile?.lastName || "—"}
                    </p>
                  )}
                </ProfileField>

                {/* EMAIL */}

                <ProfileField
                  label="Email address"
                  icon={FaEnvelope}
                  editing={false}
                >
                  <div className="relative">

                    <input
                      value={profile?.email || ""}
                      disabled
                      className="profile-input cursor-not-allowed bg-slate-50 pr-16 text-slate-500"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-wide text-slate-400">
                      Locked
                    </span>

                  </div>
                </ProfileField>

                {/* PHONE */}

                <ProfileField
                  label="Phone number"
                  icon={FaPhone}
                  editing={isEditing}
                >
                  {isEditing ? (
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className="profile-input"
                    />
                  ) : (
                    <p className="profile-value">
                      {profile?.phoneNumber ||
                        profile?.phone ||
                        "—"}
                    </p>
                  )}
                </ProfileField>

              </div>

              {/* ROLE */}

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#527eb9] shadow-sm">
                      <FaBriefcase className="text-xs" />
                    </div>

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        System role
                      </p>

                      <p className="mt-1 text-xs font-bold text-[#101a28]">
                        Director
                      </p>

                    </div>

                  </div>

                  <span className="rounded-full bg-[#edf4fd] px-2.5 py-1 text-[9px] font-bold text-[#527eb9]">
                    Executive
                  </span>

                </div>

              </div>

              {/* SAVE BAR */}

              {isEditing && (
                <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#dce8f7] bg-[#f7faff] p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[11px] font-bold text-[#101a28]">
                      You are editing your profile
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Save your changes when you're finished.
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="accent"
                      size="sm"
                      type="submit"
                      loading={saving}
                    >
                      <FaSave />

                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>

                  </div>

                </div>
              )}

            </div>

          </section>

        </div>

      </form>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">

          <FaShieldAlt className="text-[#567fbd]" />

          MOTI Partner Support Platform

        </div>

        <div>
          Director account workspace
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   PROFILE HERO STAT
============================================================ */

function ProfileHeroStat({
  icon: Icon,
  label,
  value,
  green = false,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-md">

      <div className="flex items-center gap-2">

        <Icon
          className={`text-[10px] ${
            green
              ? "text-emerald-400"
              : "text-white/35"
          }`}
        />

        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">
          {label}
        </p>

      </div>

      <p className="mt-1.5 truncate text-xs font-semibold text-white/80">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   PROFILE FIELD
============================================================ */

function ProfileField({
  label,
  icon: Icon,
  children,
}) {
  return (
    <div>

      <div className="mb-2 flex items-center gap-2">

        <Icon className="text-[9px] text-[#527eb9]" />

        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

      </div>

      {children}

    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  icon: Icon,
  label,
  value,
  green = false,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          green
            ? "bg-[#edf8f4] text-[#37876c]"
            : "bg-white text-[#527eb9]"
        }`}
      >
        <Icon className="text-[10px]" />
      </div>

      <div className="min-w-0">

        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-[11px] font-semibold ${
            green
              ? "text-[#37876c]"
              : "text-[#101a28]"
          }`}
        >
          {value}
        </p>

      </div>

    </div>
  );
}