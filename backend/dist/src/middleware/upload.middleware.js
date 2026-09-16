"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILES_PER_CASE = exports.MAX_FILE_SIZE_BYTES = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
exports.MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_BYTES;
const MAX_FILES_PER_CASE = 5;
exports.MAX_FILES_PER_CASE = MAX_FILES_PER_CASE;
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: MAX_FILES_PER_CASE,
    },
});
