"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN = exports.PASSWORD = exports.SECRET = exports.API_SECRET = exports.API_KEY = exports.CLOUDINARY_NAME = exports.PORT = exports.MONGODB_URI = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    MONGODB_URI: zod_1.z.string().min(1, "is required"),
    CLOUDINARY_NAME: zod_1.z.string().min(1, "is required"),
    API_KEY: zod_1.z.string().min(1, "is required"),
    API_SECRET: zod_1.z.string().min(1, "is required"),
    JWT_SECRET: zod_1.z.string().min(1, "is required"),
    ADMIN: zod_1.z.string().min(1, "is required"),
    PASSWORD: zod_1.z.string().min(1, "is required"),
    PORT: zod_1.z.coerce.number().int().positive().default(3001),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
    const issues = Object.entries(result.error.flatten().fieldErrors)
        .map(([key, errors]) => `  ${key}: ${(errors !== null && errors !== void 0 ? errors : []).join(", ")}`)
        .join("\n");
    console.error(`Invalid or missing environment variables:\n${issues}`);
    process.exit(1);
}
exports.MONGODB_URI = result.data.MONGODB_URI;
exports.PORT = result.data.PORT;
exports.CLOUDINARY_NAME = result.data.CLOUDINARY_NAME;
exports.API_KEY = result.data.API_KEY;
exports.API_SECRET = result.data.API_SECRET;
exports.SECRET = result.data.JWT_SECRET;
exports.PASSWORD = result.data.PASSWORD;
exports.ADMIN = result.data.ADMIN;
