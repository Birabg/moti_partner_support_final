import {
useEffect,
useState
} from "react";


import {
getCategories,
getSubcategories,
getServiceTypes
} from "../../api/productserviceApi";


import {
createCase
} from "../../api/customerCaseApi";

import { useNavigate } from "react-router-dom";

import {
useAuth
} from "../../context/useAuth";



export default function CreateCase(){


const {user}=useAuth();
const navigate = useNavigate();



const [categories,setCategories]=useState([]);

const [subcategories,setSubcategories]=useState([]);

const [services,setServices]=useState([]);



const [filteredSubcategories,setFilteredSubcategories]=useState([]);




const [form,setForm]=useState({

branchName:"",

subject:"",

priority:"MEDIUM",

description:"",

productCategoryId:"",

productSubcategoryId:"",

serviceTypeId:""

});



const [file,setFile]=useState(null);





useEffect(()=>{

loadData();

},[]);




const loadData = async()=>{
 
try{
  const [cat, sub, service] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getServiceTypes(),
  ]);

  const normalizedCategories = Array.isArray(cat?.data)
    ? cat.data
    : Array.isArray(cat?.data?.data)
      ? cat.data.data
      : Array.isArray(cat?.data?.categories)
        ? cat.data.categories
        : [];

  const normalizedSubcategories = Array.isArray(sub?.data)
    ? sub.data
    : Array.isArray(sub?.data?.data)
      ? sub.data.data
      : Array.isArray(sub?.data?.subcategories)
        ? sub.data.subcategories
        : [];

  const normalizedServices = Array.isArray(service?.data)
    ? service.data
    : Array.isArray(service?.data?.data)
      ? service.data.data
      : Array.isArray(service?.data?.serviceTypes)
        ? service.data.serviceTypes
        : [];

  setCategories(normalizedCategories);
  setSubcategories(normalizedSubcategories);
  setServices(normalizedServices);
}
catch(error){
  console.error("Unable to load lookup data for case creation:", error);
}
 
};







const handleCategoryChange=(e)=>{
const categoryId = e.target.value;

setForm({
  ...form,
  productCategoryId: categoryId,
  productSubcategoryId: ""
});

const filtered = subcategories.filter((item) => {
  const itemCategoryId = item.productCategoryId ?? item.categoryId ?? item.product_category_id;
  return String(itemCategoryId) === String(categoryId);
});

setFilteredSubcategories(filtered);
};






const handleSubmit=async(e)=>{
 e.preventDefault();

 if (!form.branchName || !form.subject || !form.description || !form.productCategoryId || !form.productSubcategoryId || !form.serviceTypeId) {
   alert("Please complete all required case fields before submitting.");
   return;
 }

 try {
   const data = new FormData();

   data.append("branchName", form.branchName);
   data.append("subject", form.subject);
   data.append("description", form.description);
   data.append("productCategoryId", form.productCategoryId);
   data.append("productSubcategoryId", form.productSubcategoryId);
   data.append("serviceTypeId", form.serviceTypeId);
   data.append("priority", form.priority || "MEDIUM");

   if (file) {
     data.append("attachments", file);
   }

   const response = await createCase(data);
   console.log("CASE CREATED", response.data);
   alert("Case created successfully");
   navigate("/customer/my-cases");
 } catch (error) {
   console.error("CASE CREATE FAILED", error?.response?.data || error);
   alert(error?.response?.data?.message || "Failed creating case");
 }
};







return (

<div className="
min-h-screen
bg-slate-50
p-8
">


<div className="
max-w-3xl
mx-auto
bg-white
rounded-lg
border border-navy-100
shadow-sm
p-8
">


<h1 className="
text-2xl
font-bold
tracking-tight
text-slate-900
mb-8
">

Create Support Case

</h1>




<form
onSubmit={handleSubmit}
className="
space-y-6
">





{/* Branch */}

<div>

<label>
Branch Name
</label>


<input

className="
w-full
border
rounded-xl
p-3
"

value={form.branchName}

onChange={(e)=>

setForm({
...form,
branchName:e.target.value
})

}

/>


</div>







{/* Subject */}

<div>


<label>
Case Subject
</label>


<input

className="
w-full
border
rounded-xl
p-3
"

value={form.subject}

onChange={(e)=>

setForm({
...form,
subject:e.target.value
})

}

/>


</div>


{/* Category */}

<div>


<label>
Select Category
</label>


<select

className="
w-full
border
rounded-xl
p-3
"


value={form.productCategoryId}


onChange={handleCategoryChange}

>


<option>
Select Category
</option>



{
categories.map(cat=>(

<option
key={cat.id}
value={cat.id}
>

{cat.name}

</option>

))
}


</select>



</div>









{/* Subcategory */}

<div>


<label>
Select Subcategory
</label>



<select

className="
w-full
border
rounded-xl
p-3
"


value={form.productSubcategoryId}


onChange={(e)=>

setForm({

...form,

productSubcategoryId:e.target.value

})

}


>


<option>
Select Subcategory
</option>



{
filteredSubcategories.map(sub=>(

<option

key={sub.id}

value={sub.id}

>

{sub.name}

</option>

))

}



</select>


</div>









{/* Service */}

<div>


<label>
Select Service
</label>



<select

className="
w-full
border
rounded-xl
p-3
"


value={form.serviceTypeId}


onChange={(e)=>

setForm({

...form,

serviceTypeId:e.target.value

})

}


>


<option>
Select Service
</option>



{
services.map(service=>(

<option

key={service.id}

value={service.id}

>

{
service.name ||
service.serviceName
}
</option>

))

}



</select>



</div>


{/* Priority */}

<div>


<label>
Priority
</label>


<select

className="
w-full
border
rounded-xl
p-3
"

value={form.priority}

onChange={(e)=>

setForm({
...form,
priority:e.target.value
})

}

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


</select>


</div>


{/* Description */}

<div>


<label>
Explain Your Problem
</label>


<textarea

rows="5"

className="
w-full
border
rounded-xl
p-3
"


value={form.description}


onChange={(e)=>

setForm({
...form,
description:e.target.value
})

}


/>


</div>







{/* File */}

<div>


<label>
Attachment
</label>


<input

type="file"

className="
w-full
border
rounded-xl
p-3
"


onChange={(e)=>

setFile(
e.target.files[0]
)

}


/>


</div>









<button

className="
w-full
bg-navy-600
hover:bg-navy-700
text-white
py-3
rounded-xl
font-bold
"

>


Submit Case


</button>



</form>



</div>


</div>


);


}