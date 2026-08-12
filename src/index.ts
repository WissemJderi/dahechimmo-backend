import app from "./app";
import connectToDatabase from "./config/database";
import { MONGODB_URI, PORT } from "./config/env";
import mongoose from "mongoose";

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

void connectToDatabase(MONGODB_URI);

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} received, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(() => {
    void mongoose.connection.close().then(() => {
      console.log("MongoDB connection closed. Goodbye.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);