import {
    useEffect,
    useState
} from "react";


import {
    getAllCases
} from "../../api/caseApi";


import CaseStats from "../../components/cases/CaseStats";
import CaseFilters from "../../components/cases/CaseFilters";
import CaseTable from "../../components/cases/CaseTable";
import CaseDetailsDrawer from "../../components/cases/CaseDetailsDrawer";

import AssignStaffModal from "../../components/cases/AssignStaffModal";
import ChangePriorityModal from "../../components/cases/ChangePriorityModal";
import ResolveCaseModal from "../../components/cases/ResolveCaseModal";
import ReassignStaffModal from "../../components/cases/ReassignStaffModal";

import Pagination from "../../components/cases/Pagination";
import CaseSorting from "../../components/cases/CaseSorting";
import CaseToolbar from "../../components/cases/CaseToolbar";
import { PageHeader } from "../../components/ui/page-header";



export default function CaseTrackingPage(){



const [cases,setCases] = useState([]);

const [filteredCases,setFilteredCases] = useState([]);

const [loading,setLoading] = useState(false);



const [selectedCase,setSelectedCase] = useState(null);



const [details,setDetails] = useState(false);

const [assign,setAssign] = useState(false);

const [priority,setPriority] = useState(false);

const [showResolve,setShowResolve] = useState(false);

const [showReassign,setShowReassign] = useState(false);



const [sortBy,setSortBy] = useState("createdAt");

const [order,setOrder] = useState("desc");



const [page,setPage] = useState(1);

const [limit] = useState(10);



const [pagination,setPagination] = useState({

    page:1,

    limit:10,

    total:0,

    totalPages:1

});

const notifyCaseDashboardRefresh = () => {

    window.dispatchEvent(new CustomEvent("cases:updated"));

};




// ===============================
// LOAD CASES
// ===============================

const loadCases = async()=>{


try{


setLoading(true);



const response = await getAllCases(

    page,

    limit,

    sortBy,

    order

);



// backend response:
// {
//   success:true,
//   data:[cases],
//   pagination:{}
// }


const casesData = response.data.data || [];



const paginationData = response.data.pagination || {

    page:1,

    limit:10,

    total:0,

    totalPages:1

};



setCases(casesData);


setFilteredCases(casesData);


setPagination(paginationData);



}

catch(error){

console.log(
    "Loading cases failed:",
    error
);

}


finally{

setLoading(false);

}


};





useEffect(()=>{

    loadCases();

},[
    page,
    sortBy,
    order
]);







// ===============================
// FILTER
// ===============================


const filterCases = ({
    search,
    status
})=>{


let result=[...cases];



if(search){


result=result.filter(item=>


`${item.caseNumber || ""}

${item.subject || ""}

${item.customer?.firstName || ""}

${item.customer?.lastName || ""}`


.toLowerCase()

.includes(
    search.toLowerCase()
)

);


}



if(
status &&
status !== "ALL"
){


result=result.filter(
item=>item.status===status
);


}



setFilteredCases(result);



};









// ===============================
// SORTING
// ===============================


const handleSorting=(

field,

direction

)=>{


setSortBy(field);

setOrder(direction);

setPage(1);



};







return(


<div
className="
space-y-6
"
>



<PageHeader
title="Case Tracking Center"
subtitle="Manage customer support cases"
/>




<CaseToolbar

refresh={loadCases}

cases={cases}

/>





<CaseStats

cases={cases}

/>






<div className="flex flex-wrap items-center gap-3 rounded-lg border border-navy-100 bg-white p-4 shadow-sm">
<CaseFilters

onFilter={filterCases}

/>

<CaseSorting

sortBy={sortBy}

order={order}

onSortChange={handleSorting}

/>
</div>








{

loading ?


<div
className="
bg-white
p-10
rounded-lg
text-center
"
>

Loading Cases...


</div>



:


<CaseTable


cases={filteredCases}



onView={(item)=>{


setSelectedCase(item);

setDetails(true);


}}



onAssign={(item)=>{


setSelectedCase(item);

setAssign(true);


}}



onResolve={(item)=>{


setSelectedCase(item);

setShowResolve(true);


}}




onReassign={(item)=>{


setSelectedCase(item);

setShowReassign(true);


}}




onPriority={(item)=>{


setSelectedCase(item);

setPriority(true);


}}



/>


}









<Pagination


page={pagination.page}


totalPages={pagination.totalPages}


onPageChange={setPage}


/>









{
details &&

<CaseDetailsDrawer


caseData={selectedCase}


close={()=>setDetails(false)}


/>

}









{
assign &&

<AssignStaffModal


caseData={selectedCase}


refresh={async()=>{


await loadCases();


notifyCaseDashboardRefresh();


}}


close={()=>setAssign(false)}


/>

}










{
showResolve &&


<ResolveCaseModal


caseData={selectedCase}


refresh={async()=>{


await loadCases();


notifyCaseDashboardRefresh();


}}


close={()=>setShowResolve(false)}


/>

}









{
showReassign &&


<ReassignStaffModal


caseData={selectedCase}


refresh={async()=>{


await loadCases();


notifyCaseDashboardRefresh();


}}


close={()=>setShowReassign(false)}


/>

}









{
priority &&


<ChangePriorityModal


caseData={selectedCase}


refresh={async()=>{


await loadCases();


notifyCaseDashboardRefresh();


}}


close={()=>setPriority(false)}


/>

}








</div>


);


}