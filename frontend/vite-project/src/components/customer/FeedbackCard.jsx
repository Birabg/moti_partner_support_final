import { useState } from "react";
import {
    FaStar,
    FaRegStar,
    FaCommentDots,
    FaPaperPlane
} from "react-icons/fa";

import "../../styles/customerDashboard.css";

export default function FeedbackCard({

    feedback,

    onSubmit

}) {

    const [rating, setRating] = useState(

        feedback?.rating || 5

    );

    const [comment, setComment] = useState(

        feedback?.comment || ""

    );

    const [loading, setLoading] = useState(false);

    async function handleSubmit() {

        if (!comment.trim()) {

            alert("Please enter your feedback.");

            return;

        }

        try {

            setLoading(true);

            await onSubmit({

                rating,

                comment

            });

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <div className="feedback-card">

            <div className="feedback-header">

                <h3>

                    <FaCommentDots />

                    {" "}

                    Customer Feedback

                </h3>

            </div>

            <div className="feedback-rating">

                {

                    [1,2,3,4,5].map(star => (

                        <button

                            key={star}

                            type="button"

                            onClick={() =>

                                setRating(star)

                            }

                            className="feedback-star-btn"

                        >

                            {

                                star <= rating

                                ?

                                <FaStar color="#fbbf24" size={28}/>

                                :

                                <FaRegStar color="#cbd4e1" size={28}/>

                            }

                        </button>

                    ))

                }

            </div>

            <div className="customer-form-group">

                <label>

                    Comment

                </label>

                <textarea

                    rows={6}

                    placeholder="Tell us about your experience..."

                    value={comment}

                    onChange={(e)=>

                        setComment(e.target.value)

                    }

                />

            </div>

            <button

                type="button"

                onClick={handleSubmit}

                disabled={loading}

                className="customer-btn customer-btn-primary"

            >

                <FaPaperPlane />

                {" "}

                {

                    loading

                    ?

                    "Submitting..."

                    :

                    "Submit Feedback"

                }

            </button>

            {

                feedback?.createdAt && (

                    <div
                        style={{
                            marginTop:20,
                            fontSize:13,
                            color:"#64748b"
                        }}
                    >

                        Submitted:

                        {" "}

                        {

                            new Date(

                                feedback.createdAt

                            ).toLocaleString()

                        }

                    </div>

                )

            }

        </div>

    );

}
