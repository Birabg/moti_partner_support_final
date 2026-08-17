export default function CaseTimeline({

    history = []

}) {


    if (history.length === 0) {

        return (

            <div
                className="
                text-gray-500
                text-center
                py-8
                "
            >

                No timeline available

            </div>

        );

    }



    return (

        <div
            className="
            mt-8
            "
        >


            <h3
                className="
                text-xl
                font-bold
                mb-6
                text-navy-950
                "
            >

                Case Timeline

            </h3>





            <div
                className="
                space-y-8
                "
            >


                {

                    history.map((item, index) => (

                        <div

                            key={item.id}

                            className="
                            flex
                            gap-4
                            "

                        >



                            {/* Timeline Circle */}

                            <div
                                className="
                                flex
                                flex-col
                                items-center
                                "
                            >


                                <div
                                    className="
                                    w-4
                                    h-4
                                    rounded-full
                                    bg-navy-600
                                    "
                                />



                                {
                                    index !== history.length - 1 &&

                                    <div
                                        className="
                                        flex-1
                                        w-[2px]
                                        bg-gray-300
                                        mt-2
                                        "
                                    />

                                }


                            </div>






                            {/* Timeline Content */}

                            <div
                                className="
                                bg-slate-50
                                rounded-xl
                                p-4
                                flex-1
                                "
                            >



                                {/* Status Change */}

                                <h4
                                    className="
                                    font-semibold
                                    text-navy-900
                                    "
                                >


                                    {

                                        item.oldStatus

                                    }


                                    {" → "}


                                    {

                                        item.newStatus

                                    }


                                </h4>








                                {/* Priority Change */}

                                {

                                    item.oldPriority &&

                                    item.newPriority &&


                                    (

                                        <p
                                            className="
                                            text-sm
                                            text-orange-600
                                            mt-2
                                            "
                                        >

                                            Priority:


                                            {" "}


                                            {

                                                item.oldPriority

                                            }


                                            {" → "}


                                            {

                                                item.newPriority

                                            }


                                        </p>


                                    )

                                }









                                {/* Assigned Staff Change */}

                                {

                                    item.newAgentId &&


                                    (

                                        <p
                                            className="
                                            text-sm
                                            text-green-600
                                            mt-2
                                            "
                                        >

                                            Assigned support staff changed

                                        </p>


                                    )

                                }










                                {/* Changed By */}

                                <p
                                    className="
                                    text-sm
                                    text-gray-500
                                    mt-3
                                    "
                                >


                                    Changed by:


                                    {" "}


                                    {

                                        item.changedBy

                                        ?

                                        `${item.changedBy.firstName} ${item.changedBy.lastName}`

                                        :

                                        "System"

                                    }


                                </p>









                                {/* Date */}

                                <p
                                    className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                    "
                                >

                                    {

                                        new Date(

                                            item.changedAt

                                        ).toLocaleString()

                                    }


                                </p>




                            </div>



                        </div>


                    ))

                }



            </div>


        </div>


    );


}