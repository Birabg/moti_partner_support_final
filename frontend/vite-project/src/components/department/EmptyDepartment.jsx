import { FaBuilding } from "react-icons/fa";

export default function EmptyDepartment() {

    return (

        <div className="bg-white rounded-xl border shadow-sm p-14">

            <div className="flex flex-col items-center">

                <FaBuilding
                    className="text-6xl text-navy-500"
                />

                <h2 className="text-2xl font-semibold mt-5">

                    No Records Found

                </h2>

                <p className="text-gray-500 mt-2">

                    No department, division or section is available.

                </p>

            </div>

        </div>

    );

}
