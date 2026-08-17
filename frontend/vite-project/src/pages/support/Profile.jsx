import { useEffect, useState } from "react";
import SupportHeader from "../../components/support/SupportHeader";
import SupportApi from "../../api/supportApi";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    role: "",
    email: "",
    phoneNumber: "",
    department: "",
    createdAt: "",
  });
  const [savedForm, setSavedForm] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await SupportApi.getDashboard();
        const data = res?.data?.data || {};
        const profile = data.profile || data.user || data || {};
        const nextForm = {
          firstName: profile.firstName || profile.name?.split(" ")?.[0] || "",
          middleName: profile.middleName || "",
          lastName:
            profile.lastName ||
            (profile.name ? profile.name.split(" ").slice(1).join(" ") : "") ||
            "",
          role: profile.role || "",
          email: profile.email || "",
          phoneNumber: profile.phoneNumber || profile.phone || profile.mobile || "",
          department:
            data.structuralAssignment?.departmentName || data.structuralAssignment?.divisionName || "",
          createdAt: profile.createdAt || "",
        };
        setForm(nextForm);
        setSavedForm(nextForm);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await SupportApi.updateProfile({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });
      setSavedForm(form);
      setIsEditing(false);
      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    if (savedForm) {
      setForm(savedForm);
    }
    setIsEditing(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SupportHeader compactTitle="My Profile" />
        <Card>
          <CardContent>Loading…</CardContent>
        </Card>
      </div>
    );
  }

  const memberSince = form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "";

  return (
    <div className="space-y-6">
      <SupportHeader compactTitle="My Profile" />
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader className="items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <span className="text-xl font-semibold">{(form.firstName?.[0] || "S").toUpperCase()}</span>
              </div>
              <div>
                <CardTitle>My Profile</CardTitle>
                <p className="text-sm text-slate-500">Manage your personal support details loaded from registration.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <Button variant="accent" size="sm" type="button" onClick={handleEdit}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" type="button" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="accent" size="sm" type="submit" loading={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">First Name</p>
                {isEditing ? (
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{form.firstName || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Middle Name</p>
                {isEditing ? (
                  <input
                    name="middleName"
                    value={form.middleName}
                    onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{form.middleName || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Last Name</p>
                {isEditing ? (
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{form.lastName || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Email</p>
                <input
                  value={form.email}
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">Phone Number</p>
                {isEditing ? (
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{form.phoneNumber || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Department</p>
                {isEditing ? (
                  <input
                    name="department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{form.department || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Role</p>
                {isEditing ? (
                  <input
                    name="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{form.role || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Member Since</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">{memberSince || "—"}</h3>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
