function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Table({ className = "", ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cx("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className = "", ...props }) {
  return <thead className={cx("[&_tr]:border-b", className)} {...props} />;
}

export function TableBody({ className = "", ...props }) {
  return <tbody className={cx("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className = "", ...props }) {
  return (
    <tr
      className={cx(
        "border-b border-navy-100 transition-colors hover:bg-navy-50/60",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className = "", ...props }) {
  return (
    <th
      className={cx(
        "h-10 whitespace-nowrap px-3 text-start align-middle text-xs font-semibold uppercase tracking-wide text-slate-500",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }) {
  return (
    <td className={cx("whitespace-nowrap px-3 py-3 align-middle text-sm text-slate-700", className)} {...props} />
  );
}
