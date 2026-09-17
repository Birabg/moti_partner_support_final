export default function SystemInformation() {
    return (
        <div className="bg-white rounded-lg p-6 shadow">

            <h2 className="text-2xl font-bold mb-5">
                System Information
            </h2>

            <div className="space-y-3">

                <div className="flex justify-between">
                    <span>Database</span>
                    <span className="text-green-600">
                        Connected
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>API</span>
                    <span className="text-green-600">
                        Running
                    </span>
                </div>

                <div className="flex justify-between">
                    <span>Version</span>
                    <span>1.0.0</span>
                </div>

            </div>
        </div>
    );
}
