import { useEffect, useState } from "react";
import { FaEdit, FaSave, FaUserCircle } from "react-icons/fa";

import { CustomerApi } from "../../api/customerApi";
import { PageHeader } from "../../components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function CustomerProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [savedForm, setSavedForm] = useState(null);
    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        position: "",
        email: "",
        phoneNumber: "",
        organizationName: "",
        gender: "",
        createdAt: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const response = await CustomerApi.profile();
            const customer = response.data.data?.customer || response.data.data || {};

            const nextForm = {
                firstName: customer.firstName || "",
                middleName: customer.middleName || "",
                lastName: customer.lastName || "",
                position: customer.position || "",
                email: customer.email || "",
                phoneNumber: customer.phoneNumber || "",
                organizationName: customer.organizationName || customer.organization?.name || "",
                gender: customer.gender || "",
                createdAt: customer.createdAt || "",
            };

            setForm(nextForm);
            setSavedForm(nextForm);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);
            await CustomerApi.updateProfile({
                firstName: form.firstName,
                middleName: form.middleName,
                lastName: form.lastName,
                position: form.position,
                phoneNumber: form.phoneNumber,
            });
            await loadProfile();
            setIsEditing(false);
            alert("Profile updated successfully.");
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit() {
        setIsEditing(true);
    }

    function handleCancel() {
        setForm(savedForm);
        setIsEditing(false);
    }

    const memberSince = form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "";

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="My Profile" subtitle="Loading profile..." />
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
            <PageHeader title="My Profile" subtitle="Manage your personal account details." />

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader className="items-start gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-navy-500">
                                <FaUserCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>Profile</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">Your customer profile information.</p>
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
                                    <Button variant="accent" size="sm" type="submit" loading={saving}>
                                        <FaSave /> {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {[
                                { label: "First Name", name: "firstName" },
                                { label: "Middle Name", name: "middleName" },
                                { label: "Last Name", name: "lastName" },
                                { label: "Position", name: "position" },
                                { label: "Phone Number", name: "phoneNumber" },
                                { label: "Organization", value: form.organizationName },
                                { label: "Gender", value: form.gender },
                                { label: "Member Since", value: memberSince },
                            ].map((field) => (
                                <div key={field.label}>
                                    <p className="text-sm text-slate-500">{field.label}</p>
                                    {field.name ? (
                                        isEditing ? (
                                            <input
                                                name={field.name}
                                                value={form[field.name]}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                            />
                                        ) : (
                                            <h3 className="mt-1 text-base font-semibold text-slate-900">
                                                {form[field.name] || "—"}
                                            </h3>
                                        )
                                    ) : (
                                        <h3 className="mt-1 text-base font-semibold text-slate-900">{field.value || "—"}</h3>
                                    )}
                                </div>
                            ))}
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <input
                                    value={form.email}
                                    disabled
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                                />
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
