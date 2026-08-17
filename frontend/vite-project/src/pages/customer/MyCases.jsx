import {useEffect,useState} from "react";
import {useAuth} from "../../context/useAuth";

import customerCaseApi from "../../api/customerCaseApi";

import CaseCard from "../../components/customer/CaseCard";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";

import "./myCases.css";


export default function MyCases(){


const {user}=useAuth();


const [cases,setCases]=useState([]);

const [loading,setLoading]=useState(true);

const [error,setError]=useState("");

const [detailCase,setDetailCase]=useState(null);


useEffect(()=>{


    loadCases();


},[user]);



const loadCases = async()=>{


try{


    if(!user?.id){
        setLoading(false);
        return;
    }


    setLoading(true);



    const response = await customerCaseApi.getCustomerCases();



    console.log(
        "CUSTOMER CASE RESPONSE:",
        response.status,
        response.data,
        response.headers,
    );



    const history =
        response.data?.data?.history ||
        response.data?.data?.cases ||
        response.data?.history ||
        response.data?.cases ||
        [];

    setCases(history);



}
catch(err){

    console.log(err);


    setError(
        "Unable to load your cases"
    );


}
finally{

    setLoading(false);

}


};



if(loading){

return (

<div className="case-loading">

Loading cases...

</div>

);

}



if(error){

return (

<div className="case-error">

{error}

</div>

);

}




return (

<>

<div className="my-cases-container">


<h1 className="text-2xl font-bold tracking-tight text-slate-900">

My Support Cases

</h1>



{
cases.length===0 ?

(

<div className="empty-cases">

No cases submitted yet.

</div>

)

:

(

<div className="cases-grid">


{
cases.map((item)=>(


<CaseCard

key={item.id}

caseData={item}

onClick={() => setDetailCase(item)}

/>


))

}


</div>


)

}



</div>


{detailCase && (
    <CaseDetailsDrawer
        caseData={detailCase}
        close={() => setDetailCase(null)}
    />
)}

</>

);


}