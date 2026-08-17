import {
 Request,
 Response
}
from "express";


import * as Service
from "./productField.service";





export const createField =
async(
req:Request,
res:Response
)=>{


try{


const result =
await Service.createField(
req.body
);



res.status(201).json({

message:
"Custom field created successfully",

data:result

});


}catch(error:any){


res.status(500).json({

message:error.message

});


}



};








export const updateField =
async(
req:Request,
res:Response
)=>{


try{


const result =
await Service.updateField(

req.params.id as string,

req.body

);



res.json({

message:
"Custom field updated",

data:result

});



}catch(error:any){

res.status(500).json({

message:error.message

});

}


};








export const toggleStatus =
async(
req:Request,
res:Response
)=>{


try{


const result =
await Service.changeStatus(

req.params.id as string,

req.body.isActive

);



res.json({

message:
"Status updated",

data:result

});


}catch(error:any){

res.status(500).json({

message:error.message

});

}


};









export const getBySubcategory =
async(
req:Request,
res:Response
)=>{


try{


const result =
await Service.getFieldsBySubcategory(

req.params.id as string

);



res.json({

data:result

});


}catch(error:any){

res.status(500).json({

message:error.message

});

}



};








export const deleteField =
async(
req:Request,
res:Response
)=>{


try{


await Service.deleteField(

req.params.id as string

);



res.json({

message:
"Custom field deleted"

});


}catch(error:any){

res.status(500).json({

message:error.message

});

}


};