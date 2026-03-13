"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN = exports.PASSWORD = exports.SECRET = exports.API_SECRET = exports.API_KEY = exports.CLOUDINARY_NAME = exports.PORT = exports.MONGODB_URI = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.MONGODB_URI = (_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "";
exports.PORT = process.env.PORT || 3001;
exports.CLOUDINARY_NAME = (_b = process.env.CLOUDINARY_NAME) !== null && _b !== void 0 ? _b : "";
exports.API_KEY = (_c = process.env.API_KEY) !== null && _c !== void 0 ? _c : "";
exports.API_SECRET = (_d = process.env.API_SECRET) !== null && _d !== void 0 ? _d : "";
exports.SECRET = (_e = process.env.JWT_SECRET) !== null && _e !== void 0 ? _e : "";
exports.PASSWORD = (_f = process.env.PASSWORD) !== null && _f !== void 0 ? _f : "";
exports.ADMIN = (_g = process.env.ADMIN) !== null && _g !== void 0 ? _g : "";
