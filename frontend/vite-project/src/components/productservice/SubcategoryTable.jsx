import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Card } from "../ui/card";
import Button from "../ui/button";
import SubcategoryModal from "./SubcategoryModal";

import { getSubcategories, toggleSubcategoryStatus } from "../../api/productServiceApi";

export default function SubcategoryTable() {
  const [subcategories, setSubcategories] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const res = await getSubcategories();
      setSubcategories(res.data?.data || []);
    } catch (err) {
      console.log("Load subcategories error", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (item) => {
    try {
      await toggleSubcategoryStatus(item.id, !item.isActive);
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h2 className="text-xl font-bold">Product Subcategories</h2>

        <Button onClick={() => setOpen(true)} variant="accent">
          Add Subcategory
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="p-3">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subcategories.map((item) => (
                <TableRow key={item.id} className="border-t">
                  <TableCell className="p-3">{item.name}</TableCell>
                  <TableCell>{item.productCategory?.name}</TableCell>
                  <TableCell>{item.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <Button onClick={() => toggleStatus(item)} variant={item.isActive ? "danger" : "primary"} size="sm">
                      Toggle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {open && <SubcategoryModal close={() => setOpen(false)} refresh={load} />}
    </div>
  );
}
