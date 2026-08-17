import { useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";

import CustomerNotificationItem from "./CustomerNotificationItem";

import "../../styles/customerDashboard.css";

export default function NotificationDropdown({

    notifications = [],

    open,

    onClose,

    onViewAll

}) {

    const dropdownRef = useRef(null);

    useEffect(() => {

        function handleClickOutside(event) {

            if (

                dropdownRef.current &&

                !dropdownRef.current.contains(event.target)

            ) {

                onClose();

            }

        }

        if (open) {

            document.addEventListener(

                "mousedown",

                handleClickOutside

            );

        }

        return () =>

            document.removeEventListener(

                "mousedown",

                handleClickOutside

            );

    }, [open, onClose]);

    if (!open) {

        return null;

    }

    return (

        <div
            ref={dropdownRef}
            className="customer-notification-dropdown"
        >

            <div className="customer-notification-header">

                <div className="notification-title">

                    <FaBell />

                    <span>

                        Notifications

                    </span>

                </div>

                <span className="notification-count">

                    {notifications.length}

                </span>

            </div>

            <div className="customer-notification-body">

                {

                    notifications.length === 0 && (

                        <div className="notification-empty">

                            <FaBell
                                size={28}
                                color="#94a2b8"
                            />

                            <p>

                                No notifications available.

                            </p>

                        </div>

                    )

                }

                {

                    notifications.map(notification => (

                        <CustomerNotificationItem

                            key={notification.id}

                            notification={notification}

                        />

                    ))

                }

            </div>

            <div className="customer-notification-footer">

                <button

                    className="customer-btn customer-btn-primary"

                    onClick={onViewAll}

                >

                    View All Notifications

                </button>

            </div>

        </div>

    );

}