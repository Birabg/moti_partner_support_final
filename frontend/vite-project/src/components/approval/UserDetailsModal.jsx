import { useState } from "react";
import { Eye, X } from "lucide-react";
import Button from "../ui/Button";
import { Input } from "../ui/Field";

const getUserName = (user) =>
    user.fullName ||
    `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "User";

export default function UserDetailsModal({
    user,
    onClose,
    onSave,
}) {
    const [form, setForm] = useState({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        position: user.position || "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.value,
        });
    };

    const handleSave = () => {
        const payload = {
            firstName: form.firstName,
            middleName: form.middleName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
        };

        if (user.type === "CUSTOMER") {
            payload.position = form.position;
        }

        onSave(user.id, payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1b33]/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg transform rounded-2xl bg-white shadow-[0_20px_60px_rgba(11,27,51,0.2)]">
                <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-navy-100 bg-navy-50">
                            <Eye className="h-5 w-5 text-navy-600" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold tracking-tight text-ink-900">
                                User Details
                            </h2>
                            <p className="mt-0.5 truncate text-sm text-ink-500">
                                {getUserName(user)}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <Input
                        label="Email"
                        value={user.email || ""}
                        disabled
                        placeholder="Email address"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            name="firstName"
                            label="First name"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                        />

                        <Input
                            name="middleName"
                            label="Middle name"
                            value={form.middleName}
                            onChange={handleChange}
                            placeholder="Middle name"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            name="lastName"
                            label="Last name"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                        />

                        <Input
                            name="phoneNumber"
                            label="Phone number"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="Phone number"
                        />
                    </div>

                    {user.type === "CUSTOMER" && (
                        <Input
                            name="position"
                            label="Position"
                            value={form.position}
                            onChange={handleChange}
                            placeholder="Position / job title"
                        />
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}