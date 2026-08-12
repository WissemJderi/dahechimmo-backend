import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
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

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests" });
  },
});

authRouter.post("/login", loginLimiter, async (req, res) => {
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

authRouter.get("/properties", authService.authenticate, async (_req, res, next) => {
  try {
    const result = await propertiesService.getAllProperties();
    res.json(result);
  } catch (error) {
    next(error);
  }
});
export default authRouter;
