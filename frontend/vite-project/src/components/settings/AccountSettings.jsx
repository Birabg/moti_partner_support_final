export default function AccountSettings({ user }) {
    return (
        <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-5">
                Account Settings
            </h2>

            <div className="space-y-4">

                <input
                    value={user.firstName}
                    className="w-full border p-3 rounded-lg"
                    readOnly
                />

                <input
                    value={user.middleName}
                    className="w-full border p-3 rounded-lg"
                    readOnly
                />

                <input
                    value={user.lastName}
                    className="w-full border p-3 rounded-lg"
                    readOnly
                />

                <input
                    value={user.phoneNumber}
                    className="w-full border p-3 rounded-lg"
                    readOnly
                />

            </div>
        </div>
    );
}