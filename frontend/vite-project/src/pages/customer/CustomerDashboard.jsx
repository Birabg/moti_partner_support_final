import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaPlus,
    FaHistory,
    FaArrowRight,
    FaBell,
    FaLifeRing,
} from "react-icons/fa";

import { Headset } from "lucide-react";

import { useAuth } from "../../context/useAuth";
import customerCaseApi from "../../api/customerCaseApi";

import CustomerPageHero from "../../components/customer/CustomerPageHero";
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


    const loadDashboard = useCallback(async () => {

        try {

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

    }, []);


    useEffect(() => {

        if (authLoading) {
            return;
        }

        loadDashboard();

        const intervalId = setInterval(
            loadDashboard,
            15000
        );

        return () => {
            clearInterval(intervalId);
        };

    }, [user, authLoading, loadDashboard]);


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

    }, [user?.id, loadDashboard]);


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
                CUSTOMER HERO
            ====================================== */}

            <section className="mb-7">

                <CustomerPageHero
                    eyebrow="Customer Portal"
                    title={`Hello, ${displayName} 👋`}
                    description="Manage your support requests, track your cases, and stay updated with the latest activity from our support team."
                    icon={Headset}
                    right={

                        <div className="flex flex-wrap items-center gap-3">

                            <Link
                                to="/customer/notifications"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/[0.06]
                                    px-4
                                    py-2.5
                                    text-[11px]
                                    font-semibold
                                    text-white/70
                                    transition
                                    hover:bg-white/[0.1]
                                "
                            >

                                <FaBell className="text-xs" />

                                {notifications.length}

                                {" "}

                                Notification{notifications.length === 1 ? "" : "s"}

                            </Link>

                            <Link
                                to="/customer/create-case"
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-white
                                    px-5
                                    py-3
                                    text-sm
                                    font-bold
                                    text-slate-900
                                    shadow-sm
                                    transition
                                    hover:bg-slate-100
                                    active:scale-[0.98]
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
                                    border-white/10
                                    bg-white/[0.08]
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-white/[0.14]
                                    active:scale-[0.98]
                                "
                            >

                                <FaHistory className="text-xs" />

                                View My Cases

                            </Link>

                        </div>

                    }
                />

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
