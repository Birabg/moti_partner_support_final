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

    const [form, setForm] = useState({

        subject: "",

        description: "",

        productCategoryId: "",

        productSubcategoryId: "",

        attachment: null,

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

        setForm({

            ...form,

            attachment: e.target.files[0],

        });

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

            if (form.attachment) {

                data.append(
                    "attachment",
                    form.attachment
                );

            }

            await createCase(data);

            alert("Case submitted successfully.");

            setForm({

                subject: "",

                description: "",

                productCategoryId: "",

                productSubcategoryId: "",

                attachment: null,

            });

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

                    onChange={changeFile}

                    className="w-full"

                />

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