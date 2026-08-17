"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
const error_1 = require("../utils/error");
const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        try {
            console.log("USER =", req.user);
            console.log("REQUIRED =", requiredPermissions);
            if (!req.user) {
                throw new error_1.UnauthorizedError("Authentication token context unavailable.");
            }
            if (req.user.partyType === "STAFF" && req.user.isSAdmin) {
                return next();
            }
            const userPermissions = req.user.permissions || [];
            console.log("USER PERMISSIONS =", userPermissions);
            const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));
            console.log("HAS PERMISSION =", hasPermission);
            if (!hasPermission) {
                throw new error_1.ForbiddenError("Access Denied: Missing required permission clearance.");
            }
            return next();
        }
        catch (error) {
            return next(error);
        }
    };
};
exports.requirePermission = requirePermission;
