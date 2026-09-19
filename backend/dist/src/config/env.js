"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const envCandidates = [
    path_1.default.resolve(process.cwd(), ".env"),
    path_1.default.resolve(__dirname, "../../.env"),
    path_1.default.resolve(__dirname, "../../../.env"),
];
const envPath = envCandidates.find((p) => fs_1.default.existsSync(p));
if (envPath) {
    dotenv_1.default.config({ path: envPath });
}
exports.ENV = {
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "fallback_access_secret",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SHARED_SUPPORT_INBOX: process.env.SHARED_SUPPORT_INBOX
};
if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is not defined in environment variables!");
}
