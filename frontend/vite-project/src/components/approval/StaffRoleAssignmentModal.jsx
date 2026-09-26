import { useEffect, useState } from "react";
import {
    X,
    Building2,
    Layers,
    Users,
    HelpCircle,
    ShieldCheck,
    Crown,
} from "lucide-react";
import Button from "../ui/Button";
import { Select } from "../ui/Field";
import { directorApi } from "../../api/directorApi";

const ROLE_OPTIONS = [
    { value: "PS_SUPPORT", label: "Support Staff", description: "Handles support cases in a specific section", icon: HelpCircle },
    { value: "MANAGER", label: "Manager", description: "Manages a department, division, or section", icon: Users },
    { value: "SYSTEM_ADMIN", label: "System Administrator", description: "Full system access and user management", icon: Crown },
    { value: "DIRECTOR", label: "Director", description: "Executive oversight across the organization", icon: Building2 },
];

const MANAGER_TYPES = [
    { value: "DEPARTMENT", label: "Department Manager", description: "Manages an entire department" },
    { value: "DIVISION", label: "Division Manager", description: "Manages a division within a department" },
    { value: "SECTION", label: "Section Manager", description: "Manages a specific section" },
];

export default function StaffRoleAssignmentModal({
    staff,
    onClose,
    onConfirm,
}) {
    const [form, setForm] = useState({
        role: staff.role || "PS_SUPPORT",
        managerType: staff.managerType || "",
        departmentId: staff.departmentId || "",
        divisionId: staff.divisionId || "",
        sectionId: staff.sectionId || "",
    });

    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadOrgStructure();
    }, []);

    const loadOrgStructure = async () => {
        try {
            const [deptRes, divRes, secRes] = await directorApi.getOrganizationStructure();
            setDepartments(deptRes.data?.data?.departments || deptRes.data?.departments || []);
            setDivisions(divRes.data?.data?.divisions || divRes.data?.divisions || []);
            setSections(secRes.data?.data?.sections || secRes.data?.sections || []);
        } catch (err) {
            console.error("Failed to load org structure:", err);
            setDepartments([]);
            setDivisions([]);
            setSections([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (name === "role") {
            setForm((prev) => ({
                ...prev,
                managerType: "",
                departmentId: "",
                divisionId: "",
                sectionId: "",
            }));
        }
        if (name === "managerType") {
            setForm((prev) => ({
                ...prev,
                departmentId: "",
                divisionId: "",
                sectionId: "",
            }));
        }
        if (name === "departmentId") {
            setForm((prev) => ({ ...prev, divisionId: "", sectionId: "" }));
            loadDivisions(value);
        }
        if (name === "divisionId") {
            setForm((prev) => ({ ...prev, sectionId: "" }));
            loadSections(value);
        }
    };

    const loadDivisions = async (departmentId) => {
        if (!departmentId) return;
        try {
            const res = await directorApi.getOrganizationStructure().then(r => r[1]).catch(() => ({ data: { data: {} } }));
            const allDivisions = res.data?.data?.divisions || res.data?.divisions || [];
            setDivisions(allDivisions.filter(d => d.departmentId === departmentId));
        } catch (err) {
            console.error("Failed to load divisions:", err);
            setDivisions([]);
        }
    };

    const loadSections = async (divisionId) => {
        if (!divisionId) return;
        try {
            const res = await directorApi.getOrganizationStructure().then(r => r[2]).catch(() => ({ data: { data: {} } }));
            const allSections = res.data?.data?.sections || res.data?.sections || [];
            setSections(allSections.filter(s => s.divisionId === divisionId));
        } catch (err) {
            console.error("Failed to load sections:", err);
            setSections([]);
        }
    };

    const handleConfirm = () => {
        const { role, managerType, departmentId, divisionId, sectionId } = form;

        if (role === "MANAGER" && !managerType) {
            setError("Please select a manager type");
            return;
        }

        if (role === "MANAGER" && managerType === "DEPARTMENT" && !departmentId) {
            setError("Please select a department");
            return;
        }

        if (role === "MANAGER" && managerType === "DIVISION" && !divisionId) {
            setError("Please select a division");
            return;
        }

        if ((role === "MANAGER" && managerType === "SECTION") || role === "PS_SUPPORT") {
            if (!sectionId) {
                setError("Please select a section");
                return;
            }
        }

        setError("");
        onConfirm(form);
    };

    const getRoleConfig = (role) => {
        const configs = {
            PS_SUPPORT: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", icon: HelpCircle, label: "Support Staff" },
            MANAGER: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", icon: Users, label: "Manager" },
            SYSTEM_ADMIN: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: Crown, label: "System Admin" },
            DIRECTOR: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", icon: Building2, label: "Director" },
        };
        return configs[role] || configs.PS_SUPPORT;
    };

    const RoleIcon = getRoleConfig(form.role).icon;
    const roleConfig = getRoleConfig(form.role);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${roleConfig.bg} ${roleConfig.text}`}>
                            <RoleIcon className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-ink-900">Assign Role & Access</h2>
                            <p className="text-xs text-ink-500">{staff.fullName} · {staff.email}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4 space-y-4">
                        <Select
                            label="Role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                        >
                            {ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Select>

                        {form.role === "MANAGER" && (
                            <Select
                                label="Manager Type"
                                name="managerType"
                                value={form.managerType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select manager type</option>
                                {MANAGER_TYPES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>
                        )}

                        {(form.role === "MANAGER" && form.managerType === "DEPARTMENT") && (
                            <Select
                                label="Department"
                                name="departmentId"
                                value={form.departmentId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select department</option>
                                {(departments || []).map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </Select>
                        )}

                        {(form.role === "MANAGER" && form.managerType === "DIVISION") && (
                            <Select
                                label="Division"
                                name="divisionId"
                                value={form.divisionId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select division</option>
                                {(divisions || []).map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </Select>
                        )}

                        {((form.role === "MANAGER" && form.managerType === "SECTION") || form.role === "PS_SUPPORT") && (
                            <Select
                                label="Section"
                                name="sectionId"
                                value={form.sectionId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select section</option>
                                {(sections || []).map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Select>
                        )}

                        {form.role === "SYSTEM_ADMIN" && (
                            <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-700">
                                <p className="font-semibold">System Administrator</p>
                                <p className="mt-1">Grants full system access including user management and role assignment.</p>
                            </div>
                        )}

                        {form.role === "DIRECTOR" && (
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                                <p className="font-semibold">Director</p>
                                <p className="mt-1">Grants executive oversight across the organization.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-ink-100 bg-white px-5 py-4 rounded-b-2xl">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleConfirm} loading={loading}>
                        Approve & Assign
                    </Button>
                </div>
            </div>
        </div>
    );
}