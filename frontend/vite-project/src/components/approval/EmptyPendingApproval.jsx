import { RefreshCw, UserCircle2 } from "lucide-react";

export default function EmptyPendingApproval({ refresh }) {
    return (
        <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,32,55,0.045)]">
            <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <UserCircle2 size={22} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                    No pending approvals
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                    No customers or staff members are waiting for administrator
                    approval. Newly registered users will automatically appear here
                    once they verify their email.
                </p>

                <button
                    type="button"
                    onClick={refresh}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-[#d9e5f4] hover:text-[#527eb9]"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh List
                </button>
            </div>
        </div>
    );
}