import {
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaBuilding,
    FaUserEdit
} from "react-icons/fa";

import { Link } from "react-router-dom";

import "../../styles/customerDashboard.css";

export default function ProfileCard({

    customer

}) {

    return (

        <div className="profile-card">

            <div className="profile-header">

                <FaUserCircle
                    className="profile-avatar"
                />

                <div>

                    <h2>

                        {customer?.firstName}{" "}

                        {customer?.middleName}{" "}

                        {customer?.lastName}

                    </h2>

                    <p>

                        Customer Account

                    </p>

                </div>

            </div>

            <div className="profile-body">

                <div className="profile-row">

                    <FaEnvelope
                        className="profile-icon"
                    />

                    <div>

                        <label>

                            Email

                        </label>

                        <span>

                            {customer?.email}

                        </span>

                    </div>

                </div>

                <div className="profile-row">

                    <FaPhone
                        className="profile-icon"
                    />

                    <div>

                        <label>

                            Phone Number

                        </label>

                        <span>

                            {

                                customer?.phoneNumber ||

                                "Not Provided"

                            }

                        </span>

                    </div>

                </div>

                <div className="profile-row">

                    <FaBuilding
                        className="profile-icon"
                    />

                    <div>

                        <label>

                            Organization

                        </label>

                        <span>

                            {

                                customer?.organizationName ||

                                customer?.organization?.name ||

                                "-"

                            }

                        </span>

                    </div>

                </div>

            </div>

            <div className="profile-footer">

                <Link

                    to="/customer/profile"

                    className="customer-btn customer-btn-primary"

                >

                    <FaUserEdit />

                    {" "}

                    Edit Profile

                </Link>

            </div>

        </div>

    );

}