import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config/env";

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

export default authRouter;
