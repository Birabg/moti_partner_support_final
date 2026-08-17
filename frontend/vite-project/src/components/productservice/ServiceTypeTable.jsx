import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Card } from "../ui/card";
import Button from "../ui/button";
import ServiceTypeModal from "./ServiceTypeModal";

import { getServiceTypes, toggleServiceTypeStatus } from "../../api/productServiceApi";

export default function ServiceTypeTable() {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const res = await getServiceTypes();
      setServices(res.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (service) => {
    try {
      await toggleServiceTypeStatus(service.id, !service.isActive);
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-5">
        <h2 className="text-xl font-bold">Service Types</h2>

        <Button onClick={() => setOpen(true)} variant="accent">
          Add Service Type
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="p-3">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="border-t">
                  <TableCell className="p-3">{service.name}</TableCell>
                  <TableCell>{service.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <Button onClick={() => toggle(service)} variant={service.isActive ? "danger" : "primary"} size="sm">
                      Toggle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {open && <ServiceTypeModal close={() => setOpen(false)} refresh={load} />}
    </div>
  );
}
