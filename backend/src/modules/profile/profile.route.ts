import {
    Router
}
from "express";

import {
    authenticateToken
}
from "../../middleware/auth.middleware";

import * as Profile
from "./profile.controller";

const router =
Router();

router.use(
    authenticateToken
);

router.get(

    "/me",

    Profile.me

);

export const
ProfileRouter =
router;