import { useState } from "react";
import {
    Building2,
    Globe2,
    Plus,
    Loader2,
} from "lucide-react";

export default function OrganizationForm({ onSubmit }) {
    const [name, setName] = useState("");
    const [emailDomain, setEmailDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!name.trim()) {
            setError("Organization name is required.");
            return;
        }

        if (!emailDomain.trim()) {
            setError("Official email domain is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onSubmit({
                name: name.trim(),
                emailDomain: emailDomain.trim(),
            });

            setName("");
            setEmailDomain("");
        } catch (err) {
            console.log(
                "Create organization error",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to create the organization. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">
            <form onSubmit={handleSubmit}>
                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <Plus className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Create New Organization
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Add a new customer organization to the system.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    FORM FIELDS
                ================================================== */}
                <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                    {/* Organization name */}
                    <div>
                        <label
                            htmlFor="organization-name"
                            className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Organization Name
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        </label>

                        <div className="relative">
                            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                id="organization-name"
                                type="text"
                                required
                                value={name}
                                placeholder="Enter organization name"
                                disabled={loading}
                                onChange={(e) => {
                                    setName(e.target.value);

                                    if (error) {
                                        setError("");
                                    }
                                }}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        <p className="mt-1.5 text-[11px] text-slate-400">
                            Enter the official name of the customer organization.
                        </p>
                    </div>

                    {/* Email domain */}
                    <div>
                        <label
                            htmlFor="organization-domain"
                            className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Official Email Domain
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        </label>

                        <div className="relative">
                            <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                id="organization-domain"
                                type="text"
                                required
                                value={emailDomain}
                                placeholder="example.com"
                                disabled={loading}
                                onChange={(e) => {
                                    setEmailDomain(e.target.value);

                                    if (error) {
                                        setError("");
                                    }
                                }}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        <p className="mt-1.5 text-[11px] text-slate-400">
                            Used to associate customer accounts with this organization.
                        </p>
                    </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================== */}
                {error && (
                    <div className="mx-6 mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-xs font-medium text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* =================================================
                    FOOTER
                ================================================== */}
                <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !name.trim() ||
                            !emailDomain.trim()
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Organization
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}