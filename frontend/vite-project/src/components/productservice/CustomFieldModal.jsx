import { useEffect, useState } from "react";

import {
    getSubcategories,
    createCustomField
} from "../../api/productServiceApi";

export default function CustomFieldModal({

    close,

    refresh

}) {

    const [subcategories, setSubcategories] = useState([]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({

        name: "",

        fieldType: "TEXT",

        required: false,

        productSubcategoryId: ""

    });

    useEffect(() => {

        loadSubcategories();

    }, []);

    const loadSubcategories = async () => {

        try {

            const res = await getSubcategories();

            setSubcategories(res.data.data);

        } catch (error) {

            console.log(error);

        }

    };

   const submit = async()=>{


try{


await createCustomField(form);


refresh();

close();


}catch(error){


console.log(
    "Create custom field error",
    error
);


}


};

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-96">

                <h2 className="text-xl font-bold mb-5">

                    Create Custom Field

                </h2>

                <select

                    className="border p-3 w-full mb-3 rounded"

                    value={form.productSubcategoryId}

                    onChange={(e) =>

                        setForm({

                            ...form,

                            productSubcategoryId: e.target.value

                        })

                    }

                >

                    <option value="">

                        Select Subcategory

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

                <input

                    className="border p-3 w-full mb-3 rounded"

                    placeholder="Field Name"

                    value={form.name}

                    onChange={(e) =>

                        setForm({

                            ...form,

                            name: e.target.value

                        })

                    }

                />

                <select

                    className="border p-3 w-full mb-3 rounded"

                    value={form.fieldType}

                    onChange={(e) =>

                        setForm({

                            ...form,

                            fieldType: e.target.value

                        })

                    }

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

                <label className="flex items-center gap-2 mb-5">

                    <input

                        type="checkbox"

                        checked={form.required}

                        onChange={(e) =>

                            setForm({

                                ...form,

                                required: e.target.checked

                            })

                        }

                    />

                    Required

                </label>

                <div className="flex justify-end gap-3">

                    <button

                        onClick={close}

                        className="px-4 py-2 rounded bg-gray-200"

                    >

                        Cancel

                    </button>

                    <button

                        disabled={

                            loading ||

                            !form.name ||

                            !form.productSubcategoryId

                        }

                        onClick={submit}

                        className="bg-navy-900 text-white px-5 py-2 rounded disabled:opacity-50"

                    >

                        {

                            loading

                                ? "Saving..."

                                : "Save"

                        }

                    </button>

                </div>

            </div>

        </div>

    );

}