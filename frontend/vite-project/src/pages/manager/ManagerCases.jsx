import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { managerApi } from "../../api/managerApi";
import { getCategories, getSubcategories, getServiceTypes } from "../../api/productServiceApi";
import { useAuth } from "../../context/useAuth";
import DashboardCard from "../../components/manager/DashboardCard";
import ManagerHeader from "../../components/manager/ManagerHeader";
import CaseTable from "../../components/cases/CaseTable";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";
import AssignStaffModal from "../../components/cases/AssignStaffModal";
import ReassignStaffModal from "../../components/cases/ReassignStaffModal";
import ChangePriorityModal from "../../components/cases/ChangePriorityModal";
import ResolveCaseModal from "../../components/cases/ResolveCaseModal";
import { Card, CardContent } from "../../components/ui/card";
import { createCase } from "../../api/customerCaseApi";

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;

function validateSelectedFiles(selectedFiles, currentFiles = []) {
  const normalizedFiles = Array.from(selectedFiles || []);
  const mergedFiles = [...currentFiles, ...normalizedFiles].slice(0, MAX_ATTACHMENTS);

  if (mergedFiles.length > MAX_ATTACHMENTS) {
    alert(`You can attach up to ${MAX_ATTACHMENTS} files per case.`);
    return null;
  }

  const oversizedFiles = mergedFiles.filter((file) => file.size > MAX_ATTACHMENT_SIZE);
  if (oversizedFiles.length > 0) {
    alert("Each attachment must be 50 MB or smaller. Please reduce the file size and try again.");
    return null;
  }

  return mergedFiles;
}

