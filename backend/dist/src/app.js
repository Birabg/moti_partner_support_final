"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const route_index_1 = require("./route/route.index");
const profile_route_1 = require("./modules/profile/profile.route");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/profile", profile_route_1.ProfileRouter);
app.use("/api", route_index_1.ApiRouter);
app.use((err, req, res, next) => {
    console.error(" Application Error Root:", err);
    res.status(err.status || 500).json({
        error: err.message ||
            "An unexpected operational failure occurred. Please try again.",
    });
});
exports.default = app;
