import {
    Request,
    Response
}
from "express";

import * as ProfileService
from "./profile.service";

export const me =
async(

    req:Request,
    res:Response

)=>{

    const user =
    (req as any).user;

    const result =
    await ProfileService
    .getMyProfile(
        user.userId
    );

    res.json({

        data:result

    });

};