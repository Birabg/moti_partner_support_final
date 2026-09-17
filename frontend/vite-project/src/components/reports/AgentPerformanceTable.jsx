import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
export default function
AgentPerformanceTable({

    agents

}){

    return(

        <div
        className="
        bg-white
        rounded-lg
        p-8
        shadow-sm
        border
        "
        >

            <h2
            className="
            text-2xl
            font-medium
            mb-6
            "
            >
                Assigned staff Performance
            </h2>

            <Table
            className="
            w-full
            "
            >

                <TableHeader>

                    <TableRow>

                        <TableHead>
                            Customer
                        </TableHead>

                        <TableHead>
                            Assign staff
                        </TableHead>

                        <TableHead>
                            Created Date
                        </TableHead>
                        <TableHead>
                            Closing Date
                        </TableHead>
                        <TableHead>
                            Rating
                        </TableHead>

                    </TableRow>

                </TableHeader>

                <TableBody>

                    {

                        agents.map(

                            agent=>(

                                <TableRow
                                key={agent.id}
                                >

                                    <TableCell>
                                        {agent.name}
                                    </TableCell>

                                    <TableCell>
                                        {agent.open}
                                    </TableCell>

                                    <TableCell>
                                        {agent.closed}
                                    </TableCell>

                                    <TableCell>
                                        {agent.rating}
                                    </TableCell>

                                </TableRow>

                            )

                        )

                    }

                </TableBody>

            </Table>

        </div>

    );

}
