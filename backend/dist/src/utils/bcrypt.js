"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptUtils = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.BcryptUtils = {
    hash: async (password) => {
        return bcrypt_1.default.hash(password, 12);
    },
    compare: async (password, hash) => {
        return bcrypt_1.default.compare(password, hash);
    },
};
