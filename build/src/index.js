"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const env_1 = require("./config/env");
void (0, database_1.default)(env_1.MONGODB_URI);
app_1.default.listen(env_1.PORT);
