export default function ProfileCard({ user }) {

    return (

        <div
            className="
            bg-white
            rounded-lg
            shadow-sm
            border
            p-8
            "
        >
            <div className="flex items-center gap-7">

                <div
                    className="
                    w-20
                    h-20
                    rounded-full
                    bg-gradient-to-r
                    from-navy-500
                    to-navy-700
                    text-white
                    flex
                    items-center
                    justify-center
                    text-4xl
                    font-medium
                    "
                >
                    {user.fullName?.charAt(0)}
                </div>

                <div>

                    <h1 className="text-2xl font-medium">
                        {user.fullName}
                    </h1>

                    <p className="text-slate-500 mt-2">
                        {user.role}
                    </p>

                    <span
                        className="
                        inline-block
                        mt-4
                        px-4
                        py-2
                        rounded-full
                        bg-green-100
                        text-green-700
                        "
                    >
                        {user.status}
                    </span>

                </div>

            </div>

            <div className="grid grid-cols-2 gap-6 mt-10">

                <div>
                    <p className="text-slate-500">Email</p>
                    <h3>{user.email}</h3>
                </div>

                <div>
                    <p className="text-slate-500">Phone</p>
                    <h3>{user.phoneNumber}</h3>
                </div>

                <div>
                    <p className="text-slate-500">Gender</p>
                    <h3>{user.gender}</h3>
                </div>

                <div>
                    <p className="text-slate-500">Department</p>
                    <h3>{user.department}</h3>
                </div>

                <div>
                    <p className="text-slate-500">Division</p>
                    <h3>{user.division}</h3>
                </div>

                <div>
                    <p className="text-slate-500">Section</p>
                    <h3>{user.section}</h3>
                </div>

                <div>
                    <p className="text-slate-500">
                        Created At
                    </p>

                    <h3>
    {new Date(
        user.createdAt
    ).toLocaleString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    )}
</h3>
                </div>

            </div>

        </div>

    );

}