// ==========================================
// src/components/customer/CreateCaseForm.jsx
// ==========================================

import { useEffect, useState } from "react";

import {
    getCategories,
    getSubcategories,
} from "../../api/productServiceApi";

import { createCase } from "../../api/customerCaseApi";

export default function CreateCaseForm() {

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [attachments, setAttachments] = useState([]);

    const MAX_ATTACHMENTS = 5;
    const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;

    const removeAttachment = (indexToRemove) => {
        setAttachments((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
    };

    const [form, setForm] = useState({

        subject: "",

        description: "",

        productCategoryId: "",

        productSubcategoryId: "",

    });

    useEffect(() => {

        loadCategories();

        loadSubcategories();

    }, []);

    async function loadCategories() {

        try {

            const res = await getCategories();

            setCategories(res.data.data || []);

        } catch (err) {

            console.log(err);

        }

    }

    async function loadSubcategories() {

        try {

            const res = await getSubcategories();

            setSubcategories(res.data.data || []);

        } catch (err) {

            console.log(err);

        }

    }

    function change(e) {

        const { name, value } = e.target;

        setForm({

            ...form,

            [name]: value,

        });

    }

    function changeFile(e) {

        const selectedFiles = Array.from(e.target.files || []);
        const nextFiles = [...attachments, ...selectedFiles].slice(0, MAX_ATTACHMENTS);

        if (nextFiles.length > MAX_ATTACHMENTS || selectedFiles.length + attachments.length > MAX_ATTACHMENTS) {
            alert(`You can attach up to ${MAX_ATTACHMENTS} files per case.`);
            e.target.value = "";
            return;
        }

        const oversizedFile = nextFiles.find(file => file.size > MAX_ATTACHMENT_SIZE);
        if (oversizedFile) {
            alert("Each attachment must be 50 MB or smaller.");
            e.target.value = "";
            return;
        }

        setAttachments(nextFiles);
        e.target.value = "";

    }

    async function submit(e) {

        e.preventDefault();

        try {

            setLoading(true);

            const data = new FormData();

            data.append("subject", form.subject);

            data.append("description", form.description);

            data.append(
                "productCategoryId",
                form.productCategoryId
            );

            data.append(
                "productSubcategoryId",
                form.productSubcategoryId
            );

            if (attachments.length > 0) {

                attachments.forEach((file) => {
                    data.append("attachments", file);
                });

            }

            await createCase(data);

            alert("Case submitted successfully.");

            setForm({

                subject: "",

                description: "",

                productCategoryId: "",

                productSubcategoryId: "",

            });
            setAttachments([]);

        } catch (err) {

            console.log(err);

            alert(

                err?.response?.data?.message ||

                "Unable to create case."

            );

        } finally {

            setLoading(false);

        }

    }

    return (

        <form

            onSubmit={submit}

            className="bg-white rounded-xl shadow border border-slate-200 p-6 space-y-5"

        >

            <div>

                <label className="block mb-2 font-semibold">

                    Subject

                </label>

                <input

                    type="text"

                    name="subject"

                    value={form.subject}

                    onChange={change}

                    className="w-full border rounded-lg px-4 py-3"

                    required

                />

            </div>

            <div>

                <label className="block mb-2 font-semibold">

                    Category

                </label>

                <select

                    name="productCategoryId"

                    value={form.productCategoryId}

                    onChange={change}

                    className="w-full border rounded-lg px-4 py-3"

                    required

                >

                    <option value="">

                        Select Category

                    </option>

                    {

                        categories.map(category => (

                            <option

                                key={category.id}

                                value={category.id}

                            >

                                {category.name}

                            </option>

                        ))

                    }

                </select>

            </div>

            <div>

                <label className="block mb-2 font-semibold">

                    Sub Category

                </label>

                <select

                    name="productSubcategoryId"

                    value={form.productSubcategoryId}

                    onChange={change}

                    className="w-full border rounded-lg px-4 py-3"

                    required

                >

                    <option value="">

                        Select Sub Category

                    </option>

                    {

                        subcategories

                            .filter(

                                item =>

                                    item.productCategoryId ===
                                    form.productCategoryId

                            )

                            .map(sub => (

                                <option

                                    key={sub.id}

                                    value={sub.id}

                                >

                                    {sub.name}

                                </option>

                            ))

                    }

                </select>

            </div>

            <div>

                <label className="block mb-2 font-semibold">

                    Problem Description

                </label>

                <textarea

                    rows="7"

                    name="description"

                    value={form.description}

                    onChange={change}

                    className="w-full border rounded-lg px-4 py-3"

                    required

                />

            </div>

            <div>

                <label className="block mb-2 font-semibold">

                    Attachment

                </label>

                <input

                    type="file"
                    multiple

                    onChange={changeFile}

                    className="w-full"

                />

                {attachments.length > 0 && (
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div>{attachments.length} file{attachments.length > 1 ? "s" : ""} selected</div>
                        <ul className="space-y-2">
                            {attachments.map((file, index) => (
                                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                    <span className="truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-red-300 hover:text-red-600"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>

            <button

                disabled={loading}

                className="bg-navy-600 hover:bg-navy-700 transition text-white px-8 py-3 rounded-lg"

            >

                {

                    loading

                        ? "Submitting..."

                        : "Submit Case"

                }

            </button>

        </form>

    );

}
