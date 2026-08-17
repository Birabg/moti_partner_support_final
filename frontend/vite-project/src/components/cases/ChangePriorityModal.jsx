import {
useState
} from "react";


import {
changePriority
} from "../../api/caseApi";




export default function ChangePriorityModal({
caseData,
close,
refresh
}){


const [priority,setPriority]=useState(
caseData.priority || "LOW"
);


const [loading,setLoading]=useState(false);





const submit=async()=>{


try{


setLoading(true);


await changePriority(
caseData.id,
{ priority }
);



await refresh();


close();



}
catch(error){

console.log(
"Priority update failed",
error
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
w-[400px]
"
>



<h2
className="
text-2xl
font-bold
mb-6
"
>

Change Priority

</h2>




<select

value={priority}

onChange={
e=>setPriority(e.target.value)
}

className="
w-full
border
rounded-xl
px-4
py-3
mb-6
"

>


<option value="LOW">
LOW
</option>


<option value="MEDIUM">
MEDIUM
</option>


<option value="HIGH">
HIGH
</option>


<option value="URGENT">
URGENT
</option>


</select>




<div
className="
flex
gap-3
"
>


<button

onClick={submit}

disabled={loading}

className="
bg-navy-600
text-white
px-6
py-3
rounded-xl
"

>

{
loading
?
"Saving..."
:
"Save"
}

</button>




<button

onClick={close}

className="
bg-gray-200
px-6
py-3
rounded-xl
"

>

Cancel

</button>


</div>



</div>


</div>

);


}