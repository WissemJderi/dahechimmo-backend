"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const propertiesRouter_1 = __importDefault(require("./routes/propertiesRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
app.use("/api/properties", propertiesRouter_1.default);
app.use("/api/auth", authRouter_1.default);
app.get("/ping", (_req, res) => {
    res.send("pong");
});
app.get("/health", (_req, res) => {
    const dbConnected = mongoose_1.default.connection.readyState === 1;
    res
        .status(dbConnected ? 200 : 503)
        .json({ status: dbConnected ? "ok" : "unavailable" });
});
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
