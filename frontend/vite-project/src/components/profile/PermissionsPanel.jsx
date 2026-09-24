import { Lock, ShieldCheck, Sparkles } from "lucide-react";

import { formatPermissionLabel, splitEffectivePermissions } from "../../lib/permissions";

function PermissionChip({ code, tone }) {
    const tones = {
        role: "border-navy-100 bg-navy-50 text-navy-700",
        extra: "border-emerald-100 bg-emerald-50 text-emerald-700",
    };

    return (
        <span
            title={code}
            className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                tones[tone] || tones.role,
            ].join(" ")}
        >
            {tone === "extra" ? (
                <Sparkles className="h-3 w-3 shrink-0 text-emerald-500" />
            ) : (
                <Lock className="h-3 w-3 shrink-0 text-navy-400" />
            )}
            {formatPermissionLabel(code)}
        </span>
    );
}

export default function PermissionsPanel({ permissions = [], role, managerType }) {
    const { defaults, extras } = splitEffectivePermissions(permissions, role, managerType);

    return (
        <section className="rounded-2xl border border-ink-300 bg-white shadow-[0_8px_25px_rgba(15,35,65,0.04)]">
            <div className="flex items-start gap-3 border-b border-ink-100 px-5 py-5 sm:px-7">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-[18px] w-[18px]" />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                        Access
                    </p>

                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink-950">
                        Permissions &amp; Access
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-ink-400">
                        Everything your account is allowed to do in this workspace.
                    </p>
                </div>

                <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-ink-100 bg-ink-50 px-3 py-2 sm:flex">
                    <span className="text-sm font-bold text-ink-900">
                        {defaults.length + extras.length}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        Active
                    </span>
                </div>

            </div>

            <div className="px-5 py-6 sm:px-7">

                {defaults.length + extras.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-center text-xs text-ink-500">
                        No permissions were found for this account.
                    </div>
                ) : (
                    <div className="space-y-6">

                        {defaults.length > 0 && (
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-400">
                                        Included with your role
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-ink-200" />
                                    <span className="text-[9px] font-semibold text-ink-400">
                                        {defaults.length}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {defaults.map((code) => (
                                        <PermissionChip key={code} code={code} tone="role" />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                                    Granted by administrator
                                </span>
                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-semibold text-emerald-600">
                                    {extras.length}
                                </span>
                            </div>

                            {extras.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {extras.map((code) => (
                                        <PermissionChip key={code} code={code} tone="extra" />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-ink-100 bg-ink-50/70 px-4 py-3 text-[11px] leading-4 text-ink-500">
                                    No extra permissions have been granted to your account yet.
                                    Anything added by your administrator will appear here.
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </section>
    );
}