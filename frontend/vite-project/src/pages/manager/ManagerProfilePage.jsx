import { useEffect, useState } from "react";
import {
    UserCircle2,
    Edit3,
    Save,
    X,
    Mail,
    Phone,
    ShieldCheck,
    Building2,
    UserRound,
    CheckCircle2,
    CalendarDays,
    LockKeyhole,
} from "lucide-react";

import { managerApi } from "../../api/managerApi";
import ManagerHeader from "../../components/manager/ManagerHeader";
import { Card, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";


export default function ManagerProfilePage() {

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    const [savedForm, setSavedForm] = useState(null);


    /* ============================================================
       LOAD PROFILE
    ============================================================ */

    useEffect(() => {

        let mounted = true;

        async function loadProfile() {

            try {

                setLoading(true);
                setError("");

                const response =
                    await managerApi.getProfile();

                if (!mounted) return;

                const data =
                    response?.data?.data || {};

                const firstName =
                    data.firstName ||
                    data.name?.split(" ")?.[0] ||
                    "";

                const lastName =
                    data.lastName ||
                    data.name
                        ?.split(" ")
                        .slice(1)
                        .join(" ") ||
                    "";

                const nextForm = {
                    firstName,
                    lastName,
                    email: data.email || "",
                    phoneNumber:
                        data.phoneNumber ||
                        data.phone ||
                        "",
                };

                setProfile(data);
                setForm(nextForm);
                setSavedForm(nextForm);

            } catch (caughtError) {

                console.error(
                    "Manager profile load error:",
                    caughtError
                );

                if (mounted) {

                    setError(
                        "Could not load your profile."
                    );

                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        }

        loadProfile();

        return () => {
            mounted = false;
        };

    }, []);


    /* ============================================================
       FORM
    ============================================================ */

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

        setError("");
        setEditing(true);

    }


    function handleCancel() {

        setForm(
            savedForm || {
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
            }
        );

        setError("");
        setEditing(false);

    }


    async function handleSubmit(event) {

        event?.preventDefault();

        try {

            setSaving(true);
            setError("");

            await managerApi.updateProfile({

                firstName:
                    form.firstName,

                lastName:
                    form.lastName,

                phoneNumber:
                    form.phoneNumber,

            });


            const updatedProfile = {

                ...profile,

                firstName:
                    form.firstName,

                lastName:
                    form.lastName,

                phoneNumber:
                    form.phoneNumber,

                phone:
                    form.phoneNumber,

            };


            setProfile(updatedProfile);

            setSavedForm({
                ...form,
            });

            setEditing(false);

        } catch (caughtError) {

            console.error(
                "Manager profile update error:",
                caughtError
            );

            setError(
                caughtError?.response?.data?.message ||
                "Failed to save profile changes."
            );

        } finally {

            setSaving(false);

        }

    }


    /* ============================================================
       DERIVED DATA
    ============================================================ */

    const firstName =
        profile?.firstName ||
        form.firstName ||
        "";

    const lastName =
        profile?.lastName ||
        form.lastName ||
        "";

    const fullName =
        `${firstName} ${lastName}`
            .trim() ||
        profile?.name ||
        "Manager";


    const email =
        profile?.email ||
        form.email ||
        "—";


    const phone =
        profile?.phoneNumber ||
        profile?.phone ||
        form.phoneNumber ||
        "—";


    const organization =
        profile?.organization?.name ||
        profile?.organizationName ||
        profile?.department?.name ||
        profile?.division?.name ||
        profile?.section?.name ||
        "Support Operations";


    const managerRole =
        profile?.managerType ||
        profile?.role ||
        "Manager";


    const createdAt =
        profile?.createdAt ||
        profile?.created_at ||
        "";


    const memberSince =
        createdAt
            ? new Date(createdAt)
                .toLocaleDateString(
                    undefined,
                    {
                        month: "short",
                        year: "numeric",
                    }
                )
            : "Active member";


    const initials =
        `${firstName?.[0] || ""}${lastName?.[0] || ""}`
            .toUpperCase() ||
        "M";


    const hasPhone =
        Boolean(
            profile?.phoneNumber ||
            profile?.phone ||
            form.phoneNumber
        );


    /* ============================================================
       RENDER
    ============================================================ */

    return (

        <div className="space-y-6">

            {/* ==================================================
                HEADER
            ================================================== */}

            <ManagerHeader
                user={profile || {
                    firstName: "Manager",
                    lastName: "",
                }}
                orgPath={`${organization} / Profile`}
                managerRole={managerRole}
            />


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div
                    className="
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        px-5
                        py-4
                        text-sm
                        text-red-700
                    "
                >

                    <div
                        className="
                            mt-0.5
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            bg-red-500
                        "
                    />

                    <span>{error}</span>

                </div>

            )}


            {/* ==================================================
                PROFILE HERO
            ================================================== */}

            <Card className="overflow-hidden">

                <div
                    className="
                        relative
                        overflow-hidden
                        border-b
                        border-slate-100
                        bg-white
                    "
                >

                    {/* Decorative background */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-20
                            -top-28
                            h-72
                            w-72
                            rounded-full
                            bg-blue-50
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -bottom-20
                            left-1/3
                            h-48
                            w-48
                            rounded-full
                            bg-slate-50
                            blur-3xl
                        "
                    />


                    <div
                        className="
                            relative
                            px-6
                            py-7
                            sm:px-8
                            sm:py-8
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-6
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >

                            {/* Identity */}

                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-16
                                        w-16
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-slate-900
                                        text-lg
                                        font-bold
                                        tracking-wide
                                        text-white
                                        shadow-sm
                                    "
                                >
                                    {loading ? (
                                        <div
                                            className="
                                                h-5
                                                w-5
                                                animate-spin
                                                rounded-full
                                                border-2
                                                border-white/30
                                                border-t-white
                                            "
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>


                                <div className="min-w-0">

                                    <div
                                        className="
                                            mb-1.5
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
                                                border-emerald-100
                                                bg-emerald-50
                                                px-2.5
                                                py-1
                                                text-[9px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]
                                                text-emerald-700
                                            "
                                        >

                                            <span
                                                className="
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    bg-emerald-500
                                                "
                                            />

                                            Active

                                        </span>

                                        <span
                                            className="
                                                text-xs
                                                text-slate-300
                                            "
                                        >
                                            /
                                        </span>

                                        <span
                                            className="
                                                text-xs
                                                font-medium
                                                text-slate-400
                                            "
                                        >
                                            Manager Profile
                                        </span>

                                    </div>


                                    {loading ? (

                                        <>
                                            <div
                                                className="
                                                    h-7
                                                    w-52
                                                    animate-pulse
                                                    rounded-lg
                                                    bg-slate-200
                                                "
                                            />

                                            <div
                                                className="
                                                    mt-2
                                                    h-4
                                                    w-40
                                                    animate-pulse
                                                    rounded
                                                    bg-slate-100
                                                "
                                            />
                                        </>

                                    ) : (

                                        <>

                                            <h1
                                                className="
                                                    truncate
                                                    text-2xl
                                                    font-bold
                                                    tracking-[-0.025em]
                                                    text-slate-950
                                                    sm:text-3xl
                                                "
                                            >
                                                {fullName}
                                            </h1>

                                            <div
                                                className="
                                                    mt-1.5
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-x-3
                                                    gap-y-1
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-500
                                                    "
                                                >
                                                    {managerRole}
                                                </span>

                                                <span
                                                    className="
                                                        hidden
                                                        text-slate-300
                                                        sm:inline
                                                    "
                                                >
                                                    •
                                                </span>

                                                <span
                                                    className="
                                                        text-sm
                                                        text-slate-400
                                                    "
                                                >
                                                    {organization}
                                                </span>

                                            </div>

                                        </>

                                    )}

                                </div>

                            </div>


                            {/* Actions */}

                            {!loading && (

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    {!editing ? (

                                        <Button
                                            variant="accent"
                                            size="sm"
                                            type="button"
                                            onClick={handleEdit}
                                        >

                                            <Edit3
                                                className="h-4 w-4"
                                            />

                                            Edit Profile

                                        </Button>

                                    ) : (

                                        <>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={
                                                    handleCancel
                                                }
                                            >

                                                <X
                                                    className="h-4 w-4"
                                                />

                                                Cancel

                                            </Button>

                                            <Button
                                                variant="accent"
                                                size="sm"
                                                type="button"
                                                onClick={
                                                    handleSubmit
                                                }
                                                loading={saving}
                                            >

                                                <Save
                                                    className="h-4 w-4"
                                                />

                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}

                                            </Button>

                                        </>

                                    )}

                                </div>

                            )}

                        </div>


                        {/* Hero metadata */}

                        {!loading && (

                            <div
                                className="
                                    mt-7
                                    grid
                                    gap-3
                                    border-t
                                    border-slate-100
                                    pt-5
                                    sm:grid-cols-3
                                "
                            >

                                <HeroMeta
                                    icon={Mail}
                                    label="Email"
                                    value={email}
                                />

                                <HeroMeta
                                    icon={Building2}
                                    label="Management Scope"
                                    value={organization}
                                />

                                <HeroMeta
                                    icon={CalendarDays}
                                    label="Member Since"
                                    value={memberSince}
                                />

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    PROFILE CONTENT
                ================================================= */}

                <CardContent className="p-6 sm:p-8">

                    <form onSubmit={handleSubmit}>

                        <div
                            className="
                                grid
                                gap-8
                                xl:grid-cols-[1fr_0.38fr]
                            "
                        >

                            {/* LEFT */}

                            <div>

                                <SectionHeading
                                    eyebrow="Personal Information"
                                    title="Account details"
                                    description="Keep your personal and contact information up to date."
                                />


                                <div
                                    className="
                                        mt-6
                                        grid
                                        gap-x-5
                                        gap-y-5
                                        md:grid-cols-2
                                    "
                                >

                                    <ProfileField
                                        icon={UserRound}
                                        label="First Name"
                                    >

                                        {editing ? (

                                            <ProfileInput
                                                name="firstName"
                                                value={
                                                    form.firstName
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="First name"
                                            />

                                        ) : (

                                            <ProfileValue
                                                value={
                                                    firstName ||
                                                    "—"
                                                }
                                            />

                                        )}

                                    </ProfileField>


                                    <ProfileField
                                        icon={UserRound}
                                        label="Last Name"
                                    >

                                        {editing ? (

                                            <ProfileInput
                                                name="lastName"
                                                value={
                                                    form.lastName
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Last name"
                                            />

                                        ) : (

                                            <ProfileValue
                                                value={
                                                    lastName ||
                                                    "—"
                                                }
                                            />

                                        )}

                                    </ProfileField>


                                    <ProfileField
                                        icon={Mail}
                                        label="Email Address"
                                    >

                                        <ReadOnlyValue
                                            value={email}
                                            badge="Read only"
                                        />

                                    </ProfileField>


                                    <ProfileField
                                        icon={Phone}
                                        label="Phone Number"
                                    >

                                        {editing ? (

                                            <ProfileInput
                                                name="phoneNumber"
                                                value={
                                                    form.phoneNumber
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Phone number"
                                            />

                                        ) : (

                                            <ProfileValue
                                                value={phone}
                                            />

                                        )}

                                    </ProfileField>

                                </div>


                                {/* Save area */}

                                {editing && (

                                    <div
                                        className="
                                            mt-7
                                            flex
                                            items-center
                                            justify-end
                                            gap-2
                                            border-t
                                            border-slate-100
                                            pt-5
                                        "
                                    >

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
                                            onClick={
                                                handleCancel
                                            }
                                        >

                                            <X
                                                className="h-4 w-4"
                                            />

                                            Cancel

                                        </Button>

                                        <Button
                                            variant="accent"
                                            size="sm"
                                            type="submit"
                                            loading={saving}
                                        >

                                            <Save
                                                className="h-4 w-4"
                                            />

                                            {saving
                                                ? "Saving..."
                                                : "Save Changes"}

                                        </Button>

                                    </div>

                                )}

                            </div>


                            {/* RIGHT */}

                            <div>

                                <SectionHeading
                                    eyebrow="Account Overview"
                                    title="Manager access"
                                    description="Your current role and organizational scope."
                                />


                                <div
                                    className="
                                        mt-6
                                        space-y-3
                                    "
                                >

                                    <OverviewItem
                                        icon={ShieldCheck}
                                        label="Role"
                                        value={managerRole}
                                    />

                                    <OverviewItem
                                        icon={Building2}
                                        label="Management Scope"
                                        value={organization}
                                    />

                                    <OverviewItem
                                        icon={Phone}
                                        label="Contact"
                                        value={
                                            hasPhone
                                                ? "Phone number added"
                                                : "No phone number"
                                        }
                                    />

                                    <OverviewItem
                                        icon={CheckCircle2}
                                        label="Account Status"
                                        value="Active"
                                        active
                                    />

                                </div>

                            </div>

                        </div>

                    </form>

                </CardContent>

            </Card>


            {/* ==================================================
                ACCOUNT STATUS CARDS
            ================================================== */}

            <div
                className="
                    grid
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                "
            >

                <StatusCard
                    icon={ShieldCheck}
                    label="Access Level"
                    value={managerRole}
                    description="Current manager permissions"
                />

                <StatusCard
                    icon={Building2}
                    label="Management Scope"
                    value={organization}
                    description="Organizational area under management"
                />

                <StatusCard
                    icon={LockKeyhole}
                    label="Account Security"
                    value="Protected"
                    description="Account credentials are secured"
                />

            </div>


            {/* ==================================================
                FOOTER
            ================================================== */}

            <div
                className="
                    flex
                    flex-col
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div className="flex items-center gap-2">

                    <div
                        className="
                            h-2
                            w-2
                            rounded-full
                            bg-emerald-500
                        "
                    />

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-500
                        "
                    >
                        Your manager profile is connected to
                        the account service.
                    </p>

                </div>

                <p
                    className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-400
                    "
                >
                    {managerRole}
                </p>

            </div>

        </div>
    );
}


/* ================================================================
   HERO META
================================================================ */

function HeroMeta({
    icon: Icon,
    label,
    value,
}) {

    return (

        <div
            className="
                flex
                min-w-0
                items-center
                gap-3
                rounded-xl
                bg-slate-50
                px-3.5
                py-3
            "
        >

            <div
                className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-slate-500
                    shadow-sm
                "
            >

                <Icon className="h-3.5 w-3.5" />

            </div>

            <div className="min-w-0">

                <p
                    className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-slate-400
                    "
                >
                    {label}
                </p>

                <p
                    className="
                        mt-0.5
                        truncate
                        text-xs
                        font-semibold
                        text-slate-700
                    "
                >
                    {value}
                </p>

            </div>

        </div>

    );
}


/* ================================================================
   SECTION HEADING
================================================================ */

function SectionHeading({
    eyebrow,
    title,
    description,
}) {

    return (

        <div>

            <p
                className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-blue-600
                "
            >
                {eyebrow}
            </p>

            <h2
                className="
                    mt-1
                    text-base
                    font-bold
                    text-slate-950
                "
            >
                {title}
            </h2>

            <p
                className="
                    mt-1
                    max-w-xl
                    text-sm
                    leading-5
                    text-slate-500
                "
            >
                {description}
            </p>

        </div>

    );
}


/* ================================================================
   PROFILE FIELD
================================================================ */

function ProfileField({
    icon: Icon,
    label,
    children,
}) {

    return (

        <div>

            <div
                className="
                    mb-2
                    flex
                    items-center
                    gap-2
                "
            >

                <Icon
                    className="
                        h-3.5
                        w-3.5
                        text-slate-400
                    "
                />

                <span
                    className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-slate-400
                    "
                >
                    {label}
                </span>

            </div>

            {children}

        </div>

    );
}


/* ================================================================
   INPUT
================================================================ */

function ProfileInput({
    name,
    value,
    onChange,
    placeholder,
}) {

    return (

        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                text-sm
                font-medium
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-300
                focus:ring-4
                focus:ring-blue-50
            "
        />

    );
}


/* ================================================================
   PROFILE VALUE
================================================================ */

function ProfileValue({
    value,
}) {

    return (

        <div
            className="
                flex
                min-h-11
                items-center
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                font-semibold
                text-slate-800
            "
        >
            {value}
        </div>

    );
}


/* ================================================================
   READ ONLY VALUE
================================================================ */

function ReadOnlyValue({
    value,
    badge,
}) {

    return (

        <div className="relative">

            <div
                className="
                    flex
                    min-h-11
                    items-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    pr-24
                    text-sm
                    font-medium
                    text-slate-700
                "
            >
                {value}
            </div>

            <span
                className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-white
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                    shadow-sm
                "
            >
                {badge}
            </span>

        </div>

    );
}


/* ================================================================
   OVERVIEW ITEM
================================================================ */

function OverviewItem({
    icon: Icon,
    label,
    value,
    active = false,
}) {

    return (

        <div
            className="
                rounded-xl
                border
                border-slate-100
                bg-slate-50/70
                p-3.5
            "
        >

            <div className="flex items-center gap-3">

                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-slate-500
                        shadow-sm
                    "
                >

                    <Icon className="h-4 w-4" />

                </div>

                <div className="min-w-0 flex-1">

                    <p
                        className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        "
                    >
                        {label}
                    </p>

                    <div
                        className="
                            mt-0.5
                            flex
                            items-center
                            gap-2
                        "
                    >

                        {active && (
                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    shrink-0
                                    rounded-full
                                    bg-emerald-500
                                "
                            />
                        )}

                        <p
                            className="
                                truncate
                                text-sm
                                font-bold
                                text-slate-900
                            "
                        >
                            {value}
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}


/* ================================================================
   STATUS CARD
================================================================ */

function StatusCard({
    icon: Icon,
    label,
    value,
    description,
}) {

    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                transition
                hover:-translate-y-0.5
                hover:shadow-md
            "
        >

            <div className="flex items-start gap-3">

                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-600
                    "
                >

                    <Icon className="h-4 w-4" />

                </div>

                <div className="min-w-0">

                    <p
                        className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-slate-400
                        "
                    >
                        {label}
                    </p>

                    <p
                        className="
                            mt-1
                            truncate
                            text-sm
                            font-bold
                            text-slate-900
                        "
                    >
                        {value}
                    </p>

                    <p
                        className="
                            mt-0.5
                            text-xs
                            leading-5
                            text-slate-400
                        "
                    >
                        {description}
                    </p>

                </div>

            </div>

        </div>

    );
}
