import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import propertiesRouter from "./routes/propertiesRouter";
import authRouter from "./routes/authRouter";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/properties", propertiesRouter);
app.use("/api/auth", authRouter);
app.get("/ping", (_req, res) => {
  res.send("pong");
});
app.get("/health", (_req, res) => {
  const dbConnected = (mongoose.connection.readyState as number) === 1;
  res
    .status(dbConnected ? 200 : 503)
    .json({ status: dbConnected ? "ok" : "unavailable" });
});
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});
app.use(errorHandler);

export default app;