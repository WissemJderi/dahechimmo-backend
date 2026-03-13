"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const propertiesService_1 = __importDefault(require("../services/propertiesService"));
const authService_1 = __importDefault(require("../services/authService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authRouter = (0, express_1.Router)();
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" });
    }
    if (username === env_1.ADMIN && (yield bcrypt_1.default.compare(password, env_1.PASSWORD))) {
        const userForToken = {
            username: username,
        };
        const token = jsonwebtoken_1.default.sign(userForToken, env_1.SECRET, { expiresIn: "7d" });
        return res.status(200).json({ token, username: username });
    }
    return res.status(401).json({
        error: "invalid username or password",
    });
}));
authRouter.get("/properties", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = authService_1.default.getTokenFrom(req);
    if (!token) {
        res.status(401).json({ error: "token missing or invalid" });
        return;
    }
    try {
        jsonwebtoken_1.default.verify(token, env_1.SECRET);
        const result = yield propertiesService_1.default.getProperties();
        res.json(result);
        return;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "invalid token" });
            return;
        }
        next(error);
    }
}));
exports.default = authRouter;
