import {
    FaTicketAlt,
    FaUserTie,
    FaCalendarAlt
} from "react-icons/fa";


import "./caseCard.css";



export default function CaseCard({
    caseData,
    onClick
}){


const {

caseNumber,
subject,
status,
priority,
createdAt,
assignedSupport,
productCategory

}=caseData;



return (

<div
    className="case-card"
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
        }
    } : undefined}
>



<div className="case-header">


<div className="case-icon">

<FaTicketAlt/>

</div>



<div>

<h3>

{subject || "Untitled Case"}

</h3>


<span>

#{caseNumber || "N/A"}

</span>


</div>


</div>





<div className="case-info">



<p>

<strong>Status:</strong>


<span 
className={`status ${status?.toLowerCase() || ""}`}
>

{status || "UNKNOWN"}

</span>


</p>




<p>

<strong>Priority:</strong>

{" "}

{priority || "Not assigned"}

</p>




<p>

<strong>
Category:
</strong>


{" "}

{productCategory?.name || "N/A"}


</p>





<p>

<FaCalendarAlt/>


{" "}

{

createdAt

?

new Date(createdAt)
.toLocaleDateString()

:

"N/A"

}


</p>



</div>





<div className="assigned">


<FaUserTie/>


{" "}


{

assignedSupport

?

`${assignedSupport.firstName || ""}
 ${assignedSupport.lastName || ""}`

:

"Waiting assignment"

}



</div>




</div>


);


}