import express from "express";
import propertiesRouter from "./routes/propertiesRouter";
import connectToDatabase from "./config/database";
import cors from "cors";
import { MONGODB_URI, PORT } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import authRouter from "./routes/authRouter";
const app = express();

app.use(cors());

app.use("/api/properties", propertiesRouter);

app.use(express.json());

app.get("/ping", (_req, res) => {
  res.send("pong");
});

app.use("/api/auth", authRouter);

app.use(errorHandler);

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

connectToDatabase(MONGODB_URI);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
