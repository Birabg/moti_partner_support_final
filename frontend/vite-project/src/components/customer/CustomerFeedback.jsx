import {
    useEffect,
    useState
}
from "react";


import { FaStar } from "react-icons/fa";

import {
    getMyCases,
    submitFeedback as submitCaseFeedback
} from "../../api/customerCaseApi";


import "../../styles/customerDashboard.css";




export default function CustomerFeedback(){



const [cases,setCases]=useState([]);


const [selected,setSelected]=useState(null);


const [rating,setRating]=useState(5);


const [comment,setComment]=useState("");




useEffect(()=>{


loadCases();


},[]);





async function loadCases(){


try{

const response = await getMyCases();

setCases(response.data?.data?.history || []);



}

catch(error){

console.log(error);

}


}







async function submitFeedback(){



try{


await submitCaseFeedback(
selected.id,
rating,
comment
);



alert(
"Feedback submitted successfully"
);



setSelected(null);

setComment("");



}

catch(error){

console.log(error);

}



}





return (



<div className="customer-dashboard">



<div className="customer-form">


<h1>

Customer Feedback

</h1>


<p>

Rate your resolved support cases

</p>





{
cases.filter(
item=>
item.status==="RESOLVED" ||
item.status==="CLOSED"
)
.map(item=>(


<div

key={item.id}

className="feedback-card"

>


<h3>

Case #{item.caseNumber}

</h3>


<p>

{item.subject}

</p>



<button

className="customer-btn customer-btn-primary"

onClick={()=>setSelected(item)}

>


Give Feedback


</button>



</div>


))

}



</div>







{
selected &&


<div className="customer-modal-overlay">


<div className="customer-modal">


<h2>

Feedback

</h2>



<div className="rating-box">


{

[1,2,3,4,5].map(star=>(


<FaStar

key={star}

onClick={()=>setRating(star)}

className={
star<=rating
?
"star-active"
:
"star"
}


/>


))

}



</div>





<textarea

placeholder="Write your comment..."

value={comment}

onChange={
e=>setComment(e.target.value)
}


/>





<button

className="customer-btn customer-btn-success"

onClick={submitFeedback}

>

Submit Feedback

</button>




<button

className="customer-btn customer-btn-secondary"

onClick={()=>setSelected(null)}

>

Cancel

</button>



</div>



</div>



}





</div>


)


}
