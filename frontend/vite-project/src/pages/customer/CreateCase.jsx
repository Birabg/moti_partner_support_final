import {
  useEffect,
  useState
} from "react";

import {
  getCategories,
  getSubcategories,
  getServiceTypes
} from "../../api/productserviceApi";

import {
  createCase
} from "../../api/customerCaseApi";

import { useNavigate } from "react-router-dom";

import {
  useAuth
} from "../../context/useAuth";

import {
  FaArrowLeft,
  FaPaperclip,
  FaInfoCircle
} from "react-icons/fa";

import { Ticket } from "lucide-react";

import CustomerPageHero from "../../components/customer/CustomerPageHero";


export default function CreateCase() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [services, setServices] = useState([]);

  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const [form, setForm] = useState({
    branchName: "",
    subject: "",
    // priority: "MEDIUM",  // [COMMENTED OUT] customer no longer selects priority
    description: "",
    productCategoryId: "",
    productSubcategoryId: "",
    serviceTypeId: ""
  });

  const [files, setFiles] = useState([]);
  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB


  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    try {

      const [cat, sub, service] = await Promise.all([
        getCategories(),
        getSubcategories(),
        getServiceTypes(),
      ]);

      const normalizedCategories = Array.isArray(cat?.data)
        ? cat.data
        : Array.isArray(cat?.data?.data)
          ? cat.data.data
          : Array.isArray(cat?.data?.categories)
            ? cat.data.categories
            : [];

      const normalizedSubcategories = Array.isArray(sub?.data)
        ? sub.data
        : Array.isArray(sub?.data?.data)
          ? sub.data.data
          : Array.isArray(sub?.data?.subcategories)
            ? sub.data.subcategories
            : [];

      const normalizedServices = Array.isArray(service?.data)
        ? service.data
        : Array.isArray(service?.data?.data)
          ? service.data.data
          : Array.isArray(service?.data?.serviceTypes)
            ? service.data.serviceTypes
            : [];

      setCategories(normalizedCategories);
      setSubcategories(normalizedSubcategories);
      setServices(normalizedServices);

    } catch (error) {

      console.error(
        "Unable to load lookup data for case creation:",
        error
      );

    }

  };


  const handleCategoryChange = (e) => {

    const categoryId = e.target.value;

    setForm({
      ...form,
      productCategoryId: categoryId,
      productSubcategoryId: ""
    });

    const filtered = subcategories.filter((item) => {

      const itemCategoryId =
        item.productCategoryId ??
        item.categoryId ??
        item.product_category_id;

      return String(itemCategoryId) === String(categoryId);

    });

    setFilteredSubcategories(filtered);

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !form.branchName ||
      !form.subject ||
      !form.description ||
      !form.productCategoryId ||
      !form.productSubcategoryId ||
      !form.serviceTypeId
    ) {

      alert(
        "Please complete all required case fields before submitting."
      );

      return;
    }

    try {

      const data = new FormData();

      data.append("branchName", form.branchName);
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
      data.append(
        "serviceTypeId",
        form.serviceTypeId
      );
      // data.append(           // [COMMENTED OUT] priority is assigned by the system/manager
      //   "priority",
      //   form.priority || "MEDIUM"
      // );

      if (files.length > 0) {
        files.forEach((f) => data.append("attachments", f));
      }

      const response = await createCase(data);

      console.log("CASE CREATED", response.data);

      alert("Case created successfully");

      navigate("/customer/my-cases");

    } catch (error) {

      console.error(
        "CASE CREATE FAILED",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
        "Failed creating case"
      );

    }

  };


  return (

    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <div className="max-w-6xl mx-auto px-6 py-6">

        <button
          type="button"
          onClick={() => navigate("/customer/my-cases")}
          className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-500
            hover:text-slate-900
            transition
            mb-5
          "
        >

          <FaArrowLeft size={13} />

          Back to My Cases

        </button>

        <CustomerPageHero
          eyebrow="Customer Portal"
          title="Create Support Case"
          description="Tell us what you need help with and our support team will assist you."
          icon={Ticket}
        />

      </div>


      {/* Main Content */}

      <main className="max-w-6xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* Form */}

          <div className="lg:col-span-2">

            <form
              onSubmit={handleSubmit}
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200
                shadow-sm
                overflow-hidden
              "
            >


              {/* Form Header */}

              <div className="
                px-7
                py-5
                border-b
                border-slate-100
              ">

                <h2 className="
                  text-base
                  font-bold
                  text-slate-900
                ">

                  Case Information

                </h2>

                <p className="
                  text-sm
                  text-slate-500
                  mt-1
                ">

                  Provide the details below so we can understand your issue.

                </p>

              </div>


              <div className="p-7 space-y-7">


                {/* Branch + Subject */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-2
                    ">

                      Branch Name
                      <span className="text-red-500 ml-1">*</span>

                    </label>

                    <input
                      type="text"
                      value={form.branchName}
                      placeholder="Enter branch name"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          branchName: e.target.value
                        })
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        focus:bg-white
                        focus:border-slate-400
                        focus:ring-4
                        focus:ring-slate-400/10
                      "
                    />

                  </div>


                  <div>

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-2
                    ">

                      Case Subject
                      <span className="text-red-500 ml-1">*</span>

                    </label>

                    <input
                      type="text"
                      value={form.subject}
                      placeholder="Briefly describe the issue"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subject: e.target.value
                        })
                      }
                      className="
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        focus:bg-white
                        focus:border-slate-400
                        focus:ring-4
                        focus:ring-slate-400/10
                      "
                    />

                  </div>

                </div>


                {/* Product Section */}

                <div>

                  <div className="mb-4">

                    <h3 className="
                      text-sm
                      font-bold
                      text-slate-900
                    ">

                      Product & Service

                    </h3>

                    <p className="
                      text-xs
                      text-slate-500
                      mt-1
                    ">

                      Select the product and service related to your issue.

                    </p>

                  </div>


                  <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-5
                  ">


                    {/* Category */}

                    <div>

                      <label className="
                        block
                        text-sm
                        font-semibold
                        text-slate-700
                        mb-2
                      ">

                        Category
                        <span className="text-red-500 ml-1">*</span>

                      </label>

                      <select
                        value={form.productCategoryId}
                        onChange={handleCategoryChange}
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-sm
                          text-slate-700
                          outline-none
                          focus:bg-white
                          focus:border-slate-400
                          focus:ring-4
                          focus:ring-slate-400/10
                        "
                      >

                        <option value="">
                          Select category
                        </option>

                        {categories.map((cat) => (

                          <option
                            key={cat.id}
                            value={cat.id}
                          >

                            {cat.name}

                          </option>

                        ))}

                      </select>

                    </div>


                    {/* Subcategory */}

                    <div>

                      <label className="
                        block
                        text-sm
                        font-semibold
                        text-slate-700
                        mb-2
                      ">

                        Subcategory
                        <span className="text-red-500 ml-1">*</span>

                      </label>

                      <select
                        value={form.productSubcategoryId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            productSubcategoryId:
                              e.target.value
                          })
                        }
                        disabled={!form.productCategoryId}
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-sm
                          text-slate-700
                          outline-none
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          focus:bg-white
                          focus:border-slate-400
                          focus:ring-4
                          focus:ring-slate-400/10
                        "
                      >

                        <option value="">
                          Select subcategory
                        </option>

                        {filteredSubcategories.map((sub) => (

                          <option
                            key={sub.id}
                            value={sub.id}
                          >

                            {sub.name}

                          </option>

                        ))}

                      </select>

                    </div>


                    {/* Service */}

                    <div>

                      <label className="
                        block
                        text-sm
                        font-semibold
                        text-slate-700
                        mb-2
                      ">

                        Service
                        <span className="text-red-500 ml-1">*</span>

                      </label>

                      <select
                        value={form.serviceTypeId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            serviceTypeId:
                              e.target.value
                          })
                        }
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-sm
                          text-slate-700
                          outline-none
                          focus:bg-white
                          focus:border-slate-400
                          focus:ring-4
                          focus:ring-slate-400/10
                        "
                      >

                        <option value="">
                          Select service
                        </option>

                        {services.map((service) => (

                          <option
                            key={service.id}
                            value={service.id}
                          >

                            {
                              service.name ||
                              service.serviceName
                            }

                          </option>

                        ))}

                      </select>

                    </div>

                  </div>

                </div>


                {/* =============================================
                    PRIORITY SECTION — COMMENTED OUT
                    (customer no longer picks priority; the
                     system/manager assigns it instead)
                =============================================== */}
                {/*
                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-3
                  ">

                    Priority

                  </label>


                  <div className="
                    grid
                    grid-cols-3
                    gap-3
                  ">

                    {[
                      {
                        value: "LOW",
                        label: "Low",
                        description: "General issue"
                      },
                      {
                        value: "MEDIUM",
                        label: "Medium",
                        description: "Needs attention"
                      },
                      {
                        value: "HIGH",
                        label: "High",
                        description: "Urgent issue"
                      }
                    ].map((item) => (

                      <button
                        type="button"
                        key={item.value}
                        onClick={() =>
                          setForm({
                            ...form,
                            priority: item.value
                          })
                        }
                        className={`
                          text-left
                          rounded-xl
                          border
                          p-3
                          transition
                          ${
                            form.priority === item.value
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }
                        `}
                      >

                        <div className="
                          text-sm
                          font-bold
                          text-slate-800
                        ">

                          {item.label}

                        </div>

                        <div className="
                          text-xs
                          text-slate-500
                          mt-1
                        ">

                          {item.description}

                        </div>

                      </button>

                    ))}

                  </div>

                </div>
                */}


                {/* Description */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-2
                  ">

                    Explain Your Problem
                    <span className="text-red-500 ml-1">*</span>

                  </label>

                  <textarea
                    rows="6"
                    value={form.description}
                    placeholder="Please describe your issue in as much detail as possible..."
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value
                      })
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      text-sm
                      text-slate-900
                      resize-none
                      outline-none
                      transition
                      focus:bg-white
                      focus:border-slate-400
                      focus:ring-4
                      focus:ring-slate-400/10
                    "
                  />

                  <p className="
                    text-xs
                    text-slate-400
                    mt-2
                  ">

                    Include any error messages, steps you've already tried, or other useful details.

                  </p>

                </div>


                {/* Attachments */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-2
                  ">

                    Attachments (max 5 files, 100MB each)

                  </label>

                  <div className="space-y-3">

                    <label className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      w-full
                      min-h-[130px]
                      rounded-xl
                      border-2
                      border-dashed
                      border-slate-200
                      bg-slate-50
                      hover:bg-slate-100
                      hover:border-blue-300
                      transition
                      cursor-pointer
                    ">

                      <FaPaperclip
                        className="text-slate-400 mb-3"
                        size={20}
                      />

                      <span className="
                        text-sm
                        font-medium
                        text-slate-600
                      ">

                        {files.length > 0
                          ? `${files.length} file${files.length !== 1 ? 's' : ''} attached`
                          : 'Click to attach files'}

                      </span>

                      <span className="
                        text-xs
                        text-slate-400
                        mt-1
                      ">

                        {files.length > 0
                          ? `${files.length}/${MAX_FILES} files • Screenshots or documents can help us resolve your case faster.`
                          : 'Screenshots or documents can help us resolve your case faster.'}

                      </span>

                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files);
                          const validFiles = [];
                          const errors = [];

                          newFiles.forEach((f) => {
                            if (files.length + validFiles.length >= MAX_FILES) {
                              errors.push(`Maximum ${MAX_FILES} files allowed.`);
                              return;
                            }
                            if (f.size > MAX_FILE_SIZE) {
                              errors.push(`${f.name} exceeds 100MB limit.`);
                              return;
                            }
                            validFiles.push(f);
                          });

                          if (errors.length > 0) {
                            alert(errors.join('\n'));
                          }

                          if (validFiles.length > 0) {
                            setFiles((prev) => [...prev, ...validFiles]);
                          }
                        }}
                        disabled={files.length >= MAX_FILES}
                      />

                    </label>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        {files.map((f, index) => (
                          <div
                            key={`${f.name}-${index}`}
                            className="
                              flex
                              items-center
                              gap-3
                              p-3
                              bg-slate-50
                              rounded-xl
                              border
                              border-slate-200
                            "
                          >
                            <FaPaperclip className="text-slate-400" size={18} />
                            <span className="text-sm text-slate-700 flex-1 truncate">{f.name}</span>
                            <span className="text-xs text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                              type="button"
                              onClick={() =>
                                setFiles((prev) => prev.filter((_, i) => i !== index))
                              }
                              className="
                                p-1.5
                                text-slate-400
                                hover:text-red-500
                                hover:bg-red-50
                                rounded-lg
                                transition
                              "
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>


              </div>


              {/* Footer */}

              <div className="
                px-7
                py-5
                bg-slate-50
                border-t
                border-slate-100
                flex
                items-center
                justify-between
                gap-4
              ">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/customer/my-cases")
                  }
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    text-sm
                    font-semibold
                    text-slate-600
                    hover:bg-white
                    transition
                  "
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="
                    px-7
                    py-2.5
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    text-sm
                    font-bold
                    shadow-sm
                    hover:shadow
                    transition
                  "
                >

                  Submit Case

                </button>

              </div>


            </form>

          </div>


          {/* Right Information Panel */}

          <div className="space-y-5">


            <div className="
              bg-white
              rounded-2xl
              border
              border-slate-200
              shadow-sm
              p-6
            ">

              <div className="
                w-10
                h-10
                rounded-xl
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
                mb-4
              ">

                <FaInfoCircle size={18} />

              </div>


              <h3 className="
                text-base
                font-bold
                text-slate-900
              ">

                Before you submit

              </h3>


              <div className="
                mt-4
                space-y-4
              ">

                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-700
                  ">

                    Be specific

                  </p>

                  <p className="
                    text-xs
                    text-slate-500
                    mt-1
                    leading-5
                  ">

                    Give us enough information to understand exactly what is happening.

                  </p>

                </div>


                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-700
                  ">

                    Add screenshots

                  </p>

                  <p className="
                    text-xs
                    text-slate-500
                    mt-1
                    leading-5
                  ">

                    If you're seeing an error, attaching a screenshot can make troubleshooting much faster.

                  </p>

                </div>


                {/* [COMMENTED OUT] priority tip removed
                <div>

                  <p className="
                    text-sm
                    font-semibold
                    text-slate-700
                  ">

                    Choose the right priority

                  </p>

                  <p className="
                    text-xs
                    text-slate-500
                    mt-1
                    leading-5
                  ">

                    Use High only when the issue is seriously affecting your work.

                  </p>

                </div>
                */}

              </div>

            </div>


            {/* Required Fields */}

            <div className="
              rounded-2xl
              bg-[#0b1b33]
              p-6
              text-white
            ">

              <h3 className="
                text-sm
                font-bold
              ">

                Required information

              </h3>


              <ul className="
                mt-4
                space-y-3
                text-sm
                text-white/70
              ">

                <li className="flex gap-2">

                  <span className="text-[#91b3df]">•</span>

                  Branch name

                </li>

                <li className="flex gap-2">

                  <span className="text-[#91b3df]">•</span>

                  Case subject

                </li>

                <li className="flex gap-2">

                  <span className="text-[#91b3df]">•</span>

                  Product category

                </li>

                <li className="flex gap-2">

                  <span className="text-[#91b3df]">•</span>

                  Subcategory and service

                </li>

                <li className="flex gap-2">

                  <span className="text-[#91b3df]">•</span>

                  Problem description

                </li>

              </ul>

            </div>


          </div>


        </div>

      </main>

    </div>

  );

}
