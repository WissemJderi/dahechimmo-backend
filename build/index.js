"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertiesRouter_1 = __importDefault(require("./routes/propertiesRouter"));
const database_1 = __importDefault(require("./config/database"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use("/api/properties", propertiesRouter_1.default);
app.use(express_1.default.json());
app.get("/ping", (_req, res) => {
    res.send("pong");
});
app.use("/api/auth", authRouter_1.default);
app.use(errorHandler_1.errorHandler);
if (!env_1.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}
(0, database_1.default)(env_1.MONGODB_URI);
app.listen(env_1.PORT, () => {
    console.log(`Server running on port ${env_1.PORT}`);
});
