```jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaPlus,
    FaHistory,
    FaArrowRight,
    FaHeadset,
    FaLifeRing,
    FaChevronRight,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaUserEdit,
    FaShieldAlt,
    FaCheckCircle,
    FaFolderOpen,
    FaSpinner,
} from "react-icons/fa";

import { useAuth } from "../../context/useAuth";
import customerCaseApi from "../../api/customerCaseApi";

import CustomerHeader from "../../components/customer/CustomerHeader";
import RecentCases from "../../components/customer/RecentCases";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import CaseStats from "../../components/cases/CaseStats";


export default function CustomerDashboard() {

    const { user, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState({});
    const [cases, setCases] = useState([]);
    const [detailCase, setDetailCase] = useState(null);
    const [notifications, setNotifications] = useState([]);


    useEffect(() => {

        if (authLoading) {
            return;
        }

        if (user?.id) {
            loadDashboard();
            return;
        }

        setLoading(false);

    }, [user, authLoading]);


    useEffect(() => {

        const handleCaseUpdated = () => {

            if (user?.id) {
                loadDashboard();
            }

        };

        window.addEventListener(
            "cases:updated",
            handleCaseUpdated
        );

        return () => {

            window.removeEventListener(
                "cases:updated",
                handleCaseUpdated
            );

        };

    }, [user?.id]);


    async function loadDashboard() {

        try {

            setLoading(true);

            const response =
                await customerCaseApi.getDashboard();

            const data =
                response.data.data || {};

            const history =
                data.history ||
                data.cases ||
                response.data?.history ||
                response.data?.cases ||
                [];

            setCustomer(
                data.customer || {}
            );

            setCases(history);

            setNotifications(
                data.notifications || []
            );

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    }


    const tokenFirstName =
        user?.firstName && user?.email
            ? user.firstName !==
              user.email.split("@")[0]
                ? user.firstName
                : undefined
            : user?.firstName;


    const displayName =
        customer?.firstName ||
        tokenFirstName ||
        "Customer";


    /* =========================================================
       CUSTOMER INFORMATION
    ========================================================== */

    const fullName = useMemo(() => {

        return [
            customer?.firstName,
            customer?.middleName,
            customer?.lastName,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || displayName || "Customer";

    }, [customer, displayName]);


    const initials = useMemo(() => {

        const first =
            customer?.firstName?.charAt(0) || "";

        const last =
            customer?.lastName?.charAt(0) || "";

        const generated =
            `${first}${last}`.toUpperCase();

        return generated || "CU";

    }, [customer]);


    const organization =
        customer?.organizationName ||
        customer?.organization?.name ||
        "Not Provided";


    /* =========================================================
       CASE SUMMARY
    ========================================================== */

    const caseSummary = useMemo(() => {

        const countByStatus = (status) =>
            cases.filter(
                (item) => item?.status === status
            ).length;


        return {

            total: cases.length,

            open:
                countByStatus("OPEN"),

            inProgress:
                countByStatus("IN_PROGRESS"),

            pending:
                countByStatus("PENDING"),

            escalated:
                countByStatus("ESCALATED"),

            resolved:
                countByStatus("RESOLVED"),

            customerConfirmation:
                countByStatus("CUSTOMER_CONFIRMATION"),

            closed:
                countByStatus("CLOSED"),

        };

    }, [cases]);


    /* =========================================================
       PROFILE COMPLETION
    ========================================================== */

    const profileFields = [

        customer?.firstName,

        customer?.middleName,

        customer?.lastName,

        customer?.email,

        customer?.phoneNumber,

        customer?.organizationName ||
            customer?.organization?.name,

    ];


    const completedProfileFields =
        profileFields.filter(
            Boolean
        ).length;


    const profileCompletion =
        Math.round(
            (
                completedProfileFields /
                profileFields.length
            ) * 100
        );


    /* =========================================================
       LOADING STATE
    ========================================================== */

    if (loading) {

        return (

            <div className="
                min-h-[70vh]
                flex
                items-center
                justify-center
                px-6
            ">

                <div className="text-center">

                    <div className="
                        w-11
                        h-11
                        border-4
                        border-slate-200
                        border-t-slate-800
                        rounded-full
                        animate-spin
                        mx-auto
                    " />

                    <p className="
                        mt-4
                        text-sm
                        font-semibold
                        text-slate-600
                    ">
                        Loading your dashboard...
                    </p>

                    <p className="
                        mt-1
                        text-xs
                        text-slate-400
                    ">
                        Please wait a moment
                    </p>

                </div>

            </div>

        );

    }


    /* =========================================================
       DASHBOARD
    ========================================================== */

    return (

        <div className="
            min-h-full
            bg-slate-50
            px-1
            sm:px-0
        ">


            {/* =====================================================
                TOP HEADER
            ====================================================== */}

            <section className="mb-6">

                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                ">

                    <div className="
                        p-5
                        sm:p-6
                    ">

                        <div className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-5
                        ">


                            {/* CUSTOMER INFO */}

                            <div className="
                                min-w-0
                                flex-1
                            ">

                                <CustomerHeader
                                    customer={customer}
                                    displayName={displayName}
                                    notifications={notifications}
                                    refreshNotifications={
                                        loadDashboard
                                    }
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="
                                flex
                                flex-col
                                sm:flex-row
                                gap-3
                                shrink-0
                            ">

                                <Link
                                    to="/customer/create-case"
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-slate-900
                                        px-5
                                        py-3
                                        text-sm
                                        font-bold
                                        text-white
                                        shadow-sm
                                        hover:bg-slate-800
                                        hover:shadow-md
                                        active:scale-[0.98]
                                        transition-all
                                    "
                                >

                                    <FaPlus className="text-xs" />

                                    New Request

                                </Link>


                                <Link
                                    to="/customer/my-cases"
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-5
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        hover:bg-slate-50
                                        hover:border-slate-300
                                        active:scale-[0.98]
                                        transition-all
                                    "
                                >

                                    <FaHistory className="text-xs" />

                                    View My Cases

                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                WELCOME HERO
            ====================================================== */}

            <section className="mb-7">

                <div className="
                    relative
                    overflow-hidden
                    rounded-2xl
                    bg-slate-900
                    shadow-sm
                ">


                    {/* Background decoration */}

                    <div className="
                        absolute
                        -right-20
                        -top-28
                        w-72
                        h-72
                        rounded-full
                        border
                        border-white/5
                    " />

                    <div className="
                        absolute
                        right-12
                        -bottom-28
                        w-52
                        h-52
                        rounded-full
                        bg-white/[0.03]
                    " />

                    <div className="
                        absolute
                        left-1/2
                        -top-20
                        w-40
                        h-40
                        rounded-full
                        bg-white/[0.02]
                    " />


                    <div className="
                        relative
                        px-6
                        py-7
                        sm:px-8
                        sm:py-8
                        lg:py-9
                    ">

                        <div className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-7
                        ">


                            {/* HERO TEXT */}

                            <div className="max-w-2xl">

                                <div className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/5
                                    px-3
                                    py-1.5
                                    mb-4
                                ">

                                    <span className="
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                        bg-emerald-400
                                    " />

                                    <span className="
                                        text-xs
                                        font-semibold
                                        text-slate-300
                                    ">
                                        Support Portal
                                    </span>

                                </div>


                                <p className="
                                    text-sm
                                    font-medium
                                    text-slate-400
                                    mb-1
                                ">
                                    Welcome back,
                                </p>


                                <h1 className="
                                    text-2xl
                                    sm:text-3xl
                                    lg:text-[32px]
                                    font-bold
                                    text-white
                                    tracking-tight
                                ">
                                    Hello, {displayName} 👋
                                </h1>


                                <p className="
                                    mt-3
                                    text-sm
                                    leading-6
                                    text-slate-400
                                    max-w-xl
                                ">
                                    Manage your support requests, track
                                    your cases, and stay updated with
                                    the latest activity from our support team.
                                </p>

                            </div>


                            {/* HERO ICON */}

                            <div className="
                                hidden
                                sm:flex
                                shrink-0
                                w-20
                                h-20
                                rounded-2xl
                                bg-white/5
                                border
                                border-white/10
                                items-center
                                justify-center
                            ">

                                <FaHeadset className="
                                    text-3xl
                                    text-white
                                " />

                            </div>

                        </div>


                        {/* HERO QUICK ACTION */}

                        <div className="
                            relative
                            mt-7
                            pt-5
                            border-t
                            border-white/10
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-4
                        ">

                            <div>

                                <p className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-slate-500
                                ">
                                    Need assistance?
                                </p>

                                <p className="
                                    text-sm
                                    text-slate-300
                                    mt-1
                                ">
                                    Create a support request and we'll
                                    help you resolve it.
                                </p>

                            </div>


                            <Link
                                to="/customer/create-case"
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-bold
                                    text-slate-900
                                    hover:bg-slate-100
                                    transition
                                    shrink-0
                                "
                            >

                                <FaPlus className="text-xs" />

                                Create Case

                                <FaChevronRight className="text-[10px]" />

                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                ACCOUNT OVERVIEW
            ====================================================== */}

            <section className="mb-7">

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                    gap-2
                    mb-4
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <div className="
                                w-1
                                h-5
                                rounded-full
                                bg-slate-900
                            " />

                            <h2 className="
                                text-lg
                                font-bold
                                text-slate-900
                            ">
                                Account Overview
                            </h2>

                        </div>


                        <p className="
                            text-sm
                            text-slate-500
                            mt-1
                            ml-3
                        ">
                            Your account information and support activity
                        </p>

                    </div>

                </div>


                <div className="
                    grid
                    grid-cols-1
                    xl:grid-cols-[1.35fr_0.65fr]
                    gap-5
                ">


                    {/* =================================================
                        PROFILE CARD
                    ================================================== */}

                    <div className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                    ">

                        {/* Top accent */}

                        <div className="
                            h-1
                            w-full
                            bg-slate-900
                        " />


                        <div className="
                            p-5
                            sm:p-6
                        ">


                            {/* PROFILE HEADER */}

                            <div className="
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-5
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-4
                                    min-w-0
                                ">

                                    {/* Avatar */}

                                    <div className="
                                        relative
                                        shrink-0
                                    ">

                                        <div className="
                                            flex
                                            h-16
                                            w-16
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-900
                                            text-white
                                            shadow-sm
                                        ">

                                            <span className="
                                                text-lg
                                                font-bold
                                                tracking-tight
                                            ">
                                                {initials}
                                            </span>

                                        </div>


                                        <div className="
                                            absolute
                                            -bottom-1
                                            -right-1
                                            flex
                                            h-6
                                            w-6
                                            items-center
                                            justify-center
                                            rounded-full
                                            border-[3px]
                                            border-white
                                            bg-emerald-500
                                            text-white
                                        ">

                                            <FaCheckCircle className="
                                                text-[8px]
                                            " />

                                        </div>

                                    </div>


                                    {/* Name */}

                                    <div className="min-w-0">

                                        <div className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                        ">

                                            <h3 className="
                                                truncate
                                                text-lg
                                                font-bold
                                                tracking-tight
                                                text-slate-900
                                            ">
                                                {fullName}
                                            </h3>


                                            <span className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                border
                                                border-emerald-100
                                                bg-emerald-50
                                                px-2
                                                py-1
                                                text-[9px]
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-emerald-600
                                            ">

                                                <span className="
                                                    h-1.5
                                                    w-1.5
                                                    rounded-full
                                                    bg-emerald-500
                                                " />

                                                Active

                                            </span>

                                        </div>


                                        <p className="
                                            mt-1
                                            text-xs
                                            text-slate-400
                                        ">
                                            Customer account
                                        </p>

                                    </div>

                                </div>


                                {/* PROFILE ACTION */}

                                <Link
                                    to="/customer/profile"
                                    className="
                                        inline-flex
                                        shrink-0
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-xs
                                        font-bold
                                        text-slate-700
                                        hover:bg-slate-50
                                        hover:border-slate-300
                                        transition
                                    "
                                >

                                    <FaUserEdit className="text-[11px]" />

                                    Edit Profile

                                </Link>

                            </div>


                            {/* CONTACT DETAILS */}

                            <div className="
                                mt-6
                                grid
                                grid-cols-1
                                md:grid-cols-3
                                gap-3
                            ">


                                {/* EMAIL */}

                                <div className="
                                    rounded-xl
                                    border
                                    border-slate-100
                                    bg-slate-50
                                    p-3.5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-blue-50
                                            text-blue-500
                                        ">

                                            <FaEnvelope className="text-xs" />

                                        </div>


                                        <div className="min-w-0">

                                            <p className="
                                                text-[9px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]
                                                text-slate-400
                                            ">
                                                Email
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                                title={
                                                    customer?.email || ""
                                                }
                                            >
                                                {customer?.email ||
                                                    "Not Provided"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* PHONE */}

                                <div className="
                                    rounded-xl
                                    border
                                    border-slate-100
                                    bg-slate-50
                                    p-3.5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-emerald-50
                                            text-emerald-500
                                        ">

                                            <FaPhone className="text-xs" />

                                        </div>


                                        <div className="min-w-0">

                                            <p className="
                                                text-[9px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]
                                                text-slate-400
                                            ">
                                                Phone
                                            </p>

                                            <p className="
                                                mt-1
                                                truncate
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            ">
                                                {customer?.phoneNumber ||
                                                    "Not Provided"}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* ORGANIZATION */}

                                <div className="
                                    rounded-xl
                                    border
                                    border-slate-100
                                    bg-slate-50
                                    p-3.5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-violet-50
                                            text-violet-500
                                        ">

                                            <FaBuilding className="text-xs" />

                                        </div>


                                        <div className="min-w-0">

                                            <p className="
                                                text-[9px]
                                                font-bold
                                                uppercase
                                                tracking-[0.12em]
                                                text-slate-400
                                            ">
                                                Organization
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                                title={organization}
                                            >
                                                {organization}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* PROFILE COMPLETION */}

                            <div className="
                                mt-5
                                rounded-xl
                                border
                                border-slate-100
                                bg-white
                                p-4
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">

                                    <div>

                                        <p className="
                                            text-xs
                                            font-bold
                                            text-slate-700
                                        ">
                                            Profile completeness
                                        </p>

                                        <p className="
                                            mt-1
                                            text-[10px]
                                            text-slate-400
                                        ">
                                            Keep your account information up to date
                                        </p>

                                    </div>


                                    <span className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                    ">
                                        {profileCompletion}%
                                    </span>

                                </div>


                                <div className="
                                    mt-3
                                    h-2
                                    overflow-hidden
                                    rounded-full
                                    bg-slate-100
                                ">

                                    <div
                                        className="
                                            h-full
                                            rounded-full
                                            bg-slate-900
                                            transition-all
                                            duration-500
                                        "
                                        style={{
                                            width: `${profileCompletion}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CASE ACTIVITY CARD
                    ================================================== */}

                    <div className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        p-5
                        sm:p-6
                    ">

                        <div className="
                            flex
                            items-start
                            justify-between
                            gap-3
                        ">

                            <div>

                                <p className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                ">
                                    Case Activity
                                </p>

                                <p className="
                                    mt-1
                                    text-[11px]
                                    text-slate-400
                                ">
                                    Your current support workload
                                </p>

                            </div>


                            <div className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-slate-600
                            ">

                                <FaFolderOpen className="text-xs" />

                            </div>

                        </div>


                        {/* TOTAL */}

                        <div className="
                            mt-5
                            rounded-xl
                            bg-slate-900
                            p-4
                            text-white
                        ">

                            <div className="
                                flex
                                items-center
                                justify-between
                                gap-4
                            ">

                                <div>

                                    <p className="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.12em]
                                        text-slate-400
                                    ">
                                        Total Cases
                                    </p>

                                    <p className="
                                        mt-1
                                        text-3xl
                                        font-bold
                                    ">
                                        {caseSummary.total}
                                    </p>

                                </div>


                                <FaFolderOpen className="
                                    text-xl
                                    text-slate-500
                                " />

                            </div>

                        </div>


                        {/* CASE MINI STATS */}

                        <div className="
                            mt-3
                            grid
                            grid-cols-2
                            gap-3
                        ">


                            {/* OPEN */}

                            <div className="
                                rounded-xl
                                border
                                border-blue-100
                                bg-blue-50
                                p-3
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-2
                                ">

                                    <p className="
                                        text-[10px]
                                        font-semibold
                                        text-blue-600
                                    ">
                                        Open
                                    </p>

                                    <FaFolderOpen className="
                                        text-[10px]
                                        text-blue-500
                                    " />

                                </div>

                                <p className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    text-slate-900
                                ">
                                    {caseSummary.open}
                                </p>

                            </div>


                            {/* IN PROGRESS */}

                            <div className="
                                rounded-xl
                                border
                                border-indigo-100
                                bg-indigo-50
                                p-3
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-2
                                ">

                                    <p className="
                                        text-[10px]
                                        font-semibold
                                        text-indigo-600
                                    ">
                                        In Progress
                                    </p>

                                    <FaSpinner className="
                                        text-[10px]
                                        text-indigo-500
                                    " />

                                </div>

                                <p className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    text-slate-900
                                ">
                                    {caseSummary.inProgress}
                                </p>

                            </div>


                            {/* RESOLVED */}

                            <div className="
                                rounded-xl
                                border
                                border-emerald-100
                                bg-emerald-50
                                p-3
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-2
                                ">

                                    <p className="
                                        text-[10px]
                                        font-semibold
                                        text-emerald-600
                                    ">
                                        Resolved
                                    </p>

                                    <FaCheckCircle className="
                                        text-[10px]
                                        text-emerald-500
                                    " />

                                </div>

                                <p className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    text-slate-900
                                ">
                                    {caseSummary.resolved}
                                </p>

                            </div>


                            {/* PENDING */}

                            <div className="
                                rounded-xl
                                border
                                border-amber-100
                                bg-amber-50
                                p-3
                            ">

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-2
                                ">

                                    <p className="
                                        text-[10px]
                                        font-semibold
                                        text-amber-600
                                    ">
                                        Pending
                                    </p>

                                    <FaSpinner className="
                                        text-[10px]
                                        text-amber-500
                                    " />

                                </div>

                                <p className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    text-slate-900
                                ">
                                    {caseSummary.pending}
                                </p>

                            </div>

                        </div>


                        {/* VIEW CASES */}

                        <Link
                            to="/customer/my-cases"
                            className="
                                mt-4
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                                text-xs
                                font-semibold
                                text-slate-600
                                hover:bg-slate-50
                                hover:text-slate-900
                                transition
                            "
                        >

                            <span>
                                View all cases
                            </span>

                            <FaArrowRight className="text-[10px]" />

                        </Link>

                    </div>

                </div>

            </section>


            {/* =====================================================
                CASE OVERVIEW
            ====================================================== */}

            <section className="mb-7">

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                    gap-2
                    mb-4
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <div className="
                                w-1
                                h-5
                                rounded-full
                                bg-slate-900
                            " />

                            <h2 className="
                                text-lg
                                font-bold
                                text-slate-900
                            ">
                                Case Overview
                            </h2>

                        </div>


                        <p className="
                            text-sm
                            text-slate-500
                            mt-1
                            ml-3
                        ">
                            A quick summary of your support activity
                        </p>

                    </div>


                    <Link
                        to="/customer/my-cases"
                        className="
                            hidden
                            sm:inline-flex
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-slate-500
                            hover:text-slate-900
                            transition
                        "
                    >

                        View case history

                        <FaArrowRight className="text-[10px]" />

                    </Link>

                </div>


                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    p-4
                    sm:p-5
                ">

                    <CaseStats
                        cases={cases}
                    />

                </div>

            </section>


            {/* =====================================================
                RECENT CASES
            ====================================================== */}

            <section>

                <div className="
                    flex
                    items-end
                    justify-between
                    mb-4
                ">

                    <div>

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <div className="
                                w-1
                                h-5
                                rounded-full
                                bg-slate-900
                            " />

                            <h2 className="
                                text-lg
                                font-bold
                                text-slate-900
                            ">
                                Recent Cases
                            </h2>

                        </div>


                        <p className="
                            text-sm
                            text-slate-500
                            mt-1
                            ml-3
                        ">
                            Your latest support requests
                        </p>

                    </div>


                    <Link
                        to="/customer/my-cases"
                        className="
                            hidden
                            sm:inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-slate-600
                            hover:text-slate-900
                            transition
                        "
                    >

                        View all

                        <FaArrowRight className="text-xs" />

                    </Link>

                </div>


                <div className="
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-sm
                    overflow-hidden
                ">

                    {cases.length > 0 ? (

                        <RecentCases
                            cases={cases.slice(0, 5)}
                            onView={setDetailCase}
                        />

                    ) : (

                        <div className="
                            px-6
                            py-14
                            text-center
                        ">

                            <div className="
                                mx-auto
                                w-12
                                h-12
                                rounded-xl
                                bg-slate-100
                                text-slate-400
                                flex
                                items-center
                                justify-center
                            ">

                                <FaLifeRing size={19} />

                            </div>


                            <h3 className="
                                mt-4
                                text-sm
                                font-bold
                                text-slate-800
                            ">
                                No support cases yet
                            </h3>


                            <p className="
                                mt-1.5
                                text-xs
                                text-slate-500
                            ">
                                When you create a support request,
                                it will appear here.
                            </p>


                            <Link
                                to="/customer/create-case"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    mt-5
                                    rounded-xl
                                    bg-slate-900
                                    px-4
                                    py-2.5
                                    text-xs
                                    font-bold
                                    text-white
                                    hover:bg-slate-800
                                    transition
                                "
                            >

                                <FaPlus className="text-[10px]" />

                                Create your first case

                            </Link>

                        </div>

                    )}

                </div>


                {/* MOBILE VIEW ALL */}

                <div className="
                    mt-4
                    sm:hidden
                ">

                    <Link
                        to="/customer/my-cases"
                        className="
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-slate-700
                            hover:bg-slate-50
                            transition
                        "
                    >

                        View All Cases

                        <FaArrowRight className="text-xs" />

                    </Link>

                </div>

            </section>


            {/* =====================================================
                CASE DETAILS DRAWER
            ====================================================== */}

            {detailCase && (

                <CaseDetailsDrawer
                    caseData={detailCase}
                    close={() => setDetailCase(null)}
                />

            )}

        </div>

    );

}
```