function ManagerOpenCaseModal({ open, onClose, onSubmitted }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerEmail: "",
    reason: "",
    branchName: "",
    subject: "",
    description: "",
    productCategoryId: "",
    productSubcategoryId: "",
    serviceTypeId: "",
  });

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const [catResponse, subResponse, serviceResponse] = await Promise.all([
          getCategories(),
          getSubcategories(),
          getServiceTypes(),
        ]);

        const normalizedCategories = Array.isArray(catResponse?.data)
          ? catResponse.data
          : Array.isArray(catResponse?.data?.data)
            ? catResponse.data.data
            : Array.isArray(catResponse?.data?.categories)
              ? catResponse.data.categories
              : [];

        const normalizedSubcategories = Array.isArray(subResponse?.data)
          ? subResponse.data
          : Array.isArray(subResponse?.data?.data)
            ? subResponse.data.data
            : Array.isArray(subResponse?.data?.subcategories)
              ? subResponse.data.subcategories
              : [];

        const normalizedServices = Array.isArray(serviceResponse?.data)
          ? serviceResponse.data
          : Array.isArray(serviceResponse?.data?.data)
            ? serviceResponse.data.data
            : Array.isArray(serviceResponse?.data?.serviceTypes)
              ? serviceResponse.data.serviceTypes
              : [];

        setCategories(normalizedCategories);
        setSubcategories(normalizedSubcategories);
        setServices(normalizedServices);
      } catch (error) {
        console.error("Unable to load case lookup data for manager case creation:", error);
      }
    };

    loadData();
  }, [open]);

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    const nextForm = { ...form, productCategoryId: categoryId, productSubcategoryId: "" };
    setForm(nextForm);
    setFilteredSubcategories(
      subcategories.filter((item) => {
        const itemCategoryId = item.productCategoryId ?? item.categoryId ?? item.product_category_id;
        return String(itemCategoryId) === String(categoryId);
      })
    );
  };

  const removeSelectedFile = (index) => {
    setFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.customerEmail ||
      !form.reason ||
      !form.branchName ||
      !form.subject ||
      !form.description ||
      !form.productCategoryId ||
      !form.productSubcategoryId ||
      !form.serviceTypeId
    ) {
      alert("Please complete all required case fields before submitting.");
      return;
    }

    const selectedFiles = validateSelectedFiles(files, []);
    if (!selectedFiles) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append("customerEmail", form.customerEmail.trim());
      data.append("reason", form.reason.trim());
      data.append("branchName", form.branchName);
      data.append("subject", form.subject);
      data.append("description", form.description);
      data.append("productCategoryId", form.productCategoryId);
      data.append("productSubcategoryId", form.productSubcategoryId);
      data.append("serviceTypeId", form.serviceTypeId);
      selectedFiles.forEach((fileItem) => data.append("attachments", fileItem));

      await createCase(data, true);

      alert("Case logged successfully for the customer.");
      setForm({
        customerEmail: "",
        reason: "",
        branchName: "",
        subject: "",
        description: "",
        productCategoryId: "",
        productSubcategoryId: "",
        serviceTypeId: "",
      });
      setFiles([]);
      setFilteredSubcategories([]);
      onSubmitted?.();
      onClose?.();
    } catch (error) {
      console.error("Manager case creation failed:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Failed to create case for customer.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-navy-600">Manager Action</p>
            <h2 className="text-2xl font-bold text-slate-900">Open Case for Customer</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Customer Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.customerEmail}
                onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                placeholder="customer@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Reason for Case</label>
              <textarea
                rows="3"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.reason}
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Explain why this case is being opened on behalf of the customer"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Branch Name</label>
              <input
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.branchName}
                onChange={(event) => setForm((current) => ({ ...current, branchName: event.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Case Subject</label>
              <input
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.subject}
                onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Select Category</label>
              <select
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.productCategoryId}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Select Subcategory</label>
              <select
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.productSubcategoryId}
                onChange={(event) => setForm((current) => ({ ...current, productSubcategoryId: event.target.value }))}
                disabled={!filteredSubcategories.length}
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Select Service</label>
              <select
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.serviceTypeId}
                onChange={(event) => setForm((current) => ({ ...current, serviceTypeId: event.target.value }))}
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name || service.serviceName}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Explain the Problem</label>
              <textarea
                rows="5"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-navy-500"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Attachment</label>
              <input
                type="file"
                multiple
                className="w-full rounded-xl border border-slate-200 p-3"
                onChange={(event) => {
                  const selectedFiles = validateSelectedFiles(event.target.files, files);
                  if (selectedFiles) {
                    setFiles(selectedFiles);
                  } else {
                    event.target.value = "";
                  }
                }}
              />
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-500">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
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
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-navy-600 px-5 py-2.5 font-semibold text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ManagerCases() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [openCaseModal, setOpenCaseModal] = useState(false);

  async function load() {
    try {
      const response = await managerApi.getScopeOverview();
      setSnapshot(response?.data?.data || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const safeLoad = async () => {
      try {
        const response = await managerApi.getScopeOverview();
        if (!cancelled) {
          setSnapshot(response?.data?.data || null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    safeLoad();

    const handleCaseUpdated = () => safeLoad();
    const handleFocus = () => safeLoad();

    window.addEventListener("cases:updated", handleCaseUpdated);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("cases:updated", handleCaseUpdated);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const cases = snapshot?.caseMetrics?.cases || [];
  const scopeName = snapshot?.department?.name || snapshot?.division?.name || snapshot?.section?.name || "Case Oversight";

  return (
    <div className="space-y-6">
      <ManagerHeader user={user} orgPath={scopeName} managerRole={user?.managerType || "Manager"} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <DashboardCard title="Cases" value={snapshot?.caseMetrics?.totalAssignedCases || cases.length || 0} caption="Cases in current scope" icon={ClipboardList} accent="amber" loading={loading} />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-md font-semibold text-slate-900">Managed Cases</h2>
            <button
              type="button"
              onClick={() => setOpenCaseModal(true)}
              className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              Open Case
            </button>
          </div>
          <CaseTable
            cases={cases}
            permissions={user?.permissions || []}
            onView={(item) => {
              setSelectedCase(item);
              setDetailsOpen(true);
            }}
            onAssign={(item) => {
              setSelectedCase(item);
              setAssignOpen(true);
            }}
            onPriority={(item) => {
              setSelectedCase(item);
              setPriorityOpen(true);
            }}
            onResolve={(item) => {
              setSelectedCase(item);
              setResolveOpen(true);
            }}
            onReassign={(item) => {
              setSelectedCase(item);
              setReassignOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <ManagerOpenCaseModal
        open={openCaseModal}
        onClose={() => setOpenCaseModal(false)}
        onSubmitted={() => {
          setOpenCaseModal(false);
          load();
        }}
      />

      {detailsOpen && selectedCase && (
        <CaseDetailsDrawer caseData={selectedCase} close={() => setDetailsOpen(false)} />
      )}

      {assignOpen && selectedCase && (
        <AssignStaffModal
          caseData={selectedCase}
          close={() => setAssignOpen(false)}
          refresh={load}
        />
      )}

      {reassignOpen && selectedCase && (
        <ReassignStaffModal
          caseData={selectedCase}
          close={() => setReassignOpen(false)}
          refresh={load}
        />
      )}

      {priorityOpen && selectedCase && (
        <ChangePriorityModal
          caseData={selectedCase}
          close={() => setPriorityOpen(false)}
          refresh={load}
        />
      )}

      {resolveOpen && selectedCase && (
        <ResolveCaseModal
          caseData={selectedCase}
          close={() => setResolveOpen(false)}
          refresh={load}
        />
      )}
    </div>
  );
}
