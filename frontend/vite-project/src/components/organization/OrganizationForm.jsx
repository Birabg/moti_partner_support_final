import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Button from "../ui/button";

export default function OrganizationForm({
  onSubmit,
}) {
  const [name, setName] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await onSubmit({
      name,
      emailDomain,
    });

    setName("");
    setEmailDomain("");
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <input
            required
            value={name}
            placeholder="Organization Name"
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          />

          <input
            required
            value={emailDomain}
            placeholder="Official Email Domain (e.g. example.com)"
            onChange={(e) => setEmailDomain(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
          />

          <div>
            <Button type="submit" variant="accent">
              Create Organization
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}