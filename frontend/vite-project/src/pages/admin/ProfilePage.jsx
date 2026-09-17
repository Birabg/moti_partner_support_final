import { useEffect, useState } from "react";

import {
    FaEdit,
    FaSave,
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaShieldAlt,
    FaCalendarAlt,
    FaCheckCircle,
} from "react-icons/fa";

import { ProfileApi } from "../../api/profileApi";
import { useAuth } from "../../context/useAuth";

import { PageHeader } from "../../components/ui/page-header";
import { Card, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function ProfilePage() {
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "",
        department: "",
        createdAt: "",
    });

    const [savedForm, setSavedForm] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [user]);

    async function loadProfile() {
        try {
            setLoading(true);

            const response = await ProfileApi.me();
            const payload = response?.data?.data || {};

            const nameParts = payload.name
                ? payload.name.trim().split(/\s+/)
                : [];

            const nextForm = {
                firstName:
                    payload.firstName ||
                    nameParts[0] ||
                    user?.firstName ||
                    "",

                middleName:
                    payload.middleName ||
                    "",

                lastName:
                    payload.lastName ||
                    (nameParts.length > 1
                        ? nameParts.slice(1).join(" ")
                        : "") ||
                    user?.lastName ||
                    "",

                email:
                    payload.email ||
                    user?.email ||
                    "",

                phoneNumber:
                    payload.phoneNumber ||
                    payload.phone ||
                    "",

                role:
                    payload.role ||
                    user?.role ||
                    (user?.isSAdmin
                        ? "SYSTEM_ADMIN"
                        : "ADMIN"),

                department:
                    payload.department ||
                    payload.structuralAssignment?.departmentName ||
                    "",

                createdAt:
                    payload.createdAt ||
                    "",
            };

            setProfile(payload);
            setForm(nextForm);
            setSavedForm(nextForm);
        } catch (error) {
            console.error(
                "Failed to load profile:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleEdit() {
        setIsEditing(true);
    }

    function handleCancel() {
        if (savedForm) {
            setForm(savedForm);
        }

        setIsEditing(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);

            await ProfileApi.updateProfile({
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                role: form.role,
                department: form.department,
            });

            setSavedForm(form);
            setIsEditing(false);

            alert("Profile updated successfully.");
        } catch (error) {
            console.error(
                "Failed to save profile:",
                error
            );

            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    }

    const fullName =
        [
            form.firstName,
            form.middleName,
            form.lastName,
        ]
            .filter(Boolean)
            .join(" ") || "Administrator";

    const roleLabel = form.role
        ? form.role
              .replaceAll("_", " ")
              .toLowerCase()
              .replace(/\b\w/g, (char) =>
                  char.toUpperCase()
              )
        : "Administrator";

    const memberSince = form.createdAt
        ? new Date(
              form.createdAt
          ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Not available";

    if (loading) {
        return (
            <div className="space-y-6">

                <PageHeader
                    eyebrow="Admin"
                    title="Profile"
                    subtitle="Manage your administrator account and personal information."
                />

                <Card>
                    <CardContent className="py-20 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <FaUserCircle className="text-4xl text-slate-400" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            Loading Profile
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Please wait while we retrieve your account information.
                        </p>

                    </CardContent>
                </Card>

            </div>
        );
    }

    if (!profile) {
        return (
            <div className="space-y-6">

                <PageHeader
                    eyebrow="Admin"
                    title="Profile"
                    subtitle="Manage your administrator account and personal information."
                />

                <Card>
                    <CardContent className="py-20 text-center">

                        <FaUserCircle className="mx-auto text-6xl text-slate-300" />

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            Profile Unavailable
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            We could not retrieve your profile information.
                            Please try again.
                        </p>

                        <div className="mt-6">
                            <Button
                                variant="accent"
                                onClick={loadProfile}
                            >
                                Try Again
                            </Button>
                        </div>

                    </CardContent>
                </Card>

            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <PageHeader
                eyebrow="Admin"
                title="Profile"
                subtitle="Manage your administrator account and personal information."
            />

            {/* =====================================================
                PROFILE HERO
            ====================================================== */}

            <Card className="overflow-hidden border-slate-200 shadow-sm">

                <div className="relative overflow-hidden bg-slate-950">

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />

                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.04]" />

                    <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/[0.03]" />

                    <div className="relative px-6 py-9 sm:px-8 lg:px-10">

                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-center gap-5">

                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20">
                                    <FaUserCircle className="text-5xl text-white" />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Administrator Account
                                    </p>

                                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {fullName}
                                    </h1>

                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                                        <FaEnvelope className="text-xs" />
                                        {form.email ||
                                            "No email available"}
                                    </div>

                                </div>

                            </div>

                            <div className="flex flex-wrap gap-3">

                                {!isEditing ? (
                                    <Button
                                        type="button"
                                        variant="accent"
                                        size="sm"
                                        onClick={handleEdit}
                                    >
                                        <FaEdit />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            form="profile-form"
                                            variant="accent"
                                            size="sm"
                                            disabled={saving}
                                        >
                                            <FaSave />

                                            {saving
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </Button>
                                    </>
                                )}

                            </div>

                        </div>

                    </div>
                </div>

                {/* =================================================
                    SUMMARY
                ================================================== */}

                <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                    <SummaryItem
                        icon={<FaShieldAlt />}
                        label="System Role"
                        value={roleLabel}
                    />

                    <SummaryItem
                        icon={<FaBuilding />}
                        label="Department"
                        value={
                            form.department ||
                            "Not assigned"
                        }
                    />

                    <SummaryItem
                        icon={<FaCalendarAlt />}
                        label="Member Since"
                        value={memberSince}
                    />

                </div>

            </Card>

            {/* =====================================================
                ACCOUNT INFORMATION
            ====================================================== */}

            <Card className="border-slate-200 shadow-sm">

                <CardContent className="p-6 sm:p-8">

                    <div>

                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Account Information
                        </p>

                        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                            Personal Details
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            Review and manage the information associated with your administrator account.
                        </p>

                    </div>

                    <form
                        id="profile-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="mt-8 grid gap-6 lg:grid-cols-2">

                            <ProfileField
                                icon={<FaUserCircle />}
                                label="First Name"
                                name="firstName"
                                value={form.firstName}
                                editing={isEditing}
                                onChange={handleChange}
                            />

                            <ProfileField
                                icon={<FaUserCircle />}
                                label="Middle Name"
                                name="middleName"
                                value={form.middleName}
                                editing={isEditing}
                                onChange={handleChange}
                            />

                            <ProfileField
                                icon={<FaUserCircle />}
                                label="Last Name"
                                name="lastName"
                                value={form.lastName}
                                editing={isEditing}
                                onChange={handleChange}
                            />

                            {/* EMAIL */}

                            <div>

                                <FieldLabel
                                    icon={<FaEnvelope />}
                                    label="Email Address"
                                />

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5">
                                    <p className="text-sm font-semibold text-slate-600">
                                        {form.email ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Email address is managed by the system.
                                </p>

                            </div>

                            {/* PHONE */}

                            <ProfileField
                                icon={<FaPhone />}
                                label="Phone Number"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                editing={isEditing}
                                onChange={handleChange}
                            />

                            {/* DEPARTMENT */}

                            <ProfileField
                                icon={<FaBuilding />}
                                label="Department"
                                name="department"
                                value={form.department}
                                editing={isEditing}
                                onChange={handleChange}
                            />

                            {/* ROLE */}

                            <div>

                                <FieldLabel
                                    icon={<FaShieldAlt />}
                                    label="System Role"
                                />

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {roleLabel}
                                    </p>
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    System permissions are controlled by your assigned role.
                                </p>

                            </div>

                            {/* MEMBER SINCE */}

                            <div>

                                <FieldLabel
                                    icon={<FaCalendarAlt />}
                                    label="Member Since"
                                />

                                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {memberSince}
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* EDIT FOOTER */}

                        {isEditing && (
                            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="text-sm font-bold text-slate-800">
                                        Editing your profile
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Review your information before saving.
                                    </p>

                                </div>

                                <div className="flex gap-2">

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="accent"
                                        size="sm"
                                        disabled={saving}
                                    >
                                        <FaSave />

                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </Button>

                                </div>

                            </div>
                        )}

                    </form>

                </CardContent>

            </Card>

            {/* =====================================================
                SECURITY
            ====================================================== */}

            <Card className="border-slate-200 shadow-sm">

                <CardContent className="p-6 sm:p-8">

                    <div>

                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            Security
                        </p>

                        <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                            Account Security
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            Your administrator account is protected by the portal's authentication and authorization controls.
                        </p>

                    </div>

                    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                                <FaCheckCircle />
                            </div>

                            <div>

                                <h3 className="text-sm font-bold text-slate-900">
                                    Account Active
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                    Your account currently has access to the administrator portal.
                                </p>

                            </div>

                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                            Active
                        </span>

                    </div>

                </CardContent>

            </Card>

        </div>
    );
}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
    icon,
    label,
    value,
}) {
    return (
        <div className="flex items-center gap-4 px-6 py-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                {icon}
            </div>

            <div className="min-w-0">

                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                    {value}
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   PROFILE FIELD
========================================================= */

function ProfileField({
    icon,
    label,
    name,
    value,
    editing,
    onChange,
}) {
    return (
        <div>

            <FieldLabel
                icon={icon}
                label={label}
            />

            {editing ? (
                <input
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="
                        mt-2
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3.5
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-slate-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-slate-100
                    "
                />
            ) : (
                <div className="mt-2 rounded-xl bg-slate-50 px-4 py-3.5">

                    <p className="text-sm font-semibold text-slate-900">
                        {value || "Not provided"}
                    </p>

                </div>
            )}

        </div>
    );
}


/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
    icon,
    label,
}) {
    return (
        <div className="flex items-center gap-2">

            <span className="text-xs text-slate-400">
                {icon}
            </span>

            <p className="text-sm font-semibold text-slate-600">
                {label}
            </p>

        </div>
    );
}
