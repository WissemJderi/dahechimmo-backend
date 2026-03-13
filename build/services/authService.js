"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getTokenFrom = (request) => {
    const authorization = request.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        return authorization.replace("Bearer ", "");
    }
    return null;
};
exports.default = { getTokenFrom };
