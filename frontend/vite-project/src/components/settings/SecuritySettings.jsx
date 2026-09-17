export default function SecuritySettings() {
    return (
        <div className="bg-white rounded-lg p-6 shadow">

            <h2 className="text-2xl font-bold mb-5">
                Security
            </h2>

            <button
                className="
                w-full
                bg-navy-600
                text-white
                p-3
                rounded-lg
                "
            >
                Change Password
            </button>

            <button
                className="
                w-full
                mt-4
                bg-slate-800
                text-white
                p-3
                rounded-lg
                "
            >
                Logout All Devices
            </button>

        </div>
    );
}
