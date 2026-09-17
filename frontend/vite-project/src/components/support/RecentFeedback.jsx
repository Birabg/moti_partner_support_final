import {
  Star,
  MessageSquare,
  CalendarDays,
  UserRound,
} from "lucide-react";


// ============================================================
// RATING
// ============================================================

function Rating({ value }) {
  if (!value) {
    return (
      <span
        className="
          inline-flex
          items-center
          rounded-full
          border
          border-ink-300
          bg-ink-50
          px-3
          py-1.5
          text-xs
          font-semibold
          text-ink-500
        "
      >
        No rating
      </span>
    );
  }

  return (
    <div
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        border-warning-200
        bg-warning-50
        px-3
        py-1.5
      "
    >
      <Star
        size={13}
        fill="currentColor"
        strokeWidth={1.8}
        className="text-warning-500"
      />

      <span
        className="
          text-xs
          font-bold
          text-warning-700
        "
      >
        {value}
      </span>
    </div>
  );
}


// ============================================================
// FEEDBACK ITEM
// ============================================================

function FeedbackItem({ item }) {
  const feedback = item.feedback || item;

  const title = item.caseNumber
    ? `Case #${item.caseNumber}`
    : feedback.title || "Support feedback";

  const comment =
    feedback.comment ||
    item.comment ||
    "No comment provided.";

  const resolvedDate = item.resolvedAt
    ? new Date(item.resolvedAt)
    : null;

  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-ink-300
        bg-white
        p-5
        transition-all
        duration-200
        hover:border-ink-300
        hover:shadow-[0_8px_30px_rgba(16,32,55,0.04)]
      "
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        {/* Case / customer */}

        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-ink-100
              text-ink-500
            "
          >
            <MessageSquare
              size={17}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-ink-900
              "
            >
              {title}
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
              <UserRound
                size={12}
                strokeWidth={1.8}
              />

              Customer feedback
            </div>
          </div>
        </div>


        {/* Rating */}

        <Rating value={feedback.rating} />
      </div>


      {/* ==================================================
          COMMENT
      ================================================== */}

      <div
        className="
          mt-5
          rounded-xl
          bg-ink-50
          px-4
          py-4
        "
      >
        <p
          className="
            text-sm
            leading-6
            text-ink-600
          "
        >
          “{comment}”
        </p>
      </div>


      {/* ==================================================
          FOOTER
      ================================================== */}

      {resolvedDate && (
        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            text-xs
            text-ink-400
          "
        >
          <CalendarDays
            size={13}
            strokeWidth={1.8}
          />

          <span>
            Resolved{" "}
            {resolvedDate.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyFeedback() {
  return (
    <div
      className="
        flex
        min-h-[220px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-ink-300
        bg-ink-50
        px-6
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
          bg-white
          text-ink-300
          shadow-sm
          ring-1
          ring-ink-300
        "
      >
        <MessageSquare
          size={24}
          strokeWidth={1.5}
        />
      </div>

      <h3
        className="
          mt-4
          text-sm
          font-semibold
          text-ink-700
        "
      >
        No recent feedback
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
        Customer feedback from your recently
        resolved cases will appear here.
      </p>
    </div>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RecentFeedback({
  items = [],
}) {
  if (!items || items.length === 0) {
    return <EmptyFeedback />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const feedback = item.feedback || item;

        const title = item.caseNumber
          ? `Case #${item.caseNumber}`
          : feedback.title || "Support feedback";

        return (
          <FeedbackItem
            key={
              item.id ||
              feedback.id ||
              title
            }
            item={item}
          />
        );
      })}
    </div>
  );
}






