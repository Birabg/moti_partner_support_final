import { prisma } from "../../config/database";
import {
    BadRequestError,
    NotFoundError
} from "../../utils/error";



export const createField = async(data:{
    name:string;
    fieldType:string;
    required:boolean;
    productSubcategoryId:string;
})=>{


    const subcategory =
        await prisma.productSubcategory.findUnique({

            where:{
                id:data.productSubcategoryId
            }

        });



    if(!subcategory){

        throw new NotFoundError(
            "Product subcategory not found"
        );

    }



    return prisma.productCustomField.create({

        data

    });


};





export const updateField = async(
    id:string,
    data:any
)=>{


    const field =
        await prisma.productCustomField.findUnique({

            where:{
                id
            }

        });



    if(!field){

        throw new NotFoundError(
            "Custom field not found"
        );

    }



    return prisma.productCustomField.update({

        where:{
            id
        },

        data

    });


};





export const changeStatus = async(
    id:string,
    isActive:boolean
)=>{


    const field =
        await prisma.productCustomField.findUnique({

            where:{
                id
            }

        });



    if(!field){

        throw new NotFoundError(
            "Custom field not found"
        );

    }



    return prisma.productCustomField.update({

        where:{
            id
        },

        data:{
            isActive
        }

    });


};





export const getFieldsBySubcategory =
async(
    subcategoryId:string
)=>{


    return prisma.productCustomField.findMany({

        where:{
            productSubcategoryId:
                subcategoryId
        },

        orderBy:{
            createdAt:"desc"
        }

    });


};





export const deleteField =
async(id:string)=>{


    const field =
        await prisma.productCustomField.findUnique({

            where:{
                id
            }

        });



    if(!field){

        throw new NotFoundError(
            "Custom field not found"
        );

    }



    return prisma.productCustomField.delete({

        where:{
            id
        }

    });


};