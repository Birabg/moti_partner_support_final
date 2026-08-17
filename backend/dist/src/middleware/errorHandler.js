"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const error_1 = require("../utils/error");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        res.status(422).json({
            message: "Validation failed",
            errors: err.flatten().fieldErrors,
        });
        return;
    }
    if (err instanceof error_1.AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
};
exports.errorHandler = errorHandler;
