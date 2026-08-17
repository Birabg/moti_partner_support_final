import {
    Request,
    Response,
    NextFunction
} from "express";


import * as service from "./productCustomField.service";





export const createCustomField =
async(
req:Request,
res:Response,
next:NextFunction
)=>{


try{


const result =
await service.createCustomField(
    req.body
);



res.status(201).json({

    message:
    "Custom field created successfully",

    data:result

});


}catch(error){

next(error);

}


};







export const updateCustomField =
async(
req:Request,
res:Response,
next:NextFunction
)=>{


try{


const result =
await service.updateCustomField(

    req.params.id as string,

    req.body

);



res.json({

message:
"Custom field updated successfully",

data:result

});


}catch(error){

next(error);

}


};








export const toggleStatus =
async(
req:Request,
res:Response,
next:NextFunction
)=>{


try{


const result =
await service.toggleCustomFieldStatus(

req.params.id as string,

req.body.isActive

);



res.json({

message:
"Custom field status updated",

data:result

});


}catch(error){

next(error);

}


};







export const getAllCustomFields =
async(
req:Request,
res:Response,
next:NextFunction
)=>{


try{


const result =
await service.getAllCustomFields();



res.json({

data:result

});


}catch(error){

next(error);

}


};







export const getCustomField =
async(
req:Request,
res:Response,
next:NextFunction
)=>{


try{


const result =
await service.getCustomFieldById(
req.params.id as string
);



res.json({

data:result

});


}catch(error){

next(error);

}


};