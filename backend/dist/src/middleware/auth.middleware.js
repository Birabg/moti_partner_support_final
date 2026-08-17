"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const error_1 = require("../utils/error");
const authenticateToken = (req, res, next) => {
    try {
        // Prefer Authorization header, but allow EventSource and other clients to pass the access token via query string as a fallback.
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        else if (req.query && typeof req.query.access_token === "string") {
            token = req.query.access_token;
        }
        if (!token) {
            throw new error_1.UnauthorizedError("Access denied. Secure authorization token missing.");
        }
        const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: error.message });
        return;
    }
};
exports.authenticateToken = authenticateToken;
