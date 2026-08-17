import { useEffect, useState } from "react";
import { FaEdit, FaSave, FaUserCircle } from "react-icons/fa";
import { ProfileApi } from "../../api/profileApi";
import { useAuth } from "../../context/useAuth";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "",
        department: "",
        createdAt: "",
    });
    const [savedForm, setSavedForm] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const response = await ProfileApi.me();
                const payload = response?.data?.data || {};
                const nextForm = {
                    firstName: payload.firstName || payload.name?.split(" ")?.[0] || user?.firstName || "",
                    middleName: payload.middleName || "",
                    lastName:
                        payload.lastName ||
                        (payload.name ? payload.name.split(" ").slice(1).join(" ") : "") ||
                        user?.lastName || "",
                    email: payload.email || user?.email || "",
                    phoneNumber: payload.phoneNumber || payload.phone || "",
                    role: payload.role || user?.role || (user?.isSAdmin ? "SYSTEM_ADMIN" : "ADMIN"),
                    department: payload.department || payload.structuralAssignment?.departmentName || "",
                    createdAt: payload.createdAt || "",
                };

                setProfile(payload);
                setForm(nextForm);
                setSavedForm(nextForm);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleEdit() {
        setIsEditing(true);
    }

    function handleCancel() {
        setForm(savedForm);
        setIsEditing(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await ProfileApi.updateProfile({
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                phoneNumber: form.phoneNumber,
                role: form.role,
                department: form.department,
            });
            setSavedForm(form);
            setIsEditing(false);
            alert("Profile updated successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to save profile.");
        }
    }

    const memberSince = form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "";

    if (!profile) {
        return (
            <div className="space-y-6">
                <PageHeader eyebrow="Admin" title="Profile" subtitle="System administrator profile" />
                <Card>
                    <CardContent>
                        <p className="text-sm text-slate-500">Loading profile…</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Admin" title="Profile" subtitle="System administrator profile" />
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader className="items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-navy-500">
                                <FaUserCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>My Profile</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">Manage your system administrator account details in the same layout as manager profile pages.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {!isEditing ? (
                                <Button variant="accent" size="sm" type="button" onClick={handleEdit}>
                                    <FaEdit /> Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm" type="button" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button variant="accent" size="sm" type="submit" loading={loading}>
                                        <FaSave /> {loading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">First Name</p>
                                {isEditing ? (
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                ) : (
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">{form.firstName || "—"}</h3>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Middle Name</p>
                                {isEditing ? (
                                    <input
                                        name="middleName"
                                        value={form.middleName}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                ) : (
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">{form.middleName || "—"}</h3>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Last Name</p>
                                {isEditing ? (
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                ) : (
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">{form.lastName || "—"}</h3>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <input
                                    value={form.email}
                                    disabled
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Phone Number</p>
                                {isEditing ? (
                                    <input
                                        name="phoneNumber"
                                        value={form.phoneNumber}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                ) : (
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">{form.phoneNumber || "—"}</h3>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Department</p>
                                {isEditing ? (
                                    <input
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                ) : (
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">{form.department || "—"}</h3>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Role</p>
                                {isEditing ? (
                                    <input
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                    />
                                ) : (
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">{form.role || "—"}</h3>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Member Since</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">{memberSince || "—"}</h3>
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
