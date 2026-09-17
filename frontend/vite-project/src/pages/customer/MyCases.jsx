import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaPlus,
    FaFolderOpen,
    FaArrowRight,
    FaSyncAlt,
    FaTicketAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/useAuth";
import customerCaseApi from "../../api/customerCaseApi";

import CaseCard from "../../components/customer/CaseCard";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";


export default function MyCases() {

    const { user } = useAuth();

    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [detailCase, setDetailCase] = useState(null);


    useEffect(() => {
        loadCases();
    }, [user]);


    const loadCases = async () => {

        try {

            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            const response =
                await customerCaseApi.getCustomerCases();

            console.log(
                "CUSTOMER CASE RESPONSE:",
                response.status,
                response.data,
                response.headers
            );

            const history =
                response.data?.data?.history ||
                response.data?.data?.cases ||
                response.data?.history ||
                response.data?.cases ||
                [];

            setCases(history);

        } catch (err) {

            console.log(err);

            setError("Unable to load your cases");

        } finally {

            setLoading(false);

        }

    };


    /* =========================
       LOADING
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
                        border-t-slate-900
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

                        Loading your cases...

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
       ERROR
    ========================== */

    if (error) {

        return (

            <div className="
                min-h-[60vh]
                flex
                items-center
                justify-center
                px-4
            ">

                <div className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-red-100
                    bg-white
                    p-8
                    text-center
                    shadow-sm
                ">

                    <div className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-50
                    ">

                        <span className="
                            text-lg
                            font-bold
                            text-red-600
                        ">

                            !

                        </span>

                    </div>


                    <h2 className="
                        mt-4
                        text-lg
                        font-bold
                        text-slate-900
                    ">

                        Something went wrong

                    </h2>


                    <p className="
                        mt-2
                        text-sm
                        leading-6
                        text-slate-500
                    ">

                        {error}

                    </p>


                    <button
                        type="button"
                        onClick={loadCases}
                        className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-slate-900
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            hover:bg-slate-800
                            hover:shadow-md
                            transition-all
                        "
                    >

                        <FaSyncAlt className="text-xs" />

                        Try Again

                    </button>

                </div>

            </div>

        );

    }


    /* =========================
       MAIN PAGE
    ========================== */

    return (

        <>

            <div className="
                min-h-full
                bg-slate-50
            ">


                {/* =====================================
                    PAGE HEADER
                ====================================== */}

                <section className="mb-7">

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-2xl
                        shadow-sm
                        overflow-hidden
                    ">

                        <div className="
                            px-6
                            py-6
                            sm:px-7
                            sm:py-7
                        ">

                            <div className="
                                flex
                                flex-col
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                                gap-6
                            ">


                                {/* TITLE */}

                                <div className="
                                    flex
                                    items-center
                                    gap-4
                                ">

                                    <div className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-slate-900
                                        text-white
                                        shadow-sm
                                    ">

                                        <FaFolderOpen
                                            className="text-base"
                                        />

                                    </div>


                                    <div>

                                        <p className="
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-400
                                        ">

                                            Customer Portal

                                        </p>


                                        <h1 className="
                                            mt-1
                                            text-2xl
                                            font-bold
                                            tracking-tight
                                            text-slate-900
                                        ">

                                            My Support Cases

                                        </h1>


                                        <p className="
                                            mt-1.5
                                            text-sm
                                            text-slate-500
                                        ">

                                            View and track all your support requests

                                        </p>

                                    </div>

                                </div>


                                {/* ACTION */}

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

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    SUMMARY BAR
                ====================================== */}

                <section className="mb-6">

                    <div className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-4
                    ">


                        {/* CASE COUNT */}

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

                                    Your Cases

                                </h2>

                            </div>


                            <p className="
                                ml-3
                                mt-1
                                text-sm
                                text-slate-500
                            ">

                                {cases.length === 1
                                    ? "You currently have 1 support case"
                                    : `You currently have ${cases.length} support cases`
                                }

                            </p>

                        </div>


                        {/* DESKTOP REFRESH */}

                        <button
                            type="button"
                            onClick={loadCases}
                            className="
                                hidden
                                sm:inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-slate-600
                                shadow-sm
                                hover:bg-slate-50
                                hover:text-slate-900
                                hover:border-slate-300
                                transition
                            "
                        >

                            <FaSyncAlt className="text-[10px]" />

                            Refresh

                        </button>

                    </div>

                </section>


                {/* =====================================
                    CASE CONTENT
                ====================================== */}

                {cases.length === 0 ? (

                    /* =================================
                       EMPTY STATE
                    ================================== */

                    <section>

                        <div className="
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            shadow-sm
                            overflow-hidden
                        ">

                            <div className="
                                px-6
                                py-16
                                sm:py-20
                                text-center
                            ">


                                <div className="
                                    mx-auto
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-slate-100
                                    text-slate-400
                                ">

                                    <FaTicketAlt
                                        className="text-2xl"
                                    />

                                </div>


                                <h3 className="
                                    mt-5
                                    text-lg
                                    font-bold
                                    text-slate-900
                                ">

                                    No Support Cases Yet

                                </h3>


                                <p className="
                                    mx-auto
                                    mt-2
                                    max-w-md
                                    text-sm
                                    leading-6
                                    text-slate-500
                                ">

                                    You haven't submitted any support
                                    requests yet. Once you create a
                                    request, you'll be able to track
                                    its progress here.

                                </p>


                                <Link
                                    to="/customer/create-case"
                                    className="
                                        mt-6
                                        inline-flex
                                        items-center
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
                                        transition-all
                                    "
                                >

                                    <FaPlus className="text-xs" />

                                    Create Your First Request

                                    <FaArrowRight
                                        className="text-[10px]"
                                    />

                                </Link>

                            </div>

                        </div>

                    </section>

                ) : (

                    /* =================================
                       CASE GRID
                    ================================== */

                    <section>

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            xl:grid-cols-3
                            gap-5
                        ">

                            {cases.map((item) => (

                                <div
                                    key={item.id}
                                    className="
                                        group
                                        relative
                                    "
                                >

                                    <div className="
                                        h-full
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        shadow-sm
                                        overflow-hidden
                                        transition-all
                                        duration-200
                                        hover:-translate-y-1
                                        hover:border-slate-300
                                        hover:shadow-lg
                                    ">

                                        <CaseCard
                                            caseData={item}
                                            onClick={() =>
                                                setDetailCase(item)
                                            }
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>


                        {/* MOBILE REFRESH */}

                        <div className="
                            mt-6
                            sm:hidden
                        ">

                            <button
                                type="button"
                                onClick={loadCases}
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
                                    text-slate-600
                                    shadow-sm
                                    hover:bg-slate-50
                                    transition
                                "
                            >

                                <FaSyncAlt className="text-xs" />

                                Refresh Cases

                            </button>

                        </div>

                    </section>

                )}

            </div>


            {/* =====================================
                CASE DETAILS DRAWER
            ====================================== */}

            {detailCase && (

                <CaseDetailsDrawer
                    caseData={detailCase}
                    close={() => setDetailCase(null)}
                />

            )}

        </>

    );

}
