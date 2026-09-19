import { useEffect, useState } from "react";
import {
    FaEdit,
    FaSave,
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaBriefcase,
    FaCalendarAlt,
    FaIdBadge,
} from "react-icons/fa";

import { managerApi } from "../../api/managerApi";
import { useAuth } from "../../context/useAuth";

import Button from "../../components/ui/button";


export default function ManagerProfile() {

    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

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


    /*
    |--------------------------------------------------------------------------
    | Load profile
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        async function load() {

            try {

                setLoading(true);

                const response =
                    await managerApi.getProfile();

                const payload =
                    response?.data?.data || {};

                const profileData =
                    payload.profile ||
                    payload ||
                    {};

                const nameParts =
                    profileData.name
                        ? profileData.name.trim().split(/\s+/)
                        : [];

                const nextForm = {

                    firstName:
                        profileData.firstName ||
                        nameParts[0] ||
                        user?.firstName ||
                        "",

                    middleName:
                        profileData.middleName ||
                        "",

                    lastName:
                        profileData.lastName ||
                        (
                            nameParts.length > 1
                                ? nameParts
                                    .slice(1)
                                    .join(" ")
                                : ""
                        ) ||
                        user?.lastName ||
                        "",

                    email:
                        profileData.email ||
                        user?.email ||
                        "",

                    phoneNumber:
                        profileData.phoneNumber ||
                        profileData.phone ||
                        "",

                    role:
                        profileData.role ||
                        user?.managerType ||
                        "MANAGER",

                    department:
                        profileData.department ||
                        payload.structuralAssignment
                            ?.departmentName ||
                        "",

                    createdAt:
                        profileData.createdAt ||
                        "",

                };

                setProfile(profileData);
                setForm(nextForm);
                setSavedForm(nextForm);

            } catch (error) {

                console.error(
                    "Failed to load manager profile:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }

        load();

    }, [user]);


    /*
    |--------------------------------------------------------------------------
    | Form handlers
    |--------------------------------------------------------------------------
    */

    function handleChange(event) {

        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
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


    /*
    |--------------------------------------------------------------------------
    | Save profile
    |--------------------------------------------------------------------------
    */

    async function handleSubmit(event) {

        event.preventDefault();

        try {

            setSaving(true);

            await managerApi.updateProfile({

                firstName:
                    form.firstName,

                middleName:
                    form.middleName,

                lastName:
                    form.lastName,

                phoneNumber:
                    form.phoneNumber,

                role:
                    form.role,

                department:
                    form.department,

            });

            setSavedForm(form);
            setIsEditing(false);

            alert(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(
                "Failed to update manager profile:",
                error
            );

            alert(
                "Failed to save profile."
            );

        } finally {

            setSaving(false);

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Display helpers
    |--------------------------------------------------------------------------
    */

    const fullName = [
        form.firstName,
        form.middleName,
        form.lastName,
    ]
        .filter(Boolean)
        .join(" ") || "Manager";


    const memberSince =
        form.createdAt
            ? new Date(
                form.createdAt
            ).toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }
            )
            : "—";


    const roleLabel =
        form.role ||
        user?.managerType ||
        "MANAGER";


    /*
    |--------------------------------------------------------------------------
    | Field component
    |--------------------------------------------------------------------------
    */

    const ProfileField = ({
        label,
        name,
        value,
        icon: Icon,
        editable = true,
        type = "text",
    }) => {

        return (

            <div className="rounded-xl border border-slate-200 bg-white p-4">

                <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                        <Icon size={14} />

                    </div>

                    <div className="min-w-0 flex-1">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {label}
                        </p>


                        {isEditing && editable ? (

                            <input
                                type={type}
                                name={name}
                                value={value}
                                onChange={handleChange}
                                className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                            />

                        ) : (

                            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                {value || "—"}
                            </p>

                        )}

                    </div>

                </div>

            </div>

        );

    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (

        <div className="min-h-full bg-slate-50/70">

            <main className="ps-container space-y-7 pb-12">

                {/* =========================================================
                    PROFILE HERO
                ========================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[26px]
                        bg-[#0b1d38]
                        shadow-[0_16px_40px_rgba(15,35,65,0.10)]
                    "
                >

                    <div
                        className="
                            absolute
                            inset-0
                            opacity-[0.07]
                        "
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                            backgroundSize:
                                "32px 32px",
                        }}
                    />

                    <div
                        className="
                            absolute
                            -right-24
                            -top-24
                            h-72
                            w-72
                            rounded-full
                            bg-blue-400/10
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            absolute
                            -bottom-32
                            left-1/3
                            h-64
                            w-64
                            rounded-full
                            bg-indigo-400/10
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-6
                            px-6
                            py-7
                            sm:px-8
                            sm:py-8
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div className="flex items-center gap-5">

                            <div
                                className="
                                    flex
                                    h-16
                                    w-16
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/[0.08]
                                    text-white
                                "
                            >
                                <FaUserCircle className="h-9 w-9" />
                            </div>

                            <div className="min-w-0">

                                <div
                                    className="
                                        mb-3
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                    <span
                                        className="
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                            text-slate-400
                                        "
                                    >
                                        Manager Workspace
                                    </span>

                                </div>

                                <h1
                                    className="
                                        truncate
                                        text-2xl
                                        font-semibold
                                        tracking-[-0.035em]
                                        text-white
                                        sm:text-3xl
                                    "
                                >
                                    {loading
                                        ? "Loading..."
                                        : fullName}
                                </h1>

                                <div
                                    className="
                                        mt-3
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            border
                                            border-white/10
                                            bg-white/[0.07]
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-medium
                                            text-slate-300
                                        "
                                    >
                                        <FaBriefcase className="h-3 w-3" />
                                        {roleLabel}
                                    </span>

                                    {form.department && (
                                        <span
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                border-white/10
                                                bg-white/[0.07]
                                                px-2.5
                                                py-1
                                                text-[10px]
                                                font-medium
                                                text-slate-300
                                            "
                                        >
                                            <FaBuilding className="h-3 w-3" />
                                            {form.department}
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="flex items-center gap-2">

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

                                <>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant="accent"
                                        size="sm"
                                        type="button"
                                        onClick={handleSubmit}
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

                </section>


            {/* =========================================================
                PROFILE CONTENT
            ========================================================= */}

            <div className="grid gap-6 lg:grid-cols-3">


                {/* -----------------------------------------------------
                    PERSONAL INFORMATION
                ----------------------------------------------------- */}

                <section
                    className="
                        rounded-[24px]
                        border
                        border-slate-200/80
                        bg-white
                        shadow-[0_8px_30px_rgba(15,35,65,0.045)]
                        lg:col-span-2
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-slate-100
                            px-6
                            py-5
                        "
                    >

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-blue-600
                            "
                        >
                            <FaUserCircle size={15} />
                        </div>

                        <div>

                            <p
                                className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-blue-600
                                "
                            >
                                Personal
                            </p>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-slate-950
                                "
                            >
                                Personal Information
                            </h2>

                        </div>

                    </div>

                    <div className="p-5 sm:p-6">

                        <p className="mb-5 text-sm text-slate-500">
                            Your basic account and contact information.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">

                            <ProfileField
                                label="First Name"
                                name="firstName"
                                value={form.firstName}
                                icon={FaUserCircle}
                            />

                            <ProfileField
                                label="Middle Name"
                                name="middleName"
                                value={form.middleName}
                                icon={FaUserCircle}
                            />

                            <ProfileField
                                label="Last Name"
                                name="lastName"
                                value={form.lastName}
                                icon={FaUserCircle}
                            />

                            <ProfileField
                                label="Phone Number"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                icon={FaPhone}
                            />

                            <ProfileField
                                label="Email Address"
                                name="email"
                                value={form.email}
                                icon={FaEnvelope}
                                editable={false}
                            />

                        </div>

                    </div>

                </section>


                {/* -----------------------------------------------------
                    ACCOUNT INFORMATION
                ----------------------------------------------------- */}

                <section
                    className="
                        rounded-[24px]
                        border
                        border-slate-200/80
                        bg-white
                        shadow-[0_8px_30px_rgba(15,35,65,0.045)]
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-slate-100
                            px-6
                            py-5
                        "
                    >

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-50
                                text-indigo-600
                            "
                        >
                            <FaIdBadge size={15} />
                        </div>

                        <div>

                            <p
                                className="
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-indigo-600
                                "
                            >
                                Account
                            </p>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-slate-950
                                "
                            >
                                Account Information
                            </h2>

                        </div>

                    </div>

                    <div className="p-5 sm:p-6">

                        <p className="mb-5 text-sm text-slate-500">
                            Your current management assignment.
                        </p>

                        <div className="space-y-3">

                            <ProfileField
                                label="Role"
                                name="role"
                                value={form.role}
                                icon={FaBriefcase}
                            />

                            <ProfileField
                                label="Department"
                                name="department"
                                value={form.department}
                                icon={FaBuilding}
                            />

                            <div className="rounded-xl border border-slate-200 bg-white p-4">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                                        <FaCalendarAlt size={14} />

                                    </div>

                                    <div>

                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Member Since
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {memberSince}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </div>


            {/* =========================================================
                ACCOUNT STATUS
            ========================================================= */}

            <section
                className="
                    rounded-[24px]
                    border
                    border-slate-200/80
                    bg-white
                    shadow-[0_8px_30px_rgba(15,35,65,0.045)]
                "
            >

                <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                                <FaIdBadge size={16} />

                            </div>

                            <div>

                                <p className="text-sm font-bold text-slate-900">
                                    Manager Account
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Your profile is connected to your
                                    manager account and organizational scope.
                                </p>

                            </div>

                        </div>


                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Active

                        </span>

                    </div>

                </div>

            </section>

        </main>

        </div>
    );

}
