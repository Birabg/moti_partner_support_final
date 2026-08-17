"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
exports.JwtUtils = {
    generateAccessToken: (payload) => {
        return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_ACCESS_SECRET, {
            expiresIn: "15m",
        });
    },
    generateRefreshToken: (userId, partyType) => {
        const payload = { userId, partyType };
        return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });
    },
    verifyAccessToken: (token) => {
        try {
            return jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_ACCESS_SECRET);
        }
        catch (error) {
            throw new Error("Invalid or expired access token");
        }
    },
    verifyRefreshToken: (token) => {
        try {
            return jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw new Error("Invalid or expired refresh token");
        }
    },
};
