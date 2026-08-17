import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router()

router.use(authenticateToken)

router.get("/")