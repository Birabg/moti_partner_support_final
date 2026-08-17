import { prisma } from "../../config/database";
import { BadRequestError, NotFoundError } from "../../utils/error";



export const createCustomField = async(data:any)=>{


    const {
        name,
        fieldType,
        required,
        productSubcategoryId
    } = data;



    const subcategory =
        await prisma.productSubcategory.findUnique({
            where:{
                id:productSubcategoryId
            }
        });



    if(!subcategory){

        throw new NotFoundError(
            "Product subcategory not found"
        );

    }



    const exists =
        await prisma.productCustomField.findFirst({

            where:{
                name,
                productSubcategoryId
            }

        });



    if(exists){

        throw new BadRequestError(
            "Custom field already exists"
        );

    }



    return prisma.productCustomField.create({

        data:{
            name,
            fieldType,
            required,
            productSubcategoryId
        }

    });


};





export const updateCustomField = async(
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






export const toggleCustomFieldStatus = async(
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







export const getAllCustomFields = async()=>{


    return prisma.productCustomField.findMany({

        include:{

            productSubcategory:{

                select:{
                    id:true,
                    name:true
                }

            }

        },

        orderBy:{
            createdAt:"desc"
        }

    });


};






export const getCustomFieldById = async(
    id:string
)=>{


    const field =
        await prisma.productCustomField.findUnique({

            where:{
                id
            },

            include:{
                productSubcategory:true
            }

        });



    if(!field){

        throw new NotFoundError(
            "Custom field not found"
        );

    }



    return field;


};