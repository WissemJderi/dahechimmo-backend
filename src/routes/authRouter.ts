import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET, PASSWORD, ADMIN } from "../config/env";
import propertiesService from "../services/propertiesService";
import authService from "../services/authService";
import bcrypt from "bcrypt";
import z from "zod";

const authRouter = Router();

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "username and password required" });
  }

  const { username, password } = parsed.data;

  if (username === ADMIN && (await bcrypt.compare(password, PASSWORD))) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: "7d" });

    return res.status(200).json({ token, username });
  }
  return res.status(401).json({
    error: "invalid username or password",
  });
});

authRouter.get("/properties", async (req, res, next) => {
  const token = authService.getTokenFrom(req);

  if (!token) {
    res.status(401).json({ error: "token missing or invalid" });
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
