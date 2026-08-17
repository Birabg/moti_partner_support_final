import {
    useEffect,
    useState
} from "react";


import Axios from "../../api/axios";


import {
    reassignCase
} from "../../api/caseApi";



export default function ReassignStaffModal({

    caseData,

    close,

    refresh

}){


const [staff,setStaff]=useState([]);

const [selected,setSelected]=useState("");

const [loading,setLoading]=useState(false);





const loadStaff=async()=>{


try{


const response =
await Axios.get(
"/staff/support"
);


setStaff(
response.data.data || []
);


}catch(error){

console.log(error);

}


};





useEffect(()=>{


loadStaff();


},[]);






const submit=async()=>{


if(!selected){

alert(
"Select support staff"
);

return;

}



try{


setLoading(true);


await reassignCase(
                caseData.id,
                { assignedSupportId: selected }
            );


await refresh();


close();



}catch(error){


console.log(error);

alert(
"Reassign failed"
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
p-8
rounded-lg
w-full
max-w-md
"
>


<h2
className="
text-2xl
font-bold
mb-5
"
>

Reassign Case

</h2>



<p className="mb-4">

Case:

{caseData.caseNumber}

</p>





<select

className="
w-full
border
rounded-xl
p-3
mb-5
"

value={selected}

onChange={
e=>setSelected(
e.target.value
)
}

>


<option value="">

Select Staff

</option>



{

staff.map(item=>(


<option

key={item.id}

value={item.id}

>


{item.firstName}

{" "}

{item.lastName}


</option>


))


}


</select>




<div className="
flex
justify-end
gap-3
">


<button

onClick={close}

className="
px-5
py-3
bg-gray-200
rounded-xl
"

>

Cancel

</button>




<button

disabled={loading}

onClick={submit}

className="
px-5
py-3
bg-navy-600
text-white
rounded-xl
"

>

{

loading

?

"Saving..."

:

"Reassign"

}


</button>


</div>



</div>


</div>


);


}