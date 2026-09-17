export default function DangerZone() {
    return (
        <div
            className="
            bg-red-50
            border
            border-red-300
            rounded-lg
            p-6
            "
        >
            <h2 className="text-2xl font-bold text-red-600">
                Danger Zone
            </h2>

            <p className="mt-3 text-slate-600">
                Deactivate your account.
            </p>

            <button
                className="
                mt-5
                bg-red-600
                text-white
                px-6
                py-3
                rounded-lg
                "
            >
                Deactivate Account
            </button>
        </div>
    );
}
