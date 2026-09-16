import {
    Building2,
    Plus,
} from "lucide-react";

export default function EmptyOrganization() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-12px_rgba(15,23,42,0.18)]">
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Building2 className="h-7 w-7" />
                </div>

                {/* Title */}
                <h2 className="mt-5 text-lg font-semibold text-slate-900">
                    No Organizations Found
                </h2>

                {/* Description */}
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    There are currently no organizations matching
                    your search. Create your first organization to
                    begin managing customer accounts.
                </p>

                {/* Decorative indicator */}
                <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                    <span className="h-px w-8 bg-slate-200" />
                    Organization Directory
                    <span className="h-px w-8 bg-slate-200" />
                </div>
            </div>
        </div>
    );
}