import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaPlusCircle,
    FaHistory
} from "react-icons/fa";

import { useAuth } from "../../context/useAuth";
import customerCaseApi from "../../api/customerCaseApi";
import CustomerHeader from "../../components/customer/CustomerHeader";
import RecentCases from "../../components/customer/RecentCases";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import CaseStats from "../../components/cases/CaseStats";

import "../../styles/customerDashboard.css";

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

        window.addEventListener("cases:updated", handleCaseUpdated);

        return () => {
            window.removeEventListener("cases:updated", handleCaseUpdated);
        };
    }, [user?.id]);

    async function loadDashboard() {
        try {
            setLoading(true);

            const response = await customerCaseApi.getDashboard();
            const data = response.data.data || {};
            const history =
                data.history ||
                data.cases ||
                response.data?.history ||
                response.data?.cases ||
                [];

            setCustomer(data.customer || {});
            setCases(history);
            setNotifications(data.notifications || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const tokenFirstName = user?.firstName && user?.email        ? user.firstName !== user.email.split("@")[0]            ? user.firstName
            : undefined
        : user?.firstName;

    const displayName = customer.firstName
        ? customer.firstName
        : tokenFirstName
        ? tokenFirstName
        : "Customer";

    if (loading) {

        return (

            <div className="customer-loading">

                Loading Dashboard...

            </div>

        );

    }

    return (

        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <CustomerHeader

                    customer={customer}

                    displayName={displayName}

                    notifications={notifications}

                    refreshNotifications={loadDashboard}

                />

                <div className="hidden gap-2 sm:flex">
                    <Link to="/customer/create-case" className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition">
                        <FaPlusCircle />
                        New request
                    </Link>
                    <Link to="/customer/my-cases" className="inline-flex items-center gap-2 rounded-md border border-navy-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-navy-50 transition">
                        <FaHistory />
                        View My Cases
                    </Link>
                </div>

            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <CaseStats cases={cases} />
            </div>

            <div>

                    <RecentCases

                        cases={cases.slice(0,5)}

                        onView={setDetailCase}

                    />

            </div>

            {detailCase && <CaseDetailsDrawer caseData={detailCase} close={() => setDetailCase(null)} />}

        </div>

    );

}