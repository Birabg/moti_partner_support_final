import { useEffect, useMemo, useState } from "react";

import {
  Loader2,
  ClipboardList,
  Star,
  ArrowUpRight,
  Activity,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import SupportApi from "../../api/supportApi";

import AssignedCasesTable from "../../components/support/AssignedCasesTable";
import RecentFeedback from "../../components/support/RecentFeedback";


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-[0_2px_10px_rgba(15,23,42,0.03)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_8px_25px_rgba(15,23,42,0.07)]
      "
    >

      {/* subtle background decoration */}

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-32
          w-32
          rounded-full
          bg-slate-50
          opacity-60
          blur-3xl
        "
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div
            className={`
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              ${iconClass}
            `}
          >
            <Icon
              size={19}
              strokeWidth={1.8}
            />
          </div>

          <ArrowUpRight
            size={17}
            className="
              text-slate-300
              transition-transform
              duration-200
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />

        </div>


        <div className="mt-6">

          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-slate-400
            "
          >
            {label}
          </p>


          <div className="mt-2 flex items-end gap-2">

            <span
              className="
                text-3xl
                font-bold
                tracking-tight
                text-slate-950
              "
            >
              {value}
            </span>

          </div>


          <p
            className="
              mt-2
              text-xs
              text-slate-400
            "
          >
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// SECTION LABEL
// ============================================================

function SectionLabel({
  eyebrow,
  title,
  description,
  right,
}) {
  return (
    <div
      className="
        mb-5
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >

      <div>

        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-blue-600
          "
        >
          {eyebrow}
        </p>

        <h2
          className="
            mt-1
            text-xl
            font-semibold
            tracking-tight
            text-slate-950
          "
        >
          {title}
        </h2>

        {description && (
          <p
            className="
              mt-1
              text-sm
              text-slate-400
            "
          >
            {description}
          </p>
        )}

      </div>

      {right}

    </div>
  );
}


// ============================================================
// MAIN PAGE
// ============================================================

export default function PSSupportDashboard() {

  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState(null);


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  useEffect(() => {

    let cancelled = false;


    async function load() {

      try {

        setLoading(true);

        const res =
          await SupportApi.getDashboard();


        if (!cancelled) {

          setOverview(
            res?.data?.data || {}
          );

        }

      } catch (err) {

        console.error(
          "Failed to load support dashboard:",
          err
        );

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }


    load();


    const handleCaseUpdated = () => {
      load();
    };


    window.addEventListener(
      "cases:updated",
      handleCaseUpdated
    );


    window.addEventListener(
      "focus",
      handleCaseUpdated
    );


    const refreshTimer =
      window.setInterval(
        load,
        15000
      );


    return () => {

      cancelled = true;

      window.removeEventListener(
        "cases:updated",
        handleCaseUpdated
      );

      window.removeEventListener(
        "focus",
        handleCaseUpdated
      );

      window.clearInterval(
        refreshTimer
      );

    };

  }, []);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => {

    const m =
      overview?.workloadMetrics || {};


    return [

      {
        label: "Assigned Cases",
        value:
          m.totalAssignedHistorically ?? 0,
        description:
          "Cases assigned to you",
        icon: ClipboardList,
        iconClass:
          "bg-blue-50 text-blue-600",
      },

      {
        label: "Open",
        value:
          m.activeOpenCount ?? 0,
        description:
          "Waiting for action",
        icon: AlertCircle,
        iconClass:
          "bg-amber-50 text-amber-600",
      },

      {
        label: "In Progress",
        value:
          m.activeInProgressCount ?? 0,
        description:
          "Currently being handled",
        icon: Activity,
        iconClass:
          "bg-violet-50 text-violet-600",
      },

      {
        label: "Resolved",
        value:
          m.historicalClosedCount ?? 0,
        description:
          "Successfully completed",
        icon: CheckCircle2,
        iconClass:
          "bg-emerald-50 text-emerald-600",
      },

      {
        label: "Average Rating",
        value:
          m.averageFeedbackRatingReceived ?? "-",
        description:
          "Customer feedback received",
        icon: Star,
        iconClass:
          "bg-orange-50 text-orange-500",
      },

    ];

  }, [overview]);


  const assignedCases =
    overview?.activeWorkloadList || [];


  const feedback =
    (
      overview?.historicalClosedList || []
    ).slice(0, 3);


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      className="
        min-h-full
        space-y-8
        pb-10
      "
    >


      {/* ====================================================
          HERO
      ==================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          bg-[#0b1f3a]
          px-7
          py-9
          shadow-[0_10px_35px_rgba(15,23,42,0.12)]
          sm:px-10
          sm:py-11
        "
      >

        {/* Grid background */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.08]
          "
          style={{
            backgroundImage:
              `
                linear-gradient(
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                )
              `,
            backgroundSize:
              "32px 32px",
          }}
        />


        {/* Decorative circle */}

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-32
            h-80
            w-80
            rounded-full
            border
            border-white/10
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-12
            -top-20
            h-64
            w-64
            rounded-full
            border
            border-white/5
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                "
              />

              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                "
              >
                Support Operations
              </span>

            </div>


            <h1
              className="
                mt-4
                text-3xl
                font-bold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              My Assigned Work
            </h1>


            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-slate-300
                sm:text-base
              "
            >
              Monitor your assigned support cases,
              track progress, and stay on top of
              customer requests from one workspace.
            </p>

          </div>


          {/* Operational status */}

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2.5
              rounded-full
              border
              border-white/10
              bg-white/[0.06]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-200
              backdrop-blur-sm
            "
          >

            <span
              className="
                h-2
                w-2
                rounded-full
                bg-emerald-400
                shadow-[0_0_10px_rgba(52,211,153,0.8)]
              "
            />

            Support platform operational

          </div>

        </div>

      </section>


      {/* ====================================================
          OVERVIEW
      ==================================================== */}

      <section>

        <SectionLabel
          eyebrow="Overview"
          title="Support activity"
          description="A quick view of your current workload and performance."
          right={
            <div
              className="
                hidden
                items-center
                gap-2
                text-xs
                text-slate-400
                sm:flex
              "
            >
              <Clock3
                size={14}
                strokeWidth={1.7}
              />

              Live dashboard data
            </div>
          }
        />


        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-5
          "
        >

          {stats.map(
            ({
              label,
              value,
              description,
              icon,
              iconClass,
            }) => (

              <StatCard
                key={label}
                label={label}
                value={
                  loading ? (
                    <Loader2
                      className="
                        h-7
                        w-7
                        animate-spin
                        text-slate-300
                      "
                    />
                  ) : (
                    value
                  )
                }
                description={description}
                icon={icon}
                iconClass={iconClass}
              />

            )
          )}

        </div>

      </section>


      {/* ====================================================
          WORKSPACE
      ==================================================== */}

      <section>

        <SectionLabel
          eyebrow="Case Management"
          title="Your assigned cases"
          description="Review and manage the support cases currently assigned to you."
          right={
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-slate-600
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-blue-500
                "
              />

              {assignedCases.length}{" "}
              {assignedCases.length === 1
                ? "case"
                : "cases"}

            </div>
          }
        />


        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_2px_10px_rgba(15,23,42,0.03)]
          "
        >

          {/* Table top bar */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-slate-100
              px-6
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
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
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <ClipboardList
                  size={18}
                  strokeWidth={1.8}
                />
              </div>


              <div>

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  Assigned Cases
                </h3>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-400
                  "
                >
                  Cases requiring your attention
                </p>

              </div>

            </div>


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-slate-50
                  px-3
                  py-2
                  text-xs
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

                Auto-updating

              </div>

            </div>

          </div>


          <div className="p-5">

            <AssignedCasesTable
              rows={assignedCases}
              loading={loading}
            />

          </div>

        </div>

      </section>


      {/* ====================================================
          FEEDBACK
      ==================================================== */}

      <section>

        <SectionLabel
          eyebrow="Customer Feedback"
          title="Recent feedback"
          description="Feedback from your recently handled cases."
        />


        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_2px_10px_rgba(15,23,42,0.03)]
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              border-b
              border-slate-100
              px-6
              py-5
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-amber-50
                text-amber-500
              "
            >

              <Star
                size={18}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <h3
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                Customer feedback
              </h3>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-400
                "
              >
                Latest feedback received
              </p>

            </div>

          </div>


          <div className="p-6">

            <div
              className="
                rounded-xl
                bg-slate-50
                p-5
              "
            >

              <RecentFeedback
                items={feedback}
              />

            </div>

          </div>

        </div>

      </section>


      {/* ====================================================
          BOTTOM STATUS
      ==================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-slate-200
          pt-5
          text-xs
          text-slate-400
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
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

          Dashboard connected to live case data

        </div>


        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <RefreshCw
            size={12}
            strokeWidth={1.8}
          />

          Updates automatically

        </div>

      </div>

    </div>
  );
}