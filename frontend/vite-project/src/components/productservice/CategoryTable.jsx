import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { useEffect, useState } from "react";

import { getCategories, toggleCategoryStatus } from "../../api/productServiceApi";

import CategoryModal from "./CategoryModal";
import { Card } from "../ui/card";
import Button from "../ui/button";

export default function CategoryTable() {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);

    const load = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data?.data || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const toggle = async (item) => {
        try {
            await toggleCategoryStatus(item.id, !item.isActive);
            await load();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <div className="flex justify-between mb-5">
                <h2 className="text-xl font-bold">Product Categories</h2>

                <Button
                    onClick={() => {
                        setOpen(true);
                    }}
                    variant="accent"
                >
                    Add Category
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-3">Name</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {categories.map((c) => (
                                <TableRow key={c.id} className="border-t">
                                    <TableCell className="p-3">{c.name}</TableCell>
                                    <TableCell>{c.brandName || "-"}</TableCell>
                                    <TableCell>{c.isActive ? "Active" : "Inactive"}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => toggle(c)} variant={c.isActive ? "danger" : "primary"} size="sm">
                                            Toggle
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {open && <CategoryModal close={() => setOpen(false)} refresh={load} />}
        </div>
    );
}