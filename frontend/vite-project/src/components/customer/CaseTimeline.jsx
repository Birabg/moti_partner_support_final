import StatusBadge from "./StatusBadge";

export default function CaseTimeline({

    history = []

}) {

    return (

        <div
            className="
            bg-white
            rounded-xl
            shadow-sm
            border
            border-slate-200
            p-6
            "
        >

            <h2
                className="
                text-xl
                font-bold
                mb-6
                "
            >

                Case Timeline

            </h2>

            {

                history.length === 0 ?

                    (

                        <div
                            className="
                            text-center
                            py-10
                            text-slate-500
                            "
                        >

                            No timeline available.

                        </div>

                    )

                    :

                    (

                        <div
                            className="
                            relative
                            border-l-2
                            border-navy-200
                            ml-3
                            "
                        >

                            {

                                history.map(

                                    (item) => (

                                        <div

                                            key={item.id}

                                            className="
                                            relative
                                            pl-8
                                            pb-10
                                            "

                                        >

                                            <span
                                                className="
                                                absolute
                                                -left-[10px]
                                                top-1
                                                w-4
                                                h-4
                                                rounded-full
                                                bg-navy-600
                                                "
                                            />

                                            <div
                                                className="
                                                bg-slate-50
                                                rounded-xl
                                                p-4
                                                border
                                                "
                                            >

                                                <div
                                                    className="
                                                    flex
                                                    justify-between
                                                    items-center
                                                    "
                                                >

                                                    <StatusBadge

                                                        status={item.status}

                                                    />

                                                    <span
                                                        className="
                                                        text-xs
                                                        text-slate-500
                                                        "
                                                    >

                                                        {

                                                            new Date(

                                                                item.createdAt

                                                            ).toLocaleString()

                                                        }

                                                    </span>

                                                </div>

                                                {

                                                    item.note &&

                                                    (

                                                        <p
                                                            className="
                                                            mt-3
                                                            text-slate-600
                                                            "
                                                        >

                                                            {item.note}

                                                        </p>

                                                    )

                                                }

                                                {

                                                    item.changedBy &&

                                                    (

                                                        <div
                                                            className="
                                                            mt-4
                                                            text-sm
                                                            text-slate-500
                                                            "
                                                        >

                                                            Updated By :

                                                            {" "}

                                                            {

                                                                item.changedBy

                                                            }

                                                        </div>

                                                    )

                                                }

                                            </div>

                                        </div>

                                    )

                                )

                            }

                        </div>

                    )

            }

        </div>

    );

}