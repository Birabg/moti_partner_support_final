import { useEffect, useState } from "react";
import { PermissionApi } from "../../api/permissionApi";

export default function PermissionModal({
    user,
    onClose,
    onSave,
}) {
    const [permissions, setPermissions] =
        useState([]);

    const [selected, setSelected] =
        useState([]);

    useEffect(() => {
        PermissionApi.getAll().then(
            (res) => {
                setPermissions(
                    res.data.data
                );
            }
        );
    }, []);

    const toggle = (code) => {
        if (selected.includes(code)) {
            setSelected(
                selected.filter(
                    (x) => x !== code
                )
            );
        } else {
            setSelected([
                ...selected,
                code,
            ]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-5 rounded-xl w-[700px]">
                <h1 className="font-bold text-2xl mb-4">
                    Add Permissions
                </h1>

                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {permissions.map(
                        (permission) => (
                            <label
                                key={
                                    permission.id
                                }
                            >
                                <input
                                    type="checkbox"
                                    onChange={() =>
                                        toggle(
                                            permission.code
                                        )
                                    }
                                />

                                {" "}
                                {
                                    permission.name
                                }
                            </label>
                        )
                    )}
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={() =>
                            onSave(
                                user.id,
                                selected
                            )
                        }
                    >
                        Save
                    </button>

                    <button
                        onClick={
                            onClose
                        }
                        className="px-4 py-2 bg-gray-600 text-white rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}