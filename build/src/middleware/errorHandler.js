"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const isHttpError = (err) => typeof err === "object" && err !== null;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof multer_1.default.MulterError) {
        const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        res.status(status).json({ error: err.message });
        return;
    }
    console.error(err instanceof Error ? err.stack : err);
    const status = isHttpError(err) && typeof err.status === "number" ? err.status : 500;
    const message = isHttpError(err) && typeof err.message === "string"
        ? err.message
        : "Internal Server Error";
    res.status(status).json({ message });
};
exports.errorHandler = errorHandler;
