import { FaBuilding, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Card, CardContent } from "../ui/card";

export default function DepartmentStatistics({
    departments = [],
    divisions = [],
    sections = [],
    type = "department",
}) {
    let data = departments;

    if (type === "division") data = divisions;
    if (type === "section") data = sections;

    const total = data.length;
    const active = data.filter((item) => item.isActive).length;
    const inactive = total - active;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Total {type}s</p>
                        <h2 className="text-3xl font-bold mt-2">{total}</h2>
                    </div>
                    <FaBuilding className="text-4xl text-navy-600" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Active</p>
                        <h2 className="text-3xl font-bold mt-2 text-green-600">{active}</h2>
                    </div>
                    <FaCheckCircle className="text-4xl text-green-600" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Inactive</p>
                        <h2 className="text-3xl font-bold mt-2 text-red-600">{inactive}</h2>
                    </div>
                    <FaTimesCircle className="text-4xl text-red-600" />
                </CardContent>
            </Card>
        </div>
    );
}