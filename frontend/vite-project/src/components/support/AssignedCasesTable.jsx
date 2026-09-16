import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

import { Link } from "react-router-dom";

import {
  FileText,
  User,
  ArrowUpRight,
  Inbox,
} from "lucide-react";


// ============================================================
// STATUS
// ============================================================

const statusConfig = {
  OPEN: {
    label: "Open",
    className:
      "border-amber-100 bg-amber-50 text-amber-700",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className:
      "border-blue-100 bg-blue-50 text-blue-700",
  },

  ESCALATED: {
    label: "Escalated",
    className:
      "border-red-100 bg-red-50 text-red-700",
  },

  PENDING: {
    label: "Pending",
    className:
      "border-amber-100 bg-amber-50 text-amber-700",
  },

  AWAITING_CUSTOMER_RESPONSE: {
    label: "Awaiting Customer",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },

  WAITING_CUSTOMER_FEEDBACK: {
    label: "Awaiting Customer",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },

  CLOSED: {
    label: "Closed",
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
  },

  RESOLVED: {
    label: "Resolved",
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
};


// ============================================================
// PRIORITY
// ============================================================

const priorityConfig = {
  LOW: {
    label: "Low",
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
  },

  MEDIUM: {
    label: "Medium",
    className:
      "border-amber-100 bg-amber-50 text-amber-700",
  },

  HIGH: {
    label: "High",
    className:
      "border-orange-100 bg-orange-50 text-orange-700",
  },

  URGENT: {
    label: "Urgent",
    className:
      "border-red-100 bg-red-50 text-red-700",
  },
};


// ============================================================
// FORMAT TEXT
// ============================================================

function formatText(value) {

  if (!value) {
    return "—";
  }

  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {

  const config =
    statusConfig[status] || {
      label: formatText(status),
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };


  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        whitespace-nowrap
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-semibold
        ${config.className}
      `}
    >

      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-current
        "
      />

      {config.label}

    </span>
  );
}


// ============================================================
// PRIORITY BADGE
// ============================================================

function PriorityBadge({ priority }) {

  const config =
    priorityConfig[priority] || {
      label:
        formatText(priority || "NORMAL"),
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };


  return (
    <span
      className={`
        inline-flex
        whitespace-nowrap
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-semibold
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}


// ============================================================
// CUSTOMER
// ============================================================

function CustomerCell({ row }) {

  const customerName =
    row.customerName ||
    row.customer?.name ||
    (
      row.customer
        ? `${row.customer.firstName || ""} ${row.customer.lastName || ""}`.trim()
        : ""
    ) ||
    "Unknown Customer";


  const initials =
    customerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase();


  return (
    <div className="flex min-w-[210px] items-center gap-3">

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-blue-100
          bg-blue-50
          text-xs
          font-bold
          text-blue-700
        "
      >
        {initials || "?"}
      </div>


      <div className="min-w-0">

        <p
          className="
            truncate
            text-sm
            font-semibold
            text-slate-900
          "
        >
          {customerName}
        </p>


        <div
          className="
            mt-1
            flex
            items-center
            gap-1.5
            text-xs
            text-slate-400
          "
        >

          <User
            size={12}
            strokeWidth={1.8}
          />

          Customer

        </div>

      </div>

    </div>
  );
}


// ============================================================
// CASE NUMBER
// ============================================================

function CaseNumberCell({ row }) {

  return (
    <div className="flex items-center gap-2.5">

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-slate-50
          text-slate-400
        "
      >
        <FileText
          size={15}
          strokeWidth={1.8}
        />
      </div>


      <span
        className="
          whitespace-nowrap
          font-mono
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {row.caseNumber || row.id || "—"}
      </span>

    </div>
  );
}


// ============================================================
// OPEN BUTTON
// ============================================================

function OpenButton({ id }) {

  return (
    <Link
      to={`/support/cases/${id}`}
      className="
        inline-flex
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        border-[#17345c]
        bg-[#17345c]
        px-3.5
        py-2
        text-xs
        font-semibold
        text-white
        shadow-sm
        transition-all
        duration-200
        hover:bg-[#102949]
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-blue-100
        focus:ring-offset-1
      "
    >

      Open

      <ArrowUpRight
        size={14}
        strokeWidth={2}
      />

    </Link>
  );
}


// ============================================================
// EMPTY
// ============================================================

function EmptyState() {

  return (
    <TableRow>

      <TableCell
        colSpan={7}
        className="px-6 py-20"
      >

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-slate-50
              text-slate-300
            "
          >
            <Inbox
              size={25}
              strokeWidth={1.5}
            />
          </div>


          <p
            className="
              mt-4
              text-sm
              font-semibold
              text-slate-700
            "
          >
            No assigned cases
          </p>


          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            Cases assigned to you will appear here.
          </p>

        </div>

      </TableCell>

    </TableRow>
  );
}


// ============================================================
// LOADING
// ============================================================

function LoadingState() {

  return (
    <div
      className="
        flex
        min-h-[300px]
        items-center
        justify-center
        rounded-xl
        border
        border-slate-100
        bg-slate-50/40
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            h-5
            w-5
            animate-spin
            rounded-full
            border-2
            border-slate-200
            border-t-[#17345c]
          "
        />

        <span
          className="
            text-sm
            font-medium
            text-slate-500
          "
        >
          Loading cases...
        </span>

      </div>

    </div>
  );
}


// ============================================================
// TABLE
// ============================================================

export default function AssignedCasesTable({
  rows = [],
  loading,
}) {

  if (loading) {
    return <LoadingState />;
  }


  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >

      {/* =====================================================
          SCROLL AREA
      ===================================================== */}

      <div
        className="
          max-h-[560px]
          overflow-auto
        "
      >

        <Table
          className="
            min-w-[1120px]
            border-collapse
          "
        >

          {/* =================================================
              STICKY HEADER
          ================================================= */}

          <TableHeader
            className="
              sticky
              top-0
              z-20
            "
          >

            <TableRow
              className="
                border-b
                border-slate-200
                bg-slate-50
                hover:bg-slate-50
              "
            >

              <TableHead
                className="
                  bg-slate-50
                  px-6
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Case #
              </TableHead>


              <TableHead
                className="
                  bg-slate-50
                  px-5
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Customer
              </TableHead>


              <TableHead
                className="
                  bg-slate-50
                  px-5
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Subject
              </TableHead>


              <TableHead
                className="
                  bg-slate-50
                  px-5
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Priority
              </TableHead>


              <TableHead
                className="
                  bg-slate-50
                  px-5
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Status
              </TableHead>


              <TableHead
                className="
                  bg-slate-50
                  px-5
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Created
              </TableHead>


              <TableHead
                className="
                  bg-slate-50
                  px-5
                  py-4
                  text-left
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                  text-slate-500
                "
              >
                Action
              </TableHead>

            </TableRow>

          </TableHeader>


          {/* =================================================
              BODY
          ================================================= */}

          <TableBody>

            {rows.length === 0 ? (

              <EmptyState />

            ) : (

              rows.map((row) => (

                <TableRow
                  key={row.id}
                  className="
                    border-b
                    border-slate-100
                    bg-white
                    transition-colors
                    duration-150
                    hover:bg-slate-50/70
                  "
                >

                  {/* CASE */}

                  <TableCell
                    className="
                      px-6
                      py-5
                    "
                  >
                    <CaseNumberCell row={row} />
                  </TableCell>


                  {/* CUSTOMER */}

                  <TableCell
                    className="
                      px-5
                      py-5
                    "
                  >
                    <CustomerCell row={row} />
                  </TableCell>


                  {/* SUBJECT */}

                  <TableCell
                    className="
                      px-5
                      py-5
                    "
                  >

                    <div className="max-w-[260px]">

                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                        title={row.subject || ""}
                      >
                        {row.subject || "No subject"}
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-400
                        "
                      >
                        Support case
                      </p>

                    </div>

                  </TableCell>


                  {/* PRIORITY */}

                  <TableCell
                    className="
                      px-5
                      py-5
                    "
                  >
                    <PriorityBadge
                      priority={row.priority}
                    />
                  </TableCell>


                  {/* STATUS */}

                  <TableCell
                    className="
                      px-5
                      py-5
                    "
                  >
                    <StatusBadge
                      status={row.status}
                    />
                  </TableCell>


                  {/* CREATED */}

                  <TableCell
                    className="
                      px-5
                      py-5
                    "
                  >

                    <div className="whitespace-nowrap">

                      <p
                        className="
                          text-sm
                          font-medium
                          text-slate-700
                        "
                      >
                        {row.createdAt
                          ? new Date(
                              row.createdAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-400
                        "
                      >
                        {row.createdAt
                          ? new Date(
                              row.createdAt
                            ).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </p>

                    </div>

                  </TableCell>


                  {/* ACTION */}

                  <TableCell
                    className="
                      px-5
                      py-5
                    "
                  >
                    <OpenButton
                      id={row.id}
                    />
                  </TableCell>

                </TableRow>

              ))

            )}

          </TableBody>

        </Table>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-slate-100
          bg-slate-50/50
          px-5
          py-3.5
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            font-medium
            text-slate-500
          "
        >

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-500
            "
          />

          {rows.length}{" "}
          {rows.length === 1
            ? "case"
            : "cases"}

        </div>


        <span
          className="
            text-xs
            text-slate-400
          "
        >
          Scroll to view more
        </span>

      </div>

    </div>
  );
}