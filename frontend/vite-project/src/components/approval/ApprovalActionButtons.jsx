import { CheckCircle2, XCircle } from "lucide-react";

export default function ApprovalActionButtons({ onApprove, onReject }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d2eae2] bg-[#edf7f3] px-3 py-1.5 text-xs font-semibold text-[#3b8d73] transition-colors hover:bg-[#e1f0ea]"
            >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
            </button>

            <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6c2c0] bg-[#fdf0f0] px-3 py-1.5 text-xs font-semibold text-[#c65b5b] transition-colors hover:bg-[#f8e3e2]"
            >
                <XCircle className="h-3.5 w-3.5" />
                Reject
            </button>
        </div>
    );
}