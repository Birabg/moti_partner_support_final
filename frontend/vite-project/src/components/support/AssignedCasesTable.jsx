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
  Clock3,
} from "lucide-react";


// ============================================================
// STATUS CONFIG
// ============================================================

const statusConfig = {
  OPEN: {
    label: "Open",
    className: "border-warning-200 bg-warning-50 text-warning-700",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },

  ESCALATED: {
    label: "Escalated",
    className: "border-red-200 bg-red-50 text-red-700",
  },

  PENDING: {
    label: "Pending",
    className: "border-warning-200 bg-warning-50 text-warning-700",
  },

  AWAITING_CUSTOMER_RESPONSE: {
    label: "Awaiting Customer",
    className: "border-ink-300 bg-ink-50 text-ink-600",
  },

  WAITING_CUSTOMER_FEEDBACK: {
    label: "Awaiting Customer",
    className: "border-ink-300 bg-ink-50 text-ink-600",
  },

  CLOSED: {
    label: "Closed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  RESOLVED: {
    label: "Resolved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};


// ============================================================
// PRIORITY CONFIG
// ============================================================

const priorityConfig = {
  LOW: {
    label: "Low",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  MEDIUM: {
    label: "Medium",
    className: "border-warning-200 bg-warning-50 text-warning-700",
  },

  HIGH: {
    label: "High",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },

  URGENT: {
    label: "Urgent",
    className: "border-red-200 bg-red-50 text-red-700",
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
      (word) =>
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
        "border-ink-300 bg-ink-50 text-ink-600",
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
          shrink-0
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
      label: formatText(priority || "NORMAL"),
      className:
        "border-ink-300 bg-ink-50 text-ink-600",
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
// CUSTOMER CELL
// ============================================================

function CustomerCell({ row }) {
  const customerName =
    row.customerName ||
    row.customer?.name ||
    (
      row.customer
        ? `${row.customer.firstName || ""} ${
            row.customer.lastName || ""
          }`.trim()
        : ""
    ) ||
    "Unknown Customer";

  const initials =
    customerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      {/* Avatar */}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#eef4fb]
          text-xs
          font-bold
          text-[#17345c]
          ring-1
          ring-[#dce7f4]
        "
      >
        {initials || "?"}
      </div>

      {/* Customer information */}

      <div className="min-w-0">
        <p
          className="
            truncate
            text-sm
            font-semibold
            text-ink-900
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
            text-ink-400
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
// CASE NUMBER CELL
// ============================================================

function CaseNumberCell({ row }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-ink-100
          text-ink-500
        "
      >
        <FileText
          size={16}
          strokeWidth={1.8}
        />
      </div>

      <div>
        <span
          className="
            whitespace-nowrap
            font-mono
            text-sm
            font-semibold
            text-ink-700
          "
        >
          {row.caseNumber || row.id || "—"}
        </span>

        <p
          className="
            mt-0.5
            text-[11px]
            text-ink-400
          "
        >
          Support case
        </p>
      </div>
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
        gap-2
        rounded-lg
        border
        border-[#17345c]
        bg-[#17345c]
        px-4
        py-2.5
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
        focus:ring-[#17345c]/20
        focus:ring-offset-2
      "
    >
      Open case

      <ArrowUpRight
        size={14}
        strokeWidth={2}
      />
    </Link>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
  return (
    <TableRow>
      <TableCell
        colSpan={7}
        className="px-6 py-24"
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
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-ink-300
              bg-ink-50
              text-ink-300
            "
          >
            <Inbox
              size={27}
              strokeWidth={1.5}
            />
          </div>

          <h3
            className="
              mt-5
              text-sm
              font-semibold
              text-ink-800
            "
          >
            No assigned cases
          </h3>

          <p
            className="
              mt-1.5
              max-w-sm
              text-xs
              leading-5
              text-ink-400
            "
          >
            Cases assigned to you will appear here
            when they become available.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}


// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-ink-300
        bg-white
      "
    >
      <div
        className="
          flex
          min-h-[360px]
          items-center
          justify-center
        "
      >
        <div className="flex flex-col items-center">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-ink-50
            "
          >
            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-ink-300
                border-t-[#17345c]
              "
            />
          </div>

          <p
            className="
              mt-4
              text-sm
              font-semibold
              text-ink-700
            "
          >
            Loading assigned cases
          </p>

          <p
            className="
              mt-1
              text-xs
              text-ink-400
            "
          >
            Please wait while we retrieve your cases.
          </p>
        </div>
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
        rounded-2xl
        border
        border-ink-300
        bg-white
      "
    >
      {/* ====================================================
          TABLE SCROLL AREA
      ==================================================== */}

      <div
        className="
          max-h-[580px]
          overflow-auto
          overscroll-contain
        "
      >
        <Table
          className="
            min-w-[1180px]
            border-collapse
          "
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <TableHeader
            className="
              sticky
              top-0
              z-30
            "
          >
            <TableRow
              className="
                border-b
                border-ink-300
                bg-ink-100
                hover:bg-ink-100
              "
            >

              {/* CASE */}

              <TableHead
                className="
                  sticky
                  left-0
                  z-40
                  min-w-[190px]
                  bg-ink-100
                  px-6
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Case
              </TableHead>


              {/* CUSTOMER */}

              <TableHead
                className="
                  min-w-[240px]
                  bg-ink-100
                  px-5
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Customer
              </TableHead>


              {/* SUBJECT */}

              <TableHead
                className="
                  min-w-[280px]
                  bg-ink-100
                  px-5
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Subject
              </TableHead>


              {/* PRIORITY */}

              <TableHead
                className="
                  min-w-[130px]
                  bg-ink-100
                  px-5
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Priority
              </TableHead>


              {/* STATUS */}

              <TableHead
                className="
                  min-w-[160px]
                  bg-ink-100
                  px-5
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Status
              </TableHead>


              {/* CREATED */}

              <TableHead
                className="
                  min-w-[170px]
                  bg-ink-100
                  px-5
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Created
              </TableHead>


              {/* ACTION */}

              <TableHead
                className="
                  min-w-[150px]
                  bg-ink-100
                  px-5
                  py-4
                  text-left
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-ink-600
                "
              >
                Action
              </TableHead>

            </TableRow>
          </TableHeader>


          {/* ==================================================
              BODY
          ================================================== */}

          <TableBody>
            {rows.length === 0 ? (
              <EmptyState />
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="
                    group
                    border-b
                    border-ink-100
                    bg-white
                    transition-colors
                    duration-150
                    hover:bg-ink-50
                  "
                >

                  {/* CASE */}

                  <TableCell
                    className="
                      sticky
                      left-0
                      z-10
                      bg-white
                      px-6
                      py-5
                      group-hover:bg-ink-50
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
                    <div className="max-w-[280px]">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-ink-800
                        "
                        title={row.subject || ""}
                      >
                        {row.subject || "No subject"}
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-ink-400
                        "
                      >
                        Customer support request
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
                    <div
                      className="
                        flex
                        items-start
                        gap-2
                        whitespace-nowrap
                      "
                    >
                      <Clock3
                        size={14}
                        strokeWidth={1.7}
                        className="
                          mt-0.5
                          shrink-0
                          text-ink-400
                        "
                      />

                      <div>
                        <p
                          className="
                            text-sm
                            font-medium
                            text-ink-700
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

                        {row.createdAt && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-ink-400
                            "
                          >
                            {new Date(
                              row.createdAt
                            ).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        )}
                      </div>
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


      {/* ====================================================
          TABLE FOOTER
      ==================================================== */}

      <div
        className="
          flex
          min-h-[52px]
          items-center
          justify-between
          border-t
          border-ink-300
          bg-ink-50/70
          px-5
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            font-medium
            text-ink-500
          "
        >
          <span
            className="
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-md
              bg-white
              px-1.5
              text-[11px]
              font-bold
              text-ink-600
              ring-1
              ring-ink-300
            "
          >
            {rows.length}
          </span>

          <span>
            {rows.length === 1
              ? "assigned case"
              : "assigned cases"}
          </span>
        </div>


        <div
          className="
            hidden
            items-center
            gap-2
            text-xs
            text-ink-400
            sm:flex
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

          Live case data
        </div>
      </div>

    </div>
  );
}






