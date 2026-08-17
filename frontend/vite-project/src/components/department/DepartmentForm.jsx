import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Button from "../ui/button";

export default function DepartmentForm({
    onSubmit,
}) {
    const [name, setName] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (!name.trim()) return;

        await onSubmit({
            name,
        });

        setName("");
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Create Department</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div>
                        <label className="block mb-2 font-medium">Department Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-navy-500"
                            placeholder="Department Name"
                        />
                    </div>

                    <div>
                        <Button type="submit" variant="accent">
                            Create Department
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
}