import { Router } from "express";
import { getFeedbackByStaffId } from "./debug.controller";

const router = Router();

// Development-only: fetch feedback for a staff id without auth to aid debugging
router.get("/feedback-by-staff/:staffId", getFeedbackByStaffId);

export const DebugRouter = router;
