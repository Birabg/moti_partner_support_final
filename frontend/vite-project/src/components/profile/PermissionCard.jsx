export default function PermissionCard({

    permissions

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
                Permissions
            </h2>

            <div className="space-y-4">

                {

                    permissions.map(

                        permission => (

                            <div
                                key={permission}
                                className="flex gap-3"
                            >
                                <span>
                                    ✓
                                </span>

                                <span>
                                    {permission}
                                </span>

                            </div>

                        )

                    )

                }

            </div>

        </div>

    );

}
