import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaPlus,
    FaHistory,
    FaArrowRight,
    FaHeadset,
    FaLifeRing,
    FaChevronRight,
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
        customer.firstName ||
        tokenFirstName ||
        "Customer";


    /* =========================
       LOADING STATE
    ========================== */

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


    /* =========================
       DASHBOARD
    ========================== */

    return (

        <div className="
            min-h-full
            bg-slate-50
            px-1
            sm:px-0
        ">


            {/* =====================================
                TOP HEADER
            ====================================== */}

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


            {/* =====================================
                WELCOME HERO
            ====================================== */}

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


            {/* =====================================
                CASE OVERVIEW
            ====================================== */}

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


            {/* =====================================
                RECENT CASES
            ====================================== */}

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


            {/* =====================================
                CASE DETAILS DRAWER
            ====================================== */}

            {detailCase && (

                <CaseDetailsDrawer
                    caseData={detailCase}
                    close={() => setDetailCase(null)}
                />

            )}

        </div>

    );

}