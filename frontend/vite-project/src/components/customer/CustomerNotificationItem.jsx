import {
    FaBell,
    FaCheckCircle,
    FaExclamationCircle,
    FaInfoCircle,
    FaClock
} from "react-icons/fa";

import "../../styles/customerDashboard.css";

export default function CustomerNotificationItem({

    notification

}) {

    function getIcon(type) {

        switch (type) {

            case "CASE_ASSIGNED":

                return (
                    <FaBell
                        className="notification-icon assigned"
                    />
                );

            case "CASE_RESOLVED":

                return (
                    <FaCheckCircle
                        className="notification-icon resolved"
                    />
                );

            case "CASE_REASSIGNED":

                return (
                    <FaExclamationCircle
                        className="notification-icon warning"
                    />
                );

            case "CASE_CLOSED":

                return (
                    <FaCheckCircle
                        className="notification-icon closed"
                    />
                );

            default:

                return (
                    <FaInfoCircle
                        className="notification-icon info"
                    />
                );

        }

    }

    function formatDate(date) {

        if (!date) return "";

        return new Date(date).toLocaleString(

            undefined,

            {

                year: "numeric",

                month: "short",

                day: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }

        );

    }

    return (

        <div

            className={

                notification.read

                    ? "customer-notification-item"

                    : "customer-notification-item unread"

            }

        >

            <div className="notification-left">

                {getIcon(notification.type)}

            </div>

            <div className="notification-content">

                <p className="notification-message">

                    {notification.message}

                </p>

                <div className="notification-time">

                    <FaClock />

                    <span>

                        {formatDate(

                            notification.createdAt

                        )}

                    </span>

                </div>

            </div>

            {

                !notification.read && (

                    <span className="notification-dot" />

                )

            }

        </div>

    );

}