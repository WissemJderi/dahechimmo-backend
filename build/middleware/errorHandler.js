"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const isHttpError = (err) => typeof err === "object" && err !== null;
const errorHandler = (err, _req, res, _next) => {
    console.error(err instanceof Error ? err.stack : err);
    const status = isHttpError(err) && typeof err.status === "number" ? err.status : 500;
    const message = isHttpError(err) && typeof err.message === "string"
        ? err.message
        : "Internal Server Error";
    res.status(status).json({ message });
};
exports.errorHandler = errorHandler;
