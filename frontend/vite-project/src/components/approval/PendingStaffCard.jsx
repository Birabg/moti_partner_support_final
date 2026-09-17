import { useEffect, useState } from "react";

import { DepartmentApi } from "../../api/departmentApi";
import { DivisionApi } from "../../api/divisionApi";
import { SectionApi } from "../../api/sectionApi";

export default function PendingStaffCard({
    staff,
    approveUser,
    rejectUser,
}) {
    const [selectedRole, setSelectedRole] = useState("");

    const [departmentId, setDepartmentId] = useState("");
    const [divisionId, setDivisionId] = useState("");
    const [sectionId, setSectionId] = useState("");

    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const deptRes = await DepartmentApi.getAll();
            const divRes = await DivisionApi.getAll();
            const secRes = await SectionApi.getAll();

            setDepartments(deptRes.data.data || []);
            setDivisions(divRes.data.data || []);
            setSections(secRes.data.data || []);
        } catch (error) {
            console.error(error);
        }
    }

    async function approve() {
        if (!selectedRole) {
            alert("Please select a role.");
            return;
        }

        const payload = {
            userId: staff.id,
            userType: "STAFF",
        };

        switch (selectedRole) {
            case "SYSTEM_ADMIN":
                payload.role = "SYSTEM_ADMIN";
                break;

            case "DIRECTOR":
                payload.role = "DIRECTOR";
                break;

            case "DEPARTMENT_MANAGER":
                if (!departmentId) {
                    alert("Please select a department.");
                    return;
                }

                payload.role = "MANAGER";
                payload.managerType = "DEPARTMENT";
                payload.departmentId = departmentId;
                break;

            case "DIVISION_MANAGER":
                if (!divisionId) {
                    alert("Please select a division.");
                    return;
                }

                payload.role = "MANAGER";
                payload.managerType = "DIVISION";
                payload.divisionId = divisionId;
                break;

            case "SECTION_MANAGER":
                if (!sectionId) {
                    alert("Please select a section.");
                    return;
                }

                payload.role = "MANAGER";
                payload.managerType = "SECTION";
                payload.sectionId = sectionId;
                break;

            case "PS_SUPPORT":
                if (!sectionId) {
                    alert(
                        "Please select a section for PS Support."
                    );
                    return;
                }

                payload.role = "PS_SUPPORT";
                payload.sectionId = sectionId;
                break;

            default:
                alert("Invalid role.");
                return;
        }

        approveUser(payload);
    }

    return (
        <div
            className="
                bg-white
                rounded-lg
                shadow-sm
                p-8
                space-y-5
            "
        >
            <h1 className="text-2xl font-medium">
                {staff.firstName}
            </h1>

            <p>{staff.email}</p>

            <p>Gender : {staff.gender}</p>

            {/* ROLE */}
            <select
                value={selectedRole}
                onChange={(e) => {
                    setSelectedRole(e.target.value);

                    setDepartmentId("");
                    setDivisionId("");
                    setSectionId("");
                }}
                className="
                    w-full
                    p-4
                    rounded-xl
                    border
                "
            >
                <option value="">
                    Select Staff Role
                </option>

                <option value="SYSTEM_ADMIN">
                    System Admin
                </option>

                <option value="DIRECTOR">
                    Director
                </option>

                <option value="DEPARTMENT_MANAGER">
                    Department Manager
                </option>

                <option value="DIVISION_MANAGER">
                    Division Manager
                </option>

                <option value="SECTION_MANAGER">
                    Section Manager
                </option>

                <option value="PS_SUPPORT">
                    PS Support
                </option>
            </select>

            {/* Department */}
            {selectedRole ===
                "DEPARTMENT_MANAGER" && (
                <select
                    value={departmentId}
                    onChange={(e) =>
                        setDepartmentId(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        p-4
                        border
                        rounded-xl
                    "
                >
                    <option value="">
                        Select Department
                    </option>

                    {departments.map((dept) => (
                        <option
                            key={dept.id}
                            value={dept.id}
                        >
                            {dept.name}
                        </option>
                    ))}
                </select>
            )}

            {/* Division */}
            {selectedRole ===
                "DIVISION_MANAGER" && (
                <select
                    value={divisionId}
                    onChange={(e) =>
                        setDivisionId(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        p-4
                        border
                        rounded-xl
                    "
                >
                    <option value="">
                        Select Division
                    </option>

                    {divisions.map((div) => (
                        <option
                            key={div.id}
                            value={div.id}
                        >
                            {div.name}
                        </option>
                    ))}
                </select>
            )}

            {/* Section */}
            {(selectedRole ===
                "SECTION_MANAGER" ||
                selectedRole ===
                    "PS_SUPPORT") && (
                <select
                    value={sectionId}
                    onChange={(e) =>
                        setSectionId(
                            e.target.value
                        )
                    }
                    className="
                        w-full
                        p-4
                        border
                        rounded-xl
                    "
                >
                    <option value="">
                        Select Section
                    </option>

                    {sections.map((section) => (
                        <option
                            key={section.id}
                            value={section.id}
                        >
                            {section.name}
                        </option>
                    ))}
                </select>
            )}

            <div className="flex gap-4">
                <button
                    onClick={approve}
                    className="
                        flex-1
                        rounded-lg
                        py-3
                        bg-green-600
                        text-white
                        font-bold
                    "
                >
                    Approve
                </button>

                <button
                    onClick={() =>
                        rejectUser(
                            staff.id,
                            "STAFF"
                        )
                    }
                    className="
                        flex-1
                        rounded-lg
                        py-3
                        bg-red-600
                        text-white
                        font-bold
                    "
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
