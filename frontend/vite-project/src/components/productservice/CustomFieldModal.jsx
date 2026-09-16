import { useEffect, useState } from "react";
import {
    X,
    SlidersHorizontal,
    Loader2,
    Save,
} from "lucide-react";

import {
    getSubcategories,
    createCustomField,
} from "../../api/productServiceApi";

export default function CustomFieldModal({ close, refresh }) {
    const [subcategories, setSubcategories] = useState([]);
    const [loadingSubcategories, setLoadingSubcategories] =
        useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        fieldType: "TEXT",
        required: false,
        productSubcategoryId: "",
    });

    useEffect(() => {
        loadSubcategories();
    }, []);

    const loadSubcategories = async () => {
        try {
            setLoadingSubcategories(true);

            const res = await getSubcategories();

            setSubcategories(res.data?.data || []);
        } catch (error) {
            console.log("Load subcategories error", error);
            setError("Unable to load subcategories.");
        } finally {
            setLoadingSubcategories(false);
        }
    };

    const handleChange = (field, value) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!form.productSubcategoryId) {
            setError("Please select a subcategory.");
            return;
        }

        if (!form.name.trim()) {
            setError("Field name is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await createCustomField({
                name: form.name.trim(),
                fieldType: form.fieldType,
                required: form.required,
                productSubcategoryId:
                    form.productSubcategoryId,
            });

            await refresh();
            close();
        } catch (error) {
            console.log(
                "Create custom field error",
                error
            );

            setError(
                error?.response?.data?.message ||
                    "Unable to create the custom field. Please try again."
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
                aria-labelledby="custom-field-modal-title"
            >
                {/* =================================================
                    HEADER
                ================================================== */}
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <SlidersHorizontal className="h-5 w-5" />
                        </div>

                        <div>
                            <h2
                                id="custom-field-modal-title"
                                className="text-base font-semibold text-slate-900"
                            >
                                Create Custom Field
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Add an additional field to a product subcategory.
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
                    <div className="space-y-5 px-6 py-6">
                        {/* Subcategory */}
                        <div>
                            <label
                                htmlFor="custom-field-subcategory"
                                className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                                Subcategory
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <select
                                id="custom-field-subcategory"
                                value={
                                    form.productSubcategoryId
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "productSubcategoryId",
                                        e.target.value
                                    )
                                }
                                disabled={
                                    loading ||
                                    loadingSubcategories
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value="">
                                    {loadingSubcategories
                                        ? "Loading subcategories..."
                                        : "Select a subcategory"}
                                </option>

                                {subcategories.map((sub) => (
                                    <option
                                        key={sub.id}
                                        value={sub.id}
                                    >
                                        {sub.name}
                                    </option>
                                ))}
                            </select>

                            {!loadingSubcategories &&
                                subcategories.length === 0 && (
                                    <p className="mt-1.5 text-[11px] text-amber-600">
                                        No subcategories are available.
                                        Create a subcategory first.
                                    </p>
                                )}
                        </div>

                        {/* Field name */}
                        <div>
                            <label
                                htmlFor="custom-field-name"
                                className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                                Field Name
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                id="custom-field-name"
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    handleChange(
                                        "name",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Material Type"
                                disabled={loading}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>

                        {/* Field type */}
                        <div>
                            <label
                                htmlFor="custom-field-type"
                                className="mb-2 block text-xs font-semibold text-slate-700"
                            >
                                Field Type
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <select
                                id="custom-field-type"
                                value={form.fieldType}
                                onChange={(e) =>
                                    handleChange(
                                        "fieldType",
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value="TEXT">
                                    Text
                                </option>

                                <option value="NUMBER">
                                    Number
                                </option>

                                <option value="DATE">
                                    Date
                                </option>

                                <option value="BOOLEAN">
                                    Boolean
                                </option>
                            </select>
                        </div>

                        {/* Required */}
                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 transition hover:bg-slate-50">
                            <div>
                                <p className="text-xs font-semibold text-slate-700">
                                    Required Field
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Users must provide a value for this field.
                                </p>
                            </div>

                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.required}
                                disabled={loading}
                                onClick={() =>
                                    handleChange(
                                        "required",
                                        !form.required
                                    )
                                }
                                className={`relative h-6 w-11 rounded-full transition ${
                                    form.required
                                        ? "bg-slate-900"
                                        : "bg-slate-200"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                <span
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                        form.required
                                            ? "left-6"
                                            : "left-1"
                                    }`}
                                />
                            </button>
                        </label>

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
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
                                loading ||
                                loadingSubcategories ||
                                subcategories.length === 0
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
                                    Create Custom Field
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}