export default function ActivityCard({

    user

}) {

    return (

        <div
            className="
            bg-white
            rounded-lg
            p-8
            border
            shadow-sm
            "
        >

            <h2
                className="
                text-2xl
                font-bold
                mb-6
                "
            >
                Account Activity
            </h2>

            <div className="space-y-6">

                <div>
                    <p className="text-slate-500">
                        Last Login
                    </p>

                    <h3>
                        {user.lastLogin}
                    </h3>
                </div>

                <div>
                    <p className="text-slate-500">
                        Cases Managed
                    </p>

                    <h3>
                        {user.caseCount}
                    </h3>
                </div>

                <div>
                    <p className="text-slate-500">
                        Pending Approvals
                    </p>

                    <h3>
                        {user.pendingApprovals}
                    </h3>
                </div>

            </div>

        </div>

    );

}