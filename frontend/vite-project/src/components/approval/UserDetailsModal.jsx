import { useState } from "react";

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[600px]">
                <h2 className="text-2xl font-bold mb-4">
                    User Details
                </h2>

                <input
                    className="w-full border p-2 mb-2"
                    value={user.email}
                    disabled
                />

                <input
                    name="firstName"
                    value={form.firstName}
                    onChange={
                        handleChange
                    }
                    className="w-full border p-2 mb-2"
                />

                <input
                    name="middleName"
                    value={form.middleName}
                    onChange={
                        handleChange
                    }
                    className="w-full border p-2 mb-2"
                />

                <input
                    name="lastName"
                    value={form.lastName}
                    onChange={
                        handleChange
                    }
                    className="w-full border p-2 mb-2"
                />

               
                        <input
                            name="phoneNumber"
                            value={
                                form.phoneNumber
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full border p-2 mb-2"
                        />
                       {user.type ===
                    "CUSTOMER" && (
                    <>
                        <input
                            name="position"
                            value={
                                form.position
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full border p-2 mb-2"
                        />
                    </>
                )}

                <div className="flex gap-3 mt-4">
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={() => {
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
}}
                    >
                        Save
                    </button>

                    <button
                        onClick={
                            onClose
                        }
                        className="px-4 py-2 bg-gray-600 text-white rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
