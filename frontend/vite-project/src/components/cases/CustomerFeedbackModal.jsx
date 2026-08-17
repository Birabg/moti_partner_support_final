import {
    useState
} from "react";


import {
    closeCaseWithFeedback
} from "../../api/caseApi";



export default function CustomerFeedbackModal({

    caseData,

    close,

    refresh

}){


const [rating,setRating]=useState(5);

const [comment,setComment]=useState("");

const [loading,setLoading]=useState(false);





const submit=async()=>{


try{

            setLoading(true);

            await closeCaseWithFeedback(
                caseData.id,
                {
                    rating,
                    comment,
                }
            );

await refresh();


close();



}
catch(error){


console.log(
    error
);


alert(
    "Failed to close case"
);


}
finally{


setLoading(false);


}



};






return (

<div

className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
"

>


<div

className="
bg-white
rounded-lg
p-8
w-full
max-w-md
"

>



<h2

className="
text-2xl
font-bold
text-navy-950
mb-5
"

>

Close Case Feedback

</h2>



<p className="mb-5 text-gray-500">

Case:

{" "}

{caseData.caseNumber}

</p>





<label className="font-semibold">

Rating

</label>


<select

value={rating}

onChange={
e=>setRating(
Number(e.target.value)
)
}


className="
w-full
border
rounded-xl
p-3
mt-2
mb-5
"

>


<option value={5}>
⭐⭐⭐⭐⭐ (5)
</option>


<option value={4}>
⭐⭐⭐⭐ (4)
</option>


<option value={3}>
⭐⭐⭐ (3)
</option>


<option value={2}>
⭐⭐ (2)
</option>


<option value={1}>
⭐ (1)
</option>


</select>






<textarea

rows="5"

value={comment}

onChange={
e=>setComment(
e.target.value
)
}


placeholder="
Tell us about your experience...
"

className="
w-full
border
rounded-xl
p-4
"

 />






<div

className="
flex
justify-end
gap-3
mt-6
"

>


<button

onClick={close}

className="
px-5
py-3
rounded-xl
bg-gray-200
"

>

Cancel

</button>





<button

onClick={submit}

disabled={loading}

className="
px-5
py-3
rounded-xl
bg-green-600
text-white
"

>

{

loading

?

"Submitting..."

:

"Close Case"

}


</button>




</div>



</div>



</div>

);


}