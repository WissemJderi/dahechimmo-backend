import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import propertiesRouter from "./routes/propertiesRouter";
import authRouter from "./routes/authRouter";
import { errorHandler } from "./middleware/errorHandler";
import swaggerSpec from "./openapi.json";

const allowedOrigins = [
  "https://dahechimmo.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const app = express();

app.set("trust proxy", true);
app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/properties", propertiesRouter);
app.use("/api/auth", authRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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