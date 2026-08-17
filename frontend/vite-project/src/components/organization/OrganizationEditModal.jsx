import { useState } from "react";
import Button from "../ui/button";

export default function OrganizationEditModal({
  organization,
  onUpdate,
}) {
  const [name, setName] = useState(organization.name);
  const [emailDomain, setEmailDomain] = useState(
    organization.emailDomains?.[0]?.domain || ""
  );

  async function submit(e) {
    e.preventDefault();

    await onUpdate(organization.id, {
      name,
      emailDomain,
    });
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow-xl p-8 space-y-5">
      <h1 className="text-2xl font-medium">Update Organization</h1>

      <div className="space-y-4">
        <input
          required
          value={name}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization Name"
        />

        <input
          required
          value={emailDomain}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          onChange={(e) => setEmailDomain(e.target.value)}
          placeholder="Official Email Domain (e.g. example.com)"
        />
      </div>

      <Button type="submit" variant="accent">
        Update
      </Button>
    </form>
  );
}