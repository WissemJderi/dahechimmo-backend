import express from "express";
import propertiesRouter from "./routes/propertiesRouter";
import connectToDatabase from "./config/database";
import cors from "cors";
import { MONGODB_URI, PORT } from "./config/env";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (_req, res) => {
  console.log("someone pinged here");
  res.send("pong");
});

app.use("/api/properties", propertiesRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  },
);

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

connectToDatabase(MONGODB_URI);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
