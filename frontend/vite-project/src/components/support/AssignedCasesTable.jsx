import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Link } from "react-router-dom";

export default function AssignedCasesTable({ rows = [], loading }) {
  if (loading) return <div className="text-sm text-slate-500">Loading cases…</div>;

  return (
    <Table className="ps-cases-table">
      <TableHeader>
        <TableRow>
          <TableHead>Case #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow><TableCell colSpan={7}>No assigned cases.</TableCell></TableRow>
        ) : rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.caseNumber || r.id}</TableCell>
            <TableCell>{r.customerName || r.customer?.name || "—"}</TableCell>
            <TableCell>{r.subject}</TableCell>
            <TableCell>{r.priority}</TableCell>
            <TableCell>{r.status?.replace(/_/g, " ")}</TableCell>
            <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</TableCell>
            <TableCell><Link to={`/support/cases/${r.id}`}>Open</Link></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
