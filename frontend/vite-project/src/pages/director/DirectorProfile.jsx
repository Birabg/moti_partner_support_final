import { useEffect, useState } from "react";
import { FaUserCircle, FaSave, FaEdit } from "react-icons/fa";
import { directorApi } from "../../api/directorApi";
import DirectorHeader from "../../components/director/DirectorHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";

export default function DirectorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "" });
  const [savedForm, setSavedForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        const response = await directorApi.getProfile();
        if (!isMounted) return;
        const payload = response?.data?.data || {};
        const profileData = payload.profile || payload;
        const nextForm = {
          firstName: profileData.firstName || profileData.name?.split(" ")?.[0] || "",
          lastName: profileData.lastName || profileData.name?.split(" ").slice(1).join(" ") || "",
          email: profileData.email || "",
          phoneNumber: profileData.phoneNumber || profileData.phone || "",
        };
        setProfile(profileData);
        setForm(nextForm);
        setSavedForm(nextForm);
      } catch (caughtError) {
        console.error(caughtError);
        if (isMounted) setError("Could not load profile.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setForm(savedForm || {
      firstName: profile?.firstName || profile?.name?.split(" ")?.[0] || "",
      lastName: profile?.lastName || profile?.name?.split(" ").slice(1).join(" ") || "",
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || profile?.phone || "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await directorApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
      });
      setProfile({
        ...profile,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        phone: form.phoneNumber,
      });
      setSavedForm(form);
      setIsEditing(false);
      setError("");
      alert("Profile updated successfully.");
    } catch (caughtError) {
      console.error(caughtError);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <DirectorHeader
        eyebrow="Director"
        title="Profile"
        subtitle="View your director user profile"
        showActions={false}
      />

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-navy-500">
                <FaUserCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Your profile</CardTitle>
                <p className="text-sm text-slate-500">Director account details and contact information.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <Button variant="accent" size="sm" type="button" onClick={handleEdit}>
                  <FaEdit /> Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" type="button" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="accent" size="sm" type="submit" loading={saving}>
                    <FaSave /> {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                {isEditing ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                    />
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{`${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Email</p>
                <input
                  value={profile?.email || ""}
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <p className="text-sm text-slate-500">Phone</p>
                {isEditing ? (
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  />
                ) : (
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{profile?.phoneNumber || profile?.phone || "—"}</h3>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Role</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">Director</h3>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
