"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugRouter = void 0;
const express_1 = require("express");
const debug_controller_1 = require("./debug.controller");
const router = (0, express_1.Router)();
// Development-only: fetch feedback for a staff id without auth to aid debugging
router.get("/feedback-by-staff/:staffId", debug_controller_1.getFeedbackByStaffId);
exports.DebugRouter = router;
