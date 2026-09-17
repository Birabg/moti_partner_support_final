import { useEffect, useMemo, useState } from "react";
import {
    FaEdit,
    FaSave,
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaBriefcase,
    FaVenusMars,
    FaCalendarAlt,
    FaUser,
    FaTimes,
} from "react-icons/fa";

import { CustomerApi } from "../../api/customerApi";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function CustomerProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savedForm, setSavedForm] = useState(null);

    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        position: "",
        email: "",
        phoneNumber: "",
        organizationName: "",
        gender: "",
        createdAt: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const response = await CustomerApi.profile();

            const customer =
                response.data.data?.customer ||
                response.data.data ||
                {};

            const nextForm = {
                firstName: customer.firstName || "",
                middleName: customer.middleName || "",
                lastName: customer.lastName || "",
                position: customer.position || "",
                email: customer.email || "",
                phoneNumber: customer.phoneNumber || "",
                organizationName:
                    customer.organizationName ||
                    customer.organization?.name ||
                    "",
                gender: customer.gender || "",
                createdAt: customer.createdAt || "",
            };

            setForm(nextForm);
            setSavedForm(nextForm);
        } catch (error) {
            console.error(error);
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

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);

            await CustomerApi.updateProfile({
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                position: form.position,
                phoneNumber: form.phoneNumber,
            });

            await loadProfile();

            setIsEditing(false);

            alert("Profile updated successfully.");
        } catch (error) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                    "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
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

    const fullName = useMemo(() => {
        return [
            form.firstName,
            form.middleName,
            form.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim();
    }, [
        form.firstName,
        form.middleName,
        form.lastName,
    ]);

    const initials = useMemo(() => {
        const first =
            form.firstName?.charAt(0) || "";

        const last =
            form.lastName?.charAt(0) || "";

        return `${first}${last}`.toUpperCase() || "CU";
    }, [
        form.firstName,
        form.lastName,
    ]);

    const memberSince = form.createdAt
        ? new Date(form.createdAt).toLocaleDateString(
              undefined,
              {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              }
          )
        : "—";

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="My Profile"
                    subtitle="Loading your account information..."
                />

                <Card>
                    <CardContent className="p-8">
                        <div className="flex items-center justify-center py-10">
                            <div className="text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

                                <p className="mt-4 text-sm font-semibold text-slate-600">
                                    Loading profile...
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Please wait a moment
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}

            <PageHeader
                title="My Profile"
                subtitle="Manage your personal account details."
            />


            {/* PROFILE HERO */}

            <Card className="overflow-hidden border-slate-200 shadow-sm">

                <div className="relative overflow-hidden bg-slate-900">

                    {/* Decorative circles */}

                    <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/5" />

                    <div className="absolute -bottom-28 right-20 h-48 w-48 rounded-full bg-white/[0.03]" />

                    <div className="absolute left-1/2 -top-20 h-40 w-40 rounded-full bg-white/[0.02]" />


                    <div className="relative px-6 py-7 sm:px-8 sm:py-8">

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                            {/* USER */}

                            <div className="flex min-w-0 items-center gap-4">

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-slate-900 shadow-lg">
                                    {initials}
                                </div>

                                <div className="min-w-0">

                                    <div className="flex items-center gap-2">

                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Customer Account
                                        </span>

                                    </div>

                                    <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                                        {fullName || "Customer"}
                                    </h2>

                                    <p className="mt-1 truncate text-sm text-slate-400">
                                        {form.organizationName ||
                                            "No organization assigned"}
                                    </p>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="shrink-0">

                                {!isEditing ? (

                                    <Button
                                        variant="accent"
                                        size="sm"
                                        type="button"
                                        onClick={handleEdit}
                                    >
                                        <FaEdit />
                                        Edit Profile
                                    </Button>

                                ) : (

                                    <div className="flex flex-wrap gap-2">

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={handleCancel}
                                        >
                                            <FaTimes />
                                            Cancel
                                        </Button>

                                        <Button
                                            variant="accent"
                                            size="sm"
                                            type="button"
                                            onClick={handleSubmit}
                                            loading={saving}
                                        >
                                            <FaSave />
                                            {saving
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </Button>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>


                {/* ACCOUNT SUMMARY */}

                <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                    <SummaryItem
                        icon={FaEnvelope}
                        label="Email"
                        value={form.email}
                    />

                    <SummaryItem
                        icon={FaPhone}
                        label="Phone"
                        value={form.phoneNumber}
                    />

                    <SummaryItem
                        icon={FaCalendarAlt}
                        label="Member Since"
                        value={memberSince}
                    />

                </div>

            </Card>


            {/* PERSONAL INFORMATION */}

            <Card className="border-slate-200 shadow-sm">

                <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <FaUserCircle className="text-lg" />
                        </div>

                        <div>

                            <h3 className="text-base font-bold text-slate-900">
                                Personal Information
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500">
                                Your basic personal and contact details.
                            </p>

                        </div>

                    </div>

                </div>


                <CardContent className="p-6 sm:p-7">

                    <form onSubmit={handleSubmit}>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            <ProfileField
                                label="First Name"
                                name="firstName"
                                value={form.firstName}
                                editing={isEditing}
                                onChange={handleChange}
                                icon={FaUser}
                            />

                            <ProfileField
                                label="Middle Name"
                                name="middleName"
                                value={form.middleName}
                                editing={isEditing}
                                onChange={handleChange}
                                icon={FaUser}
                            />

                            <ProfileField
                                label="Last Name"
                                name="lastName"
                                value={form.lastName}
                                editing={isEditing}
                                onChange={handleChange}
                                icon={FaUser}
                            />

                            <ProfileField
                                label="Position"
                                name="position"
                                value={form.position}
                                editing={isEditing}
                                onChange={handleChange}
                                icon={FaBriefcase}
                            />

                            <ProfileField
                                label="Phone Number"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                editing={isEditing}
                                onChange={handleChange}
                                icon={FaPhone}
                            />

                            <ProfileField
                                label="Gender"
                                value={form.gender}
                                icon={FaVenusMars}
                            />

                        </div>

                    </form>

                </CardContent>

            </Card>


            {/* ORGANIZATION & ACCOUNT */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* ORGANIZATION */}

                <Card className="border-slate-200 shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FaBuilding />
                            </div>

                            <div>

                                <h3 className="text-base font-bold text-slate-900">
                                    Organization
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Your associated organization.
                                </p>

                            </div>

                        </div>

                    </div>


                    <CardContent className="p-6">

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Organization
                            </p>

                            <p className="mt-2 text-sm font-bold text-slate-900">
                                {form.organizationName || "Not assigned"}
                            </p>

                        </div>

                    </CardContent>

                </Card>


                {/* ACCOUNT */}

                <Card className="border-slate-200 shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FaUserCircle />
                            </div>

                            <div>

                                <h3 className="text-base font-bold text-slate-900">
                                    Account Information
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Basic information about your account.
                                </p>

                            </div>

                        </div>

                    </div>


                    <CardContent className="p-6">

                        <div className="space-y-4">

                            <AccountRow
                                label="Email Address"
                                value={form.email}
                            />

                            <AccountRow
                                label="Member Since"
                                value={memberSince}
                            />

                            <AccountRow
                                label="Account Type"
                                value="Customer"
                            />

                        </div>

                    </CardContent>

                </Card>

            </div>


            {/* EMAIL NOTICE */}

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                    <FaEnvelope className="text-xs" />
                </div>

                <div>

                    <p className="text-sm font-semibold text-slate-700">
                        Email address
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your email address is managed by your account
                        and cannot be changed from this page.
                    </p>

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   PROFILE FIELD
========================================================= */

function ProfileField({
    label,
    name,
    value,
    editing = false,
    onChange,
    icon: Icon,
}) {
    return (
        <div>

            <label className="block">

                <div className="mb-2 flex items-center gap-2">

                    {Icon && (
                        <Icon className="text-[11px] text-slate-400" />
                    )}

                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {label}
                    </span>

                </div>


                {editing && name ? (

                    <input
                        type="text"
                        name={name}
                        value={value || ""}
                        onChange={onChange}
                        className="
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-slate-900
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-slate-400
                            focus:ring-2
                            focus:ring-slate-100
                        "
                    />

                ) : (

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

                        <p className="truncate text-sm font-semibold text-slate-900">
                            {value || "—"}
                        </p>

                    </div>

                )}

            </label>

        </div>
    );
}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="flex items-center gap-3 px-6 py-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">

                <Icon className="text-sm" />

            </div>

            <div className="min-w-0">

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                    {value || "—"}
                </p>

            </div>

        </div>
    );
}


/* =========================================================
   ACCOUNT ROW
========================================================= */

function AccountRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">

            <span className="text-xs font-medium text-slate-500">
                {label}
            </span>

            <span className="max-w-[60%] truncate text-right text-sm font-semibold text-slate-800">
                {value || "—"}
            </span>

        </div>
    );
}
