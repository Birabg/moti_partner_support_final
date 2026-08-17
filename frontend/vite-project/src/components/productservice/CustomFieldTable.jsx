import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import {

    useEffect,

    useState

} from "react";

import {

    getCustomFields,

    toggleCustomFieldStatus

} from "../../api/productServiceApi";

import CustomFieldModal from "./CustomFieldModal";
import { Card } from "../ui/card";
import Button from "../ui/button";

export default function CustomFieldTable() {

    const [fields, setFields] = useState([]);

    const [open, setOpen] = useState(false);

    const load = async()=>{

    try{

        const res = await getCustomFields();

        setFields(
            res.data.data || []
        );


    }catch(error){

        console.log(
            "Load custom fields error",
            error
        );

    }

};

    useEffect(() => {

        load();

    }, []);

    const toggleStatus = async (field) => {

        try {

            await toggleCustomFieldStatus(

                field.id,

                !field.isActive

            );

            load();

        } catch (error) {

            console.log(error);

        }

    };

    return (
        <div>

            <div className="flex justify-between items-center mb-5">

                <h2 className="text-xl font-bold">Custom Fields</h2>

                <Button onClick={() => setOpen(true)} variant="accent">Add Custom Field</Button>

            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-3 text-left">Field Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Subcategory</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {
                                fields.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-6">No Custom Fields Found</TableCell>
                                    </TableRow>
                                ) : (
                                    fields.map(field => (
                                        <TableRow key={field.id} className="border-t">
                                            <TableCell className="p-3">{field.name}</TableCell>
                                            <TableCell>{field.fieldType}</TableCell>
                                            <TableCell>{field.productSubcategory?.name || "-"}</TableCell>
                                            <TableCell>{field.required ? "Yes" : "No"}</TableCell>
                                            <TableCell>{field.isActive ? "Active" : "Inactive"}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => toggleStatus(field)} variant={field.isActive ? "danger" : "primary"} size="sm">Toggle</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {open && <CustomFieldModal close={() => setOpen(false)} refresh={load} />}

        </div>
    );

}