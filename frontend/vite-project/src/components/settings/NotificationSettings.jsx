export default function NotificationSettings() {
    return (
        <div className="bg-white rounded-lg p-6 shadow">

            <h2 className="text-2xl font-bold mb-5">
                Notifications
            </h2>

            <div className="space-y-4">

                <label className="flex justify-between">
                    Email Notifications
                    <input type="checkbox" />
                </label>

                <label className="flex justify-between">
                    Approval Notifications
                    <input type="checkbox" />
                </label>

                <label className="flex justify-between">
                    Feedback Notifications
                    <input type="checkbox" />
                </label>

            </div>
        </div>
    );
}