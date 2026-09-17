import { useState } from "react";

export default function FeedbackModal({

    open,

    onClose,

    onSubmit,

}) {

    const [rating, setRating] = useState(5);

    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(false);

    if (!open) return null;

    async function submit() {

        try {

            setLoading(true);

            await onSubmit(

                rating,

                comment

            );

            setComment("");

            setRating(5);

            onClose();

        }

        catch (error) {

            console.log(error);

            alert(

                error?.response?.data?.message ||

                "Unable to submit feedback."

            );

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <div
            className="
            fixed
            inset-0
            bg-black/40
            flex
            justify-center
            items-center
            z-50
            "
        >

            <div
                className="
                bg-white
                rounded-lg
                w-full
                max-w-lg
                p-8
                shadow-xl
                "
            >

                <h2
                    className="
                    text-2xl
                    font-bold
                    mb-6
                    "
                >

                    Case Feedback

                </h2>

                <div
                    className="
                    space-y-5
                    "
                >

                    <div>

                        <label
                            className="
                            block
                            font-semibold
                            mb-2
                            "
                        >

                            Rating

                        </label>

                        <select

                            value={rating}

                            onChange={(e)=>

                                setRating(

                                    Number(

                                        e.target.value

                                    )

                                )

                            }

                            className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-3
                            "

                        >

                            <option value={5}>★★★★★ Excellent</option>

                            <option value={4}>★★★★ Very Good</option>

                            <option value={3}>★★★ Good</option>

                            <option value={2}>★★ Fair</option>

                            <option value={1}>★ Poor</option>

                        </select>

                    </div>

                    <div>

                        <label
                            className="
                            block
                            font-semibold
                            mb-2
                            "
                        >

                            Comment

                        </label>

                        <textarea

                            rows={5}

                            value={comment}

                            onChange={(e)=>

                                setComment(

                                    e.target.value

                                )

                            }

                            className="
                            w-full
                            border
                            rounded-lg
                            px-4
                            py-3
                            "

                            placeholder="Write your experience..."

                        />

                    </div>

                    <div
                        className="
                        flex
                        justify-end
                        gap-4
                        mt-8
                        "
                    >

                        <button

                            onClick={onClose}

                            className="
                            px-5
                            py-3
                            rounded-lg
                            border
                            "

                        >

                            Cancel

                        </button>

                        <button

                            onClick={submit}

                            disabled={loading}

                            className="
                            bg-navy-600
                            hover:bg-navy-700
                            text-white
                            px-6
                            py-3
                            rounded-lg
                            "

                        >

                            {

                                loading

                                    ?

                                    "Submitting..."

                                    :

                                    "Submit Feedback"

                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}
