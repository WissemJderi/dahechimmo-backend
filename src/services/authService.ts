import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/env";

const getTokenFrom = (request: Request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFrom(req);
  if (!token) {
    res.status(401).json({ error: "token missing" });
    return;
  }

  try {
    jwt.verify(token, SECRET);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "invalid token" });
      return;
    }
    next(error);
  }
};

export default { getTokenFrom, authenticate };