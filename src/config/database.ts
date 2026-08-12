import mongoose from "mongoose";

const connectToDatabase = async (uri: string) => {
  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB connection lost");
  });
  mongoose.connection.on("error", (error: unknown) => {
    console.error(
      "MongoDB connection error:",
      error instanceof Error ? error.message : error,
    );
  });

  try {
    await mongoose.connect(uri);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("error connection to MongoDB:", error.message);
      process.exit(1);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

export default connectToDatabase;