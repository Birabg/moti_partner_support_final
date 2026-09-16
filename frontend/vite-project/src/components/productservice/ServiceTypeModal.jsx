import { useState } from "react";
import {
    X,
    Wrench,
    Loader2,
    Save,
} from "lucide-react";

import { createServiceType } from "../../api/productServiceApi";

export default function ServiceTypeModal({ close, refresh }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Service type name is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await createServiceType({
                name: name.trim(),
            });

            await refresh();
            close();
        } catch (error) {
            console.log(
                "Create service type error",
                error
            );

            setError(
                error?.response?.data?.message ||
                    "Unable to create the service type. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    close();
                }
            }}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_-20px_rgba(15,23,42,0.35)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-type-modal-title"
            >
                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Wrench className="h-5 w-5" />
                        </div>

                        <div>
                            <h2
                                id="service-type-modal-title"
                                className="text-base font-semibold text-slate-900"
                            >
                                Create Service Type
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Add a new service type to the portal.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={close}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* =================================================
                    FORM
                ================================================== */}
                <form onSubmit={submit}>
                    <div className="px-6 py-6">
                        <label
                            htmlFor="service-type-name"
                            className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Service Type Name
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        </label>

                        <input
                            id="service-type-name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);

                                if (error) {
                                    setError("");
                                }
                            }}
                            placeholder="e.g. Equipment Maintenance"
                            autoFocus
                            disabled={loading}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                        />

                        <p className="mt-1.5 text-[11px] text-slate-400">
                            Use a clear name that describes the service offered.
                        </p>

                        {error && (
                            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                                <p className="text-xs font-medium leading-5 text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================== */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                        <button
                            type="button"
                            onClick={close}
                            disabled={loading}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading || !name.trim()
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Service Type
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}