import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/env";
import propertiesService from "../services/propertiesService";
import authService from "../services/authService";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  if (username === "uncle" && password === "secret") {
    const userForToken = {
      username: username,
    };
    const token = jwt.sign(userForToken, SECRET, { expiresIn: "7d" });

    return res.status(200).json({ token, username: username });
  }
  return res.status(401).json({
    error: "invalid username or password",
  });
});

authRouter.get("/properties", async (req, res, next) => {
  const token = authService.getTokenFrom(req);

  if (!token) {
    res.status(401).json({ error: `${token}` });
    return;
  }

  try {
    jwt.verify(token, SECRET);
    const result = await propertiesService.getProperties();
    res.json(result);
    return;
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
});
export default authRouter;
